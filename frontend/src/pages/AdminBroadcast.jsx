import { useState } from 'react';
import toast from 'react-hot-toast';
import { useBroadcastNotificationMutation } from '../api/adminApi';
import AdminPageLayout, { SectionCard } from '../components/admin/AdminPageLayout';
import { getApiErrorMessage } from '../utils/errorUtils';

const AdminBroadcast = () => {
  const [message, setMessage] = useState('');
  const [typeName, setTypeName] = useState('broadcast');
  const [recipients, setRecipients] = useState('');
  const [broadcast, { isLoading }] = useBroadcastNotificationMutation();

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Enter a message to broadcast.');
      return;
    }
    const recipientIds = recipients
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      const res = await broadcast({
        message: message.trim(),
        type: typeName,
        ...(recipientIds.length > 0 ? { recipients: recipientIds } : {}),
      }).unwrap();
      toast.success(res?.message || 'Broadcast sent.');
      setMessage('');
      setRecipients('');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not send broadcast.'));
    }
  };

  return (
    <AdminPageLayout title="Broadcast notification" description="Send a platform-wide notification.">
      <form onSubmit={handleSend} className="space-y-5">
        <SectionCard title="Compose message">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="e.g. We're running maintenance at 11 PM — the app may be briefly unavailable."
            className="mt-4 w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-500">Notification type</label>
              <select
                value={typeName}
                onChange={(e) => setTypeName(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 outline-none transition-colors focus:border-brand-400"
              >
                <option value="broadcast">Broadcast</option>
                <option value="admin_notice">Admin notice</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-500">
                Recipients <span className="font-normal text-slate-400">(blank = all active users)</span>
              </label>
              <input
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                placeholder="user id, user id… (optional)"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-300 focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-gradient mt-5 rounded-xl px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {isLoading ? 'Sending…' : 'Send broadcast'}
          </button>
        </SectionCard>
      </form>
    </AdminPageLayout>
  );
};

export default AdminBroadcast;