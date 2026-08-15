import { useGetConversationsQuery } from '../api/chatApi';

const useChatUnreadTotal = () => {
  const { data } = useGetConversationsQuery(undefined, {
    pollingInterval: 30000,
  });
  const total = (data?.data?.conversations || []).reduce((sum, c) => sum + (c.unread || 0), 0);
  return total;
};

export { useChatUnreadTotal };