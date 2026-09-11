import express from "express";
const router = express.Router()
import AuthRoutes from './auth.routes.js'


router.use('/auth',AuthRoutes)




export default router