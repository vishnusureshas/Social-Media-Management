import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import toast from 'react-hot-toast';
import { useChangePasswordMutation } from '../api/authApi';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLogoutMutation } from '../api/authApi';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import AuroraBackground from '../components/ui/AuroraBackground';
import { getApiErrorMessage, getFieldErrors } from '../utils/errorUtils';

const schema = yup.object({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup
    .string()
    .min(6, 'At least 6 characters')
    .matches(/[a-zA-Z]/, 'Must contain a letter')
    .matches(/[0-9]/, 'Must contain a number')
    .notOneOf([yup.ref('currentPassword')], 'New password must differ')
    .required('New password is required'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm your password'),
});

const ChangePassword = () => {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [logout] = useLogoutMutation();
  const { refreshToken } = useAuth();
  const navigate = useNavigate();
  const [done, setDone] = useState(false);

  const { register, handleSubmit, setError, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (values) => {
    try {
      const res = await changePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword }).unwrap();
      toast.success(res?.message || 'Password changed');
      setDone(true);
      reset();
      try {
        await logout(refreshToken).unwrap();
      } catch {
        /* backend already revoked sessions */
      }
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not change password'));
      const fieldErrors = getFieldErrors(err);
      Object.entries(fieldErrors).forEach(([field, message]) => {
        if (['currentPassword', 'newPassword'].includes(field)) setError(field, { message });
      });
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-10 animate-fade-up">
      <div className="glass-strong rounded-3xl p-8">
        <h2 className="font-display text-2xl font-bold text-slate-900">Change password</h2>
        <p className="mt-1 mb-6 text-sm text-slate-500">
          You'll be logged out of all sessions after changing your password.
        </p>

        {done && (
          <div className="mb-6 rounded-2xl bg-emerald-50 p-4 text-center text-sm font-medium text-emerald-700 animate-scale-in">
            Password changed — redirecting to login...
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Current password" type="password" placeholder="••••••••" error={errors.currentPassword?.message} {...register('currentPassword')} />
          <Input label="New password" type="password" placeholder="••••••••" error={errors.newPassword?.message} {...register('newPassword')} />
          <Input label="Confirm new password" type="password" placeholder="••••••••" error={errors.confirmPassword?.message} {...register('confirmPassword')} />
          <Button type="submit" loading={isLoading} className="w-full" size="lg">
            {isLoading ? 'Updating...' : 'Update password'}
          </Button>
        </form>
      </div>
      <AuroraBackground />
    </div>
  );
};

export default ChangePassword;