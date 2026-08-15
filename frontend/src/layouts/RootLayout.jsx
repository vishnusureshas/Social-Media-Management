import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import Logo from '../components/ui/Logo';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useLogoutMutation } from '../api/authApi';
import toast from 'react-hot-toast';
import { useChatUnreadTotal } from '../hooks/useChatUnread';
import { useGetUnreadCountQuery } from '../api/notificationApi';
import cn from '../utils/cn';

const icons = {
  feed: (
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 4.5A2.5 2.5 0 016.5 2H20M6.5 9H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  compose: (
    <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  explore: (
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 16l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  ),
  search: (
    <path d="M21 21l-4.3-4.3M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  ),
  suggestions: (
    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM19 8v6M22 11h-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  ),
  saved: (
    <path d="M6 3h12a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  ),
  messages: (
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  reels: (
    <path d="M17 14.5l4-2.5-4-2.5v5zM3 5h14v14H3V5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  shared: (
    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  notifications: (
    <path d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-4-5.7V4a2 2 0 10-4 0v1.3A6 6 0 006 11v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 01-6 0v-1m6 0H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  privacy: (
    <path d="M12 21s-7-3.5-7-9V6l7-3 7 3v6c0 5.5-7 9-7 9z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  security: (
    <path d="M12 2l8 3.5v6c0 5.2-3.4 8.6-8 10.5-4.6-1.9-8-5.3-8-10.5v-6L12 2zM9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  report: (
    <path d="M3 3v18M3 5l15-1.5L16.5 9 18 18 3 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  moderation: (
    <path d="M12 21a9 9 0 100-18 9 9 0 000 18zM9 12.5l2 2 4-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  keywords: (
    <path d="M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0L3 13V3h10l7.6 7.6a2 2 0 010 2.8zM7 7h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
  hastags: (
    <path d="M9 3L7 21M17 3l-2 18M3.5 9h18M2.5 15h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  ),
  broadcast: (
    <path d="M3 12a9 9 0 0118 0M7 12a5 5 0 0110 0M12 12h.01M10 19l2-3 2 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  audit: (
    <path d="M12 8v4l3 3M12 3a9 9 0 100 18 9 9 0 000-18z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  settings: (
    <path d="M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.6 1.6 0 00.3 1.7l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-2.7 1.1V21a2 2 0 11-4 0v-.2a1.6 1.6 0 00-2.7-1.1l-.1.1a2 2 0 11-2.8-2.8l.1-.1A1.6 1.6 0 004.6 15H4.4a2 2 0 110-4h.2A1.6 1.6 0 007.3 8.3l-.1-.1a2 2 0 112.8-2.8l.1.1A1.6 1.6 0 0012.8 8V4a2 2 0 014 0v.2a1.6 1.6 0 002.7 1.1l.1-.1a2 2 0 112.8 2.8l-.1.1A1.6 1.6 0 0019.4 13h.2a2 2 0 110 4h-.2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  ),
};

const NavIcon = ({ name, className = 'h-5 w-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    {icons[name]}
  </svg>
);

const primaryNav = [
  { to: '/feed', label: 'Feed', icon: 'feed' },
  { to: '/explore', label: 'Explore', icon: 'explore' },
  { to: '/search', label: 'Search', icon: 'search' },
  { to: '/suggestions', label: 'Discover', icon: 'suggestions' },
  { to: '/saved', label: 'Saved', icon: 'saved' },
];

const socialNav = [
  { to: '/notifications', label: 'Notifications', icon: 'notifications' },
  { to: '/chat', label: 'Messages', icon: 'messages', chat: true },
  { to: '/reels', label: 'Reels', icon: 'reels' },
  { to: '/reels/shared', label: 'Shared Reels', icon: 'shared' },
];

const accountNav = [
  { to: '/privacy', label: 'Privacy', icon: 'privacy' },
  { to: '/security', label: 'Security', icon: 'security' },
  { to: '/reports', label: 'My Reports', icon: 'report' },
];

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

const NavRow = ({ to, label, icon, chat, onClick, end }) => {
  const chatTotal = useChatUnreadTotal();
  const { data } = useGetUnreadCountQuery(undefined, { pollingInterval: 30000 });
  const notifCount = data?.data?.count || 0;
  const badge = chat ? chatTotal : notifCount;

  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'group relative flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all duration-200',
          isActive
            ? 'bg-gradient-to-r from-brand-500/15 to-fuchsia-500/15 text-brand-700 ring-1 ring-brand-200'
            : 'text-slate-600 hover:bg-white hover:text-brand-600'
        )
      }
    >
      {({ isActive }) => (
        <>
          <span className={cn('shrink-0 transition-colors', isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-brand-500')}>
            <NavIcon name={icon} />
          </span>
          <span className="flex-1 truncate">{label}</span>
          {badge > 0 && (
            <span className={cn('flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold text-white', chat ? 'bg-brand-500' : 'bg-rose-500')}>
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
};

const SidebarGroup = ({ title, items }) => (
  <div className="space-y-1 px-3">
    {title && (
      <p className="px-3 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{title}</p>
    )}
    {items.map((item) => (
      <NavRow key={item.to} {...item} />
    ))}
  </div>
);

const MobileNavItem = ({ item, username }) => {
  const chatTotal = useChatUnreadTotal();
  const badge = item.chat ? chatTotal : 0;
  return (
    <NavLink
      to={item.to}
      end={item.to === `/u/${username}`}
      className={({ isActive }) =>
        cn(
          'relative flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold transition-colors',
          isActive ? 'text-brand-600' : 'text-slate-400'
        )
      }
    >
      {({ isActive }) => (
        <>
          <span className="relative">
            {item.icon === 'profile' ? (
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-fuchsia-500 text-[10px] font-bold text-white">
                {(username || 'U')[0].toUpperCase()}
              </span>
            ) : (
              <NavIcon name={item.icon} className="h-6 w-6" />
            )}
            {badge > 0 && (
              <span className="absolute -right-2 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[9px] font-bold text-white">
                {badge > 99 ? '99+' : badge}
              </span>
            )}
          </span>
          <span className={cn(isActive && 'font-bold')}>{item.label}</span>
        </>
      )}
    </NavLink>
  );
};

const RootLayout = () => {
  const { isAuthenticated, user } = useAuth();
  const [logout] = useLogoutMutation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout(localStorage.getItem('nexus_refresh_token')).unwrap();
    } finally {
      toast.success('Logged out. See you soon!');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen">
      {isAuthenticated && (
        <>
          <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-slate-200/60 bg-white/70 backdrop-blur-xl lg:flex">
            <div className="p-6">
              <Link to={`/u/${user?.username}`} className="inline-block">
                <Logo />
              </Link>
            </div>

            <nav className="flex-1 space-y-6 overflow-y-auto pb-6">
              <SidebarGroup items={primaryNav} />
              <SidebarGroup
                title="Create"
                items={[
                  { to: '/compose', label: 'New Post', icon: 'compose' },
                ]}
              />
              <SidebarGroup title="Social" items={socialNav} />
              <SidebarGroup title="Account" items={accountNav} />
              {['admin', 'superadmin'].includes(user?.role) && (
                <SidebarGroup title="Admin" items={adminNav} />
              )}
              {user?.role === 'superadmin' && (
                <SidebarGroup title="Superadmin" items={superAdminNav} />
              )}
            </nav>

            <div className="border-t border-slate-200/60 p-4">
              <Link
                to={`/u/${user?.username}`}
                className="flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-white"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-fuchsia-500 text-sm font-bold text-white">
                  {(user?.username || 'U')[0].toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-slate-800">{user?.fullName || user?.username}</span>
                  <span className="block truncate text-xs text-slate-400">@{user?.username}</span>
                </span>
              </Link>
              <Button variant="ghost" size="sm" className="mt-2 w-full text-rose-500 hover:bg-rose-50 hover:text-rose-600" onClick={handleLogout}>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Log out
              </Button>
            </div>
          </aside>

          <div className="lg:pl-72">
            <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-slate-200/60 bg-white/70 px-4 py-3 backdrop-blur-xl lg:hidden">
              <Link to={`/u/${user?.username}`}>
                <Logo />
              </Link>
              <div className="flex items-center gap-2">
                <div className="flex max-w-[10rem] items-center gap-2 rounded-2xl bg-white/70 px-2 py-1">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-fuchsia-500 text-xs font-bold text-white">
                    {(user?.username || 'U')[0].toUpperCase()}
                  </span>
                  <span className="truncate text-xs font-bold text-slate-700">@{user?.username}</span>
                </div>
                <Button variant="ghost" size="sm" className="text-rose-500 hover:bg-rose-50 hover:text-rose-600" onClick={handleLogout}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Button>
              </div>
            </header>

            <main className="pb-20 pt-24 lg:pt-10">
              <Outlet />
            </main>

            <footer className="mt-20 hidden border-t border-slate-200/60 bg-white/50 py-10 backdrop-blur-sm lg:block">
              <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
                <Logo size="sm" />
                <p className="text-sm text-slate-500">© {new Date().getFullYear()} Nexus — Connect. Share. Inspire.</p>
              </div>
            </footer>
          </div>

          <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/60 bg-white/80 backdrop-blur-xl lg:hidden">
            <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
              {[
                { to: '/feed', icon: 'feed', label: 'Home' },
                { to: '/explore', icon: 'explore', label: 'Explore' },
                { to: '/compose', icon: 'compose', label: 'Create' },
                { to: '/chat', icon: 'messages', label: 'Chat', chat: true },
                { to: `/u/${user?.username}`, icon: 'profile', label: 'Profile' },
              ].map((item) => (
                <MobileNavItem key={item.to} item={item} username={user?.username} />
              ))}
            </div>
          </nav>
        </>
      )}

      {!isAuthenticated && (
        <div>
          <nav className="fixed inset-x-0 top-0 z-40">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
              <Link to="/">
                <Logo />
              </Link>
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Log in</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Get started</Button>
                </Link>
              </div>
            </div>
          </nav>
          <main className="pt-24">
            <Outlet />
          </main>
        </div>
      )}
    </div>
  );
};

export default RootLayout;