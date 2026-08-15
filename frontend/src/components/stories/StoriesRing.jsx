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
      <div className="rounded-3xl border border-white/[0.09] bg-white/[0.045] p-4 backdrop-blur-xl">
        <div className="mb-3 flex items-center justify-between">
          <p className="dash-chip">
            <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400" />
            Stories
          </p>
          <button
            type="button"
            className="text-xs font-semibold text-slate-400 transition-colors hover:text-violet-300"
          >
            See all
          </button>
        </div>
        {isLoading ? (
          <div className="flex gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className="h-16 w-16 animate-pulse rounded-full bg-white/[0.08]" />
                <div className="h-2 w-12 animate-pulse rounded-full bg-white/[0.08]" />
              </div>
            ))}
          </div>
        ) : groups.length === 0 && !ownStoryHandler ? (
          <p className="text-sm text-slate-500">No stories right now. Be the first to share one!</p>
        ) : (
          <div className="scrollbar-thin flex gap-4 overflow-x-auto pb-1">
            {ownStoryHandler && (
              <button
                onClick={ownStoryHandler}
                className="group flex shrink-0 flex-col items-center gap-1.5"
              >
                <span className="relative rounded-full border-2 border-dashed border-violet-400/60 bg-[#0a0e24] p-[5px] transition-transform group-hover:scale-105">
                  <Avatar user={me ?? undefined} />
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white shadow-glow">
                    +
                  </span>
                </span>
                <span className="max-w-16 truncate text-xs font-medium text-slate-300">
                  Your story
                </span>
              </button>
            )}
            {groups.map((group, i) => {
              const user = group.user;
              return (
                <button
                  key={String(user._id)}
                  onClick={() => setActiveGroup(group)}
                  className="group flex shrink-0 flex-col items-center gap-1.5"
                >
                  <span className="story-ring rounded-full p-[2.5px] transition-transform group-hover:scale-105" style={{ animationDelay: `${i * 0.2}s` }}>
                    <span className="block rounded-full border-2 border-[#0a0e24] bg-[#0a0e24]">
                      <Avatar user={user} size="lg" />
                    </span>
                  </span>
                  <span className="max-w-16 truncate text-xs font-medium text-slate-300">
                    @{user?.username}
                  </span>
                </button>
              );
            })}
            {groups.length === 0 && (
              <p className="py-2 text-sm text-slate-500">No stories right now. Be the first to share one!</p>
            )}
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