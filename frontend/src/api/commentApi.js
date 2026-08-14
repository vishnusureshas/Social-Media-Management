import { baseApi } from './baseApi';

export const commentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPostComments: builder.query({
      query: ({ postId, cursor, limit = 20 } = {}) => ({
        url: `/posts/${postId}/comments`,
        method: 'GET',
        params: { cursor: cursor || undefined, limit },
      }),
      providesTags: (_result, _err, arg) => [{ type: 'Post', id: arg.postId }],
    }),
    addComment: builder.mutation({
      query: (body) => ({ url: '/comments', method: 'POST', body }),
      invalidatesTags: (_result, _err, arg) => [{ type: 'Post', id: arg.post }],
    }),
    getCommentReplies: builder.query({
      query: ({ id, cursor, limit = 20 }) => ({
        url: `/comments/${id}/replies`,
        method: 'GET',
        params: { cursor: cursor || undefined, limit },
      }),
    }),
    updateComment: builder.mutation({
      query: ({ id, body }) => ({ url: `/comments/${id}`, method: 'PATCH', body }),
      invalidatesTags: (_result, _err, arg) => [{ type: 'Post', id: arg.post }],
    }),
    deleteComment: builder.mutation({
      query: (arg) => ({ url: `/comments/${arg.id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _err, arg) => [{ type: 'Post', id: arg.post }],
    }),
    likeComment: builder.mutation({
      query: (id) => ({ url: `/comments/${id}/like`, method: 'POST' }),
    }),
  }),
});

export const {
  useGetPostCommentsQuery,
  useAddCommentMutation,
  useGetCommentRepliesQuery,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useLikeCommentMutation,
} = commentApi;