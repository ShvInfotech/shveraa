import ShopBanner from '../../../models/shopBanner.model.js';
import { CustomeError } from '../../../middleware/globelError.js';
import { DeleteImage } from '../../../helper/helper.js';

const imagePathFromRequest = (req) => req.file ? `/uploads/${req.file.fieldname}/${req.file.filename}` : '';

export const GetShopBanners = async (req, res, next) => {
  try {
    const category = String(req.query.category || 'all').trim().toLowerCase();
    const banners = await ShopBanner.find({ category, isActive: true }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, banners });
  } catch (error) { next(error); }
};

export const AdminGetShopBanners = async (_req, res, next) => {
  try {
    const banners = await ShopBanner.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, banners });
  } catch (error) { next(error); }
};

export const AddShopBanner = async (req, res, next) => {
  try {
    const { title = '', subtitle = '', category = 'all', isActive = true } = req.body || {};
    const image = imagePathFromRequest(req);
    if (!image) return next(CustomeError(422, 'Banner image is required'));
    const banner = await ShopBanner.create({
      title,
      subtitle,
      category,
      image,
      isActive: isActive === 'true' || isActive === true,
    });
    res.status(201).json({ success: true, banner });
  } catch (error) { next(error); }
};

export const UpdateShopBanner = async (req, res, next) => {
  try {
    const banner = await ShopBanner.findById(req.params.id);
    if (!banner) return next(CustomeError(404, 'Shop banner not found'));
    const { title, subtitle, category, isActive } = req.body || {};
    if (title !== undefined) banner.title = title;
    if (subtitle !== undefined) banner.subtitle = subtitle;
    if (category !== undefined) banner.category = category;
    if (isActive !== undefined) banner.isActive = isActive === 'true' || isActive === true;
    const newImage = imagePathFromRequest(req);
    let previousImage = '';
    if (newImage) {
      previousImage = banner.image;
      banner.image = newImage;
    }
    await banner.save();
    if (previousImage && previousImage !== newImage) DeleteImage(previousImage);
    res.json({ success: true, banner });
  } catch (error) { next(error); }
};

export const DeleteShopBanner = async (req, res, next) => {
  try {
    const banner = await ShopBanner.findByIdAndDelete(req.params.id);
    if (!banner) return next(CustomeError(404, 'Shop banner not found'));
    if (banner.image) DeleteImage(banner.image);
    res.json({ success: true, message: 'Shop banner deleted' });
  } catch (error) { next(error); }
};
