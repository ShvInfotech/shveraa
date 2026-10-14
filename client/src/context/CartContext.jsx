import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
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
  apiCheckShippingDetails,
  apiGetUserAddresses,
} from '../services/api';
import { trackPixelEvent } from '../utils/metaPixel';

const CartContext = createContext();

export const FREE_SHIPPING_THRESHOLD = 4999;

// Cart data is always read from the authenticated user's database cart.
const getToken = () => {
  try {
    const token = localStorage.getItem('shveraa_user_token');
    return token || null;
  } catch {
    return null;
  }
};

const isLoggedIn = () => !!getToken();

export const CartProvider = ({ children }) => {
  const [, setStoreVersion] = useState(0);
  useEffect(() => {
    const handleUpdate = () => setStoreVersion((v) => v + 1);
    window.addEventListener('shveraa_store_updated', handleUpdate);
    return () => window.removeEventListener('shveraa_store_updated', handleUpdate);
  }, []);

  // ─── Cart State ──────────────────────────────────────────────────────────
  const [cart, setCart] = useState(() => {
    try {
      const token = localStorage.getItem('shveraa_user_token');
      if (!token) {
        const saved = localStorage.getItem('shveraa_cart');
        return saved ? JSON.parse(saved) : [];
      }
    } catch {
      return [];
    }
    return [];
  });

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
 
    const addGuestItem = () => {
      setCart((prevCart) => {
        const existingIndex = prevCart.findIndex(
          (item) =>
            String(item.productId?._id || item.productId) === String(cartItem.productId) &&
            String(item.variantId || '') === String(cartItem.variantId || '') &&
            String(item.size || item.selectedSize || '') === String(cartItem.size)
        );

        let updatedCart;
        if (existingIndex > -1) {
          updatedCart = prevCart.map((item, idx) =>
            idx === existingIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          const guestItem = {
            ...cartItem,
            _id: `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          };
          updatedCart = [...prevCart, guestItem];
        }

        try {
          localStorage.setItem('shveraa_cart', JSON.stringify(updatedCart));
        } catch (err) {
          console.warn('Could not store guest cart:', err);
        }
        return updatedCart;
      });

      trackPixelEvent('AddToCart', {
        content_name: product.name,
        content_ids: [product._id || product.slug],
        content_type: 'product',
        value: Number(cartItem.price || product.price || 0),
        currency: 'INR',
      });

      showToast(`Added "${product.name}" to your bag`);
      if (!options.silent) setIsCartOpen(true);
      return true;
    };

    // If user is NOT logged in: add directly to guest cart state & localStorage
    if (!isLoggedIn()) {
      return addGuestItem();
    }

    try {
      const response = await apiAddToCart(cartItem);
      setCart(Array.isArray(response?.cart) ? response.cart : []);
      setAppliedCoupon(null);
      if (response?.added !== false) {
        trackPixelEvent('AddToCart', {
          content_name: product.name,
          content_ids: [product._id || product.slug],
          content_type: 'product',
          value: Number(cartItem.price || product.price || 0),
          currency: 'INR',
        });
      }
      showToast(response?.added === false ? 'This colour and size is already in your bag' : `Added "${product.name}" to your bag`);
      if (!options.silent) setIsCartOpen(true);
      return true;
    } catch (error) {
      console.warn('apiAddToCart failed, falling back to guest cart:', error);
      return addGuestItem();
    }
  };

  // Helper to process queued pending cart item after authentication
  const processPendingCartItem = async () => {
    if (!isLoggedIn()) return;
    const pendingRaw = localStorage.getItem('shveraa_pending_cart_item');
    if (!pendingRaw) return;

    try {
      localStorage.removeItem('shveraa_pending_cart_item');
      const pending = JSON.parse(pendingRaw);
      if (pending && pending.product) {
        await addToCart(
          pending.product,
          pending.selectedSize,
          pending.quantity || 1,
          pending.options || {}
        );
        setIsCartOpen(true);
      }
    } catch (err) {
      console.warn('Failed to process pending cart item:', err);
    }
  };

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

        // Process any queued pending cart item
        await processPendingCartItem();
      } catch {
        setCart([]);
      }
    };

    loadFromDB();

    // Re-run on login event
    const handleLogin = async () => {
      dbLoadedRef.current = false;
      // Sync guest cart to DB if any exists
      try {
        const guestCartRaw = localStorage.getItem('shveraa_cart');
        if (guestCartRaw) {
          const guestItems = JSON.parse(guestCartRaw);
          if (Array.isArray(guestItems) && guestItems.length > 0) {
            for (const item of guestItems) {
              await apiAddToCart({
                productId: item.productId?._id || item.productId,
                variantId: item.variantId || '',
                size: item.size || item.selectedSize || 'Standard',
                quantity: item.quantity || 1,
                name: item.name,
                price: item.price,
                image: item.image,
                color: item.color || item.selectedColor,
              }).catch(() => {});
            }
          }
          localStorage.removeItem('shveraa_cart');
        }
      } catch (syncErr) {
        console.warn('Could not sync guest cart to DB on login:', syncErr);
      }
      await loadFromDB();
      await processPendingCartItem();
    };
    const handleLogout = () => {
      dbLoadedRef.current = false;
      setCart([]);
      try { localStorage.removeItem('shveraa_cart'); } catch (_) {}
    };

    const handleUnauthorized = () => {
      dbLoadedRef.current = false;
      try {
        const saved = localStorage.getItem('shveraa_cart');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCart(parsed);
          }
        }
      } catch (_) {}
    };

    window.addEventListener('shveraa_user_logged_in', handleLogin);
    window.addEventListener('shveraa_user_logged_out', handleLogout);
    window.addEventListener('shveraa_user_unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('shveraa_user_logged_in', handleLogin);
      window.removeEventListener('shveraa_user_logged_out', handleLogout);
      window.removeEventListener('shveraa_user_unauthorized', handleUnauthorized);
    };
  }, []);

  // ─── UPDATE QUANTITY ──────────────────────────────────────────────────────
  const updateQuantity = async (cartId, quantity) => {
    if (quantity <= 0) { removeFromCart(cartId); return; }
    if (!isLoggedIn()) {
      setCart((prev) => {
        const next = prev.map((item) =>
          (String(item._id) === String(cartId) || String(item.id) === String(cartId))
            ? { ...item, quantity }
            : item
        );
        try { localStorage.setItem('shveraa_cart', JSON.stringify(next)); } catch (_) {}
        return next;
      });
      setAppliedCoupon(null);
      return;
    }
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
    if (!isLoggedIn()) {
      setCart((prev) => {
        const next = prev.filter(
          (item) => String(item._id) !== String(cartId) && String(item.id) !== String(cartId)
        );
        try { localStorage.setItem('shveraa_cart', JSON.stringify(next)); } catch (_) {}
        return next;
      });
      setAppliedCoupon(null);
      showToast('Item removed from your bag');
      return;
    }
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
    try { localStorage.removeItem('shveraa_cart'); } catch (_) {}
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
      if (!exists) {
        trackPixelEvent('AddToWishlist', {
          content_name: product.name,
          content_ids: [productId],
          content_type: 'product',
          value: Number(product.price || 0),
          currency: 'INR',
        });
      }
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
      const response = await apiVerifyCoupon({
        code: trimmed,
        cartTotal: cartSubtotal,
        items: cart,
      });
      const coupon = response?.coupon;
      if (!coupon) throw new Error('Invalid coupon');
      setAppliedCoupon({
        ...coupon,
        coupenId: coupon.coupenId || coupon._id || coupon.id,
        couponId: coupon.coupenId || coupon._id || coupon.id,
        _id: coupon.coupenId || coupon._id || coupon.id,
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

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === 'percentage') {
      let disc = Math.round((cartSubtotal * Number(appliedCoupon.discountValue)) / 100);
      if (appliedCoupon.maxDiscount > 0 && disc > appliedCoupon.maxDiscount) {
        disc = appliedCoupon.maxDiscount;
      }
      return Math.min(disc, cartSubtotal);
    }
    return Math.min(Number(appliedCoupon.discountAmount || appliedCoupon.discountValue || 0), cartSubtotal);
  }, [appliedCoupon, cartSubtotal]);

  const freeShippingReached = cartSubtotal >= FREE_SHIPPING_THRESHOLD;
  const freeShippingProgress = Math.min(100, Math.round((cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal);

  const [shippingCost, setShippingCost] = useState(0);
  const [isShippingLoading, setIsShippingLoading] = useState(false);

  // Auto-fetch live shipping cost from Delhivery API whenever cart items change
  useEffect(() => {
    if (freeShippingReached || cart.length === 0) {
      setShippingCost(0);
      return;
    }

    let isMounted = true;
    setIsShippingLoading(true);

    const validCartIds = cart
      .map((item) => item._id || item.id)
      .filter((id) => id && /^[0-9a-fA-F]{24}$/.test(String(id)));

    const fetchLiveShipping = async () => {
      let pin = '395010';
      try {
        const token = localStorage.getItem('shveraa_user_token');
        if (token) {
          const addrRes = await apiGetUserAddresses().catch(() => null);
          const def = addrRes?.addresses?.find((a) => a.isDefault) || addrRes?.addresses?.[0];
          if (def?.pincode && /^\d{6}$/.test(def.pincode)) {
            pin = def.pincode;
          }
        }
      } catch (_) {}

      try {
        const data = await apiCheckShippingDetails(validCartIds, pin, 'Pre-paid', 0, cart);
        if (isMounted && data?.shippingCharges !== undefined) {
          setShippingCost(Math.round(Number(data.shippingCharges) || 0));
        }
      } catch (err) {
        console.warn('[CartContext] Could not fetch live shipping charge from API:', err?.message);
      } finally {
        if (isMounted) setIsShippingLoading(false);
      }
    };

    fetchLiveShipping();

    return () => {
      isMounted = false;
    };
  }, [cart, freeShippingReached]);

  const effectiveShippingCost = freeShippingReached || cartCount === 0 ? 0 : Math.round(Number(shippingCost) || 0);
  const cartTotal = Math.max(0, Math.round(cartSubtotal - discountAmount + effectiveShippingCost));

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
        shippingCost: effectiveShippingCost,
        setShippingCost,
        isShippingLoading,
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
