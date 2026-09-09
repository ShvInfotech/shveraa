import React from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, Truck, ShieldCheck, Sparkles, CheckCircle2, ArrowRight, HelpCircle, MessageCircle } from 'lucide-react';

const Returns = () => {
  return (
    <div className="shv-legal-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="shv-legal-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Return &amp; Exchange Policy</span>
        </div>

        {/* Hero Header */}
        <div className="shv-legal-header">
          <span className="shv-legal-eyebrow">The Shveraa Assurance</span>
          <h1 className="shv-legal-title">30-Day Hassle-Free Returns &amp; Exchanges</h1>
          <p className="shv-legal-subtitle">
            Acquiring fine silver should inspire complete serenity. If a silhouette doesn't fit your aesthetic or finger size with absolute perfection, our 30-day graceful return protocol has you covered.
          </p>
          <div className="shv-legal-meta">
            <span>Complimentary Insured Doorstep Pickup</span>
            <span>•</span>
            <span>100% Purity Guaranteed</span>
          </div>
        </div>

        {/* 4-Step Visual Return Journey */}
        <div className="shv-returns-process-grid">
          <div className="shv-process-step-card">
            <div className="shv-step-num-badge">01</div>
            <div className="shv-step-icon-wrap">
              <RotateCcw size={20} />
            </div>
            <h3>Initiate Request</h3>
            <p>Notify our atelier team via our WhatsApp Concierge or account portal within 30 days of receiving your silver parcel.</p>
          </div>

          <div className="shv-process-step-card">
            <div className="shv-step-num-badge">02</div>
            <div className="shv-step-icon-wrap">
              <Truck size={20} />
            </div>
            <h3>Complimentary Pickup</h3>
            <p>We dispatch an insured BlueDart courier to collect the securely sealed velvet box from your doorstep at zero cost.</p>
          </div>

          <div className="shv-process-step-card">
            <div className="shv-step-num-badge">03</div>
            <div className="shv-step-icon-wrap">
              <ShieldCheck size={20} />
            </div>
            <h3>Atelier Verification</h3>
            <p>Our silversmiths gently inspect the piece to verify unworn condition, original BIS hallmark stamp, and certificates.</p>
          </div>

          <div className="shv-process-step-card">
            <div className="shv-step-num-badge">04</div>
            <div className="shv-step-icon-wrap">
              <Sparkles size={20} />
            </div>
            <h3>Instant Resolution</h3>
            <p>Your refund is transferred back to your original payment rail within 24–48 hours, or your replacement size is dispatched via Air.</p>
          </div>
        </div>

        {/* Policy Details Grid */}
        <div className="shv-legal-content-card">
          <section className="shv-legal-section">
            <h2>Eligibility for Graceful Return &amp; Exchange</h2>
            <p>
              To maintain pristine hygienic and precious metal integrity for all patrons, items submitted for return or exchange must satisfy the following criteria:
            </p>
            <div className="shv-criteria-split">
              <div className="shv-criteria-box positive">
                <h4>
                  <CheckCircle2 size={16} color="#10B981" /> Fully Eligible for Return / Exchange
                </h4>
                <ul>
                  <li>Pristine, unworn condition with zero scratches, dents, or signs of wear.</li>
                  <li>Accompanied by the original velvet presentation box, micro-suede pouch, and BIS 925 authenticity card.</li>
                  <li>Size exchange requests initiated within 30 calendar days of delivery.</li>
                  <li>Items received with manufacturing variance or transit damage.</li>
                </ul>
              </div>

              <div className="shv-criteria-box negative">
                <h4>
                  <HelpCircle size={16} color="#EF4444" /> Exceptions &amp; Ineligible Items
                </h4>
                <ul>
                  <li>Custom laser-engraved rings or bespoke monograms personalized to your specific initials.</li>
                  <li>Pieces altered, re-sized, or repaired by independent local third-party jewelers.</li>
                  <li>Requests submitted after the 30-day grace window has expired.</li>
                  <li>Items returned without original protective packaging.</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="shv-legal-section">
            <h2>Refund Timelines &amp; Modes of Settlement</h2>
            <p>
              Once your returned package arrives at our Jaipur Atelier and passes metallurgical inspection, refunds are processed immediately:
            </p>
            <ul>
              <li><strong>Prepaid Orders (UPI / NetBanking / Cards):</strong> Funds are credited directly back to the originating bank account or card within <strong>2 to 4 business days</strong>, depending on your banking institution.</li>
              <li><strong>Cash on Delivery (COD) Orders:</strong> Our concierge will request your verified UPI ID or NEFT bank particulars to initiate a direct digital transfer within 24 hours.</li>
              <li><strong>Atelier Store Credits:</strong> Patrons opting for store credits receive an instant voucher with an additional <strong>5% celebratory bonus credit</strong> valid for 12 months.</li>
            </ul>
          </section>

          <section className="shv-legal-section">
            <h2>The Shveraa Lifetime Care Covenant</h2>
            <p>
              Beyond the 30-day return window, your investment in Shveraa silver is safeguarded for life. Every piece is entitled to complimentary <strong>Lifetime Ultrasonic Spa Cleaning</strong> and annual <strong>Triple Rhodium Re-Dipping</strong> at our atelier to preserve its platinum-bright shine indefinitely.
            </p>
          </section>
        </div>

        {/* Direct Action Banner */}
        <div className="shv-returns-cta-banner">
          <div className="shv-returns-cta-text">
            <h3>Need to exchange a ring size or initiate a return?</h3>
            <p>Our dedicated concierge will coordinate your insured doorstep pickup in minutes.</p>
          </div>
          <div className="shv-returns-cta-buttons">
            <a
              href="https://wa.me/919876543210?text=Hello%20Shveraa%20Concierge,%20I%20would%20like%20to%20initiate%20a%20return%20or%20exchange%20for%20my%20order."
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

export default Returns;
