import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_URL } from '../constants/api';
import { setCredentials, clearCredentials } from '../store/slices/authSlice';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const requestUrl = typeof args === 'string' ? args : args?.url;
    const isRefreshCall = typeof requestUrl === 'string' && requestUrl.includes('/auth/refresh');
    const isLogoutCall = typeof requestUrl === 'string' && requestUrl.includes('/auth/logout');

    if (!isRefreshCall) {
      const refreshToken = api.getState().auth.refreshToken;

      if (refreshToken) {
        const refreshResult = await rawBaseQuery(
          { url: '/auth/refresh', method: 'POST', body: { refreshToken } },
          api,
          extraOptions
        );

        if (refreshResult.data?.data?.accessToken) {
          api.dispatch(setCredentials(refreshResult.data.data));
          result = await rawBaseQuery(args, api, extraOptions);
        } else {
          api.dispatch(clearCredentials());
        }
      } else {
        api.dispatch(clearCredentials());
      }
    }

    if (isLogoutCall) {
      api.dispatch(clearCredentials());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Auth', 'User', 'Profile', 'Followers', 'Following', 'Suggestions', 'Post', 'Feed', 'Explore', 'Hashtag', 'Saved', 'Poll', 'Stories', 'Story', 'Reels', 'Reel', 'SharedReels', 'Notifications', 'NotificationCount', 'Blocked', 'Muted', 'Sessions', 'SecurityLogs'],
  endpoints: () => ({}),
});