import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import useReveal from '../../hooks/useReveal';

const images = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&h=160&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&h=160&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=160&h=160&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=faces',
];

const trending = [
  { tag: '#nexuslaunch', posts: '48.2k posts' },
  { tag: '#creatorsofearth', posts: '92.1k posts' },
  { tag: '#streetphotography', posts: '35.7k posts' },
  { tag: '#mindfulmornings', posts: '12.4k posts' },
];

const Community = () => {
  const ref = useReveal();

  return (
    <section id="explore" ref={ref} className="relative py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2">
        {/* Left copy */}
        <div>
          <span className="reveal inline-flex rounded-full bg-violet-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-violet-600">
            Community
          </span>
          <h2 className="reveal mt-5 font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Find your people.{' '}
            <span className="text-gradient">Find your flow.</span>
          </h2>
          <p className="reveal mt-4 max-w-lg text-lg leading-relaxed text-slate-500">
            From niche communities to global movements, discover conversations that feel
            like they were made for you.
          </p>

          <ul className="mt-8 space-y-4">
            {[
              ['Smart discovery', 'A feed that learns your taste — not the noise.'],
              ['Real communities', 'Dedicated spaces with mods, rules and culture.'],
              ['No echo chambers', 'Healthy mix of familiar faces and fresh ideas.'],
            ].map(([title, desc], i) => (
              <li key={title} className="reveal flex items-start gap-4" style={{ transitionDelay: `${i * 80}ms` }}>
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-fuchsia-500 text-white shadow-soft">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold text-slate-800">{title}</p>
                  <p className="text-sm text-slate-500">{desc}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="reveal mt-9">
            <Link to="/register">
              <Button size="lg" className="animate-gradient">
                Join your community
              </Button>
            </Link>
          </div>
        </div>

        {/* Right visual: trending + people */}
        <div className="relative">
          <div className="reveal absolute -inset-6 -z-10 rounded-[2.5rem] bg-gradient-to-br from-brand-500/10 via-fuchsia-500/10 to-transparent blur-2xl" />

          <div className="reveal rounded-3xl border border-white/70 bg-white/85 p-6 shadow-soft-lg backdrop-blur-2xl">
            <div className="flex items-center justify-between">
              <p className="font-display text-lg font-bold text-slate-900">Trending now</p>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600">Live</span>
            </div>
            <div className="mt-4 space-y-2.5">
              {trending.map((t) => (
                <div key={t.tag} className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-white/70 px-4 py-3 transition-all duration-300 hover:border-brand-200 hover:bg-brand-50/40">
                  <span className="font-semibold text-slate-700 group-hover:text-brand-600">{t.tag}</span>
                  <span className="text-xs text-slate-400">{t.posts}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="reveal mt-6 grid grid-cols-3 gap-4" style={{ transitionDelay: '120ms' }}>
            {images.slice(0, 3).map((src, i) => (
              <div key={i} className="group relative overflow-hidden rounded-2xl border border-white/70 shadow-soft">
                <img src={src} alt="Community member" className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Community;
