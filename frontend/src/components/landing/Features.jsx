import useReveal from '../../hooks/useReveal';

const features = [
  {
    title: 'Connect with Real People',
    desc: 'Build meaningful connections with people who share your passions.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="7.5" r="4" />
        <path d="M2.5 21v-2a6.5 6.5 0 0113 0v2M16.5 3.3a4 4 0 010 7.5M18.5 14.5a6.5 6.5 0 013 3.5" />
      </svg>
    ),
    glow: 'from-violet-600/40',
  },
  {
    title: 'Share Your World',
    desc: 'Post, create and express yourself in beautiful and powerful ways.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="8.5" cy="8.5" r="1.6" fill="currentColor" stroke="none" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    ),
    glow: 'from-fuchsia-600/40',
  },
  {
    title: 'Explore Diverse Communities',
    desc: 'Join communities, discover new interests and grow together.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" fill="currentColor" stroke="none" />
        <path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" />
      </svg>
    ),
    glow: 'from-pink-600/40',
  },
  {
    title: 'Safe & Secure Environment',
    desc: 'Privacy and safety are our top priority. Always.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l8 3.2v5.4c0 5.2-3.4 9-8 11.4-4.6-2.4-8-6.2-8-11.4V5.2L12 2z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    glow: 'from-cyan-500/40',
  },
];

const Features = () => {
  const ref = useReveal();

  return (
    <section id="features" ref={ref} className="relative py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="glass-card hover-lift reveal relative overflow-hidden rounded-[2rem] p-8 sm:p-10 lg:p-12">
          <div className="particles absolute inset-0 opacity-40" aria-hidden="true" />
          <div className="radial-glow -right-20 -top-24 h-72 w-72 bg-violet-600/20" aria-hidden="true" />
          <div className="radial-glow -bottom-24 -left-20 h-72 w-72 bg-cyan-500/15" aria-hidden="true" />

          <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group relative flex flex-col items-center text-center"
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                <div className={`absolute -top-6 h-24 w-24 rounded-full bg-gradient-to-b ${f.glow} to-transparent blur-2xl opacity-60 transition-opacity duration-500 group-hover:opacity-100`} />
                <span className="icon-orb relative h-16 w-16 rounded-2xl transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                  {f.icon}
                </span>
                <h3 className="relative mt-5 font-display text-lg font-bold text-white">{f.title}</h3>
                <p className="relative mt-2.5 max-w-[16rem] text-sm leading-relaxed text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;