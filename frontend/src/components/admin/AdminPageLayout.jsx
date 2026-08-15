import AuroraBackground from '../ui/AuroraBackground';
import { Link } from 'react-router-dom';
import cn from '../../utils/cn';

const AdminPageLayout = ({ title, description, backTo = '/admin', children, wide = false }) => (
  <div className="mx-auto px-6 pb-16">
    <AuroraBackground />
    <div className={`space-y-6 ${wide ? 'max-w-6xl' : 'max-w-3xl'}`}>
      <div>
        <Link to={backTo} className="mb-2 inline-block text-xs font-bold uppercase tracking-widest text-brand-500 hover:text-brand-700">
          ← Admin
        </Link>
        <h1 className="font-display text-2xl font-bold text-slate-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {children}
    </div>
  </div>
);

export const StatCard = ({ label, value, color = 'text-slate-700' }) => (
  <div className="glass-strong rounded-2xl p-4 text-center">
    <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
    <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
  </div>
);

export const StatusTab = ({ value, current, onClick, label }) => (
  <button
    onClick={() => onClick(value)}
    className={cn(
      'rounded-full px-4 py-2 text-xs font-bold transition-all duration-300',
      current === value
        ? 'bg-gradient-to-r from-brand-500 to-fuchsia-500 text-white shadow-glow'
        : 'bg-white/80 text-slate-500 ring-1 ring-slate-200 hover:text-brand-600'
    )}
  >
    {label}
  </button>
);

export const EmptyState = ({ message }) => (
  <p className="rounded-2xl bg-white/60 p-8 text-center text-sm text-slate-500">{message}</p>
);

export const RoleBadge = ({ role }) => {
  const styles = {
    user: 'bg-slate-100 text-slate-600',
    admin: 'bg-brand-100 text-brand-600',
    superadmin: 'bg-fuchsia-100 text-fuchsia-600',
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${styles[role] || styles.user}`}>
      {role}
    </span>
  );
};

export const UserStatusBadge = ({ user }) => {
  if (user?.isBanned) return <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[11px] font-bold text-rose-600">Banned</span>;
  if (!user?.isActive) return <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-600">Inactive</span>;
  return <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600">Active</span>;
};

export const SectionCard = ({ title, children, className = '' }) => (
  <div className={`glass-strong rounded-3xl p-5 animate-fade-up ${className}`}>
    {title && <h2 className="font-display text-base font-bold text-slate-900">{title}</h2>}
    {children}
  </div>
);

export default AdminPageLayout;