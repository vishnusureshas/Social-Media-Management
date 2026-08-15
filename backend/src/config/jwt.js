import jwt from 'jsonwebtoken';
import config from './env.js';

const signAccessToken = (payload) =>
  jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

const signRefreshToken = (payload) =>
  jwt.sign(payload, config.refresh.secret, { expiresIn: config.refresh.expiresIn });

const sign2FAChallenge = (payload) =>
  jwt.sign(payload, config.jwt.secret, { expiresIn: '10m' });

const verifyAccessToken = (token) => jwt.verify(token, config.jwt.secret);
const verifyRefreshToken = (token) => jwt.verify(token, config.refresh.secret);
const verify2FAChallenge = (token) => jwt.verify(token, config.jwt.secret);

export { signAccessToken, signRefreshToken, sign2FAChallenge, verifyAccessToken, verifyRefreshToken, verify2FAChallenge };