import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useRegisterMutation } from '../api/authApi';
import { useEffect, useState } from 'react';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { getApiErrorMessage, getFieldErrors } from '../utils/errorUtils';

const schema = yup.object({
  username: yup
    .string()
    .min(3, 'At least 3 characters')
    .max(20, 'At most 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers and underscores allowed')
    .required('Username is required'),
  fullName: yup.string().max(50).nullable(),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup
    .string()
    .min(6, 'At least 6 characters')
    .max(64)
    .matches(/[a-zA-Z]/, 'Must contain a letter')
    .matches(/[0-9]/, 'Must contain a number')
    .required('Password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Confirm your password'),
});

const EyeIcon = ({ open }) =>
  open ? (
    <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none">
      <path d="M3 3l18 18M10.5 10.5a2 2 0 003 3M7.4 7.4C4.9 8.8 3.5 11 3 12c1.5 3 4.5 6 9 6 1.7 0 3.3-.6 4.7-1.4M14.6 9.4A2 2 0 0117.5 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M21 12c-1.5 3-4.5 6-9 6-.7 0-1.4-.1-2-.3M9.5 6.3C10.3 6.1 11.1 6 12 6c4.5 0 7.5 3 9 6-.6 1.2-1.6 2.6-3 3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ) : (
    <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7zM12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

const PasswordField = ({ label, error, show, onToggle, autoComplete = 'new-password', ...props }) => (
  <div className="relative">
    <Input
      label={label}
      type={show ? 'text' : 'password'}
      autoComplete={autoComplete}
      placeholder="••••••••"
      error={error}
      icon={({ className }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path d="M5 11h14v10H5V11zm7-6a4 4 0 00-4 4v2h8V9a4 4 0 00-4-4z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {...props}
    />
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-4 top-[42px]"
      aria-label={show ? 'Hide password' : 'Show password'}
    >
      <EyeIcon open={show} />
    </button>
  </div>
);

const strengthColors = [
  { bar: 'from-rose-500 to-rose-400', text: 'text-rose-300', label: 'Weak' },
  { bar: 'from-amber-500 to-amber-400', text: 'text-amber-300', label: 'Okay' },
  { bar: 'from-lime-500 to-lime-400', text: 'text-lime-300', label: 'Good' },
  { bar: 'from-emerald-500 to-teal-400', text: 'text-emerald-300', label: 'Strong' },
];

const Register = () => {
  const [register] = useRegisterMutation();
  const [strength, setStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const {
    register: reg,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema), defaultValues: { username: '', fullName: '', email: '', password: '', confirmPassword: '' } });

  const password = watch('password') || '';

  useEffect(() => {
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    setStrength(Math.min(score, 4));
  }, [password]);

  const onSubmit = async (values) => {
    try {
      const { confirmPassword: _confirmPassword, ...payload } = values;
      const res = await register(payload).unwrap();
      toast.success(res?.message || 'Account created!');
      const query = new URLSearchParams({ email: values.email });
      if (res?.data?.devOtp) query.set('code', res.data.devOtp);
      navigate(`/verify-email?${query.toString()}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Registration failed'));
      const fieldErrors = getFieldErrors(err);
      if (fieldErrors.username) setError('username', { message: fieldErrors.username });
      if (fieldErrors.email) setError('email', { message: fieldErrors.email });
    }
  };

  return (
    <AuthLayout
      variant="register"
      title="Create your account ✨"
      subtitle="Start your journey with Vibely"
      social
      ctaWord="Sign up"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <Input
          label="Full Name"
          placeholder="Your name"
          autoComplete="name"
          error={errors.fullName?.message}
          icon={({ className }) => (
            <svg className={className} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
              <path d="M4 20a8 8 0 0116 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          )}
          {...reg('fullName')}
        />

        <Input
          label="Username"
          placeholder="@username"
          autoComplete="username"
          error={errors.username?.message}
          icon={({ className }) => (
            <svg className={className} viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
              <path d="M4 12h16M12 4c3 3 3 13 0 16M12 4c-3 3-3 13 0 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          )}
          {...reg('username')}
        />

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          icon={({ className }) => (
            <svg className={className} viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16v12H4V6zm2 2l6 5 6-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {...reg('email')}
        />

        <div>
          <PasswordField
            label="Password"
            error={errors.password?.message}
            show={showPassword}
            onToggle={() => setShowPassword((s) => !s)}
            {...reg('password')}
          />
          {password && (
            <div className="mt-2.5">
              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full bg-white/10 transition-all duration-500 ${
                      strength > i
                        ? `bg-gradient-to-r ${strengthColors[strength - 1].bar}`
                        : ''
                    }`}
                  />
                ))}
              </div>
              <p className={`mt-1.5 text-xs font-semibold ${strength ? strengthColors[strength - 1].text : 'text-slate-500'}`}>
                {password ? `Password strength: ${strengthColors[strength - 1].label}` : ''}
              </p>
            </div>
          )}
        </div>

        <PasswordField
          label="Confirm Password"
          error={errors.confirmPassword?.message}
          show={showConfirm}
          onToggle={() => setShowConfirm((s) => !s)}
          {...reg('confirmPassword')}
        />

        <label className="flex cursor-pointer items-start gap-2.5 pt-1 text-xs leading-relaxed text-slate-400">
          <input type="checkbox" className="neon-check mt-0.5" />
          <span>
            I agree to the{' '}
            <Link to="#" className="font-semibold text-violet-300 transition-colors hover:text-violet-200">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="#" className="font-semibold text-violet-300 transition-colors hover:text-violet-200">
              Privacy Policy
            </Link>
          </span>
        </label>

        <Button variant="neon" type="submit" loading={isSubmitting} className="w-full" size="lg">
          {isSubmitting ? 'Creating account...' : 'Create Account'}
          {!isSubmitting && (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          )}
        </Button>

        <p className="pt-1 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="neon-text font-bold">
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Register;