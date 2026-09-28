import express from "express";
import { RozerpayPaymentOrder, RozerpayPaymentVerifyPlaceOrder } from "../../../controllers/user/v1/order.controller.js";
const router = express.Router()


router.post('/create-payment-order', RozerpayPaymentOrder)
router.post('/verify-payment-placeorder', RozerpayPaymentVerifyPlaceOrder)
export default router
