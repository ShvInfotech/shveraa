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



        const statusMapping = {
            "UD:Manifested": "pending",
            "UD:Not Picked": "pending",
            "UD:In Transit": "processing",
            "UD:Pending": "shipped",
            "UD:Dispatched": "out_for_delivery",
            "DL:Delivered": "delivered",


            "RT:In Transit": "RTO_IN_TRANSIT",
            "RT:Pending": "RTO_PENDING",
            "RT:Dispatched": "RTO_DISPATCHED",
            "DL:RTO": "RTO_DELIVERED",

            "PP:Open": "RETURN_OPEN",
            "PP:Scheduled": "RETURN_SCHEDULED",
            "PP:Dispatched": "RETURN_PICKUP_DISPATCHED",

            "PU:In Transit": "RETURN_IN_TRANSIT",
            "PU:Pending": "RETURN_PENDING",
            "PU:Dispatched": "RETURN_DISPATCHED",

            "DL:DTO": "RETURN_DELIVERED",

            "CN:Canceled": "RETURN_CANCELLED",
            "CN:Closed": "RETURN_CLOSED"
        };



        // const statusKey = `${status.StatusType}:${status.Status}`;
        // const newStatus = statusMapping[statusKey];
        console.log("Delhivery webhook", req.body)
        // {
        //     "Shipment": {
        //         "Status": {
        //             "Status": "Manifested",
        //             "StatusDateTime": "2019-01-09T17:10:42.767",
        //             "StatusType": "UD",
        //             "StatusLocation": "Chandigarh_Raiprkln_C (Chandigarh)",
        //             "Instructions": "Manifest uploaded"
        //         },
        //         "PickUpDate": "2019-01-09 17:10:42.543",
        //         "NSLCode": "X-UCI",
        //         "Sortcode": "IXC/MDP",
        //         "ReferenceNo": "28",
        //         "AWB": "XXXXXXXXXXXX"
        //     }
        // }

        const { shipment } = req.body || {};

        // froword order
        if (!shipment || !shipment.Status) {
            return res.status(400).json({ success: false, message: "Invalid webhook payload" });
        }

        if (shipment.StatusType == "UD" && shipment.Status == "Manifested") {
            await orderModel.findOneAndUpdate({ waybill: shipment.AWB }, { $set: { status: "pending" } }, { returnDocument: 'after' });
        }

        if (shipment.StatusType == "UD" && shipment.Status == "Not Picked") {
            await orderModel.findOneAndUpdate({ waybill: shipment.AWB }, { $set: { status: "pending" } }, { returnDocument: 'after' });
        }

        if (shipment.StatusType == "UD" && shipment.Status == "In Transit") {
            await orderModel.findOneAndUpdate({ waybill: shipment.AWB }, { $set: { status: "processing" } }, { returnDocument: 'after' });
        }


        if (shipment.StatusType == "UD" && shipment.Status == "Pending") {
            await orderModel.findOneAndUpdate({ waybill: shipment.AWB }, { $set: { status: "shipped" } }, { returnDocument: 'after' });
        }

        if (shipment.StatusType == "UD" && shipment.Status == "Pending") {
            await orderModel.findOneAndUpdate({ waybill: shipment.AWB }, { $set: { status: "out_for_delivery" } }, { returnDocument: 'after' });
        }

        if (shipment.StatusType == "DL" && shipment.Status == "Delivered") {
            await orderModel.findOneAndUpdate({ waybill: shipment.AWB }, { $set: { status: "delivered" } }, { returnDocument: 'after' });
        }


        //rto status 
        if (shipment.StatusType == "RT" && shipment.Status == "In Transit") {
            const rtoData = {
                status: shipment.Status,
                completeAt: null
            }
            await orderModel.findOneAndUpdate({ waybill: shipment.AWB }, { $set: { status: "cancelled" }, type: "rto", rtoData }, { returnDocument: 'after' });
        }


        if (shipment.StatusType == "RT" && shipment.Status == "Pending") {
            const rtoData = {
                status: shipment.Status,
                completeAt: null
            }
            await orderModel.findOneAndUpdate({ waybill: shipment.AWB }, { rtoData }, { returnDocument: 'after' });
        }

        if (shipment.StatusType == "RT" && shipment.Status == "Dispatched") {
            const rtoData = {
                status: shipment.Status,
                completeAt: null
            }
            await orderModel.findOneAndUpdate({ waybill: shipment.AWB }, { rtoData }, { returnDocument: 'after' });
        }


        if (shipment.StatusType == "DL" && shipment.Status == "RTO") {
            const rtoData = {
                status: shipment.Status,
                completeAt: new Date()
            }
            await orderModel.findOneAndUpdate({ waybill: shipment.AWB }, { rtoData }, { returnDocument: 'after' });
        }



        // customer return 

        if (shipment.StatusType == "PP" && shipment.Status == "Open") {
            await orderModel.findOneAndUpdate({ "returnData.waybill": shipment.AWB }, { $set: { "returnData.status": "pending" }, type: "return" }, { returnDocument: 'after' });
        }


        if (shipment.StatusType == "PP" && shipment.Status == "Scheduled") {
            await orderModel.findOneAndUpdate({ "returnData.waybill": shipment.AWB }, { $set: { "returnData.status": shipment.Status } }, { returnDocument: 'after' });
        }


        if (shipment.StatusType == "PP" && shipment.Status == "Dispatched") {
            await orderModel.findOneAndUpdate({ "returnData.waybill": shipment.AWB }, { $set: { "returnData.status": shipment.Status } }, { returnDocument: 'after' });
        }

        if (shipment.StatusType == "PU" && shipment.Status == "In Transit") {
            const order = await orderModel.findOneAndUpdate({ "returnData.waybill": shipment.AWB }, { $set: { "returnData.status": shipment.Status } }, { returnDocument: 'after' });

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


        if (shipment.StatusType == "PU" && shipment.Status == "Pending") {
            await orderModel.findOneAndUpdate({ "returnData.waybill": shipment.AWB }, { $set: { "returnData.status": "In Transit" } }, { returnDocument: 'after' });
        }

        if (shipment.StatusType == "PU" && shipment.Status == "Dispatched") {
            await orderModel.findOneAndUpdate({ "returnData.waybill": shipment.AWB }, { $set: { "returnData.status": shipment.Status } }, { returnDocument: 'after' });
        }

        if (shipment.StatusType == "DL" && shipment.Status == "DTO") {
            await orderModel.findOneAndUpdate({ "returnData.waybill": shipment.AWB }, { $set: { "returnData.status": shipment.Status } }, { returnDocument: 'after' });
        }

        if (shipment.StatusType == "DL" && shipment.Status == "DTO") {
            await orderModel.findOneAndUpdate({ "returnData.waybill": shipment.AWB }, { $set: { "returnData.status": shipment.Status, "returnData.completeAt": new Date() } }, { returnDocument: 'after' });
        }

        if (shipment.StatusType == "CN" && shipment.Status == "Canceled") {
            await orderModel.findOneAndUpdate({ "returnData.waybill": shipment.AWB }, { $set: { "returnData.status": shipment.Status } }, { returnDocument: 'after' });
        }

        if (shipment.StatusType == "CN" && shipment.Status == "Closed") {
            await orderModel.findOneAndUpdate({ "returnData.waybill": shipment.AWB }, { $set: { "returnData.status": shipment.Status } }, { returnDocument: 'after' });
        }



        return res.status(200).json({ success: true, message: "Webhook received successfully" });
    } catch (error) {
        return next(error);
    }

}