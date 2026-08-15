import User from '../models/User.js';
import { verifyAccessToken } from '../config/jwt.js';

const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required.'));

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch {
      return next(new Error('Invalid or expired token.'));
    }

    const user = await User.findById(decoded.id).select('isActive isBanned');
    if (!user || !user.isActive) return next(new Error('User no longer exists or is deactivated.'));
    if (user.isBanned) return next(new Error('Your account has been banned.'));

    socket.userId = user._id;
    next();
  } catch (err) {
    next(err);
  }
};

export default socketAuth;