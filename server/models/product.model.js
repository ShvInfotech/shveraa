import mongoose from 'mongoose';

const variantSizeSchema = new mongoose.Schema({
  size: { type: String, required: true },
  sku: { type: String, default: '' },
  price: { type: Number, required: true },
  stock: { type: Number, default: 0 },
});

const variantSchema = new mongoose.Schema({
  color: { type: String, required: true },
  images: [{ type: String }],
  sizes: [variantSizeSchema],
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    originalPrice: { type: Number, default: 0 },
    category: { type: String, required: true }, // slug or category ID
    material: { type: String, default: '925 Sterling Silver' },
    stone: { type: String, default: 'AAAAA Cubic Zirconia' },
    finish: { type: String, default: 'Mirror Rhodium Polish' },
    badge: { type: String, default: '' },
    images: [{ type: String }], // Main images array
    featured: { type: Boolean, default: false },
    bestseller: { type: Boolean, default: false },
    inStock: { type: Boolean, default: true },
    rating: { type: Number, default: 4.8 },
    reviewsCount: { type: Number, default: 12 },
    variants: [variantSchema],
  },
  { timestamps: true }
);

export default mongoose.model('V1Product', productSchema);
