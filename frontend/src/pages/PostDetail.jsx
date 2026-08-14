import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useGetPostQuery, useDeletePostMutation } from '../api/postApi';
import { useAuth } from '../hooks/useAuth';
import PostCard from '../components/post/PostCard';
import CommentSection from '../components/post/CommentSection';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: me } = useAuth();
  const { data, isLoading, isError } = useGetPostQuery(id, { skip: !id });
  const [deletePost, { isLoading: deleting }] = useDeletePostMutation();

  const post = data?.data?.post;

  const handleDelete = async () => {
    if (!window.confirm('Delete this post? This cannot be undone.')) return;
    try {
      await deletePost(id).unwrap();
      toast.success('Post deleted.');
      navigate('/feed');
    } catch (err) {
      toast.error(err?.data?.message || 'Unable to delete post.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="font-display text-lg font-semibold text-slate-700">Post not found.</p>
        <Link to="/feed" className="mt-4 inline-block text-brand-600 hover:underline">
          Back to feed
        </Link>
      </div>
    );
  }

  const isOwn = me && String(me._id) === String(post.author?._id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-brand-600"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>
        {isOwn && (
          <Button
            variant="ghost"
            className="!px-3 !py-1.5 text-rose-500 hover:bg-rose-50"
            loading={deleting}
            onClick={handleDelete}
          >
            Delete
          </Button>
        )}
      </div>

      <PostCard post={post} />
      <CommentSection postId={post._id} />
    </div>
  );
};

export default PostDetail;