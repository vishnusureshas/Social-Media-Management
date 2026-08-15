import { NavLink, useLocation } from 'react-router-dom';
import Logo from '../components/ui/Logo';
import { APP_NAME } from '../constants/api';

const authTabs = [
  { to: '/login', label: 'Log in' },
  { to: '/register', label: 'Create account' },
];

const features = [
  {
    title: 'Real-time chat',
    desc: 'Instant DMs with typing, read receipts and presence.',
    icon: (
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    title: 'Stories & Reels',
    desc: 'Share moments and short videos that disappear with the vibe.',
    icon: (
      <path d="M17 14.5l4-2.5-4-2.5v5zM3 5h14v14H3V5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    title: 'AI-curated feed',
    desc: 'A smart home that learns what you love and never feels noisy.',
    icon: (
      <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 16l1 2.5 2.5 1-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1 1-2.5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    ),
  },
  {
    title: 'Total privacy',
    desc: 'Granular controls, block list and two-factor security built in.',
    icon: (
      <path d="M12 21s-7-3.5-7-9V6l7-3 7 3v6c0 5.5-7 9-7 9z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
];

const stats = [
  { value: '2.4M+', label: 'Creators' },
  { value: '98ms', label: 'Avg. latency' },
  { value: '40+', label: 'Features' },
  { value: '24/7', label: 'Private & safe' },
];

const PreviewCard = () => (
  <div className="glass-strong w-full max-w-sm rounded-3xl p-5 shadow-2xl animate-scale-in">
    <div className="mb-4 flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-fuchsia-500 text-sm font-bold text-white">
        A
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-slate-800">Aria Khan</p>
        <p className="text-xs text-emerald-500">● online now</p>
      </div>
    </div>
    <div className="space-y-2.5">
      <div className="ml-auto max-w-[75%] rounded-2xl rounded-tr-sm bg-gradient-to-r from-brand-500 to-fuchsia-500 px-4 py-2 text-sm text-white">
        Hey! Your new reel is trending 🎬
      </div>
      <div className="max-w-[80%] rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-2 text-sm text-slate-700">
        No way! I just posted it an hour ago 🔥
      </div>
      <div className="ml-auto max-w-[65%] rounded-2xl rounded-tr-sm bg-gradient-to-r from-brand-500 to-fuchsia-500 px-4 py-2 text-sm text-white">
        +3.2k views already. Keep it up!
      </div>
      <p className="pl-1 text-[10px] font-medium text-violet-500">Aria is typing…</p>
    </div>
  </div>
);

const AuthLayout = ({ title, subtitle, children, showTabs = true }) => {
  const location = useLocation();

  return (
    <div className="relative flex min-h-[calc(100vh-6rem)] items-center justify-center overflow-hidden px-4 py-10 lg:py-12">
      <div className="grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
        {/* ----- LEFT: FORM ----- */}
        <div className="animate-fade-up">
          <div className="mb-7 flex flex-col items-center text-center lg:items-start lg:text-left">
            <Logo size="lg" />
            <h2 className="mt-6 font-display text-3xl font-bold tracking-tight text-slate-900 lg:text-4xl">
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

          <p className="mt-6 text-center text-xs text-slate-400 lg:text-left">
            By continuing, you agree to the {APP_NAME} Terms &amp; Privacy Policy
          </p>
        </div>

        {/* ----- RIGHT: CONTENT SHOWCASE ----- */}
        <div className="relative hidden lg:block">
          <div className="absolute -right-16 -top-10 h-72 w-72 rounded-full bg-fuchsia-500/25 blur-3xl" />
          <div className="absolute -bottom-12 -left-16 h-72 w-72 rounded-full bg-brand-500/25 blur-3xl" />

          <div className="relative space-y-8">
            <div className="rounded-3xl bg-gradient-to-br from-brand-500/10 via-violet-500/10 to-fuchsia-500/10 p-8 ring-1 ring-white/60 backdrop-blur-sm">
              <h3 className="font-display text-2xl font-bold leading-snug text-slate-900">
                Where every post,
                <span className="text-gradient"> reel &amp; story </span>
                gets the love it deserves.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                Meet {APP_NAME} — a futuristic social platform for sharing what matters,
                connecting in real time, and protecting your space every step of the way.
              </p>

              <ul className="mt-6 grid grid-cols-2 gap-4">
                {features.map((f) => (
                  <li key={f.title} className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/80 text-brand-600">
                      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                        {f.icon}
                      </svg>
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-slate-800">{f.title}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">{f.desc}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-start justify-between gap-6">
              <PreviewCard />
              <div className="glass-strong w-36 shrink-0 space-y-4 rounded-3xl p-5 text-center shadow-xl animate-fade-up">
                {stats.map((s) => (
                  <div key={s.label}>
                    <p className="font-display text-xl font-bold text-gradient">{s.value}</p>
                    <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;