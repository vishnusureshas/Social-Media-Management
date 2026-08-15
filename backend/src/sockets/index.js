import Conversation from '../models/Conversation.js';
import socketAuth from './auth.js';
import registerChatHandlers from './chat.js';
import registerPresenceHandlers from './presence.js';
import { conversationRoom } from '../services/chatService.js';

const initSocket = (io) => {
  io.use(socketAuth);

  io.on('connection', async (socket) => {
    try {
      const conversations = await Conversation.find({
        participants: socket.userId,
      })
        .select('_id')
        .lean();

      conversations.forEach((conversation) => {
        socket.join(conversationRoom(conversation._id));
      });
    } catch {
      /* room join is best-effort; sockets can rejoin on demand */
    }

    registerChatHandlers(io, socket);
    registerPresenceHandlers(io, socket);

    socket.on('disconnect', () => {
      // presence handler already broadcasts offline; nothing else needed.
    });
  });
};

export default initSocket;