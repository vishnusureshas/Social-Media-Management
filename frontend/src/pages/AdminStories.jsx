import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  useGetAdminStoriesQuery,
  useDeleteAdminStoryMutation,
} from '../api/adminApi';
import AdminPageLayout, { SectionCard, EmptyState } from '../components/admin/AdminPageLayout';
import Spinner from '../components/ui/Spinner';
import { getApiErrorMessage } from '../utils/errorUtils';

const AdminStories = () => {
  const [q, setQ] = useState('');
  const [applied, setApplied] = useState({});
  const { data, isLoading } = useGetAdminStoriesQuery({ q: applied.q });
  const [deleteStory, { isLoading: deleting }] = useDeleteAdminStoryMutation();

  const stories = data?.data?.stories || [];
  const pagination = data?.data?.pagination || {};

  const applySearch = (e) => {
    e.preventDefault();
    setApplied((prev) => ({ ...prev, q: q.trim() || undefined }));
  };

  const handleDelete = async (story) => {
    if (!window.confirm('Remove this story?')) return;
    try {
      await deleteStory(story._id).unwrap();
      toast.success('Story removed.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not remove story.'));
    }
  };

  return (
    <AdminPageLayout title="Manage stories" description="Review, search, and remove stories." wide>
      <form onSubmit={applySearch} className="glass-strong flex flex-col gap-3 rounded-3xl p-4 sm:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search story text…"
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
      ) : stories.length === 0 ? (
        <EmptyState message="No stories in this view." />
      ) : (
        <div className="space-y-3">
          {stories.map((story) => (
            <SectionCard key={story._id} className="!p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-fuchsia-500 text-white">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                    <path d="M3 5h18v14H3V5zM8 9v6l5-3-5-3z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {story.isActive ? (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600">Active</span>
                    ) : (
                      <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-600">Removed</span>
                    )}
                    {story.isFlagged ? (
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-600">Flagged</span>
                    ) : null}
                    <span className="text-[11px] font-medium text-slate-400">
                      by @{story.author?.username || 'unknown'} · {story.viewCount ?? 0} views · expires {story.expiresAt ? new Date(story.expiresAt).toLocaleString() : 'soon'}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">{story.text || '[media story]'}</p>
                </div>
                <button onClick={() => handleDelete(story)} disabled={deleting} className="rounded-xl bg-rose-500 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-rose-600 disabled:opacity-50">
                  Remove
                </button>
              </div>
            </SectionCard>
          ))}
          {pagination.total > (pagination.limit || 20) && (
            <p className="text-center text-xs font-semibold text-slate-400">
              {pagination.total} stories · page {pagination.page || 1}/{pagination.pages || 1}
            </p>
          )}
        </div>
      )}
    </AdminPageLayout>
  );
};

export default AdminStories;