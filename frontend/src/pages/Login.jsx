import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useLoginMutation } from '../api/authApi';
import { useLogin2FAMutation } from '../api/securityApi';
import { useState } from 'react';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { getApiErrorMessage, getFieldErrors } from '../utils/errorUtils';

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
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

const Login = () => {
  const [login] = useLoginMutation();
  const [login2FA] = useLogin2FAMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorChallenge, setTwoFactorChallenge] = useState(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [submitting2FA, setSubmitting2FA] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (values) => {
    try {
      const res = await login(values).unwrap();
      if (res?.data?.requiresTwoFactor) {
        setTwoFactorChallenge(res.data.challenge);
        toast('Two-factor code required. Enter the code from your authenticator app.');
        return;
      }
      toast.success(res?.message || 'Welcome back!');
      const username = res?.data?.user?.username;
      navigate(username ? `/u/${username}` : '/account', { replace: true });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Login failed'));
      const fieldErrors = getFieldErrors(err);
      Object.entries(fieldErrors).forEach(([field, message]) => setError(field, { message }));
    }
  };

  const onSubmit2FA = async (e) => {
    e.preventDefault();
    if (!twoFactorChallenge) return;
    setSubmitting2FA(true);
    try {
      const res = await login2FA({ challenge: twoFactorChallenge, code: twoFactorCode }).unwrap();
      toast.success(res?.message || 'Welcome back!');
      setTwoFactorChallenge(null);
      const username = res?.data?.user?.username;
      navigate(username ? `/u/${username}` : '/account', { replace: true });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Two-factor verification failed'));
    } finally {
      setSubmitting2FA(false);
    }
  };

  const email = params.get('email');

  if (twoFactorChallenge) {
    return (
      <AuthLayout
        variant="forgot"
        title="Two-factor authentication"
        subtitle="Enter the 6-digit code from your authenticator app"
        showTabs={false}
      >
        <form onSubmit={onSubmit2FA} className="space-y-5">
          <Input
            label="Verification code"
            type="text"
            inputMode="numeric"
            placeholder="000000"
            maxLength={6}
            value={twoFactorCode}
            onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
            icon={({ className }) => (
              <svg className={className} viewBox="0 0 24 24" fill="none">
                <path d="M12 2l4 4-4 4-4-4 4-4zM5 15a7 7 0 1014 0V9a7 7 0 10-14 0v6zm0 0h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          />
          <Button type="submit" variant="neon" loading={submitting2FA} className="w-full" size="lg">
            {submitting2FA ? 'Verifying...' : 'Verify and log in'}
          </Button>
          <p className="pt-1 text-center text-xs text-slate-500">
            Used a backup code? Enter it above. If you have no codes left, contact support.
          </p>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      variant="login"
      title="Welcome back 👋"
      subtitle="Login to your account"
      social
      ctaWord="Continue"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email or Username"
          type="email"
          placeholder="you@example.com"
          defaultValue={email || ''}
          error={errors.email?.message}
          icon={({ className }) => (
            <svg className={className} viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16v12H4V6zm2 2l6 5 6-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {...register('email')}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            error={errors.password?.message}
            icon={({ className }) => (
              <svg className={className} viewBox="0 0 24 24" fill="none">
                <path d="M5 11h14v10H5V11zm7-6a4 4 0 00-4 4v2h8V9a4 4 0 00-4-4z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-4 top-[42px]"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 text-sm">
          <label className="flex cursor-pointer items-center gap-2.5 text-slate-400">
            <input type="checkbox" className="neon-check rounded" />
            Remember me
          </label>
          <Link
            to="/forgot-password"
            className="font-semibold text-violet-300 transition-colors hover:text-violet-200"
          >
            Forgot password?
          </Link>
        </div>

        <Button variant="neon" type="submit" loading={isSubmitting} className="w-full" size="lg">
          {isSubmitting ? 'Logging in...' : 'Log In'}
          {!isSubmitting && (
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          )}
        </Button>

        <p className="pt-1 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="neon-text font-bold">
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;