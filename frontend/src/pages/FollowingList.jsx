import { useParams } from 'react-router-dom';
import FollowsList from './FollowsList';

const FollowingList = () => {
  const { username } = useParams();
  return <FollowsList tab="following" username={username} />;
};

export default FollowingList;
