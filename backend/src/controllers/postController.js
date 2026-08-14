import mongoose from 'mongoose';
import Post from '../models/Post.js';
import Follow from '../models/FollowModel.js';
import Like from '../models/LikeModel.js';
import Saved from '../models/SavedModel.js';
import User from '../models/User.js';
import { sendSuccess } from '../utils/response.js';
import APIError from '../utils/AppError.js';
import { uploadMediaToCloudinary } from '../middlewares/upload.js';

const USER_FIELDS = 'username fullName avatar verified bio counts';

const extractTags = (content = '') => {
  const matches = content.match(/#[a-zA-Z0-9_]+/g) || [];
  return [...new Set(matches.map((t) => t.slice(1).toLowerCase()))];
};

const extractMentions = (content = '') => {
  const matches = content.match(/@[a-zA-Z0-9_]+/g) || [];
  return [...new Set(matches.map((m) => m.slice(1).toLowerCase()))];
};

const findMentionedUsers = async (content) => {
  const usernames = extractMentions(content);
  if (usernames.length === 0) return [];
  const users = await User.find({ username: { $in: usernames } }).select('_id');
  return users.map((u) => u._id);
};

const decoratePost = (post, viewerId, viewerLikes, viewerSaves) => {
  const doc = post.toObject ? post.toObject() : post;
  const id = viewerId ? String(viewerId) : null;
  return {
    ...doc,
    isLiked: id ? viewerLikes.has(String(post._id)) : false,
    isSaved: id ? viewerSaves.has(String(post._id)) : false,
  };
};

const decoratePosts = async (posts, viewerId) => {
  if (posts.length === 0) return posts;

  let viewerLikes = new Set();
  let viewerSaves = new Set();
  const ids = posts.map((p) => p._id);

  if (viewerId) {
    const [likes, saves] = await Promise.all([
      Like.find({ user: viewerId, targetType: 'post', targetId: { $in: ids } }).select('targetId'),
      Saved.find({ user: viewerId, post: { $in: ids } }).select('post'),
    ]);
    viewerLikes = new Set(likes.map((l) => String(l.targetId)));
    viewerSaves = new Set(saves.map((s) => String(s.post)));
  }

  return posts.map((p) => decoratePost(p, viewerId, viewerLikes, viewerSaves));
};

const canViewPost = async (post, viewerId) => {
  const ownerId = String(post.author._id || post.author);
  if (post.visibility === 'onlyme') {
    if (!viewerId || String(viewerId) !== ownerId) return false;
  } else if (post.visibility === 'followers') {
    if (String(viewerId) === ownerId) return true;
    if (!viewerId) return false;
    return Follow.exists({ follower: viewerId, following: post.author._id || post.author });
  }
  return true;
};

const createPost = async (req, res, next) => {
  try {
    const { content, location, visibility } = req.body;
    const files = req.files || [];

    if ((!content || !content.trim()) && files.length === 0) {
      throw new APIError(400, 'Post must have text content or at least one media file.');
    }

    let media = [];
    if (files.length > 0) {
      media = await Promise.all(
        files.map((f) => uploadMediaToCloudinary(f, 'nexus/posts'))
      );
    }

    const tags = extractTags(content).concat(req.body.tags || []);
    const mentions = await findMentionedUsers(content);

    const post = await Post.create({
      author: req.userId,
      content: content || '',
      media,
      tags,
      mentions,
      location,
      visibility: visibility || 'public',
    });

    await User.updateOne({ _id: req.userId }, { $inc: { 'counts.posts': 1 } });

    const populated = await Post.findById(post._id).populate('author', USER_FIELDS);
    const [decorated] = await decoratePosts([populated], req.userId);

    sendSuccess(res, 201, 'Post created successfully.', { post: decorated });
  } catch (err) {
    next(err);
  }
};

const getFeed = async (req, res, next) => {
  try {
    const { cursor, limit } = req.query;

    const following = await Follow.find({ follower: req.userId }).distinct('following');
    const authorIds = [req.userId, ...following.map((id) => new mongoose.Types.ObjectId(id))];

    const query = {
      author: { $in: authorIds },
      isDeleted: false,
      ...(cursor ? { _id: { $lt: new mongoose.Types.ObjectId(cursor) } } : {}),
    };

    const posts = await Post.find(query)
      .sort({ _id: -1 })
      .limit(Number(limit) + 1)
      .populate('author', USER_FIELDS)
      .populate('originalPost', 'content media author createdAt')
      .populate('originalPost.author', USER_FIELDS);

    const hasMore = posts.length > Number(limit);
    const pagePosts = hasMore ? posts.slice(0, Number(limit)) : posts;
    const nextCursor = pagePosts.length ? String(pagePosts[pagePosts.length - 1]._id) : null;

    const decorated = await decoratePosts(pagePosts, req.userId);

    sendSuccess(res, 200, 'Feed retrieved.', {
      posts: decorated,
      pagination: { cursor: nextCursor, hasMore },
    });
  } catch (err) {
    next(err);
  }
};

const getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', USER_FIELDS);

    if (!post || post.isDeleted) throw new APIError(404, 'Post not found.');

    const allowed = await canViewPost(post, req.userId);
    if (!allowed) throw new APIError(403, 'You do not have permission to view this post.');

    post.views += 1;
    await post.save();

    const [decorated] = await decoratePosts([post], req.userId);

    sendSuccess(res, 200, 'Post retrieved.', { post: decorated });
  } catch (err) {
    next(err);
  }
};

