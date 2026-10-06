import express from 'express';

import { verifyjwtAccessToken, checkRole } from '../../../middleware/jwtToken.js';
import { GetAdminDashboardStats } from '../../../controllers/admin/v1/dashboard.controller.js';

const router = express.Router();

// GET /api/v1/admin/dashboard/stats?range=8m | this-month | year
// Aggregated Dashboard overview: KPI stat cards, Overview chart buckets,
// Upcoming Deliveries and the Buying History feed (admin only).
router.get('/stats', verifyjwtAccessToken, checkRole('admin'), GetAdminDashboardStats);

export default router;
