import User from '../models/User.js';
import Follow from '../models/FollowModel.js';
import Block from '../models/BlockModel.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import APIError from '../utils/AppError.js';

const USER_FIELDS = 'username fullName avatar verified bio counts';

export const userFields = USER_FIELDS;

const hasBlockEdge = async (a, b) =>
  Block.exists({
    $or: [
      { blocker: a, blocked: b },
      { blocker: b, blocked: a },
    ],
  });

const assertCanDm = async (senderId, recipientId) => {
  if (String(senderId) === String(recipientId)) {
    throw new APIError(400, 'You cannot message yourself.');
  }

  const recipient = await User.findById(recipientId).select('privacy isActive isBanned');
  if (!recipient || !recipient.isActive || recipient.isBanned) {
    throw new APIError(404, 'User not found.');
  }

  if (await hasBlockEdge(senderId, recipientId)) {
    throw new APIError(403, 'You cannot send a message to this user.');
  }

  const policy = recipient.privacy?.messages || 'everyone';
  if (policy === 'nobody') {
    throw new APIError(403, 'This user does not accept direct messages.');
  }
  if (policy === 'followers') {
    const allowed = await Follow.exists({ follower: senderId, following: recipientId });
    if (!allowed) {
      throw new APIError(403, 'This user only accepts messages from their followers.');
    }
  }
};

const getOrCreateDirectConversation = async (userId, participant) => {
  const pair = [userId, participant].map(String).sort();
  const existing = await Conversation.findOne({
    type: 'direct',
    participants: { $all: pair, $size: 2 },
  })
    .populate('participants', USER_FIELDS)
    .populate({ path: 'lastMessage', populate: { path: 'sender', select: USER_FIELDS } });

  if (existing) return { conversation: existing, created: false };

  const conversation = await Conversation.create({
    type: 'direct',
    participants: pair,
  });
  const populated = await Conversation.populate(conversation, [
    { path: 'participants', select: USER_FIELDS },
    { path: 'lastMessage', populate: { path: 'sender', select: USER_FIELDS } },
  ]);
  return { conversation: populated, created: true };
};

const createGroupConversation = async (userId, participantIds, groupName) => {
  const members = [...new Set(participantIds.map(String))];
  if (members.length < 1) throw new APIError(400, 'At least one participant is required.');

  const users = await User.find({ _id: { $in: members }, isActive: true, isBanned: false }).select('_id');
  if (users.length !== members.length) {
    throw new APIError(400, 'One or more participants do not exist.');
  }

  for (const member of members) {
    if (await hasBlockEdge(userId, member)) {
      throw new APIError(400, 'You cannot add a blocked user to a group chat.');
    }
  }

  const conversation = await Conversation.create({
    type: 'group',
    participants: [String(userId), ...members],
    groupName,
    admin: userId,
  });

  const populated = await Conversation.populate(conversation, [
    { path: 'participants', select: USER_FIELDS },
    { path: 'lastMessage', populate: { path: 'sender', select: USER_FIELDS } },
  ]);
  return populated;
};

const getPopulatedConversation = async (userId, conversationId) => {
  const conversation = await Conversation.findOne({ _id: conversationId, participants: userId })
    .populate('participants', USER_FIELDS)
    .populate({ path: 'lastMessage', populate: { path: 'sender', select: USER_FIELDS } });

  if (!conversation) throw new APIError(404, 'Conversation not found.');

  for (const participant of conversation.participants) {
    if (String(participant._id) === String(userId)) continue;
    if (await hasBlockEdge(userId, participant._id)) {
      throw new APIError(403, 'You cannot access this conversation.');
    }
  }
  return conversation;
};

const sendMessage = async ({ conversationId, senderId, content, media }) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: senderId,
  }).select('participants');
  if (!conversation) throw new APIError(404, 'Conversation not found.');

  for (const participant of conversation.participants) {
    if (String(participant) === String(senderId)) continue;
    if (await hasBlockEdge(senderId, participant)) {
      throw new APIError(403, 'You cannot send a message in this conversation.');
    }
  }

  const text = typeof content === 'string' ? content.trim() : '';
  const mediaArr = Array.isArray(media) ? media : [];

  if (!text && mediaArr.length === 0) {
    throw new APIError(400, 'A message requires content or media.');
  }
  if (text.length > 4000) throw new APIError(400, 'Message cannot exceed 4000 characters.');
  if (mediaArr.length > 10) throw new APIError(400, 'A message cannot include more than 10 media items.');

  const type = mediaArr.length > 0 ? (mediaArr[0].mediaType === 'image' ? 'image' : 'video') : 'text';

  const message = await Message.create({
    conversation: conversationId,
    sender: senderId,
    content: text || undefined,
    media: mediaArr,
    type,
    readBy: [senderId],
  });

  conversation.lastMessage = message._id;
  await conversation.save();

  const populated = await Message.populate(message, { path: 'sender', select: USER_FIELDS });
  return populated;
};

const markConversationRead = async (userId, conversationId) => {
  const conversation = await Conversation.findOne({ _id: conversationId, participants: userId });
  if (!conversation) throw new APIError(404, 'Conversation not found.');

  await Message.updateMany(
    { conversation: conversationId, sender: { $ne: userId }, readBy: { $ne: userId } },
    { $addToSet: { readBy: userId } }
  );

  const unread = await getUnreadCount(userId, conversationId);
  return { unread };
};

const getUnreadCount = async (userId, conversationId) =>
  Message.countDocuments({
    conversation: conversationId,
    sender: { $ne: userId },
    readBy: { $ne: userId },
    deletedFor: { $ne: userId },
  });

const conversationRoom = (id) => `conversation:${id}`;

export {
  assertCanDm,
  getOrCreateDirectConversation,
  createGroupConversation,
  getPopulatedConversation,
  getUnreadCount,
  sendMessage,
  markConversationRead,
  conversationRoom,
  hasBlockEdge,
};