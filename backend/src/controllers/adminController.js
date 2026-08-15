import User from '../models/User.js';
import Post from '../models/Post.js';
import Story from '../models/Story.js';
import Reel from '../models/Reel.js';
import Comment from '../models/Comment.js';
import Report from '../models/Report.js';
import Share from '../models/Share.js';
import Follow from '../models/FollowModel.js';
import Like from '../models/LikeModel.js';
import Reaction from '../models/Reaction.js';
import Saved from '../models/SavedModel.js';
import Block from '../models/BlockModel.js';
import Mute from '../models/MuteModel.js';
import Notification from '../models/Notification.js';
import Session from '../models/SessionModel.js';
import AdminSetting from '../models/AdminSettingModel.js';
import AdminActionLog from '../models/AdminActionLogModel.js';
import { sendSuccess } from '../utils/response.js';
import APIError from '../utils/AppError.js';
import SecurityLog from '../models/SecurityLogModel.js';
import { issueTokens, buildTokenPair } from '../services/authService.js';
import { sign2FAChallenge } from '../config/jwt.js';
import logAdminAction from '../services/adminService.js';
import { notifyMany } from '../utils/notify.js';

const USER_FIELDS = 'username fullName avatar verified role emailVerified bio counts isBanned isActive banReason createdAt';

const logSecurityEvent = (userId, action, req, success = true) =>
  SecurityLog.create({
    user: userId,
    action,
    ip: req.ip,
    device: req.headers['user-agent'] || '',
    success,
  });

const deleteUserContent = async (userId) => {
  const commentsOnMine = await Comment.distinct('post', { author: userId });
  await Promise.all([
    Post.deleteMany({ author: userId }),
    Story.deleteMany({ author: userId }),
    Reel.deleteMany({ author: userId }),
    Comment.deleteMany({ author: userId }),
    Share.deleteMany({ sharer: userId }),
    Follow.deleteMany({ $or: [{ follower: userId }, { following: userId }] }),
    Like.deleteMany({ user: userId }),
    Reaction.deleteMany({ user: userId }),
    Saved.deleteMany({ user: userId }),
    Block.deleteMany({ $or: [{ blocker: userId }, { blocked: userId }] }),
    Mute.deleteMany({ $or: [{ muter: userId }, { muted: userId }] }),
    Notification.deleteMany({ $or: [{ recipient: userId }, { actor: userId }] }),
    Session.deleteMany({ user: userId }),
    SecurityLog.deleteMany({ user: userId }),
  ]);

  // Also remove comments left on the deleting user's posts.
  if (commentsOnMine.length > 0) {
    await Comment.deleteMany({ post: { $in: commentsOnMine } });
  }
};

/**
 * POST /admin/login — role-gated login. Actively rejects non-admin accounts
 * (deliberately after verifying credentials to avoid user-enumeration).
 */
const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) throw new APIError(401, 'Invalid credential.');

    const passwordMatches = await user.comparePassword(password);
    if (!passwordMatches) throw new APIError(401, 'Invalid credential.');
    if (user.isBanned || !user.isActive) throw new APIError(403, 'This account is not active.');

    if (!['admin', 'superadmin'].includes(user.role)) {
      throw new APIError(403, 'This account does not have admin access.');
    }

    if (user.twoFA?.enabled) {
      const challenge = sign2FAChallenge({ id: user._id, type: '2fa' });
      return sendSuccess(res, 200, 'Two-factor code required.', { requiresTwoFactor: true, challenge, twoFA: true });
    }

    await logSecurityEvent(user._id, 'admin_login', req);
    await logAdminAction({
      admin: user._id,
      action: 'admin_login',
      targetType: 'system',
      metadata: { twoFactor: false },
      ip: req.ip,
    });

    const tokens = await issueTokens(user, req);
    sendSuccess(res, 200, 'Admin login successful.', {
      ...buildTokenPair(user, tokens.accessToken, tokens.refreshToken, tokens.sessionId),
      user: user.toProfileJSON(true),
    });
  } catch (err) {
    next(err);
  }
};

