import { baseApi } from './baseApi';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: (username) => ({ url: `/users/${username}`, method: 'GET' }),
      providesTags: (_result, _err, username) => [{ type: 'Profile', id: username }],
    }),
    updateProfile: builder.mutation({
      query: (body) => ({ url: '/users/profile', method: 'PATCH', body }),
      invalidatesTags: (result) => [
        { type: 'Profile', id: result?.data?.user?.username },
        { type: 'Auth' },
      ],
    }),
    uploadAvatar: builder.mutation({
      query: (formData) => ({ url: '/users/avatar', method: 'POST', body: formData }),
      invalidatesTags: (result) => [
        { type: 'Profile', id: result?.data?.user?.username },
        { type: 'Auth' },
      ],
    }),
    uploadCover: builder.mutation({
      query: (formData) => ({ url: '/users/cover', method: 'POST', body: formData }),
      invalidatesTags: (result) => [
        { type: 'Profile', id: result?.data?.user?.username },
        { type: 'Auth' },
      ],
    }),
    followUser: builder.mutation({
      query: (username) => ({ url: `/users/${username}/follow`, method: 'POST' }),
      invalidatesTags: (result, _err, username) => [
        { type: 'Profile', id: username },
        { type: 'Followers' },
        { type: 'Following' },
        { type: 'Suggestions' },
      ],
    }),
    unfollowUser: builder.mutation({
      query: (username) => ({ url: `/users/${username}/follow`, method: 'DELETE' }),
      invalidatesTags: (result, _err, username) => [
        { type: 'Profile', id: username },
        { type: 'Followers' },
        { type: 'Following' },
        { type: 'Suggestions' },
      ],
    }),
    getFollowers: builder.query({
      query: ({ username, page = 1, limit = 20 }) =>
        ({ url: `/users/${username}/followers`, method: 'GET', params: { page, limit } }),
      providesTags: ['Followers'],
    }),
    getFollowing: builder.query({
      query: ({ username, page = 1, limit = 20 }) =>
        ({ url: `/users/${username}/following`, method: 'GET', params: { page, limit } }),
      providesTags: ['Following'],
    }),
    searchUsers: builder.query({
      query: ({ q, page = 1, limit = 10 }) =>
        ({ url: '/users/search', method: 'GET', params: { q, page, limit } }),
    }),
    getSuggestions: builder.query({
      query: (limit = 10) => ({ url: '/users/suggestions', method: 'GET', params: { limit } }),
      providesTags: ['Suggestions'],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadAvatarMutation,
  useUploadCoverMutation,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetFollowersQuery,
  useGetFollowingQuery,
  useSearchUsersQuery,
  useGetSuggestionsQuery,
} = userApi;
