import mongoose from 'mongoose';

const securityLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: {
      type: String,
      enum: [
        'login',
        'login_failed',
        '2fa_setup',
        '2fa_enabled',
        '2fa_disabled',
        '2fa_login',
        'password_changed',
        'logout',
        'session_revoked',
        'session_revoked_self',
      ],
      required: true,
    },
    ip: String,
    device: String,
    success: { type: Boolean, default: true },
  },
  { timestamps: true }
);

securityLogSchema.index({ user: 1, createdAt: -1 });

const SecurityLog = mongoose.model('SecurityLog', securityLogSchema);

export default SecurityLog;