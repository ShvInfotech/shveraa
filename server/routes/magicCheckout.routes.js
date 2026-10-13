import express from "express";
import {
  GetMagicShippingInfo,
  GetMagicPromotions,
  ApplyMagicPromotion,
  CreateMagicOrder,
  VerifyMagicOrder,
} from "../controllers/magicCheckout.controller.js";
import { verifyjwtAccessToken } from "../middleware/jwtToken.js";

const router = express.Router();

/**
 * Endpoints called by Razorpay Magic Checkout Server:
 * Support both GET and POST as required by Razorpay
 */
router.get("/shipping-info", GetMagicShippingInfo);
router.post("/shipping-info", GetMagicShippingInfo);

router.get("/promotions", GetMagicPromotions);
router.post("/promotions", GetMagicPromotions);

router.get("/apply-promotion", ApplyMagicPromotion);
router.post("/apply-promotion", ApplyMagicPromotion);

/**
 * Endpoints called by Client frontend:
 */
router.post("/create-order", verifyjwtAccessToken, CreateMagicOrder);
router.post("/verify-order", verifyjwtAccessToken, VerifyMagicOrder);

export default router;
