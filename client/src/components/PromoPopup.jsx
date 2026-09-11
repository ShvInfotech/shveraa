import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ArrowRight, Copy, Check, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

const PromoPopup = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const { addToast } = useCart();
  const navigate = useNavigate();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const promoCode = 'FIRST10';

  const handleCopyCode = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    if (addToast) addToast(`Promo code ${promoCode} copied to clipboard! ✨`);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleShopNow = () => {
    navigator.clipboard.writeText(promoCode);
    onClose();
    navigate('/shop');
  };

  return (
    <div className="shv-promo-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="shv-promo-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="shv-promo-close-btn"
          aria-label="Close promotional offer"
        >
          <X size={20} />
        </button>

        {/* Left Side: High-Fashion Jewellery Model with Solitaire */}
        <div className="shv-promo-media-col">
          <img
            src="/promo-model.jpg"
            alt="Shveraa Fine Jewellery Solitaire Ring"
            className="shv-promo-hero-img"
          />
          <div className="shv-promo-media-badge">
            <Sparkles size={13} />
            <span>CERTIFIED 925 SILVER</span>
          </div>
        </div>

        {/* Right Side: Luxury Typography & Coupon Deal */}
        <div className="shv-promo-content-col">
          {/* Brand Header */}
          <div className="shv-promo-brand-wrap">
            <img
              src="/shveraa.png"
              alt="SHVÈRAA Fine Jewellery"
              className="shv-promo-brand-img"
            />
            <span className="shv-promo-brand-tagline">
              HOUSE OF FINE SILVER JEWELLERY
            </span>
          </div>

          {/* Eyebrow */}
          <div className="shv-promo-eyebrow">
            <span>BEFORE YOU GO</span>
          </div>

          {/* Huge Discount Headline */}
          <div className="shv-promo-headline-wrap">
            <h2 className="shv-promo-discount-num">10% OFF</h2>
            <p className="shv-promo-discount-sub">ON YOUR FIRST ORDER</p>
          </div>

          {/* Interactive Coupon Box */}
          <div
            className="shv-promo-coupon-box"
            onClick={handleCopyCode}
            title="Click to copy promo code"
            role="button"
            tabIndex={0}
          >
            <div className="shv-promo-coupon-left">
              <span className="shv-promo-code-label">USE CODE:</span>
              <span className="shv-promo-code-val">{promoCode}</span>
            </div>
            <div className="shv-promo-coupon-right">
              {copied ? (
                <span className="shv-copied-badge">
                  <Check size={14} />
                  COPIED
                </span>
              ) : (
                <span className="shv-copy-cta">
                  <Copy size={14} />
                  COPY
                </span>
              )}
            </div>
          </div>

          {/* Online Exclusive Note */}
          <span className="shv-promo-exclusive-text">ONLINE EXCLUSIVE</span>

          {/* Shop Now CTA Button */}
          <button
            type="button"
            onClick={handleShopNow}
            className="shv-promo-shop-btn"
          >
            <span>SHOP NOW</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromoPopup;
