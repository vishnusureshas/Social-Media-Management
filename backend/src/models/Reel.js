import mongoose from 'mongoose';

const reelSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    video: {
      url: { type: String, required: true },
      thumbnail: String,
    },
    caption: { type: String, trim: true, maxlength: 2200 },
    audio: {
      url: String,
      name: String,
      artist: String,
    },
    musicTrack: { type: mongoose.Schema.Types.ObjectId, ref: 'MusicTrack' },
    tags: [{ type: String, lowercase: true, trim: true }],
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    plays: { type: Number, default: 0 },
    durationSec: { type: Number, min: 0, max: 90 },
    isFlagged: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

reelSchema.index({ createdAt: -1, _id: -1 });
reelSchema.index({ views: -1, _id: -1 });

reelSchema.methods.toReelJSON = function () {
  return {
    _id: this._id,
    author: this.author,
    video: this.video,
    caption: this.caption,
    audio: this.audio,
    tags: this.tags,
    mentions: this.mentions,
    likesCount: this.likesCount,
    commentsCount: this.commentsCount,
    sharesCount: this.sharesCount,
    views: this.views,
    plays: this.plays,
    durationSec: this.durationSec,
    isFlagged: this.isFlagged,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Reel = mongoose.model('Reel', reelSchema);

export default Reel;
