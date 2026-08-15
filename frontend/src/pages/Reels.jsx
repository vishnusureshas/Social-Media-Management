import { useEffect, useRef, useState } from 'react';
import { useGetReelsQuery, useGetReelQuery, usePlayReelMutation } from '../api/reelApi';
import { useInfiniteReels } from '../hooks/useInfiniteReels';
import ReelPlayer from '../components/reel/ReelPlayer';
import ReelCommentSheet from '../components/reel/ReelCommentSheet';
import ReelComposer from '../components/reel/ReelComposer';
import Spinner from '../components/ui/Spinner';
import cn from '../utils/cn';

const Reels = () => {
  const { reels, isLoading, isError, loadMore, hasMore, isFetching, refetch } =
    useInfiniteReels(useGetReelsQuery);
  const [playReel] = usePlayReelMutation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [removed, setRemoved] = useState(() => new Set());
  const [sheetReel, setSheetReel] = useState(null);
  const [composing, setComposing] = useState(false);
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
        <p className="font-display text-lg font-semibold text-slate-700">Couldn't load reels.</p>
        <button onClick={refetch} className="font-semibold text-brand-600 hover:text-brand-700">
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        className={cn(
          'relative h-[calc(100vh-6rem)] overflow-y-auto snap-y snap-mandatory scrollbar-hide',
          'mx-auto w-full max-w-xl'
        )}
      >
        {visibleReels.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <p className="font-display text-lg font-semibold text-slate-700">
              No reels yet. Be the first!
            </p>
            <button
              onClick={() => setComposing(true)}
              className="rounded-2xl bg-gradient-to-br from-brand-500 to-fuchsia-500 px-5 py-2.5 text-sm font-bold text-white shadow-glow transition-transform hover:scale-105"
            >
              Create a reel
            </button>
          </div>
        ) : (
          visibleReels.map((reel, i) => (
            <div key={reel._id} data-reel-item data-reel-index={i} className="h-full snap-start">
              <ReelPlayer
                reel={i === safeIndex && focusedReel ? focusedReel : reel}
                active={i === safeIndex}
                onPlayOnce={(id) => playReel(id)}
                onOpenComments={setSheetReel}
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
      </div>

      <button
        onClick={() => setComposing(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-fuchsia-500 text-2xl font-bold text-white shadow-glow transition-transform hover:scale-105"
        aria-label="Create reel"
      >
        +
      </button>

      {sheetReel && <ReelCommentSheet reel={sheetReel} onClose={() => setSheetReel(null)} />}
      {composing && <ReelComposer onClose={() => setComposing(false)} />}
    </>
  );
};

export default Reels;