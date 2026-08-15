import { baseApi } from './baseApi';

export const privacyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBlocked: builder.query({
      query: ({ page = 1, limit = 20 } = {}) => ({
        url: '/privacy/blocked',
        method: 'GET',
        params: { page, limit },
      }),
      providesTags: ['Blocked'],
    }),
    blockUser: builder.mutation({
      query: (userId) => ({ url: `/privacy/block/${userId}`, method: 'POST' }),
      invalidatesTags: ['Blocked', 'Followers', 'Following', 'Suggestions'],
    }),
    unblockUser: builder.mutation({
      query: (userId) => ({ url: `/privacy/block/${userId}`, method: 'DELETE' }),
      invalidatesTags: ['Blocked', 'Followers', 'Following', 'Suggestions'],
    }),
    getMuted: builder.query({
      query: ({ page = 1, limit = 20 } = {}) => ({
        url: '/privacy/muted',
        method: 'GET',
        params: { page, limit },
      }),
      providesTags: ['Muted'],
    }),
    muteUser: builder.mutation({
      query: ({ userId, scope = 'all' }) => ({
        url: `/privacy/mute/${userId}`,
        method: 'POST',
        body: { scope },
      }),
      invalidatesTags: ['Muted'],
    }),
    unmuteUser: builder.mutation({
      query: (userId) => ({ url: `/privacy/mute/${userId}`, method: 'DELETE' }),
      invalidatesTags: ['Muted'],
    }),
    updatePrivacySettings: builder.mutation({
      query: (body) => ({ url: '/privacy/settings', method: 'PATCH', body }),
      invalidatesTags: ['User', 'Auth'],
    }),
  }),
});

export const {
  useGetBlockedQuery,
  useBlockUserMutation,
  useUnblockUserMutation,
  useGetMutedQuery,
  useMuteUserMutation,
  useUnmuteUserMutation,
  useUpdatePrivacySettingsMutation,
} = privacyApi;