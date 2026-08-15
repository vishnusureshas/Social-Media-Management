import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  useGetAdminPostsQuery,
  useDeleteAdminPostMutation,
  useTogglePinPostMutation,
} from '../api/adminApi';
import { useAuth } from '../hooks/useAuth';
import AdminPageLayout, { SectionCard, EmptyState, StatusTab } from '../components/admin/AdminPageLayout';
import Spinner from '../components/ui/Spinner';
import { getApiErrorMessage } from '../utils/errorUtils';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'visible', label: 'Visible' },
  { value: 'flagged', label: 'Flagged' },
  { value: 'deleted', label: 'Deleted' },
];

const PostPreview = ({ post }) => {
  const firstMedia = post.media?.[0];
  if (firstMedia?.url) {
    if (firstMedia.type === 'image') {
      return <img src={firstMedia.url} alt="" className="h-12 w-12 rounded-xl object-cover ring-1 ring-slate-200" />;
    }
    return (
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-fuchsia-100 text-[10px] font-bold uppercase text-fuchsia-600">
        {firstMedia.type}
      </span>
    );
  }
  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-lg font-bold text-slate-400">
      TXT
    </span>
  );
};

const AdminPosts = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [applied, setApplied] = useState({});
  const { data, isLoading } = useGetAdminPostsQuery({ status: applied.status, q: applied.q });
  const [deletePost, { isLoading: deleting }] = useDeleteAdminPostMutation();
  const [togglePin, { isLoading: pinning }] = useTogglePinPostMutation();

  const isSuper = user?.role === 'superadmin';
  const posts = data?.data?.posts || [];
  const pagination = data?.data?.pagination || {};

  const applySearch = (e) => {
    e.preventDefault();
    setApplied((prev) => ({ ...prev, q: q.trim() || undefined }));
  };

  const handleDelete = async (post) => {
    if (!window.confirm('Remove this post?')) return;
    try {
      await deletePost(post._id).unwrap();
      toast.success('Post removed.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not remove post.'));
    }
  };

  const handlePin = async (post) => {
    try {
      await togglePin({ id: post._id, body: { isPinned: !post.isPinned } }).unwrap();
      toast.success(post.isPinned ? 'Post unpinned.' : 'Post pinned.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not update pin.'));
    }
  };

  return (
    <AdminPageLayout title="Manage posts" description="Review, search, pin, and remove posts." wide>
      <form onSubmit={applySearch} className="glass-strong flex flex-col gap-3 rounded-3xl p-4 sm:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search post content…"
          className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
        <button type="submit" className="btn-gradient rounded-xl px-6 py-2.5 text-sm font-bold text-white">
          Search
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <StatusTab key={tab.value} label={tab.label} value={tab.value} current={status} onClick={(v) => {
            setStatus(v);
            setApplied((prev) => ({ ...prev, status: v }));
          }} />
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : posts.length === 0 ? (
        <EmptyState message="No posts in this view." />
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <SectionCard key={post._id} className="!p-4">
              <div className="flex flex-wrap items-center gap-3">
                <PostPreview post={post} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {post.isPinned && (
                      <span className="rounded-full bg-fuchsia-100 px-2.5 py-0.5 text-[11px] font-bold text-fuchsia-600">Pinned</span>
                    )}
                    {post.isFlagged ? (
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-600">Flagged</span>
                    ) : null}
                    {post.isDeleted ? (
                      <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-600">Deleted</span>
                    ) : null}
                    <span className="text-[11px] font-medium text-slate-400">
                      by @{post.author?.username || 'unknown'} · {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                    {post.content || '[media post]'}
                  </p>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <Link
                    to={`/post/${post._id}`}
                    className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-slate-600 ring-1 ring-slate-200 transition-colors hover:text-brand-600"
                  >
                    View
                  </Link>
                  {isSuper && (
                    <button onClick={() => handlePin(post)} disabled={pinning} className="rounded-xl bg-fuchsia-100 px-3 py-1.5 text-xs font-bold text-fuchsia-600 transition-colors hover:bg-fuchsia-200 disabled:opacity-50">
                      {post.isPinned ? 'Unpin' : 'Pin'}
                    </button>
                  )}
                  <button onClick={() => handleDelete(post)} disabled={deleting} className="rounded-xl bg-rose-500 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-rose-600 disabled:opacity-50">
                    Remove
                  </button>
                </div>
              </div>
            </SectionCard>
          ))}
          {pagination.total > (pagination.limit || 20) && (
            <p className="text-center text-xs font-semibold text-slate-400">
              {pagination.total} posts · page {pagination.page || 1}/{pagination.pages || 1}
            </p>
          )}
        </div>
      )}
    </AdminPageLayout>
  );
};

export default AdminPosts;