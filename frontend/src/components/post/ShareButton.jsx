import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useSharePostMutation } from '../../api/postApi';

const ShareButton = ({ post, onShared }) => {
  const [sharePost, { isLoading }] = useSharePostMutation();
  const navigate = useNavigate();
  const [count, setCount] = useState(post?.sharesCount || 0);

  const handleShare = async () => {
    try {
      const res = await sharePost({ id: post._id, content: '' }).unwrap();
      setCount((c) => c + 1);
      if (onShared) onShared(res?.data?.post);
      toast.success('Post shared to your feed.');
      navigate('/feed');
    } catch (err) {
      toast.error(err?.data?.message || 'Unable to share post.');
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={isLoading}
      className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-400 transition-colors hover:bg-emerald-500/10 hover:text-emerald-400"
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M8.59 13.51l6.83 3.98M8.59 10.49l6.83-3.98M4.5 16a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM19.5 8a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM19.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
      {count}
    </button>
  );
};

export default ShareButton;