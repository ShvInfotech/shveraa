import Category from '../../../models/category.model.js';
import { CustomeError } from '../../../middleware/globelError.js';
import { DeleteImage } from '../../../helper/helper.js';
import { withCategoryImageUrl } from '../../../helper/categoryImageUrl.js';

export const AddCategory = async (req, res, next) => {
  try {
    const { name, slug, subtitle, image, description, itemCount } = req.body || {};

    if (!name) {
      return next(CustomeError(422, 'Category name is required'));
    }

    const generatedSlug = (slug || name).toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');

    const existingCategory = await Category.findOne({ slug: generatedSlug });
    if (existingCategory) {
      return next(CustomeError(400, 'Category with this slug already exists'));
    }

    const imagePath = req.file
      ? `/uploads/${req.file.fieldname}/${req.file.filename}`
      : image || '';

    const category = await Category.create({
      name,
      slug: generatedSlug,
      subtitle: subtitle || '',
      image: imagePath,
      description: description || '',
      itemCount: itemCount || '0 designs',
    });

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category: withCategoryImageUrl(category, req),
    });
  } catch (error) {
    return next(error);
  }
};

export const GetAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      categories: categories.map((category) => withCategoryImageUrl(category, req)),
    });
  } catch (error) {
    return next(error);
  }
};

export const GetCategoryById = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return next(CustomeError(404, 'Category not found'));
    }
    return res.status(200).json({
      success: true,
      category: withCategoryImageUrl(category, req),
    });
  } catch (error) {
    return next(error);
  }
};

export const UpdateCategory = async (req, res, next) => {
  try {
    const { name, subtitle, image, description, itemCount, isActive } = req.body || {};
    const existingCategory = await Category.findById(req.params.id);

    if (!existingCategory) {
      return next(CustomeError(404, 'Category not found'));
    }

    const uploadedImagePath = req.file
      ? `/uploads/${req.file.fieldname}/${req.file.filename}`
      : null;
    let updateData = {};
    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
    }
    if (subtitle !== undefined) updateData.subtitle = subtitle;
    if (uploadedImagePath) {
      updateData.image = uploadedImagePath;
    } else if (image !== undefined) {
      updateData.image = image;
    }
    if (description !== undefined) updateData.description = description;
    if (itemCount !== undefined) updateData.itemCount = itemCount;
    if (isActive !== undefined) updateData.isActive = isActive;

    const category = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true });

    // A newly uploaded category image replaces the old server image.
    if (uploadedImagePath && existingCategory.image !== uploadedImagePath) {
      DeleteImage(existingCategory.image);
    }

    return res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      category: withCategoryImageUrl(category, req),
    });
  } catch (error) {
    return next(error);
  }
};

export const DeleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return next(CustomeError(404, 'Category not found'));
    }
    if (category.image) {
      DeleteImage(category.image);
    }
    return res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    return next(error);
  }
};
