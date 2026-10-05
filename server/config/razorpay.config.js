import Razorpay from 'razorpay';
import crypto from 'crypto';

const cleanValue = (val) => {
    if (!val) return '';
    return String(val).trim().replace(/^["']|["']$/g, '');
};

const key_id = cleanValue(process.env.RAZORPAY_API_KEY || process.env.RAZORPAY_KEY_ID);
const key_secret = cleanValue(process.env.RAZORPAY_API_SECRET || process.env.RAZORPAY_KEY_SECRET);

if (!key_id || !key_secret) {
    console.warn(`[Razorpay] Warning: Razorpay credentials missing. key_id present: ${Boolean(key_id)}, key_secret present: ${Boolean(key_secret)}`);
} else {
    console.log(`[Razorpay] Initialized with Key ID prefix: ${key_id.substring(0, 8)}... (Length: ${key_id.length})`);
}

export const razorpay = new Razorpay({
    key_id: key_id || 'dummy_key',
    key_secret: key_secret || 'dummy_secret',
});

export const razorpaySignature = (razorpay_order_id, razorpay_payment_id) => {
    return crypto
        .createHmac("sha256", key_secret)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");
};

export const getRazorpayKeyId = () => key_id;

