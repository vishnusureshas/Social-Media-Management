import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 100 },
    votes: { type: Number, default: 0 },
    voters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { _id: true }
);

const pollSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    question: { type: String, required: true, trim: true, maxlength: 300 },
    options: {
      type: [optionSchema],
      validate: [(val) => val.length >= 2 && val.length <= 5, 'Poll must have between 2 and 5 options'],
    },
    totalVotes: { type: Number, default: 0 },
    voters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);

pollSchema.index({ post: 1 }, { unique: true });
pollSchema.index({ expiresAt: 1 });

const Poll = mongoose.model('Poll', pollSchema);

export default Poll;