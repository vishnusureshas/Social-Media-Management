import mongoose from 'mongoose';

const muteSchema = new mongoose.Schema(
  {
    muter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    muted: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scope: { type: String, enum: ['feed', 'stories', 'notifications', 'all'], default: 'all' },
  },
  { timestamps: true }
);

muteSchema.index({ muter: 1, muted: 1, scope: 1 }, { unique: true });
muteSchema.index({ muted: 1, muter: 1 });

const Mute = mongoose.model('Mute', muteSchema);

export default Mute;