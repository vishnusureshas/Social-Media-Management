import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  useGetAdminCommentsQuery,
  useDeleteAdminCommentMutation,
} from '../api/adminApi';
import AdminPageLayout, { SectionCard, EmptyState } from '../components/admin/AdminPageLayout';
import Spinner from '../components/ui/Spinner';
import { Avatar } from '../components/user/UserCard';
import { getApiErrorMessage } from '../utils/errorUtils';

const AdminComments = () => {
  const [q, setQ] = useState('');
  const [applied, setApplied] = useState({});
  const { data, isLoading } = useGetAdminCommentsQuery({ q: applied.q });
  const [deleteComment, { isLoading: deleting }] = useDeleteAdminCommentMutation();

  const comments = data?.data?.comments || [];
  const pagination = data?.data?.pagination || {};

  const applySearch = (e) => {
    e.preventDefault();
    setApplied((prev) => ({ ...prev, q: q.trim() || undefined }));
  };

  const handleDelete = async (comment) => {
    if (!window.confirm('Remove this comment?')) return;
    try {
      await deleteComment(comment._id).unwrap();
      toast.success('Comment removed.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not remove comment.'));
    }
  };

  return (
    <AdminPageLayout title="Manage comments" description="Review, search, and remove comments." wide>
      <form onSubmit={applySearch} className="glass-strong flex flex-col gap-3 rounded-3xl p-4 sm:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search comment text…"
          className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
        <button type="submit" className="btn-gradient rounded-xl px-6 py-2.5 text-sm font-bold text-white">
          Search
        </button>
      </form>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : comments.length === 0 ? (
        <EmptyState message="No comments in this view." />
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <SectionCard key={comment._id} className="!p-4">
              <div className="flex flex-wrap items-center gap-3">
                <Avatar user={comment.author} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">
                      @{comment.author?.username || 'unknown'}
                    </span>
                    {comment.isFlagged ? (
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-600">Flagged</span>
                    ) : null}
                    {comment.isDeleted ? (
                      <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-600">Deleted</span>
                    ) : null}
                    <span className="text-[11px] font-medium text-slate-400">
                      {comment.targetType} · {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">{comment.content}</p>
                </div>
                <button onClick={() => handleDelete(comment)} disabled={deleting} className="rounded-xl bg-rose-500 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-rose-600 disabled:opacity-50">
                  Remove
                </button>
              </div>
            </SectionCard>
          ))}
          {pagination.total > (pagination.limit || 20) && (
            <p className="text-center text-xs font-semibold text-slate-400">
              {pagination.total} comments · page {pagination.page || 1}/{pagination.pages || 1}
            </p>
          )}
        </div>
      )}
    </AdminPageLayout>
  );
};

export default AdminComments;