import express from "express";
import { SubmitReview, GetProductReviews } from "../../../controllers/user/v1/review.controller.js";
import { verifyjwtAccessToken } from "../../../middleware/jwtToken.js";

const router = express.Router();

// Submit / update the logged-in customer's review (delivered orders only)
router.post("/", verifyjwtAccessToken, SubmitReview);

// Public: all reviews for a product (Product detail page reviews hub)
router.get("/product/:productId", GetProductReviews);

export default router;
