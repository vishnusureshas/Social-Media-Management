import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useGetSuggestionsQuery } from '../../api/userApi';
import { Avatar } from '../user/UserCard';
import FollowButton from '../user/FollowButton';
import Spinner from '../ui/Spinner';
import DashboardTrending from './DashboardTrending';

const formatCount = (n) => {
  const v = Number(n) || 0;
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
  return String(v);
};

const ProfileCard = () => {
  const { user } = useAuth();
  const counts = user?.counts || {};
  return (
    <div className="neon-frame relative overflow-hidden rounded-3xl p-4">
      <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-violet-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-14 -left-8 h-36 w-36 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="relative">
        <div className="flex items-center gap-3">
          <span className="relative shrink-0">
            <Avatar user={user} />
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#0a0e24] bg-emerald-400" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-base font-extrabold text-white">
              {user?.fullName || user?.username}
            </p>
            <p className="truncate text-sm text-slate-400">@{user?.username}</p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          {[
            { k: 'Posts', v: counts.posts ?? 0 },
            { k: 'Followers', v: counts.followers ?? 0 },
            { k: 'Following', v: counts.following ?? 0 },
          ].map((s) => (
            <div key={s.k} className="rounded-2xl bg-white/[0.05] px-2 py-2 ring-1 ring-white/10">
              <p className="font-display text-base font-extrabold text-white">{formatCount(s.v)}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{s.k}</p>
            </div>
          ))}
        </div>

        <Link
          to={`/u/${user?.username}`}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 py-2.5 text-sm font-bold text-white shadow-[0_0_26px_rgba(168,85,247,0.5)] transition-all duration-300 hover:brightness-110 hover:shadow-[0_0_38px_rgba(168,85,247,0.7)]"
        >
          View Profile
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

const SuggestionRow = ({ user }) => {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <div className="group flex items-center gap-3 rounded-2xl px-2 py-1.5 transition-colors hover:bg-white/[0.05]">
      <Link to={`/u/${user.username}`} className="shrink-0">
        <Avatar user={user} size="sm" />
      </Link>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-100">
          {user.fullName || user.username}
          {user.verified && (
            <svg className="ml-1 inline h-3.5 w-3.5 text-violet-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.4 2.4 3.4-.4.4 3.4L20 10l-1.8 2.6.1 3.4-3.4.4L12 20l-2.9-1.6-3.4-.4.1-3.4L4 10l1.8-2.6.4-3.4 3.4.4L12 2z" />
            </svg>
          )}
        </p>
        <p className="truncate text-xs text-slate-500">@{user.username}</p>
      </div>
      <FollowButton username={user.username} isFollowing={user.isFollowing} size="sm" />
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label={`Dismiss ${user.username}`}
        className="shrink-0 rounded-full p-1 text-slate-500 opacity-0 transition-all hover:bg-white/10 hover:text-white group-hover:opacity-100"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
  );
};

const SuggestionsCard = ({ title = 'Suggested for you', limit = 3, link = '/suggestions' }) => {
  const { data, isLoading } = useGetSuggestionsQuery(limit + 3);
  const suggestions = (data?.data?.suggestions || []).slice(0, limit);

  return (
    <div className="rounded-3xl border border-white/[0.09] bg-white/[0.04] p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-bold text-white">{title}</h3>
        <Link to={link} className="text-xs font-semibold text-slate-400 transition-colors hover:text-violet-300">
          See all
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-5">
          <Spinner size="sm" />
        </div>
      ) : suggestions.length === 0 ? (
        <p className="mt-3 rounded-2xl bg-white/[0.03] px-3 py-5 text-center text-sm text-slate-500">
          No suggestions right now — you're all caught up!
        </p>
      ) : (
        <div className="mt-2 space-y-0.5">
          {suggestions.map((s) => (
            <SuggestionRow key={s._id} user={s} />
          ))}
        </div>
      )}
    </div>
  );
};

const UpcomingEvents = () => {
  const events = [
    {
      icon: '🚀',
      title: 'Tech Innovators Meetup',
      meta: 'May 24, 2026 • 6:00 PM',
      loc: 'Bangalore, India',
    },
    {
      icon: '🤖',
      title: 'AI & Future Talk',
      meta: 'May 28, 2026 • 7:00 PM',
      loc: 'Online Event',
    },
    {
      icon: '🎨',
      title: 'Creator Summit',
      meta: 'Jun 04, 2026 • 5:30 PM',
      loc: 'Mumbai, India',
    },
  ];

  return (
    <div className="rounded-3xl border border-white/[0.09] bg-white/[0.04] p-4 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-bold text-white">Upcoming Events</h3>
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm text-white shadow-glow">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
          </svg>
        </span>
      </div>

      <div className="mt-3 space-y-2">
        {events.map((e) => (
          <div
            key={e.title}
            className="group flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-2.5 transition-all duration-300 hover:border-violet-400/40 hover:bg-white/[0.06]"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] text-lg ring-1 ring-white/10">
              {e.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-100">{e.title}</p>
              <p className="truncate text-xs text-slate-400">{e.meta}</p>
              <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] font-medium text-violet-300/80">
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21s-7-4.5-7-10a7 7 0 1114 0c0 5.5-7 10-7 10zM12 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
                {e.loc}
              </p>
            </div>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] opacity-0 ring-1 ring-white/10 transition-opacity group-hover:opacity-100">
              <span className="text-xs font-bold text-white">→</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const RightRail = () => (
  <div className="space-y-4">
    <ProfileCard />
    <DashboardTrending />
    <SuggestionsCard title="Who to follow" limit={3} link="/suggestions" />
    <UpcomingEvents />
  </div>
);

export default RightRail;