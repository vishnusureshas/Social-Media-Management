import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  useSetup2FAMutation,
  useEnable2FAMutation,
  useDisable2FAMutation,
  useGetSessionsQuery,
  useRevokeSessionMutation,
  useGetSecurityLogsQuery,
} from '../api/securityApi';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import AuroraBackground from '../components/ui/AuroraBackground';
import { getApiErrorMessage } from '../utils/errorUtils';

const SectionCard = ({ title, subtitle, children }) => (
  <div className="glass-strong rounded-3xl p-6 animate-fade-up">
    <h2 className="font-display text-lg font-bold text-slate-900">{title}</h2>
    {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    <div className="mt-4">{children}</div>
  </div>
);

const STATUS_LABELS = {
  login: 'Logged in',
  login_failed: 'Failed login',
  '2fa_setup': '2FA setup started',
  '2fa_enabled': '2FA enabled',
  '2fa_disabled': '2FA disabled',
  '2fa_login': '2FA login',
  password_changed: 'Password changed',
  logout: 'Logged out',
  session_revoked: 'Session revoked',
};

const TwoFactorCard = () => {
  const { user } = useAuth();
  const enabled = !!user?.twoFAEnabled;

  const [setup2FA] = useSetup2FAMutation();
  const [enable2FA] = useEnable2FAMutation();
  const [disable2FA] = useDisable2FAMutation();

  const [setupInfo, setSetupInfo] = useState(null);
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState(null);
  const [action, setAction] = useState(null);

  const handleSetup = async () => {
    setAction('setup');
    try {
      const res = await setup2FA().unwrap();
      setSetupInfo(res?.data);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not start 2FA setup'));
    } finally {
      setAction(null);
    }
  };

  const handleEnable = async () => {
    setAction('enable');
    try {
      const res = await enable2FA(code).unwrap();
      setBackupCodes(res?.data?.backupCodes || []);
      setSetupInfo(null);
      setCode('');
      toast.success(res?.message || 'Two-factor authentication enabled');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not enable 2FA'));
    } finally {
      setAction(null);
    }
  };

  const handleDisable = async () => {
    setAction('disable');
    try {
      const res = await disable2FA(code).unwrap();
      setBackupCodes(null);
      setCode('');
      toast.success(res?.message || 'Two-factor authentication disabled');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not disable 2FA'));
    } finally {
      setAction(null);
    }
  };

  if (backupCodes) {
    return (
      <SectionCard title="Save your backup codes" subtitle="Store these safely — each can be used once to sign in if you lose your phone.">
        <div className="grid grid-cols-2 gap-2">
          {backupCodes.map((b) => (
            <code key={b} className="rounded-xl bg-white/70 px-3 py-2 text-center text-sm font-bold tracking-wider text-slate-700">
              {b}
            </code>
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-400">You can close this page after saving the codes.</p>
      </SectionCard>
    );
  }

  if (setupInfo && !enabled) {
    return (
      <SectionCard title="Scan to enable 2FA" subtitle="Add the code manually if you can't scan the QR code.">
        <div className="rounded-2xl bg-white/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Authenticator key</p>
          <code className="mt-1 block break-all text-sm font-bold text-slate-700">{setupInfo.secret}</code>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Input
            label="Enter the 6-digit code"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="flex-1"
          />
          <Button onClick={handleEnable} loading={action === 'enable'} className="mt-6 shrink-0">
            Enable
          </Button>
        </div>
      </SectionCard>
    );
  }

  if (enabled) {
    return (
      <SectionCard title="Two-factor authentication" subtitle="Your account is protected with an authenticator app.">
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm text-slate-600">
            Every sign-in will ask for your one-time code. Keep your authenticator app synced
            to avoid getting locked out.
          </p>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-600">
            Enabled
          </span>
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <Input
            label="Confirm with a current code to disable"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="max-w-xs"
          />
          <Button variant="danger" onClick={handleDisable} loading={action === 'disable'}>
            Disable 2FA
          </Button>
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Two-factor authentication" subtitle="Add an extra layer of security to your account.">
      <Button onClick={handleSetup} loading={action === 'setup'}>
        Set up two-factor authentication
      </Button>
    </SectionCard>
  );
};

const SessionsCard = () => {
  const { data, isLoading } = useGetSessionsQuery();
  const [revoke] = useRevokeSessionMutation();
  const sessions = data?.data?.sessions || [];

  const handleRevoke = async (id) => {
    try {
      await revoke(id).unwrap();
      toast.success('Session revoked');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not revoke session'));
    }
  };

  return (
    <SectionCard title="Active sessions" subtitle="Devices where you are currently signed in.">
      {isLoading ? (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      ) : sessions.length === 0 ? (
        <p className="rounded-2xl bg-white/60 p-4 text-sm text-slate-500">No active sessions.</p>
      ) : (
        <ul className="divide-y divide-slate-200">
          {sessions.map((s) => (
            <li key={s._id} className="flex items-center gap-3 py-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="3" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M9 21h6M12 17v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">
                  {s.device?.browser} · {s.device?.os}
                </p>
                <p className="text-xs text-slate-400">
                  {s.ip || 'Unknown IP'} · signed in {new Date(s.createdAt).toLocaleString()}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleRevoke(s._id)}>
                Revoke
              </Button>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
};

const ActivityCard = () => {
  const { data, isLoading } = useGetSecurityLogsQuery();
  const logs = data?.data?.logs || [];

  return (
    <SectionCard title="Security activity" subtitle="A record of sign-ins and security changes.">
      {isLoading ? (
        <div className="flex justify-center py-6">
          <Spinner />
        </div>
      ) : logs.length === 0 ? (
        <p className="rounded-2xl bg-white/60 p-4 text-sm text-slate-500">No security activity yet.</p>
      ) : (
        <ul className="space-y-3">
          {logs.map((log) => (
            <li key={log._id} className="flex items-start gap-3 text-sm">
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  log.success ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-700">{STATUS_LABELS[log.action] || log.action}</p>
                <p className="text-xs text-slate-400">
                  {log.device || 'Unknown device'}
                  {log.ip ? ` · ${log.ip}` : ''} · {new Date(log.createdAt).toLocaleString()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
};

const SecuritySettings = () => {
  return (
    <div className="mx-auto max-w-2xl px-6 pb-16">
      <AuroraBackground />
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Security</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage two-factor authentication, active sessions and security activity.
          </p>
        </div>
        <TwoFactorCard />
        <SessionsCard />
        <ActivityCard />
      </div>
    </div>
  );
};

export default SecuritySettings;