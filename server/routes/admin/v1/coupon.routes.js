import express from 'express';
import {
  AddCoupon,
  GetAllCoupons,
  GetCouponById,
  UpdateCoupon,
  DeleteCoupon,
} from '../../../controllers/admin/v1/coupon.controller.js';
import { checkRole, verifyjwtAccessToken } from '../../../middleware/jwtToken.js';

const router = express.Router();

router.get('/all', GetAllCoupons);
router.get('/:id', GetCouponById);

router.post('/add', verifyjwtAccessToken, checkRole('admin'), AddCoupon);
router.put('/update/:id', verifyjwtAccessToken, checkRole('admin'), UpdateCoupon);
router.delete('/delete/:id', verifyjwtAccessToken, checkRole('admin'), DeleteCoupon);

export default router;
