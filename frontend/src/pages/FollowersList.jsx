import { useParams } from 'react-router-dom';
import FollowsList from './FollowsList';

const FollowersList = () => {
  const { username } = useParams();
  return <FollowsList tab="followers" username={username} />;
};

export default FollowersList;
