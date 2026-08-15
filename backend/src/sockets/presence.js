import User from '../models/User.js';

const PRESENCE_ROOM = 'presence';
const online = new Map();

const registerPresenceHandlers = (io, socket) => {
  const userId = String(socket.userId);
  socket.userId = userId;

  const previous = online.get(userId);
  online.set(userId, (previous || 0) + 1);
  socket.join(PRESENCE_ROOM);

  socket.on('presence:subscribe', () => {
    socket.join(PRESENCE_ROOM);
  });

  if (previous === undefined) {
    io.to(PRESENCE_ROOM).emit('presence:update', {
      userId,
      online: true,
      lastSeen: null,
    });
  }

  socket.on('disconnect', async () => {
    const remaining = (online.get(userId) || 1) - 1;
    if (remaining <= 0) {
      online.delete(userId);
      const lastSeen = new Date();
      User.updateOne({ _id: userId }, { $set: { lastSeen } }).catch(() => {});
      io.to(PRESENCE_ROOM).emit('presence:update', {
        userId,
        online: false,
        lastSeen: lastSeen.toISOString(),
      });
    } else {
      online.set(userId, remaining);
    }
  });
};

export const getOnlineUsers = () => [...online.keys()];

export default registerPresenceHandlers;