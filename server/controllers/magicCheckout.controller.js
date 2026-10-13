import mongoose from "mongoose";
import { CustomeError } from "../middleware/globelError.js";
import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";
import couponModel from "../models/coupon.model.js";
import addressModel from "../models/address.model.js";
import OrderModel from "../models/order.model.js";
import userModel from "../models/user.model.js";
import { razorpay, razorpaySignature, getRazorpayKeyId } from "../config/razorpay.config.js";
import { PincodeServiceability, CreateShippingOrderService } from "../services/delhiveryApis.js";
import { sendNotification } from "../helper/helper.js";

const generateOrderNumber = () =>
  "SHV_" + Math.floor(100000 + Math.random() * 900000) + Date.now().toString().slice(-6);

/**
 * 1. SHIPPING INFO API (Called by Razorpay Magic Checkout Server)
 * Razorpay requests shipping serviceability, methods, shipping fees, and COD fees.
 * Method: GET / POST
 */
export const GetMagicShippingInfo = async (req, res, next) => {
  try {
    const rawData = req.method === "POST" ? req.body : req.query;

    let addresses = rawData.addresses;
    if (typeof addresses === "string") {
      try {
        addresses = JSON.parse(addresses);
      } catch (_) {
        addresses = [];
      }
    }

    if (!Array.isArray(addresses) || addresses.length === 0) {
      // Default fallback if no address array provided
      addresses = [
        {
          id: "0",
          zipcode: rawData.zipcode || "395010",
          state_code: rawData.state_code || "GJ",
          country: rawData.country || "IN",
        },
      ];
    }

    const responseAddresses = [];

    for (const addr of addresses) {
      const pin = String(addr.zipcode || "").trim();
      let isCodAvailable = true;
      let isServiceable = true;

      if (/^\d{6}$/.test(pin)) {
        try {
          const pinData = await PincodeServiceability(pin);
          if (pinData?.delivery_codes?.length > 0) {
            const postal = pinData.delivery_codes[0].postal_code;
            if (postal?.cod === "N") {
              isCodAvailable = false;
            }
          }
        } catch (pinErr) {
          console.warn("[Magic Checkout] Pincode check warning:", pinErr.message);
        }
      }

      responseAddresses.push({
        id: String(addr.id || "0"),
        zipcode: pin || "395010",
        state_code: addr.state_code || "GJ",
        country: addr.country || "IN",
        shipping_methods: [
          {
            id: "delhivery_express",
            name: "Insured Express Delivery",
            description: "Safe & insured delivery via Delhivery Air Express (2-4 Days)",
            serviceable: isServiceable,
            shipping_fee: 0, // Free insured shipping for Shveraa luxury silver
            cod: isCodAvailable,
            cod_fee: 0, // Free COD
          },
        ],
      });
    }

    return res.status(200).json({ addresses: responseAddresses });
  } catch (error) {
    console.error("[Magic Checkout] Shipping Info Error:", error);
    return res.status(200).json({
      addresses: [
        {
          id: "0",
          zipcode: "395010",
          state_code: "GJ",
          country: "IN",
          shipping_methods: [
            {
              id: "delhivery_express",
              name: "Insured Express Delivery",
              description: "Safe & insured delivery via Delhivery Air Express (2-4 Days)",
              serviceable: true,
              shipping_fee: 0,
              cod: true,
              cod_fee: 0,
            },
          ],
        },
      ],
    });
  }
};

/**
 * 2. GET PROMOTIONS API (Called by Razorpay Magic Checkout Server)
 * Returns active coupons to display inside Razorpay's checkout modal.
 * Method: GET / POST
 */
export const GetMagicPromotions = async (req, res, next) => {
  try {
    const coupons = await couponModel
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(10);

    const promotions = coupons.map((c) => ({
      code: c.code,
      summary:
        c.discountType === "percentage"
          ? `${c.discountValue}% OFF`
          : `₹${c.discountValue} OFF`,
      description:
        c.discountType === "percentage"
          ? `Get ${c.discountValue}% off${c.maxDiscount ? ` upto ₹${c.maxDiscount}` : ""}${c.minOrderAmount ? ` on orders above ₹${c.minOrderAmount}` : ""}`
          : `Flat ₹${c.discountValue} off on your fine jewellery order`,
    }));

    return res.status(200).json({ promotions });
  } catch (error) {
    console.error("[Magic Checkout] Get Promotions Error:", error);
    return res.status(200).json({ promotions: [] });
  }
};

/**
 * 3. APPLY PROMOTIONS API (Called by Razorpay Magic Checkout Server)
 * Validates the coupon applied by the customer in the checkout modal.
 * Method: GET / POST
 */
