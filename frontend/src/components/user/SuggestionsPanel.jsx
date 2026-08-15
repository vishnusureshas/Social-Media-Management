import { useGetSuggestionsQuery } from '../../api/userApi';
import { UserCard } from './UserCard';
import Spinner from '../ui/Spinner';

const SuggestionsPanel = ({ limit = 3, title = 'Who to follow' }) => {
  const { data, isLoading } = useGetSuggestionsQuery(limit);
  const suggestions = data?.data?.suggestions || [];

  return (
    <div className="glass-strong rounded-3xl p-5 animate-fade-up">
      <h2 className="font-display text-lg font-bold text-slate-100">{title}</h2>
      <p className="mt-1 text-xs text-slate-500">Follow creators you might like</p>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner size="md" />
        </div>
      ) : suggestions.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">
          No suggestions right now — you're all caught up!
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {suggestions.map((s) => (
            <UserCard key={s._id} user={s} size="sm" showBio={false} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SuggestionsPanel;
