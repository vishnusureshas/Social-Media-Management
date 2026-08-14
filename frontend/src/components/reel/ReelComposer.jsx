import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCreateReelMutation } from '../../api/reelApi';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../user/UserCard';
import Button from '../ui/Button';

const MAX_CAPTION = 2200;

const ReelComposer = ({ onClose }) => {
  const { user: me } = useAuth();
  const navigate = useNavigate();
  const [createReel, { isLoading }] = useCreateReelMutation();
  const [caption, setCaption] = useState('');
  const [audioName, setAudioName] = useState('');
  const [audioArtist, setAudioArtist] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  const onSelectFile = (e) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (!selected.type.startsWith('video/')) {
      toast.error('Reels must be a video file.');
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Add a video to publish a reel.');
      return;
    }

    const formData = new FormData();
    formData.append('video', file);
    formData.append('caption', caption.trim());
    if (audioName.trim()) formData.append('audioName', audioName.trim());
    if (audioArtist.trim()) formData.append('audioArtist', audioArtist.trim());

    try {
      const res = await createReel(formData).unwrap();
      toast.success('Reel published!');
      onClose();
      navigate(`/reels`, { state: { reelId: res?.data?.reel?._id } });
    } catch (err) {
      toast.error(err?.data?.message || "Couldn't publish reel.");
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4">
          <p className="font-display text-lg font-bold text-slate-900">Create a reel</p>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600 hover:bg-slate-200"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mx-5 flex h-72 items-center justify-center overflow-hidden rounded-2xl bg-slate-950">
            {preview ? (
              <video src={preview} controls className="h-full w-full object-contain" />
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex h-full w-full flex-col items-center justify-center gap-3 text-white/70 transition-colors hover:text-white"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-3xl">
                  ▶
                </span>
                <span className="text-sm font-semibold">Select a video (max 90s)</span>
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="video/*"
            hidden
            onChange={onSelectFile}
          />

          <div className="space-y-3 px-5 py-4">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              maxLength={MAX_CAPTION}
              placeholder="Write a caption…"
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand-400"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                value={audioName}
                onChange={(e) => setAudioName(e.target.value)}
                maxLength={100}
                placeholder="Audio name"
                className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand-400"
              />
              <input
                value={audioArtist}
                onChange={(e) => setAudioArtist(e.target.value)}
                maxLength={100}
                placeholder="Audio artist"
                className="w-full rounded-xl border border-slate-200 bg-white/70 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-brand-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-between px-5 pb-5">
            <div className="flex items-center gap-2">
              <Avatar user={me} size="sm" />
              <span className="text-xs font-medium text-slate-500">@{me?.username}</span>
            </div>
            <Button type="submit" size="md" loading={isLoading} disabled={!file}>
              Publish
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReelComposer;