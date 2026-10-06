import React, { useState, useEffect } from 'react';
import { X, Ruler, Award, Sparkles, MessageCircle, Info } from 'lucide-react';

const RING_SIZES = [
  { size: '5', in: '10', dia: '15.7 mm', circ: '49.3 mm', fit: 'Dainty Pinky / Petite Ring Finger' },
  { size: '6', in: '12', dia: '16.5 mm', circ: '51.9 mm', fit: 'Standard Ring Finger' },
  { size: '7', in: '14', dia: '17.3 mm', circ: '54.4 mm', fit: 'Most Popular / Middle / Index', popular: true },
  { size: '8', in: '17', dia: '18.1 mm', circ: '57.0 mm', fit: 'Index / Thumb / Wide Bands' },
  { size: '9', in: '19', dia: '19.0 mm', circ: '59.5 mm', fit: 'Statement Thumb / Wide Sculpted Bands' },
];

const BRACELET_SIZES = [
  { size: 'Petite (XS–S)', wristCirc: '14.0 – 15.5 cm', innerDia: '55 – 58 mm', bestFor: 'Delicate wrists, snug tennis bracelet fit' },
  { size: 'Standard (M)', wristCirc: '15.5 – 17.0 cm', innerDia: '60 – 65 mm', bestFor: 'Universal fit for sculpted silver cuffs', popular: true },
  { size: 'Comfort (L)', wristCirc: '17.0 – 18.5 cm', innerDia: '65 – 70 mm', bestFor: 'Relaxed drape, stackable chain bangles' },
];

