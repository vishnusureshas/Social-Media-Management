import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  useGetAdminReelsQuery,
  useDeleteAdminReelMutation,
} from '../api/adminApi';
import AdminPageLayout, { SectionCard, EmptyState, StatusTab } from '../components/admin/AdminPageLayout';
import Spinner from '../components/ui/Spinner';
import { getApiErrorMessage } from '../utils/errorUtils';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'visible', label: 'Visible' },
  { value: 'flagged', label: 'Flagged' },
  { value: 'deleted', label: 'Deleted' },
];

const AdminReels = () => {
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [applied, setApplied] = useState({});
  const { data, isLoading } = useGetAdminReelsQuery({ status: applied.status, q: applied.q });
  const [deleteReel, { isLoading: deleting }] = useDeleteAdminReelMutation();

  const reels = data?.data?.reels || [];
  const pagination = data?.data?.pagination || {};

  const applySearch = (e) => {
    e.preventDefault();
    setApplied((prev) => ({ ...prev, q: q.trim() || undefined }));
  };

  const handleDelete = async (reel) => {
    if (!window.confirm('Remove this reel?')) return;
    try {
      await deleteReel(reel._id).unwrap();
      toast.success('Reel removed.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not remove reel.'));
    }
  };

  return (
    <AdminPageLayout title="Manage reels" description="Review, search, and remove reels." wide>
      <form onSubmit={applySearch} className="glass-strong flex flex-col gap-3 rounded-3xl p-4 sm:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search reel captions…"
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
      ) : reels.length === 0 ? (
        <EmptyState message="No reels in this view." />
      ) : (
        <div className="space-y-3">
          {reels.map((reel) => (
            <SectionCard key={reel._id} className="!p-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-fuchsia-100 text-fuchsia-600">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                    <path d="M17 14.5l4-2.5-4-2.5v5zM3 5h14v14H3V5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {reel.isFlagged ? (
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-600">Flagged</span>
                    ) : null}
                    {reel.isDeleted ? (
                      <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-600">Deleted</span>
                    ) : null}
                    <span className="text-[11px] font-medium text-slate-400">
                      by @{reel.author?.username || 'unknown'} · {reel.views ?? 0} views · {new Date(reel.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">{reel.caption || '[no caption]'}</p>
                </div>
                <button onClick={() => handleDelete(reel)} disabled={deleting} className="rounded-xl bg-rose-500 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-rose-600 disabled:opacity-50">
                  Remove
                </button>
              </div>
            </SectionCard>
          ))}
          {pagination.total > (pagination.limit || 20) && (
            <p className="text-center text-xs font-semibold text-slate-400">
              {pagination.total} reels · page {pagination.page || 1}/{pagination.pages || 1}
            </p>
          )}
        </div>
      )}
    </AdminPageLayout>
  );
};

export default AdminReels;