import express from "express";
import {
  GetMagicShippingInfo,
  GetMagicPromotions,
  ApplyMagicPromotion,
  CreateMagicOrder,
  VerifyMagicOrder,
} from "../controllers/magicCheckout.controller.js";
import { optionalJwtAccessToken } from "../middleware/jwtToken.js";

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
 * Accessible to both logged-in and guest users!
 */
router.post("/create-order", optionalJwtAccessToken, CreateMagicOrder);
router.post("/verify-order", optionalJwtAccessToken, VerifyMagicOrder);

export default router;
