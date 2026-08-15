import cn from '../../utils/cn';

const variants = {
  primary: 'btn-gradient',
  secondary:
    'border border-white/[0.14] bg-white/[0.06] text-slate-100 hover:bg-white/[0.1] hover:border-violet-400/40 hover:text-white transition-all duration-300',
  ghost: 'text-slate-400 hover:text-violet-200 hover:bg-white/[0.06] transition-colors duration-300',
  outline:
    'border border-violet-400/60 text-violet-300 hover:bg-violet-500/80 hover:text-white transition-all duration-300',
  danger:
    'bg-rose-500 text-white hover:bg-rose-600 transition-all duration-300 active:scale-95',
  neon: 'btn-neon',
  neonGhost: 'btn-ghost-neon',
};

const sizes = {
  sm: 'px-4 py-2 text-sm rounded-xl',
  md: 'px-6 py-3 text-sm rounded-2xl',
  lg: 'px-8 py-4 text-base rounded-2xl',
};

const Spinner = ({ className = 'h-4 w-4' }) => (
  <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
);

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  disabled,
  ...props
}) => (
  <button
    disabled={disabled || loading}
    className={cn(
      'inline-flex items-center justify-center gap-2 font-semibold cursor-pointer select-none',
      variants[variant],
      sizes[size],
      className
    )}
    {...props}
  >
    {loading && <Spinner />}
    {children}
  </button>
);

export default Button;