import V1Product from '../../../models/product.model.js';
import { CustomeError } from '../../../middleware/globelError.js';
import { DeleteImage } from '../../../helper/helper.js';

const normalizePacking = (packing) => {
  if (!packing || typeof packing !== 'object' || Array.isArray(packing)) return undefined;

  const normalized = {};
  for (const field of ['length', 'height', 'width', 'weight']) {
    const value = Number(packing[field]);
    if (!Number.isFinite(value) || value < 0) {
      throw CustomeError(422, `Packing ${field} must be a valid non-negative number`);
    }
    normalized[field] = value;
  }
  return normalized;
};

export const AddProduct = async (req, res, next) => {
  try {
    const {
      name,
      slug,
      description,
      price,
      originalPrice,
      category,
      sku,
      collection,
      makingCharges,
      material,
      metalType,
      metalPurity,
      metalWeight,
      stone,
      stoneCarat,
      finish,
      dimensions,
      careInstructions,
      badge,
      images,
      featured,
      bestseller,
      inStock,
      freeShipping,
      stockCount,
      metaTitle,
      metaDescription,
      colors,
      variants,
      packing,
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
      sku: sku || '',
      collection: collection || '',
      makingCharges: Number(makingCharges || 0),
      material: material || metalType || '925 Sterling Silver',
      metalType: metalType || material || '925 Sterling Silver',
      metalPurity: metalPurity || '',
      metalWeight: metalWeight || '',
      stone: stone || 'AAAAA Cubic Zirconia',
      stoneCarat: stoneCarat || '',
      finish: finish || 'Mirror Rhodium Polish',
      dimensions: dimensions || '',
      careInstructions: careInstructions || '',
      badge: badge || '',
      images: Array.isArray(images) ? images : [],
      featured: Boolean(featured),
      bestseller: Boolean(bestseller),
      inStock: inStock !== undefined ? Boolean(inStock) : true,
      freeShipping: freeShipping !== undefined ? Boolean(freeShipping) : true,
      stockCount: Number(stockCount || 0),
      metaTitle: metaTitle || '',
      metaDescription: metaDescription || '',
      colors: Array.isArray(colors) ? colors : [],
      variants: Array.isArray(variants) ? variants : [],
      ...(packing !== undefined ? { packing: normalizePacking(packing) } : {}),
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
      slug,
      description,
      price,
      originalPrice,
      category,
      sku,
      collection,
      makingCharges,
      material,
      metalType,
      metalPurity,
      metalWeight,
      stone,
      stoneCarat,
      finish,
      dimensions,
      careInstructions,
      badge,
      images,
      featured,
      bestseller,
      inStock,
      freeShipping,
      stockCount,
      metaTitle,
      metaDescription,
      colors,
      variants,
      packing,
    } = req.body || {};

    let updateData = {};
    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
    }
    if (slug !== undefined) {
      updateData.slug = slug.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
    }
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = Number(price);
    if (originalPrice !== undefined) updateData.originalPrice = Number(originalPrice);
    if (category !== undefined) updateData.category = category.toLowerCase();
    if (material !== undefined) updateData.material = material;
    if (sku !== undefined) updateData.sku = sku;
    if (collection !== undefined) updateData.collection = collection;
    if (makingCharges !== undefined) updateData.makingCharges = Number(makingCharges);
    if (metalType !== undefined) updateData.metalType = metalType;
    if (metalPurity !== undefined) updateData.metalPurity = metalPurity;
    if (metalWeight !== undefined) updateData.metalWeight = metalWeight;
    if (stone !== undefined) updateData.stone = stone;
    if (stoneCarat !== undefined) updateData.stoneCarat = stoneCarat;
    if (finish !== undefined) updateData.finish = finish;
    if (dimensions !== undefined) updateData.dimensions = dimensions;
    if (careInstructions !== undefined) updateData.careInstructions = careInstructions;
    if (badge !== undefined) updateData.badge = badge;
    if (images !== undefined) updateData.images = Array.isArray(images) ? images : [];
    if (featured !== undefined) updateData.featured = Boolean(featured);
    if (bestseller !== undefined) updateData.bestseller = Boolean(bestseller);
    if (inStock !== undefined) updateData.inStock = Boolean(inStock);
    if (freeShipping !== undefined) updateData.freeShipping = Boolean(freeShipping);
    if (stockCount !== undefined) updateData.stockCount = Number(stockCount);
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;
    if (colors !== undefined) updateData.colors = Array.isArray(colors) ? colors : [];
    if (variants !== undefined) updateData.variants = Array.isArray(variants) ? variants : [];
    if (packing !== undefined) updateData.packing = normalizePacking(packing);

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
    const { id } = req.params;
    let product;
    if (id && id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await V1Product.findByIdAndDelete(id);
    }
    if (!product) {
      product = await V1Product.findOneAndDelete({ slug: id });
    }
    if (!product) {
      return next(CustomeError(404, 'Product not found'));
    }

    // Clean up uploaded image files
    if (Array.isArray(product.images)) {
      product.images.forEach((img) => DeleteImage(img));
    }
    if (Array.isArray(product.variants)) {
      product.variants.forEach((v) => {
        if (v.image) DeleteImage(v.image);
        if (Array.isArray(v.images)) v.images.forEach((img) => DeleteImage(img));
      });
    }

    return res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    return next(error);
  }
};
