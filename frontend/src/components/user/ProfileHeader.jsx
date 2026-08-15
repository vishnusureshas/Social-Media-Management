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

  const meta = [];
  if (user.location) {
    meta.push({
      key: 'location',
      icon: <path d="M12 21c-4-3.5-8-6.8-8-11a4.5 4.5 0 019-1 4.5 4.5 0 019 1c0 4.2-4 7.5-8 11z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />,
      node: <span className="flex items-center gap-1.5 text-slate-500">{user.location}</span>,
    });
  }
  if (user.website) {
    meta.push({
      key: 'website',
      icon: <path d="M12 3a9 9 0 109 9M8 8l3.5-3.5M13.5 13.5L10 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />,
      node: (
        <a
          href={user.website}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-violet-400 hover:underline"
        >
          {user.website}
        </a>
      ),
    });
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/[0.09] bg-white/[0.04] backdrop-blur-xl animate-fade-up">
      <div className="relative h-48 w-full overflow-hidden bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500">
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
        <div className="absolute -bottom-12 left-6 sm:left-8">
          <span className="flex h-28 w-28 items-center justify-center rounded-3xl border-4 border-[#0a0e24] bg-gradient-to-br from-violet-500 to-fuchsia-500 text-4xl font-bold text-white shadow-glow sm:h-32 sm:w-32 sm:text-5xl">
            {user.avatar ? (
              <img src={user.avatar} alt="Avatar" className="h-full w-full rounded-3xl object-cover" />
            ) : (
              initial(user.username)
            )}
          </span>
        </div>
        {user.verified && (
          <span className="absolute right-5 top-5 flex items-center gap-1.5 rounded-full bg-[#0b0f26]/70 px-3 py-1 text-xs font-bold text-violet-300 backdrop-blur ring-1 ring-white/15">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.4 2.4 3.4-.4.4 3.4L20 10l-1.8 2.6.1 3.4-3.4.4L12 20l-2.9-1.6-3.4-.4.1-3.4L4 10l1.8-2.6.4-3.4 3.4.4L12 2z" />
            </svg>
            Verified
          </span>
        )}
      </div>

      <div className="px-6 pb-6 pt-16 sm:px-8 sm:pb-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="min-w-0">
            <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-white sm:text-3xl">
              {user.fullName || user.username}
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">@{user.username}</p>
            {user.bio && <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300">{user.bio}</p>}
            {meta.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium">
                {meta.map((m) => (
                  <span key={m.key} className="flex items-center gap-1.5 text-slate-500">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">{m.icon}</svg>
                    {m.node}
                  </span>
                ))}
              </div>
            )}
            {user.followsYou && (
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-fuchsia-500/15 px-3 py-1 text-[11px] font-bold text-fuchsia-300 ring-1 ring-fuchsia-400/30">
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM19 8v6M22 11h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Follows you
              </span>
            )}
          </div>
          <div className="flex shrink-0 flex-wrap gap-2.5">
            {isOwn ? (
              <>
                <Link to={`/u/${user.username}/edit`}>
                  <Button variant="secondary" size="sm">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Edit profile
                  </Button>
                </Link>
                <Link to="/account">
                  <Button variant="ghost" size="sm">
                    Settings
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Button variant="secondary" size="sm" onClick={handleMessage}>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Message
                </Button>
                <FollowButton username={user.username} isFollowing={user.isFollowing} size="sm" />
                <ReportButton targetType="user" targetId={user._id} />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;