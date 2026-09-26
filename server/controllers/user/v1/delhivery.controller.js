import { CustomeError } from "../../../middleware/globelError.js"
import { CheckShippingChargesService, PincodeServiceability } from "../../../services/delhiveryApis.js"
import CartModel from "../../../models/cart.model.js"
import productModel from "../../../models/product.model.js"

export const Pincodedetails = async (req, res, next) => {
    try {

        const { pincode } = req.params

        // Validate pincode format (6 digits)
        if (!/^\d{6}$/.test(pincode)) {
            return next(CustomeError(400, "Invalid pincode. Please enter a valid 6-digit pincode"))
        }

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


        const { cartIds, pincode,payment_method,codAmount } = req.body
        const cartItems = await CartModel.find({ _id: { $in: cartIds } });
        const productIDs = cartItems.map((item) => item.productId);
        const products = await productModel.find({ _id: { $in: productIDs } });

        let totalWeightkg = 0;
        for (const item of cartItems) {
            const product = products.find((p) => p._id.toString() === item.productId);
            if (product) {
                totalWeightkg += (product.packing.weight || 0) * item.quantity;
            }
        }

        const totalWeightgrams = totalWeightkg * 1000; 


        const delhiveryData = {
            md: "E",
            ss: "Delivered",
            d_pin: pincode,
            o_pin: "395005",
            cgm: totalWeightgrams || 100,
            pt: payment_method || "Pre-paid" ,
            cod: codAmount || 0 
        }
        const data = await CheckShippingChargesService(delhiveryData)
         if(!data || !Array.isArray(data) || data.length === 0 ) {
            return next(CustomeError(404, "Shipping charges not available for the given pincode and weight"))
        }

        return res.status(200).json({ success: true, message: "Shipping charges fetched successfully", shippingCharges: data[0].total_amount })
    } catch (error) {
        return next(error)
    }
}