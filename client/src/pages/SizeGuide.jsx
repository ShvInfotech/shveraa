import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Award,
  Ruler,
  MessageCircle,
  Droplets,
  HeartHandshake,
  Box,
  Check,
  X,
  Info,
  ShieldCheck,
} from 'lucide-react';

const RING_SIZES = [
  { us: 'US 5', in: '10', dia: '15.7 mm', circ: '49.3 mm', fit: 'Dainty Pinky / Petite Ring Finger' },
  { us: 'US 6', in: '12', dia: '16.5 mm', circ: '51.9 mm', fit: 'Standard Ring Finger' },
  { us: 'US 7', in: '14', dia: '17.3 mm', circ: '54.4 mm', fit: 'Most Popular / Middle / Index', popular: true },
  { us: 'US 8', in: '17', dia: '18.1 mm', circ: '57.0 mm', fit: 'Index / Thumb / Wide Bands' },
  { us: 'US 9', in: '19', dia: '19.0 mm', circ: '59.5 mm', fit: 'Statement Thumb / Wide Sculpted Bands' },
];

const BRACELET_SIZES = [
  { size: 'Petite (XS–S)', wristCirc: '14.0 – 15.5 cm', innerDia: '55 – 58 mm', bestFor: 'Delicate wrists, snug tennis bracelet fit' },
  { size: 'Standard (M)', wristCirc: '15.5 – 17.0 cm', innerDia: '60 – 65 mm', bestFor: 'Universal fit for sculpted silver cuffs', popular: true },
  { size: 'Comfort (L)', wristCirc: '17.0 – 18.5 cm', innerDia: '65 – 70 mm', bestFor: 'Relaxed drape, stackable chain bangles' },
];

