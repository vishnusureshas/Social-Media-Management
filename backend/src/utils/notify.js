import Notification from '../models/Notification.js';

const NOTIFY_TYPES = [
  'like',
  'reaction',
  'comment',
  'follow',
  'mention',
  'share',
  'message',
  'story_reply',
  'report_resolved',
  'admin_notice',
  'broadcast',
];

export const notifyOne = async ({ recipient, type, actor, targetType, targetId, targetModel, message }) => {
  if (!recipient || !actor || String(recipient) === String(actor)) return null;
  if (!NOTIFY_TYPES.includes(type)) return null;

  try {
    return await Notification.create({
      recipient,
      type,
      actor,
      targetType: targetType || 'post',
      targetId,
      targetModel,
      message,
    });
  } catch (err) {
    console.error('[notify] failed to create notification ::', err.message);
    return null;
  }
};

export const notifyMany = async ({ recipients, ...rest }) => {
  if (!Array.isArray(recipients) || recipients.length === 0) return;
  const unique = [...new Set(recipients.map((r) => String(r))).values()];
  await Promise.all(
    unique.map((recipient) => notifyOne({ recipient, ...rest }))
  );
};

export { NOTIFY_TYPES };