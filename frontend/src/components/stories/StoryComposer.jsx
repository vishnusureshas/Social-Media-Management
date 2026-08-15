import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { useCreateStoryMutation } from '../../api/storyApi';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import { Avatar } from '../user/UserCard';

const BG_COLORS = ['#0f172a', '#7c3aed', '#db2777', '#0891b2', '#ea580c', '#16a34a'];

const StoryComposer = ({ onClose }) => {
  const { user: me } = useAuth();
  const [createStory, { isLoading }] = useCreateStoryMutation();
  const [text, setText] = useState('');
  const [bgColor, setBgColor] = useState(BG_COLORS[0]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  const onSelectFile = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    setText('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() && !file) {
      toast.error('Add text or an image/video to your story.');
      return;
    }

    const formData = new FormData();
    formData.append('text', text.trim());
    formData.append('bgColor', bgColor);
    if (file) formData.append('media', file);

    try {
      await createStory(formData).unwrap();
      toast.success('Story shared!');
      onClose();
    } catch (err) {
      toast.error(err?.data?.message || "Couldn't publish story.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-white/[0.12] bg-[#0b0f26] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.95)]">
        <div className="flex items-center justify-between px-5 py-4">
          <p className="font-display text-lg font-bold text-white">Add to your story</p>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-sm font-bold text-slate-400 hover:bg-white/[0.12] hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            className="mx-5 flex h-64 items-center justify-center overflow-hidden rounded-2xl transition-colors"
            style={{ backgroundColor: bgColor }}
          >
            {preview ? (
              file?.type?.startsWith('video') ? (
                <video src={preview} controls className="h-full w-full object-contain" />
              ) : (
                <img src={preview} alt="Story preview" className="h-full w-full object-contain" />
              )
            ) : (
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={500}
                placeholder="What's happening?"
                className="w-full bg-transparent px-6 text-center text-xl font-bold text-white outline-none placeholder:text-white/50"
                rows={3}
              />
            )}
          </div>

          <div className="flex flex-wrap gap-2 px-5 pt-4">
            {BG_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setBgColor(color)}
                className={`h-7 w-7 rounded-full border-2 ${bgColor === color ? 'border-brand-500' : 'border-transparent'}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          <div className="px-5 py-4">
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              hidden
              onChange={onSelectFile}
            />
            {!file && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="mb-3 w-full rounded-xl border border-white/[0.12] bg-white/[0.05] px-4 py-2.5 text-sm font-semibold text-violet-300 transition-colors hover:bg-white/[0.09] hover:text-violet-200"
              >
                📷 Add photo / video
              </button>
            )}

            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Avatar user={me} size="sm" />
                <span className="text-xs font-medium text-slate-500">@{me?.username}</span>
              </div>
              <Button type="submit" loading={isLoading} disabled={!text.trim() && !file}>
                Share
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StoryComposer;