const SizeGuideModal = ({ isOpen, onClose, defaultTab = 'rings', availableSizes = [] }) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background body & html scroll completely when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    const originalBodyTouch = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      document.body.style.touchAction = originalBodyTouch;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="shv-size-modal-backdrop"
      onClick={onClose}
      onWheel={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="shv-size-modal-container"
        onClick={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="shv-size-modal-header">
          <div className="shv-size-modal-title-group">
            <span className="shv-size-modal-eyebrow">
              <Sparkles size={13} color="#B08D57" />
              Atelier Sizing Calibration
            </span>
            <h2 className="shv-size-modal-title">Ring &amp; Wrist Size Guide</h2>
            <p className="shv-size-modal-sub">
              Precision calibrated for certified 925 sterling silver jewelry.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shv-size-modal-close-btn"
            aria-label="Close size guide modal"
          >
            <X size={19} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="shv-size-modal-tabs">
          <button
            type="button"
            className={`shv-size-modal-tab-btn ${activeTab === 'rings' ? 'active' : ''}`}
            onClick={() => setActiveTab('rings')}
          >
            <Ruler size={15} />
            <span>Ring Sizing Chart</span>
          </button>
          <button
            type="button"
            className={`shv-size-modal-tab-btn ${activeTab === 'bracelets' ? 'active' : ''}`}
            onClick={() => setActiveTab('bracelets')}
          >
            <Award size={15} />
            <span>Wrist &amp; Bracelet Guide</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="shv-size-modal-body" onWheel={(e) => e.stopPropagation()}>
          {activeTab === 'rings' ? (
            <div className="shv-size-modal-content">
              {/* 3 Simple Steps */}
              <div className="shv-modal-section-intro">
                <h3 className="shv-modal-sec-title">How to Measure in 2 Minutes</h3>
                <div className="shv-modal-steps-row">
                  <div className="shv-modal-step-card">
                    <span className="shv-modal-step-num">01</span>
                    <h4>Wrap Strip</h4>
                    <p>Wrap a thin slip of paper snug around your finger base.</p>
                  </div>
                  <div className="shv-modal-step-card">
                    <span className="shv-modal-step-num">02</span>
                    <h4>Mark Overlap</h4>
                    <p>Mark where the paper overlaps with a fine pen line.</p>
                  </div>
                  <div className="shv-modal-step-card">
                    <span className="shv-modal-step-num">03</span>
                    <h4>Measure (mm)</h4>
                    <p>Measure length in mm against a ruler to find your size.</p>
                  </div>
                </div>
              </div>

              {/* Conversion Table Card */}
              <div className="shv-modal-table-card">
                <div className="shv-modal-table-header">
                  <h4>Ring Size Calibration Table</h4>
                  <span className="shv-modal-table-tag">Standard Ring Sizes</span>
                </div>
                <div className="shv-modal-table-scroll">
                  <table className="shv-modal-table">
                    <thead>
                      <tr>
                        <th>Size</th>
                        <th>Indian (BIS)</th>
                        <th>Diameter</th>
                        <th>Circumference</th>
                        <th>Recommended Fit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {RING_SIZES.map((sz, idx) => (
                        <tr key={idx} className={sz.popular ? 'row-popular' : ''}>
                          <td>
                            <strong>{sz.size}</strong>
                            {sz.popular && <span className="pill-popular">Popular</span>}
                          </td>
                          <td><strong>{sz.in}</strong></td>
                          <td>{sz.dia}</td>
                          <td>{sz.circ}</td>
                          <td className="fit-cell">{sz.fit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pro Tip */}
              <div className="shv-modal-tip-box">
                <Info size={18} className="shv-modal-tip-icon" />
                <div>
                  <strong>Silversmith Fit Tip:</strong> If you are between sizes or selecting a wide sculpted band (5mm+ width), select <strong>one size up</strong> for optimal all-day breathing room. For slim solitaire bands, order your exact true size.
                </div>
              </div>
            </div>
          ) : (
            <div className="shv-size-modal-content">
              {/* Bracelet Guide */}
              <div className="shv-modal-table-card">
                <div className="shv-modal-table-header">
                  <h4>Wrist &amp; Cuff Sizing Dimensions</h4>
                  <span className="shv-modal-table-tag">Solid 925 Sterling Silver</span>
                </div>
                <div className="shv-modal-table-scroll">
                  <table className="shv-modal-table">
                    <thead>
                      <tr>
                        <th>Size Profile</th>
                        <th>Wrist Circumference</th>
                        <th>Inner Diameter</th>
                        <th>Ideal Silhouette</th>
                      </tr>
                    </thead>
                    <tbody>
                      {BRACELET_SIZES.map((b, idx) => (
                        <tr key={idx} className={b.popular ? 'row-popular' : ''}>
                          <td>
                            <strong>{b.size}</strong>
                            {b.popular && <span className="pill-popular">Standard</span>}
                          </td>
                          <td>{b.wristCirc}</td>
                          <td>{b.innerDia}</td>
                          <td className="fit-cell">{b.bestFor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cuff Adjustment Note */}
              <div className="shv-modal-tip-box">
                <Sparkles size={18} className="shv-modal-tip-icon" />
                <div>
                  <strong>Contourable Cuffs:</strong> Shveraa solid silver cuffs possess gentle ergonomic flexibility. Slide on from the narrowest side of the wrist, then gently squeeze inward across both sides for a tailored hug.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with WhatsApp Help */}
        <div className="shv-size-modal-footer">
          <div className="shv-size-modal-footer-help">
            <span className="shv-dot-live-green" />
            <span>Still unsure? Our silversmith is live on WhatsApp:</span>
          </div>
          <div className="shv-size-modal-footer-actions">
            <a
              href="https://wa.me/919998046559?text=Hello%20Shveraa,%20I%20am%20looking%20at%20a%20piece%20and%20need%20help%20confirming%20my%20exact%20size."
              target="_blank"
              rel="noopener noreferrer"
              className="shv-size-modal-wa-btn"
            >
              <MessageCircle size={15} />
              <span>Ask on WhatsApp</span>
            </a>
            <button
              type="button"
              onClick={onClose}
              className="shv-size-modal-close-action-btn"
            >
              Got It
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeGuideModal;
