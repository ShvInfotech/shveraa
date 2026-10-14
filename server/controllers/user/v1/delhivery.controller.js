import mongoose from "mongoose";
import { CustomeError } from "../../../middleware/globelError.js";
import { CheckShippingChargesService, PincodeServiceability } from "../../../services/delhiveryApis.js";
import CartModel from "../../../models/cart.model.js";
import productModel from "../../../models/product.model.js";

export const Pincodedetails = async (req, res, next) => {
    try {

        const { pincode } = req.params

        // Validate pincode format (6 digits)
        if (!/^\d{6}$/.test(pincode)) {
            return next(CustomeError(400, "Invalid pincode. Please enter a valid 6-digit pincode"))
        }
         console.log(pincode)
        const data = await PincodeServiceability(pincode)

        if (!data.delivery_codes || data.delivery_codes.length === 0) {
            return next(CustomeError(404, "No delivery information available for the given pincode"))
        }

        const pincodeData = data.delivery_codes[0].postal_code

        return res.status(200).json({
            success: true,
            message: "Pincode details fetched successfully",
            data: {
                pincode: pincodeData.pin,
                city: pincodeData.city,
                state_code: pincodeData.state_code,
                country_code: pincodeData.country_code,
                is_cod_available: pincodeData.cod === "Y",
                is_prepaid_available: pincodeData.pre_paid === "Y",
                is_pickup_available: pincodeData.pickup === "Y",
                is_express_delivery: pincodeData.express_delivery === "Y",
                is_surface_delivery: pincodeData.surface === "Y",
                is_reverse_delivery: pincodeData.reverse === "Y",
                cod_message: pincodeData.cod === "Y"
                    ? "Cash on Delivery is available"
                    : "Cash on Delivery is not available",
            }
        })

    } catch (error) {
        return next(error)
    }
}


export const CheckShippingCharges = async (req, res, next) => {
    try {
        const { cartIds, items: rawItems, pincode, payment_method, codAmount } = req.body || {};

        let cartItems = [];
        if (Array.isArray(cartIds) && cartIds.length > 0) {
            const validIds = cartIds.filter((id) => mongoose.isValidObjectId(id));
            if (validIds.length > 0) {
                cartItems = await CartModel.find({ _id: { $in: validIds } });
            }
        }

        if (!cartItems.length && Array.isArray(rawItems) && rawItems.length > 0) {
            cartItems = rawItems.map((item) => {
                const pid = typeof item.productId === "object" && item.productId?._id
                    ? item.productId._id
                    : (item.productId || item.id || item._id || "");
                return {
                    productId: String(pid),
                    quantity: Number(item.quantity) || 1,
                };
            });
        }

        if (!cartItems.length && req.user?._id) {
            cartItems = await CartModel.find({ userId: req.user._id });
        }

        const productIDs = cartItems
            .map((item) => item.productId)
            .filter((id) => mongoose.isValidObjectId(id));
        const products = await productModel.find({ _id: { $in: productIDs } });

        let totalWeightkg = 0;
        for (const item of cartItems) {
            const product = products.find((p) => p._id.toString() === item.productId);
            if (product && product.packing?.weight) {
                totalWeightkg += Number(product.packing.weight) * item.quantity;
            } else {
                totalWeightkg += 0.1 * item.quantity;
            }
        }

        const totalWeightgrams = Math.max(100, Math.round(totalWeightkg * 1000));
        const destPincode = (pincode && /^\d{6}$/.test(String(pincode).trim())) ? String(pincode).trim() : "395010";

        const delhiveryData = {
            md: "E",
            ss: "Delivered",
            d_pin: destPincode,
            o_pin: process.env.SELLER_PIN || "395005",
            cgm: totalWeightgrams,
            pt: payment_method || "Pre-paid",
            cod: Number(codAmount) || 0,
        };

        const data = await CheckShippingChargesService(delhiveryData);
        if (!data || !Array.isArray(data) || data.length === 0) {
            return next(CustomeError(404, "Shipping charges not available for the given pincode and weight"));
        }

        const charges = Math.round(Number(data[0].total_amount) || 0);
        return res.status(200).json({
            success: true,
            message: "Shipping charges fetched successfully from Delhivery API",
            shippingCharges: charges,
            details: data[0],
        });
    } catch (error) {
        return next(error);
    }
};