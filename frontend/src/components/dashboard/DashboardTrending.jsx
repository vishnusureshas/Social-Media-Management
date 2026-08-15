import { Link } from 'react-router-dom';
import { useGetTrendingQuery } from '../../api/postApi';

const FALLBACK = [
  { tag: 'GoodVibes', posts: '48.2K' },
  { tag: 'SunsetLovers', posts: '32.7K' },
  { tag: 'LifeGoals', posts: '21.4K' },
  { tag: 'TechTalks', posts: '18.9K' },
  { tag: 'AIRevolution', posts: '15.1K' },
];

const BARS = [
  [3, 5, 4, 6, 5, 7, 6],
  [2, 3, 5, 4, 6, 5, 8],
  [4, 3, 5, 4, 6, 8, 7],
  [2, 4, 3, 5, 6, 5, 7],
  [5, 4, 6, 5, 8, 7, 9],
];

const TrendGraph = ({ seed }) => {
  const bars = BARS[seed % BARS.length];
  const max = Math.max(...bars);
  return (
    <span className="trend-bars" aria-hidden="true">
      {bars.map((b, i) => (
        <i key={i} style={{ height: `${(b / max) * 100}%` }} />
      ))}
    </span>
  );
};

const DashboardTrending = ({ limit = 5 }) => {
  const { data, isLoading, isError } = useGetTrendingQuery();

  const trending =
    (data?.data?.trending || []).length > 0
      ? data.data.trending.slice(0, limit)
      : FALLBACK.map((f, i) => ({ ...f, tag: f.tag, key: `fb-${i}` }));

  return (
    <div className="rounded-3xl border border-white/[0.09] bg-white/[0.04] p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <p className="dash-chip">
          <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400" />
          Trending
        </p>
        <Link to="/explore" className="text-xs font-semibold text-slate-400 transition-colors hover:text-violet-300">
          See all
        </Link>
      </div>

      {isLoading && <p className="mt-3 text-xs text-slate-500">Loading trends…</p>}
      {isError && <p className="mt-3 text-xs text-slate-500">Trends unavailable.</p>}

      <ul className="mt-2 space-y-0.5">
        {trending.map((t, i) => {
          const tag = t.tag;
          const posts = t.count != null ? `${t.count} posts` : `${t.posts} posts`;
          return (
            <li key={t.key || tag}>
              <Link
                to={`/tag/${encodeURIComponent(tag)}`}
                className="group flex items-center gap-3 rounded-2xl px-3 py-2 transition-colors hover:bg-white/[0.06]"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-[10px] font-bold text-slate-500 group-hover:text-violet-300">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-slate-200 group-hover:text-violet-200">
                    #{tag}
                  </span>
                  <span className="block text-[11px] font-medium text-slate-500">{posts}</span>
                </span>
                <TrendGraph seed={i} />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default DashboardTrending;