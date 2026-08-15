import { baseApi } from './baseApi';

export const reelApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReels: builder.query({
      query: ({ cursor, limit = 20 } = {}) => ({
        url: '/reels',
        method: 'GET',
        params: { cursor: cursor || undefined, limit },
      }),
      providesTags: ['Reels'],
    }),
    getSharedReels: builder.query({
      query: ({ cursor, limit = 20 } = {}) => ({
        url: '/reels/shared-with-me',
        method: 'GET',
        params: { cursor: cursor || undefined, limit },
      }),
      providesTags: [{ type: 'SharedReels' }],
    }),
    getReel: builder.query({
      query: (id) => ({ url: `/reels/${id}`, method: 'GET' }),
      providesTags: (_result, _err, id) => [{ type: 'Reel', id }],
    }),
    createReel: builder.mutation({
      query: (formData) => ({ url: '/reels', method: 'POST', body: formData }),
      invalidatesTags: ['Reels', 'Profile'],
    }),
    deleteReel: builder.mutation({
      query: (id) => ({ url: `/reels/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Reels', 'Profile'],
    }),
    likeReel: builder.mutation({
      query: (id) => ({ url: `/reels/${id}/like`, method: 'POST' }),
      invalidatesTags: (_result, _err, id) => [{ type: 'Reel', id }],
    }),
    shareReel: builder.mutation({
      query: ({ id, recipients }) => ({
        url: `/reels/${id}/share`,
        method: 'POST',
        body: { recipients },
      }),
      invalidatesTags: (_result, _err, arg) => [
        { type: 'Reel', id: arg?.id },
        { type: 'SharedReels' },
        'Reels',
      ],
    }),
    playReel: builder.mutation({
      query: (id) => ({ url: `/reels/${id}/play`, method: 'POST' }),
      invalidatesTags: (_result, _err, id) => [{ type: 'Reel', id }],
    }),
    getReelComments: builder.query({
      query: ({ id, cursor, limit = 20 } = {}) => ({
        url: `/reels/${id}/comments`,
        method: 'GET',
        params: { cursor: cursor || undefined, limit },
      }),
      providesTags: (_result, _err, arg) => [{ type: 'Reel', id: arg?.id }],
    }),
    addReelComment: builder.mutation({
      query: ({ id, body }) => ({
        url: `/reels/${id}/comments`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _err, arg) => [{ type: 'Reel', id: arg?.id }],
    }),
  }),
});

export const {
  useGetReelsQuery,
  useGetSharedReelsQuery,
  useGetReelQuery,
  useCreateReelMutation,
  useDeleteReelMutation,
  useLikeReelMutation,
  useShareReelMutation,
  usePlayReelMutation,
  useGetReelCommentsQuery,
  useAddReelCommentMutation,
} = reelApi;