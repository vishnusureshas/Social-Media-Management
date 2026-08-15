import cn from '../../utils/cn';

const VibelyMark = ({ className = 'h-10 w-10' }) => (
  <div className={cn('icon-orb relative flex items-center justify-center rounded-2xl', className)}>
    <svg viewBox="0 0 32 32" className="h-3/5 w-3/5" fill="none">
      <path d="M12 8l8 16 8-16" stroke="white" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
    <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-cyan-300" style={{ boxShadow: '0 0 12px 2px rgba(34,211,238,0.9)' }} />
  </div>
);

const LandingLogo = ({ withText = true, className = '' }) => (
  <span className={cn('flex items-center gap-2.5', className)}>
    <VibelyMark />
    {withText && (
      <span className="font-display text-[1.35rem] font-extrabold tracking-tight text-white">
        Vi<span className="neon-text">bely</span>
      </span>
    )}
  </span>
);

export default LandingLogo;