import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useGetMeQuery, useRefreshMutation } from '../api/authApi';
import AuroraBackground from '../components/ui/AuroraBackground';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import toast from 'react-hot-toast';

const initial = (name) => (name || 'U')[0].toUpperCase();

const Stat = ({ label, value }) => (
  <div className="glass flex flex-col items-center rounded-2xl px-6 py-4 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300">
    <span className="font-display text-2xl font-bold text-gradient">{value}</span>
    <span className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">{label}</span>
  </div>
);

const Account = () => {
  const { accessToken, refreshToken, user } = useAuth();
  const { data, isLoading, isError, error, refetch } = useGetMeQuery(undefined, { skip: !accessToken });
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

  return (
    <div className="mx-auto max-w-4xl px-6 pb-16">
      <AuroraBackground />

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <div className="glass-strong mx-auto max-w-md rounded-3xl p-8 text-center animate-fade-up">
          <p className="text-sm text-rose-500">{error?.data?.message || 'Failed to load profile'}</p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={refetch}>
            Retry
          </Button>
        </div>
      ) : profile ? (
        <div className="space-y-6">
          <div className="glass-strong overflow-hidden rounded-3xl animate-fade-up">
            <div className="relative h-48 w-full overflow-hidden bg-gradient-to-r from-brand-500 via-violet-500 to-fuchsia-500">
              <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
              {profile.coverPhoto ? (
                <img src={profile.coverPhoto} alt="Cover" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full" />
              )}
              <div className="absolute -bottom-12 left-8">
                <div className="flex h-28 w-28 items-center justify-center rounded-3xl border-4 border-white bg-gradient-to-br from-brand-500 to-fuchsia-500 text-4xl font-bold text-white shadow-glow">
                  {profile.avatar ? <img src={profile.avatar} alt="Avatar" className="h-full w-full rounded-3xl object-cover" /> : initial(profile.username)}
                </div>
              </div>
              <span className="absolute right-6 top-6 flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-bold backdrop-blur">
                {profile.verified ? (
                  <>
                    <svg className="h-4 w-4 text-brand-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 2.4 3.4-.4.4 3.4L20 10l-1.8 2.6.1 3.4-3.4.4L12 20l-2.9-1.6-3.4-.4.1-3.4L4 10l1.8-2.6.4-3.4 3.4.4L12 2z" />✓</svg>
                    Verified
                  </>
                ) : (
                  <span className="text-slate-600">{profile.role === 'admin' ? 'Admin' : 'Member'}</span>
                )}
              </span>
            </div>

            <div className="px-8 pb-8 pt-16">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <h1 className="font-display text-3xl font-bold text-slate-900">{profile.fullName || profile.username}</h1>
                  <p className="mt-1 text-sm font-medium text-slate-500">@{profile.username}</p>
                  {profile.bio && <p className="mt-3 max-w-lg text-sm text-slate-600">{profile.bio}</p>}
                  {profile.location && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none"><path d="M12 21c-4-3.5-8-6.8-8-11a4.5 4.5 0 019-1 4.5 4.5 0 019 1c0 4.2-4 7.5-8 11z" stroke="currentColor" strokeWidth="1.8"/></svg>
                      {profile.location}
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <Link to={`/u/${profile.username}`}>
                    <Button variant="outline" size="sm">View public profile</Button>
                  </Link>
                  <Link to="/change-password">
                    <Button variant="secondary" size="sm">Change password</Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleRefreshSession}>
                    Refresh session
                  </Button>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-3">
                <Stat label="Posts" value={profile.counts?.posts ?? 0} />
                <Stat label="Followers" value={profile.counts?.followers ?? 0} />
                <Stat label="Following" value={profile.counts?.following ?? 0} />
              </div>
            </div>
          </div>

          <div className="glass-strong rounded-3xl p-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
            <h2 className="font-display text-lg font-bold text-slate-900">Account details</h2>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div className="rounded-2xl bg-white/70 p-4">
                <dt className="text-xs uppercase tracking-wide text-slate-400">Email</dt>
                <dd className="mt-1 font-medium text-slate-700">{profile.email}</dd>
              </div>
              <div className="rounded-2xl bg-white/70 p-4">
                <dt className="text-xs uppercase tracking-wide text-slate-400">Member since</dt>
                <dd className="mt-1 font-medium text-slate-700">
                  {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}
                </dd>
              </div>
              <div className="rounded-2xl bg-white/70 p-4">
                <dt className="text-xs uppercase tracking-wide text-slate-400">Post visibility</dt>
                <dd className="mt-1 font-medium capitalize text-slate-700">{profile.privacy?.postsVisibleTo || 'public'}</dd>
              </div>
              <div className="rounded-2xl bg-white/70 p-4">
                <dt className="text-xs uppercase tracking-wide text-slate-400">Messaging</dt>
                <dd className="mt-1 font-medium capitalize text-slate-700">{profile.privacy?.messages || 'everyone'}</dd>
              </div>
            </dl>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Account;