import { Outlet, Link, useNavigate } from 'react-router-dom';
import Logo from '../components/ui/Logo';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useLogoutMutation } from '../api/authApi';
import NotificationBell from '../components/notifications/NotificationBell';
import toast from 'react-hot-toast';
import { useChatUnreadTotal } from '../hooks/useChatUnread';

const ChatIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChatUnreadBadge = () => {
  const total = useChatUnreadTotal();
  if (total <= 0) return null;
  return (
    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-[11px] font-bold text-white">
      {total > 99 ? '99+' : total}
    </span>
  );
};

const RootLayout = () => {
  const { isAuthenticated, user } = useAuth();
  const [logout] = useLogoutMutation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout(refreshTokenFromStorage()).unwrap();
    } finally {
      toast.success('Logged out. See you soon!');
      navigate('/');
    }
  };

  const refreshTokenFromStorage = () => localStorage.getItem('nexus_refresh_token');

  return (
    <div className="min-h-screen">
      <nav className="fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to={isAuthenticated ? `/u/${user?.username}` : '/'}>
          <Logo />
        </Link>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/feed">
                  <span className="glass inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:border-brand-300 hover:text-brand-600">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 4.5A2.5 2.5 0 016.5 2H20M6.5 9H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Feed
                  </span>
                </Link>
                <Link to="/compose">
                  <span className="glass inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:border-brand-300 hover:text-brand-600">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Compose
                  </span>
                </Link>
                <Link to="/explore">
                  <span className="glass inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:border-brand-300 hover:text-brand-600">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 16l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                    </svg>
                    Explore
                  </span>
                </Link>
                <Link to="/search">
                  <span className="glass inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:border-brand-300 hover:text-brand-600">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <path d="M21 21l-4.3-4.3M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    Search
                  </span>
                </Link>
                <Link to="/suggestions">
                  <span className="glass inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:border-brand-300 hover:text-brand-600">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM19 8v6M22 11h-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                    Suggestions
                  </span>
                </Link>
                <Link to="/saved">
                  <span className="glass inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:border-brand-300 hover:text-brand-600">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <path d="M6 3h12a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                    </svg>
                    Saved
                  </span>
                </Link>
                <NotificationBell />
                <Link to="/chat" className="relative">
                  <span className="glass inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:border-brand-300 hover:text-brand-600">
                    <ChatIcon />
                    Messages
                  </span>
                  <ChatUnreadBadge />
                </Link>
                <Link to="/reels">
                  <span className="glass inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:border-brand-300 hover:text-brand-600">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <path d="M17 14.5l4-2.5-4-2.5v5zM3 5h14v14H3V5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Reels
                  </span>
                </Link>
                <Link to="/reels/shared">
                  <span className="glass inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:border-brand-300 hover:text-brand-600">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Shared
                  </span>
                </Link>
                <Link to="/privacy">
                  <span className="glass inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:border-brand-300 hover:text-brand-600">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <path d="M12 21s-7-3.5-7-9V6l7-3 7 3v6c0 5.5-7 9-7 9z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Privacy
                  </span>
                </Link>
                <Link to="/security">
                  <span className="glass inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:border-brand-300 hover:text-brand-600">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2l8 3.5v6c0 5.2-3.4 8.6-8 10.5-4.6-1.9-8-5.3-8-10.5v-6L12 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Security
                  </span>
                </Link>
                <Link to={`/u/${user?.username}`}>
                  <span className="glass inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:border-brand-300 hover:text-brand-600">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-fuchsia-500 text-xs font-bold text-white">
                      {(user?.username || 'U')[0].toUpperCase()}
                    </span>
                    @{user?.username}
                  </span>
                </Link>
                <Button variant="secondary" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Get started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-24">
        <Outlet />
      </main>

      <footer className="mt-20 border-t border-slate-200/70 bg-white/50 py-10 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <Logo size="sm" />
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Nexus — Connect. Share. Inspire.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default RootLayout;