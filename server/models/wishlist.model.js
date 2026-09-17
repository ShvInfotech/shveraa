import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true, index: true },
    productId: { type: String, required: true },
  },
  { versionKey: false, timestamps: true }
);

wishlistSchema.index({ userId: 1, productId: 1 }, { unique: true });

export default mongoose.model('wishlists', wishlistSchema);
