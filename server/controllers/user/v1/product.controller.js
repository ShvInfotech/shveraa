import mongoose from 'mongoose';
import V1Product from '../../../models/product.model.js';
import { CustomeError } from '../../../middleware/globelError.js';
import { withProductImageUrls } from '../../../helper/productImageUrl.js';

export const GetUserProducts = async (req, res, next) => {
  try {
    const { category, search, bestseller, featured, sort } = req.query || {};
    let filter = {};

    if (category && category !== 'all') {
      const cat = category.toLowerCase().trim();
      if (cat === 'necklaces') {
        filter.category = { $in: ['necklaces', 'necklace', 'pendants', 'pendant'] };
      } else if (cat === 'rings') {
        filter.category = { $in: ['rings', 'ring'] };
      } else if (cat === 'earrings') {
        filter.category = { $in: ['earrings', 'earring'] };
      } else if (cat === 'bracelets') {
        filter.category = { $in: ['bracelets', 'bracelet'] };
      } else if (cat === 'anklets') {
        filter.category = { $in: ['anklets', 'anklet'] };
      } else {
        filter.category = { $regex: new RegExp(`^${cat}$`, 'i') };
      }
    }
    if (bestseller === 'true') {
      filter.bestseller = true;
    }
    if (featured === 'true') {
      filter.featured = true;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { material: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-asc') sortOption = { price: 1 };
    else if (sort === 'price-desc') sortOption = { price: -1 };
    else if (sort === 'rating') sortOption = { rating: -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };

    const products = await V1Product.find(filter).sort(sortOption);
    return res.status(200).json({ success: true, products: products.map((product) => withProductImageUrls(product, req)) });
  } catch (error) {
    return next(error);
  }
};

export const GetUserProductById = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    let product = null;

    if (mongoose.isValidObjectId(idOrSlug)) {
      product = await V1Product.findById(idOrSlug);
    }
    if (!product) {
      product = await V1Product.findOne({ slug: idOrSlug.toLowerCase() });
    }

    if (!product) {
      return next(CustomeError(404, 'Product not found'));
    }

    return res.status(200).json({ success: true, product: withProductImageUrls(product, req) });
  } catch (error) {
    return next(error);
  }
};
