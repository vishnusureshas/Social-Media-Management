import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Avatar } from '../user/UserCard';
import {
  useLikeReelMutation,
  useShareReelMutation,
  useDeleteReelMutation,
} from '../../api/reelApi';
import { useAuth } from '../../hooks/useAuth';
import { formatRelative } from '../../utils/postUtils';
import cn from '../../utils/cn';

const ReelPlayer = ({ reel, active, onPlayOnce, onOpenComments, onDeleted }) => {
  const { user: me } = useAuth();
  const videoRef = useRef(null);
  const playedRef = useRef(false);
  const [muted, setMuted] = useState(true);
  const [liked, setLiked] = useState(!!reel?.isLiked);
  const [likesCount, setLikesCount] = useState(reel?.likesCount || 0);
  const [sharesCount, setSharesCount] = useState(reel?.sharesCount || 0);
  const [likeReel] = useLikeReelMutation();
  const [shareReel] = useShareReelMutation();
  const [deleteReel] = useDeleteReelMutation();

  const author = reel?.author;
  const isOwn = me && author && String(me._id) === String(author._id);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [active]);

  const handlePlay = () => {
    if (active && !playedRef.current) {
      playedRef.current = true;
      onPlayOnce?.(reel?._id);
    }
  };

  const handleLike = async () => {
    const next = !liked;
    const prevCount = likesCount;
    setLiked(next);
    setLikesCount((c) => c + (next ? 1 : -1));
    try {
      await likeReel(reel._id).unwrap();
    } catch {
      setLiked(!next);
      setLikesCount(prevCount);
      toast.error('Unable to update like.');
    }
  };

  const handleShare = async () => {
    setSharesCount((c) => c + 1);
    try {
      await shareReel(reel._id).unwrap();
    } catch {
      toast.error('Unable to share reel.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this reel?')) return;
    try {
      await deleteReel(reel._id).unwrap();
      onDeleted?.(reel._id);
      toast.success('Reel deleted.');
    } catch (err) {
      toast.error(err?.data?.message || "Couldn't delete reel.");
    }
  };

  const railButton =
    'flex h-12 w-12 flex-col items-center justify-center gap-0.5 rounded-2xl bg-white/10 text-white backdrop-blur transition-transform hover:scale-105';

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-950">
      <video
        ref={videoRef}
        src={reel?.video?.url}
        poster={reel?.video?.thumbnail}
        autoPlay={active}
        muted={muted}
        loop
        playsInline
        onPlay={handlePlay}
        className="absolute inset-0 h-full w-full object-contain"
      />

      {reel?.durationSec ? (
        <span className="absolute right-4 top-4 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
          {reel.durationSec}s
        </span>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-5 pb-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div className="min-w-0">
            <Link to={`/u/${author?.username}`} className="inline-flex items-center gap-2.5">
              <Avatar user={author} size="sm" />
              <span className="text-sm font-bold text-white">@{author?.username}</span>
              <span className="text-xs text-white/60">{formatRelative(reel?.createdAt)}</span>
            </Link>
            {reel?.caption && (
              <p className="mt-2 max-w-md text-sm leading-relaxed text-white/90">
                {reel.caption}
              </p>
            )}
            {reel?.audio?.name && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-white/70">
                ♪ {reel.audio.name}
                {reel.audio.artist ? ` — ${reel.audio.artist}` : ''}
              </p>
            )}
          </div>

          <div className="flex shrink-0 flex-col items-center gap-2.5">
            <button onClick={handleLike} className={cn(railButton, liked && '!bg-rose-500/80')}>
              <svg
                viewBox="0 0 24 24"
                fill={liked ? 'currentColor' : 'none'}
                className="h-6 w-6"
              >
                <path
                  d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-xs font-semibold">{likesCount}</span>
            </button>

            <button onClick={handleShare} className={railButton}>
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                <path
                  d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-xs font-semibold">{sharesCount}</span>
            </button>

            <button onClick={() => onOpenComments?.(reel)} className={railButton}>
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                <path
                  d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="text-xs font-semibold">{reel?.commentsCount || 0}</span>
            </button>

            <button
              onClick={() => setMuted((m) => !m)}
              className={cn(railButton, 'text-xs font-bold', muted ? 'text-white/80' : 'text-brand-400')}
            >
              {muted ? 'MUTED' : 'SND'}
            </button>

            {isOwn && (
              <button onClick={handleDelete} className={cn(railButton, 'hover:!bg-rose-500/80')}>
                <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                  <path
                    d="M3 6h18M8 6V4a1 1 0 011-1h6a1 1 0 011 1v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="text-xs font-semibold">Del</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReelPlayer;