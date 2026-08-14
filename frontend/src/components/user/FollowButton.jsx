import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  useFollowUserMutation,
  useUnfollowUserMutation,
} from '../../api/userApi';
import Button from '../ui/Button';

const FollowButton = ({ username, isFollowing, size = 'sm', className = '' }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [follow, { isLoading: followingLoading }] = useFollowUserMutation();
  const [unfollow, { isLoading: unfollowingLoading }] = useUnfollowUserMutation();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [prevIsFollowing, setPrevIsFollowing] = useState(isFollowing);
  const [following, setFollowing] = useState(isFollowing);
  if (prevIsFollowing !== isFollowing) {
    setPrevIsFollowing(isFollowing);
    setFollowing(isFollowing);
  }

  if (!isAuthenticated) {
    return (
      <Button variant="primary" size={size} className={className} onClick={() => navigate('/login')}>
        Follow
      </Button>
    );
  }

  const handleFollow = async () => {
    setFollowing(true);
    try {
      await follow(username).unwrap();
      toast.success(`Following @${username}`);
    } catch (err) {
      setFollowing(false);
      toast.error(err?.data?.message || 'Unable to follow.');
    }
  };

  const handleUnfollow = async () => {
    setConfirmOpen(false);
    setFollowing(false);
    try {
      await unfollow(username).unwrap();
      toast.success(`Unfollowed @${username}`);
    } catch (err) {
      setFollowing(true);
      toast.error(err?.data?.message || 'Unable to unfollow.');
    }
  };

  const isLoading = followingLoading || unfollowingLoading;

  if (following) {
    return (
      <div className="relative">
        <button
          type="button"
          disabled={isLoading}
          onClick={() => setConfirmOpen((v) => !v)}
          className={
            'group inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition-all duration-200 select-none ' +
            'hover:border-rose-300 hover:bg-rose-50 hover:text-rose-500 ' +
            (size === 'sm' ? '!px-4 !py-2 text-sm' : '') +
            (className ? ` ${className}` : '')
          }
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 6L9 17l-5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="normal-case group-hover:hidden">Following</span>
          <span className="hidden normal-case group-hover:inline">Unfollow</span>
        </button>

        {confirmOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={(e) => {
                e.stopPropagation();
                setConfirmOpen(false);
              }}
            />
            <div className="glass-strong absolute right-0 top-full z-50 mt-2 w-72 rounded-3xl p-5 shadow-2xl animate-fade-up">
              <p className="font-display text-sm font-bold text-slate-900">Unfollow @{username}?</p>
              <p className="mt-1 text-sm text-slate-500">
                Their posts will no longer appear in your feed.
              </p>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="secondary" className="flex-1" onClick={() => setConfirmOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="danger" className="flex-1" loading={isLoading} onClick={handleUnfollow}>
                  Unfollow
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <Button variant="primary" size={size} className={className} loading={isLoading} onClick={handleFollow}>
      Follow
    </Button>
  );
};

export default FollowButton;