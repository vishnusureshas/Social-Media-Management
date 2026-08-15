import { Link } from 'react-router-dom';
import useReveal from '../../hooks/useReveal';
import cn from '../../utils/cn';

const Avatar = ({ src, alt, ring = false, className = 'h-10 w-10' }) => (
  <span
    className={cn(
      'inline-block shrink-0 overflow-hidden rounded-full',
      ring && 'border-2 border-[#05060f]',
      className
    )}
  >
    <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover" />
  </span>
);

const avatars = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=120&h=120&fit=crop&crop=faces',
];

const storyAv = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=faces',
];

const postImage = 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=720&h=520&fit=crop';
const communityImage = 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop';

const WaveLayer = ({ reverse }) => (
  <div
    className={reverse ? 'wave-layer-reverse' : 'wave-layer'}
    style={{ position: 'absolute', inset: '0', width: '200%', left: reverse ? '-100%' : '0' }}
  >
    <svg
      viewBox="0 0 2400 800"
      preserveAspectRatio="none"
      className="h-full w-full"
      style={{ filter: 'blur(14px)', opacity: reverse ? 0.55 : 0.4 }}
    >
      <defs>
        <linearGradient id="wlgA" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6d28d9" />
          <stop offset="50%" stopColor="#d946ef" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id="wlgB" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="50%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <path id="waveTile" d="M0 550 C 180 430, 320 620, 520 560 C 720 500, 860 400, 1050 470 C 1120 498, 1160 520, 1200 540 L 1200 800 L 0 800 Z" />
      </defs>
      <g fill={reverse ? 'url(#wlgB)' : 'url(#wlgA)'}>
        <use href="#waveTile" transform="translate(-1200 0)" />
        <use href="#waveTile" transform="translate(-1200 70)" opacity={0.7} />
        <use href="#waveTile" />
        <use href="#waveTile" transform="translate(0 70)" opacity={0.7} />
        <use href="#waveTile" transform="translate(1200)" />
        <use href="#waveTile" transform="translate(1200 70)" opacity={0.7} />
      </g>
    </svg>
  </div>
);

const FloatingSocial = ({ className, style, children }) => (
  <div className={cn('animate-drift absolute z-30', className)} style={style}>
    {children}
  </div>
);

