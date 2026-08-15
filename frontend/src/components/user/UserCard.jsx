import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import FollowButton from './FollowButton';

const Avatar = ({ user, size = 'md' }) => {
  const sizes = { sm: 'h-10 w-10', md: 'h-14 w-14', lg: 'h-20 w-20' };
  const initial = (user?.username || 'U')[0].toUpperCase();
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 via-violet-500 to-fuchsia-500 font-bold text-white shadow-glow ${sizes[size]}`}
    >
      {user?.avatar ? (
        <img src={user.avatar} alt={user.username} className="h-full w-full rounded-2xl object-cover" />
      ) : (
        <span className={size === 'lg' ? 'text-2xl' : 'text-sm'}>{initial}</span>
      )}
    </span>
  );
};

const UserCard = ({ user, size = 'md', showBio = true, className = '' }) => {
  const { user: me } = useAuth();
  const isOwn = user && me && String(user._id) === String(me._id);

  return (
    <div
      className={`glass dash-hover flex items-center gap-4 rounded-3xl p-4 ${className}`}
    >
      <Link to={`/u/${user.username}`}>
        <Avatar user={user} size={size} />
      </Link>
      <div className="min-w-0 flex-1">
        <Link to={`/u/${user.username}`} className="group block">
          <p className="flex items-center gap-1.5 truncate font-display font-bold text-slate-100 group-hover:text-violet-200">
            {user.fullName || user.username}
            {user.verified && (
              <svg className="h-4 w-4 shrink-0 text-violet-400" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l2.4 2.4 3.4-.4.4 3.4L20 10l-1.8 2.6.1 3.4-3.4.4L12 20l-2.9-1.6-3.4-.4.1-3.4L4 10l1.8-2.6.4-3.4 3.4.4L12 2z" />
              </svg>
            )}
          </p>
          <p className="truncate text-sm font-medium text-slate-500">@{user.username}</p>
          {showBio && user.bio && (
            <p className="mt-1 truncate text-sm text-slate-400">{user.bio}</p>
          )}
          {(user.counts?.followers !== undefined || user.counts?.following !== undefined) && (
            <p className="mt-1 text-xs font-medium text-slate-500">
              {user.counts?.followers ?? 0} followers · {user.counts?.following ?? 0} following
            </p>
          )}
        </Link>
      </div>
      {!isOwn && user && (
        <FollowButton
          username={user.username}
          isFollowing={user.isFollowing}
          size="sm"
        />
      )}
    </div>
  );
};

export { UserCard, Avatar };
export default UserCard;
