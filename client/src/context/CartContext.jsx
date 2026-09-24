import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  apiGetCart,
  apiAddToCart,
  apiUpdateCartItem,
  apiRemoveCartItem,
  apiClearCart,
  apiVerifyCoupon,
  apiGetWishlist,
  apiToggleWishlist,
  fetchProducts,
} from '../services/api';

const CartContext = createContext();

export const FREE_SHIPPING_THRESHOLD = 999;

// Cart data is always read from the authenticated user's database cart.
const getToken = () => {
  try {
    const token = localStorage.getItem('shveraa_user_token');
    return token || null;
  } catch {
    return null;
  }
};

const isLoggedIn = () => !!getToken() || !!localStorage.getItem('shveraa_user');

export const CartProvider = ({ children }) => {
  const [, setStoreVersion] = useState(0);
  useEffect(() => {
    const handleUpdate = () => setStoreVersion((v) => v + 1);
    window.addEventListener('shveraa_store_updated', handleUpdate);
    return () => window.removeEventListener('shveraa_store_updated', handleUpdate);
  }, []);

  // ─── Cart State ──────────────────────────────────────────────────────────
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // Remove the legacy browser cart once. It is no longer read or written.
    localStorage.removeItem('shveraa_cart');
  }, []);

  // ─── Wishlist State (always stores full product objects) ──────────────────
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('shveraa_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Track if we've already loaded from DB for this session
  const dbLoadedRef = useRef(false);

  // ─── Persist to localStorage as backup ───────────────────────────────────
  useEffect(() => {
    try { localStorage.setItem('shveraa_wishlist', JSON.stringify(wishlist)); } catch {}
  }, [wishlist]);

  // ─── On mount / login: load cart & wishlist from DB ──────────────────────
  useEffect(() => {
    const loadFromDB = async () => {
      if (!isLoggedIn() || dbLoadedRef.current) return;
      dbLoadedRef.current = true;
      try {
        // Fetch DB cart
        const cartRes = await apiGetCart();
        const dbCart = cartRes?.cart || [];

        // Fetch DB wishlist (array of productIds)
        const wlRes = await apiGetWishlist();
        const dbWishlist = wlRes?.wishlist || [];

        // Merge: local items not yet in DB → push to DB
        setCart(Array.isArray(dbCart) ? dbCart : []);

        // Map DB wishlist IDs to full product objects
        if (Array.isArray(dbWishlist) && dbWishlist.length > 0) {
          const allProducts = await fetchProducts();
          const fullWishlist = dbWishlist.map(item => {
            if (typeof item === 'object' && item !== null) return item;
            const found = allProducts.find(p => String(p._id) === String(item) || String(p.slug) === String(item));
            return found || { _id: item, name: '925 Silver Piece', price: 0, image: '' };
          });
          setWishlist(fullWishlist);
        }
      } catch {
        setCart([]);
      }
    };

    loadFromDB();

    // Re-run on login event
    const handleLogin = () => { dbLoadedRef.current = false; loadFromDB(); };
    const handleLogout = () => {
      dbLoadedRef.current = false;
      setCart([]);
    };
    window.addEventListener('shveraa_user_logged_in', handleLogin);
    window.addEventListener('shveraa_user_logged_out', handleLogout);
    window.addEventListener('shveraa_user_unauthorized', handleLogout);
    return () => {
      window.removeEventListener('shveraa_user_logged_in', handleLogin);
      window.removeEventListener('shveraa_user_logged_out', handleLogout);
      window.removeEventListener('shveraa_user_unauthorized', handleLogout);
    };
  }, []);

  // ─── Cart Drawer ──────────────────────────────────────────────────────────
  const [isCartOpen, setIsCartOpen] = useState(false);
  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen(prev => !prev);

  // ─── Coupon State ─────────────────────────────────────────────────────────
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // ─── Toast ────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3200);
  };

  // ─── ADD TO CART ──────────────────────────────────────────────────────────
  const addToCart = async (product, selectedSize = null, quantity = 1, options = {}) => {
    if (!isLoggedIn()) {
      showToast('Please sign in to add items to your bag');
      return false;
    }

    let color = options.color || product.selectedColor || product.color || '';
    let variantId = options.variantId || product.selectedVariantId || '';
    const selectedVariant =
      (variantId && product.variants?.find((variant) => String(variant._id || variant.id || variant.sku) === String(variantId))) ||
      (color && product.variants?.find((variant) => variant.color?.toLowerCase() === color.toLowerCase())) ||
      product.variants?.[0];

    color = color || selectedVariant?.color || 'Pure 925 Silver';
    variantId = variantId || selectedVariant?._id || selectedVariant?.id || selectedVariant?.sku || '';
    const firstVariantSize = selectedVariant?.sizes?.[0];
    const size = selectedSize || (typeof firstVariantSize === 'object' ? firstVariantSize?.size : firstVariantSize) || 'Standard';
    // Always prefer the first image of the selected colour variant.
    const itemImage = selectedVariant?.images?.[0] ||
      selectedVariant?.image ||
      options.image ||
      (product.images && product.images[0]) ||
      product.image ||
      '';

    const cartItem = {
      productId: product._id || product.slug,
      variantId,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      image: itemImage,
      category: product.category || '',
      material: product.material || '925 Sterling Silver',
      size,
      selectedSize: size,
      color,
      selectedColor: color,
      quantity,
    };

    try {
      const response = await apiAddToCart(cartItem);
      setCart(Array.isArray(response?.cart) ? response.cart : []);
      setAppliedCoupon(null);
      showToast(response?.added === false ? 'This colour and size is already in your bag' : `Added "${product.name}" to your bag`);
      if (!options.silent) setIsCartOpen(true);
      return true;
    } catch (error) {
      showToast(error.message || 'Unable to update your bag');
      return false;
    }
  };

  // ─── UPDATE QUANTITY ──────────────────────────────────────────────────────
  const updateQuantity = async (cartId, quantity) => {
    if (quantity <= 0) { removeFromCart(cartId); return; }
    if (!isLoggedIn()) return;
    try {
      const response = await apiUpdateCartItem(cartId, quantity);
      setCart(Array.isArray(response?.cart) ? response.cart : []);
      setAppliedCoupon(null);
    } catch (error) {
      showToast(error.message || 'Unable to update your bag');
    }
  };

  // ─── REMOVE FROM CART ─────────────────────────────────────────────────────
  const removeFromCart = async (cartId) => {
    if (!isLoggedIn()) return;
    try {
      const response = await apiRemoveCartItem(cartId);
      setCart(Array.isArray(response?.cart) ? response.cart : []);
      setAppliedCoupon(null);
      showToast('Item removed from your bag');
    } catch (error) {
      showToast(error.message || 'Unable to update your bag');
    }
  };

  // ─── CLEAR CART ───────────────────────────────────────────────────────────
  const clearCart = async () => {
    setCart([]);
    setAppliedCoupon(null);
    if (!isLoggedIn()) return;
    try {
      const response = await apiClearCart();
      setCart(Array.isArray(response?.cart) ? response.cart : []);
    } catch (error) {
      showToast(error.message || 'Unable to clear your bag');
    }
  };

  // ─── WISHLIST TOGGLE ──────────────────────────────────────────────────────
  const toggleWishlist = (product) => {
    if (!product) return;
    const productId = String(product._id || product.slug);

    setWishlist(prev => {
      const exists = prev.some(i => String(typeof i === 'object' ? (i._id || i.slug) : i) === productId);
      showToast(exists ? `Removed "${product.name || 'Item'}" from your wishlist` : `Saved "${product.name || 'Item'}" to your wishlist`);
      return exists
        ? prev.filter(i => String(typeof i === 'object' ? (i._id || i.slug) : i) !== productId)
        : [...prev, product];
    });

    if (isLoggedIn()) {
      apiToggleWishlist(productId).catch(() => {});
    }
  };

  const isInWishlist = (productId) => {
    if (!productId) return false;
    const id = String(productId);
    return wishlist.some(i => String(typeof i === 'object' ? (i._id || i.slug) : i) === id);
  };

  // ─── COUPON ───────────────────────────────────────────────────────────────
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const applyCoupon = async (code) => {
    const trimmed = (code || '').trim().toUpperCase();
    if (!trimmed) { setCouponError('Please enter a coupon code'); return false; }
    try {
      const response = await apiVerifyCoupon({ code: trimmed });
      const coupon = response?.coupon;
      if (!coupon) throw new Error('Invalid coupon');
      setAppliedCoupon({
        ...coupon,
      });
      setCouponError('');
      showToast(response.message || 'Coupon applied');
      return true;
    } catch (error) {
      setCouponError(error.message || 'Unable to apply coupon');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
    showToast('Coupon removed');
  };

  // ─── Calculations ─────────────────────────────────────────────────────────
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartItemCount = cart.length;

  const discountAmount = appliedCoupon?.discountAmount || 0;

  const freeShippingReached = cartSubtotal >= FREE_SHIPPING_THRESHOLD;
  const freeShippingProgress = Math.min(100, Math.round((cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal);
  const shippingCost = cartCount === 0 || freeShippingReached ? 0 : 99;
  const cartTotal = Math.max(0, cartSubtotal - discountAmount + shippingCost);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartItemCount,
        cartSubtotal,
        cartTotal,
        discountAmount,
        shippingCost,
        appliedCoupon,
        couponError,
        applyCoupon,
        removeCoupon,
        FREE_SHIPPING_THRESHOLD,
        freeShippingReached,
        freeShippingProgress,
        amountNeededForFreeShipping,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        wishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount: wishlist.length,
        toast,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
