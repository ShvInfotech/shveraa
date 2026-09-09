import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2, ArrowRight } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="shv-legal-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="shv-legal-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Privacy Policy</span>
        </div>

        {/* Hero Header */}
        <div className="shv-legal-header">
          <span className="shv-legal-eyebrow">Institutional Governance</span>
          <h1 className="shv-legal-title">Privacy &amp; Data Protection Policy</h1>
          <p className="shv-legal-subtitle">
            At Shveraa Atelier, safeguarding your personal data and precious metal acquisitions is as foundational to us as certifying 925 sterling purity.
          </p>
          <div className="shv-legal-meta">
            <span>Last Amended: September 2026</span>
            <span>•</span>
            <span>Compliant with Indian DPDP Act &amp; RBI Payment Directives</span>
          </div>
        </div>

        {/* 4 Trust Seals */}
        <div className="shv-legal-trust-grid">
          <div className="shv-trust-seal-card">
            <Lock size={22} className="shv-seal-icon" />
            <h4>256-Bit SSL Encryption</h4>
            <p>End-to-end encrypted transport layer for all checkout &amp; profile operations.</p>
          </div>
          <div className="shv-trust-seal-card">
            <ShieldCheck size={22} className="shv-seal-icon" />
            <h4>Zero Card Storage</h4>
            <p>Payment credentials are fully tokenized via RBI-licensed gateways (UPI/Razorpay).</p>
          </div>
          <div className="shv-trust-seal-card">
            <Eye size={22} className="shv-seal-icon" />
            <h4>Never Sold or Leased</h4>
            <p>Your browsing habits and purchase histories are never shared with advertising brokers.</p>
          </div>
          <div className="shv-trust-seal-card">
            <FileText size={22} className="shv-seal-icon" />
            <h4>Patron Data Sovereignty</h4>
            <p>Request comprehensive records or permanent account erasure with one simple request.</p>
          </div>
        </div>

        {/* Legal Body Sections */}
        <div className="shv-legal-content-card">
          <section className="shv-legal-section">
            <h2>1. Scope &amp; Atelier Philosophy</h2>
            <p>
              This Privacy Policy applies to all services, online interactions, concierge consultations, and purchases made via <strong>Shveraa Silver Atelier</strong> ("Shveraa", "we", "us", or "our"). When you explore our silver collections, register an account, or acquire our hallmarked jewellery, you entrust us with essential particulars. We honor that trust with strict transparency and adherence to India's <em>Digital Personal Data Protection (DPDP) Act</em>.
            </p>
          </section>

          <section className="shv-legal-section">
            <h2>2. Information We Collect</h2>
            <p>We only collect information strictly requisite to providing an elevated jewellery acquisition experience:</p>
            <ul>
              <li><strong>Contact &amp; Identity Details:</strong> Full name, telephone number, and email address used for order authorization, digital tax invoicing, and BlueDart dispatch updates.</li>
              <li><strong>Insured Delivery Coordinates:</strong> Physical residential or workplace shipping address, landmark, city, state, and PIN code required for our insured logistics partners.</li>
              <li><strong>Curated Preferences:</strong> Ring sizing specifications, custom engraving inscriptions, saved wishlist silhouettes, and browsing history.</li>
              <li><strong>Technical Metadata:</strong> IP address, device telemetry, browser type, and cookie tokens collected to prevent fraudulent transactions and enhance interface performance.</li>
            </ul>
          </section>

          <section className="shv-legal-section">
            <h2>3. Secure Payment Architecture</h2>
            <p>
              Shveraa operates under a strict <strong>Zero Sensitive Data Storage Covenant</strong>. We do not capture, log, or hold raw debit/credit card numbers, expiry dates, or CVV/CVC codes on our internal servers. All financial transactions are securely handed off to RBI-approved payment aggregators through TLS 1.3 cryptographic protocols.
            </p>
          </section>

          <section className="shv-legal-section">
            <h2>4. Dispatches &amp; Insured Courier Sharing</h2>
            <p>
              To fulfill your order safely, we share strictly necessary delivery particulars (Name, Address, and Phone Number) with our trusted high-security logistics partners, primarily <strong>BlueDart Express Air</strong>. These partners are legally bound to confidentiality and are strictly prohibited from utilizing your contact details for unauthorized promotional communications.
            </p>
          </section>

          <section className="shv-legal-section">
            <h2>5. Patron Rights &amp; Data Rectification</h2>
            <p>
              Every Shveraa patron retains absolute sovereignty over their data:
            </p>
            <ul>
              <li><strong>Right to Rectify:</strong> Update your address, contact phone, or preferences anytime within your <Link to="/account?tab=security">Atelier Account Dashboard</Link>.</li>
              <li><strong>Right to Withdraw Consent:</strong> Opt out of WhatsApp order alerts or private vault newsletters at any time.</li>
              <li><strong>Right to Forgottenness:</strong> Request complete deletion of your account and historical records by notifying our Grievance Officer.</li>
            </ul>
          </section>

          <section className="shv-legal-section">
            <h2>6. Grievance Officer &amp; Atelier Concierge</h2>
            <p>
              In accordance with the Information Technology Act 2000 and the DPDP Act, the contact coordinates for our designated Grievance Redressal Officer are as follows:
            </p>
            <div className="shv-officer-card">
              <strong>Atelier Data Protection Officer</strong>
              <span>Shveraa Silver Atelier Private Limited</span>
              <span>12, Silversmith District, MI Road, Jaipur, Rajasthan — 302001</span>
              <span>Email: <a href="mailto:privacy@shveraa.luxury">privacy@shveraa.luxury</a></span>
              <span>Direct Concierge: +91 98765 43210</span>
            </div>
          </section>
        </div>

        {/* CTA Banner */}
        <div className="shv-legal-footer-banner">
          <div>
            <h3>Have specific questions regarding your data or orders?</h3>
            <p>Our dedicated silversmith concierge is available 7 days a week.</p>
          </div>
          <Link to="/contact" className="btn btn-primary">
            Speak to Concierge <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
