import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { useGetReelCommentsQuery, useAddReelCommentMutation } from '../../api/reelApi';
import { Avatar } from '../user/UserCard';
import CommentItem from '../post/CommentItem';
import CommentReplies from '../post/CommentReplies';
import Button from '../ui/Button';

const ReelCommentSheet = ({ reel, onClose }) => {
  const { user: me } = useAuth();
  const [feedCursor, setFeedCursor] = useState(undefined);
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [addComment, { isLoading }] = useAddReelCommentMutation();

  const { data, isFetching } = useGetReelCommentsQuery(
    { id: reel._id, cursor: feedCursor },
    {
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
        ].sort((a, b) => String(b._id).localeCompare(String(a._id)));
        return { ...newData, data: { ...newData.data, comments: merged } };
      },
    }
  );

  const comments = data?.data?.comments || [];
  const hasMore = !!data?.data?.pagination?.hasMore;

  const submitComment = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      const body = { content: content.trim() };
      if (replyTo) body.parent = replyTo._id;
      await addComment({ id: reel._id, body }).unwrap();
      setContent('');
      setReplyTo(null);
      setFeedCursor(undefined);
    } catch (err) {
      toast.error(err?.data?.message || "Couldn't post comment.");
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-slate-950/70 backdrop-blur-sm sm:p-4">
      <div
        className="flex h-[75vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-white/[0.12] bg-[#0b0f26] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.95)] sm:h-[70vh] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
          <p className="font-display text-lg font-bold text-white">
            Comments <span className="text-sm font-medium text-slate-500">({comments.length})</span>
          </p>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-sm font-bold text-slate-400 hover:bg-white/[0.12] hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto px-5">
          {comments.map((c) => (
            <div key={c._id}>
              <CommentItem comment={c} onReply={setReplyTo} />
              <div className="ml-12">
                <CommentReplies comment={c} onReply={setReplyTo} />
              </div>
            </div>
          ))}
          {hasMore && !isFetching && (
            <button
              onClick={() => setFeedCursor(data?.data?.pagination?.cursor)}
              className="px-1 py-2 text-sm font-semibold text-violet-400 hover:text-violet-300"
            >
              Load more comments
            </button>
          )}
          {isFetching && <p className="px-1 py-2 text-sm text-slate-500">Loading comments…</p>}
          {!isFetching && comments.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">
              No comments yet. Be the first to comment!
            </p>
          )}
        </div>

        <div className="border-t border-white/[0.08] p-4">
          {replyTo && (
            <div className="mb-2 flex items-center justify-between rounded-xl bg-violet-500/10 px-3 py-2 text-xs font-medium text-violet-300">
              <span>
                Replying to <b>@{replyTo.author?.username}</b>
              </span>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="font-bold text-slate-500 hover:text-rose-400"
              >
                ✕
              </button>
            </div>
          )}
          <form onSubmit={submitComment} className="flex gap-3">
            <Avatar user={me} size="sm" />
            <div className="glass flex flex-1 items-end gap-2 rounded-2xl p-2">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={replyTo ? 'Write a reply…' : 'Add a comment…'}
                rows={2}
                className="max-h-32 flex-1 resize-none bg-transparent px-2 py-1 text-sm outline-none placeholder:text-slate-400"
              />
              <Button type="submit" size="sm" loading={isLoading} disabled={!content.trim()}>
                Post
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReelCommentSheet;