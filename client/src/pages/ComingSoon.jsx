import React, { useState, useEffect } from 'react';
import { Mail, Lock, KeyRound, X, Check, ArrowRight, MessageSquare } from 'lucide-react';

const VALID_PASSKEYS = ['shveraa2026', 'shveraa', 'shveraa925', 'admin'];

const ComingSoon = ({ onUnlock }) => {
  // Days & detailed countdown calculation
  const [timeLeft, setTimeLeft] = useState({
    days: 35,
    hours: 14,
    minutes: 30,
    seconds: 45,
  });
  const [showLiveTicker, setShowLiveTicker] = useState(false);

  // Modals state
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [passkeyModalOpen, setPasskeyModalOpen] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [passkeyInput, setPasskeyInput] = useState('');
  const [passkeyError, setPasskeyError] = useState('');

  // Target launch date: 35 days from target reference
  useEffect(() => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 35);
    targetDate.setHours(12, 0, 0, 0);

    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = targetDate.getTime() - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcut to close any modal on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setNotifyModalOpen(false);
        setAboutModalOpen(false);
        setContactModalOpen(false);
        setPasskeyModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      try {
        const existing = JSON.parse(localStorage.getItem('shveraa_notified_emails') || '[]');
        existing.push({ email: email.trim(), date: new Date().toISOString() });
        localStorage.setItem('shveraa_notified_emails', JSON.stringify(existing));
      } catch (err) {
        // Ignore localStorage error
      }
    }
  };

  const handleUnlockSubmit = (e) => {
    e.preventDefault();
    const cleaned = passkeyInput.trim().toLowerCase();
    if (VALID_PASSKEYS.includes(cleaned)) {
      setPasskeyError('');
      localStorage.setItem('shveraa_bypass_coming_soon', 'true');
      if (onUnlock) onUnlock();
    } else {
      setPasskeyError('Invalid passkey. Please check and try again.');
    }
  };

  return (
    <div className="shv-triada-wrapper">
      {/* Ambient Living Mist Background Layer */}
      <div className="shv-triada-bg-layer" />

      {/* Top Header Bar */}
      <header className="shv-triada-header">
        {/* Left: [ ABOUT | CONTACT ] with corner brackets */}
        <div className="shv-triada-corner-box">
          <span className="shv-triada-bracket tl" />
          <span className="shv-triada-bracket tr" />
          <span className="shv-triada-bracket bl" />
          <span className="shv-triada-bracket br" />
          <button
            type="button"
            onClick={() => setAboutModalOpen(true)}
            className="shv-triada-nav-btn"
          >
            ABOUT
          </button>
          <span className="shv-triada-nav-divider">|</span>
          <button
            type="button"
            onClick={() => setContactModalOpen(true)}
            className="shv-triada-nav-btn"
          >
            CONTACT
          </button>
        </div>

        {/* Center: Official Shveraa Brand Logo */}
        <div className="shv-triada-logo-wrap" title="SHVÈRAA Fine Jewellery">
          <img
            src="/shveraa.png"
            alt="SHVÈRAA Jewellery"
            className="shv-triada-brand-logo"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/logo.png';
            }}
          />
        </div>

        {/* Right: [ 35 DAYS LEFT ] with interactive live hover breakdown */}
        <div
          className="shv-triada-corner-box shv-triada-days-box"
          onMouseEnter={() => setShowLiveTicker(true)}
          onMouseLeave={() => setShowLiveTicker(false)}
          title="Days until private launch"
        >
          <span className="shv-triada-bracket tl" />
          <span className="shv-triada-bracket tr" />
          <span className="shv-triada-bracket bl" />
          <span className="shv-triada-bracket br" />
          {showLiveTicker ? (
            <span className="shv-triada-live-ticker">
              {timeLeft.days}d {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
            </span>
          ) : (
            <>
              <span className="shv-triada-days-num">{timeLeft.days}</span>
              <span className="shv-triada-days-label">DAYS LEFT</span>
            </>
          )}
        </div>
      </header>

      {/* Center Hero Section */}
      <main className="shv-triada-main">
        <h1 className="shv-triada-title">COMING SOON</h1>
        <p className="shv-triada-subtitle">
          We're currently working on creating something fantastic.
          <br />
          We'll be here soon, subscribe to be notified.
        </p>
        <button
          type="button"
          onClick={() => {
            setSubscribed(false);
            setNotifyModalOpen(true);
          }}
          className="shv-triada-notify-btn"
        >
          <span>NOTIFY ME</span>
        </button>
      </main>

      {/* Bottom Minimal Footer */}
      <footer className="shv-triada-footer">
        <div className="shv-triada-footer-content">
          <p className="shv-triada-credit">Website by Shveraa</p>
          <p className="shv-triada-copy">© {new Date().getFullYear()}. All Rights Reserved.</p>
          <div className="shv-triada-socials">
            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="shv-triada-social-link"
              aria-label="Facebook"
              title="Follow us on Facebook"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            {/* Twitter / X */}
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="shv-triada-social-link"
              aria-label="Twitter"
              title="Follow us on X"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="shv-triada-social-link"
              aria-label="Instagram"
              title="Follow us on Instagram"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            {/* Pinterest / Atelier */}
            <a
              href="https://pinterest.com"
              target="_blank"
              rel="noopener noreferrer"
              className="shv-triada-social-link"
              aria-label="Pinterest"
              title="Follow us on Pinterest"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Discreet Owner Passkey Trigger in Bottom Right */}
        <button
          type="button"
          onClick={() => {
            setPasskeyError('');
            setPasskeyModalOpen(true);
          }}
          className="shv-triada-passkey-trigger"
          title="Atelier Owner Access"
          aria-label="Atelier Owner Access"
        >
          <Lock size={12} strokeWidth={1.5} />
        </button>
      </footer>

      {/* NOTIFY ME Modal */}
      {notifyModalOpen && (
        <div className="shv-triada-modal-overlay" onClick={() => setNotifyModalOpen(false)}>
          <div
            className="shv-triada-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              className="shv-triada-modal-close"
              onClick={() => setNotifyModalOpen(false)}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <span className="shv-triada-modal-eyebrow">EXCLUSIVE UNVEILING</span>
            <h3 className="shv-triada-modal-title">Get Notified</h3>
            <p className="shv-triada-modal-desc">
              Be the first to explore our debut collection of solid 925 sterling silver heirlooms and receive private opening privileges.
            </p>

            {subscribed ? (
              <div className="shv-triada-modal-success">
                <Check size={20} className="shv-triada-success-icon" />
                <div>
                  <strong>You are on the private guest list.</strong>
                  <p style={{ margin: '4px 0 0', fontSize: '0.80rem' }}>We will send an exclusive launch invitation directly to your inbox.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="shv-triada-modal-form">
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="shv-triada-modal-input"
                />
                <button type="submit" className="shv-triada-modal-btn">
                  <span>SUBSCRIBE FOR LAUNCH</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ABOUT Modal */}
      {aboutModalOpen && (
        <div className="shv-triada-modal-overlay" onClick={() => setAboutModalOpen(false)}>
          <div
            className="shv-triada-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              className="shv-triada-modal-close"
              onClick={() => setAboutModalOpen(false)}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <span className="shv-triada-modal-eyebrow">THE ATELIER</span>
            <h3 className="shv-triada-modal-title">About Shveraa</h3>
            <p className="shv-triada-modal-desc">
              Rooted in the royal silversmith traditions of Jaipur, Shveraa crafts authentic, BIS 925 certified sterling silver heirlooms designed for the discerning individual.
            </p>
            <p className="shv-triada-modal-desc" style={{ marginTop: '10px' }}>
              Every creation merges heritage artisanal mastery with sculptural contemporary elegance — engineered to shine across generations.
            </p>
          </div>
        </div>
      )}

      {/* CONTACT Modal */}
      {contactModalOpen && (
        <div className="shv-triada-modal-overlay" onClick={() => setContactModalOpen(false)}>
          <div
            className="shv-triada-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              className="shv-triada-modal-close"
              onClick={() => setContactModalOpen(false)}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <span className="shv-triada-modal-eyebrow">CONCIERGE & INQUIRIES</span>
            <h3 className="shv-triada-modal-title">Contact Atelier</h3>
            <p className="shv-triada-modal-desc">
              For bespoke creations, atelier visits, or corporate gifting:
            </p>
            <div className="shv-triada-contact-info">
              <div>
                <strong>Email:</strong> hello@shveraa.com
              </div>
              <div>
                <strong>Atelier:</strong> Jaipur, Rajasthan, India
              </div>
              <div>
                <strong>Client Care:</strong> Monday – Saturday, 10 AM – 7 PM IST
              </div>
            </div>
            <a
              href="mailto:hello@shveraa.com?subject=Atelier%20Inquiry%20-%20Shveraa"
              className="shv-triada-modal-btn"
              style={{ marginTop: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none' }}
            >
              <Mail size={14} />
              <span>SEND AN INQUIRY</span>
            </a>
          </div>
        </div>
      )}

      {/* Passkey Unlock Modal (For Owner / Staff) */}
      {passkeyModalOpen && (
        <div className="shv-triada-modal-overlay" onClick={() => setPasskeyModalOpen(false)}>
          <div
            className="shv-triada-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              className="shv-triada-modal-close"
              onClick={() => setPasskeyModalOpen(false)}
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
              <KeyRound size={18} color="#1A1A1A" />
              <span className="shv-triada-modal-eyebrow" style={{ margin: 0 }}>STAFF ACCESS</span>
            </div>
            <h3 className="shv-triada-modal-title">Atelier Passkey</h3>
            <p className="shv-triada-modal-desc">
              Enter master passkey to unlock the live storefront on this device.
            </p>

            <form onSubmit={handleUnlockSubmit} className="shv-triada-modal-form">
              <input
                type="password"
                autoFocus
                required
                value={passkeyInput}
                onChange={(e) => {
                  setPasskeyInput(e.target.value);
                  setPasskeyError('');
                }}
                placeholder="Enter passkey (e.g. shveraa2026)..."
                className="shv-triada-modal-input"
              />
              {passkeyError && <p className="shv-triada-error-text">{passkeyError}</p>}
              <button type="submit" className="shv-triada-modal-btn">
                <span>UNLOCK STORE</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComingSoon;
