import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import useReveal from '../../hooks/useReveal';

const Avatar = ({ src, alt, className = 'h-10 w-10' }) => (
  <span className={`inline-block overflow-hidden rounded-full ring-2 ring-white ${className}`}>
    <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover" />
  </span>
);

const floatingImages = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=120&h=120&fit=crop&crop=faces',
];

const postImage = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=640&h=420&fit=crop';
const storyImages = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=160&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=160&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=160&fit=crop',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=160&fit=crop',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=120&h=160&fit=crop',
];

const Hero = () => {
  const ref = useReveal();

  return (
    <section id="home" ref={ref} className="relative overflow-hidden pb-24 pt-36">
      <div className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />

      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2">
        {/* Left: copy */}
        <div className="text-center lg:text-left">
          <div className="reveal inline-flex items-center gap-2 rounded-full border border-brand-200/70 bg-white/80 px-4 py-1.5 text-xs font-semibold text-brand-600 shadow-soft backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping-slow rounded-full bg-emerald-400" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            120,000+ creators already home
          </div>

          <h1 className="reveal mt-6 font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-slate-900 sm:text-6xl xl:text-7xl" style={{ transitionDelay: '80ms' }}>
            Where your world{' '}
            <span className="text-gradient animate-gradient">comes together</span>
          </h1>

          <p className="reveal mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-500 lg:mx-0" style={{ transitionDelay: '160ms' }}>
            Nexus is the modern home for creators, friends and communities. Share moments,
            spark conversations and discover what's trending — all in one beautifully
            crafted space.
          </p>

          <div className="reveal mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start" style={{ transitionDelay: '240ms' }}>
            <Link to="/register">
              <Button size="lg" className="animate-gradient w-full sm:w-auto">
                Get started — it's free
              </Button>
            </Link>
            <a href="#explore">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Explore the app
              </Button>
            </a>
          </div>

          <div className="reveal mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start" style={{ transitionDelay: '320ms' }}>
            <div className="flex -space-x-3">
              {floatingImages.slice(0, 5).map((src, i) => (
                <Avatar key={i} src={src} alt="Member avatar" className="h-11 w-11" />
              ))}
            </div>
            <p className="text-sm text-slate-500">
              Loved by <span className="font-semibold text-slate-700">10,000+</span> communities
              <span className="mt-0.5 block text-slate-400">★★★★★ 4.9 from 24k reviews</span>
            </p>
          </div>
        </div>

        {/* Right: floating social visual */}
        <div className="relative mx-auto hidden h-[560px] w-full max-w-xl lg:block">
          {/* Main post card */}
          <div className="hero-card absolute left-1/2 top-1/2 z-10 w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-white/70 bg-white/85 p-4 shadow-soft-lg backdrop-blur-2xl">
            <div className="flex items-center gap-3">
              <Avatar src={floatingImages[0]} alt="Alex Morgan" className="h-11 w-11" />
              <div>
                <p className="text-sm font-bold text-slate-800">Alex Morgan</p>
                <p className="text-xs text-slate-400">Travel photographer · 2 min ago</p>
              </div>
              <span className="ml-auto rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold text-brand-600">
                #travel
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Golden hour from the coast today. Sometimes the best view is the one you stumble on. 🌅
            </p>
            <div className="mt-3 overflow-hidden rounded-2xl">
              <img src={postImage} alt="Golden hour coastline" className="h-44 w-full object-cover" />
            </div>
            <div className="mt-3 flex items-center gap-4 text-slate-500">
              <span className="flex items-center gap-1.5 text-xs font-semibold">
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-rose-500" fill="currentColor"><path d="M12 21s-7.5-4.9-10-9.4C.3 8 2.3 4.5 5.7 4.5c2 0 3.4 1.1 4.3 2.6.9-1.5 2.3-2.6 4.3-2.6 3.4 0 5.4 3.5 3.7 7.1C19.5 16.1 12 21 12 21z"/></svg>
                2.4k
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12a8 8 0 01-8 8H4l2-3.2A8 8 0 1121 12z"/></svg>
                384
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8h16v-8M2 12h20l-3-6H5l-3 6z"/></svg>
                1.1k
              </span>
            </div>
          </div>

          {/* Floating: incoming message */}
          <div className="hero-card animate-float-y absolute -left-4 top-16 z-20 w-56 rounded-2xl border border-white/70 bg-white/85 p-3 shadow-soft-lg backdrop-blur-2xl">
            <div className="flex items-center gap-2.5">
              <Avatar src={floatingImages[1]} alt="Sam" className="h-9 w-9" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800">Sam Rivera</p>
                <p className="truncate text-[11px] text-slate-400">Just shared a story ✨</p>
              </div>
              <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-brand-500" />
            </div>
          </div>

          {/* Floating: like toast */}
          <div className="hero-card animate-float-y-delay absolute -right-6 top-28 z-20 w-52 rounded-2xl border border-white/70 bg-white/85 p-3 shadow-soft-lg backdrop-blur-2xl">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-fuchsia-500 text-white shadow-soft">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12 21s-7.5-4.9-10-9.4C.3 8 2.3 4.5 5.7 4.5c2 0 3.4 1.1 4.3 2.6.9-1.5 2.3-2.6 4.3-2.6 3.4 0 5.4 3.5 3.7 7.1C19.5 16.1 12 21 12 21z"/></svg>
              </span>
              <p className="text-xs font-semibold text-slate-700">
                Mia loved <span className="text-brand-600">your post</span>
              </p>
            </div>
          </div>

          {/* Floating: stories */}
          <div className="hero-card absolute -bottom-4 left-8 z-20 w-60 rounded-2xl border border-white/70 bg-white/85 p-3 shadow-soft-lg backdrop-blur-2xl">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Stories</p>
            <div className="flex gap-2">
              {storyImages.slice(0, 4).map((src, i) => (
                <span key={i} className="rounded-full bg-gradient-to-tr from-amber-400 via-rose-400 to-fuchsia-500 p-[2px]">
                  <span className="block rounded-full bg-white p-[2px]">
                    <Avatar src={src} alt="Story" className="h-11 w-11 ring-0" />
                  </span>
                </span>
              ))}
              <span className="flex h-[46px] w-[46px] items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              </span>
            </div>
          </div>

          {/* Floating: trending */}
          <div className="hero-card animate-float-y absolute -right-2 bottom-20 z-20 w-48 rounded-2xl border border-white/70 bg-white/85 p-3 shadow-soft-lg backdrop-blur-2xl" style={{ animationDelay: '0.6s' }}>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Trending</p>
            <div className="flex flex-col gap-1.5">
              {['#nexuslaunch', '#creatorsofearth', '#goldenhour'].map((t, i) => (
                <span key={t} className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${['bg-brand-50 text-brand-600', 'bg-violet-50 text-violet-600', 'bg-fuchsia-50 text-fuchsia-600'][i]}`}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Floating avatar cluster right */}
          <div className="hero-card animate-float-y-delay absolute right-10 top-6 z-20 flex -space-x-2.5">
            {floatingImages.slice(1, 5).map((src, i) => (
              <Avatar key={i} src={src} alt="Online member" className="h-10 w-10 ring-white" />
            ))}
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-[11px] font-bold text-white ring-2 ring-white">
              +8k
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
