import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';
import Button from '../ui/Button';
import cn from '../../utils/cn';

const links = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'Explore', href: '#explore' },
  { label: 'About', href: '#about' },
];

const LandingNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'landing-nav fixed inset-x-0 top-0 z-50 border-b',
        scrolled
          ? 'border-white/60 bg-white/75 shadow-soft backdrop-blur-xl'
          : 'border-transparent bg-transparent'
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" aria-label="Nexus home" className="shrink-0">
          <Logo />
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition-colors duration-300 hover:bg-brand-50 hover:text-brand-600"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          <Link to="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link to="/register">
            <Button size="sm">Sign up free</Button>
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-700 md:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div className="mx-4 mb-4 rounded-3xl border border-white/60 bg-white/90 p-4 shadow-soft-lg backdrop-blur-xl md:hidden">
          <ul className="flex flex-col gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-brand-50 hover:text-brand-600"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2 border-t border-slate-100 pt-4">
            <Link to="/login" className="flex-1">
              <Button variant="secondary" size="sm" className="w-full">
                Log in
              </Button>
            </Link>
            <Link to="/register" className="flex-1">
              <Button size="sm" className="w-full">
                Sign up free
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingNavbar;
