const items = [
  {
    title: 'Secure & Private',
    desc: 'Your privacy and security are our top priority.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l8 3.2v5.4c0 5.2-3.4 9-8 11.4-4.6-2.4-8-6.2-8-11.4V5.2L12 2z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Real Connections',
    desc: 'Connect with real people and build meaningful relationships.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="7" r="4" />
        <path d="M2 21v-2a7 7 0 0114 0v2M16 3.5a4 4 0 010 7M18 14a6 6 0 014 5" />
      </svg>
    ),
  },
  {
    title: 'Share Freely',
    desc: 'Share your thoughts, ideas and creativity with the world.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="8.5" cy="8.5" r="1.6" fill="currentColor" stroke="none" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    ),
  },
  {
    title: 'Grow Together',
    desc: 'Join communities and grow together with millions.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M7 14v4M12 10v8M17 6v12" />
      </svg>
    ),
  },
];

const FeatureBar = () => (
  <div className="relative">
    <div className="radial-glow -top-24 left-1/2 h-40 w-[46rem] -translate-x-1/2 bg-violet-600/10" aria-hidden="true" />
    <div className="relative mx-auto grid max-w-7xl gap-4 px-5 py-10 sm:grid-cols-2 lg:grid-cols-4 sm:px-8">
      {items.map((f) => (
        <div key={f.title} className="glass-card hover-lift flex items-start gap-4 rounded-[1.25rem] p-4">
          <span className="icon-orb h-11 w-11 shrink-0 rounded-xl">
            {f.icon}
          </span>
          <div>
            <p className="text-sm font-bold text-white">{f.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">{f.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default FeatureBar;