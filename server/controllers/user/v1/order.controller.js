import { CustomeError } from "../../../middleware/globelError.js";
import cartModel from "../../../models/cart.model.js";
import productModel from "../../../models/product.model.js";
import couponModel from "../../../models/coupon.model.js";
import { razorpay, razorpaySignature, } from "../../../config/razorpay.config.js";
import OrderNumberGanrate from 'generate-unique-id'
import OrderModel from "../../../models/order.model.js";
import addressModel from "../../../models/address.model.js";
import { CreateShippingOrderService, PincodeServiceability, TrackShipmentService } from "../../../services/delhiveryApis.js";
import userModel from "../../../models/user.model.js";
import { sendNotification, SendWahtsappMessage } from "../../../helper/helper.js";




export const RozerpayPaymentOrder = async (req, res, next) => {
  try {
    const { cartIds, couponId, shippingCost, addressId } = req.body || {};
    const effectiveCouponId = couponId || "";

    if (!cartIds || !cartIds?.length) {
      return next(CustomeError(400, "CartIds are required"));
    }

    const address = await addressModel.findById(addressId)
    if (!address) {
      return next(CustomeError(400, "Address not found"));
    }

    const data = await PincodeServiceability(address.pincode)
  
    if (!data.delivery_codes || data.delivery_codes.length === 0) {
      return next(CustomeError(404, "Delivery Not  Available For The Given Pincode"))
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
    if (effectiveCouponId) {
      const coupon = await couponModel.findById(effectiveCouponId);

      if (coupon) {
        if (coupon.minOrderAmount && price < coupon.minOrderAmount) {
          return next(CustomeError(400, `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`),
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
    }

    const totalAmount = price + Number(shippingCost) - discountAmount;

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

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      couponId,
      shippingCost,
      cartIds,
      addressId,
    } = req.body || {};
    const effectiveCouponId = couponId || null;

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
    if (signature !== razorpay_signature) {
      return next(CustomeError(409, "payment not verify"));
    }

    const cartItems = await cartModel.find({ _id: { $in: cartIds } });
    const productIDs = cartItems.map((item) => item.productId);
    const products = await productModel.find({ _id: { $in: productIDs } });

    const items = [];
    let weigth = 0
    let width = 23
    let height = 23
    let quantity = 0
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
        weigth += (product.packing.weight || 0) * item.quantity
        quantity += item.quantity
      }
    }

    let price = 0;
    for (const item of items) {
      price += item.price * item.quantity;
    }

    let discount = 0;
    if (effectiveCouponId) {
      const coupon = await couponModel.findById(effectiveCouponId);
      if (coupon) {
        if (coupon.discountType === "percentage") {
          discount = Math.round((price * coupon.discountValue) / 100);
          if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
          }
        } else {
          discount = Math.min(coupon.discountValue, price);
        }
      }
    }



    const address = await addressModel.findById(addressId)
    const orderNumber = "SHV_" + OrderNumberGanrate({ length: 6, useLetters: false }) + Date.now().toString().slice(-6)
    const totalAmount = price - discount + Number(shippingCost);

    const delhiveryPayload = {
      "shipments": [
        {
          "name": req.user.name,
          "add": address.street + " " + address.locality,
          "pin": address.pincode,
          "city": address.city,
          "state": address.state,
          "country": "India",
          "phone": address.phone || req.user.phone,
          "order": orderNumber,
          "payment_mode": "Prepaid",
          "products_desc": "",
          "cod_amount": "0",
          "total_amount": totalAmount,
          "quantity": quantity,
          "weight": weigth * 1000,
          "shipment_width": width,
          "shipment_height": height,
          "shipping_mode": "Surface",
          "waybill": ""
        }
      ],
      "pickup_location": {
        "name": process.env.DELHIVERY_PICKUP_LOCATION,
      }
    }


    const result = await CreateShippingOrderService(delhiveryPayload)

    let waybill = ""
    if (result.success && result.packages && result.packages.length > 0) {
      waybill = result.packages[0].waybill;
    } else {
      return next(CustomeError(500, "Failed to create shipping order with Delhivery"));
    }


    const orderData = {
      userId: req.user._id,
      orderNumber: orderNumber,
      waybill: waybill,
      address: {
        addressline: address.street + " " + address.locality,
        city: address.city,
        state: address.state,
        country: "India",
        pincode: address.pincode,
        phone: address.phone,
      },
      items: items,
      couponId: effectiveCouponId,
      discount: discount,
      shippingcharges: shippingCost,
      amount: price,
      totalAmount: totalAmount,
      status: "pending",
      picuprequestId: "",
      payment: {
        method: "razorpay",
        status: "paid",
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      },
    };


    const newOrder = await OrderModel.create(orderData);


    const admins = await userModel.find({ role: "admin" }).select("deviceToken");
    const tokens = admins.flatMap(admin => admin.deviceToken || []);
    sendNotification(tokens, "New Order Placed", `Order ${orderNumber} has been placed by ${req.user.name}.`);

    return res.status(200).json({ success: true, message: "Payment verified and order placed successfully", order: newOrder });
  } catch (error) {
    return next(error);
  }
};



