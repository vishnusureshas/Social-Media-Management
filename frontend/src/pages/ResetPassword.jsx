import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useResetPasswordMutation } from '../api/authApi';
import { useState } from 'react';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import OTPInput from '../components/ui/OTPInput';
import AuroraBackground from '../components/ui/AuroraBackground';
import { getApiErrorMessage, getFieldErrors } from '../utils/errorUtils';

const schema = yup.object({
  newPassword: yup
    .string()
    .min(6, 'At least 6 characters')
    .matches(/[a-zA-Z]/, 'Must contain a letter')
    .matches(/[0-9]/, 'Must contain a number')
    .required('New password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm your password'),
});

const ResetPassword = () => {
  const [params] = useSearchParams();
  const email = params.get('email') || '';
  const devCode = params.get('code') || '';
  const [otp, setOtp] = useState(devCode);
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const navigate = useNavigate();

  const { register: reg, handleSubmit, setError, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (values) => {
    try {
      const res = await resetPassword({ email, otp, newPassword: values.newPassword }).unwrap();
      toast.success(res?.message || 'Password reset successful!');
      navigate(`/login?email=${encodeURIComponent(email)}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Password reset failed'));
      const fieldErrors = getFieldErrors(err);
      if (fieldErrors.otp) setError('otp', { message: fieldErrors.otp });
    }
  };

  if (!email) {
    return (
      <AuthLayout title="Reset password" subtitle="Please enter your email to reset your password" showTabs={false}>
        <p className="text-center text-sm text-slate-500">
          Missing email. <Link to="/forgot-password" className="font-semibold text-brand-600">Request a reset code</Link>
        </p>
        <AuroraBackground />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset password"
      subtitle={`Enter the code sent to ${email} and choose a new password`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {devCode && (
          <div className="rounded-2xl bg-brand-50/70 p-4 text-center text-sm text-brand-700 animate-fade-in">
            <strong>Development code:</strong>{' '}
            <span className="inline-block rounded-lg bg-white px-2 py-0.5 font-mono text-base font-bold tracking-widest text-brand-700 shadow-sm">
              {devCode}
            </span>
          </div>
        )}
        <div>
          <label className="mb-3 block text-sm font-medium text-slate-600">Verification code</label>
          <OTPInput length={6} value={otp} onChange={setOtp} error={errors.otp?.message} />
        </div>

        <Input label="New password" type="password" placeholder="••••••••" error={errors.newPassword?.message} {...reg('newPassword')} />
        <Input label="Confirm new password" type="password" placeholder="••••••••" error={errors.confirmPassword?.message} {...reg('confirmPassword')} />

        <Button type="submit" loading={isLoading} className="w-full" size="lg">
          {isLoading ? 'Resetting...' : 'Reset password'}
        </Button>

        <p className="text-center text-sm text-slate-500">
          <Link to="/login" className="font-semibold text-slate-700 hover:text-brand-600">← Back to login</Link>
        </p>
      </form>
      <AuroraBackground />
    </AuthLayout>
  );
};

export default ResetPassword;