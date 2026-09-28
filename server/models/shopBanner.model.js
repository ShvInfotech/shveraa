import mongoose from 'mongoose';

const shopBannerSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: '' },
    subtitle: { type: String, trim: true, default: '' },
    category: { type: String, required: true, trim: true, lowercase: true, default: 'all' },
    image: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model('ShopBanner', shopBannerSchema);
