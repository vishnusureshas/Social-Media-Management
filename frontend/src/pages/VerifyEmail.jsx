import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useVerifyEmailMutation, useResendOtpMutation } from '../api/authApi';
import AuthLayout from '../layouts/AuthLayout';
import OTPInput from '../components/ui/OTPInput';
import Button from '../components/ui/Button';
import AuroraBackground from '../components/ui/AuroraBackground';
import { getApiErrorMessage } from '../utils/errorUtils';
import { useEffect } from 'react';

const VerifyEmail = () => {
  const [params] = useSearchParams();
  const email = params.get('email') || '';
  const devCode = params.get('code') || '';
  const [otp, setOtp] = useState(devCode);
  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const [resendOtp, { isLoading: resending }] = useResendOtpMutation();
  const [timer, setTimer] = useState(60);
  const navigate = useNavigate();

  useEffect(() => {
    if (!email) navigate('/register', { replace: true });
  }, [email, navigate]);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }
    try {
      const res = await verifyEmail({ email, otp }).unwrap();
      toast.success(res?.message || 'Email verified!');
      navigate(`/login?email=${encodeURIComponent(email)}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Verification failed'));
    }
  };

  const handleResend = async () => {
    try {
      const res = await resendOtp({ email, purpose: 'verify_email' }).unwrap();
      toast.success('New code sent');
      if (res?.data?.devOtp) setOtp(res.data.devOtp);
      setTimer(60);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not resend code'));
    }
  };

  const isDevCode = Boolean(devCode);

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={`We sent a 6-digit code to${email ? ' ' + email : ' your email'}. Check your inbox.`}
      showTabs={false}
    >
      <div className="space-y-6">
        <div className="rounded-2xl bg-brand-50/70 p-4 text-center text-sm text-brand-700 animate-fade-in">
          {isDevCode ? (
            <span>
              <strong>Development code:</strong> your verification code is{' '}
              <span className="inline-block rounded-lg bg-white px-2 py-0.5 font-mono text-base font-bold tracking-widest text-brand-700 shadow-sm">
                {devCode}
              </span>
            </span>
          ) : (
            <span>
              SMTP isn't configured yet — your code was logged in the{' '}
              <strong>backend console</strong> as{' '}
              <code className="rounded bg-white/70 px-1.5 py-0.5 font-mono text-xs">[otp] (DEV)</code>
            </span>
          )}
        </div>

        <OTPInput
          length={6}
          value={otp}
          onChange={setOtp}
          error={otp.length > 0 && otp.length < 6 ? 'Enter all 6 digits' : undefined}
        />

        <Button onClick={handleVerify} loading={isLoading} className="w-full" size="lg">
          {isLoading ? 'Verifying...' : 'Verify email'}
        </Button>

        <div className="text-center text-sm">
          <span className="text-slate-500">Didn't get the code? </span>
          {timer > 0 ? (
            <span className="font-semibold text-slate-400">Resend in {timer}s</span>
          ) : (
            <button onClick={handleResend} disabled={resending} className="font-semibold text-brand-600 hover:text-brand-700">
              {resending ? 'Sending...' : 'Resend code'}
            </button>
          )}
        </div>

        <p className="text-center text-sm text-slate-500">
          <Link to="/login" className="font-semibold text-slate-700 hover:text-brand-600">
            ← Back to login
          </Link>
        </p>
      </div>
      <AuroraBackground />
    </AuthLayout>
  );
};

export default VerifyEmail;