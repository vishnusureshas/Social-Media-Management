import { Link } from 'react-router-dom';
import LandingLogo from './LandingLogo';

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Explore', href: '#explore' },
      { label: 'Communities', href: '#communities' },
      { label: 'Pricing', href: '#cta' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Press', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
    ],
  },
];

const socials = [
  {
    label: 'Twitter / X',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
        <path d="M18.9 2H22l-7.5 8.6L23 22h-6.8l-5.3-6.9L4.8 22H1.7l8-9.2L1 2h7l4.8 6.3L18.9 2zm-2.4 18h1.9L7.4 4H5.3l11.2 16z" />
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
        <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 00.5 6.2 31 31 0 000 12a31 31 0 00.5 5.8 3 3 0 002.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 002.1-2.1A31 31 0 0024 12a31 31 0 00-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
        <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5V9h3v10zM6.5 7.5A1.75 1.75 0 118.3 5.8a1.75 1.75 0 01-1.8 1.7zM19 19h-3v-5.3c0-1.3-.5-2.2-1.7-2.2a1.8 1.8 0 00-1.7 1.2 2.3 2.3 0 00-.1.8V19H9V9h3v1.3a3 3 0 012.7-1.5c2 0 3.4 1.3 3.4 4.1V19z" />
      </svg>
    ),
  },
];

const LandingFooter = () => (
  <footer className="relative border-t border-white/[0.06] bg-white/[0.02] backdrop-blur-xl">
    <div className="radial-glow -top-24 left-1/2 h-48 w-[42rem] -translate-x-1/2 bg-violet-600/10" aria-hidden="true" />
    <div className="relative mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
        <div>
          <Link to="/">
            <LandingLogo />
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-slate-400">
            The next-gen social platform where real connections meet endless possibilities.
          </p>
          <div className="mt-6 flex items-center gap-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-slate-400 transition-all duration-300 hover:-translate-y-1 hover:border-violet-400/40 hover:text-white hover:shadow-[0_0_24px_rgba(139,92,246,0.35)]"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {columns.map((col) => (
            <div key={col.title}>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">{col.title}</p>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href} className="text-sm text-slate-400 transition-colors duration-300 hover:text-violet-300">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row">
        <p className="text-sm text-slate-500">© {new Date().getFullYear()} Vibely. All rights reserved.</p>
        <span className="neon-text text-sm font-semibold">Connect. Share. Inspire.</span>
      </div>
    </div>
  </footer>
);

export default LandingFooter;