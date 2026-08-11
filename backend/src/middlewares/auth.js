import User from '../models/User.js';
import { verifyAccessToken } from '../config/jwt.js';
import APIError from '../utils/AppError.js';

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new APIError(401, 'No token provided. Please log in.');
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      throw new APIError(401, 'User no longer exists or is deactivated.');
    }
    if (user.isBanned) {
      throw new APIError(403, 'Your account has been banned. Contact support.');
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (err) {
    next(err);
  }
};

const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return next(new APIError(401, 'Not authenticated.'));
    }
    if (!roles.includes(req.user.role)) {
      return next(new APIError(403, 'You do not have permission to perform this action.'));
    }
    next();
  };

export { protect, authorize };