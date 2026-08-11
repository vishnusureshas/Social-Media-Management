import cn from '../../utils/cn';

const Logo = ({ size = 'md', withText = true, className = '' }) => {
  const sizes = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-14 w-14' };
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className={cn('relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 via-violet-500 to-fuchsia-500 shadow-glow', sizes[size])}>
        <svg viewBox="0 0 32 32" className="h-3/5 w-3/5" fill="none">
          <path d="M8 16h12M16 8v16" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      </div>
      {withText && (
        <span className={cn('font-display font-bold tracking-tight text-slate-900', size === 'lg' ? 'text-3xl' : 'text-xl')}>
          N<span className="text-gradient">exus</span>
        </span>
      )}
    </div>
  );
};

export default Logo;