import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import { sendSuccess } from '../utils/response.js';
import APIError from '../utils/AppError.js';
import { getMutedIds } from '../utils/suppression.js';

const USER_FIELDS = 'username fullName avatar verified bio counts';

const getNotifications = async (req, res, next) => {
  try {
    const { cursor, limit = 20 } = req.query;

    const suppressed = await getMutedIds(req.userId, 'notifications');

    const match = { recipient: req.userId };
    if (suppressed.length) match.actor = { $nin: suppressed };
    if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
      match._id = { $lt: new mongoose.Types.ObjectId(cursor) };
    }

    const rows = await Notification.find(match)
      .sort({ createdAt: -1, _id: -1 })
      .limit(Number(limit) + 1)
      .populate('actor', USER_FIELDS);

    const hasMore = rows.length > Number(limit);
    const items = hasMore ? rows.slice(0, Number(limit)) : rows;

    let nextCursor = null;
    if (items.length) nextCursor = String(items[items.length - 1]._id);

    sendSuccess(res, 200, 'Notifications retrieved.', {
      notifications: items,
      pagination: { cursor: nextCursor, hasMore },
    });
  } catch (err) {
    next(err);
  }
};

const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.userId,
      read: false,
    });
    sendSuccess(res, 200, 'Unread count retrieved.', { count });
  } catch (err) {
    next(err);
  }
};

const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.userId, read: false },
      { $set: { read: true, seenAt: new Date() } }
    );
    sendSuccess(res, 200, 'All notifications marked as read.', { marked: true });
  } catch (err) {
    next(err);
  }
};

const markOneRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.userId,
    });
    if (!notification) throw new APIError(404, 'Notification not found.');

    notification.read = true;
    notification.seenAt = new Date();
    await notification.save();

    sendSuccess(res, 200, 'Notification marked as read.', { notification });
  } catch (err) {
    next(err);
  }
};

export { getNotifications, getUnreadCount, markAllRead, markOneRead };