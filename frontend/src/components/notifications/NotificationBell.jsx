import { Link } from 'react-router-dom';
import { useGetUnreadCountQuery } from '../../api/notificationApi';

const NotificationBell = () => {
  const { data } = useGetUnreadCountQuery(undefined, {
    pollingInterval: 30000,
  });

  const count = data?.data?.count || 0;

  return (
    <Link to="/notifications" className="relative">
      <span className="glass inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:border-brand-300 hover:text-brand-600">
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-4-5.7V4a2 2 0 10-4 0v1.3A6 6 0 006 11v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 01-6 0v-1m6 0H9"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </span>
    </Link>
  );
};

export default NotificationBell;