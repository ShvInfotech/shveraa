import Coupon from '../../../models/coupon.model.js';
import CartModel from '../../../models/cart.model.js';
import { CustomeError } from '../../../middleware/globelError.js';

export const  VerifyCoupon = async (req, res, next) => {
  try {
    const { code } = req.body || {};

    if (!code) {
      return next(CustomeError(422, 'Coupon code is required'));
    }

    const coupon = await Coupon.findOne({ code: code.toUpperCase().trim(), isActive: true });
    if (!coupon) {
      return next(CustomeError(404, 'Invalid coupon code'));
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return next(CustomeError(400, 'This coupon code has expired'));
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return next(CustomeError(400, 'Coupon usage limit reached'));
    }

    // Calculate the amount from the user's database cart, never from a value
    // supplied by the browser.
    const cartItems = await CartModel.find({ userId: req.user._id }).select('price quantity');
    const total = cartItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    if (total <= 0) {
      return next(CustomeError(400, 'Your cart is empty'));
    }
    if (coupon.minOrderAmount && total < coupon.minOrderAmount) {
      return next(CustomeError(400, `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`));
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((total * coupon.discountValue) / 100);
      if (coupon.maxDiscount > 0 && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = Math.min(coupon.discountValue, total);
    }

    return res.status(200).json({
      success: true,
      message: `Coupon code '${coupon.code}' applied!`,
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
      },
    });
  } catch (error) {
    return next(error);
  }
};
