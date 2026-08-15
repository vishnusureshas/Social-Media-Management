import User from '../models/User.js';
import SessionModel from '../models/SessionModel.js';
import { sendSuccess } from '../utils/response.js';
import APIError from '../utils/AppError.js';
import { verifyRefreshToken, sign2FAChallenge } from '../config/jwt.js';
import SecurityLog from '../models/SecurityLogModel.js';
import { hashToken } from '../utils/token.js';
import config from '../config/env.js';
import * as cache from '../services/cacheService.js';
import {
  createOtp,
  verifyOtp,
  issueTokens,
  buildTokenPair,
  sendOtpEmail,
  OTP_EXPIRY_MS,
} from '../services/authService.js';

const devOtpPayload = (otp) =>
  config.env === 'development' ? { devOtp: otp } : {};

const userCacheKey = (userId) => `user:${userId}`;

const logSecurityEvent = (userId, action, req, success = true) => {
  const ua = req.headers['user-agent'] || '';
  const osRegex = /(Windows NT [\d.]+|Mac OS X [\d_]+|Android [\d.]+|iPhone OS [\d_]+|Linux)/;
  const browserRegex = /(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/;
  const device = `${browserRegex.exec(ua)?.[0] || 'Unknown Browser'} · ${osRegex.exec(ua)?.[0] || 'Unknown OS'}`;
  return SecurityLog.create({ user: userId, action, ip: req.ip, device, success });
};

const register = async (req, res, next) => {
  try {
    const { username, email, password, fullName } = req.body;

    const existing = await User.findOne({ $or: [{ username }, { email: email.toLowerCase() }] });
    if (existing) {
      const clash = existing.email === email.toLowerCase() ? 'Email' : 'Username';
      throw new APIError(409, `${clash} already registered.`);
    }

    const user = await User.create({ username, email, password, fullName });

    const otp = await createOtp(user, 'verify_email');
    await sendOtpEmail(user.email, otp, 'verify_email');

    sendSuccess(res, 201, 'Registration successful. OTP sent to your email.', {
      user: user.toProfileJSON(true),
      otpExpiresInMinutes: Math.round(OTP_EXPIRY_MS / 60000),
      ...devOtpPayload(otp),
    });
  } catch (err) {
    next(err);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw new APIError(404, 'User not found.');
    if (user.emailVerified) throw new APIError(400, 'Email is already verified.');

    verifyOtp(user, otp, 'verify_email');
    user.emailVerified = true;
    user.otp = undefined;
    await user.save();

    await cache.del(userCacheKey(user._id));

    sendSuccess(res, 200, 'Email verified successfully. You can now log in.', {
      user: user.toProfileJSON(),
    });
  } catch (err) {
    next(err);
  }
};

const resendOtp = async (req, res, next) => {
  try {
    const { email, purpose } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw new APIError(404, 'User not found.');

    const otp = await createOtp(user, purpose);
    await sendOtpEmail(user.email, otp, purpose);

    sendSuccess(res, 200, 'OTP resent. Check your email.', {
      otpExpiresInMinutes: Math.round(OTP_EXPIRY_MS / 60000),
      ...devOtpPayload(otp),
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) throw new APIError(401, 'Invalid email or password.');

    const passwordMatches = await user.comparePassword(password);
    if (!passwordMatches) {
      if (user) await logSecurityEvent(user._id, 'login_failed', req, false);
      throw new APIError(401, 'Invalid email or password.');
    }
    if (user.isBanned) throw new APIError(403, 'Your account has been banned. Contact support.');
    if (!user.isActive) throw new APIError(403, 'Account is deactivated.');

    if (user.twoFA?.enabled) {
      const challenge = sign2FAChallenge({ id: user._id, type: '2fa' });
      sendSuccess(res, 200, 'Two-factor code required.', {
        requiresTwoFactor: true,
        challenge,
        twoFA: true,
      });
      return;
    }

    await logSecurityEvent(user._id, 'login', req);
    const tokens = await issueTokens(user, req);
    sendSuccess(res, 200, 'Login successful.', {
      ...buildTokenPair(user, tokens.accessToken, tokens.refreshToken, tokens.sessionId),
      user: user.toProfileJSON(true),
    });
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new APIError(401, 'Invalid or expired refresh token.');
    }

    const session = await SessionModel.findOneAndDelete({
      user: payload.id,
      refreshToken: hashToken(refreshToken),
      revoked: false,
    });
    if (!session) throw new APIError(401, 'Refresh token has been revoked or is invalid.');

    const user = await User.findById(payload.id).select('+password');
    if (!user || !user.isActive || user.isBanned) {
      throw new APIError(401, 'User not authorized.');
    }

    const tokens = await issueTokens(user, req);
    sendSuccess(res, 200, 'Token refreshed.', {
      ...buildTokenPair(user, tokens.accessToken, tokens.refreshToken, tokens.sessionId),
    });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      const hashed = hashToken(refreshToken);
      await SessionModel.findOneAndUpdate(
        { user: req.userId, refreshToken: hashed },
        { revoked: true }
      );
    }

    await logSecurityEvent(req.userId, 'logout', req);

    sendSuccess(res, 200, 'Logged out successfully.');
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (user) {
      const otp = await createOtp(user, 'reset_password');
      await sendOtpEmail(user.email, otp, 'reset_password');
      sendSuccess(res, 200, 'If the email exists, a password reset OTP has been sent.', {
        ...devOtpPayload(otp),
      });
      return;
    }

    sendSuccess(res, 200, 'If the email exists, a password reset OTP has been sent.');
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) throw new APIError(404, 'User not found.');

    verifyOtp(user, otp, 'reset_password');
    user.password = newPassword;
    user.otp = undefined;
    await user.save();

    await cache.del(userCacheKey(user._id));
    await SessionModel.updateMany({ user: user._id, revoked: false }, { revoked: true });

    sendSuccess(res, 200, 'Password reset successful. Please log in again.');
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.userId).select('+password');
    if (!user) throw new APIError(404, 'User not found.');

    const passwordMatches = await user.comparePassword(currentPassword);
    if (!passwordMatches) throw new APIError(401, 'Current password is incorrect.');

    user.password = newPassword;
    await user.save();

    await cache.del(userCacheKey(user._id));
    await SessionModel.updateMany({ user: user._id, revoked: false }, { revoked: true });
    await logSecurityEvent(user._id, 'password_changed', req);

    sendSuccess(res, 200, 'Password changed successfully. Please log in again.');
  } catch (err) {
    next(err);
  }
};

const me = async (req, res, next) => {
  try {
    const cacheKey = userCacheKey(req.userId);
    const cached = await cache.get(cacheKey);
    if (cached) {
      return sendSuccess(res, 200, 'Profile retrieved.', { user: cached, cache: 'hit' });
    }

    const user = await User.findById(req.userId);
    if (!user) throw new APIError(404, 'User not found.');

    const profile = user.toProfileJSON(true);
    await cache.set(cacheKey, profile, 120); // 2 min TTL

    sendSuccess(res, 200, 'Profile retrieved.', { user: profile, cache: 'miss' });
  } catch (err) {
    next(err);
  }
};

export {
  register,
  verifyEmail,
  resendOtp,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  me,
};