import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  useGetAdminSettingsQuery,
  useUpdateAdminSettingsMutation,
} from '../api/adminApi';
import AdminPageLayout, { SectionCard, EmptyState } from '../components/admin/AdminPageLayout';
import Spinner from '../components/ui/Spinner';
import { getApiErrorMessage } from '../utils/errorUtils';

const SETTING_FIELDS = [
  { key: 'maintenanceMode', label: 'Maintenance mode', type: 'boolean', hint: 'Show a maintenance banner / restrict access.' },
  { key: 'closedRegistration', label: 'Closed registration', type: 'boolean', hint: 'Block new sign-ups.' },
  { key: 'maxPostLength', label: 'Max post length', type: 'number', hint: 'Maximum characters in a post body.' },
  { key: 'maxReelSeconds', label: 'Max reel seconds', type: 'number', hint: 'Maximum duration of reels in seconds.' },
  { key: 'tosUrl', label: 'Terms of service URL', type: 'text', hint: 'Link shown to users.' },
  { key: 'bannerMessage', label: 'Banner message', type: 'text', hint: 'Announcement shown site-wide.' },
];

export const keyLabel = (key) => SETTING_FIELDS.find((f) => f.key === key)?.label || key;

const SettingsEditor = ({ settings }) => {
  const [form, setForm] = useState(() => {
    const next = {};
    SETTING_FIELDS.forEach(({ key, type }) => {
      next[key] = settings[key] ?? (type === 'boolean' ? false : '');
    });
    return next;
  });
  const [updateSettings, { isLoading: saving }] = useUpdateAdminSettingsMutation();

  const handleSave = async (e) => {
    e.preventDefault();
    const normalized = {};
    SETTING_FIELDS.forEach(({ key, type }) => {
      if (key in form) {
        const raw = form[key];
        normalized[key] = type === 'number' ? Number(raw) || 0 : type === 'boolean' ? Boolean(raw) : String(raw);
      }
    });
    try {
      await updateSettings(normalized).unwrap();
      toast.success('Settings saved.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Could not save settings.'));
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-5">
      <SectionCard title="Settings">
        {SETTING_FIELDS.map((field) => (
          <div key={field.key} className="mt-4 rounded-2xl bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-800">{field.label}</p>
                <p className="text-xs text-slate-400">{field.hint}</p>
              </div>
              {field.type === 'boolean' ? (
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={Boolean(form[field.key])}
                    onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.checked }))}
                    className="h-5 w-5 rounded accent-brand-500"
                  />
                  <span className="text-sm font-semibold text-slate-600">{form[field.key] ? 'On' : 'Off'}</span>
                </label>
              ) : (
                <input
                  type={field.type === 'number' ? 'number' : 'text'}
                  value={form[field.key] ?? ''}
                  onChange={(e) => setForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 outline-none transition-colors focus:border-brand-400 focus:ring-2 focus:ring-brand-100 sm:w-64"
                />
              )}
            </div>
          </div>
        ))}
        {SETTING_FIELDS.length === 0 && <EmptyState message="No editable settings." />}
        <button type="submit" disabled={saving} className="btn-gradient mt-5 rounded-xl px-6 py-2.5 text-sm font-bold text-white disabled:opacity-60">
          {saving ? 'Saving…' : 'Save settings'}
        </button>
      </SectionCard>
    </form>
  );
};

const AdminSettings = () => {
  const { data, isLoading } = useGetAdminSettingsQuery();
  const settings = data?.data?.settings || {};

  return (
    <AdminPageLayout title="Site settings" description="Platform-wide configuration (superadmin only)." wide>
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : (
        <SettingsEditor settings={settings} />
      )}
    </AdminPageLayout>
  );
};

export default AdminSettings;