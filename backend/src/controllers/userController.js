import mongoose from 'mongoose';
import User from '../models/User.js';
import Follow from '../models/FollowModel.js';
import { sendSuccess } from '../utils/response.js';
import APIError from '../utils/AppError.js';
import * as cache from '../services/cacheService.js';
import { uploadToCloudinary } from '../middlewares/upload.js';

const userCacheKey = (userId) => `user:${userId}`;
const profileCacheKey = (username, viewerId) =>
  `profile:${username}:${viewerId || 'anon'}`;
const invalidateProfileCache = async (username) =>
  cache.delByPattern(`profile:${username}:*`);

const decorateWithIsFollowing = async (userDocs, viewerId) => {
  if (!viewerId || !userDocs || userDocs.length === 0) return userDocs;

  const ids = userDocs.map((u) => u._id);
  const follows = await Follow.find({ follower: viewerId, following: { $in: ids } }).select(
    'following'
  );
  const followingSet = new Set(follows.map((f) => String(f.following)));

  return userDocs.map((u) => {
    const doc = u.toObject ? u.toObject() : u;
    return {
      ...doc,
      isFollowing:
        String(viewerId) !== String(u._id) ? followingSet.has(String(u._id)) : false,
    };
  });
};

const getProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    const viewerId = req.userId || null;
    const cacheKey = profileCacheKey(username, viewerId);

    const cached = await cache.get(cacheKey);
    if (cached) {
      return sendSuccess(res, 200, 'Profile retrieved.', {
        user: cached,
        viewerId,
        cache: 'hit',
      });
    }

    const user = await User.findOne({ username });
    if (!user) throw new APIError(404, 'User not found.');

    const profile = user.toProfileJSON();

    if (viewerId && String(viewerId) !== String(user._id)) {
      const [following, follower] = await Promise.all([
        Follow.exists({ follower: viewerId, following: user._id }),
        Follow.exists({ follower: user._id, following: viewerId }),
      ]);
      profile.isFollowing = !!following;
      profile.followsYou = !!follower;
    } else if (viewerId) {
      profile.isFollowing = false;
      profile.followsYou = false;
    }

    await cache.set(cacheKey, profile, 120);

    sendSuccess(res, 200, 'Profile retrieved.', {
      user: profile,
      viewerId,
      cache: 'miss',
    });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = ['fullName', 'bio', 'gender', 'dob', 'location', 'website', 'privacy'];
    const updates = {};
    for (const field of allowedFields) {
      if (field in req.body) updates[field] = req.body[field];
    }

    if (Object.keys(updates).length === 0) {
      throw new APIError(400, 'No valid fields provided for update.');
    }

    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true,
      runValidators: true,
    });
    if (!user) throw new APIError(404, 'User not found.');

    await cache.del(userCacheKey(user._id));
    await invalidateProfileCache(user.username);

    sendSuccess(res, 200, 'Profile updated successfully.', { user: user.toProfileJSON() });
  } catch (err) {
    next(err);
  }
};

const uploadAvatar = async (req, res, next) => {
  try {
    const url = await uploadToCloudinary(req.file, 'nexus/avatars');
    const user = await User.findByIdAndUpdate(
      req.userId,
      { avatar: url },
      { new: true, runValidators: true }
    );

    await cache.del(userCacheKey(user._id));
    await invalidateProfileCache(user.username);

    sendSuccess(res, 200, 'Avatar updated successfully.', {
      user: user.toProfileJSON(),
      avatar: url,
    });
  } catch (err) {
    next(err);
  }
};

const uploadCover = async (req, res, next) => {
  try {
    const url = await uploadToCloudinary(req.file, 'nexus/covers');
    const user = await User.findByIdAndUpdate(
      req.userId,
      { coverPhoto: url },
      { new: true, runValidators: true }
    );

    await cache.del(userCacheKey(user._id));
    await invalidateProfileCache(user.username);

    sendSuccess(res, 200, 'Cover photo updated successfully.', {
      user: user.toProfileJSON(),
      coverPhoto: url,
    });
  } catch (err) {
    next(err);
  }
};

