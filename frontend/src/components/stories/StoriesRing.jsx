import { useState } from 'react';
import { Avatar } from '../user/UserCard';
import { useGetActiveStoriesQuery } from '../../api/storyApi';
import { useAuth } from '../../hooks/useAuth';
import StoryViewer from './StoryViewer';

const StoriesRing = ({ ownStoryHandler }) => {
  const { user: me } = useAuth();
  const { data, isLoading, isError } = useGetActiveStoriesQuery();
  const [activeGroup, setActiveGroup] = useState(null);

  const groups = data?.data?.authors || [];

  if (isError) return null;

  return (
    <>
      <div className="rounded-3xl border border-slate-200 bg-white/60 p-4 backdrop-blur">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Stories</p>
        {isLoading ? (
          <div className="flex gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className="h-16 w-16 animate-pulse rounded-full bg-slate-200" />
                <div className="h-2 w-12 animate-pulse rounded-full bg-slate-200" />
              </div>
            ))}
          </div>
        ) : groups.length === 0 ? (
          <p className="text-sm text-slate-400">No stories right now. Be the first to share one!</p>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-1">
            {ownStoryHandler && (
              <button
                onClick={ownStoryHandler}
                className="group flex shrink-0 flex-col items-center gap-1.5"
              >
                <span className="rounded-full border-2 border-dashed border-brand-500 bg-white p-[5px] transition-transform group-hover:scale-105">
                  <Avatar user={me ?? undefined} />
                </span>
                <span className="max-w-16 truncate text-xs font-medium text-slate-600">
                  Your story
                </span>
              </button>
            )}
            {groups.map((group) => {
              const user = group.user;
              return (
                <button
                  key={String(user._id)}
                  onClick={() => setActiveGroup(group)}
                  className="group flex shrink-0 flex-col items-center gap-1.5"
                >
                  <span className="rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-fuchsia-500 p-[2.5px] transition-transform group-hover:scale-105">
                    <span className="block rounded-full border-2 border-white bg-white">
                      <Avatar user={user} size="lg" />
                    </span>
                  </span>
                  <span className="max-w-16 truncate text-xs font-medium text-slate-600">
                    @{user?.username}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {activeGroup && (
        <StoryViewer
          group={activeGroup}
          onClose={() => setActiveGroup(null)}
        />
      )}
    </>
  );
};

export default StoriesRing;