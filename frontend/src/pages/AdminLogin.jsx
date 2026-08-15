import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useAdminLoginMutation } from '../api/adminApi';
import { useLogin2FAMutation } from '../api/securityApi';
import { setCredentials } from '../store/slices/authSlice';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import AuroraBackground from '../components/ui/AuroraBackground';
import { getApiErrorMessage, getFieldErrors } from '../utils/errorUtils';

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const AdminLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [adminLogin] = useAdminLoginMutation();
  const [login2FA] = useLogin2FAMutation();

  const [twoFactorChallenge, setTwoFactorChallenge] = useState(null);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [submitting2FA, setSubmitting2FA] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) });

  const finishWithTokens = (res) => {
    dispatch(setCredentials(res?.data));
    toast.success('Welcome back, admin.');
    navigate('/admin', { replace: true });
  };

  const onSubmit = async (values) => {
    try {
      const res = await adminLogin(values).unwrap();
      if (res?.data?.requiresTwoFactor) {
        setTwoFactorChallenge(res.data.challenge);
        toast('Two-factor code required. Enter the code from your authenticator app.');
        return;
      }
      finishWithTokens(res);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Admin login failed'));
      const fieldErrors = getFieldErrors(err);
      Object.entries(fieldErrors).forEach(([field, message]) => setError(field, { message }));
      if (err?.data?.statusCode === 403) {
        navigate('/', { replace: true });
      }
    }
  };

  const onSubmit2FA = async (e) => {
    e.preventDefault();
    if (!twoFactorChallenge) return;
    setSubmitting2FA(true);
    try {
      const res = await login2FA({ challenge: twoFactorChallenge, code: twoFactorCode }).unwrap();
      dispatch(setCredentials(res?.data));
      toast.success('Verified. Setting up the dashboard.');
      navigate('/admin', { replace: true });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Two-factor verification failed'));
    } finally {
      setSubmitting2FA(false);
    }
  };

  if (twoFactorChallenge) {
    return (
      <AuthLayout
        title="Admin · Two-factor"
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
          />
          <Button type="submit" loading={submitting2FA} className="w-full" size="lg">
            {submitting2FA ? 'Verifying...' : 'Verify and enter admin'}
          </Button>
          <p className="pt-2 text-center text-sm text-slate-500">
            Used a backup code? Enter it above.
          </p>
        </form>
        <AuroraBackground />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Admin sign in"
      subtitle="Restricted area — admin & superadmin accounts only."
      showTabs={false}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email address"
          type="email"
          placeholder="admin@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
          {isSubmitting ? 'Signing in...' : 'Enter admin panel'}
        </Button>
        <p className="pt-2 text-center text-sm text-slate-500">
          Not an admin?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Go to normal sign in
          </Link>
        </p>
      </form>
      <AuroraBackground />
    </AuthLayout>
  );
};

export default AdminLogin;