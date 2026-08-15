import { Link } from 'react-router-dom';

const MEDIA_BG = 'bg-[#0a0e24]';

const PostMedia = ({ media = [] }) => {
  if (!media || media.length === 0) return null;

  if (media.length === 1) {
    const m = media[0];
    if (m.type === 'video') {
      return (
        <video
          src={m.url}
          poster={m.thumb}
          controls
          preload="metadata"
          className={`mt-3 max-h-[420px] w-full rounded-2xl ${MEDIA_BG} object-contain ring-1 ring-white/10`}
        />
      );
    }
    return (
      <img src={m.url} alt="Post" loading="lazy" className="mt-3 max-h-[420px] w-full rounded-2xl object-cover ring-1 ring-white/10" />
    );
  }

  return (
    <div className={`mt-3 grid gap-2 ${media.length === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-2'}`}>
      {media.map((m, i) => (
        <div key={i} className={`overflow-hidden rounded-2xl ${MEDIA_BG} ring-1 ring-white/10`}>
          {m.type === 'video' ? (
            <video src={m.url} controls preload="metadata" className="h-40 w-full object-cover" />
          ) : (
            <img src={m.url} alt={`Post ${i + 1}`} loading="lazy" className="h-40 w-full object-cover" />
          )}
        </div>
      ))}
    </div>
  );
};

const ShareOriginal = ({ original }) => {
  if (!original) return null;
  const author = original.author;
  return (
    <Link
      to={author?._id ? `/post/${original._id}` : '#'}
      className="mt-3 block rounded-2xl border border-white/[0.09] bg-white/[0.03] p-3 transition-all hover:border-violet-400/40"
    >
      <p className="text-xs font-semibold text-slate-500">
        {author?.username ? `@${author.username} shared` : 'Shared post'}
      </p>
      {original.content && <p className="mt-1 line-clamp-3 text-sm text-slate-200">{original.content}</p>}
      {original.media?.[0] && (
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.06] text-slate-300">
            {original.media[0].type === 'video' ? '▶' : '🖼'}
          </span>
          <span>{original.media[0].type === 'video' ? 'Video' : 'Image'}</span>
        </div>
      )}
    </Link>
  );
};

export { PostMedia, ShareOriginal };
export default PostMedia;