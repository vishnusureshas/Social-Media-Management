import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetSharedReelsQuery, useGetReelQuery, usePlayReelMutation } from '../api/reelApi';
import { useInfiniteReels } from '../hooks/useInfiniteReels';
import ReelPlayer from '../components/reel/ReelPlayer';
import ReelCommentSheet from '../components/reel/ReelCommentSheet';
import ReelShareSheet from '../components/reel/ReelShareSheet';
import { Avatar } from '../components/user/UserCard';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import cn from '../utils/cn';
import { formatRelative } from '../utils/postUtils';
import { useEffect, useRef } from 'react';

const tabs = [
  { key: 'received', label: 'Received' },
  { key: 'sent', label: 'Sent' },
];

const SharedReelsPager = ({ scope }) => {
  const { reels, isLoading, isError, loadMore, hasMore, isFetching, refetch } =
    useInfiniteReels(useGetSharedReelsQuery, { scope });
  const [playReel] = usePlayReelMutation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [removed, setRemoved] = useState(() => new Set());
  const [sheetReel, setSheetReel] = useState(null);
  const [shareReelTarget, setShareReelTarget] = useState(null);
  const containerRef = useRef(null);
  const observersRef = useRef([]);

  const visibleReels = reels.filter((r) => !removed.has(String(r._id)));
  const safeIndex = Math.min(activeIndex, Math.max(visibleReels.length - 1, 0));
  const activeReel = visibleReels[safeIndex];

  const { data: focusedReelData } = useGetReelQuery(activeReel?._id, {
    skip: !activeReel,
  });
  const focusedReel = focusedReelData?.data?.reel;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    observersRef.current.forEach((o) => o.disconnect());
    observersRef.current = [];

    const items = container.querySelectorAll('[data-reel-item]');
    const onIntersect = (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          const idx = Number(entry.target.dataset.reelIndex);
          setActiveIndex(idx);
          if (idx >= visibleReels.length - 1 && hasMore) loadMore();
          break;
        }
      }
    };

    items.forEach((el) => {
      const observer = new IntersectionObserver(onIntersect, { rootMargin: '0px', threshold: 0.5 });
      observer.observe(el);
      observersRef.current.push(observer);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleReels.length, hasMore]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-6rem)] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[calc(100vh-6rem)] flex-col items-center justify-center gap-4">
        <p className="font-display text-lg font-semibold text-slate-700">Couldn't load shared reels.</p>
        <Button variant="outline" onClick={refetch}>Try again</Button>
      </div>
    );
  }

  const partner = (reel) => (scope === 'sent' ? reel?.sharedTo : reel?.sharedBy);
  const partnerText = (reel) =>
    scope === 'sent'
      ? `You shared this with @${partner(reel)?.username}`
      : `@${partner(reel)?.username} shared this`;

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative h-[calc(100vh-6rem)] overflow-y-auto snap-y snap-mandatory scrollbar-hide',
        'mx-auto w-full max-w-xl'
      )}
    >
      {visibleReels.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
          <p className="font-display text-lg font-semibold text-slate-700">
            {scope === 'sent'
              ? 'You have not shared any reels yet.'
              : 'No reels have been shared with you yet.'}
          </p>
          <Link to="/reels" className="font-semibold text-brand-600 hover:text-brand-700">
            Browse reels →
          </Link>
        </div>
      ) : (
        visibleReels.map((reel, i) => (
          <div key={reel._id} data-reel-item data-reel-index={i} className="relative h-full snap-start">
            {partner(reel) && (
              <div className="absolute inset-x-0 top-4 z-10 flex justify-center px-4">
                <Link
                  to={`/u/${partner(reel).username}`}
                  className="glass inline-flex max-w-full items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-xs font-semibold text-slate-900 shadow-lg"
                >
                  <Avatar user={partner(reel)} size="sm" />
                  <span className="truncate">
                    <b>{partnerText(reel)}</b> · {formatRelative(reel.createdAt)}
                  </span>
                </Link>
              </div>
            )}
            <ReelPlayer
              reel={i === safeIndex && focusedReel ? focusedReel : reel}
              active={i === safeIndex}
              onPlayOnce={(id) => playReel(id)}
              onOpenComments={setSheetReel}
              onOpenShare={setShareReelTarget}
              onDeleted={(id) => setRemoved((prev) => new Set(prev).add(String(id)))}
            />
          </div>
        ))
      )}

      {(isFetching || (hasMore && visibleReels.length > 0)) && (
        <div className="flex justify-center py-4">
          <Spinner size="sm" />
        </div>
      )}

      {sheetReel && <ReelCommentSheet reel={sheetReel} onClose={() => setSheetReel(null)} />}
      {shareReelTarget && (
        <ReelShareSheet reel={shareReelTarget} onClose={() => setShareReelTarget(null)} />
      )}
    </div>
  );
};

const SharedReels = () => {
  const [scope, setScope] = useState('received');

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="flex justify-center py-4">
        <div className="flex rounded-2xl border border-slate-200/80 bg-white/70 p-1.5 backdrop-blur-md">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setScope(t.key)}
              className={cn(
                'rounded-xl px-6 py-2.5 text-sm font-semibold transition-all duration-300',
                scope === t.key
                  ? 'bg-gradient-to-r from-brand-500 via-violet-500 to-fuchsia-500 text-white shadow-glow'
                  : 'text-slate-500 hover:text-brand-600'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <SharedReelsPager key={scope} scope={scope} />
    </div>
  );
};

export default SharedReels;