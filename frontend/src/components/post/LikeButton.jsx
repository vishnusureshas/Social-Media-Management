import { useState } from 'react';
import toast from 'react-hot-toast';
import { useLikePostMutation } from '../../api/postApi';
import cn from '../../utils/cn';

const LikeButton = ({ post }) => {
  const [likePost, { isLoading }] = useLikePostMutation();
  const [liked, setLiked] = useState(!!post?.isLiked);
  const [count, setCount] = useState(post?.likesCount || 0);

  const handleClick = async () => {
    const next = !liked;
    const prevCount = count;
    setLiked(next);
    setCount((c) => c + (next ? 1 : -1));
    try {
      await likePost(post._id).unwrap();
    } catch {
      setLiked(!next);
      setCount(prevCount);
      toast.error('Unable to update like.');
    }
  };

  const base = 'inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors';
  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        base,
        liked ? 'text-rose-400 hover:bg-rose-500/10' : 'text-slate-400 hover:bg-rose-500/10 hover:text-rose-400'
      )}
    >
      <svg viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} className="h-5 w-5">
        <path
          d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
      {count}
    </button>
  );
};

export default LikeButton;