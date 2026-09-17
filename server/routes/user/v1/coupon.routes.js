import express from 'express';
import { VerifyCoupon } from '../../../controllers/user/v1/coupon.controller.js';
import { verifyjwtAccessToken } from '../../../middleware/jwtToken.js';

const router = express.Router();

router.post('/verify', verifyjwtAccessToken, VerifyCoupon);

export default router;
