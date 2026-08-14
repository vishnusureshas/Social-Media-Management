import { useState } from 'react';
import toast from 'react-hot-toast';
import { useReactMutation } from '../../api/reactionApi';
import cn from '../../utils/cn';

const EMOJIS = [
  { emoji: 'like', icon: '👍' },
  { emoji: 'love', icon: '❤️' },
  { emoji: 'haha', icon: '😆' },
  { emoji: 'wow', icon: '😮' },
];

const EMOJI_ICON = Object.fromEntries(EMOJIS.map((e) => [e.emoji, e.icon]));

const CommentReaction = ({ comment, postId }) => {
  const [react] = useReactMutation();
  const [myEmoji, setMyEmoji] = useState(null);
  const [open, setOpen] = useState(false);

  if (!comment) return null;

  const handleEmoji = async (emoji) => {
    const prev = myEmoji;
    const next = prev === emoji ? null : emoji;
    setMyEmoji(next);
    setOpen(false);
    try {
      await react({ targetType: 'comment', targetId: comment._id, postId, emoji }).unwrap();
    } catch {
      setMyEmoji(prev);
      toast.error('Unable to update reaction.');
    }
  };

  return (
    <div className="relative mt-1 inline-block">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'inline-flex items-center gap-1 text-xs font-semibold transition-colors',
          myEmoji ? 'text-brand-600' : 'text-slate-400 hover:text-brand-600'
        )}
      >
        {myEmoji ? EMOJI_ICON[myEmoji] : '🙂'}
        <span>{myEmoji ? 'Reacted' : 'React'}</span>
      </button>

      {open && (
        <div className="absolute bottom-full left-0 z-20 mb-2 flex items-center gap-1 rounded-2xl border border-slate-100 bg-white px-2 py-2 shadow-xl animate-fade-up">
          {EMOJIS.map(({ emoji, icon }) => (
            <button
              key={emoji}
              onClick={() => handleEmoji(emoji)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-xl transition-transform hover:scale-125"
            >
              {icon}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentReaction;