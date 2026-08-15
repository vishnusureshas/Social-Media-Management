import { useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { connectChatSocket, disconnectChatSocket, chatEmit } from '../utils/chatSocket';
import { setActiveConversation, pushMessage, markRead, setTyping, setPresence } from '../store/slices/messagesSlice';
import { useAuth } from './useAuth';

const useChatSocket = () => {
  const { isAuthenticated, accessToken } = useAuth();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return undefined;

    const handleEvent = (event, payload) => {
      switch (event) {
        case 'message:new':
          dispatch(pushMessage(payload));
          break;
        case 'message:read':
          dispatch(markRead(payload));
          break;
        case 'message:typing':
          dispatch(setTyping(payload));
          break;
        case 'presence:update':
          dispatch(setPresence(payload));
          break;
        default:
          break;
      }
    };

    connectChatSocket(accessToken, handleEvent);

    return () => disconnectChatSocket(handleEvent);
  }, [isAuthenticated, accessToken, dispatch]);

  const joinConversation = useCallback((conversationId) => {
    dispatch(setActiveConversation(conversationId));
    chatEmit('conversation:join', { conversationId });
  }, [dispatch]);

  const leaveConversation = useCallback(() => {
    dispatch(setActiveConversation(null));
  }, [dispatch]);

  const sendMessage = useCallback((conversationId, content, media = []) => {
    return new Promise((resolve, reject) => {
      chatEmit('message:send', { conversationId, content, media }, (res) => {
        if (res?.success) resolve(res);
        else reject(new Error(res?.message || 'Failed to send message.'));
      });
    });
  }, []);

  const emitTyping = useCallback((conversationId, isTyping) => {
    chatEmit('message:typing', { conversationId, isTyping });
  }, []);

  const emitRead = useCallback((conversationId, messageIds = []) => {
    chatEmit('message:read', { conversationId, messageIds });
  }, []);

  return {
    joinConversation,
    leaveConversation,
    sendMessage,
    emitTyping,
    emitRead,
  };
};

export default useChatSocket;