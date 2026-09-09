import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ShieldCheck,
  Award,
  Ruler,
  HelpCircle,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  Droplets,
  HeartHandshake,
  Box,
} from 'lucide-react';

const SizeGuide = () => {
  const [activeTab, setActiveTab] = useState('rings'); // 'rings' | 'bracelets' | 'care'

  const RING_SIZES = [
    { us: 'US 5', in: '10', dia: '15.7 mm', circ: '49.3 mm', fit: 'Dainty Pinky / Petite Ring Finger' },
    { us: 'US 6', in: '12', dia: '16.5 mm', circ: '51.9 mm', fit: 'Standard Ring Finger' },
    { us: 'US 7', in: '14', dia: '17.3 mm', circ: '54.4 mm', fit: 'Most Popular / Middle / Index' },
    { us: 'US 8', in: '17', dia: '18.1 mm', circ: '57.0 mm', fit: 'Index / Thumb / Wide Bands' },
    { us: 'US 9', in: '19', dia: '19.0 mm', circ: '59.5 mm', fit: 'Statement Thumb / Wide Sculpted Bands' },
  ];

  const BRACELET_SIZES = [
    { size: 'Petite (XS-S)', wristCirc: '14.0 – 15.5 cm', innerDia: '55 – 58 mm', bestFor: 'Delicate wrists, snug tennis bracelet fit' },
    { size: 'Standard (M)', wristCirc: '15.5 – 17.0 cm', innerDia: '60 – 65 mm', bestFor: 'Universal fit for sculpted silver cuffs' },
    { size: 'Comfort (L)', wristCirc: '17.0 – 18.5 cm', innerDia: '65 – 70 mm', bestFor: 'Relaxed drape, stackable chain bangles' },
  ];

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
          <span className="shv-guide-eyebrow">Atelier Measuring &amp; Preservation</span>
          <h1 className="shv-guide-title">The Complete Silver Sizing &amp; Care Guide</h1>
          <p className="shv-guide-subtitle">
            Find your flawless fit with our silversmith calibration charts, and learn the simple rituals to preserve the mirror rhodium brilliance of pure 925 silver for generations.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="shv-guide-tabs-bar">
          <button
            type="button"
            className={`shv-g-tab-btn ${activeTab === 'rings' ? 'active' : ''}`}
            onClick={() => setActiveTab('rings')}
          >
            <Ruler size={17} />
            <span>Ring Sizing Chart</span>
          </button>

          <button
            type="button"
            className={`shv-g-tab-btn ${activeTab === 'bracelets' ? 'active' : ''}`}
            onClick={() => setActiveTab('bracelets')}
          >
            <Award size={17} />
            <span>Wrist &amp; Bracelet Guide</span>
          </button>

          <button
            type="button"
            className={`shv-g-tab-btn ${activeTab === 'care' ? 'active' : ''}`}
            onClick={() => setActiveTab('care')}
          >
            <Sparkles size={17} />
            <span>Lifetime Silver Care Rituals</span>
          </button>
        </div>

        {/* Tab 1: Ring Sizing */}
        {activeTab === 'rings' && (
          <div className="shv-guide-content-section">
            {/* 3-Step Measurement Method */}
            <div className="shv-guide-card">
              <h2 className="shv-guide-sec-title">How to Measure Your Ring Size at Home</h2>
              <p className="shv-guide-sec-desc">
                Follow these three simple silversmith steps in 2 minutes using paper and a ruler:
              </p>

              <div className="shv-measure-steps-grid">
                <div className="shv-measure-step">
                  <div className="shv-m-step-num">1</div>
                  <h3>Wrap Paper or String</h3>
                  <p>Wrap a thin, non-stretchy strip of paper or cord around the base of the finger you intend to adorn.</p>
                </div>

                <div className="shv-measure-step">
                  <div className="shv-m-step-num">2</div>
                  <h3>Mark the Overlap</h3>
                  <p>With a fine pen, mark the exact spot where the paper completes a snug loop around your knuckle and finger.</p>
                </div>

                <div className="shv-measure-step">
                  <div className="shv-m-step-num">3</div>
                  <h3>Measure in Millimeters</h3>
                  <p>Lay the strip flat against a ruler and read the length in millimeters (mm) to identify your circumference below.</p>
                </div>
              </div>

              <div className="shv-pro-tip-box">
                <Sparkles size={18} color="#B08D57" />
                <div>
                  <strong>Silversmith Pro Tip:</strong> If choosing wide sculpted bands (5mm or thicker), we recommend selecting <strong>one size up</strong> for optimal all-day breathing room. For dainty solitaire bands, order your exact true size.
                </div>
              </div>
            </div>

            {/* Conversion Table */}
            <div className="shv-guide-card" style={{ marginTop: '2rem' }}>
              <h2 className="shv-guide-sec-title">Indian &amp; US Ring Size Conversion Table</h2>
              <div className="shv-table-responsive">
                <table className="shv-conversion-table">
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
                      <tr key={idx}>
                        <td>
                          <strong>{sz.us}</strong>
                        </td>
                        <td>{sz.in}</td>
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

        {/* Tab 2: Wrist & Bracelet Sizing */}
        {activeTab === 'bracelets' && (
          <div className="shv-guide-content-section">
            <div className="shv-guide-card">
              <h2 className="shv-guide-sec-title">Sculpted Cuffs &amp; Tennis Bracelet Measurements</h2>
              <p className="shv-guide-sec-desc">
                Our solid 925 sterling silver cuffs are ergonomically sculpted with gentle flexibility, allowing subtle adjustment to contour your wrist silhouette seamlessly.
              </p>

              <div className="shv-table-responsive">
                <table className="shv-conversion-table">
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
                      <tr key={idx}>
                        <td>
                          <strong>{b.size}</strong>
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
            <div className="shv-guide-card" style={{ marginTop: '2rem' }}>
              <h3 className="shv-guide-sec-title">How to Wear &amp; Adjust Solid Silver Cuffs</h3>
              <p className="shv-guide-sec-desc">
                Never pull or force open a solid silver cuff from the center. To wear, slide the opening over the narrowest side of your wrist (just above the wrist bone) and rotate it to center. Gently squeeze the ends inward with even pressure across both sides for a tailored contour.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Silver Care Rituals */}
        {activeTab === 'care' && (
          <div className="shv-guide-content-section">
            <div className="shv-guide-card">
              <h2 className="shv-guide-sec-title">The Shveraa Lifetime Silver Care Covenant</h2>
              <p className="shv-guide-sec-desc">
                Because every Shveraa piece is forged in <strong>certified solid 925 sterling silver</strong> and sealed with a high-fire <strong>triple rhodium platinum shield</strong>, our jewellery is engineered for active daily life.
              </p>

              <div className="shv-care-pillars-grid">
                <div className="shv-care-box">
                  <Droplets size={24} className="shv-care-icon" />
                  <h3>100% Water &amp; Gym Resistant</h3>
                  <p>
                    You never need to remove your silver before swimming in fresh water, ocean surf, or breaking a sweat during high-intensity training. Rhodium prevents oxidation and green skin residue.
                  </p>
                </div>

                <div className="shv-care-box">
                  <Sparkles size={24} className="shv-care-icon" />
                  <h3>Lukewarm Water Cleaning</h3>
                  <p>
                    Cleanse gently every few weeks using lukewarm water and a drop of mild soap. Rinse thoroughly and pat dry with the complimentary micro-suede polishing cloth provided in your box.
                  </p>
                </div>

                <div className="shv-care-box">
                  <Box size={24} className="shv-care-icon" />
                  <h3>Velvet Presentation Storage</h3>
                  <p>
                    When resting your pieces, store them individually in your Shveraa velvet presentation box or soft pouch to prevent physical contact with harder gemstone pieces like diamonds.
                  </p>
                </div>

                <div className="shv-care-box">
                  <HeartHandshake size={24} className="shv-care-icon" />
                  <h3>Free Lifetime Ultrasonic Spa</h3>
                  <p>
                    At any time during your piece’s lifecycle, ship it to our Jaipur Atelier for a complimentary professional ultrasonic bath and rhodium shine renewal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WhatsApp Sizing Concierge Banner */}
        <div className="shv-guide-cta-card">
          <div className="shv-guide-cta-left">
            <MessageCircle size={32} color="#25D366" />
            <div>
              <h3>Uncertain about your sizing?</h3>
              <p>Send a photo of your hand or ring to our silversmith on WhatsApp for instant confirmation.</p>
            </div>
          </div>
          <div className="shv-guide-cta-right">
            <a
              href="https://wa.me/919876543210?text=Hello%20Shveraa%20Concierge,%20I%20would%20like%20assistance%20confirming%20my%20ring%20or%20wrist%20size."
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
            >
              <MessageCircle size={16} /> Consult Silversmith on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeGuide;
