import { useGetDashboardStatsQuery, useGetDashboardChartsQuery } from '../api/adminApi';
import AdminPageLayout, { StatCard, SectionCard, EmptyState } from '../components/admin/AdminPageLayout';
import Spinner from '../components/ui/Spinner';
import cn from '../utils/cn';

const CHART_COLORS = {
  signups: 'bg-brand-500',
  posts: 'bg-fuchsia-500',
  likes: 'bg-emerald-500',
  comments: 'bg-amber-500',
  follows: 'bg-sky-500',
  reactions: 'bg-violet-500',
};

const CHART_LABELS = {
  signups: 'New signups',
  posts: 'New posts',
  likes: 'Likes',
  comments: 'Comments',
  follows: 'Follows',
  reactions: 'Reactions',
};

const MiniBarChart = ({ series, colorClass }) => {
  const points = series || [];
  const max = Math.max(1, ...points.map((p) => p.count ?? 0));
  return (
    <div>
      <div className="flex h-24 items-end gap-1.5">
        {points.map((p, i) => (
          <div
            key={p.date || i}
            className={cn('group relative flex-1 rounded-t-md transition-all duration-300', colorClass)}
            style={{ height: `${Math.max(4, ((p.count ?? 0) / max) * 100)}%` }}
            title={`${p.date}: ${p.count ?? 0}`}
          >
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-700 opacity-0 transition-opacity group-hover:opacity-100">
              {p.count ?? 0}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-1.5">
        {(points || []).map((p, i) => (
          <span key={p.date || i} className="flex-1 text-center text-[9px] font-semibold text-slate-400">
            {(p.date || '').slice(5)}
          </span>
        ))}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { data: statsData, isLoading: statsLoading } = useGetDashboardStatsQuery();
  const { data: chartsData, isLoading: chartsLoading } = useGetDashboardChartsQuery();

  const stats = statsData?.data?.stats;
  const charts = chartsData?.data?.charts;

  if (statsLoading || chartsLoading) {
    return (
      <AdminPageLayout title="Admin dashboard" description="Loading platform metrics…">
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      </AdminPageLayout>
    );
  }

  const groups = stats
    ? [
        { label: 'Users', items: [
            { label: 'Total', value: stats.users?.total ?? 0, color: 'text-slate-700' },
            { label: 'Active', value: stats.users?.active ?? 0, color: 'text-emerald-500' },
            { label: 'Banned', value: stats.users?.banned ?? 0, color: 'text-rose-500' },
          ] },
        { label: 'Posts', items: [
            { label: 'Total', value: stats.posts?.total ?? 0, color: 'text-slate-700' },
            { label: 'Public', value: stats.posts?.public ?? 0, color: 'text-sky-500' },
            { label: 'Flagged', value: stats.posts?.flagged ?? 0, color: 'text-amber-500' },
          ] },
        { label: 'Discovery', items: [
            { label: 'Reels', value: stats.reels?.total ?? 0, color: 'text-fuchsia-500' },
            { label: 'Flagged', value: stats.reels?.flagged ?? 0, color: 'text-amber-500' },
            { label: 'Stories', value: stats.stories?.total ?? 0, color: 'text-violet-500' },
          ] },
        { label: 'Community', items: [
            { label: 'Comments', value: stats.comments?.total ?? 0, color: 'text-slate-700' },
            { label: 'Follows', value: stats.engagement?.follows ?? 0, color: 'text-brand-500' },
            { label: 'Likes', value: stats.engagement?.likes ?? 0, color: 'text-rose-500' },
          ] },
      ]
    : [];

  return (
    <AdminPageLayout title="Admin dashboard" description="Platform health at a glance.">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[groups[0]?.items, groups[1]?.items, groups[2]?.items, groups[3]?.items]
          .filter(Boolean)
          .flat()
          .map((s, i) => (
            <StatCard key={`${s.label}-${i}`} label={s.label} value={s.value} color={s.color} />
          ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.keys(CHART_LABELS).map((key) => (
          <SectionCard key={key} title={CHART_LABELS[key]} className="!p-6">
            {charts && charts[key]?.length ? (
              <MiniBarChart series={charts[key]} colorClass={CHART_COLORS[key]} />
            ) : (
              <EmptyState message="No data in the last 7 days." />
            )}
          </SectionCard>
        ))}
      </div>
    </AdminPageLayout>
  );
};

export default AdminDashboard;