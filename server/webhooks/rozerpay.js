import crypto from "crypto";
import orderModel from "../models/order.model.js";

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
            await orderModel.findOneAndUpdate({ "payment.paymentId": body.payload.refund.entity?.payment_id, "refundData.status": "pending" }, { $set: { "refundData.status": "refunded", "refundData.refundedAt": Date.now(),"payment.status": "refunded" } }, { returnDocument: 'after' });
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