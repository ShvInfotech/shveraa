import React, { useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';

import Lenis from 'lenis';
import { onForegroundMessage } from './services/firebase';

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
import AdminLayout from './admin/AdminLayout';
import CookieConsent from './components/CookieConsent';
import ErrorBoundary from './components/ErrorBoundary';

const ROUTE_SEO = {
  '/': {
    title: 'Shveraa — Fine Designer 925 Sterling Silver Jewellery & Handcrafted Adornments',
    desc: "Discover Shveraa's handcrafted modern jewellery collection: timeless rings, sculptural earrings, layered necklaces, fluid bracelets, anklets, and bespoke pendants.",
  },
  '/shop': {
    title: 'Fine 925 Sterling Silver Collections & Adornments | Shveraa Jewels',
    desc: 'Browse our signature 925 solid sterling silver rings, necklaces, earrings, and bracelets handcrafted in our Surat atelier.',
  },
  '/cart': {
    title: 'Your Shopping Bag | Shveraa Jewels',
    desc: 'Review your selected solid 925 sterling silver pieces and proceed with complimentary insured air express shipping across India.',
  },
  '/checkout': {
    title: 'Secure Checkout & Encrypted Payment | Shveraa Jewels',
    desc: 'Safe 256-bit encrypted checkout with UPI, NetBanking, Credit/Debit cards, and COD for certified 925 silver.',
  },
  '/about': {
    title: 'The Shveraa Atelier Story — Handcrafted Purity | Shveraa Jewels',
    desc: 'Learn about Shveraa Jewels, our certified 925 hallmarked silver standards, ethical artisan crafting, and bespoke design ethos.',
  },
  '/contact': {
    title: 'Contact Atelier & Concierge Assistance | Shveraa Jewels',
    desc: 'Connect with Shveraa atelier concierge via WhatsApp (+91 99980 46559) or email for bespoke sizing, bridal curations, and support.',
  },
  '/size-guide': {
    title: 'Ring Size & Silver Care Guide | Shveraa Jewels',
    desc: 'Official Indian & US ring size guide, wrist sizing tips, and silver upkeep protocols to keep your solid 925 jewellery radiant forever.',
  },
  '/silver-care': {
    title: 'Solid 925 Silver Care Guide | Shveraa Jewels',
    desc: 'Preserve the mirror rhodium brilliance of your sterling silver jewellery with our official cleaning and storage guide.',
  },
  '/return-policy': {
    title: '2-3 Days Returns & Exchange Policy | Shveraa Jewels',
    desc: 'Enjoy effortless 2-3 days doorstep returns, size swaps, and full refunds on all unworn Shveraa creations.',
  },
  '/returns': {
    title: '2-3 Days Returns & Exchange Policy | Shveraa Jewels',
    desc: 'Doorstep pickup returns and size exchanges on authentic solid 925 silver pieces.',
  },
  '/shipping': {
    title: 'Pan-India Insured Shipping & Cancellation Policy | Shveraa Jewels',
    desc: '100% insured air express shipping via BlueDart & Delhivery. Free delivery on orders over ₹999 with 12-hour penalty-free cancellation.',
  },
  '/shipping-cancellation': {
    title: 'Shipping & Order Cancellation Policy | Shveraa Jewels',
    desc: 'Insured express logistics and transparent order cancellation terms at Shveraa Jewels.',
  },
  '/privacy-policy': {
    title: 'Privacy Policy & Data Security | Shveraa Jewels',
    desc: 'How Shveraa Jewels safeguards your personal details, order telemetry, and payment security.',
  },
  '/privacy': {
    title: 'Privacy Policy | Shveraa Jewels',
    desc: 'Our commitment to privacy, data transparency, and customer rights.',
  },
  '/terms-and-conditions': {
    title: 'Terms & Conditions of Service | Shveraa Jewels',
    desc: 'Read the official terms governing transactions, guarantees, hallmark certifications, and website use at Shveraa Jewels.',
  },
  '/terms': {
    title: 'Terms of Service | Shveraa Jewels',
    desc: 'Terms and conditions for Shveraa 925 sterling silver purchases.',
  },
  '/track-order': {
    title: 'Track Your Air Express Parcel | Shveraa Jewels',
    desc: 'Enter your order ID or tracking AWB to follow your BlueDart or Delhivery parcel in real time.',
  },
  '/wishlist': {
    title: 'Curated Wishlist & Saved Silhouettes | Shveraa Jewels',
    desc: 'View your saved favorite solid 925 sterling silver creations.',
  },
  '/account': {
    title: 'My Atelier Account & Dispatches | Shveraa Jewels',
    desc: 'Manage your profile, saved delivery addresses, order history, and tracking.',
  },
  '/login': {
    title: 'Sign In to Atelier | Shveraa Jewels',
    desc: 'Sign in to access your saved wishlist, addresses, and order history.',
  },
  '/register': {
    title: 'Create an Atelier Account | Shveraa Jewels',
    desc: 'Register for exclusive privileges, early vault access, and order tracking.',
  },
  '/search': {
    title: 'Search Silhouettes | Shveraa Jewels',
    desc: 'Search our handcrafted 925 sterling silver catalogue for rings, necklaces, earrings, and bracelets.',
  },
};

// Scroll to top and Meta Pixel route tracker on navigation
const ScrollToTop = () => {
  const { pathname, search } = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Force HTTPS upgrade ONLY on actual production domain
    const isProductionDomain =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'shveraa.com' ||
        window.location.hostname.endsWith('.shveraa.com'));

    if (
      typeof window !== 'undefined' &&
      window.location.protocol === 'http:' &&
      isProductionDomain
    ) {
      window.location.href = window.location.href.replace('http:', 'https:');
      return;
    }

    // Dynamic Title & Meta Description Updater for SEO
    if (!pathname.startsWith('/product/')) {
      const match = ROUTE_SEO[pathname];
      if (match) {
        document.title = match.title;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', match.desc);
      }
    }

    // Track SPA route navigation with Meta Pixel (skip initial render handled by index.html)
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }
  }, [pathname, search]);

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

const AppContent = () => {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');
  const { showToast } = useCart();

  // Foreground notification listener
  useEffect(() => {
    const unsubscribe = onForegroundMessage((payload) => {
      const title = payload.notification?.title || 'Notification';
      const body = payload.notification?.body || '';
      showToast(`${title}: ${body}`);
    });
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [showToast]);

  // Silky Smooth Scrolling for Storefront (bypassed on Admin and touch/mobile devices for native 120Hz physics)
  useEffect(() => {
    if (isAdmin) return;

    // On mobile and touch devices, native kinetic compositor scrolling is far smoother than JS interpolation
    const isTouchDevice =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.matchMedia('(pointer: coarse)').matches);

    if (isTouchDevice) {
      return;
    }

    const lenis = new Lenis({
      duration: 0.75,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      syncTouch: false,
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
      <CookieConsent />
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <Router>
            <ScrollToTop />
            <AppContent />
          </Router>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