export const PlaceCodeOrder = async (req, res, next) => {
  try {

    const {
      couponId,
      shippingCost,
      cartIds,
      addressId,
    } = req.body || {};
    const effectiveCouponId = couponId || null;



    if (!cartIds || !cartIds?.length) {
      return next(CustomeError(422, "cartIds id required"));
    }


    const address = await addressModel.findById(addressId)

 const data = await PincodeServiceability(address.pincode)
    console.log("address Data", data)
    if (!data.delivery_codes || data.delivery_codes.length === 0) {
      return next(CustomeError(404, "Delivery Not  Available For The Given Pincode"))
    }

    const cartItems = await cartModel.find({ _id: { $in: cartIds } });
    const productIDs = cartItems.map((item) => item.productId);
    const products = await productModel.find({ _id: { $in: productIDs } });

    const items = [];
    let weigth = 0
    let width = 23
    let height = 23
    let quantity = 0
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
        weigth += (product.packing.weight || 0) * item.quantity
        quantity += item.quantity
      }
    }

    let price = 0;
    for (const item of items) {
      price += item.price * item.quantity;
    }

    let discount = 0;
    if (effectiveCouponId) {
      const coupon = await couponModel.findById(effectiveCouponId);
      if (coupon) {
        if (coupon.discountType === "percentage") {
          discount = Math.round((price * coupon.discountValue) / 100);
          if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) {
            discount = coupon.maxDiscount;
          }
        } else {
          discount = Math.min(coupon.discountValue, price);
        }
      }
    }



    const orderNumber = "SHV_" + OrderNumberGanrate({ length: 6, useLetters: false }) + Date.now().toString().slice(-6)
    const totalAmount = price - discount + Number(shippingCost);

    const delhiveryPayload = {
      "shipments": [
        {
          "name": req.user.name,
          "add": address.street + " " + address.locality,
          "pin": address.pincode,
          "city": address.city,
          "state": address.state,
          "country": "India",
          "phone": address.phone || req.user.phone,
          "order": orderNumber,
          "payment_mode": "COD",
          "products_desc": "",
          "cod_amount": totalAmount,
          "total_amount": totalAmount,
          "quantity": quantity,
          "weight": weigth * 1000,
          "shipment_width": width,
          "shipment_height": height,
          "shipping_mode": "Surface",
          "waybill": ""
        }
      ],
      "pickup_location": {
        "name": process.env.DELHIVERY_PICKUP_LOCATION,
      }
    }


    const result = await CreateShippingOrderService(delhiveryPayload)
    let waybill = ""
    if (result.success && result.packages && result.packages.length > 0) {
      waybill = result.packages[0].waybill;
    } else {
      return next(CustomeError(500, "Failed to create shipping order with Delhivery"));
    }


    const orderData = {
      userId: req.user._id,
      orderNumber: orderNumber,
      waybill: waybill,
      address: {
        addressline: address.street + " " + address.locality,
        city: address.city,
        state: address.state,
        country: "India",
        pincode: address.pincode,
        phone: address.phone,
      },
      items: items,
      couponId: effectiveCouponId,
      discount: discount,
      shippingcharges: shippingCost,
      amount: price,
      totalAmount: totalAmount,
      status: "pending",
      picuprequestId: "",
      payment: {
        method: "cod",
        status: "pending",
        orderId: null,
        paymentId: null,
      },
    };


    const newOrder = await OrderModel.create(orderData);


    const admins = await userModel.find({ role: "admin" }).select("deviceToken");
    const tokens = admins.flatMap(admin => admin.deviceToken || []);
    sendNotification(tokens, "New Order Placed", `Order ${orderNumber} has been placed by ${req.user.name}.`);
      SendWahtsappMessage(9714920969,"order is confrom")
    return res.status(200).json({ success: true, message: "Payment verified and order placed successfully", order: newOrder });
  } catch (error) {
    return next(error);
  }
};

// GET /api/v1/user/order/my-orders  → Returns orders for the logged-in user
export const GetMyOrders = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const orders = await OrderModel.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return next(error);
  }
};


export const TrackOrder = async (req, res, next) => {
  try {
    const { waybill } = req.body || {};

    if (!waybill) {
      return next(CustomeError(422, "Waybill Number Is Required"));
    }

    const result = await TrackShipmentService(waybill);

    const shipment = result?.ShipmentData?.[0]?.Shipment;
    if (!shipment) {
      return res.status(200).json({
        success: false,
        message: result?.Error || result?.message || "No tracking details found for this waybill yet",
        Scans: [],
        status: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Tracking Data Fatch Successfully",
      Scans: shipment.Scans || [],
      status: shipment.Status || null,
    });
  } catch (error) {
    return next(error);
  }
};




