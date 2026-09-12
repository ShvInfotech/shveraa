import Category from '../../../models/category.model.js';
import { CustomeError } from '../../../middleware/globelError.js';

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

    const category = await Category.create({
      name,
      slug: generatedSlug,
      subtitle: subtitle || '',
      image: image || '',
      description: description || '',
      itemCount: itemCount || '0 designs',
    });

    return res.status(201).json({ success: true, message: 'Category created successfully', category });
  } catch (error) {
    return next(error);
  }
};

export const GetAllCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, categories });
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
    return res.status(200).json({ success: true, category });
  } catch (error) {
    return next(error);
  }
};

export const UpdateCategory = async (req, res, next) => {
  try {
    const { name, subtitle, image, description, itemCount, isActive } = req.body || {};

    let updateData = {};
    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
    }
    if (subtitle !== undefined) updateData.subtitle = subtitle;
    if (image !== undefined) updateData.image = image;
    if (description !== undefined) updateData.description = description;
    if (itemCount !== undefined) updateData.itemCount = itemCount;
    if (isActive !== undefined) updateData.isActive = isActive;

    const category = await Category.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!category) {
      return next(CustomeError(404, 'Category not found'));
    }

    return res.status(200).json({ success: true, message: 'Category updated successfully', category });
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
    return res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    return next(error);
  }
};