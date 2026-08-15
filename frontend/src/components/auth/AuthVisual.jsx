import cn from '../../utils/cn';
import Avatar from '../auth/Avatar';

const stats = [
  { value: '2M+', label: 'Active Users' },
  { value: '100K+', label: 'Communities' },
  { value: '10M+', label: 'Posts Shared' },
];

const avatars = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=faces',
];

const Skyline = ({ className }) => {
  const buildings = Array.from({ length: 22 }, (_, i) => ({
    x: i * 28,
    w: 22 + ((i * 17) % 18),
    h: 70 + ((i * 53) % 130),
  }));

  return (
    <svg viewBox="0 0 620 240" preserveAspectRatio="xMidYMax meet" className={cn('select-none', className)} aria-hidden="true">
      <rect x="0" y="0" width="620" height="240" fill="url(#skyGrad)" />
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#0b0e28" stopOpacity="0.0" />
          <stop offset="100%" stopColor="#1b1040" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      {buildings.map((b, i) => (
        <g key={i} opacity="0.9">
          <rect x={b.x} y={240 - b.h} width={b.w} height={b.h} fill="#0d1132" />
          <rect x={b.x} y={240 - b.h} width={b.w} height="3" fill={i % 3 === 0 ? '#22d3ee' : '#7c3aed'} opacity="0.55" />
          {Array.from({ length: Math.floor(b.h / 22) }).map((_, j) => (
            <rect
              key={j}
              x={b.x + 4}
              y={240 - b.h + 8 + j * 22}
              width="5"
              height="6"
              rx="1"
              fill={i % 4 === 0 ? '#e879f9' : '#22d3ee'}
              opacity="0.35"
            />
          ))}
          <rect
            x={b.x + b.w / 2 - 3}
            y={240 - b.h + 14}
            width="6"
            height="5"
            rx="1"
            fill="#22d3ee"
            opacity={0.5}
          />
        </g>
      ))}
    </svg>
  );
};

const StoryRow = () => (
  <div className="flex items-center gap-2">
    <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-xs text-slate-300">
      +
    </span>
    {[2, 3, 4].map((i) => (
      <span key={i} className="rounded-full bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-cyan-400 p-[2px]">
        <span className="block rounded-full border-2 border-[#070a18]">
          <Avatar src={avatars[i % 4]} className="h-8 w-8" />
        </span>
      </span>
    ))}
  </div>
);

const MiniPost = () => (
  <div className="mt-2.5 overflow-hidden rounded-xl border border-white/5">
    <img
      src="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=320&h=240&fit=crop"
      alt=""
      className="h-20 w-full object-cover"
    />
    <div className="flex items-center gap-2 bg-white/[0.03] px-2 py-1.5 text-slate-300">
      <svg viewBox="0 0 24 24" className="h-3 w-3 text-rose-400" fill="currentColor">
        <path d="M12 21s-7.5-4.9-10-9.4C.3 8 2.3 4.5 5.7 4.5c2 0 3.4 1.1 4.3 2.6.9-1.5 2.3-2.6 4.3-2.6 3.4 0 5.4 3.5 3.7 7.1C19.5 16.1 12 21 12 21z" />
      </svg>
      <span className="text-[8px] font-semibold">2.4k</span>
      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M21 12a8 8 0 01-8 8H4l2-3.2A8 8 0 1121 12z" />
      </svg>
      <span className="text-[8px] font-semibold">381</span>
      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
      </svg>
      <span className="text-[8px] font-semibold">1.1k</span>
    </div>
  </div>
);

