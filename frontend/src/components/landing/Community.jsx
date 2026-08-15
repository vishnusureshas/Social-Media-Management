import { Link } from 'react-router-dom';
import useReveal from '../../hooks/useReveal';

const images = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&h=160&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&h=160&fit=crop&crop=faces',
];

const communities = [
  {
    tag: 'Creator Collective',
    members: '120k members',
    gradient: 'from-violet-500 via-fuchsia-500 to-pink-500',
    img: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500&h=400&fit=crop',
  },
  {
    tag: 'Aurora Art',
    members: '84k members',
    gradient: 'from-cyan-400 via-sky-500 to-indigo-500',
    img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=500&h=400&fit=crop',
  },
  {
    tag: 'Mindful Mornings',
    members: '61k members',
    gradient: 'from-emerald-400 via-teal-400 to-cyan-400',
    img: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&h=400&fit=crop',
  },
];

const perks = [
  ['Smart discovery', 'A feed that learns your taste — not the noise.'],
  ['Real communities', 'Dedicated spaces with mods, rules and culture.'],
  ['No echo chambers', 'A healthy mix of familiar faces and fresh ideas.'],
];

const Avatar = ({ src, className = 'h-10 w-10' }) => (
  <span className={`inline-block shrink-0 overflow-hidden rounded-full border-2 border-[#070b1e] ${className}`}>
    <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
  </span>
);

const Community = () => {
  const ref = useReveal();

  return (
    <section id="communities" ref={ref} className="relative overflow-hidden py-24">
      <div className="particles absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="radial-glow left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 bg-violet-600/15" aria-hidden="true" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2">
        <div>
          <span className="reveal section-chip">
            <span className="chip-dot" />
            Communities
          </span>
          <h2 className="reveal mt-6 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl" style={{ transitionDelay: '60ms' }}>
            Find your people.{' '}
            <span className="neon-text">Find your flow.</span>
          </h2>
          <p className="reveal mt-4 max-w-lg text-lg leading-relaxed text-slate-400" style={{ transitionDelay: '120ms' }}>
            From niche communities to global movements, discover conversations that feel like they were made for you.
          </p>

          <ul className="mt-9 space-y-4">
            {perks.map(([title, desc], i) => (
              <li key={title} className="reveal flex items-start gap-4" style={{ transitionDelay: `${180 + i * 70}ms` }}>
                <span className="icon-orb mt-0.5 h-7 w-7 rounded-full">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <div>
                  <p className="font-semibold text-white">{title}</p>
                  <p className="text-sm text-slate-400">{desc}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="reveal mt-10" style={{ transitionDelay: '400ms' }}>
            <Link to="/register">
              <span className="btn-neon inline-flex items-center gap-2 rounded-2xl px-8 py-4 text-base">
                Join your community
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="reveal grid gap-5 sm:grid-cols-2">
            {communities.map((c, i) => (
              <div
                key={c.tag}
                className={`glass-card group relative overflow-hidden rounded-[1.6rem] ${i === 1 ? 'sm:translate-y-6' : ''}`}
              >
                <div className="relative h-32 overflow-hidden">
                  <img src={c.img} alt={c.tag} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${c.gradient} opacity-20 mix-blend-overlay`} />
                  <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Live
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2.5">
                    <span className={`rounded-full bg-gradient-to-br ${c.gradient} p-[2px]`}>
                      <span className="block rounded-full border-2 border-[#0b1024]">
                        <Avatar src={c.img} className="h-8 w-8" />
                      </span>
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">{c.tag}</p>
                      <p className="text-[11px] text-slate-500">{c.members}</p>
                    </div>
                    <span className="ml-auto rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-2.5 py-1 text-[10px] font-bold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      Join
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="glass-card-strong animate-drift reveal relative mt-8 flex max-w-sm items-center gap-4 rounded-2xl p-4 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]" style={{ transitionDelay: '200ms' }}>
            <div className="flex -space-x-2.5">
              {images.map((src, i) => (
                <Avatar key={i} src={src} className="h-9 w-9" />
              ))}
            </div>
            <p className="text-sm leading-snug text-slate-300">
              <span className="font-bold text-white">2M+ members</span> are vibing across{' '}
              <span className="font-bold text-white">40+ communities</span> every day.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Community;