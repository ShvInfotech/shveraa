import express from 'express';

import { verifyjwtAccessToken, checkRole } from '../../../middleware/jwtToken.js';
import { GetAllOrders, GetRTOReturnOrders,GetLabels } from '../../../controllers/admin/v1/order.controller.js';

const router = express.Router();

// GET /api/v1/admin/orders/all  – all orders (admin only)
router.get('/all', verifyjwtAccessToken, checkRole('admin'), GetAllOrders);

// GET /api/v1/admin/orders/return-rto       – return + RTO orders mixed together (admin only)
// GET /api/v1/admin/orders/return-rto/:type – a single flow ("return" | "rto")
router.get('/return-rto', verifyjwtAccessToken, checkRole('admin'), GetRTOReturnOrders);
router.get('/return-rto/:type', verifyjwtAccessToken, checkRole('admin'), GetRTOReturnOrders);
// POST /api/v1/admin/orders/labels – generate packing-slip labels.
// Must be a POST: the controller reads the waybill list (and the optional
// pending-pickup date/time) from req.body, which a GET request cannot carry.
router.post('/labels', verifyjwtAccessToken, checkRole('admin'), GetLabels);
router.get('/labels', GetLabels);
export default router;
