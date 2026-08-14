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
  const [follow, { isLoading: following }] = useFollowUserMutation();
  const [unfollow, { isLoading: unfollowing }] = useUnfollowUserMutation();

  if (!isAuthenticated) {
    return (
      <Button variant="primary" size={size} className={className} onClick={() => navigate('/login')}>
        Follow
      </Button>
    );
  }

  const handleClick = async () => {
    try {
      if (isFollowing) {
        await unfollow(username).unwrap();
        toast.success(`Unfollowed @${username}`);
      } else {
        await follow(username).unwrap();
        toast.success(`Following @${username}`);
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Action failed. Please try again.');
    }
  };

  return (
    <Button
      variant={isFollowing ? 'secondary' : 'primary'}
      size={size}
      className={className}
      loading={following || unfollowing}
      onClick={handleClick}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </Button>
  );
};

export default FollowButton;
