import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useInfinitePosts } from '../hooks/useInfinitePosts';
import { useGetFeedQuery } from '../api/postApi';
import PostCard from '../components/post/PostCard';
import StoriesRing from '../components/stories/StoriesRing';
import StoryComposer from '../components/stories/StoryComposer';
import { Avatar } from '../components/user/UserCard';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

const composerActions = [
  { label: 'Photo', icon: 'photo' },
  { label: 'Video', icon: 'video' },
  { label: 'Feeling', icon: 'feeling' },
  { label: 'Poll', icon: 'poll' },
  { label: 'Location', icon: 'location' },
];

const iconPaths = {
  photo: (
    <path d="M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM8 11a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  video: (
    <path d="M14 4H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V6a2 2 0 00-2-2zM18 9l4-2.5v11L18 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  feeling: (
    <path d="M12 21a9 9 0 100-18 9 9 0 000 18zM8.5 10h.01M15.5 10h.01M8 14.5c.7 1 2.3 2.5 4 2.5s3.3-1.5 4-2.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  poll: (
    <path d="M5 5h14v14H5V5zM8 9h8M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  location: (
    <path d="M12 21s-7-4.5-7-10a7 7 0 1114 0c0 5.5-7 10-7 10zM12 12a2 2 0 100-4 2 2 0 000 4z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
};

const Feed = () => {
  const { posts, isLoading, isError, loadMore, hasMore, isFetching, refetch } =
    useInfinitePosts(useGetFeedQuery);
  const [composing, setComposing] = useState(false);
  const { user: me } = useAuth();
  const firstName = (me?.fullName || me?.username || 'there').split(' ')[0];

  if (isError) {
    return (
      <PageShell>
        <EmptyState text="We couldn't load your feed." actionLabel="Try again" onAction={refetch} />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <StoriesRing ownStoryHandler={() => setComposing(true)} />
      {composing && <StoryComposer onClose={() => setComposing(false)} />}

      <Link to="/compose" className="block">
        <div className="group rounded-3xl border border-white/[0.09] bg-white/[0.045] p-4 backdrop-blur-xl transition-all duration-300 hover:border-violet-400/40 hover:bg-white/[0.06] hover:shadow-[0_24px_70px_-26px_rgba(139,92,246,0.5)]">
          <div className="flex items-center gap-3">
            <Avatar user={me} />
            <div className="flex-1 rounded-2xl border border-white/[0.09] bg-white/[0.04] px-4 py-3 text-sm text-slate-400 transition-colors group-hover:border-violet-400/30">
              What's on your mind, {firstName}?
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-white/[0.07] pt-3">
            <div className="flex flex-wrap items-center gap-0.5">
              {composerActions.map((a) => (
                <span
                  key={a.label}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                    {iconPaths[a.icon]}
                  </svg>
                  {a.label}
                </span>
              ))}
            </div>
            <span className="btn-gradient hidden items-center gap-1.5 rounded-xl px-5 py-2 text-sm font-bold text-white sm:inline-flex">
              Post
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          </div>
        </div>
      </Link>

      {isLoading ? (
        <LoadingState />
      ) : posts.length === 0 ? (
        <EmptyState text="Your feed is empty. Follow people or create your first post!" />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}

      {hasMore && !isLoading && (
        <div className="mt-6 flex justify-center">
          <Button size="lg" onClick={loadMore} loading={isFetching}>
            Load more
          </Button>
        </div>
      )}
    </PageShell>
  );
};

const PageShell = ({ children }) => (
  <div className="space-y-4">
    {children}
  </div>
);

const LoadingState = () => (
  <div className="flex justify-center py-14">
    <Spinner />
  </div>
);

const EmptyState = ({ text, actionLabel, onAction }) => (
  <div className="rounded-3xl border border-dashed border-white/[0.14] bg-white/[0.035] p-10 text-center backdrop-blur">
    <p className="font-display text-lg font-semibold text-slate-200">{text}</p>
    {actionLabel && onAction && (
      <Button className="mt-4" variant="outline" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
);

export default Feed;