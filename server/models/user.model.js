import mongoose from 'mongoose';

const userSchema = mongoose.Schema(
  {
    name: { type: String, trim: true,default:null },
    email: { type: String, trim: true,default:null },
    phone: { type: String, minlength: 10, maxlength: 10, default: null },
    password: { type: String, default: null },
    profile: { type: String, default: '' },
    status: { type: String, enum: ['active', 'inactive', 'block'], default: 'active' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    accessToken: { type: [String], default: [] },
    deviceToken: { type: [String], default: [] },
  },
  { versionKey: false, timestamps: true }
);

export default mongoose.model('users', userSchema);