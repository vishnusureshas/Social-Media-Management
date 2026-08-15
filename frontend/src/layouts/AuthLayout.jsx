import { NavLink, useLocation } from 'react-router-dom';
import LandingNavbar from '../components/landing/LandingNavbar';
import AuthVisual from '../components/auth/AuthVisual';
import SocialAuth from '../components/auth/SocialAuth';
import FeatureBar from '../components/auth/FeatureBar';
import cn from '../utils/cn';

const authTabs = [
  { to: '/login', label: 'Log in' },
  { to: '/register', label: 'Sign up' },
];

const mobileStats = ['2M+ Users', '100K+ Communities', '10M+ Posts'];

const AuthLayout = ({
  variant = 'login',
  title = '',
  subtitle = '',
  children,
  showTabs = true,
  social = false,
  ctaWord = 'Continue',
}) => {
  const location = useLocation();

  return (
    <div className="landing auth relative flex min-h-screen flex-col overflow-x-clip">
      <LandingNavbar />
      <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-5 pb-12 pt-28 sm:px-8 lg:flex-row lg:items-center lg:gap-16 lg:pt-24">
        {/* ---- Mobile / tablet brand header ---- */}
        <div className="mb-8 flex flex-col items-center text-center lg:hidden">
          <LandingLogo />
          <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            {title}
          </h1>
          {subtitle && <p className="mt-2 max-w-sm text-sm text-slate-400">{subtitle}</p>}
          <p className="mt-4 text-xs font-semibold text-slate-500">{mobileStats.join(' · ')}</p>
        </div>

        {/* ---- Left visual scene (desktop) ---- */}
        <AuthVisual variant={variant} />

        {/* ---- Right auth card ---- */}
        <div className="relative w-full shrink-0 lg:w-[480px]">
          {showTabs && (
            <div className="mb-4 flex rounded-2xl border border-white/10 bg-white/[0.04] p-1.5 backdrop-blur-md">
              {authTabs.map((tab) => {
                const active = location.pathname === tab.to;
                return (
                  <NavLink
                    key={tab.to}
                    to={tab.to}
                    className={cn(
                      'flex-1 rounded-xl px-4 py-2.5 text-center text-sm font-semibold transition-all duration-300',
                      active ? 'btn-neon shadow-none' : 'text-slate-400 hover:text-white'
                    )}
                  >
                    {tab.label}
                  </NavLink>
                );
              })}
            </div>
          )}

          <div className="auth-card auth-corners relative rounded-[1.6rem] p-7 sm:p-9">
            <div className="mb-7 flex flex-col items-center text-center">
              <h2 className="font-display text-2xl font-extrabold tracking-tight text-white sm:text-[1.7rem]">
                {title}
              </h2>
              {subtitle && <p className="mt-1.5 text-sm text-slate-400">{subtitle}</p>}
            </div>

            {social && <SocialAuth ctaWord={ctaWord} />}

            {children}

            <div className="mt-7 flex items-center justify-center gap-2 border-t border-white/[0.07] pt-5 text-xs text-slate-500">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-emerald-400/80" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l8 3.2v5.4c0 5.2-3.4 9-8 11.4-4.6-2.4-8-6.2-8-11.4V5.2L12 2z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
              Your data is safe with us
            </div>
          </div>
        </div>
      </div>

      {/* ---- Shared bottom feature bar ---- */}
      <FeatureBar />
    </div>
  );
};

export default AuthLayout;