import { baseApi } from './baseApi';

export const pollApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    votePoll: builder.mutation({
      query: ({ id, optionId }) => ({
        url: `/polls/${id}/vote`,
        method: 'POST',
        body: { optionId },
      }),
      invalidatesTags: (_result, _err, arg) => [{ type: 'Post', id: arg.postId }],
    }),
    getPollResults: builder.query({
      query: (id) => ({ url: `/polls/${id}/results`, method: 'GET' }),
      providesTags: (_result, _err, id) => [{ type: 'Poll', id }],
    }),
    createPoll: builder.mutation({
      query: (body) => ({ url: '/polls/create', method: 'POST', body }),
      invalidatesTags: (_result, _err, arg) => [{ type: 'Post', id: arg.post }],
    }),
  }),
});

export const {
  useVotePollMutation,
  useGetPollResultsQuery,
  useCreatePollMutation,
} = pollApi;