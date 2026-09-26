import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Clock, ShieldCheck, RotateCcw, AlertCircle, Package, CreditCard, MessageCircle, ArrowRight, CheckCircle2, Box } from 'lucide-react';

const ShippingCancellation = () => {
  return (
    <div className="shv-legal-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="shv-legal-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Shipping &amp; Cancellation Policy</span>
        </div>

        {/* Hero Header */}
        <div className="shv-legal-header">
          <span className="shv-legal-eyebrow">Pan-India Express Logistics</span>
          <h1 className="shv-legal-title">Shipping &amp; Cancellation Policy</h1>
          <p className="shv-legal-subtitle">
            Every Shveraa creation is treated with reverence. Discover our guaranteed dispatch timelines, insured courier protocols, and straightforward cancellation terms.
          </p>
          <div className="shv-legal-meta">
            <span>100% Insured Air Transit</span>
            <span>•</span>
            <span>BlueDart &amp; Delhivery Partners</span>
            <span>•</span>
            <span>Tamper-Evident Packaging</span>
          </div>
        </div>

        {/* 4 Trust Highlights Grid */}
        <div className="shv-returns-process-grid">
          <div className="shv-process-step-card">
            <div className="shv-step-num-badge">01</div>
            <div className="shv-step-icon-wrap">
              <Truck size={20} strokeWidth={1.6} />
            </div>
            <h3>Free Insured Shipping</h3>
            <p>Enjoy complimentary insured doorstep delivery across India on every order above ₹999.</p>
          </div>

          <div className="shv-process-step-card">
            <div className="shv-step-num-badge">02</div>
            <div className="shv-step-icon-wrap">
              <Clock size={20} strokeWidth={1.6} />
            </div>
            <h3>5–7 Day Delivery</h3>
            <p>Dispatched from our Jaipur atelier with live SMS &amp; WhatsApp tracking updates at every stage.</p>
          </div>

          <div className="shv-process-step-card">
            <div className="shv-step-num-badge">03</div>
            <div className="shv-step-icon-wrap">
              <RotateCcw size={20} strokeWidth={1.6} />
            </div>
            <h3>12-Hour Cancellation</h3>
            <p>Need to cancel or adjust? Modify or cancel within 12 hours of order placement for a full instant refund.</p>
          </div>

          <div className="shv-process-step-card">
            <div className="shv-step-num-badge">04</div>
            <div className="shv-step-icon-wrap">
              <ShieldCheck size={20} strokeWidth={1.6} />
            </div>
            <h3>Zero Transit Risk</h3>
            <p>Every parcel is 100% insured. In the rare event of transit damage or loss, a fresh piece is dispatched immediately.</p>
          </div>
        </div>

        {/* Detailed Policy Sections */}
        <div className="shv-legal-content-card">
          {/* Section 1: Shipping Timelines */}
          <section className="shv-legal-section">
            <h2>Domestic Shipping Timelines &amp; Dispatch</h2>
            <p>
              We partner with premier express courier networks—including <strong>BlueDart, Delhivery, and DTDC Air</strong>—to ensure your silver jewelry arrives swiftly and securely:
            </p>
            <ul>
              <li><strong>Order Processing:</strong> Standard catalog pieces are inspected, ultrasonically cleaned, and dispatched within <strong>24 to 48 hours</strong> of payment confirmation.</li>
              <li><strong>Transit Duration:</strong> Metro destinations (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Kolkata) typically receive deliveries within <strong>3 to 5 business days</strong>. Non-metro regions and tier-2/3 cities arrive within <strong>5 to 7 business days</strong>.</li>
              <li><strong>Bespoke / Personalized Silhouettes:</strong> Customized nameplates, laser-engraved rings, and made-to-order sizes require an additional <strong>3 to 4 business days</strong> for precision artisan fabrication.</li>
              <li><strong>Live Tracking:</strong> The moment your parcel is scanned at the courier sorting hub, an automated tracking link is sent via WhatsApp and Email so you can monitor transit in real time.</li>
            </ul>
          </section>

          {/* Section 2: Shipping Charges */}
          <section className="shv-legal-section">
            <h2>Shipping Tariffs &amp; Cash on Delivery (COD)</h2>
            <p>
              We believe luxury should be transparent without hidden surcharges at checkout:
            </p>
            <div className="shv-criteria-split">
              <div className="shv-criteria-box positive">
                <h4>
                  <CheckCircle2 size={16} color="#10B981" /> Complimentary Shipping (Orders &ge; ₹999)
                </h4>
                <ul>
                  <li>Zero shipping fees for all prepaid orders above ₹999.</li>
                  <li>Fully insured air transit with signature requirement at doorstep.</li>
                  <li>Applicable across 19,000+ Indian postal pincodes.</li>
                </ul>
              </div>

              <div className="shv-criteria-box">
                <h4>
                  <Box size={16} color="#A07E52" /> Orders Below ₹999 &amp; COD Handling
                </h4>
                <ul>
                  <li>Orders below ₹999 incur a nominal flat shipping fee of <strong>₹79</strong>.</li>
                  <li>Cash on Delivery (COD) is available on orders up to ₹5,000 with a standard verification OTP.</li>
                  <li>A modest COD convenience charge of <strong>₹49</strong> is applied to cover courier cash-handling protocols.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3: Luxury Presentation */}
          <section className="shv-legal-section">
            <h2>Signature Presentation Packaging</h2>
            <p>
              Every Shveraa acquisition arrives gift-ready inside our signature luxury unboxing suite:
            </p>
            <ul>
              <li><strong>Midnight Charcoal Presentation Box:</strong> Rigid protective keepsake box with warm satin velvet interior.</li>
              <li><strong>Micro-Suede Travel Pouch:</strong> Protects your silver against moisture and atmospheric tarnishing when traveling.</li>
              <li><strong>Certified BIS 925 Hallmark Guarantee Card:</strong> Authenticity card certifying 92.5% pure silver and triple rhodium finish.</li>
              <li><strong>Microfiber Polish Cloth:</strong> Specially treated lint-free cloth to restore platinum radiance in seconds.</li>
            </ul>
          </section>

          {/* Section 4: Cancellation Policy */}
          <section className="shv-legal-section">
            <h2>Order Cancellation Guidelines</h2>
            <p>
              We understand plans can change. Here is how our cancellation procedure works:
            </p>
            <div className="shv-criteria-split">
              <div className="shv-criteria-box positive">
                <h4>
                  <CheckCircle2 size={16} color="#10B981" /> Pre-Dispatch Cancellations (Within 12 Hours)
                </h4>
                <ul>
                  <li>Orders can be cancelled with zero penalty within <strong>12 hours</strong> of placement.</li>
                  <li>Simply contact our Concierge via WhatsApp with your order reference number.</li>
                  <li>100% of your payment is refunded immediately to your original payment mode within <strong>24–48 hours</strong>.</li>
                </ul>
              </div>

              <div className="shv-criteria-box negative">
                <h4>
                  <AlertCircle size={16} color="#EF4444" /> Post-Dispatch Cancellations &amp; Exceptions
                </h4>
                <ul>
                  <li>Once an order is handed to the courier and tracking is issued, in-transit cancellation is not possible.</li>
                  <li>You may decline parcel acceptance at doorstep; refund will be processed upon safe return to our atelier.</li>
                  <li><strong>Custom &amp; Engraved Pieces:</strong> Personalized jewelry cannot be cancelled once production has begun.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 5: Refund Modes */}
          <section className="shv-legal-section">
            <h2>Refund Settlement Timelines</h2>
            <p>
              Approved cancellations and return refunds are credited through the originating payment rail:
            </p>
            <ul>
              <li><strong>UPI (Google Pay, PhonePe, Paytm):</strong> Reflected in your bank within <strong>24 to 48 hours</strong>.</li>
              <li><strong>Debit / Credit Cards &amp; NetBanking:</strong> Processed within <strong>3 to 5 banking days</strong> as per banking network clearing.</li>
              <li><strong>Cash on Delivery (COD) Orders:</strong> Transferred directly to your provided UPI ID or bank account via NEFT within 48 hours of return confirmation.</li>
              <li><strong>Atelier Store Credit:</strong> Instant credit to your account with a complimentary <strong>5% bonus credit</strong>.</li>
            </ul>
          </section>
        </div>

        {/* Direct Action Banner */}
        <div className="shv-returns-cta-banner">
          <div className="shv-returns-cta-text">
            <h3>Have a question regarding your dispatch or cancellation?</h3>
            <p>Our dedicated Jaipur Atelier Concierge is available 7 days a week to assist you.</p>
          </div>
          <div className="shv-returns-cta-buttons">
            <a
              href="https://wa.me/919876543210?text=Hello%20Shveraa%20Concierge,%20I%20have%20an%20inquiry%20regarding%20shipping%20or%20cancellation."
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <MessageCircle size={16} /> WhatsApp Concierge
            </a>
            <Link to="/contact" className="btn btn-outline">
              Email Client Care <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingCancellation;
