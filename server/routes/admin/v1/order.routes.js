import express from 'express';

import { verifyjwtAccessToken, checkRole } from '../../../middleware/jwtToken.js';
import { GetAllOrders, GetRTOReturnOrders } from '../../../controllers/admin/v1/order.controller.js';

const router = express.Router();

// GET /api/v1/admin/orders/all  – all orders (admin only)
router.get('/all', verifyjwtAccessToken, checkRole('admin'), GetAllOrders);

// GET /api/v1/admin/orders/return-rto       – return + RTO orders mixed together (admin only)
// GET /api/v1/admin/orders/return-rto/:type – a single flow ("return" | "rto")
router.get('/return-rto', verifyjwtAccessToken, checkRole('admin'), GetRTOReturnOrders);
router.get('/return-rto/:type', verifyjwtAccessToken, checkRole('admin'), GetRTOReturnOrders);
export default router;
