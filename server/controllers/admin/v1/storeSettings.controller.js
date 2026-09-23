import StoreSettings from '../../../models/storeSettings.model.js';

export const GetStoreSettings = async (_req, res, next) => {
  try {
    const record = await StoreSettings.findOne({ key: 'storefront' }).lean();
    res.json({ success: true, settings: record?.settings || null });
  } catch (error) { next(error); }
};

export const SaveStoreSettings = async (req, res, next) => {
  try {
    const settings = req.body?.settings;
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
      return res.status(400).json({ success: false, message: 'Valid settings object is required' });
    }
    const record = await StoreSettings.findOneAndUpdate(
      { key: 'storefront' },
      { $set: { settings } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    ).lean();
    res.json({ success: true, settings: record.settings });
  } catch (error) { next(error); }
};
