import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '../user/UserCard';
import { useGetStoryQuery, useDeleteStoryMutation } from '../../api/storyApi';
import { useAuth } from '../../hooks/useAuth';
import { formatRelative } from '../../utils/postUtils';

const AUTO_ADVANCE_MS = 5000;

const StoryViewer = ({ group, onClose }) => {
  const { user: me } = useAuth();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [deleteStory] = useDeleteStoryMutation();
  const raf = useRef(null);
  const startTs = useRef(null);

  const story = group?.stories?.[index];
  const author = group?.user;
  const count = group?.stories?.length || 0;

  const getStory = useGetStoryQuery(story?._id, { skip: !story });

  const isOwn = me && author && String(me._id) === String(author._id);

  const goTo = (next) => {
    const clamped = Math.max(0, Math.min(next, count - 1));
    setIndex(clamped);
    startTs.current = null;
    setProgress(0);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goTo(index + 1);
      if (e.key === 'ArrowLeft') goTo(index - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, count, onClose]);

  useEffect(() => {
    if (paused) return;
    if (startTs.current === null) startTs.current = performance.now();

    const tick = () => {
      const elapsed = performance.now() - startTs.current;
      if (elapsed >= AUTO_ADVANCE_MS) {
        goTo(index + 1);
        return;
      }
      setProgress((elapsed / AUTO_ADVANCE_MS) * 100);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, index]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this story?')) return;
    await deleteStory(story._id).unwrap();
    const remaining = group.stories.filter((s) => s._id !== story._id);
    if (remaining.length === 0) {
      onClose();
      return;
    }
    goTo(index);
  };

  if (!story) return null;

  const media = story.media?.[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-sm">
      <div className="relative h-[80vh] max-h-[720px] w-full max-w-md overflow-hidden rounded-3xl bg-slate-900 shadow-2xl">
        {media?.mediaType === 'video' ? (
          <video
            src={media.url}
            poster={media.thumb}
            autoPlay
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-contain"
          />
        ) : media?.url ? (
          <img src={media.url} alt="" className="absolute inset-0 h-full w-full object-contain" />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ backgroundColor: story.bgColor || '#111827' }}
          >
            <p className="px-8 text-center font-display text-3xl font-bold leading-snug text-white">
              {story.text}
            </p>
          </div>
        )}

        {story.text && media?.url && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/80 to-transparent p-5 pt-16">
            <p className="text-lg font-semibold text-white">{story.text}</p>
          </div>
        )}

        <div className="absolute inset-x-0 top-0 p-4">
          <div className="mb-3 flex gap-1.5">
            {group.stories.map((s, i) => (
              <button
                key={s._id}
                onClick={() => goTo(i)}
                className="h-1 flex-1 overflow-hidden rounded-full bg-white/30"
              >
                <span
                  className="block h-full rounded-full bg-white"
                  style={i < index ? { width: '100%' } : i === index ? { width: `${progress}%` } : { width: '0%' }}
                />
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3">
            <Link to={`/u/${author?.username}`} className="flex items-center gap-2.5">
              <span className="rounded-full border-2 border-brand-500">
                <Avatar user={author} size="sm" />
              </span>
              <span className="text-sm font-bold text-white">@{author?.username}</span>
              <span className="text-xs text-white/60">{formatRelative(story.createdAt)}</span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium text-white">
                {getStory?.data?.data?.story?.viewCount ?? story.viewCount ?? 0} views
              </span>
              {isOwn && (
                <button
                  onClick={handleDelete}
                  className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-500"
                >
                  Delete
                </button>
              )}
              <button
                onClick={() => setPaused((p) => !p)}
                className="rounded-full bg-white/15 px-2.5 py-1 text-xs text-white"
              >
                {paused ? '▶' : '❚❚'}
              </button>
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-sm font-bold text-white hover:bg-white/25"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={() => goTo(index - 1)}
              disabled={index === 0}
              className="text-white/70 transition-colors hover:text-white disabled:opacity-30"
            >
              ←
            </button>
            <button
              onClick={() => goTo(index + 1)}
              disabled={index === count - 1}
              className="text-white/70 transition-colors hover:text-white disabled:opacity-30"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryViewer;