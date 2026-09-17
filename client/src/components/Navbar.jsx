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
  const navigate = useNavigate();
  const { categories, settings } = useDynamicStore();
  const { user, isAuthenticated, logout } = useAuth();
  const { cartItemCount, openCart, wishlistCount } = useCart();
  const [announcementIdx, setAnnouncementIdx] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [megaMenuOpen, setMegaMenuOpen] = useState(null); // 'shop' | 'collections' | 'personalised' | null
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const announcements =
    settings?.announcements && settings.announcements.length > 0
      ? settings.announcements
      : [
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
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
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
  const isShopRoute = location.pathname === '/shop';
  const currentCategory = new URLSearchParams(location.search).get('category');
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
        <div className="announcement-bar" role="region" aria-label="Offers and Announcements">
          <div key={announcementIdx} className="announcement-text-container shv-announcement-animate">
            <span className="announcement-text">{announcements[announcementIdx]}</span>
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

            {/* Wishlist Link with Badge */}
            <Link to="/wishlist" className="action-btn" aria-label="Saved Items" title="My Wishlist">
              <Heart size={19} strokeWidth={1.9} />
              {wishlistCount > 0 && <span className="cart-badge">{wishlistCount}</span>}
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

            {/* Mega-menu: Collections */}
            <div
              className="nav-dropdown-trigger"
              onMouseEnter={() => setMegaMenuOpen('shop')}
              onMouseLeave={() => setMegaMenuOpen(null)}
            >
              <Link
                to="/shop"
                className={`nav-link ${isShopRoute && !currentCategory ? 'active' : ''}`}
              >
                <span>Collections</span>
                <ChevronDown size={13} className="nav-chevron" />
              </Link>

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

            <Link
              to="/shop?category=personalised"
              className={`nav-link ${isShopRoute && currentCategory === 'personalised' ? 'active' : ''}`}
            >
              Custom Jewellery
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
