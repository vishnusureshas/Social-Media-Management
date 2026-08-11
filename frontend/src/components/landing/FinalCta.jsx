import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import useReveal from '../../hooks/useReveal';

const FinalCta = () => {
  const ref = useReveal();

  return (
    <section id="about" ref={ref} className="relative py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="reveal relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-600 via-violet-600 to-fuchsia-600 px-8 py-20 text-center shadow-soft-lg sm:px-16">
          <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-fuchsia-400/30 blur-3xl" />
          <div className="absolute inset-0 bg-grid opacity-20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white backdrop-blur">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor"><path d="M12 2l2.4 5.6L20 9l-4.3 4.2L16.6 20 12 16.6 7.4 20l1-6.8L4 9l5.6-1.4L12 2z"/></svg>
              Join the community
            </span>

            <h2 className="mt-6 font-display text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
              Your people are waiting.
              <br className="hidden sm:block" /> Say hello.
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-lg text-white/80">
              Create your free account in under a minute and start connecting with
              120,000+ creators who call Nexus home.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/register">
                <Button size="lg" className="w-full bg-white text-brand-600 shadow-soft hover:bg-white hover:shadow-soft-lg sm:w-auto">
                  Create your account
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  className="w-full border border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20 sm:w-auto"
                >
                  Log in
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-sm text-white/60">Free forever. No credit card required.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCta;
