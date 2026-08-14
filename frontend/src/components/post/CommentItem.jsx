import { Link } from 'react-router-dom';
import { Avatar } from '../user/UserCard';
import { formatRelative } from '../../utils/postUtils';

const CommentItem = ({ comment, onReply }) => {
  const author = comment?.author;
  if (!comment) return null;

  return (
    <div className="flex gap-3 py-3">
      <Link to={`/u/${author?.username}`} className="shrink-0">
        <Avatar user={author} size="sm" />
      </Link>
      <div className="min-w-0 flex-1">
        <Link to={`/u/${author?.username}`} className="group inline-flex items-center gap-1">
          <span className="text-sm font-bold text-slate-900 group-hover:text-brand-600">
            {author?.fullName || author?.username}
          </span>
          <span className="text-xs font-medium text-slate-400">@{author?.username}</span>
        </Link>
        <span className="ml-1 text-xs font-medium text-slate-300">· {formatRelative(comment.createdAt)}</span>
        <p className="mt-1 text-sm leading-relaxed text-slate-700">{comment.content}</p>
        {onReply && (
          <button
            onClick={() => onReply(comment)}
            className="mt-1 text-xs font-semibold text-slate-400 transition-colors hover:text-brand-600"
          >
            Reply
          </button>
        )}
      </div>
    </div>
  );
};

export default CommentItem;