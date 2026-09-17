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

const packingSchema = new mongoose.Schema(
  {
    length: { type: Number, min: 0, default: 0 },
    height: { type: Number, min: 0, default: 0 },
    width: { type: Number, min: 0, default: 0 },
    weight: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    originalPrice: { type: Number, default: 0 },
    category: { type: String, required: true }, // slug or category ID
    sku: { type: String, default: '', trim: true },
    collection: { type: String, default: '', trim: true },
    makingCharges: { type: Number, default: 0, min: 0 },
    material: { type: String, default: '925 Sterling Silver' },
    metalType: { type: String, default: '925 Sterling Silver' },
    metalPurity: { type: String, default: '' },
    metalWeight: { type: String, default: '' },
    stone: { type: String, default: 'AAAAA Cubic Zirconia' },
    stoneCarat: { type: String, default: '' },
    finish: { type: String, default: 'Mirror Rhodium Polish' },
    dimensions: { type: String, default: '' },
    careInstructions: { type: String, default: '' },
    badge: { type: String, default: '' },
    images: [{ type: String }], // Main images array
    featured: { type: Boolean, default: false },
    bestseller: { type: Boolean, default: false },
    inStock: { type: Boolean, default: true },
    freeShipping: { type: Boolean, default: true },
    stockCount: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 4.8 },
    reviewsCount: { type: Number, default: 12 },
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    colors: [{ type: String }],
    variants: [variantSchema],
    packing: { type: packingSchema, default: () => ({}) },
  },
  { versionKey: false, timestamps: true }
);

export default mongoose.model('Products', productSchema);
