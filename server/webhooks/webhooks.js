import crypto from "crypto";
import orderModel from "../models/order.model.js";
import { RazorpayRefundApi } from "../services/razorpayapi.js";
import { SendWhatsAppMessage } from "../services/Whatsapp.js";

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

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authorization header missing"
            });
        }


        if (authHeader !== process.env.DELHIVERY_WEBHOOK_SECRET) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }


        console.log("CONTENT TYPE:", req.headers["content-type"]);
        console.log("BODY:", req.body);

        const { Shipment } = req.body || {};

        console.log("Shipment:", Shipment);
        // froword order
        if (!Shipment || !Shipment.Status) {
            return res.status(400).json({ success: false, message: "Invalid webhook payload" });
        }

        if (Shipment.Status.StatusType == "UD" && Shipment.Status.Status == "Manifested") {
            await orderModel.findOneAndUpdate({ waybill: Shipment.AWB }, { $set: { status: "pending" } }, { returnDocument: 'after' });
        }

        if (Shipment.Status.StatusType == "UD" && Shipment.Status.Status == "Not Picked") {
            await orderModel.findOneAndUpdate({ waybill: Shipment.AWB }, { $set: { status: "pending" } }, { returnDocument: 'after' });
        }

        if (Shipment.Status.StatusType == "UD" && Shipment.Status.Status == "In Transit") {
            await orderModel.findOneAndUpdate({ waybill: Shipment.AWB }, { $set: { status: "processing" } }, { returnDocument: 'after' });
        }


        if (Shipment.Status.StatusType == "UD" && Shipment.Status.Status == "Pending") {
            await orderModel.findOneAndUpdate({ waybill: Shipment.AWB }, { $set: { status: "shipped" } }, { returnDocument: 'after' });
        }

        if (Shipment.Status.StatusType == "UD" && Shipment.Status.Status == "Dispatched") {
            await orderModel.findOneAndUpdate({ waybill: Shipment.AWB }, { $set: { status: "out_for_delivery" } }, { returnDocument: 'after' });
        }

        if (Shipment.Status.StatusType == "DL" && Shipment.Status.Status == "Delivered") {
            const order = await orderModel.findOneAndUpdate({ waybill: Shipment.AWB }, { $set: { status: "delivered", completeAt: new Date() } }, { returnDocument: 'after' });
            if (!order) {
                console.log("Order not found:", Shipment.AWB);
                return res.status(404).json({
                    success: false,
                    message: "Order not found"
                });
            }
            if (order.payment.method == "cod") {
                await orderModel.findByIdAndUpdate(order._id, { $set: { "payment.status": "paid" } }, { returnDocument: "after" });
            }

            const user = await userModel.findOne({ _id: order.userId })
            const number = user.phone || order.address.phone
            const template_code = "shveraa_order_delivered"
            const variables = {
                customer_name: user.name,
                order_number: order.orderNumber,
                total_amount: order.totalAmount,
                order_date: new Date(order.completeAt).toLocaleDateString("en-GB"),

            }
            SendWhatsAppMessage(number, template_code, variables)

        }


        //rto status
        if (Shipment.Status.StatusType == "RT" && Shipment.Status.Status == "In Transit") {
            const rtoData = {
                status: Shipment.Status,
                completeAt: null
            }
            await orderModel.findOneAndUpdate({ waybill: Shipment.AWB }, { $set: { status: "cancelled", type: "rto", rtoData } }, { returnDocument: 'after' });
        }


        if (Shipment.Status.StatusType == "RT" && Shipment.Status.Status == "Pending") {
            const rtoData = {
                status: Shipment.Status,
                completeAt: null
            }
            await orderModel.findOneAndUpdate({ waybill: Shipment.AWB }, { $set: { rtoData } }, { returnDocument: 'after' });
        }

        if (Shipment.Status.StatusType == "RT" && Shipment.Status.Status == "Dispatched") {
            const rtoData = {
                status: Shipment.Status,
                completeAt: null
            }
            await orderModel.findOneAndUpdate({ waybill: Shipment.AWB }, { $set: { rtoData } }, { returnDocument: 'after' });
        }


        if (Shipment.Status.StatusType == "DL" && Shipment.Status.Status == "RTO") {
            const rtoData = {
                status: Shipment.Status,
                completeAt: new Date()
            }
            await orderModel.findOneAndUpdate({ waybill: Shipment.AWB }, { $set: { rtoData } }, { returnDocument: 'after' });
        }



        // customer return

        if (Shipment.Status.StatusType == "PP" && Shipment.Status.Status == "Open") {
            await orderModel.findOneAndUpdate({ "returnData.waybill": Shipment.AWB }, { $set: { "returnData.status": "pending" }, type: "return" }, { returnDocument: 'after' });
        }


        if (Shipment.Status.StatusType == "PP" && Shipment.Status.Status == "Scheduled") {
            await orderModel.findOneAndUpdate({ "returnData.waybill": Shipment.AWB }, { $set: { "returnData.status": Shipment.Status } }, { returnDocument: 'after' });
        }


        if (Shipment.Status.StatusType == "PP" && Shipment.Status.Status == "Dispatched") {
            await orderModel.findOneAndUpdate({ "returnData.waybill": Shipment.AWB }, { $set: { "returnData.status": Shipment.Status } }, { returnDocument: 'after' });
        }

        if (Shipment.Status.StatusType == "PU" && Shipment.Status.Status == "In Transit") {
            const order = await orderModel.findOneAndUpdate({ "returnData.waybill": Shipment.AWB }, { $set: { "returnData.status": Shipment.Status } }, { returnDocument: 'after' });

            if (order.payment.method === "razorpay" && order.payment.status === "paid") {
                const refundResult = await RazorpayRefundApi(order);
                const refundData = {
                    method: "razorpay",
                    status: "pending",
                    refundId: refundResult?.id || "",
                };
                await orderModel.findByIdAndUpdate(order._id, { $set: { "returnData.refundData": refundData } }, { returnDocument: 'after' });
            }

        }


        if (Shipment.Status.StatusType == "PU" && Shipment.Status.Status == "Pending") {
            await orderModel.findOneAndUpdate({ "returnData.waybill": Shipment.AWB }, { $set: { "returnData.status": "In Transit" } }, { returnDocument: 'after' });
        }

        if (Shipment.Status.StatusType == "PU" && Shipment.Status.Status == "Dispatched") {
            await orderModel.findOneAndUpdate({ "returnData.waybill": Shipment.AWB }, { $set: { "returnData.status": Shipment.Status } }, { returnDocument: 'after' });
        }



        if (Shipment.Status.StatusType == "DL" && Shipment.Status.Status == "DTO") {
            await orderModel.findOneAndUpdate({ "returnData.waybill": Shipment.AWB }, { $set: { "returnData.status": Shipment.Status, "returnData.completeAt": new Date() } }, { returnDocument: 'after' });
        }

        if (Shipment.Status.StatusType == "CN" && Shipment.Status.Status == "Canceled") {
            await orderModel.findOneAndUpdate({ "returnData.waybill": Shipment.AWB }, { $set: { "returnData.status": Shipment.Status } }, { returnDocument: 'after' });
        }

        if (Shipment.Status.StatusType == "CN" && Shipment.Status.Status == "Closed") {
            await orderModel.findOneAndUpdate({ "returnData.waybill": Shipment.AWB }, { $set: { "returnData.status": Shipment.Status } }, { returnDocument: 'after' });
        }

        return res.status(200).json({ success: true, message: "Webhook received successfully" });
    } catch (error) {
        return next(error);
    }

}