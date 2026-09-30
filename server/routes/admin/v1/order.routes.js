import express from 'express';

import { verifyjwtAccessToken, checkRole } from '../../../middleware/jwtToken.js';
import { GetAllOrders } from '../../../controllers/admin/v1/order.controller.js';

const router = express.Router();

// GET /api/v1/admin/orders/all  – all orders (admin only)
router.get('/all', verifyjwtAccessToken, checkRole('admin'), GetAllOrders);

export default router;
