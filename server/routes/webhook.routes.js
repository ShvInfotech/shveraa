import express from 'express';
import { DelhiveryScanWebhook, RozerpayRefundWebhook } from '../webhooks/webhooks.js';
const router = express.Router();


router.post('/rozerpay-refund',express.raw({ type: "application/json" }), RozerpayRefundWebhook)
router.post('/delhivery-scan-webhook',DelhiveryScanWebhook)


export default router;
