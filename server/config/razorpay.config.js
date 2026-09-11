import Razorpay from'razorpay'
import crypto from'crypto'



const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_API_SECRET
})


const razorpaySignature = (razorpay_order_id, razorpay_payment_id) => {
    return crypto
        .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");
}

export  { razorpay, razorpaySignature }