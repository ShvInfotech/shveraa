import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ShieldAlert, Truck, Sparkles, ArrowRight } from 'lucide-react';

const Terms = () => {
  return (
    <div className="shv-legal-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="shv-legal-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Terms &amp; Conditions</span>
        </div>

        {/* Hero Header */}
        <div className="shv-legal-header">
          <span className="shv-legal-eyebrow">The Atelier Code</span>
          <h1 className="shv-legal-title">Terms &amp; Conditions of Sale</h1>
          <p className="shv-legal-subtitle">
            Establishing the standards of craft, precious metal purity covenants, and patron agreements governing every Shveraa acquisition.
          </p>
          <div className="shv-legal-meta">
            <span>Effective Date: September 2026</span>
            <span>•</span>
            <span>Governed by the Laws of the Republic of India</span>
          </div>
        </div>

        {/* Highlights Bar */}
        <div className="shv-legal-trust-grid">
          <div className="shv-trust-seal-card">
            <Award size={22} className="shv-seal-icon" />
            <h4>BIS 925 Hallmarked</h4>
            <p>Every piece is certified solid precious silver under BIS IS 2112 specifications.</p>
          </div>
          <div className="shv-trust-seal-card">
            <Truck size={22} className="shv-seal-icon" />
            <h4>Insured Handover</h4>
            <p>100% financial liability covered by Shveraa until physical handover at your door.</p>
          </div>
          <div className="shv-trust-seal-card">
            <Sparkles size={22} className="shv-seal-icon" />
            <h4>Triple Rhodium Luster</h4>
            <p>Sealed with high-grade noble platinum rhodium to guard against environmental oxidation.</p>
          </div>
          <div className="shv-trust-seal-card">
            <ShieldAlert size={22} className="shv-seal-icon" />
            <h4>Authenticity Guarantee</h4>
            <p>Zero nickel, zero lead, and zero hollow brass base alloys across all pieces.</p>
          </div>
        </div>

        {/* Legal Body Sections */}
        <div className="shv-legal-content-card">
          <section className="shv-legal-section">
            <h2>1. Legal Acceptance &amp; Atelier Agreement</h2>
            <p>
              By accessing, browsing, or executing a purchase on this digital atelier (operated by <strong>Shveraa Silver Atelier Private Limited</strong>), you acknowledge and agree to be bound by these Terms and Conditions in full. If you do not agree to any term herein, we respectfully request that you refrain from transacting on this platform.
            </p>
          </section>

          <section className="shv-legal-section">
            <h2>2. Certified Precious Metal Purity Standards</h2>
            <p>
              Shveraa pledges an unwavering precious metal standard. Every ring, cuff, necklace, and earring listed on our catalogue is crafted exclusively from <strong>certified 925 Sterling Silver</strong> (92.5% elemental silver, balanced with copper for structural resilience).
            </p>
            <ul>
              <li><strong>Bureau of Indian Standards (BIS) Purity:</strong> Each piece bears the laser-inscribed 925 hallmark stamp alongside the Shveraa atelier signature mark.</li>
              <li><strong>Triple Rhodium Shield:</strong> All polished silver silhouettes receive a minimum 0.5-micron deposit of precious rhodium (platinum group metal) ensuring anti-tarnish protection under customary exposure to water and skin oils.</li>
            </ul>
          </section>

          <section className="shv-legal-section">
            <h2>3. Orders, Pricing &amp; GST Invoicing</h2>
            <p>
              All prices displayed on Shveraa are denominated in <strong>Indian National Rupees (₹ / INR)</strong> and are comprehensively inclusive of applicable Goods and Services Tax (GST).
            </p>
            <ul>
              <li><strong>Order Confirmation:</strong> An order is legally deemed accepted only after digital payment authorization and generation of an official Order ID (e.g. <code>SHV-XXXXXX</code>).</li>
              <li><strong>Tax Invoice:</strong> A digital tax invoice conforming to Indian GST mandates is automatically dispatched to your registered email address and accessible within your <Link to="/account?tab=orders">Atelier Account</Link>.</li>
            </ul>
          </section>

          <section className="shv-legal-section">
            <h2>4. Insured Logistics &amp; Tamper-Proof Delivery</h2>
            <p>
              All dispatches are handled through vetted insured courier partners (primarily BlueDart Express Air). 
            </p>
            <ul>
              <li><strong>Tamper Ribbon Protocol:</strong> Every Shveraa order is sealed with our proprietary holographic tamper-evident ribbon. If the outer courier package appears breached, torn, or unsealed upon arrival, patrons must reject the consignment and immediately notify our concierge.</li>
              <li><strong>Transit Insurance:</strong> All risk of transit loss or theft is fully underwritten by Shveraa until signature confirmation is registered.</li>
            </ul>
          </section>

          <section className="shv-legal-section">
            <h2>5. 30-Day Returns &amp; Bespoke Exclusions</h2>
            <p>
              We stand firmly behind the design and durability of our jewellery. Patrons are entitled to return or exchange eligible pieces within <strong>30 calendar days</strong> of delivery, provided the piece is in pristine, unworn condition with all certificates and packaging intact.
            </p>
            <p>
              <em>Note on Custom Orders:</em> Pieces that have undergone bespoke laser engraving, personalized monogramming, or custom non-standard sizing are crafted individually and cannot be returned for cash refund, unless a manufacturing defect is validated by our master silversmiths. For full instructions, consult our <Link to="/returns">Return &amp; Exchange Policy</Link>.
            </p>
          </section>

          <section className="shv-legal-section">
            <h2>6. Intellectual Property &amp; Silhouette Copyrights</h2>
            <p>
              All design rights, jewellery silhouettes, photography, typographic styling, and visual hallmarks appearing on this domain are the exclusive intellectual property of Shveraa Silver Atelier Private Limited. Reproduction, imitation, or commercial duplication is strictly prohibited under Indian and international copyright conventions.
            </p>
          </section>

          <section className="shv-legal-section">
            <h2>7. Governing Law &amp; Jurisdiction</h2>
            <p>
              These Terms and Conditions shall be governed by and construed in accordance with the substantive laws of the Republic of India. Any disputes arising hereunder shall be subject to the exclusive jurisdiction of the competent courts located in <strong>Jaipur, Rajasthan / Mumbai, Maharashtra</strong>.
            </p>
          </section>
        </div>

        {/* Footer Banner */}
        <div className="shv-legal-footer-banner">
          <div>
            <h3>Need bespoke sizing advice or legal clarification?</h3>
            <p>Our client care advisory team is at your complete disposal.</p>
          </div>
          <Link to="/contact" className="btn btn-primary">
            Contact Concierge <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Terms;
