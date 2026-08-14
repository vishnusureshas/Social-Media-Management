import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useGetFollowersQuery, useGetFollowingQuery } from '../api/userApi';
import { UserCard } from '../components/user/UserCard';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import cn from '../utils/cn';

const tabs = [
  { key: 'followers', label: 'Followers' },
  { key: 'following', label: 'Following' },
];

const FollowsList = ({ tab }) => {
  const { username } = useParams();
  const [page, setPage] = useState(1);

  const followersQuery = useGetFollowersQuery(
    { username, page, limit: 20 },
    { skip: tab !== 'followers' }
  );
  const followingQuery = useGetFollowingQuery(
    { username, page, limit: 20 },
    { skip: tab !== 'following' }
  );

  const active = tab === 'followers' ? followersQuery : followingQuery;
  const { data, isLoading, isError, error, refetch } = active;

  const list = data?.data?.[tab] || [];
  const pagination = data?.pagination;
  const totalPages = pagination?.pages || 1;

  return (
    <div className="mx-auto max-w-3xl px-6 pb-16">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-slate-900">@{username}</h1>
        <div className="mt-4 flex rounded-2xl border border-slate-200/80 bg-white/70 p-1.5 backdrop-blur-md">
          {tabs.map((t) => (
            <Link
              key={t.key}
              to={`/u/${username}/${t.key}`}
              className={cn(
                'flex-1 rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition-all duration-300',
                tab === t.key
                  ? 'bg-gradient-to-r from-brand-500 via-violet-500 to-fuchsia-500 text-white shadow-glow'
                  : 'text-slate-500 hover:text-brand-600'
              )}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <div className="glass-strong mx-auto max-w-md rounded-3xl p-8 text-center animate-fade-up">
          <p className="text-sm text-rose-500">{error?.data?.message || 'Failed to load list'}</p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={refetch}>Retry</Button>
        </div>
      ) : list.length === 0 ? (
        <p className="py-20 text-center text-sm text-slate-400">
          No {tab} yet.
        </p>
      ) : (
        <>
          <div className="space-y-3">
            {list.map((u) => (
              <UserCard key={u._id} user={u} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-sm font-medium text-slate-500">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FollowsList;
