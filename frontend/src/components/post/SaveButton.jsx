import { useState } from 'react';
import toast from 'react-hot-toast';
import { useSavePostMutation } from '../../api/postApi';

const SaveButton = ({ post }) => {
  const [savePost, { isLoading }] = useSavePostMutation();
  const [saved, setSaved] = useState(!!post?.isSaved);

  const handleClick = async () => {
    const next = !saved;
    setSaved(next);
    try {
      await savePost(post._id).unwrap();
      if (next) {
        toast.success('Post saved.');
      }
    } catch {
      setSaved(!next);
      toast.error('Unable to update save.');
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-amber-50 hover:text-amber-500"
    >
      <svg
        viewBox="0 0 24 24"
        fill={saved ? 'currentColor' : 'none'}
        className="h-5 w-5"
        style={{ color: saved ? '#f59e0b' : undefined }}
      >
        <path
          d="M6 3h12a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

export default SaveButton;