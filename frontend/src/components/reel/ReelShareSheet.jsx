import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { useGetFollowingQuery } from '../../api/userApi';
import { useShareReelMutation } from '../../api/reelApi';
import { Avatar } from '../user/UserCard';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import cn from '../../utils/cn';

const ReelShareSheet = ({ reel, onClose }) => {
  const { user: me } = useAuth();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(() => new Set());
  const [shareReel, { isLoading }] = useShareReelMutation();

  const { data, isLoading: loadingContacts, isFetching } = useGetFollowingQuery(
    { username: me?.username, page: 1, limit: 50 },
    { skip: !me?.username }
  );

  const contacts = useMemo(() => data?.data?.following || [], [data]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return contacts;
    return contacts.filter(
      (c) =>
        c?.username?.toLowerCase().includes(q) ||
        c?.fullName?.toLowerCase().includes(q)
    );
  }, [contacts, query]);

  const toggle = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(String(id))) next.delete(String(id));
      else next.add(String(id));
      return next;
    });
  };

  const submit = async () => {
    if (selected.size === 0) return;
    const recipients = [...selected];
    try {
      await shareReel({ id: reel?._id, recipients }).unwrap();
      toast.success(
        recipients.length === 1
          ? 'Reel sent to your contact.'
          : `Reel sent to ${recipients.length} contacts.`
      );
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || 'Unable to share reel.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center bg-slate-950/70 backdrop-blur-sm sm:p-4"
      onClick={onClose}
    >
      <div
        className="flex h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:h-[75vh] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex items-center justify-between">
            <p className="font-display text-lg font-bold text-slate-900">Send reel to</p>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600 hover:bg-slate-200"
            >
              ✕
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-2xl bg-slate-100 px-3 py-2">
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 text-slate-400">
              <path d="M21 21l-4.3-4.3M11 19a8 8 0 100-16 8 8 0 000 16z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search contacts…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2">
          {loadingContacts ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-16 text-center text-sm text-slate-400">
              {query ? 'No contacts match your search.' : 'Follow people to send them reels.'}
            </p>
          ) : (
            <div className="space-y-1">
              {filtered.map((c) => {
                const isChecked = selected.has(String(c._id));
                return (
                  <button
                    key={c._id}
                    onClick={() => toggle(c._id)}
                    className="flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-left transition-colors hover:bg-slate-50"
                  >
                    <Avatar user={c} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-slate-900">
                        {c.fullName || c.username}
                      </span>
                      <span className="block truncate text-xs text-slate-500">@{c.username}</span>
                    </span>
                    <span
                      className={cn(
                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-[10px] font-bold text-white transition-all',
                        isChecked ? 'border-brand-500 bg-brand-500' : 'border-slate-300 bg-white'
                      )}
                    >
                      {isChecked ? '✓' : ''}
                    </span>
                  </button>
                );
              })}
              {isFetching && (
                <p className="px-2 py-2 text-center text-xs text-slate-400">Loading more…</p>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 p-4">
          <Button
            onClick={submit}
            loading={isLoading}
            disabled={selected.size === 0}
            className="w-full"
          >
            {selected.size > 0 ? `Send to ${selected.size} ${selected.size === 1 ? 'contact' : 'contacts'}` : 'Select contacts to send'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReelShareSheet;