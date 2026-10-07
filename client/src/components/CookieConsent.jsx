import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, X } from 'lucide-react';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('shveraa_cookie_consent');
      if (!consent) {
        // Small delay so it doesn't immediately jar the user on load
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem('shveraa_cookie_consent', 'accepted');
    } catch {}
    setIsVisible(false);
  };

  const handleDecline = () => {
    try {
      localStorage.setItem('shveraa_cookie_consent', 'essential_only');
    } catch {}
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside className="shv-cookie-consent-bar" aria-label="Cookie and Privacy Consent">
      <div className="shv-cookie-consent-inner">
        <div className="shv-cookie-consent-text">
          <div className="shv-cookie-icon-title">
            <ShieldCheck size={18} className="shv-cookie-shield-icon" />
            <strong>Privacy &amp; Cookie Preferences</strong>
          </div>
          <p>
            We use essential cookies and anonymous telemetry to enhance your fine jewellery shopping experience, remember cart items, and ensure seamless encrypted checkout. Learn more in our{' '}
            <Link to="/privacy-policy" className="shv-cookie-policy-link">
              Privacy Policy
            </Link>.
          </p>
        </div>
        <div className="shv-cookie-consent-actions">
          <button
            type="button"
            onClick={handleDecline}
            className="shv-cookie-btn shv-cookie-btn-decline"
          >
            Essential Only
          </button>
          <button
            type="button"
            onClick={handleAccept}
            className="shv-cookie-btn shv-cookie-btn-accept"
          >
            Accept All
          </button>
          <button
            type="button"
            onClick={handleDecline}
            className="shv-cookie-close-btn"
            aria-label="Close cookie banner"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default CookieConsent;
