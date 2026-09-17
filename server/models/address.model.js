import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true, index: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    locality: { type: String, default: '' },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
    label: { type: String, default: 'Home', enum: ['Home', 'Work', 'Other'] },
  },
  { versionKey: false, timestamps: true }
);

export default mongoose.model('addresses', addressSchema);
