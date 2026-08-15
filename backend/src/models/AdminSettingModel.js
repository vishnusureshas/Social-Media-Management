import mongoose from 'mongoose';

const adminSettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true, lowercase: true },
    value: { type: mongoose.Schema.Types.Mixed, default: null },
    label: { type: String, trim: true },
    description: { type: String, trim: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const AdminSetting = mongoose.model('AdminSetting', adminSettingSchema);

export default AdminSetting;