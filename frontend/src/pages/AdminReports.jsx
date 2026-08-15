import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  useGetAdminReportsQuery,
  useGetReportStatsQuery,
  useResolveReportMutation,
} from '../api/reportApi';
import { useAuth } from '../hooks/useAuth';
import { Avatar } from '../components/user/UserCard';
import Spinner from '../components/ui/Spinner';
import AuroraBackground from '../components/ui/AuroraBackground';
import { getApiErrorMessage } from '../utils/errorUtils';

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'dismissed', label: 'Dismissed' },
];

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-600',
  reviewing: 'bg-brand-100 text-brand-600',
  resolved: 'bg-emerald-100 text-emerald-600',
  dismissed: 'bg-slate-100 text-slate-500',
};

const REASON_LABELS = {
  spam: 'Spam',
  harassment: 'Harassment',
  hate_speech: 'Hate speech',
  violence: 'Violence',
  nudity: 'Nudity/sexual',
  false_info: 'Misinformation',
  scam: 'Scam/fraud',
  copyright: 'Copyright',
  other: 'Other',
};

const adminOnly = (user) => ['admin', 'superadmin'].includes(user?.role);

const AdminReports = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState('');
  const { data, isLoading } = useGetAdminReportsQuery({ status });
  const { data: statsData } = useGetReportStatsQuery();
  const [resolveReport, { isLoading: resolving }] = useResolveReportMutation();

  if (!adminOnly(user)) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <p className="font-display text-lg font-semibold text-slate-700">
          You don't have access to the moderation queue.
        </p>
      </div>
    );
  }

  const stats = statsData?.data?.stats || {};
  const reports = data?.data?.reports || [];

  const statCards = [
    { label: 'Pending', value: stats.pending ?? 0, color: 'text-amber-500' },
    { label: 'Reviewing', value: stats.reviewing ?? 0, color: 'text-brand-500' },
    { label: 'Resolved', value: stats.resolved ?? 0, color: 'text-emerald-500' },
    { label: 'Dismissed', value: stats.dismissed ?? 0, color: 'text-slate-500' },
    { label: 'Total', value: stats.total ?? 0, color: 'text-slate-700' },
  ];

  const handleTriage = async (report, nextStatus) => {
    const actionTaken =
      nextStatus === 'resolved'
        ? window.prompt('Action taken (e.g. blocked user, removed post):', '')
        : undefined;
    try {
      await resolveReport({
        id: report._id,
        body: { status: nextStatus, actionTaken: actionTaken || undefined },
      }).unwrap();
      toast.success(`Report marked as ${nextStatus}.`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not update the report.'));
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 pb-16">
      <AuroraBackground />
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Moderation queue</h1>
          <p className="mt-1 text-sm text-slate-500">Review and resolve reports submitted by users.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {statCards.map((s) => (
            <div key={s.label} className="glass-strong rounded-2xl p-4 text-center">
              <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatus(tab.value)}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all duration-300 ${
                status === tab.value
                  ? 'bg-gradient-to-r from-brand-500 to-fuchsia-500 text-white shadow-glow'
                  : 'bg-white/80 text-slate-500 ring-1 ring-slate-200 hover:text-brand-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : reports.length === 0 ? (
          <p className="rounded-2xl bg-white/60 p-6 text-center text-sm text-slate-500">
            No reports in this view.
          </p>
        ) : (
          <ul className="space-y-3">
            {reports.map((report) => (
              <li key={report._id} className="glass-strong rounded-3xl p-5 animate-fade-up">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-sm font-bold text-slate-900">
                        {REASON_LABELS[report.reason] || report.reason}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${STATUS_STYLES[report.status] || STATUS_STYLES.pending}`}
                      >
                        {report.status}
                      </span>
                      <span className="text-[11px] font-medium capitalize text-slate-400">
                        {report.targetType} · {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <Avatar user={report.reportedBy} size="sm" />
                      <div className="min-w-0">
                        {report.reportedBy?.username ? (
                          <Link
                            to={`/u/${report.reportedBy.username}`}
                            className="truncate text-xs font-bold text-slate-700 hover:text-brand-600"
                          >
                            Reported by @{report.reportedBy.username}
                          </Link>
                        ) : (
                          <p className="text-xs text-slate-400">Reported by unknown user</p>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-300">→</span>
                      <span className="truncate text-xs font-semibold text-slate-600">
                        {report.targetType} {String(report.targetId).slice(0, 8)}…
                      </span>
                    </div>

                    {report.description && (
                      <p className="mt-3 rounded-2xl bg-slate-50 px-4 py-2.5 text-sm text-slate-600">
                        {report.description}
                      </p>
                    )}

                    {report.actionTaken && (
                      <p className="mt-2 text-xs font-medium text-emerald-600">
                        Action: {report.actionTaken}
                      </p>
                    )}
                  </div>

                  {['pending', 'reviewing'].includes(report.status) && (
                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => handleTriage(report, 'resolved')}
                        disabled={resolving}
                        className="rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald-600"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => handleTriage(report, 'dismissed')}
                        disabled={resolving}
                        className="rounded-xl bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-300"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminReports;