import { useState } from 'react';
import toast from 'react-hot-toast';
import { useReactMutation } from '../../api/reactionApi';
import cn from '../../utils/cn';

const EMOJIS = [
  { emoji: 'like', icon: '👍' },
  { emoji: 'love', icon: '❤️' },
  { emoji: 'haha', icon: '😆' },
  { emoji: 'wow', icon: '😮' },
  { emoji: 'sad', icon: '😢' },
  { emoji: 'angry', icon: '😡' },
];

const EMOJI_ICON = Object.fromEntries(EMOJIS.map((e) => [e.emoji, e.icon]));

const ReactionBar = ({ post, targetType = 'post', postId }) => {
  const [react] = useReactMutation();
  const base = post?.reactions || { total: 0, summary: [], myReaction: null };
  const [reactions, setReactions] = useState(base);
  const [active, setActive] = useState(false);

  if (!post) return null;

  const handleEmoji = async (emoji) => {
    const prev = reactions;
    const my = prev.myReaction;
    const delta = my === emoji ? -1 : my ? 0 : 1;
    const myNew = my === emoji ? null : emoji;

    setReactions({
      ...prev,
      total: reactorTotal(prev.total, delta),
      summary: prev.summary.map((s) =>
        s.emoji === emoji ? { ...s, count: my === emoji ? Math.max(0, s.count - 1) : s.count + 1 } : s.emoji === my ? { ...s, count: Math.max(0, s.count - 1) } : s
      ),
      myReaction: myNew,
    });

    try {
      await react({
        targetType,
        targetId: post._id,
        postId: postId || post._id,
        emoji,
      }).unwrap();
    } catch {
      setReactions(prev);
      toast.error('Unable to update reaction.');
    }
    setActive(false);
  };

  const total = reactions.total || 0;

  return (
    <div className="relative">
      <button
        onClick={() => setActive((a) => !a)}
        className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-brand-50 hover:text-brand-600"
      >
        {total > 0 ? (
          <>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-xs">
              {EMOJI_ICON[reactions.myReaction] || '👍'}
            </span>
            {total}
          </>
        ) : (
          <>
            <span className="text-base leading-none">🙂</span>
            React
          </>
        )}
      </button>

      {active && (
        <div className="absolute bottom-full left-0 z-20 mb-2 flex items-center gap-1 rounded-2xl border border-slate-100 bg-white px-2 py-2 shadow-xl animate-fade-up">
          {EMOJIS.map(({ emoji, icon }) => (
            <button
              key={emoji}
              onClick={() => handleEmoji(emoji)}
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl text-2xl transition-transform hover:scale-125',
                reactions.myReaction === emoji && 'bg-brand-50'
              )}
            >
              {icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const reactorTotal = (total, delta) => Math.max(0, total + delta);

export default ReactionBar;