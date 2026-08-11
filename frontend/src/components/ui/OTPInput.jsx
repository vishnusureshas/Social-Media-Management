import { useRef, useState } from 'react';
import cn from '../../utils/cn';

const OTPInput = ({ length = 6, value, onChange, error, autoFocus = true }) => {
  const refs = useRef([]);
  const [values, setValues] = useState(Array(length).fill(''));

  if (value !== undefined) {
    // controlled mode
  }

  const handleChange = (index, val) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...(value || values)];
    next[index] = digit;
    setValues(next);
    onChange?.(next.join(''));
    if (digit && index < length - 1) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !(value || values)[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length).split('');
    const next = Array(length).fill('');
    digits.forEach((d, i) => (next[i] = d));
    setValues(next);
    onChange?.(next.join(''));
    refs.current[Math.min(digits.length, length - 1)]?.focus();
  };

  return (
    <div>
      <div className="flex justify-between gap-2">
        {(value || values).map((char, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={char}
            autoFocus={autoFocus && i === 0}
            onPaste={handlePaste}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className={cn(
              'h-14 w-12 rounded-2xl border border-slate-200 bg-white/80 text-center text-xl font-bold text-slate-800 outline-none transition-all duration-200',
              'focus:border-brand-400 focus:ring-4 focus:ring-brand-500/10',
              char && 'border-brand-300 bg-brand-50/50',
              error && 'border-rose-300'
            )}
          />
        ))}
      </div>
      {error && <p className="mt-2 text-xs font-medium text-rose-500">{error}</p>}
    </div>
  );
};

export default OTPInput;