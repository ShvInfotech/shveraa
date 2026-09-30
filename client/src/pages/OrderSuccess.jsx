import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Sparkles,
  Copy,
  Check,
  Package,
  Truck,
  ShieldCheck,
  Printer,
  ArrowRight,
  MessageCircle,
  MapPin,
  CreditCard,
  Gift,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../services/api';

const OrderSuccess = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  // Retrieve order from router state or fallback to storage, or provide rich default demo
  const fallbackOrder = {
    orderId: 'SHV-2026-849201',
    orderNumber: 'SHV-2026-849201',
    date: new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    customer: {
      fullName: 'Ananya Sharma',
      email: 'ananya.sharma@example.com',
      phone: '+91 98765 43210',
      address: '402, Lotus Heritage, Linking Road, Bandra West, Mumbai, Maharashtra - 400050',
    },
    items: [
      {
        id: 'prod_silver_ring_01',
        name: 'Lumina 925 Silver Solitaire Ring',
        image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=900&q=85',
        price: 1899,
        quantity: 1,
        size: 'US 7',
      },
    ],
    pricing: {
      subtotal: 1899,
      discount: 0,
      shipping: 'FREE',
      deliverySurcharge: 0,
      codSurcharge: 0,
      total: 1899,
    },
    deliveryOption: 'express',
    paymentMethod: 'upi',
    estimatedDelivery: '2–4 Business Days (Insured Air Express)',
  };

  let savedOrder = location.state?.order;
 
  if (!savedOrder) {
    try {
      const stored = localStorage.getItem('shveraa_last_order');
      if (stored) savedOrder = JSON.parse(stored);
    } catch {
      // ignore
    }
  }

  const order = savedOrder || fallbackOrder;

  const orderReference = order.orderNumber || order.orderId || order._id || 'SHV-ORDER';


  const customerFullName =order.customer?.fullName ||user?.name ||'Valued Patron';



  const customerFirstName = customerFullName.trim().split(' ')[0] || 'Valued Patron';

  const customerEmail =
    order.customer?.email ||
    order.customerEmail ||
    user?.email ||
    '';

  const customerPhone =
    order.address?.phone ||
    order.customer?.phone ||
    user?.phone ||
    '';

  // Address resolution
  let shippingAddressText = '';
  if (order.address && typeof order.address === 'object') {
    const parts = [
      order.address.addressline || order.address.street || order.address.line1,
      order.address.city,
      order.address.state,
      order.address.pincode ? `${order.address.pincode}` : '',
      order.address.country || 'India',
    ].filter(Boolean);
    shippingAddressText = parts.join(', ');
  } else if (order.customer?.address) {
    shippingAddressText = order.customer.address;
  } else {
    shippingAddressText = 'Shipping address recorded';
  }

  // Pricing calculations
  const subtotal = order.amount !== undefined ? Number(order.amount) : (Number(order.pricing?.subtotal) || 0);
  const discount = order.discount !== undefined ? Number(order.discount) : (Number(order.pricing?.discount) || 0);
  const shippingVal = order.shippingcharges !== undefined
    ? Number(order.shippingcharges)
    : (typeof order.pricing?.shipping === 'number'
        ? order.pricing.shipping
        : (order.pricing?.shipping === 'FREE' ? 0 : parseFloat(String(order.pricing?.shipping || '').replace(/[^0-9.]/g, '')) || 0));
  const shippingText = shippingVal === 0 ? 'FREE' : `₹${shippingVal.toLocaleString('en-IN')}`;
  const deliverySurcharge = Number(order.deliverySurcharge || order.pricing?.deliverySurcharge || 0);
  const codSurcharge = Number(order.codSurcharge || order.pricing?.codSurcharge || 0);
  const grandTotal = order.totalAmount !== undefined
    ? Number(order.totalAmount)
    : (Number(order.pricing?.total) || (subtotal - discount + shippingVal + deliverySurcharge + codSurcharge));

  // Payment method resolution
  const payMethodKey = (order.payment?.method || order.paymentMethod || '').toLowerCase();
  const paymentId = order.payment?.paymentId;
  let paymentMethodDisplay = 'Online Payment (Authorized & Secured)';
  if (payMethodKey === 'razorpay') {
    paymentMethodDisplay = paymentId
      ? `Razorpay Secure Online (Payment ID: ${paymentId})`
      : 'Razorpay Secure (Paid & Verified)';
  } else if (payMethodKey === 'upi') {
    paymentMethodDisplay = 'UPI Instant Pay (Verified & Encrypted)';
  } else if (payMethodKey === 'card') {
    paymentMethodDisplay = 'Credit / Debit Card (Processed via Razorpay)';
  } else if (payMethodKey === 'netbanking') {
    paymentMethodDisplay = 'NetBanking (Authorized)';
  } else if (payMethodKey === 'cod') {
    paymentMethodDisplay = 'Cash on Delivery (Pay at Doorstep)';
  }


  // Estimated delivery display
  const estimatedDeliveryDisplay = order.estimatedDelivery || '2–4 Business Days (Insured Air Express)';


  // Items resolution
  const items = Array.isArray(order.items) && order.items.length > 0 ? order.items : fallbackOrder.items;

  const handleCopyOrderId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(orderReference);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="shv-order-success-page">
      <div className="container">
        {/* Top Celebration Card */}
        <div className="shv-success-hero-card">
          <div className="shv-success-icon-wrap">
            <div className="shv-success-pulse-ring" />
            <CheckCircle2 size={42} className="shv-success-check-icon" />
          </div>

          <span className="shv-script-eyebrow">With Sincere Gratitude</span>
          <h1 className="shv-success-title">Your Atelier Order is Confirmed</h1>
          <p className="shv-success-subtitle">
            Thank you, <strong>{customerFirstName}</strong>.{customerEmail ? <> A confirmation email and tax invoice have been dispatched to <strong>{customerEmail}</strong>.</> : <> Your fine jewellery order has been confirmed successfully.</>}
          </p>

          {/* Order ID Pill */}
          <div className="shv-order-id-bar">
            <span className="shv-order-id-label">Order Reference:</span>
            <strong className="shv-order-id-num">{orderReference}</strong>
            <button
              type="button"
              onClick={handleCopyOrderId}
              className="shv-copy-order-btn"
              title="Copy Order ID"
              aria-label="Copy Order ID"
            >
              {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Visual Delivery Timeline */}
        <div className="shv-delivery-timeline-card">
          <div className="shv-timeline-header">
            <h3>Atelier Dispatch &amp; Tracking Timeline</h3>
            <span className="shv-timeline-est">
              Estimated Delivery: <strong>{estimatedDeliveryDisplay}</strong>
            </span>
          </div>

          <div className="shv-timeline-steps">
            <div className="shv-timeline-step completed">
              <div className="shv-step-marker">
                <Check size={14} />
              </div>
              <div className="shv-step-content">
                <h4>Order Placed</h4>
                <p>Payment authorized &amp; confirmed</p>
                <span className="shv-step-time">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Today'}</span>
              </div>
            </div>

            <div className="shv-timeline-connector completed" />

            <div className="shv-timeline-step active">
              <div className="shv-step-marker">
                <Sparkles size={14} />
              </div>
              <div className="shv-step-content">
                <h4>Artisan Inspection</h4>
                <p>Hand hallmarking &amp; ultrasonic polish</p>
                <span className="shv-step-time">Jaipur Atelier</span>
              </div>
            </div>

            <div className="shv-timeline-connector" />

            <div className="shv-timeline-step">
              <div className="shv-step-marker">
                <Package size={14} />
              </div>
              <div className="shv-step-content">
                <h4>Velvet Packaging</h4>
                <p>Sealed in velvet box with tamper ribbon</p>
                <span className="shv-step-time">Within 24 Hours</span>
              </div>
            </div>

            <div className="shv-timeline-connector" />

            <div className="shv-timeline-step">
              <div className="shv-step-marker">
                <Truck size={14} />
              </div>
              <div className="shv-step-content">
                <h4>Insured Delivery</h4>
                <p>{order.waybill ? `Dispatched via BlueDart Air (Waybill #${order.waybill})` : 'Delivered to your doorstep by BlueDart Air'}</p>
                <span className="shv-step-time">2–4 Business Days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details & Summary Split */}
        <div className="shv-success-details-grid">
          {/* Purchased Items List */}
          <div className="shv-success-items-card">
            <h3 className="shv-details-card-title">Purchased 925 Silver Pieces</h3>
            <div className="shv-success-items-list">
              {items.map((item, idx) => {
                const itemImage = getImageUrl(item.image || (item.images && item.images[0])) || '/hero-ring-banner.jpg';
                const itemName = item.name || 'Fine Silver Jewellery';
                const itemSize = item.size || 'Free Size';
                const itemColor = item.color;
                const itemQty = item.quantity || item.qty || 1;
                const itemPrice = Number(item.price || 0);

                return (
                  <div key={idx} className="shv-success-item-row">
                    <div className="shv-success-item-img">
                      <img
                        src={itemImage}
                        alt={itemName}
                        onError={(e) => { e.currentTarget.src = '/hero-ring-banner.jpg'; }}
                      />
                    </div>
                    <div className="shv-success-item-info">
                      <h4>{itemName}</h4>
                      <div className="shv-success-item-meta">
                        {itemColor && <span>{itemColor} • </span>}
                        <span>Size: {itemSize}</span>
                        <span>•</span>
                        <span>Qty: {itemQty}</span>
                        <span className="shv-success-hallmark-badge">925 BIS</span>
                      </div>
                    </div>
                    <div className="shv-success-item-price">
                      ₹{(itemPrice * itemQty).toLocaleString('en-IN')}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price Calculations */}
            <div className="shv-success-price-breakdown">
              <div className="shv-success-calc-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discount > 0 && (
                <div className="shv-success-calc-row shv-discount">
                  <span>Discount</span>
                  <span>-₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="shv-success-calc-row">
                <span>Insured Express Shipping</span>
                <span>{shippingText}</span>
              </div>
              {deliverySurcharge > 0 && (
                <div className="shv-success-calc-row">
                  <span>White-Glove VIP Delivery</span>
                  <span>+₹{deliverySurcharge.toLocaleString('en-IN')}</span>
                </div>
              )}
              {codSurcharge > 0 && (
                <div className="shv-success-calc-row">
                  <span>COD Handling Fee</span>
                  <span>+₹{codSurcharge.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="shv-calc-divider" />
              <div className="shv-success-calc-row shv-total">
                <span>Grand Total Paid</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Shipping & Payment Meta */}
          <div className="shv-success-meta-col">
            <div className="shv-meta-card">
              <div className="shv-meta-card-header">
                <MapPin size={18} className="shv-meta-icon" />
                <h4>Insured Shipping Address</h4>
              </div>
              <div className="shv-meta-card-body">
                <p className="shv-meta-name">{customerFullName}</p>
                <p className="shv-meta-text">{shippingAddressText}</p>
                {customerPhone && <p className="shv-meta-contact">Phone: {customerPhone}</p>}
              </div>
            </div>

            <div className="shv-meta-card">
              <div className="shv-meta-card-header">
                <CreditCard size={18} className="shv-meta-icon" />
                <h4>Payment Method</h4>
              </div>
              <div className="shv-meta-card-body">
                <p className="shv-meta-pay-method">
                  {paymentMethodDisplay}
                </p>
                <div className="shv-meta-purity-badge">
                  <ShieldCheck size={14} />
                  <span>BIS 925 Hallmark Certificate Included</span>
                </div>
              </div>
            </div>

            {/* Concierge Support Callout */}
            <div className="shv-meta-card shv-concierge-card">
              <div className="shv-concierge-inner">
                <div className="shv-concierge-icon">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h5>Atelier WhatsApp Support</h5>
                  <p>Have special delivery instructions or gift engraving questions?</p>
                  <a
                    href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hello Shveraa Atelier, I have an inquiry regarding my order ${orderReference}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shv-concierge-link"
                  >
                    Chat with Customer Support →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="shv-success-actions-row">
          <Link to="/shop" className="btn btn-primary btn-lg">
            <span>Continue Exploring Collection</span>
            <ArrowRight size={16} />
          </Link>
          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-outline btn-lg"
          >
            <Printer size={16} />
            <span>Print Invoice &amp; Certificate</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
