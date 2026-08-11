import SessionModel from '../models/SessionModel.js';
import { signAccessToken, signRefreshToken } from '../config/jwt.js';
import config from '../config/env.js';
import { generateOtp, hashToken, TIME_MS } from '../utils/token.js';
import { sendMail } from '../utils/mailer.js';
import APIError from '../utils/AppError.js';

const OTP_EXPIRY_MS = 10 * TIME_MS.minute;

const parseDurationToMs = (duration) => {
  const match = String(duration || '').match(/^(\d+)([smhd])$/);
  if (!match) return 30 * TIME_MS.day;
  const [, num, unit] = match;
  const multipliers = { s: 1000, m: TIME_MS.minute, h: TIME_MS.hour, d: TIME_MS.day };
  return Number(num) * multipliers[unit];
};

const createRefreshSession = async (user, req) => {
  let refreshToken;
  try {
    refreshToken = signRefreshToken({ id: user._id, type: 'refresh' });
  } catch {
    throw new APIError(500, 'Failed to generate session token.');
  }

  const ua = req.headers['user-agent'] || '';
  const sessionDoc = await SessionModel.create({
    user: user._id,
    refreshToken: hashToken(refreshToken),
    device: parseDevice(ua),
    ip: req.ip,
    userAgent: ua,
    expiresAt: new Date(Date.now() + parseDurationToMs(config.refresh.expiresIn)),
  });

  return { refreshToken, sessionId: sessionDoc._id };
};

const parseDevice = (ua) => {
  const osRegex = /(Windows NT [\d.]+|Mac OS X [\d_]+|Android [\d.]+|iPhone OS [\d_]+|Linux)/;
  const browserRegex = /(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/;
  return {
    os: (ua.match(osRegex) || [])[0] || 'Unknown OS',
    browser: ua.match(browserRegex)?.[0] || 'Unknown Browser',
    name: 'device',
  };
};

const createOtp = async (user, purpose) => {
  const code = generateOtp(6);
  user.otp = { code, purpose, expiresAt: new Date(Date.now() + OTP_EXPIRY_MS) };
  await user.save();
  return code;
};

const verifyOtp = (user, enteredOtp, purpose) => {
  if (!user.otp || user.otp.purpose !== purpose || !user.otp.expiresAt) {
    throw new APIError(400, 'No valid OTP found. Request a new one.');
  }
  if (Date.now() > new Date(user.otp.expiresAt).getTime()) {
    throw new APIError(400, 'OTP has expired. Request a new one.');
  }
  if (user.otp.code !== enteredOtp) {
    throw new APIError(400, 'Invalid OTP code.');
  }
  user.otp = undefined;
};

const issueTokens = async (user, req) => {
  const accessToken = signAccessToken({ id: user._id, role: user.role });
  const { refreshToken, sessionId } = await createRefreshSession(user, req);
  return { accessToken, refreshToken, sessionId };
};

const buildTokenPair = (user, accessToken, refreshToken, sessionId) => ({
  accessToken,
  refreshToken,
  expiresIn: process.env.JWT_EXPIRES_IN,
  tokenType: 'Bearer',
  sessionId: String(sessionId),
});

const sendOtpEmail = async (email, otp, purpose) => {
  const subjectByPurpose = {
    verify_email: 'Verify your email',
    reset_password: 'Reset your password',
    login: 'Your login OTP',
  };

  if (!config.smtp.user || !config.smtp.pass) {
    console.log(`[otp] (DEV) verification code for ${email}: ${otp}`);
  }

  await sendMail({
    to: email,
    subject: subjectByPurpose[purpose] || 'Your OTP code',
    html: `<p>Your verification code is: <strong>${otp}</strong></p>
           <p>This code expires in 10 minutes.</p>`,
  });
};

const clearOtp = async (user) => {
  user.otp = undefined;
  await user.save();
};

export {
  createOtp,
  verifyOtp,
  issueTokens,
  buildTokenPair,
  sendOtpEmail,
  clearOtp,
  OTP_EXPIRY_MS,
};