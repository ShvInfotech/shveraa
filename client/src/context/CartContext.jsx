import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const FREE_SHIPPING_THRESHOLD = 999;

export const CartProvider = ({ children }) => {
  // Cart state with localStorage persistence
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('shveraa_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Wishlist state with localStorage persistence
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('shveraa_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Slide-in Cart Drawer state (Emily's Jewellery UX)
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Discount / Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // Toast feedback state
  const [toast, setToast] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('shveraa_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Failed to persist cart to localStorage', e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('shveraa_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.warn('Failed to persist wishlist to localStorage', e);
    }
  }, [wishlist]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast(null);
    }, 3200);
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  // Add to Bag with optional auto-opening of the slide-in drawer
  const addToCart = (product, selectedSize = null, quantity = 1, options = {}) => {
    const size = selectedSize || (product.sizes && product.sizes[0]) || 'Standard';
    const customText = options.customText || null;
    const cartItemId = `${product._id || product.slug}-${size}${customText ? `-${customText}` : ''}`;

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [
          ...prev,
          {
            cartItemId,
            productId: product._id || product.slug,
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice || product.price,
            image: (product.images && product.images[0]) || '',
            category: product.category,
            material: product.material || '925 Sterling Silver',
            size,
            customText,
            quantity,
          },
        ];
      }
    });

    showToast(`Added "${product.name}" to your bag`);

    // Smoothly slide open cart drawer unless explicitly suppressed
    if (!options.silent) {
      setIsCartOpen(true);
    }
  };

  const updateQuantity = (cartItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.cartItemId === cartItemId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (cartItemId) => {
    setCart((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
    showToast('Item removed from your bag');
  };

  const clearCart = () => {
    setCart([]);
  };

  // Wishlist toggle
  const toggleWishlist = (product) => {
    const id = product._id || product.slug;
    setWishlist((prev) => {
      const exists = prev.some((item) => (item._id || item.slug) === id);
      if (exists) {
        showToast(`Removed "${product.name}" from your wishlist`);
        return prev.filter((item) => (item._id || item.slug) !== id);
      } else {
        showToast(`Saved "${product.name}" to your wishlist`);
        return [...prev, product];
      }
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => (item._id || item.slug) === productId);
  };

  // Promo coupon application
  const applyCoupon = (code) => {
    const trimmed = (code || '').trim().toUpperCase();
    if (!trimmed) {
      setCouponError('Please enter a coupon code');
      return false;
    }
    if (trimmed === 'SHVERAA20') {
      setAppliedCoupon({
        code: 'SHVERAA20',
        discountPercent: 20,
        description: '20% Off Launch Offer',
      });
      setCouponError('');
      showToast('Coupon SHVERAA20 applied! 20% discount added.');
      return true;
    } else if (trimmed === 'SILVER10') {
      setAppliedCoupon({
        code: 'SILVER10',
        discountPercent: 10,
        description: '10% Off Welcome Offer',
      });
      setCouponError('');
      showToast('Coupon SILVER10 applied! 10% discount added.');
      return true;
    } else {
      setCouponError('Invalid coupon code. Try SHVERAA20');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
    showToast('Coupon removed');
  };

  // Cart financial calculations
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const discountAmount = appliedCoupon
    ? Math.round((cartSubtotal * appliedCoupon.discountPercent) / 100)
    : 0;

  const freeShippingReached = cartSubtotal >= FREE_SHIPPING_THRESHOLD;
  const freeShippingProgress = Math.min(
    100,
    Math.round((cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100)
  );
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
        cartSubtotal,
        cartTotal,
        discountAmount,
        shippingCost,
        appliedCoupon,
        couponError,
        applyCoupon,
        removeCoupon,
        // Free shipping progress bar
        FREE_SHIPPING_THRESHOLD,
        freeShippingReached,
        freeShippingProgress,
        amountNeededForFreeShipping,
        // Cart drawer
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
        // Wishlist
        wishlist,
        toggleWishlist,
        isInWishlist,
        wishlistCount: wishlist.length,
        // Toast
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
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
