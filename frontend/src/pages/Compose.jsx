import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCreatePostMutation } from '../api/postApi';
import { useAuth } from '../hooks/useAuth';
import { Avatar } from '../components/user/UserCard';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

const MAX_MEDIA = 4;
const MAX_TEXT = 10000;

const Compose = () => {
  const { user: me } = useAuth();
  const navigate = useNavigate();
  const [createPost, { isLoading }] = useCreatePostMutation();

  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [location, setLocation] = useState('');
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const fileRef = useRef(null);

  const onSelectFiles = (e) => {
    const selected = Array.from(e.target.files || []);
    const remaining = MAX_MEDIA - files.length;
    const taken = selected.slice(0, remaining);
    if (taken.length < selected.length) toast.error(`You can attach up to ${MAX_MEDIA} media items.`);
    const newFiles = [...files, ...taken];
    setFiles(newFiles);
    setPreviews(newFiles.map((f) => URL.createObjectURL(f)));
  };

  const removeFile = (index) => {
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && files.length === 0) {
      toast.error('Write something or attach media first.');
      return;
    }

    const formData = new FormData();
    formData.append('content', content.trim());
    formData.append('visibility', visibility);
    if (location.trim()) formData.append('location', location.trim());
    files.forEach((f) => formData.append('media', f));

    try {
      const res = await createPost(formData).unwrap();
      toast.success('Post published!');
      navigate(`/post/${res?.data?.post?._id}`);
    } catch (err) {
      toast.error(err?.data?.message || 'Unable to publish post.');
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-slate-900">Create a post</h1>

      <form onSubmit={handleSubmit} className="glass-strong mt-6 rounded-3xl p-5">
        <div className="flex gap-3">
          <Avatar user={me} size="sm" />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={MAX_TEXT}
            placeholder="What's on your mind?"
            rows={6}
            className="flex-1 resize-none rounded-2xl border border-slate-200 bg-white/70 p-4 text-[15px] leading-relaxed text-slate-800 outline-none transition-colors focus:border-brand-400"
          />
        </div>

        <div className="mt-1 text-right text-xs font-medium text-slate-400">
          {content.length}/{MAX_TEXT}
        </div>

        {previews.length > 0 && (
          <div className={`mt-3 grid gap-2 ${previews.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {previews.map((src, i) => (
              <div key={src} className="group relative overflow-hidden rounded-2xl bg-slate-100">
                {files[i]?.type?.startsWith('video') ? (
                  <video src={src} controls className="h-44 w-full object-cover" />
                ) : (
                  <img src={src} alt={`Preview ${i + 1}`} className="h-44 w-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/70 text-sm font-bold text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Visibility
            </label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-brand-400"
            >
              <option value="public">Public</option>
              <option value="followers">Followers</option>
              <option value="private">Private</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500">
              Location
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. New York"
              className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand-400"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-50"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path d="M12 16V4m0 0L8 8m4-4l4 4M4 20h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Add photo / video ({files.length}/{MAX_MEDIA})
          </button>
          <input ref={fileRef} type="file" accept="image/*,video/*" multiple hidden onChange={onSelectFiles} />

          <div className="flex items-center gap-3">
            {isLoading && <Spinner size="sm" />}
            <Button type="submit" size="md" loading={isLoading} disabled={!content.trim() && files.length === 0}>
              Post
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Compose;