import React, { useState } from 'react';
import { Mail, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <section className="newsletter-section">
      <div className="container">
        <div className="newsletter-box">
          <div className="newsletter-badge">
            <Sparkles size={13} />
            <span>VIP Silver Privilege</span>
          </div>

          <span className="shv-script-eyebrow shv-script-eyebrow-light">The Collector's Circle</span>
          <h2 className="newsletter-title">Unlock 10% Off Your First Silver Piece</h2>
          <p className="newsletter-sub">
            Join the Shveraa Atelier Circle for early access to limited artisan drops, seasonal curation, and private collector privileges.
          </p>

          {subscribed ? (
            <div className="newsletter-success-box">
              <CheckCircle2 size={20} color="#10B981" />
              <span>
                Welcome to Shveraa! Your 10% discount code is: <strong>SILVER10</strong>
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="newsletter-form">
              <div className="newsletter-input-wrapper">
                <Mail size={17} className="newsletter-input-icon" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email for 10% off..."
                  className="newsletter-input"
                />
              </div>
              <button type="submit" className="btn btn-primary newsletter-submit-btn">
                <span>Claim 10% Off</span>
                <ArrowRight size={15} />
              </button>
            </form>
          )}

          <div className="newsletter-disclaimer">
            Zero spam. Only certified pure 925 silver craftsmanship and private perks. Unsubscribe anytime.
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
