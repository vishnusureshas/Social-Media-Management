import { Link } from 'react-router-dom';
import { useInfinitePosts } from '../hooks/useInfinitePosts';
import { useGetFeedQuery } from '../api/postApi';
import PostCard from '../components/post/PostCard';
import TrendingPanel from '../components/post/TrendingPanel';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

const Feed = () => {
  const { posts, isLoading, isError, loadMore, hasMore, isFetching, refetch } =
    useInfinitePosts(useGetFeedQuery);

  if (isError) {
    return (
      <PageShell>
        <EmptyState text="We couldn't load your feed." actionLabel="Try again" onAction={refetch} />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white/60 p-5 backdrop-blur">
        <Link to="/compose" className="group flex items-center gap-3">
          <span
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-fuchsia-500 text-2xl font-bold text-white shadow-glow transition-transform group-hover:scale-105"
          >
            +
          </span>
          <span className="font-display text-base font-semibold text-slate-500 transition-colors group-hover:text-brand-600">
            Share something with your community…
          </span>
        </Link>
      </div>

      {isLoading ? (
        <LoadingState />
      ) : posts.length === 0 ? (
        <EmptyState text="Your feed is empty. Follow people or create your first post!" />
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>
      )}

      {hasMore && !isLoading && (
        <div className="mt-8 flex justify-center">
          <Button size="lg" onClick={loadMore} loading={isFetching}>
            Load more
          </Button>
        </div>
      )}
    </PageShell>
  );
};

const PageShell = ({ children }) => (
  <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[1fr_300px]">
    <div>{children}</div>
    <div className="hidden lg:block">
      <div className="sticky top-24 space-y-6">
        <TrendingPanel />
      </div>
    </div>
  </div>
);

const LoadingState = () => (
  <div className="flex justify-center py-20">
    <Spinner />
  </div>
);

const EmptyState = ({ text, actionLabel, onAction }) => (
  <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-10 text-center backdrop-blur">
    <p className="font-display text-lg font-semibold text-slate-700">{text}</p>
    {actionLabel && onAction && (
      <Button className="mt-4" variant="outline" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
);

export default Feed;