const dashboardStats = async (req, res, next) => {
  try {
    const [users, activeUsers, bannedUsers, posts, activePosts, flaggedPosts, reels, flaggedReels, stories, comments, reportsPending, follows, likes] =
      await Promise.all([
        User.countDocuments({}),
        User.countDocuments({ isActive: true, isBanned: false }),
        User.countDocuments({ isBanned: true }),
        Post.countDocuments({ isDeleted: false }),
        Post.countDocuments({ isDeleted: false, visibility: 'public' }),
        Post.countDocuments({ isDeleted: false, isFlagged: true }),
        Reel.countDocuments({ isDeleted: false }),
        Reel.countDocuments({ isDeleted: false, isFlagged: true }),
        Story.countDocuments({ isActive: true }),
        Comment.countDocuments({ isDeleted: false }),
        Report.countDocuments({ status: 'pending' }),
        Follow.countDocuments({}),
        Like.countDocuments({}),
      ]);

    sendSuccess(res, 200, 'Dashboard stats retrieved.', {
      stats: {
        users: { total: users, active: activeUsers, banned: bannedUsers },
        posts: { total: posts, public: activePosts, flagged: flaggedPosts },
        reels: { total: reels, flagged: flaggedReels },
        stories: { total: stories },
        comments: { total: comments },
        reports: { pending: reportsPending },
        engagement: { follows, likes },
      },
    });
  } catch (err) {
    next(err);
  }
};

const dashboardCharts = async (req, res, next) => {
  try {
    const days = 7;
    const since = new Date();
    since.setUTCDate(since.getUTCDate() - (days - 1));
    since.setUTCHours(0, 0, 0, 0);

    const dayBucket = {
      $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'UTC' },
    };

    const [signups, newPosts, likes, comments, followGraph, reactions] = await Promise.all([
      User.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: dayBucket, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      Post.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: dayBucket, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      Like.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: dayBucket, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      Comment.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: dayBucket, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      Follow.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: dayBucket, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      Reaction.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: dayBucket, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
    ]);

    // Fill missing days with zero
    const daysList = Array.from({ length: days }, (_, i) => {
      const d = new Date(since.getTime() + i * 86400000);
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    });

    const fill = (rows) =>
      daysList.map((day) => {
        const found = rows.find((r) => r._id === day);
        return { date: day, count: found ? found.count : 0 };
      });

    sendSuccess(res, 200, 'Dashboard charts retrieved.', {
      charts: {
        signups: fill(signups),
        posts: fill(newPosts),
        likes: fill(likes),
        comments: fill(comments),
        follows: fill(followGraph),
        reactions: fill(reactions),
        days: daysList,
      },
    });
  } catch (err) {
    next(err);
  }
};

const listUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, q, role, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query = {};
    if (q) {
      const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ username: re }, { fullName: re }, { email: re }];
    }
    if (role) query.role = role;
    if (status === 'banned') query.isBanned = true;
    else if (status === 'deactivated') query.isActive = false;
    else if (status === 'active') query.isActive = true;

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).select(USER_FIELDS),
      User.countDocuments(query),
    ]);

    sendSuccess(res, 200, 'Users retrieved.', { users, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
  } catch (err) {
    next(err);
  }
};

