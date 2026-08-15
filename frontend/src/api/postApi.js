import { baseApi } from './baseApi';

export const postApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeed: builder.query({
      query: ({ cursor, limit = 20 } = {}) => ({
        url: '/posts',
        method: 'GET',
        params: { cursor: cursor || undefined, limit },
      }),
      providesTags: ['Feed'],
    }),
    getExplore: builder.query({
      query: ({ cursor, limit = 20 } = {}) => ({
        url: '/posts/explore',
        method: 'GET',
        params: { cursor: cursor || undefined, limit },
      }),
      providesTags: ['Explore'],
    }),
    getSavedList: builder.query({
      query: ({ cursor, limit = 20 } = {}) => ({
        url: '/posts/saved',
        method: 'GET',
        params: { cursor: cursor || undefined, limit },
      }),
      providesTags: ['Saved'],
    }),
    getUserPosts: builder.query({
      query: ({ username, cursor, limit = 20 }) => ({
        url: `/users/${username}/posts`,
        method: 'GET',
        params: { cursor: cursor || undefined, limit },
      }),
      providesTags: ['Profile'],
    }),
    getPost: builder.query({
      query: (id) => ({ url: `/posts/${id}`, method: 'GET' }),
      providesTags: (_result, _err, id) => [{ type: 'Post', id }],
    }),
    getPostsByTag: builder.query({
      query: ({ hashtag, cursor, limit = 20 }) => ({
        url: `/posts/tag/${hashtag}`,
        method: 'GET',
        params: { cursor: cursor || undefined, limit },
      }),
      providesTags: ['Hashtag'],
    }),
    getTrending: builder.query({
      query: () => ({ url: '/posts/trending', method: 'GET' }),
      providesTags: ['Hashtag'],
    }),
    createPost: builder.mutation({
      query: (formData) => ({ url: '/posts', method: 'POST', body: formData }),
      invalidatesTags: ['Post', 'Feed', 'Explore', 'Hashtag', 'Profile'],
    }),
    updatePost: builder.mutation({
      query: ({ id, body }) => ({ url: `/posts/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Post', 'Feed', 'Explore', 'Hashtag'],
    }),
    deletePost: builder.mutation({
      query: (id) => ({ url: `/posts/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Post', 'Feed', 'Explore', 'Hashtag', 'Profile'],
    }),
    likePost: builder.mutation({
      query: (id) => ({ url: `/posts/${id}/like`, method: 'POST' }),
      invalidatesTags: (_result, _err, id) => [{ type: 'Post', id }],
    }),
    sharePost: builder.mutation({
      query: ({ id, content = '' }) => ({
        url: `/posts/${id}/share`,
        method: 'POST',
        body: { content },
      }),
      invalidatesTags: ['Post', 'Feed', 'Profile'],
    }),
    savePost: builder.mutation({
      query: (id) => ({ url: `/posts/${id}/save`, method: 'POST' }),
      invalidatesTags: (_result, _err, id) => [
        { type: 'Post', id },
        { type: 'Saved' },
      ],
    }),
    getPostLikes: builder.query({
      query: ({ id, cursor, limit = 20 }) => ({
        url: `/posts/${id}/likes`,
        method: 'GET',
        params: { cursor: cursor || undefined, limit },
      }),
    }),
  }),
});

export const {
  useGetFeedQuery,
  useGetExploreQuery,
  useGetSavedListQuery,
  useGetUserPostsQuery,
  useGetPostQuery,
  useGetPostsByTagQuery,
  useGetTrendingQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useLikePostMutation,
  useSharePostMutation,
  useSavePostMutation,
  useGetPostLikesQuery,
} = postApi;

export const postApiEndpoints = postApi.endpoints;