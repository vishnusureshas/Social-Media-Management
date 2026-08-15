import mongoose from 'mongoose';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import Like from '../models/LikeModel.js';
import { sendSuccess } from '../utils/response.js';
import APIError from '../utils/AppError.js';
import { notifyOne } from '../utils/notify.js';

const USER_FIELDS = 'username fullName avatar verified bio';

const addComment = async (req, res, next) => {
  try {
    const { post, parent, content } = req.body;

    const targetPost = await Post.findById(post);
    if (!targetPost || targetPost.isDeleted) throw new APIError(404, 'Post not found.');

    if (parent) {
      const parentComment = await Comment.findOne({ _id: parent, post });
      if (!parentComment || parentComment.isDeleted) {
        throw new APIError(404, 'Parent comment not found.');
      }
    }

    const comment = await Comment.create({
      post,
      author: req.userId,
      parent: parent || null,
      content,
    });

    await Post.updateOne({ _id: post }, { $inc: { commentsCount: 1 } });

    await notifyOne({
      recipient: targetPost.author,
      type: 'comment',
      actor: req.userId,
      targetType: 'post',
      targetId: targetPost._id,
      targetModel: 'Post',
      message: parent ? 'replied to your comment.' : 'commented on your post.',
    });

    const populated = await Comment.findById(comment._id).populate('author', USER_FIELDS);
    sendSuccess(res, 201, 'Comment added.', { comment: populated });
  } catch (err) {
    next(err);
  }
};

const getPostComments = async (req, res, next) => {
  try {
    const { cursor, limit } = req.query;

    const post = await Post.findById(req.params.id);
    if (!post || post.isDeleted) throw new APIError(404, 'Post not found.');

    const query = {
      post: post._id,
      parent: null,
      isDeleted: false,
      ...(cursor ? { _id: { $lt: new mongoose.Types.ObjectId(cursor) } } : {}),
    };

    const comments = await Comment.find(query)
      .sort({ _id: -1 })
      .limit(Number(limit) + 1)
      .populate('author', USER_FIELDS);

    const hasMore = comments.length > Number(limit);
    const pageComments = hasMore ? comments.slice(0, Number(limit)) : comments;
    const nextCursor = pageComments.length ? String(pageComments[pageComments.length - 1]._id) : null;

    const replyCounts = await Comment.aggregate([
      { $match: { parent: { $in: pageComments.map((c) => c._id) }, isDeleted: false } },
      { $group: { _id: '$parent', count: { $sum: 1 } } },
    ]);
    const replyCountMap = new Map(replyCounts.map((r) => [String(r._id), r.count]));
    pageComments.forEach((c) => c._doc.repliesCount = replyCountMap.get(String(c._id)) || 0);

    sendSuccess(res, 200, 'Comments retrieved.', {
      comments: pageComments,
      pagination: { cursor: nextCursor, hasMore },
    });
  } catch (err) {
    next(err);
  }
};

const getCommentReplies = async (req, res, next) => {
  try {
    const { cursor, limit } = req.query;

    const query = {
      parent: req.params.id,
      isDeleted: false,
      ...(cursor ? { _id: { $lt: new mongoose.Types.ObjectId(cursor) } } : {}),
    };

    const replies = await Comment.find(query)
      .sort({ _id: -1 })
      .limit(Number(limit))
      .populate('author', USER_FIELDS);

    const hasMore = replies.length === Number(limit);
    const nextCursor = replies.length ? String(replies[replies.length - 1]._id) : null;

    sendSuccess(res, 200, 'Replies retrieved.', {
      comments: replies,
      pagination: { cursor: nextCursor, hasMore },
    });
  } catch (err) {
    next(err);
  }
};

const editComment = async (req, res, next) => {
  try {
    const comment = await Comment.findOne({ _id: req.params.id, isDeleted: false });
    if (!comment) throw new APIError(404, 'Comment not found.');
    if (String(comment.author) !== String(req.userId)) {
      throw new APIError(403, 'You can only edit your own comments.');
    }

    comment.content = req.body.content;
    await comment.save();

    const populated = await Comment.findById(comment._id).populate('author', USER_FIELDS);
    sendSuccess(res, 200, 'Comment updated.', { comment: populated });
  } catch (err) {
    next(err);
  }
};

const deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findOne({ _id: req.params.id, isDeleted: false });
    if (!comment) throw new APIError(404, 'Comment not found.');
    if (String(comment.author) !== String(req.userId)) {
      throw new APIError(403, 'You can only delete your own comments.');
    }

    comment.isDeleted = true;
    await comment.save();

    await Post.updateOne(
      { _id: comment.post, commentsCount: { $gt: 0 } },
      { $inc: { commentsCount: -1 } }
    );

    sendSuccess(res, 200, 'Comment deleted.', { deleted: true });
  } catch (err) {
    next(err);
  }
};

const likeComment = async (req, res, next) => {
  try {
    const comment = await Comment.findOne({ _id: req.params.id, isDeleted: false });
    if (!comment) throw new APIError(404, 'Comment not found.');

    const existing = await Like.findOneAndDelete({
      user: req.userId,
      targetType: 'comment',
      targetId: comment._id,
    });

    if (existing) return sendSuccess(res, 200, 'Comment unliked.', { liked: false });

    await Like.create({ user: req.userId, targetType: 'comment', targetId: comment._id });
    sendSuccess(res, 200, 'Comment liked.', { liked: true });
  } catch (err) {
    next(err);
  }
};

export { addComment, getPostComments, getCommentReplies, editComment, deleteComment, likeComment };