const getUserDetail = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('+email').select(USER_FIELDS + ' email');
    if (!user) throw new APIError(404, 'User not found.');

    const [posts, stories, reels, reports] = await Promise.all([
      Post.countDocuments({ author: user._id, isDeleted: false }),
      Story.countDocuments({ author: user._id, isActive: true }),
      Reel.countDocuments({ author: user._id, isDeleted: false }),
      Report.countDocuments({ targetType: 'user', targetId: user._id }),
    ]);

    sendSuccess(res, 200, 'User detail retrieved.', {
      user: user.toProfileJSON(true),
      activity: { posts, stories, reels, reports },
    });
  } catch (err) {
    next(err);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    const targetId = req.params.id;

    if (String(targetId) === String(req.userId)) {
      throw new APIError(400, 'Admin cannot modify their own status.');
    }

    const user = await User.findById(targetId);
    if (!user) throw new APIError(404, 'User not found.');

    if (user.role === 'superadmin' && req.user.role !== 'superadmin') {
      throw new APIError(403, 'Only a superadmin can modify superadmin accounts.');
    }

    if (status === 'ban') {
      user.isBanned = true;
      user.banReason = reason || 'Banned by admin';
      await Session.updateMany({ user: user._id, revoked: false }, { revoked: true });
    } else if (status === 'unban') {
      user.isBanned = false;
      user.banReason = undefined;
    } else if (status === 'deactivate') {
      user.isActive = false;
      await Session.updateMany({ user: user._id, revoked: false }, { revoked: true });
    } else if (status === 'activate') {
      user.isActive = true;
    }

    await user.save();
    await logAdminAction({ admin: req.userId, action: `${status}_user`, targetType: 'user', targetId: user._id, metadata: { username: user.username, reason }, ip: req.ip });

    sendSuccess(res, 200, `User ${status}d successfully.`, {
      user: { _id: user._id, username: user.username, isBanned: user.isBanned, isActive: user.isActive, banReason: user.banReason },
    });
  } catch (err) {
    next(err);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const targetId = req.params.id;

    const user = await User.findById(targetId);
    if (!user) throw new APIError(404, 'User not found.');

    if (req.user.role !== 'superadmin') {
      throw new APIError(403, 'Only a superadmin can change roles.');
    }
    if (String(targetId) === String(req.userId) && role === 'user') {
      throw new APIError(400, 'A superadmin cannot demote themselves to user.');
    }

    user.role = role;
    await user.save();
    await logAdminAction({ admin: req.userId, action: 'change_role', targetType: 'user', targetId: user._id, metadata: { username: user.username, role }, ip: req.ip });

    sendSuccess(res, 200, `Role updated to ${role}.`, { user: { _id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const targetId = req.params.id;
    const user = await User.findById(targetId);
    if (!user) throw new APIError(404, 'User not found.');
    if (user.role === 'superadmin') throw new APIError(403, 'Superadmin accounts cannot be deleted.');
    if (String(targetId) === String(req.userId)) throw new APIError(400, 'Admin cannot delete their own account.');

    await deleteUserContent(targetId);
    await User.findByIdAndDelete(targetId);
    await logAdminAction({ admin: req.userId, action: 'delete_user', targetType: 'user', targetId: targetId, metadata: { username: user.username }, ip: req.ip });

    sendSuccess(res, 200, `@${user.username} and all associated content were deleted.`, { deleted: true });
  } catch (err) {
    next(err);
  }
};

const listPosts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, q, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query = {};
    if (q) query.content = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    if (status === 'flagged') query.isFlagged = true;
    else if (status === 'deleted') query.isDeleted = true;
    else if (status === 'visible') { query.isDeleted = false; query.isFlagged = false; }

    const [posts, total] = await Promise.all([
      Post.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('author', 'username fullName avatar verified'),
      Post.countDocuments(query),
    ]);

    sendSuccess(res, 200, 'Posts retrieved.', { posts, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
  } catch (err) {
    next(err);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) throw new APIError(404, 'Post not found.');

    post.isDeleted = true;
    await post.save();

    await User.updateOne({ _id: post.author, 'counts.posts': { $gt: 0 } }, { $inc: { 'counts.posts': -1 } });
    await logAdminAction({ admin: req.userId, action: 'delete_post', targetType: 'post', targetId: post._id, metadata: {}, ip: req.ip });

    sendSuccess(res, 200, 'Post removed.', { deleted: true });
  } catch (err) {
    next(err);
  }
};

const togglePinPost = async (req, res, next) => {
  try {
    const { isPinned } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) throw new APIError(404, 'Post not found.');

    post.isPinned = isPinned;
    await post.save();
    await logAdminAction({ admin: req.userId, action: isPinned ? 'pin_post' : 'unpin_post', targetType: 'post', targetId: post._id, metadata: {}, ip: req.ip });

    sendSuccess(res, 200, isPinned ? 'Post pinned.' : 'Post unpinned.', { post: { _id: post._id, isPinned: post.isPinned } });
  } catch (err) {
    next(err);
  }
};

const listStories = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, q } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query = {};
    if (q) query.text = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const [stories, total] = await Promise.all([
      Story.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('author', 'username fullName avatar verified'),
      Story.countDocuments(query),
    ]);

    sendSuccess(res, 200, 'Stories retrieved.', { stories, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
  } catch (err) {
    next(err);
  }
};

const deleteStory = async (req, res, next) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) throw new APIError(404, 'Story not found.');

    story.isActive = false;
    await story.save();
    await logAdminAction({ admin: req.userId, action: 'delete_story', targetType: 'story', targetId: story._id, metadata: {}, ip: req.ip });

    sendSuccess(res, 200, 'Story removed.', { deleted: true });
  } catch (err) {
    next(err);
  }
};

const listReels = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, q, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query = {};
    if (q) query.caption = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    if (status === 'flagged') query.isFlagged = true;
    else if (status === 'deleted') query.isDeleted = true;
    else if (status === 'visible') { query.isDeleted = false; query.isFlagged = false; }

    const [reels, total] = await Promise.all([
      Reel.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('author', 'username fullName avatar verified'),
      Reel.countDocuments(query),
    ]);

    sendSuccess(res, 200, 'Reels retrieved.', { reels, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
  } catch (err) {
    next(err);
  }
};

