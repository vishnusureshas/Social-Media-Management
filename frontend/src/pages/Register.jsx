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
import AuroraBackground from '../components/ui/AuroraBackground';
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

const Register = () => {
  const [register] = useRegisterMutation();
  const [strength, setStrength] = useState(0);
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

  const strengthColors = ['bg-rose-400', 'bg-amber-400', 'bg-lime-400', 'bg-emerald-500'];
  const strengthLabels = ['Weak', 'Okay', 'Good', 'Strong'];

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
      title="Create your account"
      subtitle="Join Nexus — connect with the world"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Username"
            placeholder="@username"
            error={errors.username?.message}
            {...reg('username')}
          />
          <Input
            label="Full name (optional)"
            placeholder="Your name"
            error={errors.fullName?.message}
            {...reg('fullName')}
          />
        </div>

        <Input
          label="Email address"
          type="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...reg('email')}
        />

        <div>
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...reg('password')}
          />
          {password && (
            <div className="mt-2">
              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                      strength > i ? strengthColors[strength - 1] : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
              <p className="mt-1.5 text-xs text-slate-500">
                Password strength:{' '}
                <span className="font-semibold">{strengthLabels[strength - 1]}</span>
              </p>
            </div>
          )}
        </div>

        <Input
          label="Confirm password"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...reg('confirmPassword')}
        />

        <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </Button>

        <p className="pt-2 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-gradient">
            Log in
          </Link>
        </p>
      </form>
      <AuroraBackground />
    </AuthLayout>
  );
};

export default Register;