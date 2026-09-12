import express from 'express';
import AuthRoutes from './auth.routes.js';
import CategorisRoutes from './categoris.routes.js';
import ProductRoutes from './product.routes.js';
import CouponRoutes from './coupon.routes.js';

const router = express.Router();

router.use('/auth', AuthRoutes);
router.use('/categoris', CategorisRoutes);
router.use('/products', ProductRoutes);
router.use('/coupons', CouponRoutes);

export default router;