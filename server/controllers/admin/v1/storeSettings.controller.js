import StoreSettings from '../../../models/storeSettings.model.js';
import { DeleteImage } from '../../../helper/helper.js';

export const DeleteUploadedImage = (req, res) => {
  const image = req.body?.url;
  if (typeof image !== 'string' || !/^\/?uploads\/image\/[^/]+$/i.test(image)) {
    return res.status(400).json({ success: false, message: 'Valid uploaded image path is required' });
  }
  DeleteImage(`/${image.replace(/^\//, '')}`);
  return res.json({ success: true });
};

const getHeroUploadPaths = (settings) => {
  const images = [
    ...(Array.isArray(settings?.heroBanners) ? settings.heroBanners.map((banner) => banner?.image) : []),
    settings?.heroBanner?.image,
  ];
  return [...new Set(images.filter((image) => typeof image === 'string' && /^\/?uploads\/image\/[^/]+$/i.test(image)).map((image) => `/${image.replace(/^\//, '')}`))];
};

export const GetStoreSettings = async (_req, res, next) => {
  try {
    const record = await StoreSettings.findOne({ key: 'storefront' }).lean();
    res.json({ success: true, settings: record?.settings || null });
  } catch (error) { next(error); }
};

export const SaveStoreSettings = async (req, res, next) => {
  try {
    const submittedSettings = req.body?.settings;
    if (!submittedSettings || typeof submittedSettings !== 'object' || Array.isArray(submittedSettings)) {
      return res.status(400).json({ success: false, message: 'Valid settings object is required' });
    }
    // Convert legacy single-value fields once, then keep only the arrays in storage.
    const settings = { ...submittedSettings };
    if (!Array.isArray(settings.heroBanners) && settings.heroBanner) settings.heroBanners = [settings.heroBanner];
    if (!Array.isArray(settings.announcements) && settings.announcementText) settings.announcements = [settings.announcementText];
    delete settings.heroBanner;
    delete settings.announcementText;
    const bannerImages = [
      ...(Array.isArray(settings.heroBanners) ? settings.heroBanners.map((banner) => banner?.image) : []),
    ];
    if (bannerImages.some((image) => typeof image === 'string' && /^data:image\//i.test(image))) {
      return res.status(400).json({ success: false, message: 'Base64 images are not supported. Upload the image file first.' });
    }
    const previousRecord = await StoreSettings.findOne({ key: 'storefront' }).lean();
    const record = await StoreSettings.findOneAndUpdate(
      { key: 'storefront' },
      { $set: { settings } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();
    const retainedImages = new Set(getHeroUploadPaths(record.settings));
    getHeroUploadPaths(previousRecord?.settings).forEach((imagePath) => {
      if (!retainedImages.has(imagePath)) DeleteImage(imagePath);
    });
    res.json({ success: true, settings: record.settings });
  } catch (error) { next(error); }
};
