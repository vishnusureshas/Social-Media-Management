import mongoose from 'mongoose';

const moderationKeywordSchema = new mongoose.Schema(
  {
    keyword: {
      type: String,
      required: [true, 'Keyword is required'],
      trim: true,
      lowercase: true,
      unique: true,
      maxlength: 50,
    },
    isActive: { type: Boolean, default: true },
    matchType: { type: String, enum: ['exact', 'includes'], default: 'includes' },
  },
  { timestamps: true }
);

const ModerationKeyword = mongoose.model('ModerationKeyword', moderationKeywordSchema);

export default ModerationKeyword;