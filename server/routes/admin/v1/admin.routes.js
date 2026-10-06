import express from 'express';
import AuthRoutes from './auth.routes.js';
import CategorisRoutes from './categoris.routes.js';
import ProductRoutes from './product.routes.js';
import CouponRoutes from './coupon.routes.js';
import ShopBannerRoutes from './shopBanner.routes.js';
import OrderRoutes from './order.routes.js';
import DashboardRoutes from './dashboard.routes.js';
import { GetStoreSettings, SaveStoreSettings, DeleteUploadedImage } from '../../../controllers/admin/v1/storeSettings.controller.js';
import { checkRole, verifyjwtAccessToken } from '../../../middleware/jwtToken.js';

const router = express.Router();

router.use('/auth', AuthRoutes);
router.use('/categoris', CategorisRoutes);
router.use('/products', ProductRoutes);
router.use('/coupons', CouponRoutes);
router.use('/shop-banners', ShopBannerRoutes);
router.use('/orders', OrderRoutes);
router.use('/dashboard', DashboardRoutes);
router.get('/store-settings', GetStoreSettings);
router.put('/store-settings', verifyjwtAccessToken, checkRole('admin'), SaveStoreSettings);
router.delete('/upload', verifyjwtAccessToken, checkRole('admin'), DeleteUploadedImage);

export default router;
