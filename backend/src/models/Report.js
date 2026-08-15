import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: {
      type: String,
      enum: ['user', 'post', 'comment', 'reel', 'story', 'message'],
      required: true,
    },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    reason: {
      type: String,
      enum: ['spam', 'harassment', 'hate_speech', 'violence', 'nudity', 'false_info', 'scam', 'copyright', 'other'],
      required: true,
    },
    description: { type: String, trim: true, maxlength: 1000 },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'resolved', 'dismissed'],
      default: 'pending',
    },
    actionTaken: String,
    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ reportedBy: 1, createdAt: -1 });
reportSchema.index({ targetType: 1, targetId: 1 });

const Report = mongoose.model('Report', reportSchema);

export default Report;