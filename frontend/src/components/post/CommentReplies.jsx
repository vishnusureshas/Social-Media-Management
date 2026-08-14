import { useState } from 'react';
import { useGetCommentRepliesQuery } from '../../api/commentApi';
import CommentItem from './CommentItem';

const CommentReplies = ({ comment, onReply }) => {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(undefined);
  const { data, isFetching } = useGetCommentRepliesQuery(
    { id: comment._id, cursor },
    {
      skip: !open,
      serializeQueryArgs: ({ endpointName, queryArgs }) =>
        endpointName + JSON.stringify(queryArgs?.id),
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.cursor !== previousArg?.cursor,
      refetchOnMountOrArgChange: false,
      merge: (currentCacheData, newData) => {
        if (!newData?.data?.comments) return currentCacheData;
        if (!currentCacheData?.data?.comments) return newData;
        const seen = new Set(currentCacheData.data.comments.map((c) => c._id));
        const merged = [
          ...currentCacheData.data.comments,
          ...newData.data.comments.filter((c) => !seen.has(c._id)),
        ].sort((a, b) => String(a._id).localeCompare(String(b._id)));
        return { ...newData, data: { ...newData.data, comments: merged } };
      },
    }
  );

  const replies = data?.data?.comments || [];
  const hasMore = !!data?.data?.pagination?.hasMore;

  if ((comment.repliesCount || 0) === 0 && !open) return null;

  return (
    <div className="border-l-2 border-slate-100 pl-4">
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="text-xs font-semibold text-brand-600 hover:text-brand-700"
        >
          {comment.repliesCount} repl{comment.repliesCount === 1 ? 'y' : 'ies'}
        </button>
      )}

      {open && (
        <>
          {replies.map((r) => (
            <CommentItem key={r._id} comment={r} onReply={onReply} />
          ))}
          {hasMore && !isFetching && (
            <button
              onClick={() => setCursor(data?.data?.pagination?.cursor)}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              Load more replies
            </button>
          )}
          {isFetching && <p className="text-xs text-slate-400">Loading replies…</p>}
          <button
            onClick={() => setOpen(false)}
            className="text-xs font-semibold text-slate-400 hover:text-slate-600"
          >
            Hide
          </button>
        </>
      )}
    </div>
  );
};

export default CommentReplies;