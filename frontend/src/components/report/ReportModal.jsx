import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCreateReportMutation } from '../../api/reportApi';
import Button from '../ui/Button';
import { getApiErrorMessage } from '../../utils/errorUtils';

const REASONS = [
  { value: 'spam', label: 'Spam', desc: 'Unsolicited or repetitive content' },
  { value: 'harassment', label: 'Harassment', desc: 'Bullying or targeted abuse' },
  { value: 'hate_speech', label: 'Hate speech', desc: 'Attacks a group or identity' },
  { value: 'violence', label: 'Violence', desc: 'Threats or dangerous content' },
  { value: 'nudity', label: 'Nudity/sexual', desc: 'Adult or explicit material' },
  { value: 'false_info', label: 'Misinformation', desc: 'False or misleading claims' },
  { value: 'scam', label: 'Scam/fraud', desc: 'Deceptive or scam behaviour' },
  { value: 'copyright', label: 'Copyright', desc: 'Infringes copyright' },
  { value: 'other', label: 'Other', desc: 'Something else' },
];

const ReportModal = ({ open, onClose, targetType, targetId }) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [createReport, { isLoading }] = useCreateReportMutation();

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      toast.error('Please select a reason.');
      return;
    }
    try {
      await createReport({
        targetType,
        targetId,
        reason,
        description: description.trim() || undefined,
      }).unwrap();
      toast.success('Report submitted. Our team will review it shortly.');
      setReason('');
      setDescription('');
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not submit the report.'));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md overflow-hidden rounded-3xl border border-white/[0.12] bg-[#0b0f26] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.95)] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4">
          <div>
            <h3 className="font-display text-lg font-bold text-white">Report content</h3>
            <p className="text-xs text-slate-500">Help keep Vibely safe. Reports are reviewed by our team.</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-sm font-bold text-slate-400 hover:bg-white/[0.12] hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[50vh] overflow-y-auto px-6 py-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Why are you reporting this?</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {REASONS.map((r) => (
                <button
                  type="button"
                  key={r.value}
                  onClick={() => setReason(r.value)}
                  className={`rounded-2xl border p-3 text-left transition-all duration-200 ${
                    reason === r.value
                      ? 'border-violet-400/60 bg-violet-500/15 ring-2 ring-violet-400/30'
                      : 'border-white/[0.12] bg-white/[0.04] hover:border-violet-400/40'
                  }`}
                >
                  <span className="block text-sm font-bold text-slate-100">{r.label}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-slate-500">{r.desc}</span>
                </button>
              ))}
            </div>

            <label className="mt-5 block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                Add details <span className="font-normal normal-case text-slate-600">(optional)</span>
              </span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="Tell us more about the issue…"
                className="w-full resize-none rounded-2xl border border-white/[0.12] bg-white/[0.05] px-4 py-3 text-sm text-slate-100 outline-none transition-colors placeholder:text-slate-600 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20"
              />
            </label>
          </div>

          <div className="flex justify-end gap-3 border-t border-white/[0.08] px-6 py-4">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" variant="danger" loading={isLoading}>
              Submit report
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;