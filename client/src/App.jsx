import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';

import Lenis from 'lenis';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import About from './pages/About';
import Contact from './pages/Contact';
import Auth from './pages/Auth';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Account from './pages/Account';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import Returns from './pages/Returns';
import Wishlist from './pages/Wishlist';
import TrackOrder from './pages/TrackOrder';
import SizeGuide from './pages/SizeGuide';
import Search from './pages/Search';
import NotFound from './pages/NotFound';
import ShippingCancellation from './pages/ShippingCancellation';
import ComingSoon from './pages/ComingSoon';
import AdminLayout from './admin/AdminLayout';

// Scroll to top helper on route navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// Global Toast Banner
const GlobalToast = () => {
  const { toast } = useCart();
  if (!toast) return null;

  return (
    <div className="toast-container">
      <div className="toast">
        <span>✨ {toast}</span>
      </div>
    </div>
  );
};

// Owner Preview Indicator for Live Store Browsing
const OwnerPreviewIndicator = ({ onLock }) => {
  const [minimized, setMinimized] = useState(false);

  if (minimized) {
    return (
      <button
        type="button"
        onClick={() => setMinimized(false)}
        className="shv-owner-preview-minimized"
        title="Owner Mode Active • Click to expand"
      >
        <span className="shv-owner-pulse-dot" />
        <span>Owner Mode</span>
      </button>
    );
  }

  return (
    <div className="shv-owner-preview-banner">
      <div className="shv-owner-preview-left">
        <span className="shv-owner-pulse-dot" />
        <div className="shv-owner-preview-text">
          <strong>Owner Preview Mode</strong>
          <span>Visitors see Coming Soon</span>
        </div>
      </div>
      <div className="shv-owner-preview-actions">
        <button
          type="button"
          onClick={onLock}
          className="shv-owner-preview-btn-lock"
          title="Preview what public visitors see"
        >
          View Coming Soon
        </button>
        <button
          type="button"
          onClick={() => setMinimized(true)}
          className="shv-owner-preview-btn-close"
          title="Minimize indicator"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

const AppContent = () => {
  const { pathname, search } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  // Check for Coming Soon mode and owner bypass
  const [isBypassed, setIsBypassed] = useState(() => {
    try {
      const saved = localStorage.getItem('shveraa_bypass_coming_soon');
      const adminToken = localStorage.getItem('shveraa_admin_token') || localStorage.getItem('shveraa_admin_session');
      return saved === 'true' || !!adminToken;
    } catch (e) {
      return false;
    }
  });

  // Handle URL query parameters (?preview=shveraa or ?lock=true)
  useEffect(() => {
    try {
      const params = new URLSearchParams(search);
      const previewParam = params.get('preview') || params.get('access') || params.get('bypass');
      const lockParam = params.get('lock');

      if (lockParam === 'true') {
        localStorage.removeItem('shveraa_bypass_coming_soon');
        setIsBypassed(false);
        window.history.replaceState({}, '', pathname);
        return;
      }

      if (
        previewParam === 'shveraa' ||
        previewParam === 'true' ||
        previewParam === 'shveraa2026' ||
        previewParam === 'admin'
      ) {
        localStorage.setItem('shveraa_bypass_coming_soon', 'true');
        setIsBypassed(true);
        window.history.replaceState({}, '', pathname);
      }
    } catch (e) {
      // Ignore
    }
  }, [search, pathname]);

  // Awwwards-Style Silky Smooth Momentum Scrolling for Storefront (bypassed on Admin for fixed SaaS layout)
  useEffect(() => {
    if (isAdmin || !isBypassed) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, [isAdmin]);

  if (isAdmin) {
    return (
      <Routes>
        <Route path="/admin/*" element={<AdminLayout />} />
        <Route path="/admin" element={<AdminLayout />} />
      </Routes>
    );
  }

  // Public visitors see Coming Soon
  if (!isBypassed) {
    return <ComingSoon onUnlock={() => setIsBypassed(true)} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/account" element={<Account />} />
          <Route path="/profile" element={<Account />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<Terms />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/return-policy" element={<Returns />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/tracking" element={<TrackOrder />} />
          <Route path="/size-guide" element={<SizeGuide />} />
          <Route path="/silver-care" element={<SizeGuide />} />
          <Route path="/shipping" element={<ShippingCancellation />} />
          <Route path="/shipping-cancellation" element={<ShippingCancellation />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
      <GlobalToast />
      <OwnerPreviewIndicator
        onLock={() => {
          localStorage.removeItem('shveraa_bypass_coming_soon');
          setIsBypassed(false);
        }}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <ScrollToTop />
          <AppContent />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
