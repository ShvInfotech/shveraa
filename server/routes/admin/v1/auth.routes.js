import express from "express";
import { AdminLogin, AdminLogout } from "../../../controllers/admin/v1/auth.controller.js";
import { checkRole, verifyjwtAccessToken } from "../../../middleware/jwtToken.js";
const router = express.Router()

router.post('/login',AdminLogin)
router.post('/logout',verifyjwtAccessToken,checkRole('admin'), AdminLogout)

export default router