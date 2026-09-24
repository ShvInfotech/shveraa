import express from "express";
import {
  UserLogin, UserRegister, UserLogout, UserForgotPassword, ResetPassword, UserUpdateProfile,
  GetUserAddresses, AddUserAddress, UpdateUserAddress, DeleteUserAddress, SetDefaultUserAddress,
  GetCart, SyncCart, AddToCart, UpdateCartItem, RemoveCartItem, ClearCart,
  GetWishlist, ToggleWishlist,
} from "../../../controllers/user/v1/user.controller.js";
import { verifyjwtAccessToken } from "../../../middleware/jwtToken.js";
const router = express.Router()

router.post('/register', UserRegister)
router.post('/login', UserLogin)

router.patch('/update', verifyjwtAccessToken, UserUpdateProfile)
router.post('/logout', verifyjwtAccessToken, UserLogout)
router.post('/forgot-password', UserForgotPassword)
router.post('/reset-password/:token', ResetPassword)


// Address Routes
router.get('/addresses', verifyjwtAccessToken, GetUserAddresses)
router.post('/addresses', verifyjwtAccessToken, AddUserAddress)
router.put('/addresses/:addressId', verifyjwtAccessToken, UpdateUserAddress)
router.delete('/addresses/:addressId', verifyjwtAccessToken, DeleteUserAddress)
router.put('/addresses/:addressId/default', verifyjwtAccessToken, SetDefaultUserAddress)

// Cart Routes
router.get('/cart', verifyjwtAccessToken, GetCart)
router.post('/cart/sync', verifyjwtAccessToken, SyncCart)
router.post('/cart/add', verifyjwtAccessToken, AddToCart)
router.put('/cart/:id', verifyjwtAccessToken, UpdateCartItem)
router.delete('/cart/:id', verifyjwtAccessToken, RemoveCartItem)
router.delete('/cart', verifyjwtAccessToken, ClearCart)

// Wishlist Routes
router.get('/wishlist', verifyjwtAccessToken, GetWishlist)
router.post('/wishlist/toggle', verifyjwtAccessToken, ToggleWishlist)




export default router
