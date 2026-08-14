import mongoose from 'mongoose';

const reactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['post', 'comment', 'reel', 'story'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    emoji: { type: String, enum: ['like', 'love', 'haha', 'wow', 'sad', 'angry'], required: true },
  },
  { timestamps: true }
);

reactionSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });
reactionSchema.index({ targetType: 1, targetId: 1, emoji: 1 });

const Reaction = mongoose.model('Reaction', reactionSchema);

export default Reaction;