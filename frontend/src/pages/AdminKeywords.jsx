import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  useGetModerationKeywordsQuery,
  useCreateKeywordMutation,
  useDeleteKeywordMutation,
} from '../api/reportApi';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/ui/Spinner';
import AuroraBackground from '../components/ui/AuroraBackground';
import { getApiErrorMessage } from '../utils/errorUtils';

const AdminKeywords = () => {
  const { user } = useAuth();
  const [keyword, setKeyword] = useState('');
  const [matchType, setMatchType] = useState('includes');
  const { data, isLoading } = useGetModerationKeywordsQuery();
  const [createKeyword, { isLoading: creating }] = useCreateKeywordMutation();
  const [deleteKeyword, { isLoading: deleting }] = useDeleteKeywordMutation();

  if (!['admin', 'superadmin'].includes(user?.role)) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="font-display text-lg font-semibold text-slate-700">
          You don't have access to moderation settings.
        </p>
      </div>
    );
  }

  const keywords = data?.data?.keywords || [];

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!keyword.trim()) {
      toast.error('Enter a keyword.');
      return;
    }
    try {
      await createKeyword({ keyword: keyword.trim(), matchType }).unwrap();
      toast.success('Keyword added.');
      setKeyword('');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not add keyword.'));
    }
  };

  const handleDelete = async (k) => {
    if (!window.confirm(`Remove "${k.keyword}" from the moderation list?`)) return;
    try {
      await deleteKeyword(k._id).unwrap();
      toast.success('Keyword removed.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not remove keyword.'));
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 pb-16">
      <AuroraBackground />
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Auto-moderation keywords</h1>
          <p className="mt-1 text-sm text-slate-500">
            Content matching these words is flagged automatically for review.
          </p>
        </div>

        <form onSubmit={handleAdd} className="glass-strong rounded-3xl p-6 animate-fade-up">
          <h2 className="font-display text-base font-bold text-slate-900">Add a keyword</h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g. scammed"
              className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
            <select
              value={matchType}
              onChange={(e) => setMatchType(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none transition-colors focus:border-brand-400"
            >
              <option value="includes">Contains</option>
              <option value="exact">Exact word</option>
            </select>
            <button
              type="submit"
              disabled={creating}
              className="btn-gradient rounded-xl px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {creating ? 'Adding…' : 'Add'}
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            "Contains" matches the word anywhere in the text; "Exact word" matches whole words only.
          </p>
        </form>

        <div>
          <h2 className="mb-3 font-display text-base font-bold text-slate-900">
            Active keywords ({keywords.length})
          </h2>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner />
            </div>
          ) : keywords.length === 0 ? (
            <p className="rounded-2xl bg-white/60 p-6 text-center text-sm text-slate-500">
              No keywords yet. Add one above to start auto-flagging content.
            </p>
          ) : (
            <ul className="space-y-2">
              {keywords.map((k) => (
                <li
                  key={k._id}
                  className="glass-strong flex items-center gap-3 rounded-2xl px-4 py-3"
                >
                  <span className="min-w-0 flex-1 truncate font-mono text-sm font-bold text-slate-800">
                    {k.keyword}
                  </span>
                  <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-[11px] font-bold capitalize text-brand-600">
                    {k.matchType}
                  </span>
                  <button
                    onClick={() => handleDelete(k)}
                    disabled={deleting}
                    className="rounded-xl px-2.5 py-1 text-xs font-bold text-rose-500 transition-colors hover:bg-rose-50"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminKeywords;