import cn from '../../utils/cn';

const Avatar = ({ src, alt = '', className = 'h-10 w-10' }) => (
  <span className={cn('inline-block shrink-0 overflow-hidden rounded-full', className)}>
    <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover" />
  </span>
);

export default Avatar;