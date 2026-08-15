import AdminActionLog from '../models/AdminActionLogModel.js';

export const logAdminAction = async ({ admin, action, targetType = 'system', targetId = null, metadata = {}, ip = null }) => {
  try {
    await AdminActionLog.create({ admin, action, targetType, targetId, metadata, ip });
  } catch (err) {
    console.error('[admin-audit] failed to log action ::', err.message);
  }
};

export default logAdminAction;