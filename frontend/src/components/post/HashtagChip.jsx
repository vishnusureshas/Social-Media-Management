import { Link } from 'react-router-dom';

const HashtagChip = ({ tag }) => (
  <Link
    to={`/tag/${encodeURIComponent(tag)}`}
    className="font-semibold text-brand-600 hover:text-brand-700 hover:underline"
  >
    #{tag}
  </Link>
);

export default HashtagChip;