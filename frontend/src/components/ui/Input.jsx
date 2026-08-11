import { forwardRef } from 'react';
import cn from '../../utils/cn';

const Input = forwardRef(
  ({ label, error, icon: Icon, className = '', containerClassName = '', ...props }, ref) => (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label className="mb-2 block text-sm font-medium text-slate-600">{label}</label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        )}
        <input
          ref={ref}
          className={cn(
            'input-base',
            Icon && 'pl-12',
            error && 'border-rose-300 focus:border-rose-400 focus:ring-rose-500/10',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-rose-500">{error}</p>}
    </div>
  )
);

Input.displayName = 'Input';

export default Input;