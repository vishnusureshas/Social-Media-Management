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
      variant="forgot"
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a secure code to reset it."
      showTabs={false}
    >
      {sent ? (
        <div className="space-y-4 text-center">
          <div className="icon-orb mx-auto h-16 w-16 rounded-2xl">
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-slate-300">
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
            icon={({ className }) => (
              <svg className={className} viewBox="0 0 24 24" fill="none">
                <path d="M4 6h16v12H4V6zm2 2l6 5 6-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {...register('email')}
          />
          <Button variant="neon" type="submit" loading={isLoading} className="w-full" size="lg">
            {isLoading ? 'Sending...' : 'Send reset code'}
          </Button>
          <p className="pt-1 text-center text-sm text-slate-400">
            <Link to="/login" className="font-semibold text-violet-300 transition-colors hover:text-violet-200">
              ← Back to login
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;