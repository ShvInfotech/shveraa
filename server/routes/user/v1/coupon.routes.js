import express from 'express';
import { VerifyCoupon } from '../../../controllers/user/v1/coupon.controller.js';

const router = express.Router();

router.post('/verify', VerifyCoupon);

export default router;
