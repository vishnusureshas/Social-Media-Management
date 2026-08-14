import { useParams, Link } from 'react-router-dom';
import { useGetProfileQuery } from '../api/userApi';
import ProfileHeader from '../components/user/ProfileHeader';
import SuggestionsPanel from '../components/user/SuggestionsPanel';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { getApiErrorMessage } from '../utils/errorUtils';

const Profile = () => {
  const { username } = useParams();
  const { data, isLoading, isError, error, refetch } = useGetProfileQuery(username);

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="glass-strong mx-auto max-w-md rounded-3xl p-8 text-center animate-fade-up">
        <p className="text-sm text-rose-500">{getApiErrorMessage(error, 'Failed to load profile')}</p>
        <Button variant="secondary" size="sm" className="mt-4" onClick={refetch}>
          Retry
        </Button>
        <Link to="/" className="mt-3 block text-sm font-medium text-slate-500 hover:text-brand-600">
          Back to home
        </Link>
      </div>
    );
  }

  const user = data?.data?.user;

  return (
    <div className="mx-auto max-w-6xl px-6 pb-16">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProfileHeader user={user} />
        </div>
        <div className="space-y-6">
          <SuggestionsPanel limit={3} />
        </div>
      </div>
    </div>
  );
};

export default Profile;
