import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Avatar } from '../user/UserCard';
import { formatRelative } from '../../utils/postUtils';
import CommentReaction from './CommentReaction';
import ReportButton from '../report/ReportButton';

const CommentItem = ({ comment, onReply }) => {
  const author = comment?.author;
  const { user: me } = useAuth();
  if (!comment) return null;

  const isOwn = me && String(me._id) === String(author?._id);

  return (
    <div className="flex gap-3 py-3">
      <Link to={`/u/${author?.username}`} className="shrink-0">
        <Avatar user={author} size="sm" />
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link to={`/u/${author?.username}`} className="group inline-flex items-center gap-1">
            <span className="text-sm font-bold text-slate-100 group-hover:text-violet-200">
              {author?.fullName || author?.username}
            </span>
            <span className="text-xs font-medium text-slate-500">@{author?.username}</span>
          </Link>
          <span className="text-xs font-medium text-slate-500">· {formatRelative(comment.createdAt)}</span>
          <span className="flex-1" />
          {!isOwn && <ReportButton targetType="comment" targetId={comment._id} />}
        </div>
        <p className="mt-1 text-sm leading-relaxed text-slate-200">{comment.content}</p>
        {onReply && (
          <button
            onClick={() => onReply(comment)}
            className="mt-1 text-xs font-semibold text-slate-500 transition-colors hover:text-violet-300"
          >
            Reply
          </button>
        )}
        <CommentReaction comment={comment} postId={comment.post} />
      </div>
    </div>
  );
};

export default CommentItem;