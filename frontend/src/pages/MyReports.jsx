import { Link } from 'react-router-dom';
import { useGetMyReportsQuery } from '../api/reportApi';
import { useAuth } from '../hooks/useAuth';
import Spinner from '../components/ui/Spinner';
import AuroraBackground from '../components/ui/AuroraBackground';

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

const MyReports = () => {
  const { user: me } = useAuth();
  const { data, isLoading, isError } = useGetMyReportsQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  const reports = data?.data?.reports || [];

  return (
    <div className="mx-auto max-w-2xl px-6 pb-16">
      <AuroraBackground />
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">My reports</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track the reports you've submitted, @{me?.username}.
          </p>
        </div>

        {isError ? (
          <p className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-600">
            Couldn't load your reports. Please try again.
          </p>
        ) : reports.length === 0 ? (
          <div className="glass-strong rounded-3xl p-10 text-center animate-fade-up">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-brand-500/15 to-fuchsia-500/15">
              <svg className="h-7 w-7 text-brand-500" viewBox="0 0 24 24" fill="none">
                <path d="M3 3v18M3 5l15-1.5L16.5 9 18 18 3 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 className="font-display text-lg font-bold text-slate-900">No reports yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
              When you report a post, profile, comment, reel or story it will show up here with its status.
            </p>
            <Link to="/feed" className="mt-5 inline-block text-sm font-bold text-brand-600 hover:underline">
              Browse the feed
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {reports.map((report) => (
              <li key={report._id} className="glass-strong rounded-3xl p-5 animate-fade-up">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-sm font-bold text-slate-900">
                      {REASON_LABELS[report.reason] || report.reason}
                    </p>
                    <p className="mt-1 text-xs font-medium capitalize text-slate-400">
                      {report.targetType} · ID {String(report.targetId).slice(0, 8)}…
                    </p>
                    {report.description && (
                      <p className="mt-2 text-sm text-slate-600">{report.description}</p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold capitalize ${STATUS_STYLES[report.status] || STATUS_STYLES.pending}`}
                  >
                    {report.status}
                  </span>
                </div>
                {report.actionTaken && report.status === 'resolved' && (
                  <p className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
                    Action taken: {report.actionTaken}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MyReports;