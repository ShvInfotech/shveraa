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

const OrderSuccess = () => {
  const location = useLocation();
  const [copied, setCopied] = useState(false);

  // Retrieve order from router state or fallback to storage, or provide rich default demo
  const fallbackOrder = {
    orderId: 'SHV-2026-849201',
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

  const handleCopyOrderId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(order.orderId);
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
            Thank you, <strong>{order.customer.fullName.split(' ')[0]}</strong>. A confirmation email and tax invoice have been dispatched to <strong>{order.customer.email}</strong>.
          </p>

          {/* Order ID Pill */}
          <div className="shv-order-id-bar">
            <span className="shv-order-id-label">Order Reference:</span>
            <strong className="shv-order-id-num">{order.orderId}</strong>
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
              Estimated Delivery: <strong>{order.estimatedDelivery}</strong>
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
                <span className="shv-step-time">Today</span>
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
                <p>Delivered to your doorstep by BlueDart Air</p>
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
              {order.items.map((item, idx) => (
                <div key={idx} className="shv-success-item-row">
                  <div className="shv-success-item-img">
                    <img
                      src={item.image || '/hero-ring-banner.jpg'}
                      alt={item.name}
                      onError={(e) => { e.currentTarget.src = '/hero-ring-banner.jpg'; }}
                    />
                  </div>
                  <div className="shv-success-item-info">
                    <h4>{item.name}</h4>
                    <div className="shv-success-item-meta">
                      <span>Size: {item.size}</span>
                      <span>•</span>
                      <span>Qty: {item.quantity}</span>
                      <span className="shv-success-hallmark-badge">925 BIS</span>
                    </div>
                  </div>
                  <div className="shv-success-item-price">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="shv-success-price-breakdown">
              <div className="shv-success-calc-row">
                <span>Subtotal</span>
                <span>₹{order.pricing.subtotal}</span>
              </div>
              {order.pricing.discount > 0 && (
                <div className="shv-success-calc-row shv-discount">
                  <span>Discount</span>
                  <span>-₹{order.pricing.discount}</span>
                </div>
              )}
              <div className="shv-success-calc-row">
                <span>Insured Express Shipping</span>
                <span>{order.pricing.shipping}</span>
              </div>
              {order.pricing.deliverySurcharge > 0 && (
                <div className="shv-success-calc-row">
                  <span>White-Glove VIP Delivery</span>
                  <span>+₹{order.pricing.deliverySurcharge}</span>
                </div>
              )}
              {order.pricing.codSurcharge > 0 && (
                <div className="shv-success-calc-row">
                  <span>COD Handling Fee</span>
                  <span>+₹{order.pricing.codSurcharge}</span>
                </div>
              )}
              <div className="shv-calc-divider" />
              <div className="shv-success-calc-row shv-total">
                <span>Grand Total Paid</span>
                <span>₹{order.pricing.total}</span>
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
                <p className="shv-meta-name">{order.customer.fullName}</p>
                <p className="shv-meta-text">{order.customer.address}</p>
                <p className="shv-meta-contact">Phone: {order.customer.phone}</p>
              </div>
            </div>

            <div className="shv-meta-card">
              <div className="shv-meta-card-header">
                <CreditCard size={18} className="shv-meta-icon" />
                <h4>Payment Method</h4>
              </div>
              <div className="shv-meta-card-body">
                <p className="shv-meta-pay-method">
                  {order.paymentMethod === 'upi' && 'UPI Instant Pay (Verified & Encrypted)'}
                  {order.paymentMethod === 'card' && 'Credit / Debit Card (Processed via Razorpay)'}
                  {order.paymentMethod === 'netbanking' && 'NetBanking (Authorized)'}
                  {order.paymentMethod === 'cod' && 'Cash on Delivery (Pay at Doorstep)'}
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
                  <h5>Atelier WhatsApp Concierge</h5>
                  <p>Have special delivery instructions or gift engraving questions?</p>
                  <a
                    href="https://wa.me/919876543210?text=Hello%20Shveraa%20Atelier,%20I%20have%20an%20inquiry%20regarding%20my%20order"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shv-concierge-link"
                  >
                    Chat with Silversmith Concierge →
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
