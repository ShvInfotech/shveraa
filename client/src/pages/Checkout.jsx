import React, { useState, useEffect, useRef } from 'react';
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
import {
  apiGetUserAddresses,
  apiAddUserAddress,
  apiCheckShippingDetails,
  apiCreatePaymentOrder,
  apiVerifyPaymentPlaceOrder,
  getImageUrl,
} from '../services/api';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const navigate = useNavigate();
  const {
    cart,
    cartCount,
    cartSubtotal,
    cartTotal,
    discountAmount,
    shippingCost,
    setShippingCost,
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
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressNotice, setAddressNotice] = useState('');

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const data = await apiGetUserAddresses();
        if (data?.addresses?.length) {
          setSavedAddresses(data.addresses);
          // Auto-fill default address
          const def = data.addresses.find((a) => a.isDefault) || data.addresses[0];
          if (def) applyAddress(def);
        } else {
          setSelectedAddrId('__new__');
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

  const handleSaveAddress = async () => {
    setAddressNotice('');
    if (!user) {
      setAddressNotice('Please sign in to save this address to your account.');
      return;
    }
    if (!fullName.trim() || !phone.trim() || !address.trim() || !city.trim() || !pincode.trim()) {
      setAddressNotice('Please fill in your name, phone, street, city, and PIN code before saving.');
      return;
    }

    setIsSavingAddress(true);
    try {
      const result = await apiAddUserAddress({
        fullName: fullName.trim(),
        phone: phone.trim(),
        street: address.trim(),
        locality: apartment.trim(),
        city: city.trim(),
        state: stateName,
        pincode: pincode.trim(),
        label: 'Home',
        isDefault: savedAddresses.length === 0,
      });
      const updatedAddresses = result?.addresses || (result?.address ? [...savedAddresses, result.address] : []);
      setSavedAddresses(updatedAddresses);
      if (result?.address) applyAddress(result.address);
      setAddressNotice('Address saved to your account.');
    } catch (err) {
      setAddressNotice(err.message || 'Could not save this address. Please try again.');
    } finally {
      setIsSavingAddress(false);
    }
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
  const shippingRequestId = useRef(0);

  // Calculate final grand total including white-glove option or COD fee
  const deliverySurcharge = deliveryOption === 'whiteglove' ? 249 : 0;
  const codSurcharge = paymentMethod === 'cod' ? 99 : 0;
  const finalPayable = cartTotal + deliverySurcharge + codSurcharge;

  useEffect(() => {
    if (!cart.length || !/^\d{6}$/.test(pincode)) return;

    const cartIds = cart.map((item) => item._id).filter(Boolean);
    if (!cartIds.length) return;

    const requestId = ++shippingRequestId.current;
    const isCod = paymentMethod === 'cod';
    apiCheckShippingDetails(cartIds,pincode,isCod ? 'COD' : 'Pre-paid',isCod ? Math.max(0, cartSubtotal - discountAmount) : 0,)
      .then((data) => {
        if (requestId === shippingRequestId.current && data?.shippingCharges !== undefined) {
          setShippingCost(Number(data.shippingCharges) || 0);
        }
      })
      .catch((error) => {
        if (requestId === shippingRequestId.current) {
          console.error('Error checking checkout shipping charges:', error);
        }
      });

    return () => {
      shippingRequestId.current += 1;
    };
  }, [cart, pincode, paymentMethod, cartSubtotal, discountAmount, setShippingCost]);

  const cachePlacedOrder = (orderData) => {
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
  };

  const finishOrder = async (orderData) => {
    cachePlacedOrder(orderData);
    await clearCart();
    setIsPlacingOrder(false);
    navigate('/order-success', { state: { order: orderData } });
  };

  const handleCodOrder = () => {
    console.log('this is cod order');
  };

  const handleRazorpayPayment = async () => {
    const cartIds = cart.map((item) => item._id || item.id).filter(Boolean);
    if (!cartIds.length) {
      setFormError('No valid cart items found to create order.');
      return;
    }

    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      setFormError('Could not load Razorpay payment SDK. Please check your internet connection.');
      return;
    }

    setIsPlacingOrder(true);
    setFormError('');

    try {
      const couponId = appliedCoupon?._id || appliedCoupon?.id || '';
      const data = await apiCreatePaymentOrder({
        cartIds,
        couponId,
      });

      const order = data?.order;
      if (!order || !order.id) {
        throw new Error('Failed to create Razorpay payment order from server.');
      }

      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TVSL7tlw4NS59L';

      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'SHVERAA',
        description: 'Fine 925 Sterling Silver Order',
        image: '/logo.png',
        order_id: order.id,
        handler: async function (response) {
          try {
            setIsPlacingOrder(true);
            const addressId = selectedAddrId && selectedAddrId !== '__new__' ? selectedAddrId : '';

            const verifyRes = await apiVerifyPaymentPlaceOrder({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              cartIds,
              couponId,
              addressId,
            });

            const orderNumber = verifyRes?.orderData?.orderNumber || `SHV-${Math.floor(100000 + Math.random() * 900000)}`;
            const now = new Date();
            const items = cart.map((item) => ({
              id: item.productId || item._id || item.slug || item.id,
              name: item.name,
              image: item.image || (item.images && item.images[0]) || '/hero-ring-banner.jpg',
              price: Number(item.price || 0),
              qty: Number(item.quantity || 1),
              size: item.size || item.selectedSize || 'Standard',
            }));

            const placedOrderData = {
              orderId: orderNumber,
              displayId: `#${orderNumber}`,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              customer: {
                fullName,
                email,
                phone,
                address: `${address}${apartment ? `, ${apartment}` : ''}`,
                city: `${city}${stateName ? `, ${stateName}` : ''}`,
                pincode,
              },
              items,
              pricing: {
                subtotal: cartSubtotal,
                discount: discountAmount,
                shipping: shippingCost === 0 ? 'FREE' : `₹${shippingCost}`,
                total: order.amount ? order.amount / 100 : finalPayable,
              },
              paymentMethod: 'Razorpay Secure (Online)',
              paymentStatus: 'Paid',
              status: 'Confirmed',
              date: now.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
              estimatedDelivery: '2–4 Business Days',
              carrier: 'BlueDart Air Express',
              trackingNumber: 'N/A',
            };

            await finishOrder(placedOrderData);
          } catch (verifyErr) {
            console.error('Payment verification failed:', verifyErr);
            setFormError(verifyErr.message || 'Payment verification failed. Please try again or contact support.');
            setIsPlacingOrder(false);
          }
        },
        prefill: {
          name: fullName,
          email: email,
          contact: phone,
        },
        theme: {
          color: '#1a1a1a',
        },
        modal: {
          ondismiss: function () {
            setIsPlacingOrder(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        console.error('Razorpay payment failed:', resp.error);
        setFormError(resp.error?.description || 'Payment failed or cancelled.');
        setIsPlacingOrder(false);
      });
      rzp.open();
    } catch (err) {
      console.error('Error creating payment order:', err);
      setFormError(err.message || 'Could not initiate payment. Please try again.');
      setIsPlacingOrder(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!fullName || !email || !phone || !address || !city || !pincode) {
      setFormError('Please fill in all required shipping address fields.');
      window.scrollTo({ top: 200, behavior: 'smooth' });
      return;
    }

    if (cartCount === 0 || cart.length === 0) {
      setFormError('Your cart is empty.');
      return;
    }

    // When COD is selected: only print "this is cod order" and do not open Razorpay
    if (paymentMethod === 'cod') {
      handleCodOrder();
      return;
    }

    // When COD is not selected: open Razorpay and verify payment
    await handleRazorpayPayment();
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
                        placeholder="+91 99980 46559"
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
                        onClick={() => { setSelectedAddrId('__new__'); setAddressNotice(''); setFullName(user?.name || ''); setPhone(user?.phone || ''); setAddress(''); setApartment(''); setCity(''); setStateName('Maharashtra'); setPincode(''); }}
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
                  {(selectedAddrId === '__new__' || savedAddresses.length === 0) && (
                    <div className="shv-address-save-actions">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={handleSaveAddress}
                        disabled={isSavingAddress}
                      >
                        {isSavingAddress ? 'Saving address...' : 'Save this address'}
                      </button>
                      {addressNotice && <p role="status" className="shv-address-save-notice">{addressNotice}</p>}
                    </div>
                  )}
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
                      ? 'Processing Order...'
                      : paymentMethod === 'cod'
                      ? `Place COD Order • ₹${finalPayable}`
                      : `Pay with Razorpay • ₹${finalPayable}`}
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
