import { useState } from 'react';
import ReportModal from './ReportModal';

const ReportButton = ({ targetType, targetId, className = '' }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition-colors hover:text-rose-500 ${className}`}
        title="Report"
        aria-label="Report this content"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
          <path d="M3 3v18M3 5l15-1.5L16.5 9 18 18 3 16M3 11l15-1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Report
      </button>
      <ReportModal
        open={open}
        onClose={() => setOpen(false)}
        targetType={targetType}
        targetId={targetId}
      />
    </>
  );
};

export default ReportButton;