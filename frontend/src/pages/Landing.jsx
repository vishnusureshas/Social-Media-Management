import { Link } from 'react-router-dom';
import Logo from '../components/ui/Logo';
import Button from '../components/ui/Button';
import AuroraBackground from '../components/ui/AuroraBackground';
import { useAuth } from '../hooks/useAuth';

const features = [
  {
    icon: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm3 11l4-5 3 3 2-2 4 4',
    title: 'Rich Posts',
    desc: 'Share moments with images, videos, polls and hashtags.',
  },
  {
    icon: 'M12 21c-4-3.5-8-6.8-8-11a4.5 4.5 0 019-1 4.5 4.5 0 019 1c0 4.2-4 7.5-8 11z',
    title: 'Connect Deeply',
    desc: 'Follow people, build communities and amplify your voice.',
  },
  {
    icon: 'M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-5v5l3 2',
    title: 'Stories & Reels',
    desc: 'Ephemeral stories and short-form video to capture every moment.',
  },
  {
    icon: 'M8 12h8m-4-4v8m6-8h-2a6 6 0 01-12 2V8H3a1 1 0 011-1h16a1 1 0 011 1z',
    title: 'Real-time Chat',
    desc: 'Private conversations with typing + read receipts, live.',
  },
];

const Landing = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative">
      <AuroraBackground />

      <section className="mx-auto max-w-7xl px-6 pt-16 pb-24 text-center">
        <div className="animate-fade-up">
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-brand-600">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            The future of social connection
          </span>

          <h1 className="mx-auto mt-8 max-w-3xl font-display text-5xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
            Share your world on <span className="text-gradient animate-gradient">Nexus</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-slate-500">
            A beautiful, lightning-fast social platform. Post, follow, chat and discover —
            all in one serene space.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-up" style={{ animationDelay: '200ms' }}>
            {isAuthenticated ? (
              <Link to="/account">
                <Button size="lg" className="animate-gradient">
                  Go to your profile
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" className="animate-gradient">
                    Get started — it's free
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="secondary" size="lg">
                    Log in
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mx-auto mt-20 max-w-4xl animate-fade-up" style={{ animationDelay: '300ms' }}>
          <div className="glass-strong relative overflow-hidden rounded-3xl p-2">
            <div className="absolute inset-0 -z-0 bg-gradient-to-r from-brand-500/10 via-violet-500/10 to-fuchsia-500/10" />
            <div className="relative grid grid-cols-2 gap-3 sm:grid-cols-4">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="group flex flex-col items-center rounded-2xl bg-white/70 p-6 text-center backdrop-blur transition-all duration-300 hover:-translate-y-2 hover:shadow-glow"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 via-violet-500 to-fuchsia-500 text-white shadow-glow transition-transform duration-300 group-hover:scale-110">
                    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                      <path d={f.icon} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="font-display text-sm font-bold text-slate-900">{f.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200/70 bg-white/50 py-16">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-6 lg:grid-cols-2">
          <div className="animate-float">
            <Logo size="lg" withText={false} className="justify-center" />
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold text-slate-900">
              Built for creators, <span className="text-gradient">loved by everyone</span>
            </h2>
            <p className="mt-4 text-slate-500">
              Newsfeed, stories, reels, live chat and more — powered by a modern MERN stack with a
              premium, distraction-free interface.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;