const follow = async (req, res, next) => {
  try {
    const { username } = req.params;
    const target = await User.findOne({ username });
    if (!target) throw new APIError(404, 'User not found.');

    if (String(target._id) === String(req.userId)) {
      throw new APIError(400, 'You cannot follow yourself.');
    }

    const existing = await Follow.findOne({ follower: req.userId, following: target._id });
    if (existing) {
      throw new APIError(409, 'You already follow this user.');
    }

    await Follow.create({ follower: req.userId, following: target._id });
    await Promise.all([
      User.updateOne({ _id: req.userId }, { $inc: { 'counts.following': 1 } }),
      User.updateOne({ _id: target._id }, { $inc: { 'counts.followers': 1 } }),
    ]);

    await Promise.all([
      cache.del(userCacheKey(req.userId)),
      cache.del(userCacheKey(target._id)),
      invalidateProfileCache(username),
    ]);

    sendSuccess(res, 200, `You are now following @${username}.`, {
      following: true,
      target: { _id: target._id, username: target.username },
    });
  } catch (err) {
    next(err);
  }
};

const unfollow = async (req, res, next) => {
  try {
    const { username } = req.params;
    const target = await User.findOne({ username });
    if (!target) throw new APIError(404, 'User not found.');

    const existing = await Follow.findOneAndDelete({ follower: req.userId, following: target._id });
    if (!existing) {
      throw new APIError(409, 'You do not follow this user.');
    }

    await Promise.all([
      User.updateOne(
        { _id: req.userId },
        { $inc: { 'counts.following': -1 } }
      ),
      User.updateOne({ _id: target._id }, { $inc: { 'counts.followers': -1 } }),
    ]);

    await Promise.all([
      cache.del(userCacheKey(req.userId)),
      cache.del(userCacheKey(target._id)),
      invalidateProfileCache(username),
    ]);

    sendSuccess(res, 200, `You have unfollowed @${username}.`, {
      following: false,
      target: { _id: target._id, username: target.username },
    });
  } catch (err) {
    next(err);
  }
};

const getFollowers = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findOne({ username });
    if (!user) throw new APIError(404, 'User not found.');

    const skip = (Number(page) - 1) * Number(limit);
    const docs = await Follow.find({ following: user._id })
      .populate('follower', 'username fullName avatar verified bio counts')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Follow.countDocuments({ following: user._id });
    const followers = await decorateWithIsFollowing(
      docs.map((d) => d.follower),
      req.userId
    );

    sendSuccess(
      res,
      200,
      'Followers retrieved.',
      { followers },
      { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    );
  } catch (err) {
    next(err);
  }
};

const getFollowing = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const user = await User.findOne({ username });
    if (!user) throw new APIError(404, 'User not found.');

    const skip = (Number(page) - 1) * Number(limit);
    const docs = await Follow.find({ follower: user._id })
      .populate('following', 'username fullName avatar verified bio counts')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Follow.countDocuments({ follower: user._id });
    const following = await decorateWithIsFollowing(
      docs.map((d) => d.following),
      req.userId
    );

    sendSuccess(
      res,
      200,
      'Following retrieved.',
      { following },
      { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    );
  } catch (err) {
    next(err);
  }
};

const searchUsers = async (req, res, next) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const query = {
      $and: [
        { isActive: true, isBanned: { $ne: true } },
        { $or: [{ username: regex }, { fullName: regex }] },
      ],
    };

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(query).select('username fullName avatar verified counts bio').skip(skip).limit(Number(limit)),
      User.countDocuments(query),
    ]);

    const decorated = await decorateWithIsFollowing(users, req.userId);

    sendSuccess(
      res,
      200,
      'Search results retrieved.',
      { users: decorated },
      { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    );
  } catch (err) {
    next(err);
  }
};

const getSuggestions = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 10, 20);

    const followed = await Follow.find({ follower: req.userId }).distinct('following');

    const pipeline = [
      {
        $match: {
          _id: { $nin: [new mongoose.Types.ObjectId(req.userId), ...followed.map((id) => new mongoose.Types.ObjectId(id))] },
          isActive: true,
          isBanned: { $ne: true },
        },
      },
      { $sort: { 'counts.followers': -1, createdAt: -1 } },
      { $limit: limit },
      { $project: { username: 1, fullName: 1, avatar: 1, verified: 1, bio: 1, counts: 1 } },
    ];

    const suggestions = await User.aggregate(pipeline);

    const decorated = await decorateWithIsFollowing(suggestions, req.userId);

    sendSuccess(res, 200, 'Suggestions retrieved.', { suggestions: decorated });
  } catch (err) {
    next(err);
  }
};

export {
  getProfile,
  updateProfile,
  uploadAvatar,
  uploadCover,
  follow,
  unfollow,
  getFollowers,
  getFollowing,
  searchUsers,
  getSuggestions,
};
