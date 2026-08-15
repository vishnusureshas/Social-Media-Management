import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../user/UserCard';
import { formatRelative } from '../../utils/postUtils';
import PostContent from './PostContent';
import { PostMedia, ShareOriginal } from './PostMedia';
import LikeButton from './LikeButton';
import SaveButton from './SaveButton';
import ShareButton from './ShareButton';
import ReactionBar from './ReactionBar';
import PollCard from './PollCard';
import ReportButton from '../report/ReportButton';

const PostCard = ({ post }) => {
  const author = post?.author;
  const isRepost = !!post?.originalPost;
  const navigate = useNavigate();
  const { user: me } = useAuth();

  if (!post) return null;

  const isOwn = me && String(me._id) === String(author?._id);

  return (
    <article className="dash-hover overflow-hidden rounded-3xl border border-white/[0.09] bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-xl">
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <Link to={`/u/${author?.username}`} className="group flex items-center gap-3">
            <span className="story-ring rounded-full p-[2.5px] transition-transform duration-300 group-hover:scale-105">
              <span className="block rounded-full border-2 border-[#0a0e24] bg-[#0a0e24]">
                <Avatar user={author} size="sm" />
              </span>
            </span>
            <div>
              <p className="flex items-center gap-1 font-display text-sm font-bold text-slate-100 group-hover:text-violet-200">
                {author?.fullName || author?.username}
                {author?.verified && (
                  <svg className="h-4 w-4 shrink-0 text-violet-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l2.4 2.4 3.4-.4.4 3.4L20 10l-1.8 2.6.1 3.4-3.4.4L12 20l-2.9-1.6-3.4-.4.1-3.4L4 10l1.8-2.6.4-3.4 3.4.4L12 2z" />
                  </svg>
                )}
                {isRepost && <span className="text-xs font-medium text-slate-500">· reposted</span>}
              </p>
              <p className="text-xs font-medium text-slate-500">@{author?.username}</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              to={`/post/${post._id}`}
              className="text-xs font-medium text-slate-500 transition-colors hover:text-violet-300"
            >
              {formatRelative(post.createdAt)}
            </Link>
            {!isOwn && <ReportButton targetType="post" targetId={post._id} />}
          </div>
        </div>

        {isRepost && <ShareOriginal original={post.originalPost} />}

        <div
          className="mt-3 cursor-pointer"
          onClick={() => navigate(`/post/${post._id}`)}
          role="button"
          tabIndex={0}
        >
          <PostContent content={post.content} />
        </div>

        <PostMedia media={post.media} />

        {post.poll && <PollCard poll={post.poll} postId={post._id} />}

        <div className="mt-4 flex items-center justify-between gap-1 border-t border-white/[0.07] pt-3">
          <LikeButton post={post} size="md" />
          <ReactionBar post={post} postId={post._id} />
          <Link
            to={`/post/${post._id}`}
            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-white/[0.07] hover:text-violet-300"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
            {post.commentsCount || 0}
          </Link>
          <ShareButton post={post} />
          <SaveButton post={post} />
        </div>
      </div>
    </article>
  );
};

export default PostCard;