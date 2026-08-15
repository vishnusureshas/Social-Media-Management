import { baseApi } from './baseApi';

export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getConversations: builder.query({
      query: ({ page = 1, limit = 20 } = {}) => ({
        url: '/chat/conversations',
        method: 'GET',
        params: { page, limit },
      }),
      providesTags: ['Conversations'],
    }),
    getConversation: builder.query({
      query: (id) => ({ url: `/chat/conversations/${id}`, method: 'GET' }),
      providesTags: (_result, _error, id) => [{ type: 'Conversation', id }],
    }),
    createConversation: builder.mutation({
      query: (body) => ({ url: '/chat/conversations', method: 'POST', body }),
      invalidatesTags: ['Conversations'],
    }),
    getMessages: builder.query({
      query: ({ id, cursor, limit = 50 } = {}) => ({
        url: `/chat/conversations/${id}/messages`,
        method: 'GET',
        params: { cursor: cursor || undefined, limit },
      }),
      providesTags: (_result, _error, arg) => [{ type: 'Messages', id: arg?.id }],
    }),
    markRead: builder.mutation({
      query: (id) => ({ url: `/chat/conversations/${id}/read`, method: 'PUT' }),
      invalidatesTags: ['Conversations'],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useGetConversationQuery,
  useCreateConversationMutation,
  useGetMessagesQuery,
  useMarkReadMutation,
} = chatApi;