import jwt from 'jsonwebtoken';
import config from './env.js';

const signAccessToken = (payload) =>
  jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

const signRefreshToken = (payload) =>
  jwt.sign(payload, config.refresh.secret, { expiresIn: config.refresh.expiresIn });

const verifyAccessToken = (token) => jwt.verify(token, config.jwt.secret);
const verifyRefreshToken = (token) => jwt.verify(token, config.refresh.secret);

export { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken };