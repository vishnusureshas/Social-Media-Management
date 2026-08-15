import { useEffect, useState } from 'react';
import { useId } from 'react';
import { Link } from 'react-router-dom';
import { useGetDashboardStatsQuery, useGetDashboardChartsQuery } from '../api/adminApi';
import Spinner from '../components/ui/Spinner';
import cn from '../utils/cn';

const fmt = (n) => (Number(n) || 0).toLocaleString();

const METRICS = [
  { key: 'signups', label: 'New signups', color: '#8b5cf6' },
  { key: 'posts', label: 'New posts', color: '#e879f9' },
  { key: 'likes', label: 'Likes', color: '#34d399' },
  { key: 'comments', label: 'Comments', color: '#f59e0b' },
  { key: 'follows', label: 'Follows', color: '#38bdf8' },
  { key: 'reactions', label: 'Reactions', color: '#a78bfa' },
];

const sumSeries = (series) => (series || []).reduce((acc, p) => acc + (p.count ?? 0), 0);

const dayLabel = (dateStr) => {
  if (!dateStr) return '';
  const [, m, d] = dateStr.split('-');
  return `${Number(m)}/${Number(d)}`;
};

const AreaChart = ({ series = [], color, height = 44, showAxis = false, showValue = false }) => {
  const gid = useId().replace(/:/g, '');
  const W = 100;
  const H = 50;
  const padY = showValue ? 10 : 6;
  const max = Math.max(1, ...series.map((p) => p.count ?? 0));
  const n = series.length;
  const stepX = n > 1 ? W / (n - 1) : W;
  const x = (i) => (n > 1 ? i * stepX : W / 2);
  const y = (v) => H - padY - ((v ?? 0) / max) * (H - padY * 2);
  const points = series.map((p, i) => ({ x: x(i), y: y(p.count), v: p.count ?? 0, date: p.date }));
  const line = points.map((pt, i) => `${i ? 'L' : 'M'}${pt.x.toFixed(2)},${pt.y.toFixed(2)}`).join(' ');
  const areaPath = `${line} L${points.length ? points[points.length - 1].x : 0},${H} L0,${H} Z`;

  return (
    <div className="relative w-full" style={{ height }}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-full w-full">
        <defs>
          <linearGradient id={`g${gid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.4" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {points.map((pt) => (
          <circle key={`${pt.date}${gid}`} cx={pt.x} cy={pt.y} r={0.9} fill={color} />
        ))}
        <path d={areaPath} fill={`url(#g${gid})`} />
        <path d={line} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      </svg>
      {showValue && (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-2xl font-bold text-white drop-shadow-[0_0_18px_rgba(139,92,246,0.6)]">
          {fmt(max)}
        </span>
      )}
      {showAxis && (
        <div className="mt-1 flex justify-between text-[10px] font-semibold text-slate-500">
          <span>{dayLabel(series[0]?.date)}</span>
          <span>{dayLabel(series[series.length - 1]?.date)}</span>
        </div>
      )}
    </div>
  );
};

const KpiCard = ({ icon, label, value, sub, accent }) => (
  <div className="glass-strong dash-hover relative overflow-hidden rounded-3xl p-5">
    <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full blur-2xl" style={{ background: `${accent}33` }} />
    <div className="relative flex items-start justify-between gap-3">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{label}</p>
        <p className="mt-2 font-display text-3xl font-extrabold text-white">{fmt(value)}</p>
        {sub && <p className="mt-1.5 text-xs text-slate-500">{sub}</p>}
      </div>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5" style={{ color: accent }}>
        {icon}
      </span>
    </div>
  </div>
);

const MetricCard = ({ metric, series }) => {
  const total = sumSeries(series);
  const accent = metric.color;
  return (
    <div className="glass-strong dash-hover flex flex-col rounded-3xl p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">{metric.label}</p>
          <p className="mt-1 font-display text-xl font-extrabold text-white">{fmt(total)}</p>
        </div>
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: accent, boxShadow: `0 0 14px 2px ${accent}80` }} />
      </div>
      <div className="mt-auto">
        <AreaChart series={series} color={accent} height={48} />
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] font-semibold text-slate-500">
        <span>{dayLabel(series[0]?.date)}</span>
        <span>{dayLabel(series[series.length - 1]?.date)}</span>
      </div>
    </div>
  );
};

const ICONS = {
  users: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  posts: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M8 13h8M8 17h5M8 9h2" />
    </svg>
  ),
  flag: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 21V4m0 0c5-4 7 4 16 0v12c-9 4-11-4-16 0" />
    </svg>
  ),
  alert: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.3 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.7 3.86a2 2 0 00-3.4 0zM12 9v4M12 17h.01" />
    </svg>
  ),
  usersCheck: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM19 8l2 2 4-4" />
    </svg>
  ),
  ban: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M4.9 4.9l14.2 14.2" />
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1 1.1L12 21.4l7.8-7.9 1-1.1a5.5 5.5 0 000-7.8z" />
    </svg>
  ),
};

const EngagementRow = ({ label, value, accent, count }) => (
  <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-4 py-3">
    <div className="flex items-center gap-3">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: accent, boxShadow: `0 0 12px 2px ${accent}80` }} />
      <p className="text-sm font-semibold text-slate-300">{label}</p>
    </div>
    <div className="text-right">
      <p className="font-display text-lg font-bold text-white">{fmt(value)}</p>
      {count !== undefined && <p className="text-[10px] text-slate-500">{fmt(count)} this week</p>}
    </div>
  </div>
);

const AdminDashboard = () => {
  const [now, setNow] = useState(() => new Date());
  const { data: statsData, isLoading: statsLoading, isFetching: statsFetching } = useGetDashboardStatsQuery(undefined, {
    pollingInterval: 15000,
  });
  const { data: chartsData, isLoading: chartsLoading, isFetching: chartsFetching } = useGetDashboardChartsQuery(undefined, {
    pollingInterval: 15000,
  });

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const stats = statsData?.data?.stats;
  const charts = chartsData?.data?.charts;
  const live = statsFetching || chartsFetching;
  const loading = statsLoading || chartsLoading;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-28">
        <Spinner size="lg" />
        <p className="text-sm font-semibold text-slate-500">Loading live platform metrics…</p>
      </div>
    );
  }

  const reports = stats?.reports?.pending ?? 0;
  const flaggedPosts = stats?.posts?.flagged ?? 0;
  const flaggedReels = stats?.reels?.flagged ?? 0;

  return (
    <div className="w-full space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-white">Admin dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Platform health at a glance — refreshes live every 15&nbsp;s.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2">
          <span className={cn('relative flex h-2.5 w-2.5', live && 'after:absolute after:inset-0 after:animate-ping after:rounded-full after:bg-emerald-400/60')}>
            <span className={cn('h-2.5 w-2.5 rounded-full', live ? 'bg-emerald-400' : 'bg-slate-500')} style={live ? { boxShadow: '0 0 12px 2px rgba(52,211,153,0.7)' } : undefined} />
          </span>
          <span className="text-xs font-bold text-slate-300">{live ? 'Live' : 'Syncing'}</span>
          <span className="text-[10px] font-semibold text-slate-500">{now.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          icon={ICONS.users}
          accent="#8b5cf6"
          label="Total users"
          value={stats?.users?.total ?? 0}
          sub={`${fmt(stats?.users?.active ?? 0)} active · ${fmt(stats?.users?.banned ?? 0)} banned`}
        />
        <KpiCard
          icon={ICONS.posts}
          accent="#e879f9"
          label="Posts"
          value={stats?.posts?.total ?? 0}
          sub={`${fmt(stats?.posts?.public ?? 0)} public · ${fmt(stats?.posts?.flagged ?? 0)} flagged`}
        />
        <KpiCard
          icon={ICONS.usersCheck}
          accent="#34d399"
          label="Comments"
          value={stats?.comments?.total ?? 0}
          sub={`${fmt(stats?.reels?.total ?? 0)} reels · ${fmt(stats?.stories?.total ?? 0)} stories`}
        />
        <KpiCard
          icon={ICONS.alert}
          accent="#f59e0b"
          label="Reports pending"
          value={reports}
          sub={`${fmt(flaggedPosts)} flagged posts · ${fmt(flaggedReels)} flagged reels`}
        />
      </div>

      {/* Hero chart + engagement */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="glass-strong neon-frame--soft rounded-3xl p-5 lg:col-span-2">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base font-bold text-white">New signups</h2>
              <p className="text-xs text-slate-500">Last 7 days</p>
            </div>
            <span className="font-display text-2xl font-extrabold text-white">{fmt(sumSeries(charts?.signups))}</span>
          </div>
          <AreaChart series={charts?.signups} color="#8b5cf6" height={200} showAxis />
        </div>

        <div className="glass-strong rounded-3xl p-5">
          <h2 className="font-display text-base font-bold text-white">Engagement</h2>
          <p className="text-xs text-slate-500">Current totals</p>
          <div className="mt-4 space-y-2.5">
            <EngagementRow label="Likes" value={stats?.engagement?.likes ?? 0} accent="#34d399" count={sumSeries(charts?.likes)} />
            <EngagementRow label="Follows" value={stats?.engagement?.follows ?? 0} accent="#38bdf8" count={sumSeries(charts?.follows)} />
            <EngagementRow label="Comments" value={stats?.comments?.total ?? 0} accent="#f59e0b" count={sumSeries(charts?.comments)} />
            <EngagementRow label="Reactions" value={sumSeries(charts?.reactions)} accent="#a78bfa" count={sumSeries(charts?.reactions)} />
          </div>
        </div>
      </div>

      {/* Metric area charts */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {METRICS.map((m) => (
          <MetricCard key={m.key} metric={m} series={charts?.[m.key]} />
        ))}
      </div>

      {/* Quick links */}
      <div className="glass-strong flex flex-wrap items-center gap-2.5 rounded-3xl p-4">
        <span className="mr-1 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Quick actions</span>
        <Link to="/admin/users" className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-bold text-slate-300 transition-colors hover:border-violet-400/50 hover:text-white">
          Moderate users
        </Link>
        <Link to="/admin/reports" className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-bold text-slate-300 transition-colors hover:border-amber-400/50 hover:text-white">
          Review reports {reports > 0 && <span className="ml-1 rounded-full bg-amber-500/20 px-1.5 py-0.5 text-amber-300">{fmt(reports)}</span>}
        </Link>
        <Link to="/admin/posts" className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-bold text-slate-300 transition-colors hover:border-fuchsia-400/50 hover:text-white">
          Flagged content {flaggedPosts + flaggedReels > 0 && <span className="ml-1 rounded-full bg-rose-500/20 px-1.5 py-0.5 text-rose-300">{fmt(flaggedPosts + flaggedReels)}</span>}
        </Link>
        <Link to="/admin/broadcast" className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-bold text-slate-300 transition-colors hover:border-cyan-400/50 hover:text-white">
          Broadcast
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;