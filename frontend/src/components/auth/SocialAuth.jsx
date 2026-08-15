const providers = [
  {
    name: 'Google',
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]">
        <path fill="#EA4335" d="M12 10.2v3.8h5.4c-.2 1.3-1.4 3.9-5.4 3.9-3.3 0-5.9-2.7-5.9-6s2.6-6 5.9-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 3.3 14.7 2.3 12 2.3c-5.4 0-9.7 4.3-9.7 9.7s4.3 9.7 9.7 9.7c5.6 0 9.3-3.9 9.3-9.4 0-.6-.1-1.1-.2-1.6H12z" />
      </svg>
    ),
  },
  {
    name: 'Apple',
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-white">
        <path d="M16.4 13c.02-1.9 1.6-2.8 1.65-2.85-.9-1.3-2.3-1.48-2.8-1.5-1.2-.12-2.33.7-2.93.7-.6 0-1.52-.68-2.5-.67-1.3.02-2.48.75-3.14 1.9-1.34 2.32-.34 5.76.96 7.64.64.92 1.4 1.96 2.4 1.92.96-.04 1.32-.62 2.48-.62 1.16 0 1.5.62 2.5.6 1.03-.02 1.68-.94 2.32-1.87.73-1.07 1.03-2.1 1.05-2.16-.02-.01-2.02-.77-2.04-3.05zM14.7 7.1c.53-.64.88-1.53.79-2.42-.77.03-1.7.51-2.25 1.16-.49.57-.92 1.49-.81 2.37.86.07 1.74-.43 2.27-1.11z" />
      </svg>
    ),
  },
  {
    name: 'Facebook',
    icon: (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]">
        <path fill="#1877F2" d="M24 12a12 12 0 10-13.9 11.9v-8.4H7.1V12h3V9.7c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.2l-.5 3.5h-2.7v8.4A12 12 0 0024 12z" />
        <path fill="#fff" d="M16.7 15.5l.5-3.5h-3.2v-2.3c0-1 .5-1.9 2-1.9h1.5v-3s-1.4-.2-2.7-.2c-2.7 0-4.5 1.7-4.5 4.7V12H7.1v3.5h3v8.4a12 12 0 004.4 0v-8.4h2.2z" />
      </svg>
    ),
  },
];

const Divider = ({ children }) => (
  <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
    <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/15 to-white/25" />
    {children}
    <span className="h-px flex-1 bg-gradient-to-l from-transparent via-white/15 to-white/25" />
  </div>
);

const SocialAuth = ({ ctaWord = 'Continue' }) => (
  <div>
    <div className="grid grid-cols-3 gap-2.5">
      {providers.map((p) => (
        <button
          key={p.name}
          type="button"
          className="social-btn"
          aria-label={`${ctaWord} with ${p.name}`}
        >
          {p.icon}
          <span className="text-xs">{p.name}</span>
        </button>
      ))}
    </div>
    <Divider>
      or {ctaWord.toLowerCase()} with email
    </Divider>
  </div>
);

export default SocialAuth;