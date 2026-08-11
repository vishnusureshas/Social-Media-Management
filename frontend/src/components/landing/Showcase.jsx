import useReveal from '../../hooks/useReveal';

const feed = [
  { img: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&h=400&fit=crop', name: 'Aurora Fields', tag: '#nature', likes: '12.4k' },
  { img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop', name: 'Studio Nia', tag: '#design', likes: '8.2k' },
  { img: 'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?w=600&h=400&fit=crop', name: 'Café Society', tag: '#coffee', likes: '6.7k' },
  { img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=400&fit=crop', name: 'Wild & Free', tag: '#mountain', likes: '15.1k' },
  { img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=400&fit=crop', name: 'Jordan Blake', tag: '#creator', likes: '9.8k' },
  { img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=400&fit=crop', name: 'Style Diaries', tag: '#fashion', likes: '11.3k' },
];

const Showcase = () => {
  const ref = useReveal();

  return (
    <section ref={ref} className="relative overflow-hidden py-24">
      <div className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      <div className="mx-auto max-w-7xl px-6">
        <div className="reveal mx-auto max-w-2xl text-center">
          <span className="inline-flex rounded-full bg-fuchsia-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-fuchsia-600">
            The feed
          </span>
          <h2 className="mt-5 font-display text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            A feed you'll actually{' '}
            <span className="text-gradient">want to scroll</span>
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Beautiful posts, real moments and creators worth following — right at your fingertips.
          </p>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {feed.map((p, i) => (
            <div
              key={p.name}
              className="reveal group relative overflow-hidden rounded-3xl border border-white/70 bg-white/85 shadow-soft transition-all duration-500 hover:-translate-y-2 hover:shadow-soft-lg"
              style={{ transitionDelay: `${i * 70}ms` }}
            >
              <div className="overflow-hidden">
                <img src={p.img} alt={p.tag} className="h-56 w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <p className="font-display font-bold text-slate-900">{p.name}</p>
                  <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-600">{p.tag}</span>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <svg viewBox="0 0 24 24" className="h-4 w-4 text-rose-500" fill="currentColor"><path d="M12 21s-7.5-4.9-10-9.4C.3 8 2.3 4.5 5.7 4.5c2 0 3.4 1.1 4.3 2.6.9-1.5 2.3-2.6 4.3-2.6 3.4 0 5.4 3.5 3.7 7.1C19.5 16.1 12 21 12 21z"/></svg>
                    {p.likes}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12a8 8 0 01-8 8H4l2-3.2A8 8 0 1121 12z"/></svg>
                    {Math.round((p.likes.replace('k', '') / 4))}k
                  </span>
                  <span className="flex items-center gap-1.5">
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8h16v-8M2 12h20l-3-6H5l-3 6z"/></svg>
                    2.4k
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Showcase;
