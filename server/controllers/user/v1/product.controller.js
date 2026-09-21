import mongoose from 'mongoose';
import V1Product from '../../../models/product.model.js';
import { CustomeError } from '../../../middleware/globelError.js';
import { withProductImageUrls } from '../../../helper/productImageUrl.js';

export const GetUserProducts = async (req, res, next) => {
  try {
    const { category, search, bestseller, featured } = req.query || {};
    let filter = {};

    if (category && category !== 'all') {
      filter.category = category.toLowerCase();
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

    const products = await V1Product.find(filter).sort({ createdAt: -1 });
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
