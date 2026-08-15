import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { sendSuccess } from '../utils/response.js';
import APIError from '../utils/AppError.js';
import {
  assertCanDm,
  getOrCreateDirectConversation,
  createGroupConversation,
  getPopulatedConversation,
  getUnreadCount,
  markConversationRead,
} from '../services/chatService.js';

const USER_FIELDS = 'username fullName avatar verified bio counts';

const listConversations = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const conversations = await Conversation.find({ participants: req.userId })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('participants', USER_FIELDS)
      .populate({ path: 'lastMessage', populate: { path: 'sender', select: USER_FIELDS } });

    const total = await Conversation.countDocuments({ participants: req.userId });

    const data = await Promise.all(
      conversations.map(async (conversation) => {
        const unread = await getUnreadCount(req.userId, conversation._id);
        const me = String(req.userId);
        const peer =
          conversation.type === 'direct'
            ? conversation.participants.find((p) => String(p._id) !== me) || null
            : null;
        return { ...conversation.toObject(), unread, peer };
      })
    );

    sendSuccess(
      res,
      200,
      'Conversations retrieved.',
      { conversations: data },
      { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) }
    );
  } catch (err) {
    next(err);
  }
};

const createConversation = async (req, res, next) => {
  try {
    const { type, participant, participants, groupName } = req.body;

    if (type === 'direct') {
      if (!participant) throw new APIError(400, 'A participant is required for a direct message.');
      await assertCanDm(req.userId, participant);

      const { conversation, created } = await getOrCreateDirectConversation(req.userId, participant);
      const unread = await getUnreadCount(req.userId, conversation._id);
      sendSuccess(res, created ? 201 : 200, created ? 'Conversation created.' : 'Conversation already exists.', {
        conversation: { ...conversation.toObject(), unread },
      });
      return;
    }

    if (!participants || participants.length === 0) {
      throw new APIError(400, 'At least one participant is required for a group chat.');
    }
    if (!groupName) throw new APIError(400, 'A group name is required.');

    const conversation = await createGroupConversation(req.userId, participants, groupName);
    const unread = await getUnreadCount(req.userId, conversation._id);
    sendSuccess(res, 201, 'Group conversation created.', {
      conversation: { ...conversation.toObject(), unread },
    });
  } catch (err) {
    next(err);
  }
};

const getConversation = async (req, res, next) => {
  try {
    const conversation = await getPopulatedConversation(req.userId, req.params.id);
    const unread = await getUnreadCount(req.userId, conversation._id);
    sendSuccess(res, 200, 'Conversation retrieved.', {
      conversation: { ...conversation.toObject(), unread },
    });
  } catch (err) {
    next(err);
  }
};

const getMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cursor, limit = 50 } = req.query;

    const conversation = await Conversation.exists({ _id: id, participants: req.userId });
    if (!conversation) throw new APIError(404, 'Conversation not found.');

    const query = { conversation: id, deletedFor: { $ne: req.userId } };
    if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
      query._id = { $lt: new mongoose.Types.ObjectId(cursor) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1, _id: -1 })
      .limit(Number(limit) + 1)
      .populate('sender', USER_FIELDS);

    const hasMore = messages.length > Number(limit);
    const items = hasMore ? messages.slice(0, Number(limit)) : messages;

    let nextCursor = null;
    if (items.length) nextCursor = String(items[items.length - 1]._id);

    sendSuccess(res, 200, 'Messages retrieved.', {
      messages: items,
      pagination: { cursor: nextCursor, hasMore },
    });
  } catch (err) {
    next(err);
  }
};

const markRead = async (req, res, next) => {
  try {
    const { unread } = await markConversationRead(req.userId, req.params.id);
    sendSuccess(res, 200, 'Conversation marked as read.', {
      read: true,
      unread,
    });
  } catch (err) {
    next(err);
  }
};

export { listConversations, createConversation, getConversation, getMessages, markRead };