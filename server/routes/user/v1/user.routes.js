import express from "express";
const router = express.Router()
import AuthRoutes from './auth.routes.js'
import CategoryRoutes from './category.routes.js'
import ProductRoutes from './product.routes.js'
import CouponRoutes from './coupon.routes.js'
import DelhiveryRoutes from './delhivery.routes.js'

router.use('/auth', AuthRoutes)
router.use('/categories', CategoryRoutes)
router.use('/products', ProductRoutes)
router.use('/coupons', CouponRoutes)
router.use('/delhivery',DelhiveryRoutes)
export default router
