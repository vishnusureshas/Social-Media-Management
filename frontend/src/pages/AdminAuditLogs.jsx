import { useState } from 'react';
import { useGetAuditLogsQuery } from '../api/adminApi';
import AdminPageLayout, { EmptyState, RoleBadge } from '../components/admin/AdminPageLayout';
import Spinner from '../components/ui/Spinner';

const ACTION_LABELS = {
  admin_login: 'Admin login',
  ban_user: 'Ban user',
  unban_user: 'Unban user',
  activate_user: 'Activate user',
  deactivate_user: 'Deactivate user',
  change_role: 'Change role',
  delete_user: 'Delete user',
  delete_post: 'Delete post',
  restore_post: 'Restore post',
  pin_post: 'Pin post',
  unpin_post: 'Unpin post',
  delete_story: 'Delete story',
  delete_reel: 'Delete reel',
  delete_comment: 'Delete comment',
  resolve_report: 'Resolve report',
  dismiss_report: 'Dismiss report',
  add_keyword: 'Add keyword',
  remove_keyword: 'Remove keyword',
  broadcast: 'Broadcast',
  update_settings: 'Update settings',
};

const ACTIONS = [
  '',
  'admin_login',
  'ban_user',
  'unban_user',
  'delete_user',
  'change_role',
  'delete_post',
  'pin_post',
  'delete_story',
  'delete_reel',
  'delete_comment',
  'resolve_report',
  'add_keyword',
  'broadcast',
  'update_settings',
];

const AdminAuditLogs = () => {
  const [action, setAction] = useState('');
  const { data, isLoading } = useGetAuditLogsQuery({ action });

  const logs = data?.data?.logs || [];

  return (
    <AdminPageLayout title="Audit logs" description="Every admin action, recorded." wide>
      <div className="flex flex-wrap gap-2">
        <select
          value={action}
          onChange={(e) => setAction(e.target.value)}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none transition-colors focus:border-brand-400"
        >
          <option value="">All actions</option>
          {ACTIONS.filter(Boolean).map((a) => (
            <option key={a} value={a}>{ACTION_LABELS[a] || a}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : logs.length === 0 ? (
        <EmptyState message="No audit log entries yet." />
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log._id} className="glass-strong animate-fade-up flex flex-wrap items-center gap-3 rounded-2xl px-4 py-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-fuchsia-500 text-xs font-bold text-white">
                {(log.admin?.username || 'A')[0].toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800">
                  {ACTION_LABELS[log.action] || log.action}
                  <span className="ml-2 text-xs font-semibold capitalize text-slate-400">
                    {log.targetType}
                    {log.metadata?.username ? ` @${log.metadata.username}` : ''}
                  </span>
                </p>
                <p className="text-xs text-slate-400">
                  By @{log.admin?.username || 'unknown'} · {new Date(log.createdAt).toLocaleString()}
                  {log.ip ? ` · ${log.ip}` : ''}
                </p>
              </div>
              <RoleBadge role={log.admin?.role} />
            </div>
          ))}
        </div>
      )}
    </AdminPageLayout>
  );
};

export default AdminAuditLogs;