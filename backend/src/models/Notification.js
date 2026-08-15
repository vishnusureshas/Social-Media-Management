import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: [
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
      ],
      required: true,
    },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    targetType: { type: String, enum: ['post', 'reel', 'story', 'comment'], default: 'post' },
    targetId: { type: mongoose.Schema.Types.ObjectId, refPath: 'targetModel' },
    targetModel: { type: String, enum: ['Post', 'Reel', 'Story', 'Comment'], default: 'Post' },
    message: { type: String, trim: true, maxlength: 280 },
    read: { type: Boolean, default: false },
    seenAt: { type: Date },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;