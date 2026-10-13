import mongoose from 'mongoose';

const OtpSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true, index: true },
    otp: { type: Number, trim: true }
  },
  { versionKey: false, timestamps: true }
);

OtpSchema.index({ userId: 1 }, { unique: true });
OtpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });
export default mongoose.model('otps', OtpSchema);
