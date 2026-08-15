import { baseApi } from './baseApi';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    adminLogin: builder.mutation({
      query: (body) => ({ url: '/admin/login', method: 'POST', body }),
    }),
    getAdminMe: builder.query({
      query: () => ({ url: '/admin/me', method: 'GET' }),
      providesTags: ['Auth'],
    }),
    getDashboardStats: builder.query({
      query: () => ({ url: '/admin/dashboard/stats', method: 'GET' }),
      providesTags: ['AdminDashboard'],
    }),
    getDashboardCharts: builder.query({
      query: () => ({ url: '/admin/dashboard/charts', method: 'GET' }),
      providesTags: ['AdminDashboard'],
    }),

    getAdminUsers: builder.query({
      query: ({ q, role, status, page = 1, limit = 20 } = {}) => ({
        url: '/admin/users',
        method: 'GET',
        params: { q, role, status, page, limit },
      }),
      providesTags: ['AdminUsers'],
    }),
    getAdminUserDetail: builder.query({
      query: (id) => ({ url: `/admin/users/${id}`, method: 'GET' }),
      providesTags: ['AdminUsers'],
    }),
    updateUserStatus: builder.mutation({
      query: ({ id, body }) => ({ url: `/admin/users/${id}/status`, method: 'PATCH', body }),
      invalidatesTags: ['AdminUsers', 'AdminDashboard'],
    }),
    updateUserRole: builder.mutation({
      query: ({ id, body }) => ({ url: `/admin/users/${id}/role`, method: 'PATCH', body }),
      invalidatesTags: ['AdminUsers'],
    }),
    deleteAdminUser: builder.mutation({
      query: (id) => ({ url: `/admin/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AdminUsers', 'AdminDashboard'],
    }),

    getAdminPosts: builder.query({
      query: ({ q, status, page = 1, limit = 20 } = {}) => ({
        url: '/admin/posts',
        method: 'GET',
        params: { q, status, page, limit },
      }),
      providesTags: ['AdminContent'],
    }),
    deleteAdminPost: builder.mutation({
      query: (id) => ({ url: `/admin/posts/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AdminContent', 'AdminDashboard'],
    }),
    togglePinPost: builder.mutation({
      query: ({ id, body }) => ({ url: `/admin/posts/${id}/pin`, method: 'PATCH', body }),
      invalidatesTags: ['AdminContent'],
    }),

    getAdminReels: builder.query({
      query: ({ q, status, page = 1, limit = 20 } = {}) => ({
        url: '/admin/reels',
        method: 'GET',
        params: { q, status, page, limit },
      }),
      providesTags: ['AdminContent'],
    }),
    deleteAdminReel: builder.mutation({
      query: (id) => ({ url: `/admin/reels/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AdminContent', 'AdminDashboard'],
    }),

    getAdminStories: builder.query({
      query: ({ q, page = 1, limit = 20 } = {}) => ({
        url: '/admin/stories',
        method: 'GET',
        params: { q, page, limit },
      }),
      providesTags: ['AdminContent'],
    }),
    deleteAdminStory: builder.mutation({
      query: (id) => ({ url: `/admin/stories/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AdminContent', 'AdminDashboard'],
    }),

    getAdminComments: builder.query({
      query: ({ q, page = 1, limit = 20 } = {}) => ({
        url: '/admin/comments',
        method: 'GET',
        params: { q, page, limit },
      }),
      providesTags: ['AdminContent'],
    }),
    deleteAdminComment: builder.mutation({
      query: (id) => ({ url: `/admin/comments/${id}`, method: 'DELETE' }),
      invalidatesTags: ['AdminContent'],
    }),

    getAdminHashtags: builder.query({
      query: ({ q } = {}) => ({ url: '/admin/hashtags', method: 'GET', params: { q } }),
      providesTags: ['AdminHashtags'],
    }),

    broadcastNotification: builder.mutation({
      query: (body) => ({ url: '/admin/notifications/broadcast', method: 'POST', body }),
      invalidatesTags: ['Notifications', 'NotificationCount'],
    }),

    getAuditLogs: builder.query({
      query: ({ action, adminId, page = 1, limit = 20 } = {}) => ({
        url: '/admin/audit-logs',
        method: 'GET',
        params: { action, adminId, page, limit },
      }),
      providesTags: ['AdminAuditLogs'],
    }),

    getAdminSettings: builder.query({
      query: () => ({ url: '/admin/settings', method: 'GET' }),
      providesTags: ['AdminSettings'],
    }),
    updateAdminSettings: builder.mutation({
      query: (settings) => ({ url: '/admin/settings', method: 'PATCH', body: { settings } }),
      invalidatesTags: ['AdminSettings'],
    }),
  }),
});

export const {
  useAdminLoginMutation,
  useGetAdminMeQuery,
  useGetDashboardStatsQuery,
  useGetDashboardChartsQuery,
  useGetAdminUsersQuery,
  useGetAdminUserDetailQuery,
  useUpdateUserStatusMutation,
  useUpdateUserRoleMutation,
  useDeleteAdminUserMutation,
  useGetAdminPostsQuery,
  useDeleteAdminPostMutation,
  useTogglePinPostMutation,
  useGetAdminReelsQuery,
  useDeleteAdminReelMutation,
  useGetAdminStoriesQuery,
  useDeleteAdminStoryMutation,
  useGetAdminCommentsQuery,
  useDeleteAdminCommentMutation,
  useGetAdminHashtagsQuery,
  useBroadcastNotificationMutation,
  useGetAuditLogsQuery,
  useGetAdminSettingsQuery,
  useUpdateAdminSettingsMutation,
} = adminApi;