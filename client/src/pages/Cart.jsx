import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Lock,
  Truck,
  Tag,
  Check,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import CartItem from '../components/CartItem';

const Cart = () => {
  const {
    cart,
    cartCount,
    cartSubtotal,
    cartTotal,
    discountAmount,
    shippingCost,
    appliedCoupon,
    couponError,
    applyCoupon,
    removeCoupon,
    freeShippingReached,
    freeShippingProgress,
    amountNeededForFreeShipping,
    clearCart,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponInput.trim()) {
      applyCoupon(couponInput.trim());
      setCouponInput('');
    }
  };

  return (
    <div className="section" style={{ minHeight: '75vh', paddingTop: '2rem' }}>
      <div className="container">
        <h1 style={{ marginBottom: '0.5rem', fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)' }}>
          Your Silver Bag
        </h1>
        <p style={{ marginBottom: '2rem', color: '#64748B' }}>
          {cartCount === 0
            ? 'Your shopping bag is currently empty.'
            : `You have ${cartCount} certified 925 silver piece${cartCount > 1 ? 's' : ''} in your curation.`}
        </p>

        {cartCount === 0 ? (
          <div className="cart-page-empty-box">
            <ShoppingBag size={48} className="cart-page-empty-icon" />
            <h2>Your Bag is Waiting</h2>
            <p>Discover everyday brilliance crafted in pure 925 sterling silver.</p>
            <Link to="/shop" className="btn btn-primary btn-lg">
              Explore 925 Silver <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="cart-page-grid">
            {/* Left Col: Free shipping bar & Cart Items */}
            <div>
              {/* Free Shipping Progress Bar */}
              <div className="cart-shipping-bar-container" style={{ marginBottom: '1.5rem' }}>
                <div className="cart-shipping-bar-msg">
                  <Truck size={16} />
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

              {/* Items List */}
              <div className="cart-page-items-list">
                {cart.map((item) => (
                  <CartItem key={item.cartItemId} item={item} />
                ))}
              </div>

              {/* Actions below items */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                <Link to="/shop" className="btn btn-outline btn-sm">
                  ← Continue Shopping
                </Link>
                <button
                  type="button"
                  onClick={clearCart}
                  style={{
                    fontSize: '0.85rem',
                    color: '#64748B',
                    textDecoration: 'underline',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  Clear Bag
                </button>
              </div>
            </div>

            {/* Right Col: Order Summary */}
            <div>
              <div className="cart-order-summary-card">
                <h3 className="cart-summary-title">Order Summary</h3>

                {/* Promo Code Form */}
                <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #E2E8F0' }}>
                  {appliedCoupon ? (
                    <div className="cart-coupon-applied">
                      <div className="cart-coupon-info">
                        <Check size={16} color="#10B981" />
                        <span>Code <strong>{appliedCoupon.code}</strong> (20% Off)</span>
                      </div>
                      <button type="button" onClick={removeCoupon} className="cart-coupon-remove-btn">
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="cart-coupon-form">
                      <div className="cart-coupon-input-wrap">
                        <Tag size={15} className="cart-coupon-icon" />
                        <input
                          type="text"
                          placeholder="Promo code (e.g. SHVERAA20)"
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

                {/* Subtotals */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '1.5rem' }}>
                  <div className="cart-summary-row">
                    <span>Items Subtotal</span>
                    <span>₹{cartSubtotal}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="cart-summary-row cart-discount-row">
                      <span>Discount ({appliedCoupon.code})</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                  <div className="cart-summary-row">
                    <span>Insured Express Shipping</span>
                    <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
                  </div>
                  <div className="cart-summary-row cart-total-row">
                    <span>Estimated Total</span>
                    <span>₹{cartTotal}</span>
                  </div>
                </div>

                {/* Checkout CTA */}
                <Link
                  to="/checkout"
                  className="btn btn-primary btn-lg"
                  style={{
                    width: '100%',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                  }}
                >
                  <Lock size={16} />
                  <span>Proceed to Checkout • ₹{cartTotal}</span>
                  <ArrowRight size={16} />
                </Link>

                {/* Trust Badges */}
                <div className="cart-summary-trust-list">
                  <div className="cart-summary-trust-item">
                    <ShieldCheck size={16} /> Certified 925 BIS Hallmarked
                  </div>
                  <div className="cart-summary-trust-item">
                    <Truck size={16} /> Insured &amp; Tamper-Proof Delivery
                  </div>
                  <div className="cart-summary-trust-item">
                    <Sparkles size={16} /> Signature Velvet Presentation Box
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
