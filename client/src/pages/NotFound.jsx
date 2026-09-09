import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, 
  Sparkles, 
  ArrowRight, 
  Search, 
  ShieldCheck, 
  Package, 
  HelpCircle, 
  Home as HomeIcon 
} from 'lucide-react';

const NotFound = () => {
  return (
    <div className="shv-404-page">
      <div className="container">
        {/* Luxury Breadcrumb */}
        <div className="shv-404-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>404 Atelier Archive</span>
        </div>

        {/* Main 404 Showcase */}
        <div className="shv-404-card">
          <div className="shv-404-emblem">
            <span className="shv-404-num">404</span>
            <div className="shv-404-seal-tag">
              <Compass size={18} />
              <span>LOST SILHOUETTE</span>
            </div>
          </div>

          <span className="shv-404-eyebrow">Archival Horizon</span>
          <h1 className="shv-404-title">A Silhouette Unfound in Our Atelier</h1>
          
          <p className="shv-404-desc">
            The creation or archive you are seeking has either transitioned to our private vault, 
            undergone bespoke re-sculpting, or was mapped to an uncharted gallery path. 
            Allow our silversmiths to guide your voyage back to certified brilliance.
          </p>

          {/* Primary Action Buttons */}
          <div className="shv-404-actions">
            <Link to="/shop" className="shv-404-btn primary">
              <span>Explore The Atelier</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/" className="shv-404-btn secondary">
              <HomeIcon size={16} />
              <span>Return Home</span>
            </Link>
          </div>

          {/* Luxury Curated Navigation Quick Links */}
          <div className="shv-404-suggestions">
            <h3 className="shv-404-suggestions-title">Perhaps You Were Seeking</h3>
            <div className="shv-404-links-grid">
              <Link to="/shop?category=Rings" className="shv-404-nav-card">
                <div className="shv-404-nav-icon"><Sparkles size={18} /></div>
                <div>
                  <h4>Fine 925 Rings</h4>
                  <p>Solitaires, eternal bands & stacks</p>
                </div>
              </Link>

              <Link to="/track-order" className="shv-404-nav-card">
                <div className="shv-404-nav-icon"><Package size={18} /></div>
                <div>
                  <h4>Track An Order</h4>
                  <p>Air express live transit status</p>
                </div>
              </Link>

              <Link to="/size-guide" className="shv-404-nav-card">
                <div className="shv-404-nav-icon"><HelpCircle size={18} /></div>
                <div>
                  <h4>Ring Sizing & Care</h4>
                  <p>BIS standards & silver upkeep</p>
                </div>
              </Link>

              <Link to="/contact" className="shv-404-nav-card">
                <div className="shv-404-nav-icon"><ShieldCheck size={18} /></div>
                <div>
                  <h4>Private Concierge</h4>
                  <p>WhatsApp silversmith counsel</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Hallmark Reassurance */}
        <div className="shv-404-footer-strip">
          <span>✦ Pure 925 Sterling Silver</span>
          <span>•</span>
          <span>✦ BIS Hallmarked Authenticity</span>
          <span>•</span>
          <span>✦ Anti-Tarnish Platinum Rhodium Finish</span>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
