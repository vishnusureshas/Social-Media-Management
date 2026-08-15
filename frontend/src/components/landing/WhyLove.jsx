import useReveal from '../../hooks/useReveal';

const MiniAvatar = ({ src, className = 'h-7 w-7' }) => (
  <span className={`inline-block shrink-0 overflow-hidden rounded-full border border-white/10 ${className}`}>
    <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
  </span>
);

const barHeights = ['40%', '65%', '50%', '85%', '70%', '100%'];

const cards = [
  {
    title: 'Modern & Fast',
    desc: 'Blazing fast experience with a beautiful, futuristic interface.',
    orb: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="7" y="2.5" width="10" height="19" rx="3" />
        <path d="M11 5h2M13 18.5h-2" />
        <path d="M9.5 11l2-2.5 1.5 2 1.5-2" strokeWidth="2" />
      </svg>
    ),
    visual: (
      <div className="flex items-center justify-center gap-4">
        <div className="flex h-28 w-20 flex-col justify-between rounded-xl border border-white/10 bg-white/[0.03] p-2">
          <div className="flex justify-between">
            <span className="h-1.5 w-6 rounded-full bg-white/15" />
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/70" />
          </div>
          <div className="flex items-end justify-between gap-1">
            {barHeights.map((h, i) => (
              <span key={i} className="w-full rounded-t-[3px] bg-gradient-to-t from-violet-500/60 to-fuchsia-400/90" style={{ height: h }} />
            ))}
          </div>
          <span className="h-1.5 w-10 rounded-full bg-white/10" />
        </div>
        <div className="space-y-2.5">
          <span className="flex items-center gap-1.5 rounded-lg border border-violet-400/30 bg-violet-500/10 px-2.5 py-1 text-[11px] font-bold text-violet-300">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
              <path d="M13 3l-6 11h5l-2 7 8-12h-5l2-6h-2z" />
            </svg>
            0.2s loads
          </span>
          <span className="flex items-center gap-1.5 rounded-lg border border-cyan-400/30 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-bold text-cyan-300">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
            60 fps
          </span>
        </div>
      </div>
    ),
  },
  {
    title: 'Smart Feeds',
    desc: 'AI-powered feed that shows you what matters most.',
    orb: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
    visual: (
      <div className="w-full max-w-[15rem] space-y-2">
        <div className="flex items-center gap-1 rounded-lg bg-white/[0.04] p-0.5">
          <span className="flex-1 rounded-md bg-gradient-to-r from-violet-500 to-fuchsia-500 py-1 text-center text-[9px] font-bold text-white">For You</span>
          <span className="flex-1 py-1 text-center text-[9px] font-semibold text-slate-500">Following</span>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2">
          <div className="flex items-center gap-2">
            <MiniAvatar src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=faces" />
            <div className="space-y-1">
              <span className="block h-1.5 w-16 rounded-full bg-white/20" />
              <span className="block h-1 w-10 rounded-full bg-white/10" />
            </div>
          </div>
          <div className="mt-2 h-12 rounded-md bg-gradient-to-br from-violet-500/25 via-fuchsia-500/20 to-cyan-400/20" />
        </div>
        <span className="flex items-center justify-center gap-1.5 rounded-lg border border-fuchsia-400/30 bg-fuchsia-500/10 py-1.5 text-[10px] font-bold text-fuchsia-300">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
            <path d="M12 1.5l2.1 5.2 5.2 2.1-5.2 2.1L12 16.1 9.9 10.9l-5.2-2.1 5.2-2.1L12 1.5zM19 13l1 1.9 1.9 1-1.9 1L19 18.8l-1-1.9-1.9-1 1.9-1 1-1.9zM6 15l.9 1.9 1.9.9-1.9.9L6 20.6l-.9-1.9-1.9-.9 1.9-.9L6 15z" />
          </svg>
          AI-curated, just for you
        </span>
      </div>
    ),
  },
  {
    title: 'Made for Creators',
    desc: 'Powerful tools to help you grow your audience and brand.',
    orb: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M7 14l3-4 3 3 4-6" />
        <path d="M17 7h3v3" />
      </svg>
    ),
    visual: (
      <div className="w-full max-w-[15rem]">
        <div className="flex items-center justify-between">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Engagement</p>
          <span className="flex items-center gap-1 rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300">
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
              <path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            +312%
          </span>
        </div>
        <div className="mt-2 flex h-20 items-end gap-1.5">
          {[18, 32, 26, 45, 38, 60, 52, 78, 66, 92].map((h, i) => (
            <span
              key={i}
              className="w-full rounded-t-[4px] bg-gradient-to-t from-violet-600/40 via-fuchsia-500/60 to-fuchsia-300"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between text-[8px] font-semibold text-slate-500">
          <span>Followers 148k</span>
          <span>Reach 892k</span>
        </div>
      </div>
    ),
  },
];

const WhyLove = () => {
  const ref = useReveal();

  return (
    <section id="why" ref={ref} className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="reveal mx-auto max-w-2xl text-center">
          <span className="section-chip">
            <span className="chip-dot" />
            Why Nexus
          </span>
          <h2 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Why You'll <span className="neon-text">Love Nexus</span>
          </h2>
          <p className="mt-4 text-lg text-slate-400">Designed for the future. Built for everyone.</p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {cards.map((c, i) => (
            <div
              key={c.title}
              className="glass-card hover-lift reveal group relative overflow-hidden rounded-[1.8rem] p-2"
              style={{ transitionDelay: `${i * 90}ms` }}
            >
              <div className="radial-glow -right-16 -top-16 h-48 w-48 bg-fuchsia-600/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="flex h-44 items-center justify-center rounded-[1.4rem] border border-white/10 bg-[#0b1024] px-6">
                <div className="pointer-events-none absolute inset-x-6 top-6 h-44 rounded-[1.4rem] bg-gradient-to-b from-violet-600/20 via-transparent to-cyan-500/10 opacity-60" />
                {c.visual}
              </div>

              <div className="relative p-6">
                <span className="icon-orb h-14 w-14 rounded-2xl transition-transform duration-500 group-hover:scale-110">
                  {c.orb}
                </span>
                <h3 className="mt-5 font-display text-xl font-bold text-white">{c.title}</h3>
                <p className="mt-2.5 leading-relaxed text-slate-400">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyLove;