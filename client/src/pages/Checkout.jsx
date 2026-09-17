import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Truck,
  Sparkles,
  CreditCard,
  QrCode,
  Building,
  Banknote,
  ArrowRight,
  CheckCircle2,
  Gift,
  ChevronRight,
  MapPin,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { apiGetUserAddresses, getImageUrl } from '../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const {
    cart,
    cartCount,
    cartSubtotal,
    cartTotal,
    discountAmount,
    shippingCost,
    appliedCoupon,
    clearCart,
  } = useCart();
  const { user } = useAuth();

  // Delivery & Customer State
  const [email, setEmail] = useState(user?.email || '');
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('Maharashtra');
  const [pincode, setPincode] = useState('');
  const [saveInfo, setSaveInfo] = useState(true);

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddrId, setSelectedAddrId] = useState(null);

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const data = await apiGetUserAddresses();
        if (data?.addresses?.length) {
          setSavedAddresses(data.addresses);
          // Auto-fill default address
          const def = data.addresses.find((a) => a.isDefault) || data.addresses[0];
          if (def) applyAddress(def);
        }
      } catch (_) {
        // Not logged in or network error – ignore
      }
    };
    fetchAddresses();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyAddress = (addr) => {
    setSelectedAddrId(addr._id);
    setFullName(addr.fullName || '');
    setPhone(addr.phone || '');
    setAddress(addr.street || '');
    setApartment(addr.locality || '');
    setCity(addr.city || '');
    setStateName(addr.state || 'Maharashtra');
    setPincode(addr.pincode || '');
  };

  // Delivery Option State: 'express' or 'whiteglove'
  const [deliveryOption, setDeliveryOption] = useState('express');

  // Payment Method State: 'upi', 'card', 'netbanking', 'cod'
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [upiId, setUpiId] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [formError, setFormError] = useState('');

  // Calculate final grand total including white-glove option or COD fee
  const deliverySurcharge = deliveryOption === 'whiteglove' ? 249 : 0;
  const codSurcharge = paymentMethod === 'cod' ? 99 : 0;
  const finalPayable = cartTotal + deliverySurcharge + codSurcharge;

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    setFormError('');

    if (!fullName || !email || !phone || !address || !city || !pincode) {
      setFormError('Please fill in all required shipping address fields.');
      window.scrollTo({ top: 200, behavior: 'smooth' });
      return;
    }

    if (cartCount === 0) {
      setFormError('Your cart is empty.');
      return;
    }

    setIsPlacingOrder(true);

    const generatedOrderId = `SHV-${Math.floor(100000 + Math.random() * 900000)}`;
    const orderData = {
      orderId: generatedOrderId,
      displayId: `#${generatedOrderId}`,
      date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      customer: {
        fullName,
        email,
        phone,
        address: `${address}, ${apartment ? apartment + ', ' : ''}${city}, ${stateName} - ${pincode}`,
      },
      items: cart.map((item) => ({
        id: item._id || item.slug || item.id,
        name: item.name,
        image: item.image || (item.images && item.images[0]) || '/hero-ring-banner.jpg',
        price: item.price,
        quantity: item.quantity,
        size: item.selectedSize || 'Standard',
      })),
      pricing: {
        subtotal: cartSubtotal,
        discount: discountAmount,
        shipping: shippingCost === 0 ? 'FREE' : `₹${shippingCost}`,
        deliverySurcharge,
        codSurcharge,
        total: finalPayable,
      },
      deliveryOption,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'Pending (COD)' : 'Paid',
      status: 'Scheduled',
      carrier: 'BlueDart Air Express',
      trackingNumber: `BD-${Math.floor(10000000 + Math.random() * 90000000)}`,
      estimatedDelivery: '2–4 Business Days (Insured Air Express)',
    };

    try {
      localStorage.setItem('shveraa_last_order', JSON.stringify(orderData));
      const existingOrdersStr = localStorage.getItem('shveraa_orders');
      const existingOrders = existingOrdersStr ? JSON.parse(existingOrdersStr) : [];
      const updatedOrders = [orderData, ...existingOrders.filter((o) => o.orderId !== orderData.orderId)];
      localStorage.setItem('shveraa_orders', JSON.stringify(updatedOrders));
      window.dispatchEvent(new CustomEvent('shveraa_store_updated', { detail: { action: 'ORDER_PLACED', data: updatedOrders } }));
    } catch (err) {
      console.warn('Could not cache order in storage:', err);
    }

    setTimeout(() => {
      clearCart();
      setIsPlacingOrder(false);
      navigate('/order-success', { state: { order: orderData } });
    }, 900);
  };

  if (cart.length === 0 && !isPlacingOrder) {
    return (
      <div className="shv-checkout-empty-wrap">
        <div className="container">
          <div className="shv-checkout-empty-card">
            <Sparkles size={40} className="shv-empty-icon" />
            <h2>Your Silver Bag is Empty</h2>
            <p>Select pieces from our certified 925 sterling silver collection to proceed.</p>
            <Link to="/shop" className="btn btn-primary">
              Explore 925 Silver Collections <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shv-checkout-page">
      {/* Checkout Dedicated Header */}
      <header className="shv-checkout-top-header">
        <div className="container shv-checkout-header-inner">
          <Link to="/" className="shv-checkout-brand">
            <span className="shv-checkout-brand-title">SHVERAA</span>
            <span className="shv-checkout-brand-sub">ATELIER CHECKOUT</span>
          </Link>

          <div className="shv-checkout-security-badge">
            <Lock size={14} />
            <span>256-Bit Bank Grade SSL Encryption</span>
          </div>
        </div>
      </header>

      <div className="container shv-checkout-main-container">
        {formError && <div className="shv-checkout-error-bar">{formError}</div>}

        <div className="shv-checkout-grid">
          {/* Left Column: Form Steps */}
          <div className="shv-checkout-left-col">
            <form onSubmit={handlePlaceOrder} id="checkout-form">
              {/* Step 1: Customer Contact */}
              <div className="shv-checkout-step-card">
                <div className="shv-step-header">
                  <div className="shv-step-num">1</div>
                  <h3>Contact Details</h3>
                </div>

                <div className="shv-step-body">
                  <div className="shv-form-row">
                    <div className="shv-input-group">
                      <label htmlFor="chk-email">Email Address (For Invoicing)</label>
                      <input
                        id="chk-email"
                        type="email"
                        required
                        placeholder="yourname@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="shv-input-group">
                      <label htmlFor="chk-phone">Mobile Phone (For WhatsApp Courier Alerts)</label>
                      <input
                        id="chk-phone"
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Saved Address Selector (if user has addresses) */}
              {savedAddresses.length > 0 && (
                <div className="shv-checkout-step-card shv-saved-addr-selector">
                  <div className="shv-step-header">
                    <div className="shv-step-num"><MapPin size={14} /></div>
                    <h3>Ship to a Saved Address</h3>
                  </div>
                  <div className="shv-step-body">
                    <div className="shv-saved-addr-list">
                      {savedAddresses.map((addr) => (
                        <label
                          key={addr._id}
                          className={`shv-saved-addr-row${selectedAddrId === addr._id ? ' active' : ''}`}
                        >
                          <input
                            type="radio"
                            name="savedAddr"
                            checked={selectedAddrId === addr._id}
                            onChange={() => applyAddress(addr)}
                          />
                          <div className="shv-saved-addr-info">
                            <strong>{addr.fullName}</strong>
                            <span>{addr.street}{addr.locality ? `, ${addr.locality}` : ''}, {addr.city}, {addr.state} – {addr.pincode}</span>
                          </div>
                          {addr.isDefault && <span className="shv-saved-addr-default-tag">Default</span>}
                        </label>
                      ))}
                      <label
                        className={`shv-saved-addr-row${selectedAddrId === '__new__' ? ' active' : ''}`}
                        onClick={() => { setSelectedAddrId('__new__'); setFullName(''); setPhone(''); setAddress(''); setApartment(''); setCity(''); setStateName('Maharashtra'); setPincode(''); }}
                      >
                        <input type="radio" name="savedAddr" checked={selectedAddrId === '__new__'} onChange={() => {}} />
                        <div className="shv-saved-addr-info">
                          <strong>+ Enter a new address</strong>
                          <span>Deliver to a different location</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Shipping Address */}
              <div className="shv-checkout-step-card">
                <div className="shv-step-header">
                  <div className="shv-step-num">2</div>
                  <h3>Insured Delivery Address</h3>
                </div>

                <div className="shv-step-body">
                  <div className="shv-input-group">
                    <label htmlFor="chk-name">Recipient Full Name</label>
                    <input
                      id="chk-name"
                      type="text"
                      required
                      placeholder="e.g. Radhika Deshmukh"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div className="shv-input-group">
                    <label htmlFor="chk-address">Street Address, Flat / House No.</label>
                    <input
                      id="chk-address"
                      type="text"
                      required
                      placeholder="e.g. 402, Lotus Heritage, Linking Road"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>

                  <div className="shv-input-group">
                    <label htmlFor="chk-apt">Apartment, Landmark, Suite (Optional)</label>
                    <input
                      id="chk-apt"
                      type="text"
                      placeholder="Near Bandra West Post Office"
                      value={apartment}
                      onChange={(e) => setApartment(e.target.value)}
                    />
                  </div>

                  <div className="shv-form-row-3">
                    <div className="shv-input-group">
                      <label htmlFor="chk-city">City</label>
                      <input
                        id="chk-city"
                        type="text"
                        required
                        placeholder="Mumbai"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      />
                    </div>

                    <div className="shv-input-group">
                      <label htmlFor="chk-state">State</label>
                      <select
                        id="chk-state"
                        value={stateName}
                        onChange={(e) => setStateName(e.target.value)}
                      >
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Delhi">Delhi</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="Telangana">Telangana</option>
                        <option value="West Bengal">West Bengal</option>
                        <option value="Other">Other States</option>
                      </select>
                    </div>

                    <div className="shv-input-group">
                      <label htmlFor="chk-pincode">PIN Code</label>
                      <input
                        id="chk-pincode"
                        type="text"
                        required
                        maxLength={6}
                        placeholder="400050"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Courier Delivery Method */}
              <div className="shv-checkout-step-card">
                <div className="shv-step-header">
                  <div className="shv-step-num">3</div>
                  <h3>Shipping &amp; Packaging Options</h3>
                </div>

                <div className="shv-step-body">
                  <div className="shv-delivery-options-stack">
                    <label
                      className={`shv-delivery-card ${deliveryOption === 'express' ? 'active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="deliveryOption"
                        checked={deliveryOption === 'express'}
                        onChange={() => setDeliveryOption('express')}
                      />
                      <div className="shv-delivery-info">
                        <div className="shv-delivery-title-row">
                          <span className="shv-delivery-title">
                            Express Insured Courier (Air Dispatch)
                          </span>
                          <span className="shv-delivery-price">FREE</span>
                        </div>
                        <p className="shv-delivery-desc">
                          Delivered in 2–3 business days via BlueDart Air / Delhivery. Tamper-evident secure packaging.
                        </p>
                      </div>
                    </label>

                    <label
                      className={`shv-delivery-card ${deliveryOption === 'whiteglove' ? 'active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="deliveryOption"
                        checked={deliveryOption === 'whiteglove'}
                        onChange={() => setDeliveryOption('whiteglove')}
                      />
                      <div className="shv-delivery-info">
                        <div className="shv-delivery-title-row">
                          <span className="shv-delivery-title">
                            White-Glove VIP Presentation + Gift Wax Seal
                          </span>
                          <span className="shv-delivery-price">+₹249</span>
                        </div>
                        <p className="shv-delivery-desc">
                          Includes signature velvet keepsake box, hand-tied satin bow, personalized calligraphy card, and priority Jaipur atelier inspection.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Step 4: Payment Rail Selection */}
              <div className="shv-checkout-step-card">
                <div className="shv-step-header">
                  <div className="shv-step-num">4</div>
                  <h3>Payment Method</h3>
                </div>

                <div className="shv-step-body">
                  <div className="shv-payment-methods-grid">
                    {/* UPI Option */}
                    <label
                      className={`shv-payment-option ${paymentMethod === 'upi' ? 'active' : ''}`}
                    >
                      <div className="shv-payment-radio-row">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'upi'}
                          onChange={() => setPaymentMethod('upi')}
                        />
                        <div className="shv-payment-label">
                          <QrCode size={18} className="shv-pay-icon" />
                          <span>UPI Instant Pay (GPay, PhonePe, Paytm, QR)</span>
                        </div>
                        <span className="shv-pay-rec-badge">Recommended</span>
                      </div>

                      {paymentMethod === 'upi' && (
                        <div className="shv-payment-nested-details">
                          <p>Enter your UPI VPA or scan QR code on the confirmation screen:</p>
                          <div className="shv-input-group">
                            <input
                              type="text"
                              placeholder="username@okhdfcbank / mobile@upi"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </label>

                    {/* Credit / Debit Card Option */}
                    <label
                      className={`shv-payment-option ${paymentMethod === 'card' ? 'active' : ''}`}
                    >
                      <div className="shv-payment-radio-row">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'card'}
                          onChange={() => setPaymentMethod('card')}
                        />
                        <div className="shv-payment-label">
                          <CreditCard size={18} className="shv-pay-icon" />
                          <span>Credit / Debit Card (Visa, MasterCard, RuPay, Amex)</span>
                        </div>
                      </div>

                      {paymentMethod === 'card' && (
                        <div className="shv-payment-nested-details">
                          <div className="shv-input-group">
                            <label>Card Number</label>
                            <input
                              type="text"
                              placeholder="4123 •••• •••• 9842"
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value)}
                            />
                          </div>
                          <div className="shv-form-row">
                            <div className="shv-input-group">
                              <label>Expiry (MM/YY)</label>
                              <input
                                type="text"
                                placeholder="12/28"
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value)}
                              />
                            </div>
                            <div className="shv-input-group">
                              <label>CVV</label>
                              <input
                                type="password"
                                maxLength={4}
                                placeholder="•••"
                                value={cardCvv}
                                onChange={(e) => setCardCvv(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </label>

                    {/* NetBanking Option */}
                    <label
                      className={`shv-payment-option ${paymentMethod === 'netbanking' ? 'active' : ''}`}
                    >
                      <div className="shv-payment-radio-row">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'netbanking'}
                          onChange={() => setPaymentMethod('netbanking')}
                        />
                        <div className="shv-payment-label">
                          <Building size={18} className="shv-pay-icon" />
                          <span>NetBanking (50+ Indian Banks)</span>
                        </div>
                      </div>

                      {paymentMethod === 'netbanking' && (
                        <div className="shv-payment-nested-details">
                          <select
                            value={selectedBank}
                            onChange={(e) => setSelectedBank(e.target.value)}
                          >
                            <option value="HDFC Bank">HDFC Bank</option>
                            <option value="ICICI Bank">ICICI Bank</option>
                            <option value="State Bank of India">State Bank of India</option>
                            <option value="Axis Bank">Axis Bank</option>
                            <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                          </select>
                        </div>
                      )}
                    </label>

                    {/* Cash on Delivery (COD) */}
                    <label
                      className={`shv-payment-option ${paymentMethod === 'cod' ? 'active' : ''}`}
                    >
                      <div className="shv-payment-radio-row">
                        <input
                          type="radio"
                          name="paymentMethod"
                          checked={paymentMethod === 'cod'}
                          onChange={() => setPaymentMethod('cod')}
                        />
                        <div className="shv-payment-label">
                          <Banknote size={18} className="shv-pay-icon" />
                          <span>Cash on Delivery (Doorstep Cash / UPI)</span>
                        </div>
                        <span className="shv-cod-fee">+₹99 Fee</span>
                      </div>

                      {paymentMethod === 'cod' && (
                        <div className="shv-payment-nested-details">
                          <p>
                            An SMS &amp; WhatsApp verification will be sent before courier dispatch. You can pay via Cash or UPI at your doorstep.
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              {/* Complete Purchase Button (Desktop & Mobile) */}
              <div className="shv-checkout-submit-wrap">
                <button
                  type="submit"
                  disabled={isPlacingOrder}
                  className="shv-place-order-btn"
                >
                  <Lock size={16} />
                  <span>
                    {isPlacingOrder
                      ? 'Securing Atelier Order...'
                      : `Complete Purchase • ₹${finalPayable}`}
                  </span>
                  <ArrowRight size={16} />
                </button>
                <p className="shv-order-security-note">
                  ✦ By placing your order, you agree to Shveraa's 30-Day Doorstep Grace Period &amp; BIS 925 Hallmark Guarantee.
                </p>
              </div>
            </form>
          </div>

          {/* Right Column: Sticky Order Summary */}
          <div className="shv-checkout-right-col">
            <div className="shv-order-summary-sticky">
              <div className="shv-summary-header">
                <h3>Order Summary</h3>
                <span className="shv-summary-count">{cartCount} Pieces</span>
              </div>

              {/* Items List */}
              <div className="shv-summary-items-list">
                {cart.map((item) => (
                  <div key={item._id} className="shv-summary-item-row">
                    <div className="shv-summary-item-img-wrap">
                      <img
                        src={getImageUrl(item.image || (item.images && item.images[0]))}
                        alt={item.name}
                        onError={(e) => { e.currentTarget.src = '/hero-ring-banner.jpg'; }}
                      />
                      <span className="shv-summary-item-qty">{item.quantity}</span>
                    </div>

                    <div className="shv-summary-item-details">
                      <h4>{item.name}</h4>
                      <div className="shv-summary-item-meta">
                        <span>{item.color || item.selectedColor || 'Pure 925 Silver'} • Size: {item.selectedSize || item.size || 'Standard'}</span>
                        <span className="shv-summary-hallmark">925 BIS</span>
                      </div>
                    </div>

                    <div className="shv-summary-item-price">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="shv-summary-pricing-rows">
                <div className="shv-pricing-row">
                  <span>Items Subtotal</span>
                  <span>₹{cartSubtotal}</span>
                </div>

                {appliedCoupon && (
                  <div className="shv-pricing-row shv-discount-row">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}

                <div className="shv-pricing-row">
                  <span>Insured Express Shipping</span>
                  <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}</span>
                </div>

                {deliveryOption === 'whiteglove' && (
                  <div className="shv-pricing-row">
                    <span>White-Glove VIP Presentation</span>
                    <span>+₹249</span>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div className="shv-pricing-row">
                    <span>COD Verification Fee</span>
                    <span>+₹99</span>
                  </div>
                )}

                <div className="shv-pricing-divider" />

                <div className="shv-pricing-row shv-total-row">
                  <span>Total Amount</span>
                  <span>₹{finalPayable}</span>
                </div>
              </div>

              {/* Guarantees Box */}
              <div className="shv-summary-guarantees-card">
                <div className="shv-guarantee-item">
                  <ShieldCheck size={16} />
                  <span>BIS 925 Hallmarked Certified Purity</span>
                </div>
                <div className="shv-guarantee-item">
                  <Truck size={16} />
                  <span>Insured &amp; Tamper-Proof Doorstep Transit</span>
                </div>
                <div className="shv-guarantee-item">
                  <Sparkles size={16} />
                  <span>Signature Velvet Gift Presentation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
