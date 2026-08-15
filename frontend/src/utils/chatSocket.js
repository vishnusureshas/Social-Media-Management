import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || '/';

let socket = null;
let token = null;
const listeners = [];

const notifyListeners = (event, payload) => {
  listeners.forEach((l) => l(event, payload));
};

export const getChatSocket = () => socket;

export const connectChatSocket = (accessToken, onEvent) => {
  if (onEvent && !listeners.includes(onEvent)) listeners.push(onEvent);

  if (!accessToken) return null;

  if (socket && token === accessToken) return socket;

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  token = accessToken;
  socket = io(SOCKET_URL, {
    auth: { token: accessToken },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    socket.emit('presence:subscribe');
  });

  const wireEvent = (event) => {
    socket.on(event, (payload) => notifyListeners(event, payload));
  };
  ['message:new', 'message:read', 'message:typing', 'presence:update'].forEach(wireEvent);

  return socket;
};

export const disconnectChatSocket = (onEvent) => {
  const idx = listeners.indexOf(onEvent);
  if (idx !== -1) listeners.splice(idx, 1);
  if (listeners.length === 0 && socket) {
    socket.disconnect();
    socket = null;
    token = null;
  }
};

export const chatEmit = (event, payload, ack) => {
  if (!socket) {
    if (ack) ack({ success: false, message: 'Socket not connected.' });
    return;
  }
  socket.emit(event, payload, ack);
};