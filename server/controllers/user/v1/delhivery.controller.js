import { CustomeError } from "../../../middleware/globelError.js"
import { PincodeServiceability } from "../../../services/delhiveryApis.js"



export const Pincodedetails = async(req,res,next)=>{
    try {

        const {pincode} = req.params

        // Validate pincode format (6 digits)
        if(!/^\d{6}$/.test(pincode)){
            return next(CustomeError(400,"Invalid pincode. Please enter a valid 6-digit pincode"))
        }

        const data = await PincodeServiceability(pincode)

        if(!data.delivery_codes || data.delivery_codes.length === 0){
            return next(CustomeError(404,"No delivery information available for the given pincode"))
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