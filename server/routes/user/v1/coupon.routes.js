import express from 'express';
import { VerifyCoupon } from '../../../controllers/user/v1/coupon.controller.js';
import { optionalJwtAccessToken } from '../../../middleware/jwtToken.js';

const router = express.Router();

router.post('/verify', optionalJwtAccessToken, VerifyCoupon);

export default router;
