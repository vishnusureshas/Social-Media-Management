import mongoose from 'mongoose';
import Reel from '../models/Reel.js';
import Comment from '../models/Comment.js';
import Reaction from '../models/Reaction.js';
import Share from '../models/Share.js';
import User from '../models/User.js';
import { sendSuccess } from '../utils/response.js';
import APIError from '../utils/AppError.js';
import { uploadReelToCloudinary } from '../middlewares/upload.js';

const USER_FIELDS = 'username fullName avatar verified bio counts';
const MAX_REEL_SECONDS = 90;

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

const decorateReels = async (reels, viewerId) => {
  if (reels.length === 0) return reels;
  if (!viewerId) return reels.map((r) => ({ ...r, isLiked: false }));

  const ids = reels.map((r) => r._id);
  const likes = await Reaction.find({
    user: viewerId,
    targetType: 'reel',
    targetId: { $in: ids },
    emoji: 'like',
  }).select('targetId');

  const likedSet = new Set(likes.map((l) => String(l.targetId)));
  return reels.map((r) => ({ ...r, isLiked: likedSet.has(String(r._id)) }));
};

const createReel = async (req, res, next) => {
  try {
    const { caption, audioName, audioArtist } = req.body;
    if (!req.file) throw new APIError(400, 'A video file is required.');

    const uploaded = await uploadReelToCloudinary(req.file, 'nexus/reels');
    if (uploaded.duration > MAX_REEL_SECONDS) {
      throw new APIError(400, `Reel videos must be at most ${MAX_REEL_SECONDS} seconds long.`);
    }

    const audio =
      audioName || audioArtist
        ? {
            name: audioName || undefined,
            artist: audioArtist || undefined,
          }
        : undefined;

    const reel = await Reel.create({
      author: req.userId,
      video: { url: uploaded.url, thumbnail: uploaded.thumbnail },
      caption: caption || '',
      audio,
      tags: extractTags(caption),
      mentions: await findMentionedUsers(caption),
      durationSec: Math.round(uploaded.duration) || undefined,
    });

    const populated = await Reel.findById(reel._id).populate('author', USER_FIELDS);
    const [decorated] = await decorateReels([
      { ...populated.toReelJSON(), author: populated.author },
    ], req.userId);

    sendSuccess(res, 201, 'Reel published.', { reel: decorated });
  } catch (err) {
    next(err);
  }
};

const getReels = async (req, res, next) => {
  try {
    const { cursor, limit } = req.query;

    const pipe = [{ $match: { isDeleted: false } }];

    pipe.push({
      $addFields: {
        score: {
          $add: [
            { $multiply: ['$likesCount', 0.3] },
            { $multiply: ['$commentsCount', 0.15] },
            { $multiply: ['$sharesCount', 0.2] },
            { $multiply: ['$views', 0.05] },
            { $multiply: ['$plays', 0.02] },
          ],
        },
      },
    });

    if (cursor && cursor.includes('::')) {
      const [rawScore, rawId] = cursor.split('::');
      const score = Number(rawScore);
      const id = new mongoose.Types.ObjectId(rawId);
      pipe.push({
        $match: {
          $or: [{ score: { $lt: score } }, { score, _id: { $lt: id } }],
        },
      });
    }

    pipe.push(
      { $sort: { score: -1, _id: -1 } },
      { $limit: Number(limit) + 1 },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author',
        },
      },
      { $unwind: { path: '$author', preserveNullAndEmptyArrays: true } }
    );

    const rows = await Reel.aggregate(pipe);

    const hasMore = rows.length > Number(limit);
    const pageReels = hasMore ? rows.slice(0, Number(limit)) : rows;

    let nextCursor = null;
    if (pageReels.length) {
      const last = pageReels[pageReels.length - 1];
      nextCursor = `${last.score}::${last._id}`;
    }

    const decorated = await decorateReels(
      pageReels.map((r) => {
        const reel = { ...r };
        delete reel.score;
        return reel;
      }),
      req.userId
    );

    sendSuccess(res, 200, 'Reels feed retrieved.', {
      reels: decorated,
      pagination: { cursor: nextCursor, hasMore },
    });
  } catch (err) {
    next(err);
  }
};

