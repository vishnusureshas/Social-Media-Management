import { useGetSuggestionsQuery } from '../api/userApi';
import { UserCard } from '../components/user/UserCard';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';

const Suggestions = () => {
  const { data, isLoading, isError, error, refetch } = useGetSuggestionsQuery(20);
  const suggestions = data?.data?.suggestions || [];

  return (
    <div className="mx-auto max-w-3xl px-6 pb-16">
      <h1 className="font-display text-2xl font-bold text-slate-900">Who to follow</h1>
      <p className="mt-1 text-sm text-slate-500">
        Discover people you might like based on your network.
      </p>

      {isLoading ? (
        <div className="flex justify-center py-24">
          <Spinner size="lg" />
        </div>
      ) : isError ? (
        <div className="glass-strong mx-auto max-w-md rounded-3xl p-8 text-center animate-fade-up">
          <p className="text-sm text-rose-500">{error?.data?.message || 'Failed to load suggestions'}</p>
          <Button variant="secondary" size="sm" className="mt-4" onClick={refetch}>Retry</Button>
        </div>
      ) : suggestions.length === 0 ? (
        <p className="py-24 text-center text-sm text-slate-400">
          No suggestions right now — you're all caught up!
        </p>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {suggestions.map((s) => (
            <UserCard key={s._id} user={s} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Suggestions;
