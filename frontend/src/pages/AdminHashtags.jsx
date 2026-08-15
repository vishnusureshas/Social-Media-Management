import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetAdminHashtagsQuery } from '../api/adminApi';
import AdminPageLayout, { EmptyState, SectionCard } from '../components/admin/AdminPageLayout';
import Spinner from '../components/ui/Spinner';

const RANK_COLORS = [
  'bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-900',
  'bg-gradient-to-r from-slate-300 to-slate-200 text-slate-700',
  'bg-gradient-to-r from-amber-600 to-orange-500 text-white',
];

const AdminHashtags = () => {
  const [q, setQ] = useState('');
  const { data, isLoading } = useGetAdminHashtagsQuery({ q: q.trim() || undefined });

  const hashtags = data?.data?.hashtags || [];

  return (
    <AdminPageLayout title="Top hashtags" description="Most-used hashtags across posts.">
      <form onSubmit={(e) => e.preventDefault()} className="glass-strong flex items-center gap-3 rounded-3xl p-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter by hashtag…"
          className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
      </form>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : hashtags.length === 0 ? (
        <EmptyState message="No hashtags found." />
      ) : (
        <SectionCard title={`${hashtags.length} hashtags`}>
          <ul className="mt-4 divide-y divide-slate-100">
            {hashtags.map((h, i) => (
              <li key={h.tag} className="flex items-center gap-3 py-2.5">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${RANK_COLORS[i] || 'bg-brand-100 text-brand-600'}`}>
                  {i + 1}
                </span>
                <Link
                  to={`/tag/${encodeURIComponent(h.tag)}`}
                  className="min-w-0 flex-1 truncate text-sm font-bold text-slate-800 hover:text-brand-600"
                >
                  #{h.tag}
                </Link>
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600">
                  {h.count} posts
                </span>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
    </AdminPageLayout>
  );
};

export default AdminHashtags;