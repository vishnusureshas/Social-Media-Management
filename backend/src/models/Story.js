import mongoose from 'mongoose';

const STORY_TTL_HOURS = 24;

const storySchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    media: [
      {
        url: { type: String, required: true },
        mediaType: { type: String, enum: ['image', 'video'], required: true },
        thumb: String,
      },
    ],
    bgColor: String,
    text: { type: String, trim: true, maxlength: 500 },
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    tags: [{ type: String, lowercase: true, trim: true }],
    viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    viewCount: { type: Number, default: 0 },
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    isActive: { type: Boolean, default: true },
    isFlagged: { type: Boolean, default: false },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + STORY_TTL_HOURS * 60 * 60 * 1000),
    },
  },
  { timestamps: true }
);

storySchema.index({ author: 1, createdAt: -1 });
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

storySchema.methods.toStoryJSON = function () {
  return {
    _id: this._id,
    author: this.author,
    media: this.media,
    bgColor: this.bgColor,
    text: this.text,
    mentions: this.mentions,
    tags: this.tags,
    viewCount: this.viewCount,
    isActive: this.isActive,
    isFlagged: this.isFlagged,
    expiresAt: this.expiresAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Story = mongoose.model('Story', storySchema);

export default Story;