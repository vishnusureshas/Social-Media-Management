import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSearchUsersQuery } from '../api/userApi';
import { UserCard } from '../components/user/UserCard';
import SuggestionsPanel from '../components/user/SuggestionsPanel';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import useDebounce from '../hooks/useDebounce';

const SearchIcon = () => (
  <svg className="h-5 w-5 text-slate-400" viewBox="0 0 24 24" fill="none">
    <path d="M21 21l-4.3-4.3M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const Search = () => {
  const [params, setParams] = useSearchParams();
  const [input, setInput] = useState(params.get('q') || '');
  const q = useDebounce(input.trim(), 300);
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching, isError, error } = useSearchUsersQuery(
    { q, page, limit: 10 },
    { skip: q.length === 0 }
  );

  const users = data?.data?.users || [];
  const totalPages = data?.pagination?.pages || 1;

  const handleChange = (value) => {
    setInput(value);
    setPage(1);
    if (value.trim()) {
      setParams({ q: value.trim() }, { replace: true });
    } else {
      setParams({}, { replace: true });
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 pb-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-2xl font-bold text-slate-900">Search people</h1>

        <div className="relative mt-4">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={input}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Search by username or name..."
            className="input-base pl-12"
            autoFocus
          />
        </div>

        {q.length === 0 ? (
          <div className="mt-8">
            <SuggestionsPanel limit={5} title="Suggested for you" />
          </div>
        ) : isError ? (
          <p className="py-16 text-center text-sm text-rose-500">
            {error?.data?.message || 'Search failed. Please try again.'}
          </p>
        ) : (
          <div className="mt-8">
            {isLoading || isFetching ? (
              <div className="flex justify-center py-20">
                <Spinner size="lg" />
              </div>
            ) : users.length === 0 ? (
              <p className="py-20 text-center text-sm text-slate-400">
                No users found for "{q}".
              </p>
            ) : (
              <>
                <div className="space-y-3">
                  {users.map((u) => (
                    <UserCard key={u._id} user={u} />
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <span className="text-sm font-medium text-slate-500">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
