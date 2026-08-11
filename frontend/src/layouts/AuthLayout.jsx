import { NavLink, useLocation } from 'react-router-dom';
import Logo from '../components/ui/Logo';
import { APP_NAME } from '../constants/api';

const authTabs = [
  { to: '/login', label: 'Log in' },
  { to: '/register', label: 'Create account' },
];

const AuthLayout = ({ title, subtitle, children, showTabs = true }) => {
  const location = useLocation();

  return (
    <div className="flex min-h-[calc(100vh-6rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md animate-fade-up">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="animate-scale-in">
            <Logo size="lg" />
          </div>
          <h2 className="mt-6 font-display text-3xl font-bold tracking-tight text-slate-900">
            {title}
          </h2>
          {subtitle && <p className="mt-2 max-w-sm text-sm text-slate-500">{subtitle}</p>}
        </div>

        {showTabs && (
          <div className="mb-6 flex rounded-2xl border border-slate-200/80 bg-white/70 p-1.5 backdrop-blur-md">
            {authTabs.map((tab) => {
              const active = location.pathname === tab.to;
              return (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  className={`flex-1 rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition-all duration-300 ${
                    active
                      ? 'bg-gradient-to-r from-brand-500 via-violet-500 to-fuchsia-500 text-white shadow-glow'
                      : 'text-slate-500 hover:text-brand-600'
                  }`}
                >
                  {tab.label}
                </NavLink>
              );
            })}
          </div>
        )}

        <div className="glass-strong rounded-3xl p-8">{children}</div>

        <p className="mt-6 text-center text-xs text-slate-400">
          By continuing, you agree to the {APP_NAME} Terms &amp; Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;