import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import {
  useGetPostCommentsQuery,
  useAddCommentMutation,
} from '../../api/commentApi';
import { Avatar } from '../user/UserCard';
import CommentItem from './CommentItem';
import CommentReplies from './CommentReplies';
import Button from '../ui/Button';

const CommentSection = ({ postId }) => {
  const { user: me } = useAuth();
  const [feedCursor, setFeedCursor] = useState(undefined);
  const [content, setContent] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [addComment, { isLoading }] = useAddCommentMutation();

  const { data, isFetching } = useGetPostCommentsQuery(
    { postId, cursor: feedCursor },
    {
      serializeQueryArgs: ({ endpointName, queryArgs }) =>
        endpointName + JSON.stringify(queryArgs?.postId),
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
      const payload = { post: postId, content: content.trim() };
      if (replyTo) payload.parent = replyTo._id;
      await addComment(payload).unwrap();
      setContent('');
      setReplyTo(null);
      setFeedCursor(undefined);
    } catch (err) {
      toast.error(err?.data?.message || 'Unable to post comment.');
    }
  };

  return (
    <div className="mt-6">
      <h3 className="font-display text-lg font-bold text-slate-900">Comments</h3>

      <div className="mt-4 flex gap-3">
        <Avatar user={me} size="sm" />
        <form onSubmit={submitComment} className="flex-1">
          {replyTo && (
            <div className="mb-2 flex items-center justify-between rounded-xl bg-brand-50 px-3 py-2 text-xs font-medium text-brand-700">
              <span>
                Replying to <b>@{replyTo.author?.username}</b>
              </span>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="font-bold text-slate-400 hover:text-rose-500"
              >
                ✕
              </button>
            </div>
          )}
          <div className="glass flex items-end gap-2 rounded-2xl p-2">
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

      <div className="mt-2 space-y-2">
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
            className="px-3 py-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            Load more comments
          </button>
        )}
        {isFetching && <p className="px-3 text-sm text-slate-400">Loading comments…</p>}
      </div>
    </div>
  );
};

export default CommentSection;