const LoginScene = () => (
  <div className="relative h-[430px] w-full">
    <div className="radial-glow left-1/3 top-6 h-72 w-72 bg-fuchsia-600/20" />
    <Skyline className="absolute inset-x-0 bottom-0 h-[300px] w-full" />

    <div className="animate-drift absolute right-[4%] top-[6%] z-10">
      <div className="neon-border w-[198px] rotate-[6deg] rounded-[2rem] p-[3px] shadow-[0_30px_80px_-30px_rgba(88,28,135,0.9)]">
        <div className="rounded-[1.7rem] bg-[#070a18] p-3">
          <div className="flex justify-between px-0.5 text-[8px] font-semibold text-slate-400">
            <span>9:41</span>
            <span>•••</span>
          </div>
          <div className="mt-2">
            <StoryRow />
          </div>
          <MiniPost />
        </div>
      </div>
    </div>

    <span className="icon-orb animate-drift absolute left-[16%] top-[22%] h-11 w-11 rounded-2xl" style={{ animationDelay: '0.7s' }}>
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M12 21s-7.5-4.9-10-9.4C.3 8 2.3 4.5 5.7 4.5c2 0 3.4 1.1 4.3 2.6.9-1.5 2.3-2.6 4.3-2.6 3.4 0 5.4 3.5 3.7 7.1C19.5 16.1 12 21 12 21z" />
      </svg>
    </span>
    <span className="icon-orb animate-drift absolute left-[4%] bottom-[30%] h-11 w-11 rounded-full" style={{ animationDelay: '1.4s' }}>
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M21 12a8 8 0 01-8 8H4l2-3.2A8 8 0 1121 12z" />
      </svg>
    </span>
    <span className="icon-orb animate-drift absolute right-[30%] top-[52%] h-10 w-10 rounded-full" style={{ animationDelay: '2.1s' }}>
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M12 2l2.4 5.6L20 9l-4.3 4.2L16.6 20 12 16.6 7.4 20l1-6.8L4 9l5.6-1.4L12 2z" />
      </svg>
    </span>
    <span className="icon-orb animate-drift absolute bottom-[12%] left-[38%] h-10 w-10 rounded-2xl" style={{ animationDelay: '0.4s' }}>
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-4-5.7V4a2 2 0 10-4 0v1.3A6 6 0 006 11v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 01-6 0v-1m6 0H9" />
      </svg>
    </span>

    <div className="glass-card-strong animate-drift absolute bottom-[6%] left-[4%] z-10 flex items-center gap-2.5 rounded-2xl p-3">
      <Avatar src={avatars[0]} className="h-8 w-8" />
      <p className="text-xs leading-tight">
        <span className="font-bold text-white">Luna</span>
        <span className="block text-[10px] text-slate-400">joined Cosmic Creators ✨</span>
      </p>
    </div>
  </div>
);

const Planet = ({ className }) => (
  <div className={cn('relative', className)}>
    <div
      className="absolute left-1/2 top-1/2 h-[150px] w-[150px] -translate-x-1/2 -translate-y-1/2 rounded-full"
      style={{
        background:
          'radial-gradient(circle at 35% 30%, #c084fc, #a855f7 45%, #7c3aed 70%, #4c1d95 100%)',
        boxShadow: '0 0 60px rgba(168,85,247,0.7), inset -18px -18px 40px rgba(59,7,100,0.8)',
      }}
    />
    <div className="absolute left-1/2 top-1/2 h-[210px] w-[210px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan-300/40" style={{ transform: 'translate(-50%,-50%) rotate(-18deg)', borderTopColor: 'transparent' }} />
    <div className="absolute left-1/2 top-1/2 h-[170px] w-[170px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-fuchsia-300/20" style={{ transform: 'translate(-50%,-50%) rotate(40deg)', borderBottomColor: 'transparent' }} />
  </div>
);

const RegisterScene = () => (
  <div className="relative h-[430px] w-full">
    <div className="radial-glow left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 bg-violet-600/25" />
    <Planet className="absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2" />

    {[
      { style: { left: '12%', top: '10%' } },
      { style: { right: '10%', top: '22%' } },
      { style: { left: '6%', bottom: '18%' } },
      { style: { right: '16%', bottom: '8%' } },
    ].map((pos, i) => (
      <div key={i} className="animate-drift absolute z-10" style={{ ...pos.style, animationDelay: `${i * 0.5}s` }}>
        <span className="rounded-full bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-cyan-400 p-[2px]">
          <span className="block rounded-full border-2 border-[#05060f]">
            <Avatar src={avatars[i % 4]} className="h-11 w-11" />
          </span>
        </span>
      </div>
    ))}

    <div className="glass-card-strong animate-drift absolute left-[6%] top-[24%] z-10 w-44 rounded-2xl p-3" style={{ animationDelay: '0.8s' }}>
      <p className="text-[10px] font-bold text-white">Creator Collective</p>
      <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400" />
      </div>
      <p className="mt-1 text-[9px] text-slate-400">2,184 joining now</p>
    </div>

    <div className="glass-card-strong animate-drift-slow absolute right-[6%] top-[52%] z-10 flex items-center gap-2 rounded-2xl p-3">
      <span className="icon-orb h-8 w-8 rounded-full">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M12 21s-7.5-4.9-10-9.4C.3 8 2.3 4.5 5.7 4.5c2 0 3.4 1.1 4.3 2.6.9-1.5 2.3-2.6 4.3-2.6 3.4 0 5.4 3.5 3.7 7.1C19.5 16.1 12 21 12 21z" />
        </svg>
      </span>
      <p className="text-xs leading-tight">
        <span className="font-bold text-white">+20k</span>
        <span className="block text-[10px] text-slate-400">vibing together</span>
      </p>
    </div>

    <div className="glass-card-strong animate-drift absolute bottom-[10%] left-[26%] z-10 w-48 rounded-2xl p-3" style={{ animationDelay: '1.3s' }}>
      <div className="flex -space-x-2">
        {avatars.map((src, i) => (
          <Avatar key={i} src={src} className="h-7 w-7 border-2 border-black/40" />
        ))}
      </div>
      <p className="mt-1.5 text-[10px] text-slate-400">
        <span className="font-bold text-white">6 friends</span> are online now
      </p>
    </div>
  </div>
);

