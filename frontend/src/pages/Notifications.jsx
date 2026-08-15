import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '../components/user/UserCard';
import {
  useGetNotificationsQuery,
  useMarkAllReadMutation,
  useMarkOneReadMutation,
} from '../api/notificationApi';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { formatRelative } from '../utils/postUtils';

const typeLabel = {
  like: 'liked your',
  reaction: 'reacted to your',
  comment: 'commented on your',
  follow: 'followed you',
  mention: 'mentioned you in a',
  share: 'shared a',
  message: 'sent you a message',
  story_reply: 'replied to your story',
  report_resolved: 'your report was resolved',
  admin_notice: '',
  broadcast: '',
};

const targetNoun = {
  post: 'post',
  reel: 'reel',
  story: 'story',
  comment: 'comment',
};

const targetPath = (n) => {
  if (!n?.targetType || !n?.targetId) return null;
  if (n.targetType === 'post') return `/post/${n.targetId}`;
  if (n.targetType === 'reel') return `/reels`;
  if (n.targetType === 'story') return `/u/${n.actor?.username}`;
  return null;
};

const routeNoun = (n) => {
  const label = typeLabel[n.type] || '';
  if (n.type === 'follow') return label;
  if (n.type === 'message') return label;
  if (n.type === 'report_resolved' || n.type === 'admin_notice' || n.type === 'broadcast') return n.message || label;
  const noun = targetNoun[n.targetType] || '';
  return `${label} ${noun}`;
};

const Notifications = () => {
  const [cursor, setCursor] = useState(undefined);
  const [markRead] = useMarkOneReadMutation();
  const [markAll] = useMarkAllReadMutation();

  const { data, isLoading, isFetching, isError, refetch } = useGetNotificationsQuery(
    { cursor },
    {
      refetchOnMountOrArgChange: false,
      merge: (currentCacheData, newData) => {
        if (!newData?.data?.notifications) return currentCacheData;
        if (!currentCacheData?.data?.notifications) return newData;
        const seen = new Set(currentCacheData.data.notifications.map((n) => n._id));
        const merged = [
          ...currentCacheData.data.notifications,
          ...newData.data.notifications.filter((n) => !seen.has(n._id)),
        ];
        return { ...newData, data: { ...newData.data, notifications: merged } };
      },
    }
  );

  const notifications = data?.data?.notifications || [];
  const hasMore = !!data?.data?.pagination?.hasMore;

  const handleOpen = (n) => {
    if (!n.read) markRead(n._id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <p className="font-display text-lg font-semibold text-slate-700">
          Couldn't load notifications.
        </p>
        <Button className="mt-4" variant="outline" onClick={refetch}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="mt-1 text-sm text-slate-500">Likes, comments, follows &amp; shares.</p>
        </div>
        {notifications.some((n) => !n.read) && (
          <Button variant="secondary" size="sm" onClick={() => markAll()}>
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/60 p-12 text-center backdrop-blur">
          <p className="font-display text-lg font-semibold text-slate-700">
            You're all caught up!
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Interactions on your posts, reels, stories and profile will show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const path = targetPath(n);
            const inner = (
              <div className="flex items-center gap-3">
                <Avatar user={n.actor} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-slate-700">
                    <Link
                      to={`/u/${n.actor?.username}`}
                      onClick={() => handleOpen(n)}
                      className="font-bold text-slate-900 hover:text-brand-600"
                    >
                      @{n.actor?.username || 'someone'}
                    </Link>{' '}
                    <span className={n.read ? 'text-slate-500' : 'font-semibold text-slate-800'}>
                      {routeNoun(n)}
                    </span>
                  </p>
                  {n.message && !['follow', 'message', 'report_resolved', 'admin_notice', 'broadcast'].includes(n.type) && (
                    <p className="truncate text-xs text-slate-400">{n.message}</p>
                  )}
                  <p className="text-xs text-slate-400">{formatRelative(n.createdAt)}</p>
                </div>
                {!n.read && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand-500" />}
              </div>
            );

            return (
              <div
                key={n._id}
                className={`glass rounded-3xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300 ${
                  n.read ? 'bg-white/40' : 'bg-white'
                }`}
              >
                {path ? <Link to={path} onClick={() => handleOpen(n)}>{inner}</Link> : inner}
              </div>
            );
          })}

          {hasMore && (
            <div className="pt-2 text-center">
              <Button
                variant="secondary"
                size="sm"
                loading={isFetching}
                onClick={() => setCursor(data?.data?.pagination?.cursor)}
              >
                Load more
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;