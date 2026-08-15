import mongoose from 'mongoose';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { sendMessage, markConversationRead, conversationRoom } from '../services/chatService.js';

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const isMember = async (userId, conversationId) =>
  Boolean(
    await Conversation.exists({
      _id: conversationId,
      participants: userId,
    })
  );

const registerChatHandlers = (io, socket) => {
  const userId = socket.userId;

  socket.on('conversation:join', async (payload = {}, ack) => {
    try {
      const { conversationId } = payload;
      if (!isValidId(conversationId)) return;
      if (!(await isMember(userId, conversationId))) return;
      socket.join(conversationRoom(conversationId));
      if (typeof ack === 'function') ack({ success: true });
    } catch {
      /* joining a room is best-effort */
    }
  });

  socket.on('message:send', async (payload = {}, ack) => {
    const sendError = (message) => {
      if (typeof ack === 'function') ack({ success: false, message });
      else socket.emit('chat:error', { event: 'message:send', message });
    };

    try {
      const { conversationId, content, media } = payload;
      if (!isValidId(conversationId)) return sendError('Invalid conversation.');
      if (!(await isMember(userId, conversationId))) return sendError('Conversation not found.');
      if (!content && !(media && media.length)) return sendError('A message requires content or media.');

      const message = await sendMessage({ conversationId, senderId: userId, content, media });
      io.to(conversationRoom(conversationId)).emit('message:new', {
        conversationId,
        message,
      });
      if (typeof ack === 'function') ack({ success: true, message });
    } catch (err) {
      sendError(err.message || 'Failed to send message.');
    }
  });

  socket.on('message:typing', async (payload = {}, ack) => {
    try {
      const { conversationId, isTyping } = payload;
      if (!isValidId(conversationId)) return;
      if (!(await isMember(userId, conversationId))) return;

      socket.to(conversationRoom(conversationId)).emit('message:typing', {
        conversationId,
        userId: String(userId),
        isTyping: Boolean(isTyping),
      });
      if (typeof ack === 'function') ack({ success: true });
    } catch {
      /* typing is best-effort */
    }
  });

  socket.on('message:read', async (payload = {}, ack) => {
    const sendError = (message) => {
      if (typeof ack === 'function') ack({ success: false, message });
    };

    try {
      const { conversationId, messageIds } = payload;
      if (!isValidId(conversationId)) return sendError('Invalid conversation.');
      if (!(await isMember(userId, conversationId))) return sendError('Conversation not found.');

      if (Array.isArray(messageIds) && messageIds.length > 0) {
        const validIds = messageIds.filter(isValidId);
        await Message.updateMany(
          { _id: { $in: validIds }, conversation: conversationId, sender: { $ne: userId } },
          { $addToSet: { readBy: userId } }
        );
        io.to(conversationRoom(conversationId)).emit('message:read', {
          conversationId,
          userId: String(userId),
          messageIds: validIds,
        });
      } else {
        await markConversationRead(userId, conversationId);
        io.to(conversationRoom(conversationId)).emit('message:read', {
          conversationId,
          userId: String(userId),
          all: true,
        });
      }

      if (typeof ack === 'function') ack({ success: true });
    } catch (err) {
      sendError(err.message || 'Failed to mark read.');
    }
  });

  return () => {};
};

export default registerChatHandlers;