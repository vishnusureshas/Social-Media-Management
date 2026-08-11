import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: [true, 'Username is required'],
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [20, 'Username must be at most 20 characters'],
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'],
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: [true, 'Email is required'],
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    fullName: { type: String, trim: true, maxlength: 50 },
    bio: { type: String, trim: true, maxlength: 160 },
    avatar: String,
    coverPhoto: String,
    verified: { type: Boolean, default: false },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'] },
    dob: Date,
    location: String,
    website: String,
    role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
    isActive: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },
    banReason: String,
    privacy: {
      postsVisibleTo: { type: String, enum: ['public', 'followers', 'onlyme'], default: 'public' },
      messages: { type: String, enum: ['everyone', 'followers', 'nobody'], default: 'everyone' },
    },
    emailVerified: { type: Boolean, default: false },
    otp: {
      code: String,
      purpose: { type: String, enum: ['verify_email', 'reset_password', 'login'] },
      expiresAt: Date,
    },
    twoFA: {
      enabled: { type: Boolean, default: false },
      secret: String,
      backupCodes: [String],
    },
    counts: {
      posts: { type: Number, default: 0 },
      stories: { type: Number, default: 0 },
      followers: { type: Number, default: 0 },
      following: { type: Number, default: 0 },
    },
    lastSeen: Date,
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toProfileJSON = function () {
  return {
    _id: this._id,
    username: this.username,
    fullName: this.fullName,
    avatar: this.avatar,
    coverPhoto: this.coverPhoto,
    bio: this.bio,
    verified: this.verified,
    role: this.role,
    location: this.location,
    website: this.website,
    privacy: this.privacy,
    counts: this.counts,
    emailVerified: this.emailVerified,
    createdAt: this.createdAt,
  };
};

const User = mongoose.model('User', userSchema);

export default User;