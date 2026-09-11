import express from "express";
import AuthRoutes from './auth.routes.js'
import CategorisRoutes from'./categoris.routes.js'
const router = express.Router()


router.use('/auth',AuthRoutes)
router.use('/categoris',CategorisRoutes)


export default router