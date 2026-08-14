import mongoose from 'mongoose';
import Story from '../models/Story.js';
import Follow from '../models/FollowModel.js';
import User from '../models/User.js';
import { sendSuccess } from '../utils/response.js';
import APIError from '../utils/AppError.js';
import { uploadMediaToCloudinary } from '../middlewares/upload.js';

const USER_FIELDS = 'username fullName avatar verified bio counts';

const extractMentions = (text = '') => {
  const matches = text.match(/@[a-zA-Z0-9_]+/g) || [];
  return [...new Set(matches.map((m) => m.slice(1).toLowerCase()))];
};

const findMentionedUsers = async (text) => {
  const usernames = extractMentions(text);
  if (usernames.length === 0) return [];
  const users = await User.find({ username: { $in: usernames } }).select('_id');
  return users.map((u) => u._id);
};

const extractTags = (text = '') => {
  const matches = text.match(/#[a-zA-Z0-9_]+/g) || [];
  return [...new Set(matches.map((t) => t.slice(1).toLowerCase()))];
};

const createStory = async (req, res, next) => {
  try {
    const { text, bgColor, mentions } = req.body;
    const files = req.files || [];

    if ((!text || !text.trim()) && files.length === 0) {
      throw new APIError(400, 'Story must have text or at least one media file.');
    }

    let media = [];
    if (files.length > 0) {
      media = await Promise.all(
        files.map(async (f) => {
          const uploaded = await uploadMediaToCloudinary(f, 'nexus/stories');
          return {
            url: uploaded.url,
            mediaType: uploaded.type,
            thumb: uploaded.thumb,
          };
        })
      );
    }

    const story = await Story.create({
      author: req.userId,
      text: text || '',
      bgColor: bgColor || undefined,
      media,
      mentions: mentions || (await findMentionedUsers(text)),
      tags: extractTags(text),
    });

    await User.updateOne({ _id: req.userId }, { $inc: { 'counts.stories': 1 } });

    const populated = await Story.findById(story._id).populate('author', USER_FIELDS);
    sendSuccess(res, 201, 'Story created.', { story: populated });
  } catch (err) {
    next(err);
  }
};

const getActiveStories = async (req, res, next) => {
  try {
    const { cursor, limit } = req.query;

    const following = await Follow.find({ follower: req.userId }).distinct('following');
    const authorIds = [
      req.userId,
      ...following.map((id) => new mongoose.Types.ObjectId(id)),
    ];

    const query = {
      author: { $in: authorIds },
      isActive: true,
      expiresAt: { $gt: new Date() },
      ...(cursor ? { _id: { $lt: new mongoose.Types.ObjectId(cursor) } } : {}),
    };

    const stories = await Story.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .populate('author', USER_FIELDS);

    const byAuthor = new Map();
    for (const story of stories) {
      const key = String(story.author._id || story.author);
      if (!byAuthor.has(key)) byAuthor.set(key, []);
      byAuthor.get(key).push(story);
    }

    const authors = [...byAuthor.values()].map((items) => ({
      user: items[0].author,
      stories: items,
    }));

    const hasMore = authors.length === Number(limit);
    const nextCursor = stories.length ? String(stories[stories.length - 1]._id) : null;

    sendSuccess(res, 200, 'Active stories retrieved.', {
      authors,
      pagination: { cursor: nextCursor, hasMore },
    });
  } catch (err) {
    next(err);
  }
};

const getStory = async (req, res, next) => {
  try {
    const story = await Story.findOne({ _id: req.params.id }).populate('author', USER_FIELDS);
    if (!story || !story.isActive || story.expiresAt < new Date()) {
      throw new APIError(404, 'Story not found or expired.');
    }

    const viewerIdStr = String(req.userId);
    const alreadyViewed = story.viewers.some((v) => String(v) === viewerIdStr);

    if (!alreadyViewed) {
      await Story.updateOne(
        { _id: story._id, viewers: { $ne: req.userId } },
        { $addToSet: { viewers: req.userId }, $inc: { viewCount: 1 } }
      );
      story.viewers.push(req.userId);
      story.viewCount += 1;
    }

    const json = story.toObject();
    json.viewedByViewer = alreadyViewed;
    delete json.viewers;
    sendSuccess(res, 200, 'Story retrieved.', { story: json });
  } catch (err) {
    next(err);
  }
};

const deleteStory = async (req, res, next) => {
  try {
    const story = await Story.findOne({ _id: req.params.id });
    if (!story) throw new APIError(404, 'Story not found.');
    if (String(story.author) !== String(req.userId)) {
      throw new APIError(403, 'You can only delete your own stories.');
    }

    story.isActive = false;
    await story.save();

    await User.updateOne(
      { _id: req.userId, 'counts.stories': { $gt: 0 } },
      { $inc: { 'counts.stories': -1 } }
    );

    sendSuccess(res, 200, 'Story deleted.', { deleted: true });
  } catch (err) {
    next(err);
  }
};

const getStoryViewers = async (req, res, next) => {
  try {
    const story = await Story.findOne({ _id: req.params.id });
    if (!story) throw new APIError(404, 'Story not found.');
    if (String(story.author) !== String(req.userId)) {
      throw new APIError(403, 'You can only view your own story analytics.');
    }

    const { cursor, limit } = req.query;

    const query = {
      _id: { $in: story.viewers },
      ...(cursor ? { _id: { $lt: new mongoose.Types.ObjectId(cursor) } } : {}),
    };

    const viewers = await User.find(query).sort({ _id: -1 }).limit(Number(limit));
    const hasMore = viewers.length === Number(limit);
    const nextCursor = viewers.length ? String(viewers[viewers.length - 1]._id) : null;

    sendSuccess(res, 200, 'Story viewers retrieved.', {
      viewers,
      pagination: { cursor: nextCursor, hasMore },
    });
  } catch (err) {
    next(err);
  }
};

export { createStory, getActiveStories, getStory, deleteStory, getStoryViewers };