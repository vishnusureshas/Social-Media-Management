import { baseApi } from './baseApi';

export const reactionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    react: builder.mutation({
      query: ({ targetType, targetId, emoji }) => ({
        url: '/reactions',
        method: 'POST',
        body: { targetType, targetId, emoji },
      }),
      invalidatesTags: (_result, _err, arg) => [
        { type: 'Post', id: arg.postId || arg.targetId },
      ],
    }),
    removeReaction: builder.mutation({
      query: ({ id }) => ({ url: `/reactions/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _err, arg) => [
        { type: 'Post', id: arg.postId || arg.targetId },
      ],
    }),
    getReactionSummary: builder.query({
      query: ({ targetType, targetId }) => ({
        url: '/reactions/summary',
        method: 'GET',
        params: { targetType, targetId },
      }),
      providesTags: (_result, _err, arg) => [
        { type: 'Post', id: arg.postId || arg.targetId },
      ],
    }),
  }),
});

export const {
  useReactMutation,
  useRemoveReactionMutation,
  useGetReactionSummaryQuery,
} = reactionApi;