import express from 'express';
import { RozerpayRefundWebhook } from '../webhooks/rozerpay.js';
const router = express.Router();


router.post('/rozerpay-refund',express.raw({ type: "application/json" }), RozerpayRefundWebhook)



export default router;
