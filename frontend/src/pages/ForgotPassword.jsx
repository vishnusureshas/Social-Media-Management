import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useForgotPasswordMutation } from '../api/authApi';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import AuroraBackground from '../components/ui/AuroraBackground';
import { getApiErrorMessage } from '../utils/errorUtils';

const schema = yup.object({
  email: yup.string().email('Enter a valid email').required('Email is required'),
});

const ForgotPassword = () => {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');
  const [devCode, setDevCode] = useState('');
  const submitted = useRef(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  useEffect(() => {
    if (!sent) return;
    const t = setTimeout(() => {
      const query = new URLSearchParams({ email });
      if (devCode) query.set('code', devCode);
      navigate(`/reset-password?${query.toString()}`);
    }, 2500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sent]);

  const onSubmit = async (values) => {
    if (submitted.current) return;
    submitted.current = true;
    try {
      const res = await forgotPassword(values).unwrap();
      setEmail(values.email);
      if (res?.data?.devOtp) setDevCode(res.data.devOtp);
      setSent(true);
      toast.success('If that email exists, a reset code was sent');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not send reset code'));
    } finally {
      submitted.current = false;
    }
  };

  return (
    <AuthLayout
      title="Forgot password"
      subtitle="We'll email you a code to reset your password"
    >
      {sent ? (
        <div className="space-y-4 text-center animate-scale-in">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
            <svg className="h-7 w-7 text-emerald-600" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-sm text-slate-600">
            Reset code sent — redirecting to the reset page shortly...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Button type="submit" loading={isLoading} className="w-full" size="lg">
            {isLoading ? 'Sending...' : 'Send reset code'}
          </Button>
          <p className="text-center text-sm text-slate-500">
            <Link to="/login" className="font-semibold text-slate-700 hover:text-brand-600">
              ← Back to login
            </Link>
          </p>
        </form>
      )}
      <AuroraBackground />
    </AuthLayout>
  );
};

export default ForgotPassword;