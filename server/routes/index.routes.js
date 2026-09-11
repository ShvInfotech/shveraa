import express from "express";
const router = express.Router()
import UserRoutes from './user/v1/user.routes.js'
import AdminRoutes from './admin/v1/admin.routes.js'

router.use('/user',UserRoutes)
router.use('/admin',AdminRoutes)

export default router 