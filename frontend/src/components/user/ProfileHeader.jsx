import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import FollowButton from './FollowButton';
import Button from '../ui/Button';
import ReportButton from '../report/ReportButton';
import { useCreateConversationMutation } from '../../api/chatApi';
import { getApiErrorMessage } from '../../utils/errorUtils';

const initial = (name) => (name || 'U')[0].toUpperCase();

const ProfileHeader = ({ user, loading = false }) => {
  const { user: me } = useAuth();
  const navigate = useNavigate();
  const [createConversation] = useCreateConversationMutation();
  if (loading || !user) return null;

  const isOwn = me && String(me._id) === String(user._id);

  const handleMessage = async () => {
    try {
      const res = await createConversation({ type: 'direct', participant: user._id }).unwrap();
      navigate(`/chat?conversation=${res?.data?.conversation?._id}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not open a conversation.'));
    }
  };

  return (
    <div className="glass-strong overflow-hidden rounded-3xl animate-fade-up">
      <div className="relative h-52 w-full overflow-hidden bg-gradient-to-r from-brand-500 via-violet-500 to-fuchsia-500">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        {user.coverPhoto ? (
          <img src={user.coverPhoto} alt="Cover" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full" />
        )}
        <div className="absolute -bottom-14 left-8">
          <span className="flex h-32 w-32 items-center justify-center rounded-3xl border-4 border-[#0a0e24] bg-gradient-to-br from-brand-500 to-fuchsia-500 text-5xl font-bold text-white shadow-glow">
            {user.avatar ? (
              <img src={user.avatar} alt="Avatar" className="h-full w-full rounded-3xl object-cover" />
            ) : (
              initial(user.username)
            )}
          </span>
        </div>
        {user.verified && (
          <span className="absolute right-6 top-6 flex items-center gap-1.5 rounded-full bg-[#0b0f26]/80 px-3 py-1 text-xs font-bold text-violet-300 backdrop-blur ring-1 ring-white/10">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.4 2.4 3.4-.4.4 3.4L20 10l-1.8 2.6.1 3.4-3.4.4L12 20l-2.9-1.6-3.4-.4.1-3.4L4 10l1.8-2.6.4-3.4 3.4.4L12 2z" />
            </svg>
            Verified
          </span>
        )}
      </div>

      <div className="px-8 pb-8 pt-20">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-3xl font-bold text-slate-900">
              {user.fullName || user.username}
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">@{user.username}</p>
            {user.bio && <p className="mt-3 max-w-lg text-sm text-slate-600">{user.bio}</p>}
            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-400">
              {user.location && (
                <span className="flex items-center gap-1.5">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <path d="M12 21c-4-3.5-8-6.8-8-11a4.5 4.5 0 019-1 4.5 4.5 0 019 1c0 4.2-4 7.5-8 11z" stroke="currentColor" strokeWidth="1.8" />
                  </svg>
                  {user.location}
                </span>
              )}
              {user.website && (
                <a
                  href={user.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-brand-600 hover:underline"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <path d="M12 3a9 9 0 109 9M8 8l3.5-3.5M13.5 13.5L10 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  {user.website}
                </a>
              )}
            </div>
          </div>
          <div className="flex shrink-0 gap-3">
            {isOwn ? (
              <Link to={`/u/${user.username}/edit`}>
                <Button variant="secondary" size="sm">
                  Edit profile
                </Button>
              </Link>
            ) : (
              <>
                <Button variant="secondary" size="sm" onClick={handleMessage}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Message
                </Button>
                <FollowButton username={user.username} isFollowing={user.isFollowing} size="sm" />
                <ReportButton targetType="user" targetId={user._id} className="self-center" />
              </>
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3">
          <Link
            to={`/u/${user.username}/followers`}
            className="glass flex flex-col items-center rounded-2xl px-6 py-4 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300"
          >
            <span className="font-display text-2xl font-bold text-gradient">{user.counts?.followers ?? 0}</span>
            <span className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">Followers</span>
          </Link>
          <Link
            to={`/u/${user.username}/following`}
            className="glass flex flex-col items-center rounded-2xl px-6 py-4 transition-all duration-300 hover:-translate-y-1 hover:border-brand-300"
          >
            <span className="font-display text-2xl font-bold text-gradient">{user.counts?.following ?? 0}</span>
            <span className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">Following</span>
          </Link>
          <div className="glass flex flex-col items-center rounded-2xl px-6 py-4">
            <span className="font-display text-2xl font-bold text-gradient">{user.counts?.posts ?? 0}</span>
            <span className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-500">Posts</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