const SizeGuide = () => {
  const [activeTab, setActiveTab] = useState('rings'); // 'rings' | 'bracelets' | 'care'

  return (
    <div className="shv-guide-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="shv-guide-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Sizing &amp; Silver Care</span>
        </div>

        {/* Hero Header */}
        <div className="shv-guide-header">
          <span className="shv-guide-eyebrow">
            <Sparkles size={14} color="#B08D57" style={{ display: 'inline', verticalAlign: '-1px', marginRight: '6px' }} />
            Atelier Measuring &amp; Preservation
          </span>
          <h1 className="shv-guide-title">The Complete Silver Sizing &amp; Care Guide</h1>
          <p className="shv-guide-subtitle">
            Find your flawless fit with our silversmith calibration charts, and learn the sacred rituals to preserve the mirror rhodium brilliance of pure 925 silver for generations.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="shv-guide-tabs">
          <button
            type="button"
            className={`shv-guide-tab-btn ${activeTab === 'rings' ? 'active' : ''}`}
            onClick={() => setActiveTab('rings')}
          >
            <Ruler size={17} />
            <span>Ring Sizing Chart</span>
          </button>

          <button
            type="button"
            className={`shv-guide-tab-btn ${activeTab === 'bracelets' ? 'active' : ''}`}
            onClick={() => setActiveTab('bracelets')}
          >
            <Award size={17} />
            <span>Wrist &amp; Bracelet Guide</span>
          </button>

          <button
            type="button"
            className={`shv-guide-tab-btn ${activeTab === 'care' ? 'active' : ''}`}
            onClick={() => setActiveTab('care')}
          >
            <Sparkles size={17} />
            <span>Lifetime Silver Care Rituals</span>
          </button>
        </div>

        {/* Panel Wrapper */}
        <div className="shv-guide-panel">
          {/* TAB 1: RING SIZING */}
          {activeTab === 'rings' && (
            <div>
              {/* 3-Step Measurement Method */}
              <div className="shv-guide-intro-card">
                <div className="shv-guide-card-header">
                  <span className="shv-badge-gold">Simple 2-Minute Ritual</span>
                  <h2 className="shv-guide-sec-title">How to Measure Your Ring Size at Home</h2>
                  <p className="shv-guide-sec-desc">
                    Follow these three simple silversmith steps in 2 minutes using paper and a household ruler:
                  </p>
                </div>

                <div className="shv-guide-step-grid">
                  <div className="shv-guide-method-card">
                    <div className="shv-guide-step-number">01</div>
                    <div className="shv-guide-step-content">
                      <h4>Wrap Paper or Ribbon</h4>
                      <p>Wrap a thin, non-stretchy strip of paper snug around the base of the finger you intend to adorn.</p>
                    </div>
                  </div>

                  <div className="shv-guide-method-card">
                    <div className="shv-guide-step-number">02</div>
                    <div className="shv-guide-step-content">
                      <h4>Mark the Overlap</h4>
                      <p>With a fine pen, mark the exact spot where the paper completes a snug loop around your knuckle and finger.</p>
                    </div>
                  </div>

                  <div className="shv-guide-method-card">
                    <div className="shv-guide-step-number">03</div>
                    <div className="shv-guide-step-content">
                      <h4>Measure in Millimeters</h4>
                      <p>Lay the strip flat against a ruler and read the length in millimeters (mm) to identify your circumference below.</p>
                    </div>
                  </div>
                </div>

                <div className="shv-pro-tip-box">
                  <Info size={19} className="shv-pro-tip-icon" />
                  <div>
                    <strong>Silversmith Pro Tip:</strong> If choosing wide sculpted bands (5mm or thicker), we recommend selecting <strong>one size up</strong> for optimal all-day breathing room. For dainty solitaire bands, order your exact true size.
                  </div>
                </div>
              </div>

              {/* Conversion Table Card */}
              <div className="shv-guide-table-wrap">
                <div className="shv-guide-table-card-head">
                  <div>
                    <h3 className="shv-table-title">Indian (BIS) &amp; US Ring Size Conversion Table</h3>
                    <p className="shv-table-sub">Calibrated to standard ISO silversmith measurements</p>
                  </div>
                  <span className="shv-table-std-pill">Certified 925 Standards</span>
                </div>

                <div className="shv-table-scroll-container">
                  <table className="shv-guide-table">
                    <thead>
                      <tr>
                        <th>US / International Size</th>
                        <th>Indian (BIS) Size</th>
                        <th>Inside Diameter (mm)</th>
                        <th>Inside Circumference (mm)</th>
                        <th>Recommended Silhouette</th>
                      </tr>
                    </thead>
                    <tbody>
                      {RING_SIZES.map((sz, idx) => (
                        <tr key={idx} className={sz.popular ? 'shv-row-highlight' : ''}>
                          <td>
                            <strong>{sz.us}</strong>
                            {sz.popular && <span className="shv-popular-pill">Most Popular</span>}
                          </td>
                          <td><strong>{sz.in}</strong></td>
                          <td>{sz.dia}</td>
                          <td>{sz.circ}</td>
                          <td className="shv-table-fit">{sz.fit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WRIST & BRACELET SIZING */}
          {activeTab === 'bracelets' && (
            <div>
              <div className="shv-guide-intro-card">
                <div className="shv-guide-card-header">
                  <span className="shv-badge-gold">Ergonomic Silver Sculpting</span>
                  <h2 className="shv-guide-sec-title">Sculpted Cuffs &amp; Tennis Bracelet Measurements</h2>
                  <p className="shv-guide-sec-desc">
                    Our solid 925 sterling silver cuffs are ergonomically sculpted with gentle flexibility, allowing subtle adjustment to contour your wrist silhouette seamlessly.
                  </p>
                </div>

                <div className="shv-guide-table-wrap" style={{ margin: '1.5rem 0' }}>
                  <div className="shv-table-scroll-container">
                    <table className="shv-guide-table">
                      <thead>
                        <tr>
                          <th>Wrist Profile</th>
                          <th>Wrist Circumference</th>
                          <th>Internal Diameter</th>
                          <th>Ideal Silhouette</th>
                        </tr>
                      </thead>
                      <tbody>
                        {BRACELET_SIZES.map((b, idx) => (
                          <tr key={idx} className={b.popular ? 'shv-row-highlight' : ''}>
                            <td>
                              <strong>{b.size}</strong>
                              {b.popular && <span className="shv-popular-pill">Universal Fit</span>}
                            </td>
                            <td>{b.wristCirc}</td>
                            <td>{b.innerDia}</td>
                            <td className="shv-table-fit">{b.bestFor}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Cuffs adjustment advice */}
                <div className="shv-cuff-contour-box">
                  <Sparkles size={20} color="#B08D57" />
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#1F1B17', marginBottom: '4px' }}>
                      How to Wear &amp; Contour Solid Silver Cuffs
                    </h4>
                    <p style={{ fontSize: '0.88rem', color: '#5C5247', lineHeight: 1.6, margin: 0 }}>
                      Never pull or force open a solid silver cuff from the center. To wear, slide the opening over the narrowest side of your wrist (just above the wrist bone) and rotate it to center. Gently squeeze the ends inward with even pressure across both sides for a tailored contour.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SILVER CARE RITUALS */}
          {activeTab === 'care' && (
            <div>
              <div className="shv-guide-intro-card">
                <div className="shv-guide-card-header" style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto 2rem' }}>
                  <span className="shv-badge-gold">
                    <ShieldCheck size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '4px' }} />
                    Lifetime Covenant
                  </span>
                  <h2 className="shv-guide-sec-title">The Shveraa Lifetime Silver Care Covenant</h2>
                  <p className="shv-guide-sec-desc">
                    Every Shveraa piece is forged in <strong>certified solid 925 sterling silver</strong> and sealed with a high-fire <strong>triple rhodium platinum shield</strong>, engineered for active modern living.
                  </p>
                </div>

                <div className="shv-care-grid">
                  <div className="shv-care-card">
                    <div className="shv-care-icon">
                      <Droplets size={24} />
                    </div>
                    <h3>100% Water &amp; Gym Resistant</h3>
                    <p>
                      You never need to remove your silver before swimming in fresh water, ocean surf, or high-intensity training. Rhodium prevents oxidation and green skin residue.
                    </p>
                  </div>

                  <div className="shv-care-card">
                    <div className="shv-care-icon">
                      <Sparkles size={24} />
                    </div>
                    <h3>Lukewarm Water Cleaning</h3>
                    <p>
                      Cleanse gently every few weeks using lukewarm water and a drop of mild soap. Rinse thoroughly and pat dry with the complimentary micro-suede polishing cloth provided in your box.
                    </p>
                  </div>

                  <div className="shv-care-card">
                    <div className="shv-care-icon">
                      <Box size={24} />
                    </div>
                    <h3>Velvet Presentation Storage</h3>
                    <p>
                      When resting your pieces, store them individually in your Shveraa velvet presentation box or soft pouch to prevent physical contact with harder gemstone pieces like diamonds.
                    </p>
                  </div>

                  <div className="shv-care-card">
                    <div className="shv-care-icon">
                      <HeartHandshake size={24} />
                    </div>
                    <h3>Free Lifetime Ultrasonic Spa</h3>
                    <p>
                      At any time during your piece’s lifecycle, ship it to our Surat Atelier for a complimentary professional ultrasonic bath and rhodium shine renewal.
                    </p>
                  </div>
                </div>

                {/* Dos and Don'ts */}
                <div className="shv-care-dos-donts">
                  <div className="shv-care-col dos">
                    <h4>
                      <Check size={18} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '6px' }} />
                      Recommended Rituals
                    </h4>
                    <ul>
                      <li>Store in separate anti-tarnish velvet compartments.</li>
                      <li>Wipe with Shveraa micro-suede cloth after daily wear.</li>
                      <li>Apply perfumes, lotions, and sprays before putting jewelry on.</li>
                      <li>Wear frequently — natural skin oils preserve silver brilliance.</li>
                    </ul>
                  </div>

                  <div className="shv-care-col donts">
                    <h4>
                      <X size={18} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '6px' }} />
                      Habits to Avoid
                    </h4>
                    <ul>
                      <li>Never expose to harsh industrial chlorine, bleach, or acids.</li>
                      <li>Avoid abrasive paper towels or tissue paper (can create micro-scratches).</li>
                      <li>Do not pull or pry open solid silver cuffs from the center opening.</li>
                      <li>Never store damp jewelry in sealed airtight plastic bags.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* WhatsApp Sizing Concierge Banner */}
          <div className="shv-guide-cta-card">
            <div className="shv-guide-cta-left">
              <div className="shv-guide-cta-icon-wrap">
                <MessageCircle size={28} color="#25D366" />
              </div>
              <div>
                <span className="shv-guide-cta-badge">Live Concierge</span>
                <h3 className="shv-guide-cta-title">Uncertain about your sizing?</h3>
                <p className="shv-guide-cta-desc">
                  Send a photo of your hand or current ring against a coin/ruler on WhatsApp for instant silversmith verification.
                </p>
              </div>
            </div>
            <div className="shv-guide-cta-right">
              <a
                href="https://wa.me/919998046559?text=Hello%20Shveraa%20Jewels,%20I%20would%20like%20assistance%20confirming%20my%20ring%20or%20wrist%20size."
                target="_blank"
                rel="noopener noreferrer"
                className="shv-guide-cta-btn"
              >
                <MessageCircle size={18} />
                <span>Consult Silversmith on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeGuide;
