import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    originalPrice: {
      type: Number,
    },
    category: {
      type: String,
      required: true,
      // enum: ['rings', 'earrings', 'necklaces', 'bracelets', 'anklets', 'pendants'],
      lowercase: true,
    },
    images: {
      type: [String],
      required: true,
    },
    material: {
      type: String,
      default: '18K Gold Vermeil & Sterling Silver',
    },
    sizes: {
      type: [String],
      default: ['Small', 'Medium', 'Large'],
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    bestseller: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    reviewsCount: {
      type: Number,
      default: 18,
    },
    badge: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    versionKey:false
  }
);

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export default Product;
