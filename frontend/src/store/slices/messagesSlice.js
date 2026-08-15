import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  presence: {}, // { [userId]: { online, lastSeen } }
  typing: {}, // { [conversationId]: [userId, ...] }
  threads: {}, // { [conversationId]: Message[] } optimistic/streamed messages
  activeConversation: null,
};

const upsertMessage = (messages, message) => {
  const existing = messages.find((m) => String(m._id) === String(message._id));
  if (existing) {
    return messages.map((m) => (String(m._id) === String(message._id) ? message : m));
  }
  return [...messages, message];
};

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setActiveConversation(state, { payload }) {
      state.activeConversation = payload;
      if (payload) state.typing[payload] = [];
    },
    pushMessage(state, { payload }) {
      const { conversationId, message } = payload;
      if (!state.threads[conversationId]) state.threads[conversationId] = [];
      state.threads[conversationId] = upsertMessage(state.threads[conversationId], message);
    },
    sendOptimistic(state, { payload }) {
      const { conversationId, message } = payload;
      if (!state.threads[conversationId]) state.threads[conversationId] = [];
      state.threads[conversationId] = upsertMessage(state.threads[conversationId], message);
    },
    markRead(state, { payload }) {
      const { conversationId, userId, messageIds, all } = payload;
      const thread = state.threads[conversationId];
      if (!thread) return;
      state.threads[conversationId] = thread.map((m) => {
        const isMine = String(m.sender?._id || m.sender) === String(userId);
        if (isMine) return m;
        const shouldMark =
          all || (Array.isArray(messageIds) && messageIds.some((id) => String(id) === String(m._id)));
        if (!shouldMark || m.readBy?.some((r) => String(r) === String(userId))) return m;
        return { ...m, readBy: [...(m.readBy || []), userId] };
      });
    },
    setTyping(state, { payload }) {
      const { conversationId, userId, isTyping } = payload;
      if (!state.typing[conversationId]) state.typing[conversationId] = [];
      const list = state.typing[conversationId];
      const idx = list.indexOf(userId);
      if (isTyping && idx === -1) {
        state.typing[conversationId] = [...list, userId];
      } else if (!isTyping && idx !== -1) {
        state.typing[conversationId] = list.filter((id) => id !== userId);
      }
    },
    setPresence(state, { payload }) {
      state.presence[payload.userId] = {
        online: payload.online,
        lastSeen: payload.lastSeen,
      };
    },
    resetMessages(state) {
      state.threads = {};
    },
  },
});

export const {
  setActiveConversation,
  pushMessage,
  sendOptimistic,
  markRead,
  setTyping,
  setPresence,
  resetMessages,
} = messagesSlice.actions;

export default messagesSlice.reducer;