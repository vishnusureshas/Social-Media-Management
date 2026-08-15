import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  useGetAdminUsersQuery,
  useUpdateUserStatusMutation,
  useUpdateUserRoleMutation,
  useDeleteAdminUserMutation,
} from '../api/adminApi';
import { useAuth } from '../hooks/useAuth';
import AdminPageLayout, { RoleBadge, UserStatusBadge, EmptyState, StatusTab } from '../components/admin/AdminPageLayout';
import Spinner from '../components/ui/Spinner';
import { Avatar } from '../components/user/UserCard';
import { getApiErrorMessage } from '../utils/errorUtils';

const ROLE_TABS = [
  { value: '', label: 'All roles' },
  { value: 'user', label: 'Users' },
  { value: 'admin', label: 'Admins' },
  { value: 'superadmin', label: 'Superadmins' },
];

const STATUS_TABS = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'banned', label: 'Banned' },
  { value: 'deactivated', label: 'Deactivated' },
];

const AdminUsers = () => {
  const { user } = useAuth();
  const [q, setQ] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [applied, setApplied] = useState({});

  const { data, isLoading } = useGetAdminUsersQuery({ q: applied.q, role: applied.role, status: applied.status });
  const [updateStatus, { isLoading: savingStatus }] = useUpdateUserStatusMutation();
  const [updateRole, { isLoading: savingRole }] = useUpdateUserRoleMutation();
  const [deleteUser, { isLoading: deleting }] = useDeleteAdminUserMutation();

  const users = data?.data?.users || [];
  const pagination = data?.data?.pagination || {};
  const canChangeRole = user?.role === 'superadmin';

  const applyFilters = (e) => {
    e.preventDefault();
    setApplied({ q: q.trim() || undefined, role, status });
  };

  const handleStatus = async (target, nextStatus) => {
    const reason =
      nextStatus === 'ban' ? window.prompt('Ban reason (optional):', '') ?? '' : undefined;
    try {
      await updateStatus({ id: target._id, body: { status: nextStatus, reason } }).unwrap();
      toast.success(`@${target.username} ${nextStatus}ned.`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not update user.'));
    }
  };

  const handleRole = async (target) => {
    const next = window.prompt('New role (user / admin / superadmin):', target.role);
    if (!next || !['user', 'admin', 'superadmin'].includes(next.trim())) return;
    try {
      await updateRole({ id: target._id, body: { role: next.trim() } }).unwrap();
      toast.success(`Role updated to ${next.trim()}.`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not change role.'));
    }
  };

  const handleDelete = async (target) => {
    if (!window.confirm(`Delete @${target.username} and ALL their content? This cannot be undone.`)) return;
    try {
      await deleteUser(target._id).unwrap();
      toast.success(`@${target.username} deleted.`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not delete user.'));
    }
  };

  return (
    <AdminPageLayout title="Manage users" description="Search, moderate, and manage accounts." wide>
      <form onSubmit={applyFilters} className="glass-strong flex flex-col gap-3 rounded-3xl p-4 sm:flex-row">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search username, name or email…"
          className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none transition-colors focus:border-brand-400"
        >
          {ROLE_TABS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none transition-colors focus:border-brand-400"
        >
          {STATUS_TABS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button type="submit" className="btn-gradient rounded-xl px-6 py-2.5 text-sm font-bold text-white">
          Apply
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {STATUS_TABS.map((tab) => (
          <StatusTab key={tab.value} label={tab.label} value={tab.value} current={applied.status || ''} onClick={(v) => {
            setStatus(v);
            setApplied((prev) => ({ ...prev, status: v }));
          }} />
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : users.length === 0 ? (
        <EmptyState message="No users match these filters." />
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div key={u._id} className="glass-strong animate-fade-up rounded-3xl p-4">
              <div className="flex flex-wrap items-center gap-3">
                <Avatar user={u} size="sm" />
                <div className="min-w-0 flex-1">
                  <Link to={`/u/${u.username}`} className="truncate text-sm font-bold text-slate-800 hover:text-brand-600">
                    {u.fullName || u.username}
                    {u.verified && <span className="ml-1 text-sky-500">✓</span>}
                  </Link>
                  <p className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    @{u.username} · {u.emailVerified ? 'email verified' : 'email unverified'} · joined {new Date(u.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <RoleBadge role={u.role} />
                  <UserStatusBadge user={u} />
                </div>
                <div className="flex w-full flex-wrap justify-end gap-2 sm:w-auto">
                  {u.isBanned ? (
                    <button onClick={() => handleStatus(u, 'unban')} disabled={savingStatus} className="rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald-600 disabled:opacity-50">
                      Unban
                    </button>
                  ) : (
                    <button onClick={() => handleStatus(u, 'ban')} disabled={savingStatus} className="rounded-xl bg-rose-500 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-rose-600 disabled:opacity-50">
                      Ban
                    </button>
                  )}
                  {!u.isActive ? (
                    <button onClick={() => handleStatus(u, 'activate')} disabled={savingStatus} className="rounded-xl bg-brand-500 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-brand-600 disabled:opacity-50">
                      Activate
                    </button>
                  ) : (
                    <button onClick={() => handleStatus(u, 'deactivate')} disabled={savingStatus} className="rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-amber-600 disabled:opacity-50">
                      Deactivate
                    </button>
                  )}
                  {canChangeRole && (
                    <button onClick={() => handleRole(u)} disabled={savingRole} className="rounded-xl bg-slate-800 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-slate-900 disabled:opacity-50">
                      Change role
                    </button>
                  )}
                  <button onClick={() => handleDelete(u)} disabled={deleting} className="rounded-xl bg-rose-100 px-3 py-1.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-200 disabled:opacity-50">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {pagination.total > (pagination.limit || 20) && (
            <p className="text-center text-xs font-semibold text-slate-400">
              Showing {pagination.page || 1} of {pagination.pages || 1} pages · {pagination.total} users
            </p>
          )}
        </div>
      )}
    </AdminPageLayout>
  );
};

export default AdminUsers;