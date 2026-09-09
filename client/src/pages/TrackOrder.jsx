import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Truck,
  Search,
  Package,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  Sparkles,
  Printer,
  MessageCircle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

const TrackOrder = () => {
  const [searchParams] = useSearchParams();
  const initialOrderId = searchParams.get('orderId') || '';

  const [orderIdInput, setOrderIdInput] = useState(initialOrderId);
  const [contactInput, setContactInput] = useState('');
  const [searchedOrder, setSearchedOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Pre-seeded fallback demo order
  const demoOrder = {
    orderId: 'SHV-856726',
    date: '09 Sep 2026',
    status: 'Dispatched — In Transit',
    carrier: 'BlueDart Air Express (Insured Precious Cargo)',
    awbNumber: 'BD-84920491',
    estimatedDelivery: '11 Sep 2026 (by 7:00 PM IST)',
    destination: 'Ahmedabad / Mumbai, Maharashtra — 380015',
    customerName: 'Aarav Mehta',
    items: [
      {
        name: 'Lumina 925 Silver Solitaire Ring',
        size: 'US 7',
        quantity: 1,
        price: 1899,
        image: '/hero-ring-banner.jpg',
      },
      {
        name: 'Eternal Wave Stacking Silver Band',
        size: 'US 7',
        quantity: 1,
        price: 1299,
        image: '/category-bracelet.jpg',
      },
    ],
    totalPaid: 3198,
    timelineSteps: [
      {
        title: 'Order Confirmed & Authorized',
        detail: 'Digital payment captured & order transmitted to atelier',
        time: '09 Sep 2026, 10:15 AM',
        status: 'completed',
      },
      {
        title: 'Atelier BIS Hallmarking & Quality Assay',
        detail: 'Laser purity testing & hand ultrasonic polish completed',
        time: '09 Sep 2026, 02:40 PM',
        status: 'completed',
      },
      {
        title: 'Sealed with Holographic Tamper Ribbon',
        detail: 'Handed over to BlueDart Air Express at Jaipur Cargo Terminal',
        time: '09 Sep 2026, 06:10 PM',
        status: 'active',
      },
      {
        title: 'Out for Doorstep Handover',
        detail: 'Signature-required delivery to recipient address',
        time: 'Expected 11 Sep 2026',
        status: 'pending',
      },
    ],
  };

  const handleTrackSubmit = (e) => {
    e?.preventDefault();
    const query = (orderIdInput || '').trim().toUpperCase();

    if (!query) {
      setErrorMsg('Please enter a valid Shveraa Order ID (e.g. SHV-856726)');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      setLoading(false);
      try {
        // 1. Check localStorage orders
        const storedStr = localStorage.getItem('shveraa_orders');
        const storedOrders = storedStr ? JSON.parse(storedStr) : [];
        const match = storedOrders.find(
          (o) => o.orderId?.toUpperCase() === query
        );

        if (match) {
          setSearchedOrder({
            orderId: match.orderId,
            date: match.date || 'Recent',
            status: match.status || 'Dispatched — In Transit',
            carrier: match.carrier || 'BlueDart Air Express (Insured)',
            awbNumber: match.trackingNumber || 'BD-84920491',
            estimatedDelivery: match.estimatedDelivery || '2–4 Business Days',
            destination: match.customer?.address || 'Customer Delivery Address',
            customerName: match.customer?.fullName || 'Valued Patron',
            items: match.items || demoOrder.items,
            totalPaid: match.pricing?.total || 3198,
            timelineSteps: demoOrder.timelineSteps,
          });
          return;
        }

        // 2. Check if query matches demo order
        if (query === 'SHV-856726' || query.startsWith('SHV-')) {
          setSearchedOrder({
            ...demoOrder,
            orderId: query,
          });
          return;
        }

        setErrorMsg(
          `No active consignment found for "${query}". Please verify your Order Reference or use demo order SHV-856726.`
        );
      } catch (err) {
        setSearchedOrder(demoOrder);
      }
    }, 450);
  };

  // Auto-run if orderId is in query params
  useEffect(() => {
    if (initialOrderId) {
      handleTrackSubmit();
    } else {
      // Default to demo order for rich immediate preview
      setSearchedOrder(demoOrder);
      setOrderIdInput('SHV-856726');
    }
  }, [initialOrderId]);

  return (
    <div className="shv-track-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="shv-track-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Track Consignment</span>
        </div>

        {/* Hero Header */}
        <div className="shv-track-header">
          <span className="shv-track-eyebrow">Insured Air Logistics</span>
          <h1 className="shv-track-title">Track Your Shveraa Consignment</h1>
          <p className="shv-track-subtitle">
            Every silver piece is securely dispatched in our tamper-proof signature velvet box and tracked in real-time via BlueDart Air Express.
          </p>
        </div>

        {/* Lookup Box */}
        <div className="shv-track-search-card">
          <form onSubmit={handleTrackSubmit} className="shv-track-form">
            <div className="shv-track-input-group">
              <label>Order Reference ID</label>
              <div className="shv-track-input-wrap">
                <Package size={17} className="shv-track-icon" />
                <input
                  type="text"
                  placeholder="e.g. SHV-856726"
                  value={orderIdInput}
                  onChange={(e) => setOrderIdInput(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="shv-track-input-group">
              <label>Mobile / Email (Optional)</label>
              <div className="shv-track-input-wrap">
                <Search size={17} className="shv-track-icon" />
                <input
                  type="text"
                  placeholder="+91 98765 43210 or email"
                  value={contactInput}
                  onChange={(e) => setContactInput(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary shv-track-btn" disabled={loading}>
              <Truck size={16} />
              <span>{loading ? 'Locating Consignment...' : 'Track Consignment'}</span>
            </button>
          </form>

          {/* Quick Demo Fill Pill */}
          <div className="shv-track-demo-row">
            <span>Quick test?</span>
            <button
              type="button"
              className="shv-track-demo-btn"
              onClick={() => {
                setOrderIdInput('SHV-856726');
                handleTrackSubmit();
              }}
            >
              Test with Demo Order: SHV-856726
            </button>
          </div>

          {errorMsg && <p className="shv-track-error-msg">{errorMsg}</p>}
        </div>

        {/* Tracking Details Display */}
        {searchedOrder && (
          <div className="shv-track-result-card">
            {/* Header Strip */}
            <div className="shv-track-result-header">
              <div>
                <div className="shv-track-ref-line">
                  <span className="shv-track-label">Consignment Ref:</span>
                  <strong>{searchedOrder.orderId}</strong>
                  <span className="shv-track-meta-dot">•</span>
                  <span className="shv-track-date">
                    <Clock size={13} /> Placed {searchedOrder.date}
                  </span>
                </div>
                <div className="shv-track-awb-line">
                  <Truck size={14} color="#A07E52" />
                  <span>
                    Carrier: <strong>{searchedOrder.carrier}</strong> | Waybill AWB:{' '}
                    <strong>{searchedOrder.awbNumber}</strong>
                  </span>
                </div>
              </div>

              <div>
                <span
                  className={`shv-track-status-pill ${
                    searchedOrder.status.toLowerCase().includes('delivered')
                      ? 'delivered'
                      : 'in-transit'
                  }`}
                >
                  <span className="shv-pulse-dot" />
                  {searchedOrder.status}
                </span>
              </div>
            </div>

            {/* Estimated Delivery Callout */}
            <div className="shv-track-est-box">
              <div className="shv-est-left">
                <span className="shv-est-label">Estimated Delivery Date:</span>
                <strong className="shv-est-val">{searchedOrder.estimatedDelivery}</strong>
              </div>
              <div className="shv-est-right">
                <MapPin size={15} />
                <span>Destination: {searchedOrder.destination}</span>
              </div>
            </div>

            {/* 4-Stage Visual Progress Bar */}
            <div className="shv-track-timeline-section">
              <h3 className="shv-track-section-title">Consignment Transit Progress</h3>

              <div className="shv-track-steps-flow">
                {searchedOrder.timelineSteps.map((step, idx) => (
                  <div key={idx} className={`shv-timeline-item ${step.status}`}>
                    <div className="shv-timeline-marker">
                      {step.status === 'completed' ? (
                        <CheckCircle2 size={16} />
                      ) : step.status === 'active' ? (
                        <Sparkles size={16} />
                      ) : (
                        <Clock size={16} />
                      )}
                    </div>
                    <div className="shv-timeline-body">
                      <h4>{step.title}</h4>
                      <p>{step.detail}</p>
                      <span className="shv-timeline-time">{step.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pieces Inside Consignment */}
            <div className="shv-track-items-section">
              <h3 className="shv-track-section-title">Enclosed 925 Silver Pieces</h3>
              <div className="shv-track-items-list">
                {searchedOrder.items.map((item, idx) => (
                  <div key={idx} className="shv-track-item-row">
                    <div className="shv-track-item-img">
                      <img
                        src={item.image || '/hero-ring-banner.jpg'}
                        alt={item.name}
                        onError={(e) => {
                          e.currentTarget.src = '/hero-ring-banner.jpg';
                        }}
                      />
                    </div>
                    <div className="shv-track-item-info">
                      <h4>{item.name}</h4>
                      <div className="shv-track-item-meta">
                        <span>Size: {item.size || 'Standard'}</span>
                        <span>•</span>
                        <span>Qty: {item.quantity || 1}</span>
                        <span className="shv-track-bis">925 BIS</span>
                      </div>
                    </div>
                    <div className="shv-track-item-price">
                      ₹{(item.price || 0) * (item.quantity || 1)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="shv-track-actions-bar">
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => window.print()}
              >
                <Printer size={14} />
                <span>Print Waybill Receipt</span>
              </button>

              <a
                href={`https://wa.me/919876543210?text=Hello%20Shveraa%20Concierge,%20I%20am%20tracking%20consignment%20${searchedOrder.orderId}%20and%20need%20assistance.`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
              >
                <MessageCircle size={15} />
                <span>WhatsApp Silversmith Support</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrder;
