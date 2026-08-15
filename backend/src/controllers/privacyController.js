import User from '../models/User.js';
import Follow from '../models/FollowModel.js';
import Block from '../models/BlockModel.js';
import Mute from '../models/MuteModel.js';
import Notification from '../models/Notification.js';
import { sendSuccess } from '../utils/response.js';
import APIError from '../utils/AppError.js';
import * as cache from '../services/cacheService.js';

const USER_FIELDS = 'username fullName avatar verified bio counts';

const block = async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (String(userId) === String(req.userId)) {
      throw new APIError(400, 'You cannot block yourself.');
    }

    const target = await User.findById(userId);
    if (!target) throw new APIError(404, 'User not found.');

    const existing = await Block.findOne({ blocker: req.userId, blocked: userId });
    if (existing) throw new APIError(409, 'User is already blocked.');

    await Block.create({ blocker: req.userId, blocked: userId });

    const [followRows] = await Promise.all([
      Follow.deleteMany({
        $or: [
          { follower: req.userId, following: userId },
          { follower: userId, following: req.userId },
        ],
      }),
      Mute.deleteMany({
        $or: [
          { muter: req.userId, muted: userId },
          { muter: userId, muted: req.userId },
        ],
      }),
      Notification.deleteMany({ recipient: req.userId, actor: userId }),
      Notification.deleteMany({ recipient: userId, actor: req.userId }),
    ]);

    const removedPairs = followRows.deletedCount || 0;
    if (removedPairs > 0) {
      await Promise.all([
        User.updateOne({ _id: req.userId }, { $inc: { 'counts.following': -1 } }),
        User.updateOne({ _id: userId }, { $inc: { 'counts.followers': -1 } }),
      ]);
    } else {
      const reverse = await Follow.deleteOne({ follower: userId, following: req.userId });
      if (reverse.deletedCount) {
        await Promise.all([
          User.updateOne({ _id: req.userId }, { $inc: { 'counts.followers': -1 } }),
          User.updateOne({ _id: userId }, { $inc: { 'counts.following': -1 } }),
        ]);
      }
    }

    await Promise.all([
      cache.del(`user:${req.userId}`),
      cache.del(`user:${userId}`),
      cache.delByPattern(`profile:*`),
      cache.delByPattern(`suggestions:${req.userId}`),
    ]);

    sendSuccess(res, 201, `@${target.username} has been blocked.`, {
      blocked: { _id: target._id, username: target.username },
    });
  } catch (err) {
    next(err);
  }
};

const unblock = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const existing = await Block.findOneAndDelete({ blocker: req.userId, blocked: userId });
    if (!existing) throw new APIError(409, 'User is not blocked.');

    await Promise.all([
      cache.del(`user:${req.userId}`),
      cache.delByPattern(`profile:*`),
      cache.delByPattern(`suggestions:${req.userId}`),
    ]);

    sendSuccess(res, 200, 'User has been unblocked.', { unblocked: true });
  } catch (err) {
    next(err);
  }
};

const getBlocked = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const docs = await Block.find({ blocker: req.userId })
      .populate('blocked', USER_FIELDS)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Block.countDocuments({ blocker: req.userId });

    sendSuccess(
      res,
      200,
      'Blocked users retrieved.',
      { users: docs.map((d) => d.blocked) },
      { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    );
  } catch (err) {
    next(err);
  }
};

const mute = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const scope = req.body.scope || 'all';

    if (String(userId) === String(req.userId)) {
      throw new APIError(400, 'You cannot mute yourself.');
    }

    const target = await User.findById(userId);
    if (!target) throw new APIError(404, 'User not found.');

    const blocked = await Block.exists({ blocker: req.userId, blocked: userId });
    if (blocked) throw new APIError(400, 'You cannot mute a blocked user.');

    const existing = await Mute.findOneAndUpdate(
      { muter: req.userId, muted: userId },
      { $set: { scope } },
      { new: true, upsert: true }
    );

    sendSuccess(res, 201, `@${target.username} is muted (${scope}).`, {
      muted: { _id: target._id, username: target.username, scope: existing.scope },
    });
  } catch (err) {
    next(err);
  }
};

const unmute = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const existing = await Mute.findOneAndDelete({ muter: req.userId, muted: userId });
    if (!existing) throw new APIError(409, 'User is not muted.');

    sendSuccess(res, 200, 'User has been unmuted.', { unmuted: true });
  } catch (err) {
    next(err);
  }
};

const getMuted = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const docs = await Mute.find({ muter: req.userId })
      .populate('muted', USER_FIELDS)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Mute.countDocuments({ muter: req.userId });

    sendSuccess(
      res,
      200,
      'Muted users retrieved.',
      { users: docs.map((d) => ({ user: d.muted, scope: d.scope })) },
      { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    );
  } catch (err) {
    next(err);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const { postsVisibleTo, messages } = req.body;

    const user = await User.findById(req.userId);
    if (!user) throw new APIError(404, 'User not found.');

    if (postsVisibleTo) user.privacy.postsVisibleTo = postsVisibleTo;
    if (messages) user.privacy.messages = messages;
    await user.save();

    await Promise.all([
      cache.del(`user:${req.userId}`),
      cache.delByPattern(`profile:${user.username}:*`),
    ]);

    sendSuccess(res, 200, 'Privacy settings updated.', {
      privacy: user.privacy,
    });
  } catch (err) {
    next(err);
  }
};

export { block, unblock, getBlocked, mute, unmute, getMuted, updateSettings };