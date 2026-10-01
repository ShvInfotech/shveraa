


export const RazorpayRefundApi = async (order) => {
    try {
        if (!order?.payment?.paymentId) {
            throw new Error("Razorpay payment ID not found");
        }

        const url = `https://api.razorpay.com/v1/payments/${order.payment.paymentId}/refund`;

        const auth = Buffer.from(`${process.env.RAZORPAY_API_KEY}:${process.env.RAZORPAY_API_SECRET}`).toString("base64");

        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Basic ${auth}`,
                "Content-Type": "application/json",
            },

            body: JSON.stringify({
                amount: Math.round(order.totalAmount * 100),
                speed: "normal",
                receipt: `refund_${order.orderNumber}`,
                notes: {
                    orderId: order._id.toString(),
                    reason: "Order cancelled",
                },
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data?.error?.description || "Razorpay refund failed"
            );
        }

        return data;

    } catch (error) {
        console.log("Razorpay Refund Error:", error.message);
        throw error;
    }
};