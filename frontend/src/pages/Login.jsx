import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useLoginMutation } from '../api/authApi';
import { useState } from 'react';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import AuroraBackground from '../components/ui/AuroraBackground';
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
  const [showPassword, setShowPassword] = useState(false);
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
      toast.success(res?.message || 'Welcome back!');
      const username = res?.data?.user?.username;
      navigate(username ? `/u/${username}` : '/account', { replace: true });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Login failed'));
      const fieldErrors = getFieldErrors(err);
      Object.entries(fieldErrors).forEach(([field, message]) => setError(field, { message }));
    }
  };

  const email = params.get('email');

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue your journey on Nexus"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email address"
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
            className="absolute right-4 top-[38px]"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <EyeIcon open={showPassword} />
          </button>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-slate-500">
            <input type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-brand-500" />
            Remember me
          </label>
          <Link to="/forgot-password" className="font-semibold text-brand-600 hover:text-brand-700">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </Button>

        <p className="pt-2 text-center text-sm text-slate-500">
          New to Nexus?{' '}
          <Link to="/register" className="font-semibold text-gradient">
            Create an account
          </Link>
        </p>
      </form>
      <AuroraBackground />
    </AuthLayout>
  );
};

export default Login;