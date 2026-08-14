import { useState } from 'react';

const omitCursor = ({ cursor: _cursor, limit, ...rest }) => ({ limit, ...rest });

export const useInfiniteReels = (useQuery, args = {}) => {
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
        if (!newData?.data?.reels) return currentCacheData;
        if (!currentCacheData?.data?.reels) return newData;
        const seen = new Set(currentCacheData.data.reels.map((r) => r._id));
        const merged = [
          ...currentCacheData.data.reels,
          ...newData.data.reels.filter((r) => !seen.has(r._id)),
        ];
        return { ...newData, data: { ...newData.data, reels: merged } };
      },
    }
  );

  const reels = data?.data?.reels || [];
  const hasMore = !!data?.data?.pagination?.hasMore;

  const loadMore = () => {
    const next = data?.data?.pagination?.cursor;
    if (next && !isFetching) setCursor(next);
  };

  return { reels, isFetching, isLoading, isError, error, refetch, loadMore, hasMore };
};