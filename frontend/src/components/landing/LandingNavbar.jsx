import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import cn from '../../utils/cn';
import LandingLogo from './LandingLogo';

const links = [
  { label: 'Home', href: '#home' },
  { label: 'Explore', href: '#explore' },
  { label: 'Features', href: '#features' },
  { label: 'Communities', href: '#communities' },
  { label: 'Blog', href: '#' },
  { label: 'Pricing', href: '#cta' },
];

const ThemeIcon = () => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4.2" />
    <path d="M12 2.5v2.2M12 19.3v2.2M4.3 4.3l1.5 1.5M18.2 18.2l1.5 1.5M2.5 12h2.2M19.3 12h2.2M4.3 19.7l1.5-1.5M18.2 5.8l1.5-1.5" />
  </svg>
);

const LandingNavbar = ({ onToggleTheme = () => {} }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'landing-nav fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300',
        scrolled ? 'neon-scrolled border-white/[0.06]' : 'border-transparent bg-transparent'
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" aria-label="Vibely home" className="shrink-0">
          <LandingLogo />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <li key={l.label}>
              <a href={l.href} className="nav-link rounded-full px-4 py-2">
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          <button type="button" aria-label="Toggle theme" onClick={onToggleTheme} className="theme-toggle-btn">
            <ThemeIcon />
          </button>
          <Link to="/login">
            <span className="nav-link rounded-full px-4 py-2">Log in</span>
          </Link>
          <Link to="/register">
            <span className="btn-neon inline-flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm">
              Sign Up
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <button type="button" aria-label="Toggle theme" onClick={onToggleTheme} className="theme-toggle-btn">
            <ThemeIcon />
          </button>
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="mx-4 mb-4 rounded-3xl border border-white/10 bg-[#0a0e22]/90 p-4 backdrop-blur-2xl lg:hidden">
          <ul className="flex flex-col gap-1">
            {links.map((l) => (
              <li key={l.label}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/5 hover:text-white"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2 border-t border-white/10 pt-4">
            <Link to="/login" className="flex-1" onClick={() => setOpen(false)}>
              <span className="block w-full rounded-xl border border-white/15 bg-white/5 py-2.5 text-center text-sm font-semibold text-white">
                Log in
              </span>
            </Link>
            <Link to="/register" className="flex-1" onClick={() => setOpen(false)}>
              <span className="btn-neon block w-full rounded-xl py-2.5 text-center text-sm">Sign Up</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingNavbar;