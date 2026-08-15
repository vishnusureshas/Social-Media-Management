import crypto from 'crypto';
import User from '../models/User.js';
import SessionModel from '../models/SessionModel.js';
import SecurityLog from '../models/SecurityLogModel.js';
import { sendSuccess } from '../utils/response.js';
import APIError from '../utils/AppError.js';
import {
  generateSecret,
  verifyTOTP,
  generateBackupCodes,
  buildOtpauthUrl,
} from '../utils/totp.js';
import { verify2FAChallenge } from '../config/jwt.js';
import { issueTokens, buildTokenPair } from '../services/authService.js';
import * as cache from '../services/cacheService.js';

const hashBackupCode = (code) => crypto.createHash('sha256').update(code).digest('hex');

const parseDevice = (ua) => {
  const osRegex = /(Windows NT [\d.]+|Mac OS X [\d_]+|Android [\d.]+|iPhone OS [\d_]+|Linux)/;
  const browserRegex = /(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/;
  return {
    os: (ua.match(osRegex) || [])[0] || 'Unknown OS',
    browser: ua.match(browserRegex)?.[0] || 'Unknown Browser',
  };
};

const logSecurityEvent = (userId, action, req, success = true) =>
  SecurityLog.create({
    user: userId,
    action,
    ip: req.ip,
    device: `${parseDevice(req.headers['user-agent'] || '').browser} · ${parseDevice(req.headers['user-agent'] || '').os}`,
    success,
  });

const setup2FA = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) throw new APIError(404, 'User not found.');
    if (user.twoFA?.enabled) {
      throw new APIError(400, 'Two-factor authentication is already enabled.');
    }

    const secret = generateSecret();
    user.twoFA = {
      enabled: false,
      secret,
      backupCodes: [],
    };
    await user.save();

    await logSecurityEvent(user._id, '2fa_setup', req);
    await cache.del(`user:${user._id}`);

    sendSuccess(res, 200, 'Review the QR code and verify to enable 2FA.', {
      secret,
      otpauthUrl: buildOtpauthUrl(secret, user.email || user.username),
    });
  } catch (err) {
    next(err);
  }
};

const enable2FA = async (req, res, next) => {
  try {
    const { code } = req.body;

    const user = await User.findById(req.userId);
    if (!user) throw new APIError(404, 'User not found.');
    if (user.twoFA?.enabled) throw new APIError(400, 'Two-factor authentication is already enabled.');
    if (!user.twoFA?.secret) throw new APIError(400, 'Start the 2FA setup first.');

    const valid = verifyTOTP(user.twoFA.secret, code);
    if (!valid) throw new APIError(400, 'Invalid verification code.');

    const backupCodes = generateBackupCodes();
    user.twoFA = {
      enabled: true,
      secret: user.twoFA.secret,
      backupCodes: backupCodes.map(hashBackupCode),
    };
    await user.save();

    await logSecurityEvent(user._id, '2fa_enabled', req);
    await cache.del(`user:${user._id}`);

    sendSuccess(res, 200, 'Two-factor authentication enabled.', {
      twoFA: true,
      backupCodes,
    });
  } catch (err) {
    next(err);
  }
};

const disable2FA = async (req, res, next) => {
  try {
    const { code } = req.body;

    const user = await User.findById(req.userId);
    if (!user) throw new APIError(404, 'User not found.');
    if (!user.twoFA?.enabled) throw new APIError(400, 'Two-factor authentication is not enabled.');

    const valid = verifyTOTP(user.twoFA.secret, code);
    if (!valid) throw new APIError(400, 'Invalid verification code.');

    user.twoFA = undefined;
    await user.save();

    await logSecurityEvent(user._id, '2fa_disabled', req);
    await cache.del(`user:${user._id}`);

    sendSuccess(res, 200, 'Two-factor authentication disabled.', { twoFA: false });
  } catch (err) {
    next(err);
  }
};

const login2FA = async (req, res, next) => {
  try {
    const { challenge, code } = req.body;

    let payload;
    try {
      payload = verify2FAChallenge(challenge);
    } catch {
      throw new APIError(401, 'Login challenge expired. Sign in again.');
    }
    if (payload.type !== '2fa' || !payload.id) {
      throw new APIError(401, 'Invalid login challenge.');
    }

    const user = await User.findById(payload.id).select('+password');
    if (!user) throw new APIError(401, 'User not found.');
    if (!user.twoFA?.enabled) throw new APIError(400, '2FA is not enabled for this account.');
    if (!user.isActive) throw new APIError(403, 'Account is deactivated.');
    if (user.isBanned) throw new APIError(403, 'Your account has been banned. Contact support.');

    const cleaned = String(code || '').replace(/\s+/g, '');
    const validTotp = verifyTOTP(user.twoFA.secret, cleaned);

    let validBackup = false;
    if (!validTotp) {
      const hash = hashBackupCode(cleaned);
      const idx = (user.twoFA.backupCodes || []).indexOf(hash);
      if (idx !== -1) {
        validBackup = true;
        user.twoFA.backupCodes.splice(idx, 1);
        await user.save();
      }
    }

    if (!validTotp && !validBackup) {
      await logSecurityEvent(user._id, '2fa_login', req, false);
      throw new APIError(401, 'Invalid two-factor code.');
    }

    await logSecurityEvent(user._id, '2fa_login', req);
    await cache.del(`user:${user._id}`);

    user.lastSeen = new Date();
    await user.save();

    const tokens = await issueTokens(user, req);
    sendSuccess(res, 200, 'Login successful.', {
      ...buildTokenPair(user, tokens.accessToken, tokens.refreshToken, tokens.sessionId),
      user: user.toProfileJSON(true),
    });
  } catch (err) {
    next(err);
  }
};

const getSessions = async (req, res, next) => {
  try {
    const sessions = await SessionModel.find({ user: req.userId, revoked: false })
      .select('_id device ip userAgent createdAt expiresAt')
      .sort({ createdAt: -1 });

    sendSuccess(res, 200, 'Active sessions retrieved.', { sessions });
  } catch (err) {
    next(err);
  }
};

const revokeSession = async (req, res, next) => {
  try {
    const { id } = req.params;

    const session = await SessionModel.findOneAndUpdate(
      { _id: id, user: req.userId, revoked: false },
      { $set: { revoked: true } },
      { new: true }
    );
    if (!session) throw new APIError(404, 'Session not found.');

    await logSecurityEvent(req.userId, 'session_revoked', req);

    sendSuccess(res, 200, 'Session revoked.', { revoked: true });
  } catch (err) {
    next(err);
  }
};

const getSecurityLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      SecurityLog.find({ user: req.userId })
        .select('action ip device success createdAt')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      SecurityLog.countDocuments({ user: req.userId }),
    ]);

    sendSuccess(
      res,
      200,
      'Security activity retrieved.',
      { logs },
      { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    );
  } catch (err) {
    next(err);
  }
};

export { setup2FA, enable2FA, disable2FA, login2FA, getSessions, revokeSession, getSecurityLogs };