import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Menu,
  X,
  Search,
  Heart,
  Sparkles,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Award,
  User,
  Package,
  MapPin,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useDynamicStore } from '../services/storeService';

const DEFAULT_ANNOUNCEMENTS = [
  '✦ Complimentary Insured Express Shipping on Orders Over ₹999',
  '✦ 20% Off Your First Silver Order • Use Code: SHVERAA20',
  '✦ Certified Pure 925 Sterling Silver • Anti-Tarnish Lifetime Warranty',
];

const Navbar = () => {
  const { categories, settings } = useDynamicStore();
  const [announcementIdx, setAnnouncementIdx] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [megaMenuOpen, setMegaMenuOpen] = useState(null); // 'shop' | 'collections' | 'personalised' | null
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const announcements = [
    settings?.announcementText || DEFAULT_ANNOUNCEMENTS[0],
    DEFAULT_ANNOUNCEMENTS[1],
    DEFAULT_ANNOUNCEMENTS[2],
  ];

  // Auto rotate announcement bar every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setAnnouncementIdx((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [announcements.length]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const closeAllMenus = () => {
    setMobileMenuOpen(false);
    setMegaMenuOpen(null);
  };

  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const [isScrolled, setIsScrolled] = useState(false);

  // Detect scroll to transition from transparent floating to frosted glass
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* 1. Top Rotating Announcement Bar (Hidden on editorial Home page to match reference design) */}
      {!isHomePage && (
        <div className="announcement-bar">
          <div className="announcement-text-container">
            <span className="announcement-text">{ANNOUNCEMENTS[announcementIdx]}</span>
          </div>
        </div>
      )}

      {/* 2. Main Site Header — Transparent Floating on Home, Frosted on Scroll & Inner Pages */}
      <header
        className={`site-header ${isHomePage ? 'shv-home-header' : 'shv-inner-header'} ${
          isScrolled ? 'shv-header-scrolled' : 'shv-header-transparent'
        }`}
      >
        <div className="header-inner">
          {/* Mobile Menu Hamburger Button */}
          <button
            className="menu-toggle-btn"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open Navigation Menu"
          >
            <Menu size={22} />
          </button>

          {/* Brand Logo with Pure 925 Silver Centered Star Aesthetic */}
          <Link to="/" className="shv-nav-brand-wrap" onClick={closeAllMenus}>
            <div className="shv-nav-brand-emblem" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0L14.2 9.8L24 12L14.2 14.2L12 24L9.8 14.2L0 12L9.8 9.8L12 0Z" />
              </svg>
            </div>
            <span className="shv-nav-brand-title">SHVERAA</span>
            <span className="shv-nav-brand-subtitle">PURE 925 SILVER</span>
          </Link>

          {/* Desktop Navigation Links matching Reference Design */}
          <nav className="desktop-nav">
            <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Home
            </NavLink>

            {/* Mega-menu: Collections */}
            <div
              className="nav-dropdown-trigger"
              onMouseEnter={() => setMegaMenuOpen('shop')}
              onMouseLeave={() => setMegaMenuOpen(null)}
            >
              <NavLink
                to="/shop"
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              >
                <span>Collections</span>
              </NavLink>

              {megaMenuOpen === 'shop' && (
                <div className="mega-menu">
                  <div className="mega-menu-inner">
                    <div className="mega-col">
                      <span className="mega-col-title">Shop by Silhouette</span>
                      <ul className="mega-links">
                        {categories.map((cat) => (
                          <li key={cat.slug || cat.id}>
                            <Link
                              to={`/shop?category=${cat.slug}`}
                              onClick={closeAllMenus}
                              className="mega-link"
                            >
                              <span>{cat.name}</span>
                              <span className="mega-link-sub">{cat.subtitle || '925 Silver'}</span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mega-col">
                      <span className="mega-col-title">925 Silver Finishes</span>
                      <ul className="mega-links">
                        <li>
                          <Link to="/shop?finish=rhodium" onClick={closeAllMenus} className="mega-link">
                            <span>Mirror Rhodium Finish</span>
                            <span className="mega-link-sub">Platinum Luster, Anti-Tarnish</span>
                          </Link>
                        </li>
                        <li>
                          <Link to="/shop?finish=moissanite" onClick={closeAllMenus} className="mega-link">
                            <span>Lab Moissanite Solitaires</span>
                            <span className="mega-link-sub">VVS Diamond Fire</span>
                          </Link>
                        </li>
                        <li>
                          <Link to="/shop?finish=oxidised" onClick={closeAllMenus} className="mega-link">
                            <span>Vintage Oxidised Silver</span>
                            <span className="mega-link-sub">Textured Architectural Details</span>
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* Editorial Feature Image */}
                    <div className="mega-col mega-featured-card">
                      <img
                        src="/hero-ring-banner.jpg"
                        alt="Liquid Silver Collection"
                      />
                      <div className="mega-card-content">
                        <span className="mega-card-tag">NEW DROP</span>
                        <h4>The Solitaire Leaf Edit</h4>
                        <Link to="/shop" onClick={closeAllMenus} className="mega-card-link">
                          Explore Edit <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              About
            </NavLink>

            {/* Custom Jewellery link */}
            <NavLink
              to="/shop?category=personalised"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              Custom Jewellery
            </NavLink>

            <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              Contact
            </NavLink>
          </nav>

          {/* Right Action Icons & Let's Shine CTA */}
          <div className="header-actions">
            {/* Search Toggle */}
            <button
              className="action-btn"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search Collection"
            >
              <Search size={18} strokeWidth={1.3} />
            </button>

            {/* Wishlist Link */}
            <Link to="/wishlist" className="action-btn" aria-label="Saved Items">
              <Heart size={18} strokeWidth={1.3} />
              {wishlistCount > 0 && <span className="cart-badge">{wishlistCount}</span>}
            </Link>

            {/* User Account / Profile */}
            {isAuthenticated ? (
              <div
                className="shv-nav-user-wrap"
                onMouseEnter={() => setUserDropdownOpen(true)}
                onMouseLeave={() => setUserDropdownOpen(false)}
              >
                <Link
                  to="/account"
                  className="action-btn shv-nav-user-btn"
                  aria-label="My Atelier Account & Orders"
                  title="My Atelier Account & Orders"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <span className="shv-user-avatar-pill">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </Link>

                {userDropdownOpen && (
                  <div className="shv-user-dropdown">
                    <Link
                      to="/account"
                      onClick={() => setUserDropdownOpen(false)}
                      className="shv-user-dropdown-header"
                      style={{ textDecoration: 'none', display: 'block' }}
                    >
                      <strong>{user.name}</strong>
                      <span>{user.email}</span>
                      <span className="shv-dropdown-tier-badge">✦ Atelier Connoisseur</span>
                    </Link>
                    <div className="shv-user-dropdown-divider" />
                    <Link
                      to="/account?tab=orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="shv-dropdown-item"
                    >
                      <Package size={14} />
                      <span>My Orders &amp; Dispatches</span>
                    </Link>
                    <Link
                      to="/account?tab=addresses"
                      onClick={() => setUserDropdownOpen(false)}
                      className="shv-dropdown-item"
                    >
                      <MapPin size={14} />
                      <span>Saved Delivery Addresses</span>
                    </Link>
                    <Link
                      to="/wishlist"
                      onClick={() => setUserDropdownOpen(false)}
                      className="shv-dropdown-item"
                    >
                      <Heart size={14} />
                      <span>Saved Wishlist ({wishlistCount})</span>
                    </Link>
                    <Link
                      to="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="shv-dropdown-item"
                      style={{ color: '#A07E52', fontWeight: 600 }}
                    >
                      <span>✦ Atelier Admin Panel</span>
                    </Link>
                    <div className="shv-user-dropdown-divider" />
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="shv-dropdown-item shv-logout-btn"
                    >
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="action-btn" aria-label="Sign In to Atelier" title="Sign In to Atelier">
                <User size={18} strokeWidth={1.3} />
              </Link>
            )}

            {/* Slide-in Cart Trigger Button */}
            <button
              type="button"
              className="action-btn action-btn-cart"
              onClick={openCart}
              aria-label="Shopping Bag"
            >
              <ShoppingBag size={18} strokeWidth={1.3} />
              <span className="cart-badge">{cartCount}</span>
            </button>

            {/* Reference "LET'S SHINE →" Button */}
            <Link to="/shop" className="shv-nav-shine-btn">
              <span>LET'S SHINE</span>
              <ArrowRight size={13} strokeWidth={1.5} />
            </Link>
          </div>
        </div>

        {/* Expandable Search Drawer */}
        {searchOpen && (
          <div className="search-drawer-bar">
            <form onSubmit={handleSearchSubmit} className="container search-form-container">
              <Search size={18} className="search-input-icon" />
              <input
                type="text"
                placeholder="Search rings, necklaces, 925 silver, personalised names..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="search-input-field"
              />
              <button type="submit" className="btn btn-primary btn-sm">
                Search
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="action-btn"
                aria-label="Close search"
              >
                <X size={18} />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Mobile Drawer Overlay */}
      <div
        className={`mobile-drawer-overlay ${mobileMenuOpen ? 'open' : ''}`}
        onClick={closeAllMenus}
      />

      {/* Mobile Drawer Menu */}
      <div className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <Link to="/" className="brand-logo" onClick={closeAllMenus}>
            SHVERAA <span className="brand-logo-gem">✦</span>
          </Link>
          <button onClick={closeAllMenus} className="action-btn" aria-label="Close menu">
            <X size={22} />
          </button>
        </div>

        {/* Offer banner inside drawer */}
        <div className="drawer-offer-pill">
          <Sparkles size={14} />
          <span>Code SHVERAA20 for 20% off your first piece</span>
        </div>

        <div className="drawer-links">
          <NavLink to="/" onClick={closeAllMenus} className="drawer-link">
            Home
          </NavLink>
          <NavLink to="/shop" onClick={closeAllMenus} className="drawer-link">
            Shop All 925 Silver
          </NavLink>
          <NavLink to="/shop?category=personalised" onClick={closeAllMenus} className="drawer-link">
            Personalised &amp; Name Jewellery
          </NavLink>
          <NavLink to="/about" onClick={closeAllMenus} className="drawer-link">
            Our Atelier Story
          </NavLink>
          <NavLink to="/contact" onClick={closeAllMenus} className="drawer-link">
            Client Concierge
          </NavLink>
          <NavLink to="/wishlist" onClick={closeAllMenus} className="drawer-link">
            My Wishlist ({wishlistCount})
          </NavLink>
          <NavLink to="/track-order" onClick={closeAllMenus} className="drawer-link">
            Track Order Status
          </NavLink>
          <NavLink to="/size-guide" onClick={closeAllMenus} className="drawer-link">
            Ring Size &amp; Silver Care
          </NavLink>
          {isAuthenticated ? (
            <NavLink to="/account" onClick={closeAllMenus} className="drawer-link" style={{ color: 'var(--color-gold, #B08D57)', fontWeight: 600 }}>
              My Atelier Account &amp; Orders ({user?.name?.split(' ')[0]})
            </NavLink>
          ) : (
            <NavLink to="/login" onClick={closeAllMenus} className="drawer-link" style={{ color: 'var(--color-gold, #B08D57)', fontWeight: 600 }}>
              Sign In to Atelier Vault
            </NavLink>
          )}
        </div>

        {/* Categories Section */}
        <div className="drawer-categories">
          <div className="drawer-categories-title">Categories</div>
          <div className="drawer-category-pills">
            {categories.map((cat) => (
              <Link
                key={cat.slug || cat.id}
                to={`/shop?category=${cat.slug}`}
                onClick={closeAllMenus}
                className="drawer-cat-chip"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Mobile Trust strip */}
        <div className="drawer-trust-strip">
          <div className="drawer-trust-item">
            <ShieldCheck size={16} /> Certified 925 Sterling Silver
          </div>
          <div className="drawer-trust-item">
            <Award size={16} /> Lifetime Anti-Tarnish Guarantee
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
