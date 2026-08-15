import { useAuth } from '../hooks/useAuth';
import { useGetMeQuery, useRefreshMutation } from '../api/authApi';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import SettingsNav from '../components/settings/SettingsNav';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const initial = (name) => (name || 'U')[0].toUpperCase();

const DetailRow = ({ label, value, mono = false }) => (
  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
    <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</dt>
    <dd className={`mt-1 truncate text-sm font-medium text-slate-100 ${mono ? 'font-mono text-[13px]' : ''}`}>
      {value || '—'}
    </dd>
  </div>
);

const Account = () => {
  const { accessToken, refreshToken, user } = useAuth();
  const { data, isLoading, isError } = useGetMeQuery(undefined, { skip: !accessToken });
  const [refresh] = useRefreshMutation();

  const profile = data?.data?.user || user;

  const handleRefreshSession = async () => {
    try {
      await refresh(refreshToken).unwrap();
      toast.success('Session refreshed');
    } catch {
      toast.error('Session refresh failed');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-3xl border border-white/[0.1] bg-white/[0.04] p-10 text-center backdrop-blur-xl">
        <p className="text-sm text-rose-400">Failed to load your profile.</p>
        <Button variant="secondary" size="sm" className="mt-4" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  const role = profile?.role || 'user';

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 lg:flex-row">
      <aside className="flex-none lg:w-60">
        <div className="sticky top-[5.5rem] rounded-3xl border border-white/[0.09] bg-white/[0.04] p-4 backdrop-blur-xl">
          <div className="flex items-center gap-3 border-b border-white/[0.07] px-2 pb-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-lg font-bold text-white">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="h-full w-full rounded-2xl object-cover" />
              ) : (
                initial(profile.username)
              )}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">{profile.fullName || profile.username}</p>
              <p className="capitalize text-xs font-semibold text-violet-300">
                {role === 'superadmin' ? 'Super Admin' : role}
              </p>
            </div>
          </div>
          <SettingsNav />
        </div>
      </aside>

      <main className="min-w-0 flex-1 space-y-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Settings</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your account, security, privacy and preferences.
          </p>
        </div>

        <div className="rounded-3xl border border-white/[0.09] bg-white/[0.04] p-6 backdrop-blur-xl">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-lg font-bold text-white">Profile overview</h2>
              <p className="mt-0.5 text-sm text-slate-500">@{profile.username}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to={`/u/${profile.username}`}>
                <Button variant="outline" size="sm">View public profile</Button>
              </Link>
              <Link to="/account/edit">
                <Button variant="secondary" size="sm">Edit profile</Button>
              </Link>
            </div>
          </div>

          {profile.bio && <p className="mt-4 text-sm leading-relaxed text-slate-300">{profile.bio}</p>}

          <div className="mt-5 grid grid-cols-3 gap-3">
            {[
              { k: 'Posts', v: profile.counts?.posts ?? 0 },
              { k: 'Followers', v: profile.counts?.followers ?? 0 },
              { k: 'Following', v: profile.counts?.following ?? 0 },
            ].map((s) => (
              <div key={s.k} className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-3 py-3 text-center">
                <p className="font-display text-xl font-bold text-white">{s.v}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{s.k}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/[0.09] bg-white/[0.04] p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-white">Account details</h2>
            <Button variant="ghost" size="sm" onClick={handleRefreshSession}>
              Refresh session
            </Button>
          </div>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <DetailRow label="Email" value={profile.email} mono />
            <DetailRow
              label="Member since"
              value={profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}
            />
            <DetailRow label="Post visibility" value={profile.privacy?.postsVisibleTo || 'public'} />
            <DetailRow label="Messaging" value={profile.privacy?.messages || 'everyone'} />
            <DetailRow label="Location" value={profile.location} />
            <DetailRow label="Website" value={profile.website} mono />
          </dl>
        </div>
      </main>
    </div>
  );
};

export default Account;