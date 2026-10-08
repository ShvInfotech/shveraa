import crypto from "crypto";
import orderModel from "../models/order.model.js";
import { RazorpayRefundApi } from "../services/razorpayapi.js";

export const RozerpayRefundWebhook = async (req, res, next) => {
    try {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        const signature = req.headers["x-razorpay-signature"];

        if (!signature) {
            return res.status(400).json({
                success: false,
                message: "Razorpay webhook signature missing",
            });
        }

        // req.body is currently an Object
        const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(JSON.stringify(req.body));

        const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex");

        if (expectedSignature !== signature) {
            return res.status(401).json({
                success: false,
                message: "Invalid Razorpay webhook signature",
            });
        }

        const body = Buffer.isBuffer(req.body) ? JSON.parse(req.body.toString("utf8")) : req.body;

        console.log("====================================");
        console.log("RAZORPAY REFUND WEBHOOK VERIFIED");
        console.log("====================================");

        console.log("body data", body)
        console.log("payment entry", body.payload.payment.entity)
        console.log("refund entry", body.payload.refund.entity)


        if (body.event === 'refund.created') {

            await orderModel.findOneAndUpdate({ "payment.paymentId": body.payload.refund.entity?.payment_id, "refundData.status": "pending" }, { $set: { "refundData.status": "pending" } }, { returnDocument: 'after' });
            console.log("refund.created")
        }

        if (body.event === 'refund.processed') {
            await orderModel.findOneAndUpdate({ "payment.paymentId": body.payload.refund.entity?.payment_id, "refundData.status": "pending" }, { $set: { "refundData.status": "refunded", "refundData.refundedAt": Date.now(), "payment.status": "refunded" } }, { returnDocument: 'after' });
            console.log("refund.processed")

        }


        if (body.event === 'refund.failed') {
            await orderModel.findOneAndUpdate({ "payment.paymentId": body.payload.refund.entity?.payment_id, }, { $set: { "refundData.status": "failed" } }, { returnDocument: 'after' });
            console.log("refund.failed")

        }
        return res.status(200).json({ success: true })
    } catch (error) {
        console.error("Refund Webhook Error:", error);
        return next(error);
    }
}