const deleteReel = async (req, res, next) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) throw new APIError(404, 'Reel not found.');

    reel.isDeleted = true;
    await reel.save();
    await logAdminAction({ admin: req.userId, action: 'delete_reel', targetType: 'reel', targetId: reel._id, metadata: {}, ip: req.ip });

    sendSuccess(res, 200, 'Reel removed.', { deleted: true });
  } catch (err) {
    next(err);
  }
};

const listComments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, q } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query = {};
    if (q) query.content = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const [comments, total] = await Promise.all([
      Comment.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('author', 'username fullName avatar verified'),
      Comment.countDocuments(query),
    ]);

    sendSuccess(res, 200, 'Comments retrieved.', { comments, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
  } catch (err) {
    next(err);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) throw new APIError(404, 'Comment not found.');

    comment.isDeleted = true;
    await comment.save();
    await logAdminAction({ admin: req.userId, action: 'delete_comment', targetType: 'comment', targetId: comment._id, metadata: {}, ip: req.ip });

    sendSuccess(res, 200, 'Comment removed.', { deleted: true });
  } catch (err) {
    next(err);
  }
};

const getHashtags = async (req, res, next) => {
  try {
    const { q } = req.query;
    const match = {};
    if (q) match.tags = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    const rows = await Post.aggregate([
      { $match: match },
      { $unwind: '$tags' },
      { $match: match },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 },
    ]);

    sendSuccess(res, 200, 'Hashtags retrieved.', { hashtags: rows.map((r) => ({ tag: r._id, count: r.count })) });
  } catch (err) {
    next(err);
  }
};

const broadcastNotification = async (req, res, next) => {
  try {
    const { message, recipients, type } = req.body;

    let targetUsers = [];
    if (Array.isArray(recipients) && recipients.length > 0) {
      targetUsers = recipients;
    } else {
      targetUsers = await User.find({ isActive: true, isBanned: false }).distinct('_id');
    }

    await notifyMany({
      recipients: targetUsers,
      type,
      actor: req.userId,
      targetType: 'post',
      targetId: undefined,
      targetModel: 'Post',
      message,
    });

    await logAdminAction({ admin: req.userId, action: 'broadcast', targetType: 'system', metadata: { message, recipients: recipients?.length || 'all' }, ip: req.ip });

    sendSuccess(res, 201, `Broadcast notification sent to ${targetUsers.length} users.`, { sent: targetUsers.length });
  } catch (err) {
    next(err);
  }
};

const listAuditLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, action, adminId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query = {};
    if (action) query.action = action;
    if (adminId) query.admin = adminId;

    const [logs, total] = await Promise.all([
      AdminActionLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('admin', 'username fullName avatar verified'),
      AdminActionLog.countDocuments(query),
    ]);

    sendSuccess(res, 200, 'Audit logs retrieved.', { logs, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) } });
  } catch (err) {
    next(err);
  }
};

const ALLOWED_KEYS = [
  'maintenanceMode',
  'closedRegistration',
  'maxPostLength',
  'maxReelSeconds',
  'tosUrl',
  'bannerMessage',
];

const getSettings = async (req, res, next) => {
  try {
    const docs = await AdminSetting.find({});
    const settings = {};
    docs.forEach((d) => { settings[d.key] = d.value; });
    sendSuccess(res, 200, 'Settings retrieved.', { settings, allowedKeys: ALLOWED_KEYS });
  } catch (err) {
    next(err);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const { settings } = req.body;
    const entries = Object.entries(settings).filter(([k]) => ALLOWED_KEYS.includes(k));
    if (entries.length === 0) throw new APIError(400, 'No valid settings provided.');

    await Promise.all(
      entries.map(([key, value]) =>
        AdminSetting.findOneAndUpdate({ key }, { value, updatedBy: req.userId }, { upsert: true, new: true })
      )
    );

    await logAdminAction({ admin: req.userId, action: 'update_settings', targetType: 'system', metadata: { keys: entries.map(([k]) => k) }, ip: req.ip });

    sendSuccess(res, 200, 'Settings updated.', { updated: entries.map(([k]) => k) });
  } catch (err) {
    next(err);
  }
};

const getAdminSelf = async (req, res, _next) => {
  sendSuccess(res, 200, 'Admin profile retrieved.', { admin: req.user.toProfileJSON(true) });
};

export {
  adminLogin,
  dashboardStats,
  dashboardCharts,
  listUsers,
  getUserDetail,
  updateUserStatus,
  updateUserRole,
  deleteUser,
  listPosts,
  deletePost,
  togglePinPost,
  listStories,
  deleteStory,
  listReels,
  deleteReel,
  listComments,
  deleteComment,
  getHashtags,
  broadcastNotification,
  listAuditLogs,
  getSettings,
  updateSettings,
  getAdminSelf,
};