import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useGetProfileQuery } from '../api/userApi';
import { useGetUserPostsQuery } from '../api/postApi';
import ProfileHeader from '../components/user/ProfileHeader';
import PostCard from '../components/post/PostCard';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { getApiErrorMessage } from '../utils/errorUtils';
import cn from '../utils/cn';

const formatCount = (n) => {
  const v = Number(n) || 0;
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
  return String(v);
};

const StatTile = ({ label, value, to }) => {
  const inner = (
    <>
      <span className="font-display text-xl font-bold text-white sm:text-2xl">{formatCount(value)}</span>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</span>
    </>
  );
  const cls =
    'flex flex-col items-center gap-1 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 transition-all duration-300 hover:border-violet-400/40 hover:bg-white/[0.06]';
  return to ? (
    <Link to={to} className={cls}>
      {inner}
    </Link>
  ) : (
    <div className={cls}>{inner}</div>
  );
};

const TabButton = ({ active, onClick, count, label }) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors',
      active ? 'text-white' : 'text-slate-500 hover:text-slate-300'
    )}
  >
    {label}
    {count > 0 && (
      <span
        className={cn(
          'rounded-full px-2 py-0.5 text-[10px] font-bold',
          active ? 'bg-violet-500/25 text-violet-200' : 'bg-white/[0.06] text-slate-500'
        )}
      >
        {formatCount(count)}
      </span>
    )}
    {active && <span className="absolute inset-x-3 -bottom-[13px] h-0.5 rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400" />}
  </button>
);

const AboutPanel = ({ user }) => {
  const joined = user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' }) : null;
  const rows = [
    { label: 'Joined', value: joined },
    { label: 'Gender', value: user.gender ? user.gender.replace(/_/g, ' ') : null },
    { label: 'Date of birth', value: user.dob ? new Date(user.dob).toLocaleDateString() : null },
    { label: 'Location', value: user.location || null },
  ].filter((r) => r.value);

  return (
    <div className="rounded-3xl border border-white/[0.09] bg-white/[0.04] p-6 backdrop-blur-xl animate-fade-up">
      <h2 className="font-display text-base font-bold text-white">About</h2>
      <div className="mt-4 space-y-4">
        {user.bio && <p className="text-sm leading-relaxed text-slate-300">{user.bio}</p>}
        {rows.length > 0 && (
          <dl className="grid gap-3 sm:grid-cols-2">
            {rows.map((r) => (
              <div key={r.label} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-3">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{r.label}</dt>
                <dd className="mt-0.5 text-sm font-medium capitalize text-slate-100">{r.value}</dd>
              </div>
            ))}
          </dl>
        )}
        {user.website && (
          <a
            href={user.website}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-violet-400 hover:underline"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
              <path d="M12 3a9 9 0 109 9M8 8l3.5-3.5M13.5 13.5L10 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            {user.website}
          </a>
        )}
      </div>
    </div>
  );
};

const PostsPanel = ({ username }) => {
  const [cursor, setCursor] = useState(undefined);
  const { data, isLoading, isError, isFetching } = useGetUserPostsQuery(
    { username, cursor },
    {
      serializeQueryArgs: ({ endpointName, queryArgs }) => endpointName + JSON.stringify(queryArgs?.username),
      merge: (currentCacheData, newData) => {
        if (!newData?.data?.posts) return currentCacheData;
        if (!currentCacheData?.data?.posts) return newData;
        const seen = new Set(currentCacheData.data.posts.map((p) => p._id));
        return {
          ...newData,
          data: {
            ...newData.data,
            posts: [...currentCacheData.data.posts, ...newData.data.posts.filter((p) => !seen.has(p._id))],
          },
        };
      },
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.cursor !== previousArg?.cursor,
      refetchOnMountOrArgChange: false,
    }
  );

  const posts = data?.data?.posts || [];
  const hasMore = !!data?.data?.pagination?.hasMore;

  if (isError) {
    return (
      <p className="rounded-3xl border border-dashed border-white/[0.14] bg-white/[0.03] p-10 text-center text-sm text-slate-500">
        Couldn't load posts.
      </p>
    );
  }
  if (isLoading) {
    return (
      <div className="flex justify-center py-14">
        <Spinner />
      </div>
    );
  }
  if (posts.length === 0) {
    return (
      <p className="rounded-3xl border border-dashed border-white/[0.14] bg-white/[0.03] p-10 text-center text-sm text-slate-500">
        No posts yet.
      </p>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
      {hasMore && (
        <div className="mt-6 flex justify-center">
          <Button size="md" variant="outline" onClick={() => setCursor(data?.data?.pagination?.cursor)} loading={isFetching}>
            Load more
          </Button>
        </div>
      )}
    </>
  );
};

const Profile = () => {
  const { username } = useParams();
  const [tab, setTab] = useState('posts');
  const { data, isLoading, isError, error, refetch } = useGetProfileQuery(username);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-3xl border border-white/[0.1] bg-white/[0.04] p-10 text-center backdrop-blur-xl animate-fade-up">
        <p className="text-sm text-rose-400">{getApiErrorMessage(error, 'Failed to load profile')}</p>
        <Button variant="secondary" size="sm" className="mt-4" onClick={refetch}>
          Retry
        </Button>
        <Link to="/" className="mt-3 block text-sm font-medium text-slate-500 hover:text-violet-300">
          Back to home
        </Link>
      </div>
    );
  }

  const user = data?.data?.user;
  const counts = user?.counts || {};

  return (
    <div className="space-y-5">
      <ProfileHeader user={user} />

      <div className="grid grid-cols-3 gap-3">
        <StatTile label="Posts" value={counts.posts ?? 0} />
        <StatTile label="Followers" value={counts.followers ?? 0} to={`/u/${user.username}/followers`} />
        <StatTile label="Following" value={counts.following ?? 0} to={`/u/${user.username}/following`} />
      </div>

      <div className="sticky top-16 z-10 -mx-1 flex items-center gap-1 border-b border-white/[0.07] bg-[rgba(7,8,21,0.85)] px-1 py-2 backdrop-blur-xl">
        <TabButton active={tab === 'posts'} onClick={() => setTab('posts')} count={counts.posts ?? 0} label="Posts" />
        <TabButton active={tab === 'about'} onClick={() => setTab('about')} label="About" />
      </div>

      {tab === 'posts' ? <PostsPanel username={username} /> : <AboutPanel user={user} />}
    </div>
  );
};

export default Profile;