import { baseApi } from './baseApi';

export const storyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActiveStories: builder.query({
      query: ({ cursor, limit = 50 } = {}) => ({
        url: '/stories',
        method: 'GET',
        params: { cursor: cursor || undefined, limit },
      }),
      providesTags: ['Stories'],
    }),
    getStory: builder.query({
      query: (id) => ({ url: `/stories/${id}`, method: 'GET' }),
      providesTags: (_result, _err, id) => [{ type: 'Story', id }],
    }),
    createStory: builder.mutation({
      query: (formData) => ({ url: '/stories', method: 'POST', body: formData }),
      invalidatesTags: ['Stories', 'Profile'],
    }),
    deleteStory: builder.mutation({
      query: (id) => ({ url: `/stories/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Stories', 'Profile'],
    }),
    getStoryViewers: builder.query({
      query: ({ id, cursor, limit = 20 }) => ({
        url: `/stories/${id}/viewers`,
        method: 'GET',
        params: { cursor: cursor || undefined, limit },
      }),
    }),
  }),
});

export const {
  useGetActiveStoriesQuery,
  useGetStoryQuery,
  useCreateStoryMutation,
  useDeleteStoryMutation,
  useGetStoryViewersQuery,
} = storyApi;