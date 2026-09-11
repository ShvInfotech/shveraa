import express from "express";
import { UserLogin, UserRegister, UserLogout, UserForgotPassword, ResetPassword, UserUpdateProfile } from "../../../controllers/user/v1/user.controller.js";
import { verifyjwtAccessToken } from "../../../middleware/jwtToken.js";
const router = express.Router()


router.post('/register',UserRegister)
router.post('/login',UserLogin)

router.patch('/update',verifyjwtAccessToken,UserUpdateProfile)

router.post('/logout',verifyjwtAccessToken,UserLogout)
router.post('/forgot-password',UserForgotPassword)
router.post('/reset-password/:token', ResetPassword)





export default router