export const ApplyMagicPromotion = async (req, res, next) => {
  try {
    const rawData = req.method === "POST" ? req.body : req.query;
    const code = String(rawData.code || "").trim().toUpperCase();

    if (!code) {
      return res.status(200).json({
        failure_code: "INVALID_CODE",
        failure_reason: "Please enter a valid promotion code",
      });
    }

    const coupon = await couponModel.findOne({ code, isActive: true });

    if (!coupon) {
      return res.status(200).json({
        failure_code: "INVALID_PROMOTION",
        failure_reason: `Coupon code '${code}' is invalid or expired`,
      });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return res.status(200).json({
        failure_code: "EXPIRED_PROMOTION",
        failure_reason: `Coupon code '${code}' has expired`,
      });
    }

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
      return res.status(200).json({
        failure_code: "USAGE_LIMIT_REACHED",
        failure_reason: `Coupon code '${code}' usage limit has been reached`,
      });
    }

    // Value in paise for fixed_amount, or percentage value
    const isPercentage = coupon.discountType === "percentage";
    const promoValue = isPercentage
      ? Number(coupon.discountValue)
      : Math.round(Number(coupon.discountValue) * 100);

    return res.status(200).json({
      promotion: {
        reference_id: String(coupon._id),
        type: "coupon",
        code: coupon.code,
        value: promoValue,
        value_type: isPercentage ? "percentage" : "fixed_amount",
        description: `${coupon.code} applied successfully!`,
      },
    });
  } catch (error) {
    console.error("[Magic Checkout] Apply Promotion Error:", error);
    return res.status(200).json({
      failure_code: "ERROR",
      failure_reason: "Unable to apply promotion at this time",
    });
  }
};

/**
 * 4. CREATE MAGIC ORDER (Called by Client before opening Magic Checkout)
 * Creates Razorpay Order with mandatory `line_items` & `line_items_total`.
 */
