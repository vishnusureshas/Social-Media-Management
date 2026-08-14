import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    targetType: { type: String, enum: ['post', 'reel'], default: 'post' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
    content: { type: String, trim: true, required: [true, 'Comment cannot be empty'], maxlength: 2000 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

commentSchema.index({ post: 1, parent: 1, createdAt: -1 });
commentSchema.index({ parent: 1, createdAt: -1 });

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;