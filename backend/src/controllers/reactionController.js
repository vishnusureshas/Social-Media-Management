import mongoose from 'mongoose';
import Reaction from '../models/Reaction.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import APIError from '../utils/AppError.js';
import { sendSuccess } from '../utils/response.js';

const TARGET_MODELS = {
  post: Post,
  comment: Comment,
};

const findTarget = async (targetType, targetId) => {
  const Model = TARGET_MODELS[targetType];
  if (!Model) throw new APIError(400, 'Unsupported reaction target.');

  const target = await Model.findById(targetId);
  if (!target) throw new APIError(404, 'Target not found.');
  if (target.isDeleted) throw new APIError(404, 'Target not found.');
  return target;
};

const react = async (req, res, next) => {
  try {
    const { targetType, targetId, emoji } = req.body;
    await findTarget(targetType, targetId);

    const existing = await Reaction.findOne({ user: req.userId, targetType, targetId });

    if (existing) {
      if (existing.emoji === emoji) {
        await Reaction.deleteOne({ _id: existing._id });
        return sendSuccess(res, 200, 'Reaction removed.', { reacted: false, emoji: null });
      }

      existing.emoji = emoji;
      await existing.save();
      return sendSuccess(res, 200, 'Reaction updated.', { reacted: true, emoji });
    }

    await Reaction.create({ user: req.userId, targetType, targetId, emoji });
    sendSuccess(res, 201, 'Reaction added.', { reacted: true, emoji });
  } catch (err) {
    next(err);
  }
};

const removeReaction = async (req, res, next) => {
  try {
    const reaction = await Reaction.findOne({ _id: req.params.id, user: req.userId });
    if (!reaction) throw new APIError(404, 'Reaction not found.');

    await Reaction.deleteOne({ _id: reaction._id });
    sendSuccess(res, 200, 'Reaction removed.', { reacted: false, emoji: null });
  } catch (err) {
    next(err);
  }
};

const getReactionSummary = async (req, res, next) => {
  try {
    const { targetType, targetId } = req.query;

    const rows = await Reaction.aggregate([
      { $match: { targetType, targetId: new mongoose.Types.ObjectId(targetId) } },
      { $group: { _id: '$emoji', count: { $sum: 1 } } },
      { $project: { _id: 0, emoji: '$_id', count: 1 } },
    ]);

    const summary = rows.sort((a, b) => b.count - a.count);
    const total = summary.reduce((acc, r) => acc + r.count, 0);

    const myReaction = await Reaction.findOne({
      user: req.userId,
      targetType,
      targetId,
    }).select('emoji');

    sendSuccess(res, 200, 'Reaction summary retrieved.', {
      targetType,
      targetId,
      total,
      summary,
      myReaction: myReaction ? myReaction.emoji : null,
    });
  } catch (err) {
    next(err);
  }
};

export { react, removeReaction, getReactionSummary };