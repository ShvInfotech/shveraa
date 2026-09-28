import { CustomeError } from "../../../middleware/globelError.js";
import cartModel from "../../../models/cart.model.js";
import productModel from "../../../models/product.model.js";
import couponModel from "../../../models/coupon.model.js";
import {razorpay,razorpaySignature,} from "../../../config/razorpay.config.js";
import OrderNumberGanrate  from 'generate-unique-id'

export const RozerpayPaymentOrder = async (req, res, next) => {
  try {
    const { cartIds, couponId } = req.body || {};

    if (!cartIds || !cartIds?.length) {
      return next(CustomeError(400, "CartIds are required"));
    }

    const cartItems = await cartModel.find({ _id: { $in: cartIds } });
    const productIDs = cartItems.map((item) => item.productId);
    const products = await productModel.find({ _id: { $in: productIDs } });

    let price = 0;
    for (const item of cartItems) {
      const product = products.find((p) => p._id.toString() === item.productId);

      if (product) {
        const Matchcolor = product.variants.find(
          (variant) => variant._id?.toString() === item.variantId?.toString(),
        );

        const variant = Matchcolor?.sizes?.find(
          (size) => size.size === item.size,
        );
        console.log(variant);

        if (variant && variant.stock < item.quantity) {
          return next(
            CustomeError(
              400,
              `Insufficient stock for ${product.name} (${item.size})`,
            ),
          );
        }
        if (variant) {
          price += variant.price * item.quantity;
        }
      }
    }

    let discountAmount = 0;
    if (couponId) {
      const coupon = await couponModel.findById(couponId);

      if (coupon.minOrderAmount && price < coupon.minOrderAmount) {
        return next(
          CustomeError(
            400,
            `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`,
          ),
        );
      }

      if (coupon.discountType === "percentage") {
        discountAmount = Math.round((price * coupon.discountValue) / 100);
        if (coupon.maxDiscount > 0 && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
        }
      } else {
        discountAmount = Math.min(coupon.discountValue, price);
      }
    }

    const totalAmount = price - discountAmount;

    const options = {
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    };

    let order = await razorpay.orders.create(options);

    return res.status(200).json({ order });
  } catch (error) {
    return next(error);
  }
};

export const RozerpayPaymentVerifyPlaceOrder = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, couponId, cartIds, addressId, } = req.body || {};

    if (!razorpay_order_id) {
      return next(CustomeError(422, "razorpay_order_id is required"));
    }

    if (!razorpay_payment_id) {
      return next(CustomeError(422, "razorpay_payment_id is required"));
    }

    if (!razorpay_signature) {
      return next(CustomeError(422, "razorpay_signature is required"));
    }

    if (!cartIds || !cartIds?.length) {
      return next(CustomeError(422, "cartIds id required"));
    }

    const signature = razorpaySignature(razorpay_order_id, razorpay_payment_id);
    if (signature != razorpay_signature) {
      return next(CustomeError(409, "payment not verify"));
    }

    const cartItems = await cartModel.find({ _id: { $in: cartIds } });
    const productIDs = cartItems.map((item) => item.productId);
    const products = await productModel.find({ _id: { $in: productIDs } });

    const items = [];

    for (const item of cartItems) {
      const product = products.find((p) => p._id.toString() === item.productId);

      if (product) {
        const Matchcolor = product.variants.find((variant) => variant._id?.toString() === item.variantId?.toString());

        const variant = Matchcolor?.sizes?.find((size) => size.size === item.size,);

        if (variant && variant.stock < item.quantity) {
          return next(CustomeError(400, `Insufficient stock for ${product.name} (${item.size})`,),);
        }
        

        let data = {
          name: product.name,
          productId: product._id,
          variantId: item.variantId,
          color: Matchcolor.color,
          image: Matchcolor.images[0],
          size: item.size,
          quantity: item.quantity,
          price: variant.price,
        }

        items.push(data)
      }
    }

    const orderData = {
      userId: "userID",
      orderNumber: "SHV_"+OrderNumberGanrate({length:6,useLetters:false}) + Date.now().toString().slice(-6),
      waybill: "waybill",
      items: items,
      coupenId: "",
      discount: 0,
      amount: 0,
      totalAmount: 0,
      status: "pending",
      picuprequestId: "",
      payment: {
        method: "rozearpay",
        status: "paid",
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      },

      rtoData: {
        waybill: "",
        status: "",
        payment: {
          method: "",
          status: "",
        },
      },

      returnData: {
        waybill: "waybill",
        status: "",
        payment: {
          method: "",
          status: "",
        },
        accountDetails: {
          name: "",
          accountNumber: "",
          ifscode: "",
        },
      },
    };


    const sendData = {
      orderNumber: orderData.orderNumber,
      amount: orderData.totalAmount, 
    }

    return res.status(200).json({ message: "Payment verified and order placed successfully", orderData:sendData });
  } catch (error) {
    return next(error);
  }
};
