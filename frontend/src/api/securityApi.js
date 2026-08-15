import { baseApi } from './baseApi';

export const securityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    setup2FA: builder.mutation({
      query: () => ({ url: '/security/2fa/setup', method: 'POST' }),
      invalidatesTags: ['Auth', 'SecurityLogs'],
    }),
    enable2FA: builder.mutation({
      query: (code) => ({ url: '/security/2fa/enable', method: 'POST', body: { code } }),
      invalidatesTags: ['Auth', 'SecurityLogs'],
    }),
    disable2FA: builder.mutation({
      query: (code) => ({ url: '/security/2fa/disable', method: 'POST', body: { code } }),
      invalidatesTags: ['Auth', 'SecurityLogs'],
    }),
    login2FA: builder.mutation({
      query: ({ challenge, code }) => ({
        url: '/security/2fa/login',
        method: 'POST',
        body: { challenge, code },
      }),
    }),
    getSessions: builder.query({
      query: () => ({ url: '/security/sessions', method: 'GET' }),
      providesTags: ['Sessions'],
    }),
    revokeSession: builder.mutation({
      query: (id) => ({ url: `/security/sessions/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Sessions', 'SecurityLogs'],
    }),
    getSecurityLogs: builder.query({
      query: ({ page = 1, limit = 20 } = {}) => ({
        url: '/security/logs',
        method: 'GET',
        params: { page, limit },
      }),
      providesTags: ['SecurityLogs'],
    }),
  }),
});

export const {
  useSetup2FAMutation,
  useEnable2FAMutation,
  useDisable2FAMutation,
  useLogin2FAMutation,
  useGetSessionsQuery,
  useRevokeSessionMutation,
  useGetSecurityLogsQuery,
} = securityApi;