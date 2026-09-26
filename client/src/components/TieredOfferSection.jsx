import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Check, Copy } from 'lucide-react';
import { useCart } from '../context/CartContext';

const TIER_OFFERS = [
  {
    id: 1,
    discountPercent: '10%',
    discountSuffix: 'OFF*',
    priceRange: '₹1500 to ₹5000',
    minPrice: 1500,
    maxPrice: 5000,
    code: 'SPARKLE10',
    category: 'rings',
    label: 'Solitaire Wave Bands',
    image: '/tier-product-1.jpg',
  },
  {
    id: 2,
    discountPercent: '15%',
    discountSuffix: 'OFF*',
    priceRange: '₹5001 to ₹15000',
    minPrice: 5001,
    maxPrice: 15000,
    code: 'SPARKLE15',
    category: 'earrings',
    label: 'Temple Jhumkas & Drops',
    image: '/tier-product-2.jpg',
  },
  {
    id: 3,
    discountPercent: '20%',
    discountSuffix: 'OFF*',
    priceRange: '₹15001 to ₹25000',
    minPrice: 15001,
    maxPrice: 25000,
    code: 'SPARKLE20',
    category: 'bracelets',
    label: 'Emerald Cuffs & Bangles',
    image: '/tier-product-3.jpg',
  },
  {
    id: 4,
    discountPercent: '30%',
    discountSuffix: 'OFF*',
    priceRange: '₹25000 Above',
    minPrice: 25000,
    maxPrice: null,
    code: 'SPARKLE30',
    category: 'necklaces',
    label: 'Heirloom Royal Necklaces',
    image: '/tier-product-4.jpg',
  },
];

const TieredOfferSection = () => {
  return null; // Hidden per request
  const [copiedCode, setCopiedCode] = useState(null);
  const { addToast } = useCart();
  const navigate = useNavigate();

  const handleCopyCode = (e, code) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    if (addToast) addToast(`Code ${code} copied! Applied on eligible cart total. ✨`);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <section className="shv-tier-offers-section" aria-label="Tiered Discount Offers">
      <div className="container">
        {/* Section Header */}
        <div className="shv-tier-header">
          <span className="shv-tier-eyebrow">
            SPARKLE MORE, SPEND LESS
          </span>
          <h2 className="shv-tier-title">
            Tiered Atelier Privileges
          </h2>
          <p className="shv-tier-subtitle">
            Curated savings unlocked as your jewellery collection grows. Automatically applied at checkout.
          </p>
        </div>

        {/* 4 Ticket Voucher Cards Grid */}
        <div className="shv-tier-cards-grid">
          {TIER_OFFERS.map((tier) => (
            <Link
              key={tier.id}
              to={`/shop?category=${tier.category}&minPrice=${tier.minPrice}`}
              className="shv-tier-card"
              title={`Shop ${tier.label} - ${tier.discountPercent} OFF`}
            >
              {/* Top Voucher Body */}
              <div className="shv-tier-top-body">
                {/* Decorative Concave Corner Notches */}
                <div className="shv-tier-notch notch-tl" />
                <div className="shv-tier-notch notch-tr" />

                {/* Big Discount Percentage */}
                <div className="shv-tier-discount-wrap">
                  <span className="shv-tier-discount-num">{tier.discountPercent}</span>
                  <span className="shv-tier-discount-off">{tier.discountSuffix}</span>
                </div>

                {/* Price Range Pill */}
                <div className="shv-tier-pill">
                  <span>{tier.priceRange}</span>
                </div>

                {/* Micro Code Copy Pill */}
                <button
                  type="button"
                  onClick={(e) => handleCopyCode(e, tier.code)}
                  className="shv-tier-code-pill"
                  title="Click to copy code"
                >
                  {copiedCode === tier.code ? (
                    <>
                      <Check size={12} />
                      <span>COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>CODE: {tier.code}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Scalloped Stamp Perforated Divider */}
              <div className="shv-tier-scallop-divider">
                <svg
                  className="shv-scallop-svg"
                  viewBox="0 0 200 12"
                  preserveAspectRatio="none"
                  fill="none"
                >
                  <path
                    d="M0,0 Q10,12 20,0 Q30,12 40,0 Q50,12 60,0 Q70,12 80,0 Q90,12 100,0 Q110,12 120,0 Q130,12 140,0 Q150,12 160,0 Q170,12 180,0 Q190,12 200,0 L200,12 L0,12 Z"
                    fill="#F2E1E8"
                  />
                </svg>
              </div>

              {/* Bottom Silk Showcase with Jewellery Photo */}
              <div className="shv-tier-bottom-media">
                <img
                  src={tier.image}
                  alt={tier.label}
                  className="shv-tier-product-img"
                  loading="lazy"
                />

                {/* Hover CTA Overlay */}
                <div className="shv-tier-hover-overlay">
                  <span className="shv-tier-hover-cta">
                    <span>EXPLORE {tier.label.toUpperCase()}</span>
                    <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Trust Guarantee Note */}
        <div className="shv-tier-footer-strip">
          <Sparkles size={16} className="shv-tier-footer-sparkle" />
          <span>Combinable with Complimentary Insured Express Shipping &bull; Certified Pure 925 Silver</span>
        </div>
      </div>
    </section>
  );
};

export default TieredOfferSection;
