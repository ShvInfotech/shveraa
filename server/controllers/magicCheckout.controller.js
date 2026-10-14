import mongoose from "mongoose";
import { CustomeError } from "../middleware/globelError.js";
import cartModel from "../models/cart.model.js";
import productModel from "../models/product.model.js";
import couponModel from "../models/coupon.model.js";
import addressModel from "../models/address.model.js";
import OrderModel from "../models/order.model.js";
import userModel from "../models/user.model.js";
import { razorpay, razorpaySignature, getRazorpayKeyId } from "../config/razorpay.config.js";
import { PincodeServiceability, CreateShippingOrderService, CheckShippingChargesService } from "../services/delhiveryApis.js";
import { sendNotification } from "../helper/helper.js";
import { generateJwtToken } from "../middleware/jwtToken.js";
import { SendWhatsAppMessage } from "../services/Whatsapp.js";

// In-memory cache for recent Magic Checkout orders to resolve subtotals and promotions instantly
const magicOrderCache = new Map();

const generateOrderNumber = () =>
  "SHV_" + Math.floor(100000 + Math.random() * 900000) + Date.now().toString().slice(-6);

const formatValidUrl = (urlStr) => {
  if (!urlStr || typeof urlStr !== "string") return undefined;
  let clean = urlStr.trim().replace(/\\/g, "/");
  if (!clean || clean === "undefined" || clean === "null") return undefined;
  if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
    clean = `https://shveraa.com${clean.startsWith("/") ? "" : "/"}${clean}`;
  }
  try {
    const parsed = new URL(clean);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return undefined;
    return encodeURI(decodeURI(parsed.href));
  } catch (_) {
    return undefined;
  }
};

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

    // Parse line_items if passed as string
    let lineItems = rawData.line_items;
    if (typeof lineItems === "string") {
      try {
        lineItems = JSON.parse(lineItems);
      } catch (_) {
        lineItems = [];
      }
    }

    // Determine order amount for Free Shipping Threshold (₹4,999 = 499,900 paise)
    let orderAmountPaise = 0;
    if (rawData.line_items_total && Number(rawData.line_items_total) > 0) {
      orderAmountPaise = Number(rawData.line_items_total);
    } else if (Array.isArray(lineItems) && lineItems.length > 0) {
      orderAmountPaise = lineItems.reduce((sum, item) => {
        const itemPrice = Number(item.offer_price || item.price || 0);
        const qty = Number(item.quantity || 1);
        return sum + itemPrice * qty;
      }, 0);
    } else if (rawData.order_total && Number(rawData.order_total) > 0) {
      orderAmountPaise = Number(rawData.order_total);
    } else if (rawData.amount && Number(rawData.amount) > 0) {
      orderAmountPaise = Number(rawData.amount);
    }

    const orderId = rawData.order_id || rawData.orderId || req.body?.order_id || req.query?.order_id;
    if (orderAmountPaise === 0 && orderId) {
      try {
        const rzpOrder = await razorpay.orders.fetch(orderId);
        if (rzpOrder) {
          orderAmountPaise = Number(rzpOrder.notes?.subtotal_paise || rzpOrder.line_items_total || rzpOrder.amount || 0);
        }
      } catch (_) {}
    }

    // Free delivery on orders >= ₹4,999 (499,900 paise)
    const isFreeDelivery = orderAmountPaise >= 4999 * 100;

    let totalWeightGrams = 100;
    if (Array.isArray(lineItems) && lineItems.length > 0) {
      const totalQty = lineItems.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
      totalWeightGrams = Math.max(100, totalQty * 100);
    }

    const responseAddresses = [];

    for (const addr of addresses) {
      const pin = String(addr.pin_code || addr.pincode || addr.postal_code || addr.zipcode || addr.zip || "").trim();
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

      let shippingFeePaise = 0;
      if (!isFreeDelivery) {
        try {
          const destPin = /^\d{6}$/.test(pin) ? pin : "395010";
          const shippingData = await CheckShippingChargesService({
            md: "E",
            ss: "Delivered",
            d_pin: destPin,
            o_pin: process.env.SELLER_PIN || "395005",
            cgm: totalWeightGrams,
            pt: "Pre-paid",
            cod: 0,
          });
          if (Array.isArray(shippingData) && shippingData.length > 0 && shippingData[0].total_amount !== undefined) {
            shippingFeePaise = Math.round(Number(shippingData[0].total_amount) * 100);
          }
        } catch (chargeErr) {
          console.warn("[Magic Checkout] Delhivery shipping charge error:", chargeErr.message);
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
            description: isFreeDelivery
              ? "Safe & insured delivery via Delhivery Air Express (FREE on orders ₹4,999+)"
              : "Safe & insured delivery via Delhivery Air Express (2-4 Days)",
            serviceable: isServiceable,
            shipping_fee: shippingFeePaise,
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
    const rawData = {
      ...(req.query || {}),
      ...(req.body || {}),
    };

    const rawCode =
      rawData.code ||
      rawData.coupon_code ||
      rawData.coupon ||
      rawData.promotion?.code ||
      rawData.promotions?.[0]?.code ||
      req.body?.code ||
      req.query?.code ||
      "";
    const code = String(rawCode || "").trim().toUpperCase();

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

    let lineItems =
      rawData.line_items ||
      rawData.order?.line_items ||
      rawData.cart?.line_items ||
      rawData.cart?.items ||
      rawData.items;
    if (typeof lineItems === "string") {
      try {
        lineItems = JSON.parse(lineItems);
      } catch (_) {
        lineItems = [];
      }
    }

    // Extract order_id safely
    const rawOrderId =
      rawData.order_id ||
      rawData.orderId ||
      rawData.razorpay_order_id ||
      rawData.razorpayOrderId ||
      rawData.order?.id ||
      rawData.order?.order_id ||
      rawData.order?.razorpay_order_id ||
      rawData.cart?.order_id ||
      rawData.cart?.id ||
      rawData.data?.order_id ||
      rawData.data?.razorpay_order_id ||
      req.body?.order_id ||
      req.body?.orderId ||
      req.body?.razorpay_order_id ||
      req.query?.order_id ||
      req.query?.orderId ||
      req.query?.razorpay_order_id ||
      req.headers?.["x-razorpay-order-id"] ||
      req.headers?.["razorpay-order-id"] ||
      req.headers?.["razorpay_order_id"];

    let orderId =
      typeof rawOrderId === "string" &&
      rawOrderId.trim() !== "" &&
      rawOrderId !== "undefined" &&
      rawOrderId !== "null" &&
      rawOrderId.trim().startsWith("order_")
        ? rawOrderId.trim()
        : "";

    if (!orderId) {
      const searchForOrderId = (obj) => {
        if (!obj || typeof obj !== "object") return "";
        for (const val of Object.values(obj)) {
          if (typeof val === "string" && val.startsWith("order_")) return val;
          if (typeof val === "object") {
            const nested = searchForOrderId(val);
            if (nested) return nested;
          }
        }
        return "";
      };
      orderId = searchForOrderId(req.body) || searchForOrderId(req.query);
    }

    // 1. Calculate subtotal in paise from Magic Checkout request or order
    let subtotalPaise = 0;
    if (rawData.line_items_total && Number(rawData.line_items_total) > 0) {
      subtotalPaise = Number(rawData.line_items_total);
    } else if (rawData.order?.line_items_total && Number(rawData.order.line_items_total) > 0) {
      subtotalPaise = Number(rawData.order.line_items_total);
    } else if (Array.isArray(lineItems) && lineItems.length > 0) {
      subtotalPaise = lineItems.reduce((sum, item) => {
        const itemPrice = Number(item.offer_price || item.price || item.unit_price || item.amount || 0);
        const qty = Number(item.quantity || item.qty || 1);
        return sum + itemPrice * qty;
      }, 0);
    } else if (rawData.order_total && Number(rawData.order_total) > 0) {
      subtotalPaise = Number(rawData.order_total);
    } else if (rawData.amount && Number(rawData.amount) > 0) {
      subtotalPaise = Number(rawData.amount);
    } else if (rawData.order?.amount && Number(rawData.order.amount) > 0) {
      subtotalPaise = Number(rawData.order.amount);
    } else if (rawData.cart?.total && Number(rawData.cart.total) > 0) {
      subtotalPaise = Number(rawData.cart.total);
    } else if (rawData.cart?.amount && Number(rawData.cart.amount) > 0) {
      subtotalPaise = Number(rawData.cart.amount);
    }

    // Check in-memory cache if orderId is found
    if (subtotalPaise === 0 && orderId) {
      const cached = magicOrderCache.get(orderId);
      if (cached && cached.subtotalPaise > 0) {
        subtotalPaise = cached.subtotalPaise;
      }
    }

    // Fetch from Razorpay API if orderId is known
    if (subtotalPaise === 0 && orderId && orderId.startsWith("order_")) {
      try {
        const rzpOrder = await razorpay.orders.fetch(orderId);
        if (rzpOrder) {
          subtotalPaise = Number(
            rzpOrder.notes?.subtotal_paise ||
            rzpOrder.line_items_total ||
            rzpOrder.amount ||
            0
          );
          magicOrderCache.set(orderId, {
            orderId,
            subtotalPaise,
            createdAt: Date.now(),
          });
        }
      } catch (err) {
        const errMsg =
          err?.error?.description ||
          err?.message ||
          (typeof err === "object" ? JSON.stringify(err) : String(err));
        console.warn(`[Magic Checkout] Could not fetch order ${orderId} for promotion calculation:`, errMsg);
      }
    }

    // Fallback A: Check latest active order in magicOrderCache (within 30 mins)
    if (subtotalPaise === 0) {
      const THIRTY_MINS = 30 * 60 * 1000;
      const now = Date.now();
      let latestCached = null;
      for (const entry of magicOrderCache.values()) {
        if (entry && entry.subtotalPaise > 0 && (now - (entry.createdAt || 0)) < THIRTY_MINS) {
          if (!latestCached || entry.createdAt > latestCached.createdAt) {
            latestCached = entry;
          }
        }
      }
      if (latestCached) {
        subtotalPaise = latestCached.subtotalPaise;
        if (!orderId && latestCached.orderId) {
          orderId = latestCached.orderId;
        }
      }
    }

    // Fallback B: Query recent orders directly from Razorpay API (within 30 mins)
    if (subtotalPaise === 0) {
      try {
        const recentOrders = await razorpay.orders.all({ count: 5 });
        if (recentOrders?.items?.length > 0) {
          const nowSec = Math.floor(Date.now() / 1000);
          for (const item of recentOrders.items) {
            const ageSec = nowSec - (item.created_at || 0);
            if (ageSec < 1800) {
              const itemSubtotal = Number(
                item.notes?.subtotal_paise ||
                item.line_items_total ||
                item.amount ||
                0
              );
              if (itemSubtotal > 0) {
                subtotalPaise = itemSubtotal;
                if (!orderId && item.id) {
                  orderId = item.id;
                }
                break;
              }
            }
          }
        }
      } catch (rzpErr) {
        console.warn("[Magic Checkout] Could not fetch recent orders from Razorpay:", rzpErr?.error?.description || rzpErr?.message);
      }
    }

    // Fallback C: Check user's active cart in MongoDB
    if (subtotalPaise === 0) {
      const contact = rawData.contact || rawData.phone || rawData.user?.phone;
      const email = rawData.email || rawData.user?.email;
      if (contact || email) {
        try {
          const userQuery = [];
          if (contact) userQuery.push({ phone: String(contact).replace(/\D/g, "").slice(-10) });
          if (email) userQuery.push({ email: String(email).trim().toLowerCase() });
          const user = await userModel.findOne({ $or: userQuery });
          if (user) {
            const userCart = await cartModel.find({ userId: user._id }).populate("productId");
            if (userCart && userCart.length > 0) {
              const cartTotal = userCart.reduce((sum, item) => {
                const prod = item.productId;
                if (!prod) return sum;
                const matchVariant = prod.variants?.find(
                  (v) => v._id?.toString() === item.variantId?.toString()
                );
                const sizeObj = matchVariant?.sizes?.find((s) => s.size === item.size);
                const price = sizeObj?.price || prod.salePrice || prod.originalPrice || 0;
                return sum + price * (item.quantity || 1);
              }, 0);
              if (cartTotal > 0) {
                subtotalPaise = Math.round(cartTotal * 100);
              }
            }
          }
        } catch (_) {}
      }
    }

    // Check minimum order amount requirement
    if (coupon.minOrderAmount > 0 && subtotalPaise > 0 && (subtotalPaise / 100) < coupon.minOrderAmount) {
      return res.status(200).json({
        failure_code: "MIN_ORDER_AMOUNT_NOT_MET",
        failure_reason: `Minimum order amount of ₹${coupon.minOrderAmount} required for coupon '${code}'`,
      });
    }

    // 2. Calculate discount in paise
    let discountPaise = 0;
    const isPercentage = coupon.discountType === "percentage";

    if (isPercentage) {
      const effectiveSubtotalPaise = subtotalPaise > 0
        ? subtotalPaise
        : (coupon.minOrderAmount > 0 ? coupon.minOrderAmount * 100 : 249900);

      discountPaise = Math.round((effectiveSubtotalPaise * Number(coupon.discountValue)) / 100);
      if (coupon.maxDiscount > 0 && discountPaise > Math.round(Number(coupon.maxDiscount) * 100)) {
        discountPaise = Math.round(Number(coupon.maxDiscount) * 100);
      }
    } else {
      const flatDiscountPaise = Math.round(Number(coupon.discountValue) * 100);
      discountPaise = subtotalPaise > 0 ? Math.min(flatDiscountPaise, subtotalPaise) : flatDiscountPaise;
    }

    if (orderId && orderId.startsWith("order_") && discountPaise > 0) {
      try {
        await razorpay.orders.edit(orderId, {
          notes: {
            coupon_id: String(coupon._id),
            coupon_code: String(coupon.code),
            discount_amount: String(Math.round(discountPaise / 100)),
          },
        });
      } catch (_) {}
    }

    const summaryText =
      isPercentage
        ? `${coupon.discountValue}% OFF`
        : `₹${coupon.discountValue} OFF`;

    const descriptionText =
      isPercentage
        ? `Get ${coupon.discountValue}% off${coupon.maxDiscount ? ` upto ₹${coupon.maxDiscount}` : ""}`
        : `Flat ₹${coupon.discountValue} off on your fine jewellery order`;

    const promotionObj = {
      reference_id: String(coupon._id),
      type: "offer",
      code: coupon.code,
      summary: summaryText,
      description: descriptionText,
      value: discountPaise,
      value_type: "fixed_amount",
      discount: {
        value: discountPaise,
        value_type: "fixed_amount",
      },
    };

    return res.status(200).json({
      success: true,
      discount_amount: discountPaise,
      coupon_code: coupon.code,
      promotion: promotionObj,
      promotions: [promotionObj],
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
    const { cartIds, items: rawItems, couponId, shippingCost } = req.body || {};
    const effectiveCouponId = couponId || "";

    let cartItems = [];
    if (Array.isArray(cartIds) && cartIds.length > 0) {
      const validIds = cartIds.filter((id) => mongoose.isValidObjectId(id));
      if (validIds.length > 0) {
        cartItems = await cartModel.find({ _id: { $in: validIds } });
      }
    }

    if (!cartItems.length && Array.isArray(rawItems) && rawItems.length > 0) {
      cartItems = rawItems.map((item) => ({
        productId: String(item.productId || item.id || item._id || ""),
        variantId: item.variantId ? String(item.variantId) : "",
        size: item.size || item.selectedSize || "Standard",
        quantity: Number(item.quantity) || 1,
      }));
    }

    if (!cartItems.length) {
      return next(CustomeError(422, "Please select at least one item to checkout"));
    }

    const productIDs = cartItems
      .map((item) => item.productId)
      .filter((id) => mongoose.isValidObjectId(id));
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
        const lineItemObj = {
          sku: product.sku || String(product._id),
          variant_id: item.variantId ? String(item.variantId) : String(product._id),
          price: unitPricePaise,
          offer_price: unitPricePaise,
          quantity: item.quantity || 1,
          name: product.name + (item.size ? ` (${item.size})` : ""),
        };

        const rawImg = matchVariant?.images?.[0] || product.images?.[0];
        lineItemObj.image_url = formatValidUrl(rawImg) || "https://shveraa.com/logo.png";

        const validProdUrl = formatValidUrl(`/product/${product._id}`);
        lineItemObj.product_url = validProdUrl || `https://shveraa.com/product/${product._id}`;

        line_items.push(lineItemObj);
      }
    }

    let discountAmount = 0;
    let coupon = null;
    if (effectiveCouponId) {
      if (mongoose.isValidObjectId(effectiveCouponId)) {
        coupon = await couponModel.findById(effectiveCouponId);
      }
      if (!coupon) {
        coupon = await couponModel.findOne({ code: String(effectiveCouponId).trim().toUpperCase(), isActive: true });
      }
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

    const lineItemsTotalPaise = line_items.reduce(
      (sum, item) => sum + (Number(item.offer_price || item.price || 0) * Number(item.quantity || 1)),
      0
    );

    const cleanShippingCost = calculatedPrice >= 4999 ? 0 : Math.round(Number(shippingCost) || 0);
    const totalAmount = Math.max(0, Math.round(calculatedPrice + cleanShippingCost - discountAmount));
    const totalAmountPaise = Math.max(100, Math.round(totalAmount * 100));

    const options = {
      amount: totalAmountPaise,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
      line_items_total: lineItemsTotalPaise,
      line_items: line_items,
      notes: {
        cart_ids: Array.isArray(cartIds) ? cartIds.join(",") : "",
        coupon_id: coupon?._id ? String(coupon._id) : (effectiveCouponId || ""),
        coupon_code: coupon?.code || "",
        discount_amount: String(discountAmount),
        subtotal_paise: String(lineItemsTotalPaise),
      },
    };

    let order;
    try {
      order = await razorpay.orders.create(options);
    } catch (rzpErr) {
      console.error("[Magic Checkout] Razorpay order creation error:", JSON.stringify(rzpErr?.error || rzpErr?.message || rzpErr));
      return next(
        CustomeError(
          500,
          `Payment gateway error: ${rzpErr.error?.description || rzpErr.message || "Failed to create Razorpay order."}`
        )
      );
    }

    if (order && order.id) {
      magicOrderCache.set(order.id, {
        orderId: order.id,
        subtotalPaise: lineItemsTotalPaise,
        calculatedPrice: calculatedPrice,
        line_items: line_items,
        notes: options.notes,
        createdAt: Date.now(),
      });
      // Clean up cache entries older than 2 hours
      const TWO_HOURS = 2 * 60 * 60 * 1000;
      const now = Date.now();
      for (const [k, v] of magicOrderCache.entries()) {
        if (now - (v.createdAt || 0) > TWO_HOURS) {
          magicOrderCache.delete(k);
        }
      }
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
      items: rawItems,
      couponId,
      shippingCost,
      addressId,
    } = req.body || {};

    if (!razorpay_order_id) {
      return next(CustomeError(422, "razorpay_order_id is required"));
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
    let cartItems = [];
    if (Array.isArray(cartIds) && cartIds.length > 0) {
      const validIds = cartIds.filter((id) => mongoose.isValidObjectId(id));
      if (validIds.length > 0) {
        cartItems = await cartModel.find({ _id: { $in: validIds } });
      }
    }

    if (!cartItems.length && Array.isArray(rawItems) && rawItems.length > 0) {
      cartItems = rawItems.map((item) => ({
        productId: String(item.productId || item.id || item._id || ""),
        variantId: item.variantId ? String(item.variantId) : "",
        size: item.size || item.selectedSize || "Standard",
        quantity: Number(item.quantity) || 1,
      }));
    }

    const productIDs = cartItems
      .map((item) => item.productId)
      .filter((id) => mongoose.isValidObjectId(id));
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

    // 3. Coupon discount & Customer resolution
    let discount = 0;
    const effectiveCouponId = couponId || rzpOrder?.notes?.coupon_id || null;

    // 3.5. Resolve Customer User Account (Find existing by phone/email or create new user)
    const rzpCustomer = rzpOrder?.customer_details || {};
    const rzpShipping = rzpCustomer?.shipping_address || {};
    const contact = rzpShipping?.contact || rzpCustomer?.contact || "";
    const email = rzpCustomer?.email || "";
    const customerName = rzpShipping?.name || rzpCustomer?.name || "Customer";
    const cleanPhone = (contact || "").replace(/\D/g, "").slice(-10);

    let customerUser = req.user;
    if (!customerUser) {
      if (cleanPhone && cleanPhone.length === 10) {
        customerUser = await userModel.findOne({ phone: cleanPhone });
      }
      if (!customerUser && email) {
        customerUser = await userModel.findOne({ email });
      }
      if (!customerUser) {
        try {
          customerUser = await userModel.create({
            name: customerName,
            phone: cleanPhone && cleanPhone.length === 10 ? cleanPhone : null,
            email: email || `customer_${Date.now()}@shveraa.com`,
            role: "user",
            status: "active",
          });
        } catch (createUserErr) {
          console.warn("[Magic Checkout] User creation fallback:", createUserErr.message);
          customerUser = (await userModel.findOne({ role: "user" })) || (await userModel.findOne());
        }
      }
    }

    let couponDoc = null;
    if (effectiveCouponId) {
      if (mongoose.isValidObjectId(effectiveCouponId)) {
        couponDoc = await couponModel.findById(effectiveCouponId);
      }
      if (!couponDoc) {
        couponDoc = await couponModel.findOne({ code: String(effectiveCouponId).trim().toUpperCase() });
      }
    }

    if (couponDoc) {
      if (couponDoc.discountType === "percentage") {
        discount = Math.round((itemsPrice * couponDoc.discountValue) / 100);
        if (couponDoc.maxDiscount > 0 && discount > couponDoc.maxDiscount) {
          discount = couponDoc.maxDiscount;
        }
      } else {
        discount = Math.min(couponDoc.discountValue, itemsPrice);
      }

      if (customerUser?._id) {
        await couponModel.findByIdAndUpdate(couponDoc._id, {
          $inc: { usedCount: 1 },
          $addToSet: { usedBy: customerUser._id },
        });
      }
    }

    const cleanShippingCost = itemsPrice >= 4999 ? 0 : Math.round(Number(shippingCost) || 0);
    const totalAmount = Math.max(0, Math.round(itemsPrice - discount + cleanShippingCost));
    const orderNumber = generateOrderNumber();

    // 4. Resolve delivery address (From user selection or from Razorpay Magic Checkout modal)
    let addressDoc = null;
    if (addressId && mongoose.isValidObjectId(addressId)) {
      addressDoc = await addressModel.findById(addressId);
    }

    if (!addressDoc && rzpShipping) {
      try {
        addressDoc = await addressModel.create({
          userId: customerUser._id,
          fullName: rzpShipping.name || customerUser.name || "Customer",
          phone: rzpShipping.contact || customerUser.phone || "",
          street: rzpShipping.line1 || rzpShipping.street1 || "Street Address",
          locality: rzpShipping.line2 || rzpShipping.street2 || "",
          city: rzpShipping.city || "City",
          state: rzpShipping.state || "State",
          pincode: rzpShipping.zipcode || rzpShipping.postal_code || "395010",
          isDefault: true,
          label: "Home",
        });
      } catch (addrErr) {
        console.warn("[Magic Checkout] Address creation warning:", addrErr.message);
      }
    }

    const streetCombined = (rzpShipping?.line1 || rzpShipping?.street1 || "") + 
      ((rzpShipping?.line2 || rzpShipping?.street2) ? " " + (rzpShipping?.line2 || rzpShipping?.street2) : "");

    const orderAddress = {
      addressline: addressDoc
        ? `${addressDoc.street} ${addressDoc.locality || ""}`.trim()
        : streetCombined.trim() || "Address",
      city: addressDoc?.city || rzpShipping?.city || "Surat",
      state: addressDoc?.state || rzpShipping?.state || "Gujarat",
      country: "India",
      pincode: addressDoc?.pincode || rzpShipping?.zipcode || rzpShipping?.postal_code || "395010",
      phone: addressDoc?.phone || rzpShipping?.contact || customerUser.phone || "",
    };

    // 5. Create Delhivery shipping order
    let waybill = "";
    try {
      const delhiveryPayload = {
        shipments: [
          {
            name: addressDoc?.fullName || customerUser?.name || customerName,
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
      userId: customerUser._id,
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

    // 7. Clear cart items if user has db cart
    try {
      const validIds = (cartIds || []).filter((id) => mongoose.isValidObjectId(id));
      if (validIds.length > 0) {
        await cartModel.deleteMany({ _id: { $in: validIds } });
      }
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
        `Order ${orderNumber} (${paymentMethod.toUpperCase()}) has been placed by ${customerUser?.name || customerName}.`
      );

      const number = orderAddress.phone || req.user.phone
    const template_code = "shveraa_order_confirmation_template"
    const variables = {
      customer_name: addressDoc?.fullName || customerUser?.name || customerName,
      order_number: newOrder.orderNumber,
      product_name:products.map(product => product.name).join(", "),
      total_amount: newOrder.totalAmount,
      payment_method: isCodOrder ? "COD" : "Prepaid",
      order_date: new Date(newOrder.createdAt).toLocaleDateString("en-GB"),
      tracking_link: `https://www.delhivery.com/track-v2/package/${waybill}`
    }
    SendWhatsAppMessage(number, template_code,variables)
    } catch (notifyErr) {
      console.warn("Notification error:", notifyErr.message);
    }

    let generatedToken = null;
    try {
      generatedToken = generateJwtToken(customerUser);
    } catch (_) {}

    return res.status(200).json({
      success: true,
      message: "Order placed successfully via Magic Checkout",
      order: newOrder,
      token: generatedToken,
      user: {
        _id: customerUser._id,
        name: customerUser.name,
        email: customerUser.email,
        phone: customerUser.phone,
        role: customerUser.role,
      },
    });
  } catch (error) {
    return next(error);
  }
};
