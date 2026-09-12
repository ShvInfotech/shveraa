import V1Product from '../../../models/product.model.js';
import { CustomeError } from '../../../middleware/globelError.js';

export const AddProduct = async (req, res, next) => {
  try {
    const {
      name,
      slug,
      description,
      price,
      originalPrice,
      category,
      material,
      stone,
      finish,
      badge,
      images,
      featured,
      bestseller,
      inStock,
      variants,
    } = req.body || {};

    if (!name) {
      return next(CustomeError(422, 'Product name is required'));
    }
    if (!price) {
      return next(CustomeError(422, 'Product price is required'));
    }
    if (!category) {
      return next(CustomeError(422, 'Product category is required'));
    }

    const generatedSlug = (slug || name).toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');

    const existingProduct = await V1Product.findOne({ slug: generatedSlug });
    if (existingProduct) {
      return next(CustomeError(400, 'Product with this slug already exists'));
    }

    const product = await V1Product.create({
      name,
      slug: generatedSlug,
      description: description || '',
      price: Number(price),
      originalPrice: Number(originalPrice || 0),
      category: category.toLowerCase(),
      material: material || '925 Sterling Silver',
      stone: stone || 'AAAAA Cubic Zirconia',
      finish: finish || 'Mirror Rhodium Polish',
      badge: badge || '',
      images: Array.isArray(images) ? images : [],
      featured: Boolean(featured),
      bestseller: Boolean(bestseller),
      inStock: inStock !== undefined ? Boolean(inStock) : true,
      variants: Array.isArray(variants) ? variants : [],
    });

    return res.status(201).json({ success: true, message: 'Product created successfully', product });
  } catch (error) {
    return next(error);
  }
};

export const GetAllProducts = async (req, res, next) => {
  try {
    const products = await V1Product.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, products });
  } catch (error) {
    return next(error);
  }
};

export const GetProductById = async (req, res, next) => {
  try {
    const product = await V1Product.findById(req.params.id);
    if (!product) {
      return next(CustomeError(404, 'Product not found'));
    }
    return res.status(200).json({ success: true, product });
  } catch (error) {
    return next(error);
  }
};

export const UpdateProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      category,
      material,
      stone,
      finish,
      badge,
      images,
      featured,
      bestseller,
      inStock,
      variants,
    } = req.body || {};

    let updateData = {};
    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
    }
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = Number(price);
    if (originalPrice !== undefined) updateData.originalPrice = Number(originalPrice);
    if (category !== undefined) updateData.category = category.toLowerCase();
    if (material !== undefined) updateData.material = material;
    if (stone !== undefined) updateData.stone = stone;
    if (finish !== undefined) updateData.finish = finish;
    if (badge !== undefined) updateData.badge = badge;
    if (images !== undefined) updateData.images = Array.isArray(images) ? images : [];
    if (featured !== undefined) updateData.featured = Boolean(featured);
    if (bestseller !== undefined) updateData.bestseller = Boolean(bestseller);
    if (inStock !== undefined) updateData.inStock = Boolean(inStock);
    if (variants !== undefined) updateData.variants = Array.isArray(variants) ? variants : [];

    const product = await V1Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!product) {
      return next(CustomeError(404, 'Product not found'));
    }

    return res.status(200).json({ success: true, message: 'Product updated successfully', product });
  } catch (error) {
    return next(error);
  }
};

export const DeleteProduct = async (req, res, next) => {
  try {
    const product = await V1Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return next(CustomeError(404, 'Product not found'));
    }
    return res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    return next(error);
  }
};