const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: false });
    if (!post) throw new APIError(404, 'Post not found.');
    if (String(post.author) !== String(req.userId)) {
      throw new APIError(403, 'You can only edit your own posts.');
    }

    const updates = {};
    if (req.body.content !== undefined) updates.content = req.body.content || '';
    if (req.body.location !== undefined) updates.location = req.body.location;
    if (req.body.visibility !== undefined) updates.visibility = req.body.visibility;
    if (updates.content !== undefined) updates.tags = extractTags(updates.content);

    Object.assign(post, updates);
    await post.save();

    const populated = await Post.findById(post._id).populate('author', USER_FIELDS);
    const [decorated] = await decoratePosts([populated], req.userId);

    sendSuccess(res, 200, 'Post updated.', { post: decorated });
  } catch (err) {
    next(err);
  }
};

const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, isDeleted: false });
    if (!post) throw new APIError(404, 'Post not found.');
    if (String(post.author) !== String(req.userId)) {
      throw new APIError(403, 'You can only delete your own posts.');
    }

    post.isDeleted = true;
    await post.save();

    await User.updateOne(
      { _id: req.userId, 'counts.posts': { $gt: 0 } },
      { $inc: { 'counts.posts': -1 } }
    );

    sendSuccess(res, 200, 'Post deleted.', { deleted: true });
  } catch (err) {
    next(err);
  }
};

const sharePost = async (req, res, next) => {
  try {
    const original = await Post.findOne({ _id: req.params.id, isDeleted: false });
    if (!original) throw new APIError(404, 'Post not found.');

    if (!(await canViewPost(original, req.userId))) {
      throw new APIError(403, 'You cannot share this post.');
    }

    const share = await Post.create({
      author: req.userId,
      content: req.body.content || '',
      originalPost: original._id,
      tags: extractTags(req.body.content || ''),
      visibility: 'public',
    });

    await Promise.all([
      Post.updateOne({ _id: original._id }, { $inc: { sharesCount: 1 } }),
      User.updateOne({ _id: req.userId }, { $inc: { 'counts.posts': 1 } }),
    ]);

    const populated = await Post.findById(share._id)
      .populate('author', USER_FIELDS)
      .populate('originalPost', 'content media author createdAt')
      .populate('originalPost.author', USER_FIELDS);
    const [decorated] = await decoratePosts([populated], req.userId);

    sendSuccess(res, 201, 'Post shared.', { post: decorated });
  } catch (err) {
    next(err);
  }
};

const likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.isDeleted) throw new APIError(404, 'Post not found.');

    const existing = await Like.findOneAndDelete({
      user: req.userId,
      targetType: 'post',
      targetId: post._id,
    });

    if (existing) {
      await Post.updateOne(
        { _id: post._id, likesCount: { $gt: 0 } },
        { $inc: { likesCount: -1 } }
      );
      return sendSuccess(res, 200, 'Post unliked.', {
        liked: false,
        likesCount: Math.max(0, post.likesCount - 1),
      });
    }

    await Like.create({ user: req.userId, targetType: 'post', targetId: post._id });
    await Post.updateOne({ _id: post._id }, { $inc: { likesCount: 1 } });

    sendSuccess(res, 200, 'Post liked.', { liked: true, likesCount: post.likesCount + 1 });
  } catch (err) {
    next(err);
  }
};

const getPostLikes = async (req, res, next) => {
  try {
    const { cursor, limit } = req.query;

    const post = await Post.findById(req.params.id);
    if (!post || post.isDeleted) throw new APIError(404, 'Post not found.');

    const query = {
      targetType: 'post',
      targetId: post._id,
      ...(cursor ? { _id: { $lt: new mongoose.Types.ObjectId(cursor) } } : {}),
    };

    const likes = await Like.find(query)
      .sort({ _id: -1 })
      .limit(Number(limit))
      .populate('user', USER_FIELDS);

    const users = likes.map((l) => l.user).filter(Boolean);

    const hasMore = likes.length === Number(limit);
    const nextCursor = likes.length ? String(likes[likes.length - 1]._id) : null;

    sendSuccess(res, 200, 'Likes retrieved.', {
      users,
      pagination: { cursor: nextCursor, hasMore },
    });
  } catch (err) {
    next(err);
  }
};

const savePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post || post.isDeleted) throw new APIError(404, 'Post not found.');

    const existing = await Saved.findOneAndDelete({ user: req.userId, post: post._id });

    if (existing) {
      return sendSuccess(res, 200, 'Post removed from saved.', { saved: false });
    }

    await Saved.create({ user: req.userId, post: post._id });
    sendSuccess(res, 200, 'Post saved.', { saved: true });
  } catch (err) {
    next(err);
  }
};

const getExplore = async (req, res, next) => {
  try {
    const { cursor, limit } = req.query;

    const query = {
      isDeleted: false,
      visibility: 'public',
      ...(cursor ? { _id: { $lt: new mongoose.Types.ObjectId(cursor) } } : {}),
    };

    const posts = await Post.find(query)
      .sort({ likesCount: -1, commentsCount: -1, _id: -1 })
      .limit(Number(limit) + 1)
      .populate('author', USER_FIELDS);

    const hasMore = posts.length > Number(limit);
    const pagePosts = hasMore ? posts.slice(0, Number(limit)) : posts;
    const nextCursor = pagePosts.length ? String(pagePosts[pagePosts.length - 1]._id) : null;

    const decorated = await decoratePosts(pagePosts, req.userId);

    sendSuccess(res, 200, 'Explore posts retrieved.', {
      posts: decorated,
      pagination: { cursor: nextCursor, hasMore },
    });
  } catch (err) {
    next(err);
  }
};

const getPostsByTag = async (req, res, next) => {
  try {
    const { hashtag } = req.params;
    const { cursor, limit } = req.query;

    const tag = hashtag.toLowerCase();
    const query = {
      tags: tag,
      isDeleted: false,
      visibility: 'public',
      ...(cursor ? { _id: { $lt: new mongoose.Types.ObjectId(cursor) } } : {}),
    };

    const posts = await Post.find(query)
      .sort({ _id: -1 })
      .limit(Number(limit) + 1)
      .populate('author', USER_FIELDS);

    const hasMore = posts.length > Number(limit);
    const pagePosts = hasMore ? posts.slice(0, Number(limit)) : posts;
    const nextCursor = pagePosts.length ? String(pagePosts[pagePosts.length - 1]._id) : null;

    const decorated = await decoratePosts(pagePosts, req.userId);

    sendSuccess(res, 200, 'Hashtag posts retrieved.', {
      posts: decorated,
      pagination: { cursor: nextCursor, hasMore },
    });
  } catch (err) {
    next(err);
  }
};

const getSavedPosts = async (req, res, next) => {
  try {
    const { cursor, limit } = req.query;

    const savedDocs = await Saved.find({
      user: req.userId,
      ...(cursor ? { _id: { $lt: new mongoose.Types.ObjectId(cursor) } } : {}),
    })
      .sort({ _id: -1 })
      .limit(Number(limit) + 1)
      .select('post createdAt');

    const hasMore = savedDocs.length > Number(limit);
    const pageDocs = hasMore ? savedDocs.slice(0, Number(limit)) : savedDocs;

    const postIds = pageDocs.map((s) => s.post);
    const posts = postIds.length
      ? await Post.find({ _id: { $in: postIds }, isDeleted: false })
          .populate('author', USER_FIELDS)
      : [];

    const orderMap = new Map(postIds.map((id, i) => [String(id), i]));
    const ordered = posts.sort((a, b) => orderMap.get(String(a._id)) - orderMap.get(String(b._id)));

    const nextCursor = pageDocs.length ? String(pageDocs[pageDocs.length - 1]._id) : null;
    const decorated = await decoratePosts(ordered, req.userId);

    sendSuccess(res, 200, 'Saved posts retrieved.', {
      posts: decorated,
      pagination: { cursor: nextCursor, hasMore },
    });
  } catch (err) {
    next(err);
  }
};

const getTrending = async (req, res, next) => {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const trending = await Post.aggregate([
      { $match: { isDeleted: false, tags: { $ne: [] }, createdAt: { $gte: since } } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
      { $project: { _id: 0, tag: '$_id', count: 1 } },
    ]);

    sendSuccess(res, 200, 'Trending hashtags retrieved.', { trending });
  } catch (err) {
    next(err);
  }
};

export {
  createPost,
  getFeed,
  getPost,
  updatePost,
  deletePost,
  sharePost,
  likePost,
  getPostLikes,
  savePost,
  getExplore,
  getPostsByTag,
  getSavedPosts,
  getTrending,
};