export const CreateMagicOrder = async (req, res, next) => {
  try {
    const { cartIds, couponId, shippingCost } = req.body || {};
    const effectiveCouponId = couponId || "";

    if (!cartIds || !Array.isArray(cartIds) || cartIds.length === 0) {
      return next(CustomeError(422, "Please select at least one item to checkout"));
    }

    const cartItems = await cartModel.find({ _id: { $in: cartIds } });
    if (!cartItems.length) {
      return next(CustomeError(404, "Cart items not found"));
    }

    const productIDs = cartItems.map((item) => item.productId);
    const products = await productModel.find({ _id: { $in: productIDs } });

    let calculatedPrice = 0;
    const line_items = [];

    for (const item of cartItems) {
      const product = products.find((p) => p._id.toString() === item.productId);
      if (product) {
        const matchVariant = product.variants?.find(
          (v) => v._id?.toString() === item.variantId?.toString()
        );
        const sizeObj = matchVariant?.sizes?.find((s) => s.size === item.size);

        if (sizeObj && sizeObj.stock < item.quantity) {
          return next(
            CustomeError(400, `Insufficient stock for ${product.name} (${item.size})`)
          );
        }

        const unitPrice = sizeObj?.price || product.salePrice || product.originalPrice || 0;
        calculatedPrice += unitPrice * item.quantity;

        const unitPricePaise = Math.round(unitPrice * 100);
        line_items.push({
          sku: product.sku || String(product._id),
          variant_id: item.variantId ? String(item.variantId) : String(product._id),
          price: unitPricePaise,
          offer_price: unitPricePaise,
          quantity: item.quantity || 1,
          name: product.name + (item.size ? ` (${item.size})` : ""),
          image_url: matchVariant?.images?.[0] || product.images?.[0] || "",
          product_url: `https://shveraa.com/product/${product._id}`,
        });
      }
    }

    let discountAmount = 0;
    if (effectiveCouponId && mongoose.isValidObjectId(effectiveCouponId)) {
      const coupon = await couponModel.findById(effectiveCouponId);
      if (coupon) {
        if (coupon.discountType === "percentage") {
          discountAmount = Math.round((calculatedPrice * coupon.discountValue) / 100);
          if (coupon.maxDiscount > 0 && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
          }
        } else {
          discountAmount = Math.min(coupon.discountValue, calculatedPrice);
        }
      }
    }

    const cleanShippingCost = Math.round(Number(shippingCost) || 0);
    const totalAmount = Math.max(0, Math.round(calculatedPrice + cleanShippingCost - discountAmount));
    const totalAmountPaise = Math.round(totalAmount * 100);

    const options = {
      amount: totalAmountPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      line_items_total: totalAmountPaise,
      line_items: line_items,
      notes: {
        cart_ids: cartIds.join(","),
        coupon_id: effectiveCouponId || "",
        discount_amount: String(discountAmount),
      },
    };

    let order;
    try {
      order = await razorpay.orders.create(options);
    } catch (rzpErr) {
      console.error("[Magic Checkout] Razorpay order creation error:", rzpErr);
      return next(
        CustomeError(
          500,
          `Payment gateway error: ${rzpErr.error?.description || rzpErr.message || "Failed to create Razorpay order."}`
        )
      );
    }

    return res.status(200).json({
      success: true,
      order,
      key_id: getRazorpayKeyId(),
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * 5. VERIFY / FINALIZE MAGIC ORDER (Called by Client after Magic Checkout completes)
 * Handles both Prepaid (paid) and COD (placed) orders seamlessly!
 */
export const VerifyMagicOrder = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      cartIds,
      couponId,
      shippingCost,
      addressId,
    } = req.body || {};

    if (!razorpay_order_id) {
      return next(CustomeError(422, "razorpay_order_id is required"));
    }

    if (!cartIds || !Array.isArray(cartIds) || cartIds.length === 0) {
      return next(CustomeError(422, "cartIds is required"));
    }

    // 1. Fetch full order details from Razorpay (contains customer address filled in modal)
    let rzpOrder = null;
    try {
      rzpOrder = await razorpay.orders.fetch(razorpay_order_id);
    } catch (fetchErr) {
      console.error("[Magic Checkout] Error fetching Razorpay order:", fetchErr);
    }

    // Determine order payment mode and status
    const isCodOrder = rzpOrder?.status === "placed" || (!razorpay_payment_id && !razorpay_signature);
    const paymentMethod = isCodOrder ? "cod" : "razorpay";
    const paymentStatus = isCodOrder ? "pending" : "paid";

    // If prepaid, verify HMAC signature
    if (!isCodOrder && razorpay_payment_id && razorpay_signature) {
      const generatedSig = razorpaySignature(razorpay_order_id, razorpay_payment_id);
      if (generatedSig !== razorpay_signature) {
        return next(CustomeError(409, "Payment verification signature mismatch"));
      }
    }

    // 2. Fetch cart items & products
    const cartItems = await cartModel.find({ _id: { $in: cartIds } });
    const productIDs = cartItems.map((item) => item.productId);
    const products = await productModel.find({ _id: { $in: productIDs } });

    const items = [];
    let weight = 0;
    const width = 23;
    const height = 23;
    let quantity = 0;
    let productDescription = "";

    for (const item of cartItems) {
      const product = products.find((p) => p._id.toString() === item.productId);
      if (product) {
        const matchVariant = product.variants?.find(
          (v) => v._id?.toString() === item.variantId?.toString()
        );
        const sizeObj = matchVariant?.sizes?.find((s) => s.size === item.size);

        if (sizeObj && sizeObj.stock < item.quantity) {
          return next(
            CustomeError(400, `Insufficient stock for ${product.name} (${item.size})`)
          );
        }

        const price = sizeObj?.price || product.salePrice || product.originalPrice || 0;
        items.push({
          name: product.name,
          productId: product._id,
          variantId: item.variantId,
          color: matchVariant?.color || "",
          image: matchVariant?.images?.[0] || product.images?.[0] || "",
          size: item.size,
          quantity: item.quantity,
          price: price,
        });

        weight += (product.packing?.weight || 0.1) * item.quantity;
        quantity += item.quantity;
        productDescription += `${product.name} (${item.size || "Free"}) x ${item.quantity}, `;
      }
    }

    let itemsPrice = 0;
    for (const it of items) {
      itemsPrice += it.price * it.quantity;
    }

    // 3. Coupon discount
    let discount = 0;
    const effectiveCouponId = couponId || rzpOrder?.notes?.coupon_id || null;
    if (effectiveCouponId && mongoose.isValidObjectId(effectiveCouponId)) {
      const coupon = await couponModel.findById(effectiveCouponId);
      if (coupon) {
        if (coupon.discountType === "percentage") {
          discount = Math.round((itemsPrice * coupon.discountValue) / 100);
          if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
          }
        } else {
          discount = Math.min(coupon.discountValue, itemsPrice);
        }

        await couponModel.findByIdAndUpdate(effectiveCouponId, {
          $inc: { usedCount: 1 },
          $addToSet: { usedBy: req.user._id },
        });
      }
    }

    const cleanShippingCost = Math.round(Number(shippingCost) || 0);
    const totalAmount = Math.max(0, Math.round(itemsPrice - discount + cleanShippingCost));
    const orderNumber = generateOrderNumber();

    // 4. Resolve delivery address (From user selection or from Razorpay Magic Checkout modal)
    let addressDoc = null;
    if (addressId && mongoose.isValidObjectId(addressId)) {
      addressDoc = await addressModel.findById(addressId);
    }

    const rzpShipping = rzpOrder?.customer_details?.shipping_address;
    if (!addressDoc && rzpShipping) {
      try {
        addressDoc = await addressModel.create({
          userId: req.user._id,
          fullName: rzpShipping.name || req.user.name || "Customer",
          phone: rzpShipping.contact || req.user.phone || "",
          street: rzpShipping.line1 || "Street Address",
          locality: rzpShipping.line2 || "",
          city: rzpShipping.city || "City",
          state: rzpShipping.state || "State",
          pincode: rzpShipping.zipcode || "395010",
          isDefault: true,
          label: "Home",
        });
      } catch (addrErr) {
        console.warn("[Magic Checkout] Address creation warning:", addrErr.message);
      }
    }

    const orderAddress = {
      addressline: addressDoc
        ? `${addressDoc.street} ${addressDoc.locality || ""}`.trim()
        : `${rzpShipping?.line1 || ""} ${rzpShipping?.line2 || ""}`.trim() || "Address",
      city: addressDoc?.city || rzpShipping?.city || "Surat",
      state: addressDoc?.state || rzpShipping?.state || "Gujarat",
      country: "India",
      pincode: addressDoc?.pincode || rzpShipping?.zipcode || "395010",
      phone: addressDoc?.phone || rzpShipping?.contact || req.user.phone || "",
    };

    // 5. Create Delhivery shipping order
    let waybill = "";
    try {
      const delhiveryPayload = {
        shipments: [
          {
            name: addressDoc?.fullName || req.user.name,
            add: orderAddress.addressline,
            pin: orderAddress.pincode,
            city: orderAddress.city,
            state: orderAddress.state,
            country: "India",
            phone: orderAddress.phone,
            order: orderNumber,
            payment_mode: isCodOrder ? "COD" : "Prepaid",
            products_desc: productDescription,
            cod_amount: isCodOrder ? String(totalAmount) : "0",
            total_amount: totalAmount,
            quantity: String(quantity),
            weight: Math.round(weight * 1000),
            shipment_width: width,
            shipment_height: height,
            shipping_mode: "Surface",
            return_pin: process.env.SELLER_PIN || "395005",
            return_city: process.env.SELLER_CITY || "Surat",
            return_phone: process.env.SELLER_PHONE || "9998046559",
            return_add: process.env.SELLER_ADDRESS || "Surat, Gujarat",
            return_state: process.env.SELLER_STATE || "Gujarat",
            return_country: "India",
            waybill: "",
          },
        ],
        pickup_location: {
          name: process.env.DELHIVERY_PICKUP_LOCATION,
        },
      };

      const result = await CreateShippingOrderService(delhiveryPayload);
      if (result && result.success && result.packages?.length > 0) {
        const pkg = result.packages[0];
        if (pkg.status !== "Fail" && pkg.waybill) {
          waybill = pkg.waybill;
        }
      }
    } catch (delErr) {
      console.warn("[Magic Checkout] Delhivery shipping order warning:", delErr.message);
    }

    // 6. Create Order in Database
    const orderData = {
      userId: req.user._id,
      orderNumber: orderNumber,
      waybill: waybill,
      address: orderAddress,
      items: items,
      couponId: effectiveCouponId && mongoose.isValidObjectId(effectiveCouponId) ? effectiveCouponId : null,
      discount: discount,
      shippingcharges: cleanShippingCost,
      amount: itemsPrice,
      totalAmount: totalAmount,
      status: "pending",
      payment: {
        method: paymentMethod,
        status: paymentStatus,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id || "",
      },
    };

    const newOrder = await OrderModel.create(orderData);

    // 7. Clear cart items
    try {
      await cartModel.deleteMany({ _id: { $in: cartIds } });
    } catch (cartErr) {
      console.warn("Could not delete cart items:", cartErr.message);
    }

    // 8. Send Push Notification to Admins
    try {
      const admins = await userModel.find({ role: "admin" }).select("deviceToken");
      const tokens = admins.flatMap((admin) => admin.deviceToken || []);
      sendNotification(
        tokens,
        "New Order Placed (Magic Checkout)",
        `Order ${orderNumber} (${paymentMethod.toUpperCase()}) has been placed by ${req.user.name}.`
      );
    } catch (notifyErr) {
      console.warn("Notification error:", notifyErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "Order placed successfully via Magic Checkout",
      order: newOrder,
    });
  } catch (error) {
    return next(error);
  }
};
