import { Link } from 'react-router-dom';
import useReveal from '../../hooks/useReveal';

const FinalCta = () => {
  const ref = useReveal();

  return (
    <section id="cta" ref={ref} className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="neon-border reveal relative overflow-hidden rounded-[2.5rem] px-8 py-20 text-center shadow-[0_40px_140px_-40px_rgba(139,92,246,0.6)] sm:px-16">
          <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="particles absolute inset-0 opacity-50" />
            <div className="absolute inset-x-0 bottom-0 h-[18rem]">
              {['40%', '30%', '45%'].map((top, i) => (
                <div
                  key={i}
                  className="absolute inset-x-0 rounded-t-full"
                  style={{
                    top,
                    height: '38%',
                    background: 'linear-gradient(90deg, rgba(139,92,246,0.25), rgba(236,72,153,0.25), rgba(34,211,238,0.2))',
                    filter: 'blur(34px)',
                    left: `${i * 22 - 8}%`,
                    right: `${i * 18 - 4}%`,
                  }}
                />
              ))}
            </div>
          </div>
          <div className="absolute -inset-px rounded-[2.5rem] bg-gradient-to-br from-violet-600/20 via-transparent to-pink-500/20 opacity-60" aria-hidden="true" />

          <div className="relative">
            <span className="section-chip">
              <span className="chip-dot" />
              Start today
            </span>
            <h2 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Be Part of <span className="neon-text">Something Bigger</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-slate-400">
              Vibely is more than a platform — it's a movement. Join today and start your journey.
            </p>

            <div className="mt-11 flex flex-col items-center gap-4">
              <Link to="/register">
                <span className="btn-neon inline-flex items-center gap-2 rounded-2xl px-10 text-lg" style={{ padding: '1.1rem 2.5rem' }}>
                  Create Your Account
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </Link>
              <p className="text-sm text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-white underline decoration-violet-500/60 underline-offset-4 transition-colors hover:text-violet-300">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCta;