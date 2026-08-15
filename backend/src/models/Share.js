import mongoose from 'mongoose';

const shareSchema = new mongoose.Schema(
  {
    sharer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['reel', 'post'], default: 'reel' },
    targetId: { type: mongoose.Schema.Types.ObjectId, refPath: 'targetModel', required: true },
    targetModel: { type: String, enum: ['Reel', 'Post'], default: 'Reel' },
    isRead: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

shareSchema.index({ recipient: 1, createdAt: -1 });
shareSchema.index({ sharer: 1, targetId: 1, recipient: 1 }, { unique: true });
shareSchema.index({ recipient: 1, isRead: 1 });

const Share = mongoose.model('Share', shareSchema);

export default Share;