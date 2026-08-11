import useReveal from '../../hooks/useReveal';

const features = [
  {
    title: 'Connect',
    desc: 'Build meaningful relationships with friends, creators and people who share your passions.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="7" r="4" />
        <path d="M2 21v-2a7 7 0 0114 0v2M16 3.5a4 4 0 010 7M18 14a6 6 0 014 5" />
      </svg>
    ),
    grad: 'from-brand-500 to-violet-500',
  },
  {
    title: 'Share',
    desc: 'Post photos, videos, reels and stories that capture the moments that matter to you.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="8.5" cy="8.5" r="1.6" fill="currentColor" stroke="none" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    ),
    grad: 'from-violet-500 to-fuchsia-500',
  },
  {
    title: 'Discover',
    desc: 'Explore trending topics, hashtags and creators curated to what you actually care about.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" fill="currentColor" stroke="none" />
      </svg>
    ),
    grad: 'from-fuchsia-500 to-rose-500',
  },
  {
    title: 'Communities',
    desc: 'Create or join groups around any interest — hobbies, art, fitness, gaming and more.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    grad: 'from-rose-500 to-amber-500',
  },
  {
    title: 'Messaging',
    desc: 'Real-time chats, voice notes and reactions — stay close with typing and read receipts.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a8 8 0 01-8 8H4l2-3.2A8 8 0 1121 12z" />
        <path d="M8 11h.01M12 11h.01M16 11h.01" strokeWidth="2.4" />
      </svg>
    ),
    grad: 'from-amber-500 to-emerald-500',
  },
  {
    title: 'Privacy',
    desc: 'You own your data. Granular controls, private accounts and no dark patterns. Ever.',
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
    grad: 'from-emerald-500 to-brand-500',
  },
];

const Features = () => {
  const ref = useReveal();

  return (
    <section id="features" ref={ref} className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="reveal mx-auto max-w-2xl text-center">
          <span className="inline-flex rounded-full bg-brand-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-600">
            Features
          </span>
          <h2 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Everything you need to{' '}
            <span className="text-gradient">feel at home</span>
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            A complete social experience — crafted with care, built for the way you actually connect.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="reveal group relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-8 shadow-soft backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-brand-200 hover:shadow-soft-lg"
              style={{ transitionDelay: `${i * 60}ms` }}
            >
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-brand-500/10 to-fuchsia-500/10 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
              <div className={`relative mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${f.grad} text-white shadow-soft transition-transform duration-300 group-hover:scale-110`}>
                {f.icon}
              </div>
              <h3 className="relative font-display text-xl font-bold text-slate-900">{f.title}</h3>
              <p className="relative mt-3 leading-relaxed text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
