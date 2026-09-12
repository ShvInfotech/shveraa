import express from "express";
const router = express.Router()
import AuthRoutes from './auth.routes.js'
import CategoryRoutes from './category.routes.js'
import ProductRoutes from './product.routes.js'
import CouponRoutes from './coupon.routes.js'

router.use('/auth', AuthRoutes)
router.use('/categories', CategoryRoutes)
router.use('/products', ProductRoutes)
router.use('/coupons', CouponRoutes)

export default router