import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true, index: true },
    productId: { type: String, required: true },
    variantId: { type: String, default: '' },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number, default: 0 },
    image: { type: String, default: '' },
    category: { type: String, default: '' },
    size: { type: String, default: 'Standard', trim: true },
    color: { type: String, default: '', trim: true, lowercase: true },
    quantity: { type: Number, default: 1, min: 1 },
  },
  { versionKey: false, timestamps: true }
);

// One entry per selected product, colour, and size for a user.
cartItemSchema.index({ userId: 1, productId: 1, size: 1, color: 1 }, { unique: true });

export default mongoose.model('carts', cartItemSchema);
