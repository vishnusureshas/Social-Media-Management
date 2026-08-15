import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import cn from '../../utils/cn';

const icons = {
  account: (
    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  edit: (
    <path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  key: (
    <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.7 5.7L12 19l-2-2-2 2-2-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  shield: (
    <path d="M12 2l8 3.5v6c0 5.2-3.4 8.6-8 10.5-4.6-1.9-8-5.3-8-10.5v-6L12 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  lock: (
    <path d="M12 21s-7-3.5-7-9V6l7-3 7 3v6c0 5.5-7 9-7 9z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  report: (
    <path d="M3 3v18M3 5l15-1.5L16.5 9 18 18 3 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  dashboard: (
    <path d="M3 3h8v8H3V3zM13 3h8v5h-8V3zM13 10h8v11h-8V10zM3 13h8v8H3v-8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  ),
  users: (
    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM19 8v6M22 11h-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  ),
  posts: (
    <path d="M6 3h12a1 1 0 011 1v17l-7-4-7 4V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  ),
  stories: (
    <path d="M3 5h18v14H3V5zM8 9v6l5-3-5-3z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  reels: (
    <path d="M17 14.5l4-2.5-4-2.5v5zM3 5h14v14H3V5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  comments: (
    <path d="M21 12a8 8 0 01-11.6 7.1L4 21l1.5-4.2A8 8 0 1121 12zM8.5 12h.01M12 12h.01M15.5 12h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  hastags: (
    <path d="M9 3L7 21M17 3l-2 18M3.5 9h18M2.5 15h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  ),
  moderation: (
    <path d="M12 21a9 9 0 100-18 9 9 0 000 18zM9 12.5l2 2 4-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  keywords: (
    <path d="M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0L3 13V3h10l7.6 7.6a2 2 0 010 2.8zM7 7h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  broadcast: (
    <path d="M3 12a9 9 0 0118 0M7 12a5 5 0 0110 0M12 12h.01M10 19l2-3 2 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  audit: (
    <path d="M12 8v4l3 3M12 3a9 9 0 100 18 9 9 0 000-18z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  ),
  settings: (
    <path d="M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.6 1.6 0 00.3 1.7l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.6 1.6 0 00-2.7 1.1V21a2 2 0 11-4 0v-.2a1.6 1.6 0 00-2.7-1.1l-.1.1a2 2 0 11-2.8-2.8l.1-.1A1.6 1.6 0 004.6 15H4.4a2 2 0 110-4h.2A1.6 1.6 0 007.3 8.3l-.1-.1a2 2 0 112.8-2.8l.1.1A1.6 1.6 0 0012.8 8V4a2 2 0 014 0v.2a1.6 1.6 0 002.7 1.1l.1-.1a2 2 0 112.8 2.8l-.1.1A1.6 1.6 0 0019.4 13h.2a2 2 0 110 4h-.2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
  ),
};

const NavIcon = ({ name, className = 'h-[18px] w-[18px]' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    {icons[name]}
  </svg>
);

const generalNav = [
  { to: '/account', label: 'Account', icon: 'account' },
  { to: '/account/edit', label: 'Edit profile', icon: 'edit' },
  { to: '/change-password', label: 'Change password', icon: 'key' },
  { to: '/security', label: 'Security', icon: 'shield' },
  { to: '/privacy', label: 'Privacy', icon: 'lock' },
  { to: '/reports', label: 'My reports', icon: 'report' },
];

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { to: '/admin/users', label: 'Users', icon: 'users' },
  { to: '/admin/posts', label: 'Posts', icon: 'posts' },
  { to: '/admin/stories', label: 'Stories', icon: 'stories' },
  { to: '/admin/reels', label: 'Reels', icon: 'reels' },
  { to: '/admin/comments', label: 'Comments', icon: 'comments' },
  { to: '/admin/hashtags', label: 'Hashtags', icon: 'hastags' },
  { to: '/admin/reports', label: 'Moderation', icon: 'moderation' },
  { to: '/admin/keywords', label: 'Keywords', icon: 'keywords' },
];

const superAdminNav = [
  { to: '/admin/broadcast', label: 'Broadcast', icon: 'broadcast' },
  { to: '/admin/audit-logs', label: 'Audit logs', icon: 'audit' },
  { to: '/admin/settings', label: 'Settings', icon: 'settings' },
];

const NavItem = ({ to, label, icon, onClick }) => (
  <NavLink
    to={to}
    end={to === '/account'}
    onClick={onClick}
    className={({ isActive }) =>
      cn(
        'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
        isActive
          ? 'dash-nav-active text-white'
          : 'text-slate-500 hover:bg-white/[0.05] hover:text-white'
      )
    }
  >
    <span className="shrink-0 text-slate-400">
      <NavIcon name={icon} />
    </span>
    {label}
  </NavLink>
);

const Group = ({ title, items, onClick }) => (
  <div className="space-y-0.5">
    {title && (
      <p className="px-3 pb-1 pt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
        {title}
      </p>
    )}
    {items.map((item) => (
      <NavItem key={item.to} {...item} onClick={onClick} />
    ))}
  </div>
);

const SettingsNav = ({ onNavigate }) => {
  const { user } = useAuth();
  const role = user?.role;

  return (
    <nav className="space-y-1">
      <Group title="General" items={generalNav} onClick={onNavigate} />
      {['admin', 'superadmin'].includes(role) && (
        <Group title="Admin" items={adminNav} onClick={onNavigate} />
      )}
      {role === 'superadmin' && (
        <Group title="Superadmin" items={superAdminNav} onClick={onNavigate} />
      )}
    </nav>
  );
};

export default SettingsNav;