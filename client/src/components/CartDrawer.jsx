import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  Sparkles,
  Truck,
  ShieldCheck,
  ArrowRight,
  Tag,
  Check,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { apiCheckShippingDetails, apiGetUserAddresses, getImageUrl } from '../services/api';
import { triggerMagicCheckout } from '../utils/magicCheckout';

const CartDrawer = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [pincode, setPincode] = useState('');

  const {
    cart,
    isCartOpen,
    closeCart,
    clearCart,
    showToast,
    updateQuantity,
    removeFromCart,
    cartCount,
    cartSubtotal,
    cartTotal,
    discountAmount,
    shippingCost,
    setShippingCost,
    appliedCoupon,
    couponError,
    applyCoupon,
    removeCoupon,
    freeShippingReached,
    freeShippingProgress,
    amountNeededForFreeShipping,
    addToCart,
  } = useCart();

  useEffect(() => {
    const token = localStorage.getItem('shveraa_user_token');
    if (isCartOpen && token) {
      const fetchAddresses = async () => {
        try {
          const data = await apiGetUserAddresses();
          if (data?.addresses?.length) {
            const def = data.addresses.find((a) => a.isDefault) || data.addresses[0];
            if (def) {
              setPincode(def.pincode);
            }
          }
        } catch (_) {
        }
      };
      fetchAddresses();
    }
  }, [isCartOpen]);

  useEffect(() => {
    if (freeShippingReached) {
      setShippingCost(0);
      return;
    }
    if (!cart.length || !/^\d{6}$/.test(pincode)) return;

    const validCartIds = cart
      .map((item) => item._id || item.id)
      .filter((id) => id && /^[0-9a-fA-F]{24}$/.test(String(id)));
    if (!validCartIds.length) return;

    apiCheckShippingDetails(validCartIds, pincode)
      .then((data) => {
        if (data?.shippingCharges !== undefined) {
          setShippingCost(Number(data.shippingCharges) || 0);
        }
      })
      .catch((error) => {
        console.warn('Error checking checkout shipping charges:', error);
      });
  }, [cart, pincode, freeShippingReached]);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyCoupon(couponInput.trim());
      setCouponInput('');
    }
  };

  const handleCheckoutClick = async () => {
    await triggerMagicCheckout({
      cartItems: cart,
      couponId: appliedCoupon?.coupenId || appliedCoupon?._id || '',
      shippingCost,
      user,
      navigate,
      clearCart,
      closeCart,
      showToast,
      setLoading: setIsCheckingOut,
    });
  };

  if (!isCartOpen) return null;

  return (
    <div className="cart-drawer-wrapper">
      {/* Dimmed backdrop */}
      <div
        className="cart-drawer-backdrop"
        onClick={closeCart}
        aria-label="Close cart drawer"
      />

      {/* Slide-in Drawer Container */}
      <aside className="cart-drawer" role="dialog" aria-label="Shopping Bag">
        {/* Drawer Header */}
        <div className="cart-drawer-header">
          <div className="cart-drawer-title-row">
            <div className="cart-drawer-title">
              <ShoppingBag size={20} />
              <span>Your Silver Bag</span>
              <span className="cart-drawer-count-badge">({cartCount})</span>
            </div>
            <button
              onClick={closeCart}
              className="cart-drawer-close-btn"
              aria-label="Close cart"
            >
              <X size={20} />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="cart-shipping-bar-container">
            <div className="cart-shipping-bar-msg">
              <Truck size={15} />
              {freeShippingReached ? (
                <span className="cart-shipping-unlocked">
                  <strong>Congratulations!</strong> You’ve unlocked <strong>FREE Insured Shipping</strong>
                </span>
              ) : (
                <span>
                  Add <strong>₹{amountNeededForFreeShipping}</strong> more to unlock <strong>FREE Shipping</strong>
                </span>
              )}
            </div>
            <div className="cart-shipping-progress-track">
              <div
                className="cart-shipping-progress-fill"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Drawer Body: Items or Empty State */}
        <div className="cart-drawer-body">
          {cart.length === 0 ? (
            <div className="cart-drawer-empty">
              <div className="cart-empty-icon-wrap">
                <Sparkles size={32} />
              </div>
              <h3>Your bag is empty</h3>
              <p>Discover everyday brilliance crafted in certified 925 sterling silver.</p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  closeCart();
                  navigate('/shop');
                }}
              >
                Explore 925 Silver <ArrowRight size={15} />
              </button>
            </div>
          ) : (
            <div className="cart-drawer-items">
              {cart.map((item, idx) => {
                const prodId = typeof item.productId === 'object' ? item.productId?._id || item.productId?.slug : item.productId;
                const itemId = item._id || item.id || `cart_item_${idx}`;
                const itemName = item.name || item.productId?.name || '925 Sterling Silver';
                const itemImg = item.image || item.productId?.images?.[0] || item.productId?.image || '';
                const itemPrice = Number(item.price || item.productId?.salePrice || item.productId?.originalPrice || item.productId?.price || 0);
                const itemOrigPrice = Number(item.originalPrice || item.productId?.originalPrice || 0);
                const itemQty = Number(item.quantity) || 1;

                return (
                  <div key={itemId} className="cart-drawer-item">
                    <Link
                      to={`/product/${prodId || ''}`}
                      onClick={closeCart}
                      className="cart-drawer-item-img-link"
                    >
                      <img
                        src={getImageUrl(itemImg)}
                        alt={itemName}
                        onError={(e) => {
                          e.currentTarget.src = '/hero-ring-banner.jpg';
                        }}
                      />
                    </Link>

                    <div className="cart-drawer-item-details">
                      <div className="cart-drawer-item-header">
                        <Link
                          to={`/product/${prodId || ''}`}
                          onClick={closeCart}
                          className="cart-drawer-item-name"
                        >
                          {itemName}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeFromCart(itemId)}
                          className="cart-drawer-item-remove"
                          aria-label="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div className="cart-drawer-item-meta">
                        <span className="cart-drawer-color-badge">{item.color || item.selectedColor || 'Pure 925 Silver'}</span>
                        <span className="cart-drawer-meta-divider">•</span>
                        <span>Size: {item.size || item.selectedSize || 'Standard'}</span>
                        {item.customText && (
                          <span className="cart-drawer-engraving-tag">
                            Engraved: "{item.customText}"
                          </span>
                        )}
                      </div>

                      <div className="cart-drawer-item-footer">
                        {/* Quantity Controller */}
                        <div className="cart-qty-controller">
                          <button
                            type="button"
                            onClick={() => updateQuantity(itemId, itemQty - 1)}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>
                          <span>{itemQty}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(itemId, itemQty + 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="cart-drawer-item-price">
                          <span>₹{(itemPrice * itemQty).toLocaleString('en-IN')}</span>
                          {itemOrigPrice > itemPrice && (
                            <span className="cart-drawer-item-orig-price">
                              ₹{(itemOrigPrice * itemQty).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

            </div>
          )}
        </div>

        {/* Drawer Footer (Only when cart has items) */}
        {cart.length > 0 && (
          <div className="cart-drawer-footer">
            {/* Promo code accordion / input */}
            <div className="cart-coupon-section">
              {appliedCoupon ? (
                <div className="cart-coupon-applied">
                  <div className="cart-coupon-info">
                    <Check size={15} color="#10B981" />
                    <span>
                      Code <strong>{appliedCoupon.code}</strong> applied ({appliedCoupon.discountType === 'percentage' ? `-${appliedCoupon.discountValue}%` : `-₹${appliedCoupon.discountValue}`})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="cart-coupon-remove-btn"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="cart-coupon-form">
                  <div className="cart-coupon-input-wrap">
                    <Tag size={15} className="cart-coupon-icon" />
                    <input
                      type="text"
                      placeholder="Enter promo code (e.g. SHVERAA20)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="cart-coupon-btn">
                    Apply
                  </button>
                </form>
              )}
              {couponError && <p className="cart-coupon-error">{couponError}</p>}
            </div>

            {/* Price Calculations */}
            <div className="cart-drawer-summary">
              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span>₹{cartSubtotal}</span>
              </div>
              {appliedCoupon && (
                <div className="cart-summary-row cart-discount-row">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-₹{Math.round(discountAmount).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="cart-summary-row">
                <span>Insured Shipping</span>
                <span>{shippingCost === 0 ? 'FREE' : `₹${Math.round(shippingCost).toLocaleString('en-IN')}`}</span>
              </div>
              <div className="cart-summary-row cart-total-row">
                <span>Total</span>
                <span>₹{Math.round(cartTotal).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="cart-drawer-actions">
              <button
                type="button"
                onClick={handleCheckoutClick}
                className="btn btn-primary cart-checkout-btn"
                disabled={isCheckingOut}
              >
                <span>{isCheckingOut ? 'Opening Secure Checkout...' : 'Checkout Now'}</span>
                <span>₹{Math.round(cartTotal).toLocaleString('en-IN')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  closeCart();
                  navigate('/cart');
                }}
                className="cart-view-bag-link"
              >
                View Full Bag &amp; Order Notes
              </button>
            </div>

            {/* Trust Footer Badges */}
            <div className="cart-drawer-trust-row">
              <div className="cart-drawer-trust-item">
                <ShieldCheck size={14} /> 925 Hallmarked
              </div>
              <div className="cart-drawer-trust-item">
                <Truck size={14} /> Free Returns
              </div>
              <div className="cart-drawer-trust-item">
                <Sparkles size={14} /> Eco Packaging
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default CartDrawer;
