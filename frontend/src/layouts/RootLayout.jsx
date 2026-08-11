import { Outlet, Link, useNavigate } from 'react-router-dom';
import Logo from '../components/ui/Logo';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useLogoutMutation } from '../api/authApi';
import toast from 'react-hot-toast';

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
          <Link to={isAuthenticated ? '/account' : '/'}>
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/account">
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