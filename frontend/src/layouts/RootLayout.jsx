import { useEffect, useState } from 'react';
import { Outlet, Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLogoutMutation } from '../api/authApi';
import toast from 'react-hot-toast';
import { useChatUnreadTotal } from '../hooks/useChatUnread';
import { useGetUnreadCountQuery } from '../api/notificationApi';
import RightRail from '../components/dashboard/RightRail';
import cn from '../utils/cn';

const icons = {
  feed: (
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 4.5A2.5 2.5 0 016.5 2H20M6.5 9H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  explore: (
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 16l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  ),
  communities: (
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M10 11a4 4 0 100-8 4 4 0 000 8zM19 8v6M22 11h-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  ),
  messages: (
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  notifications: (
    <path d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-4-5.7V4a2 2 0 10-4 0v1.3A6 6 0 006 11v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 01-6 0v-1m6 0H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  bookmarks: (
    <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  saved: (
    <path d="M6 3h12a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  ),
  profile: (
    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  settings: (
    <path d="M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.6 1.6 0 00.3 1.7l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-2.7 1.1V21a2 2 0 11-4 0v-.2a1.6 1.6 0 00-2.7-1.1l-.1.1a2 2 0 11-2.8-2.8l.1-.1A1.6 1.6 0 004.6 15H4.4a2 2 0 110-4h.2A1.6 1.6 0 007.3 8.3l-.1-.1a2 2 0 112.8-2.8l.1.1A1.6 1.6 0 0012.8 8V4a2 2 0 014 0v.2a1.6 1.6 0 002.7 1.1l.1-.1a2 2 0 112.8 2.8l-.1.1A1.6 1.6 0 0019.4 13h.2a2 2 0 110 4h-.2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  ),
  compose: (
    <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  dashboard: (
    <path d="M3 3h8v8H3V3zM13 3h8v5h-8V3zM13 10h8v11h-8V10zM3 13h8v8H3v-8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  ),
  users: (
    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM19 8v6M22 11h-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  ),
  posts: (
    <path d="M6 3h12a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  ),
  stories: (
    <path d="M3 5h18v14H3V5zM8 9v6l5-3-5-3z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  comments: (
    <path d="M21 12a8 8 0 01-11.6 7.1L4 21l1.5-4.2A8 8 0 1121 12zM8.5 12h.01M12 12h.01M15.5 12h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  reels: (
    <path d="M17 14.5l4-2.5-4-2.5v5zM3 5h14v14H3V5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  hastags: (
    <path d="M9 3L7 21M17 3l-2 18M3.5 9h18M2.5 15h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  ),
  broadcast: (
    <path d="M3 12a9 9 0 0118 0M7 12a5 5 0 0110 0M12 12h.01M10 19l2-3 2 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  audit: (
    <path d="M12 8v4l3 3M12 3a9 9 0 100 18 9 9 0 000-18z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  moderation: (
    <path d="M12 21a9 9 0 100-18 9 9 0 000 18zM9 12.5l2 2 4-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  keywords: (
    <path d="M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0L3 13V3h10l7.6 7.6a2 2 0 010 2.8zM7 7h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  report: (
    <path d="M3 3v18M3 5l15-1.5L16.5 9 18 18 3 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  security: (
    <path d="M12 2l8 3.5v6c0 5.2-3.4 8.6-8 10.5-4.6-1.9-8-5.3-8-10.5v-6L12 2zM9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  privacy: (
    <path d="M12 21s-7-3.5-7-9V6l7-3 7 3v6c0 5.5-7 9-7 9z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  shared: (
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
};

const NavIcon = ({ name, className = 'h-5 w-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    {icons[name]}
  </svg>
);

const primaryNav = [
  { to: '/feed', label: 'Home', icon: 'feed' },
  { to: '/explore', label: 'Explore', icon: 'explore' },
  { to: '/suggestions', label: 'Communities', icon: 'communities' },
  { to: '/saved', label: 'Saved', icon: 'saved' },
  { to: '/u', label: 'Profile', icon: 'profile' },
];

const socialNav = [
  { to: '/chat', label: 'Messages', icon: 'messages', chat: true },
  { to: '/notifications', label: 'Notifications', icon: 'notifications', notif: true },
];

const settingsNav = [{ to: '/account', label: 'Settings', icon: 'settings' }];

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { to: '/admin/users', label: 'Users', icon: 'users' },
  { to: '/admin/posts', label: 'Posts', icon: 'posts' },
  { to: '/admin/reels', label: 'Reels', icon: 'reels' },
  { to: '/admin/stories', label: 'Stories', icon: 'stories' },
  { to: '/admin/comments', label: 'Comments', icon: 'comments' },
  { to: '/admin/hashtags', label: 'Hashtags', icon: 'hastags' },
  { to: '/admin/reports', label: 'Moderation', icon: 'moderation' },
  { to: '/admin/keywords', label: 'Keywords', icon: 'keywords' },
];

const superAdminNav = [
  { to: '/admin/broadcast', label: 'Broadcast', icon: 'broadcast' },
  { to: '/admin/audit-logs', label: 'Audit logs', icon: 'audit' },
  { to: '/admin/settings', label: 'Settings', icon: 'settings' },
];

const NavRow = ({ to, label, icon, chat, notif, user, end, onClick }) => {
  const chatTotal = useChatUnreadTotal();
  const { data } = useGetUnreadCountQuery(undefined, { pollingInterval: 30000 });
  const notifCount = data?.data?.count || 0;
  const badge = chat ? chatTotal : notif ? notifCount : 0;
  const resolvedTo = to === '/u' && user?.username ? `/u/${user.username}` : to;

  return (
    <NavLink
      to={resolvedTo}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'group relative flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-semibold transition-all duration-200',
          isActive
            ? 'dash-nav-active text-white'
            : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
        )
      }
    >
      <span className="shrink-0 transition-colors group-hover:text-violet-300">
        <NavIcon name={icon} />
      </span>
      <span className="flex-1 truncate">{label}</span>
      {badge > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 px-1.5 text-[11px] font-bold text-white shadow-glow">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </NavLink>
  );
};

const SidebarGroup = ({ title, items, user, onClick }) => (
  <div className="space-y-0.5 px-3">
    {title && (
      <p className="px-3 pb-1 pt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{title}</p>
    )}
    {items.map((item) => (
      <NavRow key={`${item.to}-${item.label}`} {...item} user={user} onClick={onClick} />
    ))}
  </div>
);

const DesktopSidebar = ({ user }) => (
  <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-white/[0.06] bg-[rgba(8,10,27,0.62)] backdrop-blur-2xl lg:flex">
    <div className="border-b border-white/[0.06] px-6 py-5">
      <Link to="/feed" className="flex items-center gap-2.5">
        <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 shadow-[0_0_26px_rgba(168,85,247,0.55)]">
          <svg viewBox="0 0 32 32" className="h-3/5 w-3/5" fill="none">
            <path d="M12 8l8 16 8-16" stroke="white" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-cyan-300" style={{ boxShadow: '0 0 12px 2px rgba(34,211,238,0.9)' }} />
        </span>
        <span
          className="font-display text-[1.35rem] font-extrabold tracking-tight text-white"
          style={{
            background: 'linear-gradient(100deg,#fff 0%,#e9d5ff 45%,#f5d0fe 70%,#a5f3fc 100%)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Nexus
        </span>
      </Link>
    </div>

    <nav className="flex-1 overflow-y-auto py-3 [scrollbar-width:thin]">
      <SidebarGroup title="Menu" items={primaryNav} user={user} />
      <SidebarGroup title="Social" items={socialNav} user={user} />
      <SidebarGroup title="Settings" items={settingsNav} user={user} />

      <div className="px-3 pt-2">
        <Link
          to="/compose"
          className="btn-gradient flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-white"
        >
          <NavIcon name="compose" className="h-4 w-4" />
          Create Post
        </Link>
      </div>

      {['admin', 'superadmin'].includes(user?.role) && (
        <SidebarGroup title="Admin" items={adminNav} user={user} />
      )}
      {user?.role === 'superadmin' && (
        <SidebarGroup title="Superadmin" items={superAdminNav} user={user} />
      )}
    </nav>

    <div className="border-t border-white/[0.06] p-4">
      <div className="flex items-center gap-3 rounded-2xl bg-white/[0.03] p-2.5 ring-1 ring-white/[0.07]">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white">
          {(user?.username || 'U')[0].toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-white">{user?.fullName || user?.username}</p>
          <p className="truncate text-xs text-slate-500">@{user?.username}</p>
        </div>
        <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" style={{ boxShadow: '0 0 10px 1px rgba(52,211,153,0.8)' }} />
      </div>
      <p className="mt-2.5 text-center text-[10px] font-medium text-slate-600">
        © {new Date().getFullYear()} Nexus · Connect. Share. Inspire.
      </p>
    </div>
  </aside>
);

const TopBarIcon = ({ to, badge, label, children }) => (
  <NavLink
    to={to}
    aria-label={label}
    className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.09] bg-white/[0.04] text-slate-300 transition-all hover:border-violet-400/40 hover:text-white hover:shadow-[0_0_22px_rgba(168,85,247,0.25)]"
  >
    {children}
    {badge > 0 && (
      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-1.5 text-[10px] font-bold text-white shadow-glow">
        {badge > 99 ? '99+' : badge}
      </span>
    )}
  </NavLink>
);

const TopBar = ({ user, onToggleTheme, onLogout }) => {
  const chatTotal = useChatUnreadTotal();
  const { data } = useGetUnreadCountQuery(undefined, { pollingInterval: 30000 });
  const notifCount = data?.data?.count || 0;
  const navigate = useNavigate();
  const [dropdown, setDropdown] = useState(false);
  const [query, setQuery] = useState('');

  const submit = (e) => {
    e.preventDefault();
    navigate(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : '/search');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[rgba(7,8,21,0.78)] backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-3 px-4 lg:px-8">
        <Link to="/feed" className="shrink-0 lg:hidden" aria-label="Nexus home">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500">
            <svg viewBox="0 0 32 32" className="h-3/5 w-3/5" fill="none">
              <path d="M12 8l8 16 8-16" stroke="white" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </Link>

        <form onSubmit={submit} className="relative min-w-0 flex-1 max-w-xl">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none">
              <path d="M21 21l-4.3-4.3M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for people, communities, or posts..."
            className="h-10 w-full rounded-2xl border border-white/[0.1] bg-white/[0.04] pl-11 pr-10 text-sm text-white outline-none transition-all placeholder:text-slate-500 focus:border-violet-400/60 focus:ring-4 focus:ring-violet-500/10"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-lg border border-white/10 bg-white/[0.05] px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 sm:block">
            ⏎
          </kbd>
        </form>

        <div className="ml-auto flex items-center gap-2 lg:gap-2.5">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.09] bg-white/[0.04] text-slate-300 transition-all hover:border-cyan-400/40 hover:text-white hover:shadow-[0_0_22px_rgba(34,211,238,0.25)]"
          >
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4.2" />
              <path d="M12 2.5v2.2M12 19.3v2.2M4.3 4.3l1.5 1.5M18.2 18.2l1.5 1.5M2.5 12h2.2M19.3 12h2.2M4.3 19.7l1.5-1.5M18.2 5.8l1.5-1.5" />
            </svg>
          </button>

          <TopBarIcon to="/chat" badge={chatTotal} label="Messages">
            <NavIcon name="messages" className="h-5 w-5" />
          </TopBarIcon>
          <TopBarIcon to="/notifications" badge={notifCount} label="Notifications">
            <NavIcon name="notifications" className="h-5 w-5" />
          </TopBarIcon>

          <div className="relative ml-1 border-l border-white/[0.07] pl-3">
            <button
              type="button"
              onClick={() => setDropdown((v) => !v)}
              className="flex items-center gap-2.5 rounded-2xl p-1.5 pr-2 transition-colors hover:bg-white/[0.05]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white">
                {(user?.username || 'U')[0].toUpperCase()}
              </span>
              <span className="hidden text-left md:block">
                <span className="block max-w-[8rem] truncate text-sm font-bold text-white">
                  {user?.fullName || user?.username}
                </span>
                <span className="block text-[11px] text-slate-500">@{user?.username}</span>
              </span>
              <svg
                viewBox="0 0 24 24"
                className={cn('h-4 w-4 text-slate-400 transition-transform duration-300', dropdown && 'rotate-180')}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </button>

            {dropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdown(false)} />
                <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-3xl border border-white/[0.1] bg-[#0b0f26]/95 p-2 shadow-[0_30px_90px_-24px_rgba(0,0,0,0.9)] backdrop-blur-2xl animate-fade-up">
                  {[
                    { to: `/u/${user?.username}`, label: 'My Profile', icon: 'profile' },
                    { to: '/saved', label: 'Bookmarks', icon: 'bookmarks' },
                    { to: '/account', label: 'Account Settings', icon: 'settings' },
                  ].map((it) => (
                    <Link
                      key={it.label}
                      to={it.to}
                      onClick={() => setDropdown(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white"
                    >
                      <NavIcon name={it.icon} className="h-4 w-4" />
                      {it.label}
                    </Link>
                  ))}
                  <div className="my-1 border-t border-white/[0.07]" />
                  <button
                    type="button"
                    onClick={() => {
                      setDropdown(false);
                      onLogout();
                    }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-rose-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                    </svg>
                    Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

const MobileBottomNav = ({ user }) => {
  const chatTotal = useChatUnreadTotal();
  const items = [
    { to: '/feed', icon: 'feed', label: 'Home' },
    { to: '/explore', icon: 'explore', label: 'Explore' },
    { center: true, to: '/compose', label: 'Create', icon: 'compose' },
    { to: '/chat', icon: 'messages', label: 'Chat', chat: true },
    { to: `/u/${user?.username}`, icon: 'profile', label: 'Profile' },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.07] bg-[rgba(8,10,27,0.85)] backdrop-blur-2xl lg:hidden">
      <div className="mx-auto flex max-w-md items-end justify-around px-2 py-2">
        {items.map((item) =>
          item.center ? (
            <Link
              key="create-fab"
              to={item.to}
              className="relative z-10 -mt-8 flex flex-col items-center"
              aria-label="Create post"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 text-white shadow-[0_0_34px_rgba(168,85,247,0.65)] ring-4 ring-[#080a1b] transition-transform hover:scale-105">
                <NavIcon name="compose" className="h-6 w-6" />
              </span>
              <span className="mt-1 text-[10px] font-semibold text-slate-400">{item.label}</span>
            </Link>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/feed'}
              className={({ isActive }) =>
                cn(
                  'relative flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold transition-colors',
                  isActive ? 'text-violet-300' : 'text-slate-500'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative">
                    <NavIcon name={item.icon} className="h-6 w-6" />
                    {item.chat && chatTotal > 0 && (
                      <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-1 text-[9px] font-bold text-white">
                        {chatTotal > 99 ? '99+' : chatTotal}
                      </span>
                    )}
                  </span>
                  <span className={cn(isActive && 'font-bold')}>{item.label}</span>
                </>
              )}
            </NavLink>
          )
        )}
      </div>
    </nav>
  );
};

const railRoutes = ['/feed', '/explore', '/search', '/suggestions', '/saved', '/notifications'];

const showRightRail = (pathname) => {
  if (railRoutes.includes(pathname)) return true;
  if (pathname.startsWith('/tag/')) return true;
  if (pathname.startsWith('/u/') && !pathname.endsWith('/edit')) return true;
  return false;
};

const RootLayout = () => {
  const { isAuthenticated, user } = useAuth();
  const [logout] = useLogoutMutation();
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('nexus_dash_theme') || 'midnight');
  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email', '/admin/login'].includes(location.pathname);

  useEffect(() => {
    localStorage.setItem('nexus_dash_theme', theme);
  }, [theme]);

  const handleLogout = async () => {
    try {
      await logout(localStorage.getItem('nexus_refresh_token')).unwrap();
    } finally {
      toast.success('Logged out. See you soon!');
      navigate('/');
    }
  };

  const toggleTheme = () => setTheme((t) => (t === 'midnight' ? 'neon' : 'midnight'));
  const rail = showRightRail(location.pathname);

  return (
    <div className="min-h-screen">
      {isAuthenticated && (
        <div className="dashboard dash-canvas" data-theme={theme}>
          <DesktopSidebar user={user} />
          <div className="lg:pl-72">
            <TopBar user={user} theme={theme} onToggleTheme={toggleTheme} onLogout={handleLogout} />

            <div className="mx-auto max-w-[1280px] px-4 pb-24 pt-5 lg:px-8 lg:pb-12">
              <div className={cn('flex items-start gap-8', rail && 'xl:justify-center')}>
                <main className={cn('min-w-0 flex-1', rail && 'max-w-[680px]')}>
                  <Outlet />
                </main>

                {rail && (
                  <aside className="hidden w-[350px] shrink-0 xl:block">
                    <div className="sticky top-[5.5rem]">
                      <RightRail />
                    </div>
                  </aside>
                )}
              </div>
            </div>
          </div>

          <MobileBottomNav user={user} />
        </div>
      )}

      {!isAuthenticated && (
        <div>
          {!isAuthPage && (
            <nav className="fixed inset-x-0 top-0 z-40 border-b border-white/[0.06] bg-[rgba(7,9,24,0.55)] backdrop-blur-xl">
              <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <Link to="/" aria-label="Nexus home" className="flex items-center gap-2.5">
                  <span className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 shadow-[0_0_26px_rgba(168,85,247,0.55)]">
                    <svg viewBox="0 0 32 32" className="h-3/5 w-3/5" fill="none">
                      <path d="M12 8l8 16 8-16" stroke="white" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-cyan-300" style={{ boxShadow: '0 0 12px 2px rgba(34,211,238,0.9)' }} />
                  </span>
                  <span
                    className="font-display text-[1.35rem] font-extrabold tracking-tight text-white"
                    style={{
                      background: 'linear-gradient(100deg,#fff 0%,#e9d5ff 45%,#f5d0fe 70%,#a5f3fc 100%)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      color: 'transparent',
                    }}
                  >
Nexus
                  </span>
                </Link>
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="rounded-xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_0_22px_rgba(168,85,247,0.5)] transition-all duration-300 hover:brightness-110"
                  >
                    Get started
                  </Link>
                </div>
              </div>
            </nav>
          )}
          <main className={isAuthPage ? '' : 'pt-24'}>
            <Outlet />
          </main>
        </div>
      )}
    </div>
  );
};

export default RootLayout;