const Hero = () => {
  const ref = useReveal();

  return (
    <section id="home" ref={ref} className="relative overflow-hidden pb-28 pt-40 lg:pt-44">
      {/* background art */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="particles absolute inset-0 opacity-70" />
        <div className="absolute inset-x-0 top-0 h-[46rem]">
          <WaveLayer />
          <WaveLayer reverse />
          <div className="radial-glow -left-24 top-24 h-96 w-96 bg-violet-600/25" />
          <div className="radial-glow right-[-6rem] top-32 h-[26rem] w-[26rem] bg-cyan-500/15" />
          <div className="radial-glow left-1/2 top-[28rem] h-80 w-[34rem] -translate-x-1/2 bg-fuchsia-600/15" />
        </div>
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-[1.05fr_0.95fr]">
        {/* ===== Left: copy ===== */}
        <div className="text-center lg:text-left">
          <div className="reveal inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 py-2 pl-3 pr-5 backdrop-blur-lg">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping-slow rounded-full bg-rose-400" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gradient-to-br from-purple-400 to-pink-500" />
            </span>
            <span className="text-xs font-semibold tracking-wide text-slate-300">
              The next generation of social connection
            </span>
          </div>

          <h1 className="reveal mt-7 font-display text-[2.7rem] font-extrabold leading-[1.04] tracking-tight text-white sm:text-6xl xl:text-[4.6rem]" style={{ transitionDelay: '80ms' }}>
            Connect. Share.{' '}
            <span className="neon-text">Inspire.</span>
          </h1>

          <p className="reveal mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-400 lg:mx-0" style={{ transitionDelay: '160ms' }}>
            Nexus is the next-gen social platform where real connections meet endless possibilities.
          </p>

          <div className="reveal mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start" style={{ transitionDelay: '240ms' }}>
            <Link to="/register">
              <span className="btn-neon inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-base">
                Get Started — It's Free
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </Link>
            <a href="#explore">
              <span className="btn-ghost-neon inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-base">
                Explore Now
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" />
                </svg>
              </span>
            </a>
          </div>

          <div className="reveal mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start" style={{ transitionDelay: '320ms' }}>
            <div className="flex -space-x-3">
              {avatars.map((src, i) => (
                <Avatar key={i} src={src} alt="Member avatar" ring className="h-11 w-11" />
              ))}
              <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#05060f] bg-gradient-to-br from-violet-500 to-rose-400 text-xs font-bold text-white">
                2M+
              </span>
            </div>
            <p className="text-sm text-slate-400">
              <span className="font-semibold text-white">Join 2M+ creators</span> and communities already vibing together.
              <span className="mt-1 flex justify-center gap-0.5 text-amber-300 lg:justify-start">
                {'★★★★★'.split('').map((s, i) => (
                  <svg key={i} viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                    <path d="M12 2l2.4 5.6L20 9l-4.3 4.2L16.6 20 12 16.6 7.4 20l1-6.8L4 9l5.6-1.4L12 2z" />
                  </svg>
                ))}
                <span className="ml-1.5 text-xs text-slate-500">4.9 · 24k reviews</span>
              </span>
            </p>
          </div>
        </div>

        {/* ===== Right: phone mockup ===== */}
        <div className="relative mx-auto hidden h-[620px] w-full max-w-md sm:block">
          {/* neon aura behind phone */}
          <div className="absolute left-1/2 top-1/2 -z-10 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-violet-600/30 via-fuchsia-500/20 to-cyan-400/15 blur-3xl" />

          {/* phone glow */}
          <div className="phone-glow" />

          {/* phone frame */}
          <div className="neon-border relative left-1/2 top-1/2 z-10 w-[270px] -translate-x-1/2 -translate-y-1/2 rounded-[2.9rem] shadow-[0_40px_120px_-30px_rgba(15,12,54,0.9)]">
            <div className="relative overflow-hidden rounded-[2.65rem] bg-[#070a18] p-3">
              {/* notch */}
              <div className="mx-auto mt-1 h-5 w-24 rounded-full bg-black/80" />

              {/* screen */}
              <div className="mt-2 overflow-hidden rounded-[1.9rem] bg-[#0b1024]">
                {/* status bar */}
                <div className="flex items-center justify-between px-5 pb-2 pt-3 text-[10px] font-semibold text-slate-400">
                  <span>9:41</span>
                  <div className="flex items-center gap-1.5">
                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
                      <path d="M2 16h3v6H2v-6zm5-5h3v11H7V11zm5-6h3v17h-3V5zm5 4h3v13h-3V9z" />
                    </svg>
                    <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
                      <path d="M12 17a3 3 0 100-6 3 3 0 000 6zm0-13v2m0 12v2m-5-8H5m14 0h-2M7.8 5.8L9.2 7.2m5.6 5.6l1.4 1.4m0-8.4L14.8 7.2M9.2 12.8l-1.4 1.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>

                {/* stories */}
                <div className="flex items-center gap-2.5 px-4 py-2">
                  <div className="flex flex-col items-center gap-1">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-base text-slate-300">
                      +
                    </span>
                    <span className="text-[8px] text-slate-500">Your</span>
                  </div>
                  {storyAv.slice(0, 3).map((src, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span className="rounded-full bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-cyan-400 p-[2px]">
                        <span className="block rounded-full border-2 border-[#0b1024]">
                          <Avatar src={src} alt="Story" className="h-11 w-11" />
                        </span>
                      </span>
                      <span className="text-[8px] text-slate-500">{['Luna', 'Kai', 'Mia'][i]}</span>
                    </div>
                  ))}
                </div>

                {/* post */}
                <div className="px-4 pb-4">
                  <div className="overflow-hidden rounded-2xl border border-white/5">
                    <div className="flex items-center gap-2 bg-white/[0.03] px-3 py-2">
                      <Avatar src={avatars[0]} alt="Ava" className="h-6 w-6" />
                      <div className="leading-tight">
                        <p className="text-[10px] font-bold text-white">Ava Chen</p>
                        <p className="text-[8px] text-slate-500">Photographer · 2m</p>
                      </div>
                      <span className="ml-auto rounded-md bg-purple-500/15 px-2 py-0.5 text-[8px] font-bold text-purple-300">
                        #vibes
                      </span>
                    </div>
                    <div className="relative">
                      <img src={postImage} alt="Golden mountains" className="h-36 w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b1024]/70 to-transparent" />
                      <p className="absolute bottom-2 left-3 right-3 text-[9px] font-medium text-slate-200">
                        Chasing golden light over the ridge. ✨
                      </p>
                    </div>
                    <div className="flex items-center justify-between bg-white/[0.02] px-3 py-2">
                      <div className="flex items-center gap-2 text-slate-300">
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-rose-400" fill="currentColor">
                          <path d="M12 21s-7.5-4.9-10-9.4C.3 8 2.3 4.5 5.7 4.5c2 0 3.4 1.1 4.3 2.6.9-1.5 2.3-2.6 4.3-2.6 3.4 0 5.4 3.5 3.7 7.1C19.5 16.1 12 21 12 21z" />
                        </svg>
                        <span className="text-[9px] font-semibold">12.4k</span>
                        <svg viewBox="0 0 24 24" className="ml-1 h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M21 12a8 8 0 01-8 8H4l2-3.2A8 8 0 1121 12z" />
                        </svg>
                        <span className="text-[9px] font-semibold">892</span>
                        <svg viewBox="0 0 24 24" className="ml-1 h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                        </svg>
                        <span className="text-[9px] font-semibold">3.1k</span>
                      </div>
                      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                        <path d="M6 3h12v18l-6-4-6 4V3z" />
                      </svg>
                    </div>
                  </div>

                  {/* second mini post */}
                  <div className="mt-2 flex items-center gap-2.5 rounded-2xl border border-white/5 bg-white/[0.02] px-3 py-2">
                    <Avatar src={avatars[2]} alt="Noah" className="h-7 w-7" />
                    <div className="min-w-0 flex-1 leading-tight">
                      <p className="text-[9px] font-bold text-white">Noah Stone</p>
                      <p className="truncate text-[8px] text-slate-500">
                        Just joined Creator Collective 🚀
                      </p>
                    </div>
                    <span className="rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-2.5 py-1 text-[8px] font-bold text-white">
                      Follow
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* floating: trending topics */}
          <div className="animate-drift absolute -left-6 top-10 z-30 w-44 rounded-2xl glass-card-strong p-3 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Trending</p>
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-slate-500" fill="currentColor">
                <path d="M13 3l-6 11h5l-2 7 8-12h-5l2-6h-2z" />
              </svg>
            </div>
            <div className="mt-2.5 space-y-1.5">
              {['#nexus', '#creatoreconomy', '#aurora'].map((t, i) => (
                <span
                  key={t}
                  className={`block rounded-lg px-2.5 py-1 text-[10px] font-semibold ${['bg-purple-500/15 text-purple-300', 'bg-fuchsia-500/15 text-fuchsia-300', 'bg-cyan-500/15 text-cyan-300'][i]}`}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* floating: communities */}
          <div className="animate-drift-slow absolute -right-4 top-32 z-30 w-52 rounded-2xl glass-card-strong p-3.5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Communities</p>
            <div className="mt-2.5 flex items-center gap-2.5">
              <div className="flex -space-x-2">
                {avatars.slice(0, 3).map((src, i) => (
                  <Avatar key={i} src={src} alt="Community" ring className="h-7 w-7" />
                ))}
              </div>
              <div className="min-w-0 leading-tight">
                <p className="truncate text-[11px] font-bold text-white">Creator Collective</p>
                <p className="text-[9px] text-slate-500">+20k members today</p>
              </div>
            </div>
            <div className="relative mt-2.5 h-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400" />
            </div>
          </div>

          {/* floating: engagement */}
          <div className="animate-drift absolute bottom-16 -left-2 z-30 w-52 rounded-2xl glass-card-strong p-3.5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]" style={{ animationDelay: '1s' }}>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full icon-orb">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M12 21s-7.5-4.9-10-9.4C.3 8 2.3 4.5 5.7 4.5c2 0 3.4 1.1 4.3 2.6.9-1.5 2.3-2.6 4.3-2.6 3.4 0 5.4 3.5 3.7 7.1C19.5 16.1 12 21 12 21z" />
                </svg>
              </span>
              <div className="leading-tight">
                <p className="text-[11px] font-bold text-white">1.2M likes today</p>
                <p className="text-[9px] text-slate-500">Mia &amp; 1,284 others ♥ your vibe</p>
              </div>
            </div>
          </div>

          {/* floating: community image card */}
          <div className="animate-drift-slow absolute -bottom-4 right-6 z-30 w-36 overflow-hidden rounded-2xl glass-card-strong shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]" style={{ animationDelay: '0.6s' }}>
            <img src={communityImage} alt="Community gathering" className="h-20 w-full object-cover" />
            <div className="space-y-0.5 p-2.5">
              <p className="text-[9px] font-bold text-white">Sunday Vibes</p>
              <p className="text-[8px] text-slate-500">14.2k photos shared</p>
            </div>
          </div>

          {/* glowing social icons */}
          <FloatingSocial className="-right-9 top-6">
            <span className="icon-orb h-11 w-11 rounded-2xl">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M12 21s-7.5-4.9-10-9.4C.3 8 2.3 4.5 5.7 4.5c2 0 3.4 1.1 4.3 2.6.9-1.5 2.3-2.6 4.3-2.6 3.4 0 5.4 3.5 3.7 7.1C19.5 16.1 12 21 12 21z" />
              </svg>
            </span>
          </FloatingSocial>
          <FloatingSocial className="-left-12 bottom-28" style={{ animationDelay: '0.8s' }}>
            <span className="icon-orb h-11 w-11 rounded-2xl">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
              </svg>
            </span>
          </FloatingSocial>
          <FloatingSocial className="-right-10 bottom-10">
            <span className="icon-orb h-12 w-12 rounded-full">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                <path d="M12 2l2.4 5.6L20 9l-4.3 4.2L16.6 20 12 16.6 7.4 20l1-6.8L4 9l5.6-1.4L12 2z" />
              </svg>
            </span>
          </FloatingSocial>
        </div>
      </div>
    </section>
  );
};

export default Hero;