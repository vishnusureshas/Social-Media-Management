import { useState } from 'react';
import toast from 'react-hot-toast';
import { useVotePollMutation } from '../../api/pollApi';
import cn from '../../utils/cn';
import { formatTimeAgo } from '../../utils/postUtils';

const PollCard = ({ poll, postId }) => {
  const [votePoll, { isLoading }] = useVotePollMutation();
  const [pollState, setPollState] = useState(poll);
  const [pending, setPending] = useState(null);

  if (!poll) return null;

  const hasVoted = pollState?.hasVoted;
  const isExpired = pollState?.isExpired;
  const totalVotes = pollState?.totalVotes || 0;
  const options = pollState?.options || [];
  const showResults = hasVoted || isExpired;

  const percent = (count) => (totalVotes ? Math.round((count / totalVotes) * 100) : 0);

  const handleVote = async (optionId) => {
    if (hasVoted || isExpired) return;
    setPending(optionId);
    const prev = pollState;

    setPollState({
      ...pollState,
      totalVotes: totalVotes + 1,
      hasVoted: true,
      options: options.map((o) => (o.id === optionId ? { ...o, votes: o.votes + 1 } : o)),
    });

    try {
      await votePoll({ id: pollState.id, optionId, postId }).unwrap();
    } catch (err) {
      setPollState(prev);
      toast.error(err?.data?.message || 'Unable to vote.');
    }
    setPending(null);
  };

  const timeLabel =
    isExpired && pollState.expiresAt ? 'Ended' : pollState.expiresAt ? `Ends ${formatTimeAgo(pollState.expiresAt)}` : null;

  return (
    <div className="mt-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
      <p className="font-display text-sm font-bold text-slate-900">{pollState.question}</p>

      <div className="mt-3 space-y-2">
        {options.map((option) => {
          const isSelected = pollState.myOptionId && String(pollState.myOptionId) === String(option.id);
          const pct = percent(option.votes);
          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={showResults || isLoading || pending === option.id}
              className={cn(
                'relative block w-full overflow-hidden rounded-xl border px-3 py-2 text-left text-sm font-medium transition-colors',
                showResults
                  ? cn(isSelected ? 'border-brand-500 bg-brand-50' : 'border-slate-100 bg-white')
                  : 'border-slate-200 bg-white hover:border-brand-400'
              )}
            >
              {showResults && (
                <span
                  className="absolute inset-y-0 left-0 bg-brand-100"
                  style={{ width: `${pct}%` }}
                />
              )}
              <span className="relative flex items-center justify-between gap-2">
                <span className="truncate text-slate-800">{option.text}</span>
                <span className="shrink-0 text-xs font-semibold text-slate-500">
                  {showResults ? `${pct}%` : ''}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs font-medium text-slate-400">
        <span>{totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</span>
        {timeLabel && <span>{timeLabel}</span>}
      </div>
    </div>
  );
};

export default PollCard;