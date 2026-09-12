import Coupon from '../../../models/coupon.model.js';
import { CustomeError } from '../../../middleware/globelError.js';

export const AddCoupon = async (req, res, next) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, maxDiscount, expiresAt, usageLimit } = req.body || {};

    if (!code) {
      return next(CustomeError(422, 'Coupon code is required'));
    }
    if (!discountValue) {
      return next(CustomeError(422, 'Discount value is required'));
    }

    const uppercaseCode = code.toUpperCase().trim();
    const existing = await Coupon.findOne({ code: uppercaseCode });
    if (existing) {
      return next(CustomeError(400, 'Coupon code already exists'));
    }

    const coupon = await Coupon.create({
      code: uppercaseCode,
      discountType: discountType || 'percentage',
      discountValue: Number(discountValue),
      minOrderAmount: Number(minOrderAmount || 0),
      maxDiscount: Number(maxDiscount || 0),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      usageLimit: Number(usageLimit || 100),
    });

    return res.status(201).json({ success: true, message: 'Coupon created successfully', coupon });
  } catch (error) {
    return next(error);
  }
};

export const GetAllCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, coupons });
  } catch (error) {
    return next(error);
  }
};

export const GetCouponById = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return next(CustomeError(404, 'Coupon not found'));
    }
    return res.status(200).json({ success: true, coupon });
  } catch (error) {
    return next(error);
  }
};

export const UpdateCoupon = async (req, res, next) => {
  try {
    const { code, discountType, discountValue, minOrderAmount, maxDiscount, expiresAt, usageLimit, isActive } = req.body || {};

    let updateData = {};
    if (code !== undefined) updateData.code = code.toUpperCase().trim();
    if (discountType !== undefined) updateData.discountType = discountType;
    if (discountValue !== undefined) updateData.discountValue = Number(discountValue);
    if (minOrderAmount !== undefined) updateData.minOrderAmount = Number(minOrderAmount);
    if (maxDiscount !== undefined) updateData.maxDiscount = Number(maxDiscount);
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (usageLimit !== undefined) updateData.usageLimit = Number(usageLimit);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const coupon = await Coupon.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!coupon) {
      return next(CustomeError(404, 'Coupon not found'));
    }

    return res.status(200).json({ success: true, message: 'Coupon updated successfully', coupon });
  } catch (error) {
    return next(error);
  }
};

export const DeleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return next(CustomeError(404, 'Coupon not found'));
    }
    return res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    return next(error);
  }
};
