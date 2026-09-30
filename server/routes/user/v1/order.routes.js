import express from "express";
import { RozerpayPaymentOrder, RozerpayPaymentVerifyPlaceOrder, GetMyOrders, PlaceCodeOrder, TrackOrder } from "../../../controllers/user/v1/order.controller.js";
import { verifyjwtAccessToken } from "../../../middleware/jwtToken.js";
const router = express.Router()


router.post('/create-payment-order',verifyjwtAccessToken, RozerpayPaymentOrder)
router.post('/verify-payment-placeorder',verifyjwtAccessToken, RozerpayPaymentVerifyPlaceOrder)
router.post('/cod-placeorder',verifyjwtAccessToken, PlaceCodeOrder)

router.get('/my-orders', verifyjwtAccessToken, GetMyOrders)

router.post('/track-order',TrackOrder)
export default router
