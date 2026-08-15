import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  useGetBlockedQuery,
  useUnblockUserMutation,
  useGetMutedQuery,
  useUnmuteUserMutation,
  useUpdatePrivacySettingsMutation,
} from '../api/privacyApi';
import { useAuth } from '../hooks/useAuth';
import { Avatar } from '../components/user/UserCard';
import Button from '../components/ui/Button';
import AuroraBackground from '../components/ui/AuroraBackground';

const SectionCard = ({ title, subtitle, children }) => (
  <div className="glass-strong rounded-3xl p-6 animate-fade-up">
    <h2 className="font-display text-lg font-bold text-slate-900">{title}</h2>
    {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    <div className="mt-4">{children}</div>
  </div>
);

const toggle = (options, value, onChange) =>
  options.map((opt) => ({ ...opt, active: opt.value === value, onClick: () => onChange(opt.value) }));

const PrivacySettings = () => {
  const { user: me } = useAuth();
  const [postsVisibleTo, setPostsVisibleTo] = useState(me?.privacy?.postsVisibleTo || 'public');
  const [messages, setMessages] = useState(me?.privacy?.messages || 'everyone');
  const [saving, setSaving] = useState(false);

  const { data: blockedData } = useGetBlockedQuery();
  const [unblock] = useUnblockUserMutation();
  const { data: mutedData } = useGetMutedQuery();
  const [unmute] = useUnmuteUserMutation();
  const [updateSettings] = useUpdatePrivacySettingsMutation();

  const blocked = blockedData?.data?.users || [];
  const muted = mutedData?.data?.users || [];

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateSettings({ postsVisibleTo, messages }).unwrap();
      toast.success(res?.message || 'Privacy settings saved');
    } catch (err) {
      toast.error(err?.data?.message || 'Could not save privacy settings');
    } finally {
      setSaving(false);
    }
  };

  const handleUnblock = async (id, username) => {
    try {
      await unblock(id).unwrap();
      toast.success(`@${username} has been unblocked`);
    } catch (err) {
      toast.error(err?.data?.message || 'Could not unblock user');
    }
  };

  const handleUnmute = async (id, username) => {
    try {
      await unmute(id).unwrap();
      toast.success(`@${username} has been unmuted`);
    } catch (err) {
      toast.error(err?.data?.message || 'Could not unmute user');
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 pb-16">
      <AuroraBackground />
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">Privacy</h1>
          <p className="mt-1 text-sm text-slate-500">
            Control who can see your content and reach you on Nexus.
          </p>
        </div>

        <SectionCard
          title="Content visibility"
          subtitle="Who can see posts you create on your profile."
        >
          <div className="flex flex-wrap gap-3">
            {toggle(
              [
                { value: 'public', label: 'Public' },
                { value: 'followers', label: 'Followers only' },
                { value: 'onlyme', label: 'Only me' },
              ],
              postsVisibleTo,
              setPostsVisibleTo
            ).map((opt) => (
              <button
                key={opt.value}
                onClick={opt.onClick}
                className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                  opt.active
                    ? 'bg-gradient-to-r from-brand-500 to-fuchsia-500 text-white shadow-glow'
                    : 'bg-white/80 text-slate-600 ring-1 ring-slate-200 hover:text-brand-600'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="mt-6 border-t border-slate-200 pt-4">
            <p className="mb-3 text-sm font-semibold text-slate-600">Message policy</p>
            <div className="flex flex-wrap gap-3">
              {toggle(
                [
                  { value: 'everyone', label: 'Everyone' },
                  { value: 'followers', label: 'Followers' },
                  { value: 'nobody', label: 'Nobody' },
                ],
                messages,
                setMessages
              ).map((opt) => (
                <button
                  key={opt.value}
                  onClick={opt.onClick}
                  className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                    opt.active
                      ? 'bg-gradient-to-r from-brand-500 to-fuchsia-500 text-white shadow-glow'
                      : 'bg-white/80 text-slate-600 ring-1 ring-slate-200 hover:text-brand-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} loading={saving}>
              Save changes
            </Button>
          </div>
        </SectionCard>

        <SectionCard
          title="Blocked users"
          subtitle="Blocked users can't see your posts or message you."
        >
          {blocked.length === 0 ? (
            <p className="rounded-2xl bg-white/60 p-4 text-sm text-slate-500">
              No blocked users.
            </p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {blocked.map((u) => (
                <li key={u._id} className="flex items-center gap-3 py-3">
                  <Avatar user={u} size="sm" />
                  <div className="min-w-0 flex-1">
                    <Link to={`/u/${u.username}`} className="truncate font-semibold text-slate-800 hover:text-brand-600">
                      @{u.username}
                    </Link>
                    {u.fullName && <p className="truncate text-xs text-slate-400">{u.fullName}</p>}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleUnblock(u._id, u.username)}>
                    Unblock
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Muted users"
          subtitle="Muted users' posts and notifications are hidden from you."
        >
          {muted.length === 0 ? (
            <p className="rounded-2xl bg-white/60 p-4 text-sm text-slate-500">No muted users.</p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {muted.map(({ user: u, scope }) => (
                <li key={u._id} className="flex items-center gap-3 py-3">
                  <Avatar user={u} size="sm" />
                  <div className="min-w-0 flex-1">
                    <Link to={`/u/${u.username}`} className="truncate font-semibold text-slate-800 hover:text-brand-600">
                      @{u.username}
                    </Link>
                    <p className="text-xs capitalize text-slate-400">Muted · {scope}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleUnmute(u._id, u.username)}>
                    Unmute
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <div className="text-center text-xs text-slate-400">
          To block or mute someone, visit their profile and use the actions menu.
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;