export const DelhiveryScanWebhook = async (req, res, next) => {
    try {
        console.log("====================================");
        console.log("[Delhivery Webhook] Received payload:", JSON.stringify(req.body));
        console.log("[Delhivery Webhook] Headers authorization:", req.headers.authorization);
        console.log("====================================");

        const authHeader = req.headers.authorization || req.headers['x-delhivery-secret'] || req.headers['x-webhook-token'];
        const configuredSecret = process.env.DELHIVERY_WEBHOOK_SECRET;

        // If secret is configured in env, check authorization (supports raw secret, Bearer, Token)
        if (configuredSecret) {
            const cleanAuth = (authHeader || '').replace(/^(Bearer|Token)\s+/i, '').trim();
            const cleanSecret = configuredSecret.replace(/^(Bearer|Token)\s+/i, '').trim();
            if (authHeader !== configuredSecret && cleanAuth !== cleanSecret) {
                console.warn("[Delhivery Webhook] Unauthorized attempt. Received:", authHeader);
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                });
            }
        }

        // If empty payload or verification test ping from Delhivery portal
        if (!req.body || (typeof req.body === 'object' && Object.keys(req.body).length === 0) || req.body.test || req.body.event === 'ping') {
            console.log("[Delhivery Webhook] Ping/verification received, acknowledging 200 OK");
            return res.status(200).json({ success: true, message: "Webhook ping verified successfully" });
        }

        // Normalize payload into an array of scan/shipment records
        let records = [];
        if (Array.isArray(req.body)) {
            records = req.body;
        } else if (req.body.shipments && Array.isArray(req.body.shipments)) {
            records = req.body.shipments;
        } else if (req.body.Shipment) {
            records = [req.body.Shipment];
        } else if (req.body.shipment) {
            records = [req.body.shipment];
        } else if (req.body.ScanDetail) {
            records = [req.body];
        } else if (typeof req.body === 'object') {
            records = [req.body];
        }

        if (records.length === 0) {
            return res.status(200).json({ success: true, message: "No shipment records to process" });
        }

        for (const record of records) {
            const rawAwb = record.AWB || record.awb || record.waybill || record.Waybill || record.shipment?.AWB || record.Shipment?.AWB || record.ScanDetail?.AWB;
            if (!rawAwb) {
                console.log("[Delhivery Webhook] Record missing AWB, skipping:", record);
                continue;
            }
            const awb = String(rawAwb).trim();

            let status = '';
            let statusType = '';

            if (typeof record.Status === 'string') {
                status = record.Status;
                statusType = record.StatusType || record.statusType || '';
            } else if (typeof record.Status === 'object' && record.Status !== null) {
                status = record.Status.Status || record.Status.status || record.Status.name || '';
                statusType = record.Status.StatusType || record.Status.statusType || record.StatusType || '';
            } else if (typeof record.ScanDetail === 'object' && record.ScanDetail !== null) {
                status = record.ScanDetail.Scan || record.ScanDetail.Status?.Status || '';
                statusType = record.ScanDetail.ScanType || record.ScanDetail.Status?.StatusType || '';
            } else if (typeof record.status === 'string') {
                status = record.status;
                statusType = record.statusType || record.StatusType || '';
            }

            const normStatus = String(status || '').trim().toLowerCase();
            const normType = String(statusType || '').trim().toUpperCase();

            console.log(`[Delhivery Webhook] Processing AWB: ${awb}, Status: "${status}" (${normStatus}), StatusType: "${statusType}" (${normType})`);

            // 1. Forward Order Status Transitions
            if (normType === "UD" && (normStatus === "manifested" || normStatus === "not picked")) {
                await orderModel.findOneAndUpdate({ waybill: awb }, { $set: { status: "pending" } }, { returnDocument: 'after' });
            } else if (normType === "UD" && normStatus === "in transit") {
                await orderModel.findOneAndUpdate({ waybill: awb }, { $set: { status: "processing" } }, { returnDocument: 'after' });
            } else if (normType === "UD" && normStatus === "pending") {
                await orderModel.findOneAndUpdate({ waybill: awb }, { $set: { status: "shipped" } }, { returnDocument: 'after' });
            } else if (normType === "UD" && normStatus === "dispatched") {
                await orderModel.findOneAndUpdate({ waybill: awb }, { $set: { status: "out_for_delivery" } }, { returnDocument: 'after' });
            } else if ((normType === "DL" && normStatus === "delivered") || normStatus === "delivered") {
                const order = await orderModel.findOneAndUpdate(
                    { waybill: awb },
                    { $set: { status: "delivered", completeAt: new Date() } },
                    { returnDocument: 'after' }
                );
                if (order && order.payment && order.payment.method === "cod") {
                    await orderModel.findByIdAndUpdate(order._id, { $set: { "payment.status": "paid" } }, { returnDocument: "after" });
                }
            }

            // 2. RTO (Return to Origin) Status Transitions
            if (normType === "RT" || normStatus === "rto") {
                const rtoData = {
                    status: status || "RTO",
                    completeAt: normStatus === "rto" ? new Date() : null,
                };
                if (normStatus === "in transit" || normStatus === "rto") {
                    await orderModel.findOneAndUpdate({ waybill: awb }, { $set: { status: "cancelled", type: "rto", rtoData } }, { returnDocument: 'after' });
                } else {
                    await orderModel.findOneAndUpdate({ waybill: awb }, { $set: { rtoData } }, { returnDocument: 'after' });
                }
            }

            // 3. Customer Return Transitions
            if (normType === "PP") {
                if (normStatus === "open") {
                    await orderModel.findOneAndUpdate({ "returnData.waybill": awb }, { $set: { "returnData.status": "pending", type: "return" } }, { returnDocument: 'after' });
                } else if (normStatus === "scheduled" || normStatus === "dispatched") {
                    await orderModel.findOneAndUpdate({ "returnData.waybill": awb }, { $set: { "returnData.status": status } }, { returnDocument: 'after' });
                }
            } else if (normType === "PU") {
                if (normStatus === "in transit") {
                    const order = await orderModel.findOneAndUpdate({ "returnData.waybill": awb }, { $set: { "returnData.status": status } }, { returnDocument: 'after' });
                    if (order && order.payment && order.payment.method === "razorpay" && order.payment.status === "paid") {
                        try {
                            const refundResult = await RazorpayRefundApi(order);
                            const refundData = {
                                method: "razorpay",
                                status: "pending",
                                refundId: refundResult?.id || "",
                            };
                            await orderModel.findByIdAndUpdate(order._id, { $set: { "returnData.refundData": refundData } }, { returnDocument: 'after' });
                        } catch (rfErr) {
                            console.warn("[Delhivery Webhook] Auto refund error:", rfErr.message);
                        }
                    }
                } else {
                    await orderModel.findOneAndUpdate({ "returnData.waybill": awb }, { $set: { "returnData.status": status } }, { returnDocument: 'after' });
                }
            } else if (normType === "DL" && normStatus === "dto") {
                await orderModel.findOneAndUpdate({ "returnData.waybill": awb }, { $set: { "returnData.status": status, "returnData.completeAt": new Date() } }, { returnDocument: 'after' });
            } else if (normType === "CN" && (normStatus === "canceled" || normStatus === "closed")) {
                await orderModel.findOneAndUpdate({ "returnData.waybill": awb }, { $set: { "returnData.status": status } }, { returnDocument: 'after' });
            }
        }

        return res.status(200).json({ success: true, message: "Webhook processed successfully" });
    } catch (error) {
        console.error("[Delhivery Webhook Error]:", error);
        return next(error);
    }
};