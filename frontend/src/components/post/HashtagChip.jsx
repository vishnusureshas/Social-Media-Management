import { Link } from 'react-router-dom';

const HashtagChip = ({ tag }) => (
  <Link
    to={`/tag/${encodeURIComponent(tag)}`}
    className="font-semibold text-violet-300 hover:text-violet-200 hover:underline"
  >
    #{tag}
  </Link>
);

export default HashtagChip;