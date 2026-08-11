import cn from '../../utils/cn';

const variants = {
  primary: 'btn-gradient',
  secondary:
    'bg-white/80 border border-slate-200 text-slate-700 hover:bg-white hover:border-brand-300 hover:text-brand-600 transition-all duration-300 shadow-sm',
  ghost: 'text-slate-600 hover:text-brand-600 hover:bg-brand-50 transition-colors duration-300',
  outline:
    'border border-brand-500 text-brand-600 hover:bg-brand-500 hover:text-white transition-all duration-300',
  danger:
    'bg-rose-500 text-white hover:bg-rose-600 transition-all duration-300 active:scale-95',
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