const getReel = async (req, res, next) => {
  try {
    const reel = await Reel.findOne({ _id: req.params.id, isDeleted: false }).populate(
      'author',
      USER_FIELDS
    );
    if (!reel) throw new APIError(404, 'Reel not found.');

    reel.views += 1;
    await reel.save();

    const plain = reel.toReelJSON();
    plain.author = reel.author;
    const [decorated] = await decorateReels([plain], req.userId);

    sendSuccess(res, 200, 'Reel retrieved.', { reel: decorated });
  } catch (err) {
    next(err);
  }
};

const playReel = async (req, res, next) => {
  try {
    const reel = await Reel.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { $inc: { plays: 1 } },
      { new: true }
    );
    if (!reel) throw new APIError(404, 'Reel not found.');

    sendSuccess(res, 200, 'Reel play recorded.', { plays: reel.plays });
  } catch (err) {
    next(err);
  }
};

const deleteReel = async (req, res, next) => {
  try {
    const reel = await Reel.findOne({ _id: req.params.id, isDeleted: false });
    if (!reel) throw new APIError(404, 'Reel not found.');
    if (String(reel.author) !== String(req.userId)) {
      throw new APIError(403, 'You can only delete your own reels.');
    }

    reel.isDeleted = true;
    await reel.save();

    sendSuccess(res, 200, 'Reel deleted.', { deleted: true });
  } catch (err) {
    next(err);
  }
};

const likeReel = async (req, res, next) => {
  try {
    const reel = await Reel.findOne({ _id: req.params.id, isDeleted: false });
    if (!reel) throw new APIError(404, 'Reel not found.');

    const existing = await Reaction.findOne({
      user: req.userId,
      targetType: 'reel',
      targetId: reel._id,
    });

    if (existing && existing.emoji === 'like') {
      await existing.deleteOne();
      await Reel.updateOne(
        { _id: reel._id, likesCount: { $gt: 0 } },
        { $inc: { likesCount: -1 } }
      );
      return sendSuccess(res, 200, 'Reel unliked.', {
        liked: false,
        likesCount: Math.max(0, reel.likesCount - 1),
      });
    }

    if (existing) await existing.deleteOne();
    await Reaction.create({
      user: req.userId,
      targetType: 'reel',
      targetId: reel._id,
      emoji: 'like',
    });
    await Reel.updateOne({ _id: reel._id }, { $inc: { likesCount: 1 } });

    sendSuccess(res, 200, 'Reel liked.', { liked: true, likesCount: reel.likesCount + 1 });
  } catch (err) {
    next(err);
  }
};

const shareReel = async (req, res, next) => {
  try {
    const { recipients = [] } = req.body;

    const reel = await Reel.findOne({ _id: req.params.id, isDeleted: false });
    if (!reel) throw new APIError(404, 'Reel not found.');

    const recipientIds = [...new Set(recipients.map((r) => String(r)))].filter(
      (r) => mongoose.Types.ObjectId.isValid(r) && r !== String(req.userId)
    );

    if (recipientIds.length === 0) {
      await Reel.updateOne({ _id: reel._id }, { $inc: { sharesCount: 1 } });
      return sendSuccess(res, 200, 'Reel shared.', {
        sharesCount: reel.sharesCount + 1,
        recipientsShared: 0,
      });
    }

    const existing = await Share.find({
      sharer: req.userId,
      recipient: { $in: recipientIds },
      targetType: 'reel',
      targetId: reel._id,
    }).select('recipient');
    const alreadyShared = new Set(existing.map((s) => String(s.recipient)));

    const newShares = recipientIds
      .filter((r) => !alreadyShared.has(r))
      .map((r) => ({
        sharer: req.userId,
        recipient: r,
        targetType: 'reel',
        targetId: reel._id,
        targetModel: 'Reel',
      }));

    if (newShares.length) {
      await Share.insertMany(newShares);
      await Reel.updateOne({ _id: reel._id }, { $inc: { sharesCount: newShares.length } });
    }

    sendSuccess(res, 200, 'Reel shared.', {
      sharesCount: reel.sharesCount + newShares.length,
      recipientsShared: recipientIds.length,
      alreadyShared: recipientIds.length - newShares.length,
    });
  } catch (err) {
    next(err);
  }
};

