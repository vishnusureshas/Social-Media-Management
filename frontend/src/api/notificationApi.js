import { baseApi } from './baseApi';

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: ({ cursor, limit = 20 } = {}) => ({
        url: '/notifications',
        method: 'GET',
        params: { cursor: cursor || undefined, limit },
      }),
      providesTags: ['Notifications'],
    }),
    getUnreadCount: builder.query({
      query: () => ({ url: '/notifications/unread-count', method: 'GET' }),
      providesTags: ['NotificationCount'],
      keepUnusedDataFor: 60,
    }),
    markAllRead: builder.mutation({
      query: () => ({ url: '/notifications/read', method: 'PUT' }),
      invalidatesTags: ['Notifications', 'NotificationCount'],
    }),
    markOneRead: builder.mutation({
      query: (id) => ({ url: `/notifications/${id}/read`, method: 'PUT' }),
      invalidatesTags: ['Notifications', 'NotificationCount'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAllReadMutation,
  useMarkOneReadMutation,
} = notificationApi;