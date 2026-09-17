import Category from '../../../models/category.model.js';
import { withCategoryImageUrl } from '../../../helper/categoryImageUrl.js';

export const GetUserCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    return res.status(200).json({
      success: true,
      categories: categories.map((category) => withCategoryImageUrl(category, req)),
    });
  } catch (error) {
    return next(error);
  }
};
