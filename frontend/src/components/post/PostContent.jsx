import { splitHashtags } from '../../utils/postUtils';
import HashtagChip from './HashtagChip';

const PostContent = ({ content }) => {
  if (!content) return null;
  return (
    <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-800">
      {splitHashtags(content).map((part, i) =>
        part.isTag ? (
          <HashtagChip key={`${part.value}-${i}`} tag={part.value} />
        ) : (
          <span key={`t-${i}`}>{part.text}</span>
        )
      )}
    </p>
  );
};

export default PostContent;