const ForgotScene = () => (
  <div className="relative h-[430px] w-full">
    <div className="radial-glow left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 bg-cyan-500/15" />

    <div className="animate-spin-slow absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-violet-400/30" />
    <div className="absolute left-1/2 top-1/2 h-[330px] w-[330px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.06]" />

    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
      <span className="icon-orb h-24 w-24 rounded-[1.6rem]">
        <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="3" />
          <path d="M4 8l8 5 8-5" />
        </svg>
      </span>
    </div>

    {[
      { style: { left: '18%', top: '18%' } },
      { style: { right: '14%', top: '26%' } },
      { style: { left: '22%', bottom: '20%' } },
      { style: { right: '20%', bottom: '14%' } },
    ].map((pos, i) => (
      <span
        key={i}
        className="animate-drift absolute h-1.5 w-1.5 rounded-full bg-cyan-300/80"
        style={{ ...pos.style, boxShadow: '0 0 10px rgba(34,211,238,0.9)', animationDelay: `${i * 0.4}s` }}
      />
    ))}

    <div className="glass-card-strong animate-drift absolute bottom-[10%] left-[8%] flex items-center gap-2.5 rounded-2xl p-3">
      <span className="icon-orb h-9 w-9 rounded-xl">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2l7 3v3.2c0 5-3.4 8.6-7 10.3-3.6-1.7-7-5.3-7-10.3V5l7-3z" />
          <path d="M9 11.5l2 2 4-4" />
        </svg>
      </span>
      <p className="text-xs leading-tight">
        <span className="font-bold text-white">Protected</span>
        <span className="block text-[10px] text-slate-400">2FA with backup codes</span>
      </p>
    </div>
  </div>
);

const copy = {
  login: {
    chip: 'Welcome back',
    title: (
      <>
        Welcome <span className="neon-text">Back!</span>
      </>
    ),
    subtitle: "Good to see you again. Let's continue your journey.",
  },
  register: {
    chip: 'New here?',
    title: (
      <>
        Create <span className="neon-text">Account</span>
      </>
    ),
    subtitle: 'Join Nexus and connect with the world.',
  },
  forgot: {
    chip: 'Account recovery',
    title: (
      <>
        Forgot <span className="neon-text">Password?</span>
      </>
    ),
    subtitle: "We'll email you a secure code to reset your password.",
  },
};

const StatsRow = ({ className }) => (
  <div className={cn('grid grid-cols-3 gap-3', className)}>
    {stats.map((s) => (
      <div key={s.label} className="glass-card rounded-2xl px-4 py-3.5 text-center">
        <p className="font-display text-2xl font-extrabold neon-text">{s.value}</p>
        <p className="mt-0.5 text-xs font-semibold text-slate-400">{s.label}</p>
      </div>
    ))}
  </div>
);

const AuthVisual = ({ variant = 'login', className = '' }) => {
  const c = copy[variant] || copy.login;
  const Scene = variant === 'register' ? RegisterScene : variant === 'forgot' ? ForgotScene : LoginScene;

  return (
    <div className={cn('relative hidden shrink-0 flex-col lg:flex lg:w-[560px]', className)}>
      <div className="particles pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
      <div className="radial-glow -left-16 top-4 h-72 w-72 bg-violet-600/20" aria-hidden="true" />
      <div className="radial-glow -right-10 bottom-16 h-80 w-80 bg-fuchsia-600/15" aria-hidden="true" />

      <div className="relative">
        <span className="section-chip">
          <span className="chip-dot" />
          {c.chip}
        </span>
        <h2 className="mt-5 font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-white xl:text-6xl">
          {c.title}
        </h2>
        <p className="mt-3 max-w-md text-lg text-slate-400">{c.subtitle}</p>
      </div>

      <div className="relative mt-2 flex-1">
        <Scene />
      </div>

      <StatsRow className="relative" />
    </div>
  );
};

export default AuthVisual;