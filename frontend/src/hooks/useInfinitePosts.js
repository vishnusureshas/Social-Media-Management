import { useState } from 'react';

const omitCursor = ({ cursor: _cursor, limit, ...rest }) => ({ limit, ...rest });

export const useInfinitePosts = (useQuery, args = {}) => {
  const [cursor, setCursor] = useState(undefined);

  const { data, isFetching, isLoading, isError, error, refetch } = useQuery(
    { ...args, cursor },
    {
      serializeQueryArgs: ({ endpointName, queryArgs }) =>
        endpointName + JSON.stringify(omitCursor(queryArgs || {})),
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.cursor !== previousArg?.cursor,
      refetchOnMountOrArgChange: false,
      merge: (currentCacheData, newData) => {
        if (!newData?.data?.posts) return currentCacheData;
        if (!currentCacheData?.data?.posts) return newData;
        const seen = new Set(currentCacheData.data.posts.map((p) => p._id));
        const merged = [
          ...currentCacheData.data.posts,
          ...newData.data.posts.filter((p) => !seen.has(p._id)),
        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        return { ...newData, data: { ...newData.data, posts: merged } };
      },
    }
  );

  const posts = data?.data?.posts || [];
  const hasMore = !!data?.data?.pagination?.hasMore;

  const loadMore = () => {
    const next = data?.data?.pagination?.cursor;
    if (next && !isFetching) setCursor(next);
  };

  return { posts, isFetching, isLoading, isError, error, refetch, loadMore, hasMore };
};