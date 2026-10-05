import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Menu,
  X,
  Search,
  Heart,
  Sparkles,
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
  const navigate = useNavigate();
  const { settings } = useDynamicStore();
  const { user, isAuthenticated, logout } = useAuth();
  const { cartItemCount, openCart, wishlistCount } = useCart();
  const [announcementIdx, setAnnouncementIdx] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const configuredAnnouncements = Array.isArray(settings?.announcements)
    ? settings.announcements.filter((message) => typeof message === 'string' && message.trim())
    : [];
  const announcements =
    configuredAnnouncements.length > 0
      ? configuredAnnouncements
      : [
          settings?.announcementText?.trim() || DEFAULT_ANNOUNCEMENTS[0],
          ...DEFAULT_ANNOUNCEMENTS.slice(1),
        ];
  const announcementSignature = announcements.join('\u0000');
  const visibleAnnouncement = announcements[announcementIdx % announcements.length];

  useEffect(() => {
    setAnnouncementIdx(0);
  }, [announcementSignature]);

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
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  const closeAllMenus = () => {
    setMobileMenuOpen(false);
  };

  const location = useLocation();
  const isHomePage = location.pathname === '/';
  const isShopRoute = location.pathname === '/shop';
  const currentCategory = new URLSearchParams(location.search).get('category');
  const [isScrolled, setIsScrolled] = useState(false);

  // Detect scroll to transition from transparent floating to frosted glass with passive listener
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.scrollY > 30;
          setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Top rotating announcement bar */}
      {!isHomePage && (
        <div className="announcement-bar" role="region" aria-label="Offers and Announcements">
          <div key={announcementIdx} className="announcement-text-container shv-announcement-animate">
            <span className="announcement-text">{visibleAnnouncement}</span>
          </div>
        </div>
      )}

      {/* 2. Main Site Header — Transparent Floating on Home, Frosted on Scroll & Inner Pages */}
      <header
        className={`site-header ${isHomePage ? 'shv-home-header' : 'shv-inner-header'} ${
          isScrolled ? 'shv-header-scrolled' : 'shv-header-transparent'
        }`}
      >
        {/* Tier 1: Primary Header Row (Left: Let's Shine CTA | Center: Brand Logo | Right: Actions) */}
        <div className="header-primary-row">
          {/* Left Area: Mobile Hamburger (<992px) & "LET'S SHINE" Button (>=992px) */}
          <div className="shv-header-left">
            <button
              className="menu-toggle-btn"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Navigation Menu"
            >
              <Menu size={22} />
            </button>

            <Link
              to="/shop"
              className="shv-nav-shine-btn"
              title="Explore 925 Sterling Silver Atelier Creations"
            >
              <Sparkles size={14} className="shv-shine-sparkle" />
              <span>LET'S SHINE</span>
              <ArrowRight size={13} strokeWidth={1.8} className="shv-shine-arrow" />
            </Link>
          </div>

          {/* Center Area: Officially Centered Brand Logo */}
          <div className="shv-header-center">
            <Link
              to="/"
              className="shv-nav-brand-wrap"
              onClick={closeAllMenus}
              aria-label="Shveraa Jewellery Home"
            >
              <img
                src="/shveraa.png"
                alt="SHVÈRAA Jewellery"
                className="shv-brand-logo-img"
              />
            </Link>
          </div>

          {/* Right Area: Utility Icons (Search, Wishlist, Account, Shopping Bag) */}
          <div className="shv-header-right">
            {/* Search Link directly to /search */}
            <Link
              to="/search"
              className="action-btn"
              aria-label="Search Collection"
              title="Search 925 Silver Treasury"
            >
              <Search size={19} strokeWidth={1.9} />
            </Link>

            {/* User Account / Profile Dropdown */}
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
                      to="/account?tab=wishlist"
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
                <User size={19} strokeWidth={1.9} />
              </Link>
            )}

            {/* Slide-in Cart Trigger Button with Badge */}
            <button
              type="button"
              className="action-btn action-btn-cart"
              onClick={openCart}
              aria-label="Shopping Bag"
              title="Shopping Bag"
            >
              <ShoppingBag size={19} strokeWidth={1.9} />
              <span className="cart-badge">{cartItemCount}</span>
            </button>
          </div>
        </div>

        {/* Tier 2: Dedicated Centered Menu Row Underneath Logo */}
        <div className="header-menu-row">
          <nav className="desktop-nav" aria-label="Main Store Navigation">
            <Link
              to="/"
              className={`nav-link ${isHomePage ? 'active' : ''}`}
            >
              Home
            </Link>

            {/* Collections and Custom Jewellery temporarily hidden per request */}
            <Link
              to="/shop?category=rings"
              className={`nav-link ${isShopRoute && currentCategory === 'rings' ? 'active' : ''}`}
            >
              Rings
            </Link>

            <Link
              to="/shop?category=necklaces"
              className={`nav-link ${isShopRoute && currentCategory === 'necklaces' ? 'active' : ''}`}
            >
              Necklaces
            </Link>

            <Link
              to="/shop?category=earrings"
              className={`nav-link ${isShopRoute && currentCategory === 'earrings' ? 'active' : ''}`}
            >
              Earrings
            </Link>

            <Link
              to="/shop?category=bracelets"
              className={`nav-link ${isShopRoute && currentCategory === 'bracelets' ? 'active' : ''}`}
            >
              Bracelets
            </Link>
          </nav>
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
          <Link to="/" className="shv-drawer-brand-wrap" onClick={closeAllMenus} aria-label="Shveraa Jewellery Home">
            <img
              src="/shveraa.png"
              alt="SHVÈRAA Jewellery"
              className="shv-brand-logo-img-drawer"
            />
          </Link>
          <button onClick={closeAllMenus} className="action-btn" aria-label="Close menu">
            <X size={22} />
          </button>
        </div>

        {/* Let's Shine CTA Button inside Drawer */}
        <div className="drawer-shine-cta-wrap">
          <Link to="/shop" onClick={closeAllMenus} className="drawer-shine-btn">
            <Sparkles size={15} />
            <span>LET'S SHINE</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Offer banner inside drawer */}
        <div className="drawer-offer-pill">
          <Sparkles size={14} />
          <span>Code SHVERAA20 for 20% off your first piece</span>
        </div>

        {/* Quick Search inside Drawer */}
        <form onSubmit={handleSearchSubmit} className="shv-drawer-search-form">
          <Search size={16} color="#72685C" />
          <input
            type="text"
            placeholder="Search silver rings, chains..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="drawer-links">
          {/* Main Primary Navigation matching Desktop Header */}
          <Link
            to="/"
            onClick={closeAllMenus}
            className={`drawer-link ${isHomePage ? 'active' : ''}`}
          >
            Home
          </Link>

          {/* Collections and Custom Jewellery temporarily hidden per request */}
          <Link
            to="/shop?category=rings"
            onClick={closeAllMenus}
            className={`drawer-link ${isShopRoute && currentCategory === 'rings' ? 'active' : ''}`}
          >
            Rings
          </Link>

          <Link
            to="/shop?category=necklaces"
            onClick={closeAllMenus}
            className={`drawer-link ${isShopRoute && currentCategory === 'necklaces' ? 'active' : ''}`}
          >
            Necklaces
          </Link>

          <Link
            to="/shop?category=earrings"
            onClick={closeAllMenus}
            className={`drawer-link ${isShopRoute && currentCategory === 'earrings' ? 'active' : ''}`}
          >
            Earrings
          </Link>

          <Link
            to="/shop?category=bracelets"
            onClick={closeAllMenus}
            className={`drawer-link ${isShopRoute && currentCategory === 'bracelets' ? 'active' : ''}`}
          >
            Bracelets
          </Link>

          {/* Secondary Support & Utility Links */}
          <div className="drawer-divider" />

          <Link
            to="/about"
            onClick={closeAllMenus}
            className={`drawer-link drawer-link-secondary ${location.pathname === '/about' ? 'active' : ''}`}
          >
            Our Atelier Story
          </Link>

          <Link
            to="/contact"
            onClick={closeAllMenus}
            className={`drawer-link drawer-link-secondary ${location.pathname === '/contact' ? 'active' : ''}`}
          >
            Contact &amp; Customer Care
          </Link>

          <Link
            to={isAuthenticated ? '/account?tab=wishlist' : '/login'}
            onClick={closeAllMenus}
            className={`drawer-link drawer-link-secondary ${location.pathname === '/account' && location.search.includes('wishlist') ? 'active' : ''}`}
          >
            My Wishlist ({wishlistCount})
          </Link>

          <Link
            to="/track-order"
            onClick={closeAllMenus}
            className={`drawer-link drawer-link-secondary ${location.pathname === '/track-order' ? 'active' : ''}`}
          >
            Track Order Status
          </Link>

          <Link
            to="/size-guide"
            onClick={closeAllMenus}
            className={`drawer-link drawer-link-secondary ${location.pathname === '/size-guide' ? 'active' : ''}`}
          >
            Ring Size &amp; Silver Care
          </Link>

          {isAuthenticated ? (
            <Link
              to="/account"
              onClick={closeAllMenus}
              className="drawer-link drawer-link-secondary drawer-link-account"
            >
              My Atelier Account &amp; Orders ({user?.name?.split(' ')[0]})
            </Link>
          ) : (
            <Link
              to="/login"
              onClick={closeAllMenus}
              className="drawer-link drawer-link-secondary drawer-link-account"
            >
              Sign In to Atelier Vault
            </Link>
          )}
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
