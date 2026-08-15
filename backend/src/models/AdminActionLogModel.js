import mongoose from 'mongoose';

const adminActionLogSchema = new mongoose.Schema(
  {
    admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: {
      type: String,
      enum: [
        'admin_login',
        'ban_user',
        'unban_user',
        'activate_user',
        'deactivate_user',
        'change_role',
        'delete_user',
        'delete_post',
        'restore_post',
        'pin_post',
        'unpin_post',
        'delete_story',
        'delete_reel',
        'delete_comment',
        'resolve_report',
        'dismiss_report',
        'add_keyword',
        'remove_keyword',
        'broadcast',
        'update_settings',
      ],
      required: true,
    },
    targetType: {
      type: String,
      enum: ['user', 'post', 'story', 'reel', 'comment', 'report', 'keyword', 'system'],
      default: 'system',
    },
    targetId: mongoose.Schema.Types.ObjectId,
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
    ip: String,
  },
  { timestamps: true }
);

adminActionLogSchema.index({ admin: 1, createdAt: -1 });
adminActionLogSchema.index({ action: 1, createdAt: -1 });
adminActionLogSchema.index({ targetType: 1, targetId: 1 });

const AdminActionLog = mongoose.model('AdminActionLog', adminActionLogSchema);

export default AdminActionLog;