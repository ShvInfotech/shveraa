import mongoose from "mongoose";
import { CustomeError } from "../../../middleware/globelError.js";
import cartModel from "../../../models/cart.model.js";
import productModel from "../../../models/product.model.js";
import couponModel from "../../../models/coupon.model.js";
import { razorpay, razorpaySignature, } from "../../../config/razorpay.config.js";
import OrderModel from "../../../models/order.model.js";

const generateOrderNumber = () =>
  "SHV_" + Math.floor(100000 + Math.random() * 900000) + Date.now().toString().slice(-6);
import addressModel from "../../../models/address.model.js";
import { CancelShipmentService, CreateShippingOrderService, PincodeServiceability, TrackShipmentService } from "../../../services/delhiveryApis.js";
import userModel from "../../../models/user.model.js";
import { sendNotification, SendWahtsappMessage } from "../../../helper/helper.js";
import { RazorpayRefundApi } from "../../../services/razorpayapi.js";




export const RozerpayPaymentOrder = async (req, res, next) => {
  try {
    const { cartIds, couponId, shippingCost, addressId } = req.body || {};
    const effectiveCouponId = couponId || "";

    if (!cartIds || !cartIds?.length) {
      return next(CustomeError(400, "CartIds are required"));
    }

    if (!addressId || !mongoose.isValidObjectId(addressId)) {
      return next(CustomeError(400, "Valid delivery address is required. Please select or add an address."));
    }

    const address = await addressModel.findById(addressId);
    if (!address) {
      return next(CustomeError(400, "Delivery address not found"));
    }

    try {
      const data = await PincodeServiceability(address.pincode);
      if (data && data.delivery_codes && data.delivery_codes.length === 0) {
        return next(CustomeError(404, "Delivery not available for the given pincode"));
      }
    } catch (pincodeErr) {
      console.warn("Delhivery pincode serviceability check skipped:", pincodeErr.message);
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

    let order;
    try {
      order = await razorpay.orders.create(options);
    } catch (rzpErr) {
      console.error("Razorpay order creation error:", rzpErr);
      return next(CustomeError(500, `Payment gateway error: ${rzpErr.error?.description || rzpErr.message || "Failed to create Razorpay order. Please check Razorpay keys."}`));
    }

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
    let productdescription = ""
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
        productdescription += `${product.name}_${item.color}_(${item.size}) x ${item.quantity}, `
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



    if (!addressId || !mongoose.isValidObjectId(addressId)) {
      return next(CustomeError(400, "Valid delivery address is required"));
    }

    const address = await addressModel.findById(addressId);
    if (!address) {
      return next(CustomeError(400, "Delivery address not found"));
    }
    const orderNumber = generateOrderNumber();
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
          "products_desc": productdescription,
          "cod_amount": "0",
          "total_amount": totalAmount,
          "quantity": String(quantity),
          "weight": weigth * 1000,
          "shipment_width": width,
          "shipment_height": height,
          "shipping_mode": "Surface",
          "return_pin": process.env.SELLER_PIN,
          "return_city": process.env.SELLER_CITY,
          "return_phone": process.env.SELLER_PHONE,
          "return_add": process.env.SELLER_ADDRESS,
          "return_state": process.env.SELLER_STATE,
          "return_country": "India",
          "waybill": ""
        }
      ],
      "pickup_location": {
        "name": process.env.DELHIVERY_PICKUP_LOCATION,
      }
    }

    console.log(delhiveryPayload)
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


    if (!addressId || !mongoose.isValidObjectId(addressId)) {
      return next(CustomeError(400, "Valid delivery address is required"));
    }

    const address = await addressModel.findById(addressId);
    if (!address) {
      return next(CustomeError(400, "Delivery address not found"));
    }

    try {
      const data = await PincodeServiceability(address.pincode);
      console.log("address Data", data);
      if (data && data.delivery_codes && data.delivery_codes.length === 0) {
        return next(CustomeError(404, "Delivery not available for the given pincode"));
      }
    } catch (pincodeErr) {
      console.warn("Delhivery check skipped:", pincodeErr.message);
    }

    const cartItems = await cartModel.find({ _id: { $in: cartIds } });
    const productIDs = cartItems.map((item) => item.productId);
    const products = await productModel.find({ _id: { $in: productIDs } });

    const items = [];
    let weigth = 0
    let width = 23
    let height = 23
    let quantity = 0
    let productdescription = ""
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
        productdescription += `${product.name}_${item.color}_(${item.size}) x ${item.quantity}, `
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



    const orderNumber = generateOrderNumber();
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
          "products_desc": productdescription,
          "cod_amount": totalAmount,
          "total_amount": totalAmount,
          "quantity": quantity,
          "weight": weigth * 1000,
          "shipment_width": width,
          "shipment_height": height,
          "shipping_mode": "Surface",
          "waybill": "",
          "return_pin": process.env.SELLER_PIN,
          "return_city": process.env.SELLER_CITY,
          "return_phone": process.env.SELLER_PHONE,
          "return_add": process.env.SELLER_ADDRESS,
          "return_state": process.env.SELLER_STATE,
          "return_country": "India",
        }
      ],
      "pickup_location": {
        "name": process.env.DELHIVERY_PICKUP_LOCATION,
      }
    }
    console.log(delhiveryPayload)

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
    SendWahtsappMessage(9714920969, "order is confrom")
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


export const CancelShipment = async (req, res, next) => {
  try {
    const { waybill, orderId } = req.body || {};

    if (!orderId) {
      return next(CustomeError(422, "OrderId is Required"));
    }

    let order = await OrderModel.findOne(waybill ? { waybill, _id: orderId } : { _id: orderId });

    if (!order) {
      return next(CustomeError(404, "Order not found"));
    }

    if (!["pending", "accepted"].includes(order.status)) {
      return next(CustomeError(400, "Order cannot be cancelled at this stage"));
    }

    const activeWaybill = waybill || order.waybill;
    if (activeWaybill) {
      try {
        await CancelShipmentService(activeWaybill);
      } catch (shipmentErr) {
        console.warn("Delhivery cancel warning:", shipmentErr.message);
      }
    }

    let updatedOrder;
    if (order.payment?.method === "razorpay" && order.payment?.status === "paid") {
      try {
        const refundResult = await RazorpayRefundApi(order);
        const refundData = {
          method: "razorpay",
          status: "pending",
          refundId: refundResult?.id || "",
        };
        updatedOrder = await OrderModel.findByIdAndUpdate(order._id, { status: "cancelled", payment: { ...order.payment, status: "refunded" }, refundData }, { returnDocument: 'after' });
      } catch (rfErr) {
        console.warn("Razorpay refund error:", rfErr.message);
        updatedOrder = await OrderModel.findByIdAndUpdate(order._id, { status: "cancelled" }, { returnDocument: 'after' });
      }
    } else {
      updatedOrder = await OrderModel.findByIdAndUpdate(order._id, { status: "cancelled" }, { returnDocument: 'after' });
    }

    return res.status(200).json({
      success: true,
      message: "Order Cancelled Successfully",
      order: updatedOrder,
    });
  } catch (error) {
    return next(error);
  }
};


export const ReturnShipment = async (req, res, next) => {
  try {

    const { orderId, accountDetails, reason } = req.body || {};

    if (!orderId) {
      return next(CustomeError(422, "OrderId is Required"));
    }

    let order = await OrderModel.findById(orderId);

    if (!order) {
      return next(CustomeError(404, "Order not found"));
    }

    if (order.status !== "delivered") {
      return next(CustomeError(400, "Return shipment can only be requested for delivered orders"));
    }



    const completeAt = new Date(order.completeAt);

    const currentDate = new Date();

    const daysPassed = Math.floor(
      (currentDate - completeAt) / (1000 * 60 * 60 * 24)
    );

    if (daysPassed >= 7) {
      return next(CustomeError(400, "Return period has expired. Returns are allowed only within 7 days of delivery"));
    }


    if (order.payment?.method === "cod") {
      if (!accountDetails || !accountDetails.accountNumber || !accountDetails.ifscCode || !accountDetails.accountHolderName || !accountDetails.accountType) {
        return next(CustomeError(422, "Bank account details are required for COD order return"));
      }
    }


    const productIDs = order.items.map((item) => item.productId);
    const products = await productModel.find({ _id: { $in: productIDs } });




    const quantity = order.items.reduce((acc, item) => acc + item.quantity, 0);
    const totalAmount = order.totalAmount;
    let weigth = 0
    const width = 23;
    const height = 23;
    products.forEach((product) => {
      weigth += (product.packing.weight || 0) * order.items.find((item) => item.productId.toString() === product._id.toString()).quantity;
    })






    const delhiveryPayload = {
      shipments: [
        {
          name: req.user.name,

          // Customer address: parcel pickup location
          add: order.address.addressline,
          pin: String(order.address.pincode),
          city: order.address.city,
          state: order.address.state,
          country: "India",
          phone: order.address.phone || req.user.phone,

          order: `RETURN-${order.orderNumber}`,
          payment_mode: "Pickup",

          // Seller / return destination address
          return_name: process.env.SELLER_NAME,
          return_add: process.env.SELLER_ADDRESS,
          return_pin: process.env.SELLER_PIN,
          return_city: process.env.SELLER_CITY,
          return_state: process.env.SELLER_STATE,
          return_country: "India",
          return_phone: process.env.SELLER_PHONE,

          products_desc: "",
          quantity: quantity,
          total_amount: totalAmount,

          weight: weigth * 1000,
          shipment_width: width,
          shipment_height: height,
          shipping_mode: "Surface",
          waybill: ""
        }
      ],

      pickup_location: {
        name: process.env.DELHIVERY_PICKUP_LOCATION
      }
    };


    const result = await CreateShippingOrderService(delhiveryPayload)
    let waybill = ""
    if (result.success && result.packages && result.packages.length > 0) {
      waybill = result.packages[0].waybill;
    } else {
      return next(CustomeError(500, "Failed to create shipping order with Delhivery"));
    }
    const returnData = {
      waybill: waybill,
      status: "pending",
      reason: reason || "No reason provided"
    }

    if (order.payment?.method === "razorpay" && order.payment?.status === "paid") {

      const refundResult = await RazorpayRefundApi(order);

      const refundData = {
        method: "razorpay",
        status: "pending",
        refundId: refundResult?.id || "",
      };
      order = await OrderModel.findByIdAndUpdate(order._id, { type: "return", status: "cancelled", payment: { ...order.payment, status: "refunded" }, returnData, refundData }, { returnDocument: 'after' });
    } else {
      const refundData = {
        method: "cod",
        status: "pending",
        refundId: "",
        accountDetails: accountDetails || {}
      };
      order = await OrderModel.findByIdAndUpdate(order._id, { type: "return", status: "cancelled", payment: { ...order.payment, status: "refunded" }, returnData, refundData }, { returnDocument: 'after' });
    }



    return res.status(200).json({ success: true, message: "Return shipment request created successfully" });
  } catch (error) {
    return next(error);
  }
}





