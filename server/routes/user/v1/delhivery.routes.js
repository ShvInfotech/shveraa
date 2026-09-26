import express from "express";
import { CheckShippingCharges, Pincodedetails } from "../../../controllers/user/v1/delhivery.controller.js";
const router = express.Router()

router.get('/get-pincode-details/:pincode',Pincodedetails)
router.post('/check-shipping-charges',CheckShippingCharges)

export default router
