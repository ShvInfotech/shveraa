import React, { useState } from 'react';
import { Sparkles, ArrowRight, Check, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';

const PIECES = [
  {
    id: 'pers_neck',
    name: 'Silver Nameplate Pendant',
    price: 2299,
    baseImage: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=85',
    category: 'necklaces',
    shape: 'nameplate',
    defaultText: 'SHVERAA',
  },
  {
    id: 'pers_ring',
    name: 'Initial Signet Silver Ring',
    price: 1999,
    baseImage: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=85',
    category: 'rings',
    shape: 'signet',
    defaultText: 'S',
  },
  {
    id: 'pers_medallion',
    name: 'Engraved Keepsake Medallion',
    price: 2499,
    baseImage: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=85',
    category: 'necklaces',
    shape: 'medallion',
    defaultText: 'ETERNAL',
  },
];

const FONTS = [
  { id: 'script', name: 'Atelier Script', fontFamily: "'Alex Brush', cursive", italic: true },
  { id: 'serif', name: 'Classic Serif', fontFamily: "'Playfair Display', serif", italic: false },
  { id: 'sans', name: 'Modern Minimal', fontFamily: "'Plus Jakarta Sans', sans-serif", italic: false },
];

const PersonalisationBanner = () => {
  const [selectedPiece, setSelectedPiece] = useState(PIECES[0]);
  const [customText, setCustomText] = useState('SHVERAA');
  const [selectedFont, setSelectedFont] = useState(FONTS[1]);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(
      {
        _id: `prod_pers_${selectedPiece.id}`,
        name: `${selectedPiece.name} (Custom)`,
        slug: `custom-${selectedPiece.name.toLowerCase().replace(/\s+/g, '-')}`,
        price: selectedPiece.price,
        images: [selectedPiece.baseImage],
        category: selectedPiece.category,
        material: 'Solid 925 Sterling Silver',
      },
      'Standard (18 inch / Adjustable)',
      1,
      { customText: customText.trim() || selectedPiece.defaultText }
    );
  };

  return (
    <section className="pers-section">
      <div className="container">
        <div className="pers-grid">
          {/* Left Column: Live Interactive Mockup Simulator */}
          <div className="pers-mockup-wrapper">
            <div className="pers-mockup-card">
              {/* Background high-end imagery with dark editorial framing */}
              <img
                src={selectedPiece.baseImage}
                alt={selectedPiece.name}
                className="pers-mockup-bg-img"
              />
              <div className="pers-mockup-overlay" />

              {/* Interactive Silver Pendant Virtual Canvas */}
              <div className="pers-pendant-canvas">
                <div className={`pers-pendant-plate ${selectedPiece.shape}`}>
                  <div className="pers-pendant-shine" />
                  <div
                    className="pers-engraved-text"
                    style={{
                      fontFamily: selectedFont.fontFamily,
                      fontStyle: selectedFont.italic ? 'italic' : 'normal',
                    }}
                  >
                    {customText.trim() || selectedPiece.defaultText}
                  </div>
                </div>

                <div className="pers-mockup-badge">
                  <Sparkles size={13} />
                  <span>Real-Time 925 Silver Engraving Simulator</span>
                </div>
              </div>

              {/* Specification Card */}
              <div className="pers-spec-pill">
                <ShieldCheck size={16} />
                <span>Diamond-Tipped Micro Precision Laser • 925 Hallmarked</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Controls & Value Messaging */}
          <div className="pers-controls-wrapper">
            <div className="pers-header">
              <span className="section-subtitle">Bespoke Atelier</span>
              <h2 className="pers-title">
                Where Your Name Becomes a <span className="silver-shine-text">Statement</span>
              </h2>
              <p className="pers-description">
                Handcrafted from certified solid 925 sterling silver. Laser-carved with your name, sacred date, or personal mantra in our master atelier.
              </p>
            </div>

            {/* 3 Step Indicator */}
            <div className="pers-steps-row">
              <div className="pers-step-item">
                <span className="pers-step-num">01</span>
                <span className="pers-step-text">Choose Silhouette</span>
              </div>
              <div className="pers-step-divider" />
              <div className="pers-step-item">
                <span className="pers-step-num">02</span>
                <span className="pers-step-text">Type Inscription</span>
              </div>
              <div className="pers-step-divider" />
              <div className="pers-step-item">
                <span className="pers-step-num">03</span>
                <span className="pers-step-text">Hand-Finished</span>
              </div>
            </div>

            {/* 1. Silhouette Selector */}
            <div className="pers-control-group">
              <label className="pers-label">1. Select Silhouette</label>
              <div className="pers-pieces-pills">
                {PIECES.map((piece) => (
                  <button
                    key={piece.id}
                    type="button"
                    onClick={() => {
                      setSelectedPiece(piece);
                      if (piece.shape === 'signet' && customText.length > 2) {
                        setCustomText(customText.charAt(0));
                      }
                    }}
                    className={`pers-piece-btn ${selectedPiece.id === piece.id ? 'active' : ''}`}
                  >
                    <span className="pers-piece-btn-name">{piece.name}</span>
                    <span className="pers-piece-btn-price">₹{piece.price}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Text Input */}
            <div className="pers-control-group">
              <div className="pers-label-row">
                <label className="pers-label">2. Enter Custom Name or Initials</label>
                <span className="pers-char-counter">
                  {customText.length} / {selectedPiece.shape === 'signet' ? 3 : 12} chars
                </span>
              </div>
              <div className="pers-input-wrap">
                <input
                  type="text"
                  maxLength={selectedPiece.shape === 'signet' ? 3 : 12}
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value.toUpperCase())}
                  placeholder={selectedPiece.defaultText}
                  className="pers-input"
                />
              </div>
            </div>

            {/* 3. Font Style Selector */}
            <div className="pers-control-group">
              <label className="pers-label">3. Select Typography Style</label>
              <div className="pers-fonts-row">
                {FONTS.map((font) => (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => setSelectedFont(font)}
                    className={`pers-font-btn ${selectedFont.id === font.id ? 'active' : ''}`}
                    style={{
                      fontFamily: font.fontFamily,
                      fontStyle: font.italic ? 'italic' : 'normal',
                    }}
                  >
                    {font.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price & CTA */}
            <div className="pers-action-row">
              <div>
                <div className="pers-price-label">Custom Handcrafted Piece</div>
                <div className="pers-price-val">₹{selectedPiece.price}</div>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                className="btn btn-primary pers-submit-btn"
              >
                <span>Engrave &amp; Add to Bag</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PersonalisationBanner;
