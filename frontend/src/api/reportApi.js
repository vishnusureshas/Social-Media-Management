import { baseApi } from './baseApi';

export const reportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createReport: builder.mutation({
      query: (body) => ({ url: '/reports', method: 'POST', body }),
      invalidatesTags: ['Reports'],
    }),
    getMyReports: builder.query({
      query: ({ page = 1, limit = 20 } = {}) => ({
        url: '/reports/my',
        method: 'GET',
        params: { page, limit },
      }),
      providesTags: ['Reports'],
    }),

    getAdminReports: builder.query({
      query: ({ status, page = 1, limit = 20 } = {}) => ({
        url: '/admin/reports',
        method: 'GET',
        params: { status, page, limit },
      }),
      providesTags: ['AdminReports'],
    }),
    getReportStats: builder.query({
      query: () => ({ url: '/admin/reports/stats', method: 'GET' }),
      providesTags: ['ReportStats'],
    }),
    resolveReport: builder.mutation({
      query: ({ id, body }) => ({ url: `/admin/reports/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['AdminReports', 'ReportStats', 'Reports'],
    }),

    getModerationKeywords: builder.query({
      query: () => ({ url: '/admin/keywords', method: 'GET' }),
      providesTags: ['Keywords'],
    }),
    createKeyword: builder.mutation({
      query: (body) => ({ url: '/admin/keywords', method: 'POST', body }),
      invalidatesTags: ['Keywords'],
    }),
    deleteKeyword: builder.mutation({
      query: (id) => ({ url: `/admin/keywords/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Keywords'],
    }),
  }),
});

export const {
  useCreateReportMutation,
  useGetMyReportsQuery,
  useGetAdminReportsQuery,
  useGetReportStatsQuery,
  useResolveReportMutation,
  useGetModerationKeywordsQuery,
  useCreateKeywordMutation,
  useDeleteKeywordMutation,
} = reportApi;