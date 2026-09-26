import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, Truck, RotateCcw, Heart } from 'lucide-react';
import { useDynamicStore } from '../services/storeService';

const Footer = () => {
  const { categories } = useDynamicStore();

  return (
    <footer className="site-footer">
      <div className="container">
        {/* Top Trust Icons Row */}
        <div className="footer-trust-row">
          <div className="footer-trust-col">
            <ShieldCheck size={22} className="footer-trust-icon" />
            <div>
              <div className="footer-trust-title">Certified 925 Hallmarked</div>
              <div className="footer-trust-sub">Pure silver with BIS certification stamp</div>
            </div>
          </div>

          <div className="footer-trust-col">
            <Sparkles size={22} className="footer-trust-icon" />
            <div>
              <div className="footer-trust-title">Anti-Tarnish Rhodium Polish</div>
              <div className="footer-trust-sub">Waterproof &amp; hypoallergenic luster</div>
            </div>
          </div>

          <div className="footer-trust-col">
            <Truck size={22} className="footer-trust-icon" />
            <div>
              <div className="footer-trust-title">Free Insured Shipping</div>
              <div className="footer-trust-sub">Complimentary delivery over ₹999</div>
            </div>
          </div>

          <div className="footer-trust-col">
            <RotateCcw size={22} className="footer-trust-icon" />
            <div>
              <div className="footer-trust-title">30-Day Hassle-Free Returns</div>
              <div className="footer-trust-sub">100% money-back satisfaction guarantee</div>
            </div>
          </div>
        </div>

        {/* Main Footer Columns */}
        <div className="footer-grid">
          {/* Brand Col */}
          <div className="footer-brand-col">
            <Link to="/" className="footer-brand-logo-wrap" aria-label="Shveraa Jewellery Home">
              <img
                src="/logo.png"
                alt="SHVÈRAA Jewellery"
                className="footer-brand-logo-img"
              />
            </Link>
            <p className="footer-desc">
              Modern fine silver jewellery meticulously sculpted from solid 925 sterling silver and high-fire rhodium. Designed for daily rituals and permanent milestones.
            </p>
            <div className="footer-atelier-note">
              <Sparkles size={15} />
              <span>10,000+ Happy Customers Across India &amp; Worldwide</span>
            </div>
          </div>

          {/* Quick Categories Col */}
          <div>
            <h4 className="footer-col-title">925 Silver Collections</h4>
            <ul className="footer-links">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link to={`/shop?category=${cat.slug}`} className="footer-link">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation & Services Col */}
          <div>
            <h4 className="footer-col-title">About &amp; Concierge</h4>
            <ul className="footer-links">
              <li>
                <Link to="/about" className="footer-link">About Us (Our Story)</Link>
              </li>
              <li>
                <Link to="/contact" className="footer-link">Contact Us &amp; WhatsApp</Link>
              </li>
              <li>
                <Link to="/shop?bestseller=true" className="footer-link">Bestsellers Edit</Link>
              </li>
              <li>
                <Link to="/track-order" className="footer-link">Track Air Express Order</Link>
              </li>
              <li>
                <Link to="/size-guide" className="footer-link">Ring Size &amp; Silver Care Guide</Link>
              </li>
              <li>
                <Link to="/wishlist" className="footer-link">Curated Wishlist</Link>
              </li>
              <li>
                <Link to="/return-policy" className="footer-link">30-Day Returns &amp; Exchanges</Link>
              </li>
              <li>
                <Link to="/account" className="footer-link">My Atelier Account &amp; Orders</Link>
              </li>
              <li>
                <Link to="/cart" className="footer-link">View Shopping Bag</Link>
              </li>
              <li>
                <Link to="/shipping" className="footer-link">Shipping &amp; Cancellation</Link>
              </li>
            </ul>
          </div>

          {/* Value Highlights Col */}
          <div>
            <h4 className="footer-col-title">The Shveraa Assurance</h4>
            <div className="footer-promise-list">
              <div className="footer-promise-item">
                <strong>925 Hallmarked Purity:</strong> Every piece is laser-tested and stamped for authentic precious metal purity.
              </div>
              <div className="footer-promise-item">
                <strong>Signature Box Packaging:</strong> Includes soft microfiber silver care pouch, polishing cloth &amp; certificate.
              </div>
              <div className="footer-promise-item">
                <strong>Secure Payments:</strong> Encrypted 256-bit checkout via UPI, Cards, NetBanking, and Razorpay.
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal Links Strip */}
        <div className="footer-legal-bar">
          <div className="footer-legal-links">
            <Link to="/privacy-policy" className="footer-legal-link">Privacy Policy</Link>
            <span className="footer-legal-sep">•</span>
            <Link to="/terms-and-conditions" className="footer-legal-link">Terms &amp; Conditions</Link>
            <span className="footer-legal-sep">•</span>
            <Link to="/return-policy" className="footer-legal-link">Return &amp; Exchange Policy</Link>
            <span className="footer-legal-sep">•</span>
            <Link to="/about" className="footer-legal-link">About Us</Link>
            <span className="footer-legal-sep">•</span>
            <Link to="/contact" className="footer-legal-link">Contact Concierge</Link>
          </div>
        </div>

        {/* Bottom Copyright & Badges */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            © {new Date().getFullYear()} SHVERAA Silver Atelier. All Rights Reserved. Crafted with care for the modern muse.
          </div>
          <div className="footer-payment-badges">
            <span className="payment-pill">UPI</span>
            <span className="payment-pill">Visa</span>
            <span className="payment-pill">Mastercard</span>
            <span className="payment-pill">RuPay</span>
            <span className="payment-pill">NetBanking</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
