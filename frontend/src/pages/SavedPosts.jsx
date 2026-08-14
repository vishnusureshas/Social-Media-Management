import { useInfinitePosts } from '../hooks/useInfinitePosts';
import { useGetSavedListQuery } from '../api/postApi';
import PostCard from '../components/post/PostCard';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';

const SavedPosts = () => {
  const { posts, isLoading, isError, loadMore, hasMore, isFetching, refetch } =
    useInfinitePosts(useGetSavedListQuery);

  if (isError) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="font-display text-lg font-semibold text-slate-700">Couldn't load saved posts.</p>
        <Button className="mt-4" variant="outline" onClick={refetch}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-slate-900">Saved posts</h1>
      <p className="mt-1 text-sm text-slate-500">Posts you've bookmarked.</p>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : posts.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white/60 p-10 text-center backdrop-blur">
          <p className="font-display text-lg font-semibold text-slate-700">
            You haven't saved any posts yet.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
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
    </div>
  );
};

export default SavedPosts;