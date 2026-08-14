import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['image', 'video', 'audio'], required: true },
    public_id: String,
    url: { type: String, required: true },
    thumb: String,
    duration: Number,
  },
  { _id: false }
);

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, trim: true, maxlength: 10000 },
    media: [mediaSchema],
    tags: [{ type: String, lowercase: true, trim: true }],
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    location: String,
    visibility: {
      type: String,
      enum: ['public', 'followers', 'onlyme'],
      default: 'public',
    },
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    isFlagged: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    originalPost: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    poll: { type: mongoose.Schema.Types.ObjectId, ref: 'Poll' },
  },
  { timestamps: true }
);

postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ tags: 1, createdAt: -1 });
postSchema.index({ originalPost: 1 });

postSchema.methods.toPostJSON = function (viewerId = null) {
  return {
    _id: this._id,
    author: this.author,
    content: this.content,
    media: this.media,
    tags: this.tags,
    mentions: this.mentions,
    location: this.location,
    visibility: this.visibility,
    likesCount: this.likesCount,
    commentsCount: this.commentsCount,
    sharesCount: this.sharesCount,
    views: this.views,
    isPinned: this.isPinned,
    originalPost: this.originalPost,
    poll: this.poll,
    isLiked: viewerId
      ? (this._likedByViewer || false)
      : false,
    isSaved: viewerId
      ? (this._savedByViewer || false)
      : false,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Post = mongoose.model('Post', postSchema);

export default Post;