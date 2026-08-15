import { Link } from 'react-router-dom';
import { useGetTrendingQuery } from '../../api/postApi';

const TrendingPanel = () => {
  const { data, isLoading, isError } = useGetTrendingQuery();

  return (
    <div className="glass-strong rounded-3xl p-5">
      <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-100">
        Trending now
      </h3>
      {isLoading && <p className="mt-3 text-sm text-slate-500">Loading…</p>}
      {isError && <p className="mt-3 text-sm text-slate-500">Unable to load trends.</p>}
      <ul className="mt-3 space-y-2">
        {(data?.data?.trending || []).map((t) => (
          <li key={t.tag}>
            <Link
              to={`/tag/${encodeURIComponent(t.tag)}`}
              className="group block rounded-xl px-2 py-2 transition-colors hover:bg-violet-500/10"
            >
              <span className="font-semibold text-violet-300 group-hover:text-violet-200">#{t.tag}</span>
              <span className="ml-2 text-xs font-medium text-slate-500">{t.count} posts</span>
            </Link>
          </li>
        ))}
        {(data?.data?.trending || []).length === 0 && !isLoading && (
          <p className="text-sm text-slate-500">No trending topics yet.</p>
        )}
      </ul>
    </div>
  );
};

export default TrendingPanel;