const getSharedWithMe = async (req, res, next) => {
  try {
    const { cursor, limit = 20 } = req.query;

    const match = { recipient: req.userId, isDeleted: false };
    if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
      match.createdAt = { $lt: new mongoose.Types.ObjectId(cursor).getTimestamp() };
    }

    const rows = await Share.find(match)
      .sort({ createdAt: -1 })
      .limit(Number(limit) + 1)
      .populate('sharer', USER_FIELDS);

    const hasMore = rows.length > Number(limit);
    const pageShares = hasMore ? rows.slice(0, Number(limit)) : rows;

    const reelIds = pageShares.map((s) => s.targetId);
    const reels = await Reel.find({ _id: { $in: reelIds }, isDeleted: false })
      .populate('author', USER_FIELDS)
      .lean();

    const reelMap = new Map(reels.map((r) => [String(r._id), r]));
    const sharerMap = new Map(pageShares.map((s) => [String(s.targetId), s.sharer]));

    const sharedReels = reelIds
      .map((id) => {
        const reel = reelMap.get(String(id));
        if (!reel) return null;
        return {
          ...reel,
          sharedBy: sharerMap.get(String(id)) || null,
          isRead: pageShares.find((s) => String(s.targetId) === String(id))?.isRead ?? false,
        };
      })
      .filter(Boolean);

    const decorated = await decorateReels(sharedReels, req.userId);

    const nextCursor = pageShares.length
      ? String(pageShares[pageShares.length - 1]._id)
      : null;

    sendSuccess(res, 200, 'Shared reels retrieved.', {
      reels: decorated,
      pagination: { cursor: nextCursor, hasMore },
      unread: await Share.countDocuments({ recipient: req.userId, isRead: false, isDeleted: false }),
    });
  } catch (err) {
    next(err);
  }
};

const addReelComment = async (req, res, next) => {
  try {
    const { parent, content } = req.body;

    const reel = await Reel.findOne({ _id: req.params.id, isDeleted: false });
    if (!reel) throw new APIError(404, 'Reel not found.');

    if (parent) {
      const parentComment = await Comment.findOne({
        _id: parent,
        post: reel._id,
        targetType: 'reel',
      });
      if (!parentComment || parentComment.isDeleted) {
        throw new APIError(404, 'Parent comment not found.');
      }
    }

    const comment = await Comment.create({
      post: reel._id,
      targetType: 'reel',
      author: req.userId,
      parent: parent || null,
      content,
    });

    await Reel.updateOne({ _id: reel._id }, { $inc: { commentsCount: 1 } });

    const populated = await Comment.findById(comment._id).populate('author', USER_FIELDS);
    sendSuccess(res, 201, 'Comment added.', { comment: populated });
  } catch (err) {
    next(err);
  }
};

const getReelComments = async (req, res, next) => {
  try {
    const { cursor, limit } = req.query;
    const reel = await Reel.findOne({ _id: req.params.id, isDeleted: false });
    if (!reel) throw new APIError(404, 'Reel not found.');

    const query = {
      post: reel._id,
      targetType: 'reel',
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
    pageComments.forEach((c) => (c._doc.repliesCount = replyCountMap.get(String(c._id)) || 0));

    sendSuccess(res, 200, 'Comments retrieved.', {
      comments: pageComments,
      pagination: { cursor: nextCursor, hasMore },
    });
  } catch (err) {
    next(err);
  }
};

export {
  createReel,
  getReels,
  getReel,
  playReel,
  deleteReel,
  likeReel,
  shareReel,
  getSharedWithMe,
  addReelComment,
  getReelComments,
};