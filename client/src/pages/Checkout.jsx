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
  RefreshCw,
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
  apiCODPlaceOrder,
} from '../services/api';
import { trackPixelEvent } from '../utils/metaPixel';

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

  // Track Meta Pixel InitiateCheckout event
  const initiatedCheckoutRef = useRef(false);
  useEffect(() => {
    if (!initiatedCheckoutRef.current && cart && cart.length > 0) {
      initiatedCheckoutRef.current = true;
      trackPixelEvent('InitiateCheckout', {
        num_items: cart.reduce((sum, item) => sum + (item.quantity || 1), 0),
        value: Number(cartTotal || 0),
        currency: 'INR',
        content_ids: cart.map((i) => i.productId || i._id).filter(Boolean),
        content_type: 'product',
      });
    }
  }, [cart, cartTotal]);

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

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isPaymentVerifying, setIsPaymentVerifying] = useState(false);
  const [formError, setFormError] = useState('');
  const shippingRequestId = useRef(0);

  // Calculate final grand total including white-glove option
  // NOTE: Cash on Delivery is a complimentary payment option — no COD surcharge
  // is added to the payable total.
  const deliverySurcharge = deliveryOption === 'whiteglove' ? 249 : 0;
  const finalPayable = Math.max(0, Math.round(cartTotal + deliverySurcharge));

  // Shipping rates per payment method (fetched upfront in parallel based on pincode)
  const [shippingRates, setShippingRates] = useState({
    prepaid: null,
    cod: null,
    prepaidError: '',
    codError: '',
  });
  const [isCheckingShipping, setIsCheckingShipping] = useState(false);

  useEffect(() => {
    if (!cart.length || !/^\d{6}$/.test(pincode)) {
      setShippingRates({ prepaid: null, cod: null, prepaidError: '', codError: '' });
      setShippingCost(0);
      return;
    }

    const cartIds = cart.map((item) => item._id).filter(Boolean);
    if (!cartIds.length) return;

    const requestId = ++shippingRequestId.current;
    setIsCheckingShipping(true);

    const payableCodAmount = Math.max(0, cartSubtotal - discountAmount);

    Promise.allSettled([
      apiCheckShippingDetails(cartIds, pincode, 'Pre-paid', 0),
      apiCheckShippingDetails(cartIds, pincode, 'COD', payableCodAmount),
    ])
      .then(([prepaidRes, codRes]) => {
        if (requestId !== shippingRequestId.current) return;

        const prepaidCost =
          prepaidRes.status === 'fulfilled' && prepaidRes.value?.shippingCharges !== undefined
            ? Math.round(Number(prepaidRes.value.shippingCharges) || 0)
            : null;
        const prepaidError = prepaidRes.status === 'rejected' ? (prepaidRes.reason?.message || 'Error') : '';

        const codCost =
          codRes.status === 'fulfilled' && codRes.value?.shippingCharges !== undefined
            ? Math.round(Number(codRes.value.shippingCharges) || 0)
            : null;
        const codError = codRes.status === 'rejected' ? (codRes.reason?.message || 'Error') : '';

        setShippingRates({
          prepaid: prepaidCost,
          cod: codCost,
          prepaidError,
          codError,
        });

        // Set the active shipping cost for the currently selected payment method
        const activeCost = paymentMethod === 'cod' ? codCost : prepaidCost;
        if (activeCost !== null && activeCost !== undefined) {
          setShippingCost(activeCost);
        }
      })
      .catch((error) => {
        if (requestId === shippingRequestId.current) {
          console.error('Error checking checkout shipping charges:', error);
        }
      })
      .finally(() => {
        if (requestId === shippingRequestId.current) {
          setIsCheckingShipping(false);
        }
      });

    return () => {
      shippingRequestId.current += 1;
    };
  }, [cart, pincode, cartSubtotal, discountAmount, setShippingCost]);

  // Keep shippingCost in sync whenever paymentMethod changes without extra API calls
  useEffect(() => {
    const activeCost = paymentMethod === 'cod' ? shippingRates.cod : shippingRates.prepaid;
    if (activeCost !== null && activeCost !== undefined) {
      setShippingCost(activeCost);
    }
  }, [paymentMethod, shippingRates, setShippingCost]);

  const renderShippingBadge = (type) => {
    if (!pincode || !/^\d{6}$/.test(pincode)) {
      return null;
    }
    if (isCheckingShipping) {
      return (
        <span className="shv-pay-charge-badge loading">
          <RefreshCw size={10} className="shv-spin-icon" />
          <span>Calculating...</span>
        </span>
      );
    }
    const cost = type === 'cod' ? shippingRates.cod : shippingRates.prepaid;
    const error = type === 'cod' ? shippingRates.codError : shippingRates.prepaidError;

    if (cost !== null && cost !== undefined) {
      if (cost === 0) {
        return <span className="shv-pay-charge-badge free">FREE Delivery</span>;
      }
      return (
        <span className={`shv-pay-charge-badge ${type === 'cod' ? 'cod' : 'prepaid'}`}>
          +₹{cost} {type === 'cod' ? 'COD Delivery' : 'Delivery'}
        </span>
      );
    }

    if (error) {
      return (
        <span className="shv-pay-charge-badge error">
          {type === 'cod' ? 'COD Unavailable' : 'Unavailable'}
        </span>
      );
    }
    return null;
  };

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

  const ensureShippingAddress = async () => {
    let currentAddressId = selectedAddrId && selectedAddrId !== '__new__' ? selectedAddrId : '';

    if (!currentAddressId) {
      if (!fullName.trim() || !phone.trim() || !address.trim() || !city.trim() || !pincode.trim()) {
        throw new Error('Please fill in all required shipping address fields (Name, Phone, Address, City, PIN code).');
      }

      if (!user) {
        throw new Error('Please sign in to complete your checkout and save your delivery address.');
      }

      const saveRes = await apiAddUserAddress({
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

      if (saveRes?.address?._id) {
        currentAddressId = saveRes.address._id;
        setSelectedAddrId(currentAddressId);
        setSavedAddresses((prev) => [...prev, saveRes.address]);
      } else {
        throw new Error(saveRes?.message || 'Could not save shipping address. Please make sure you are signed in.');
      }
    }

    return currentAddressId;
  };

  const handleCodOrder = async () => {
    setIsPlacingOrder(true);
    setIsPaymentVerifying(true);
    setFormError('');
    try {
      const cartIds = cart.map((item) => item._id || item.id).filter(Boolean);
      const couponId = appliedCoupon?.coupenId || '';
      const addressId = await ensureShippingAddress();

      const verifyRes = await apiCODPlaceOrder({
        cartIds,
        couponId,
        shippingCost: Math.round(Number(shippingCost) || 0),
        addressId,
      });

      const placedOrderData = verifyRes?.order;
      await finishOrder(placedOrderData);
    } catch (error) {
      console.error('Payment verification failed:', error);
      setFormError(error.message || 'Please try again or contact support.');
      setIsPlacingOrder(false);
      setIsPaymentVerifying(false);
    }
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
      const addressId = await ensureShippingAddress();
      const couponId = appliedCoupon?.coupenId || '';
      const data = await apiCreatePaymentOrder({
        cartIds,
        couponId,
        shippingCost: Math.round(Number(shippingCost) || 0),
        addressId,
      });

      const order = data?.order;
      if (!order || !order.id) {
        throw new Error(data?.message || 'Failed to create Razorpay payment order from server.');
      }

      const razorpayKey = data?.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TVSL7tlw4NS59L';

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
            setIsPaymentVerifying(true);
            const currentAddrId = addressId || (selectedAddrId && selectedAddrId !== '__new__' ? selectedAddrId : '');

            const verifyRes = await apiVerifyPaymentPlaceOrder({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              cartIds,
              couponId,
              shippingCost: Math.round(Number(shippingCost) || 0),
              addressId: currentAddrId,
            });


            

            const placedOrderData = verifyRes?.order;
            // const placedOrderData = {
            //   ...(serverOrder || {}),
            //   orderId: serverOrder?.orderNumber || serverOrder?._id || `SHV-${Math.floor(100000 + Math.random() * 900000)}`,
            //   orderNumber: serverOrder?.orderNumber || `SHV-${Math.floor(100000 + Math.random() * 900000)}`,
            //   customer: {
            //     fullName: fullName || user?.name || 'Valued Patron',
            //     email: email || user?.email || '',
            //     phone: serverOrder?.address?.phone || phone || user?.phone || '',
            //     address: serverOrder?.address?.addressline
            //       ? `${serverOrder.address.addressline}, ${serverOrder.address.city}, ${serverOrder.address.state} - ${serverOrder.address.pincode}`
            //       : `${address}${apartment ? `, ${apartment}` : ''}, ${city}, ${stateName} - ${pincode}`,
            //   },
            //   deliveryOption,
            //   estimatedDelivery: serverOrder?.waybill ? `Waybill: ${serverOrder.waybill} (2–4 Business Days)` : '2–4 Business Days',
            // };

            await finishOrder(placedOrderData);
          } catch (verifyErr) {
            console.error('Payment verification failed:', verifyErr);
            setFormError(verifyErr.message || 'Payment verification failed. Please try again or contact support.');
            setIsPlacingOrder(false);
            setIsPaymentVerifying(false);
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
            setIsPaymentVerifying(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        console.error('Razorpay payment failed:', resp.error);
        setFormError(resp.error?.description || 'Payment failed or cancelled.');
        setIsPlacingOrder(false);
        setIsPaymentVerifying(false);
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
      {/* Fullscreen Verifying Overlay */}
      {isPaymentVerifying && (
        <div className="shv-verifying-fullscreen-overlay">
          <div className="shv-verifying-modal">
            <div className="shv-verifying-icon-wrap">
              <div className="shv-verifying-ripple ripple-1" />
              <div className="shv-verifying-ripple ripple-2" />
              <div className="shv-verifying-icon-core">
                <Sparkles size={28} className="shv-verifying-sparkle" />
              </div>
            </div>

            <div className="shv-verifying-badge">
              <Lock size={12} />
              <span>Atelier Security Protocol</span>
            </div>

            <h2 className="shv-verifying-headline">
              {paymentMethod === 'cod' ? 'Confirming Your Curation' : 'Payment Received'}
            </h2>
            <p className="shv-verifying-subtext">
              {paymentMethod === 'cod'
                ? 'Generating your Delhivery air express waybill and BIS 925 Hallmark certificate...'
                : 'Verifying payment with gateway and generating your insured Delhivery dispatch waybill...'}
            </p>

            <div className="shv-verifying-progress-box">
              <div className="shv-verifying-spinner-bar">
                <div className="shv-verifying-spinner-fill" />
              </div>
              <div className="shv-verifying-steps-list">
                <div className="shv-verifying-step-item done">
                  <CheckCircle2 size={15} />
                  <span>{paymentMethod === 'cod' ? 'Order Authorized' : 'Payment Captured'}</span>
                </div>
                <div className="shv-verifying-step-item pending">
                  <div className="shv-verifying-spinner-dot" />
                  <span>Assigning Insured Delhivery Waybill</span>
                </div>
              </div>
            </div>

            <p className="shv-verifying-warning">
              ✦ Please do not refresh or close this window. You will be redirected momentarily.
            </p>
          </div>
        </div>
      )}

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
                        <input type="radio" name="savedAddr" checked={selectedAddrId === '__new__'} onChange={() => { }} />
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
              {/* <div className="shv-checkout-step-card">
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
                          Includes signature velvet keepsake box, hand-tied satin bow, personalized calligraphy card, and priority Surat atelier inspection.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div> */}

              {/* Step 3: Payment Rail Selection */}
              <div className="shv-checkout-step-card">
                <div className="shv-step-header">
                  <div className="shv-step-num">3</div>
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
                        <div className="shv-pay-badges-wrap">
                          <span className="shv-pay-rec-badge">Recommended</span>
                          {renderShippingBadge('prepaid')}
                        </div>
                      </div>
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
                        <div className="shv-pay-badges-wrap">
                          {renderShippingBadge('prepaid')}
                        </div>
                      </div>
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
                        <div className="shv-pay-badges-wrap">
                          {renderShippingBadge('prepaid')}
                        </div>
                      </div>
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
                        <div className="shv-pay-badges-wrap">
                          {renderShippingBadge('cod')}
                        </div>
                      </div>

                      {paymentMethod === 'cod' && (
                        <div className="shv-payment-nested-details">
                          <p>
                            An SMS &amp; WhatsApp verification will be sent before courier dispatch. You can pay via Cash or UPI at your doorstep.
                          </p>
                          {shippingRates.cod !== null && (
                            <p style={{ marginTop: '6px', fontWeight: 600, color: '#8C6A3E' }}>
                              {shippingRates.cod === 0
                                ? '✦ Cash on Delivery includes complimentary free shipping.'
                                : `✦ ₹${shippingRates.cod} shipping charge is added for Cash on Delivery service.`}
                            </p>
                          )}
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
                        ? `Place COD Order • ₹${Math.round(finalPayable).toLocaleString('en-IN')}`
                        : `Pay with Razorpay • ₹${Math.round(finalPayable).toLocaleString('en-IN')}`}
                  </span>
                  <ArrowRight size={16} />
                </button>
                <p className="shv-order-security-note">
                  ✦ By placing your order, you agree to Shveraa's 2-3 Days Doorstep Return Window &amp; BIS 925 Hallmark Guarantee.
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
                  <span>₹{Math.round(cartSubtotal).toLocaleString('en-IN')}</span>
                </div>

                {appliedCoupon && (
                  <div className="shv-pricing-row shv-discount-row">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-₹{Math.round(discountAmount).toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="shv-pricing-row">
                  <span>Insured Express Shipping</span>
                  <span>{shippingCost === 0 ? 'FREE' : `₹${Math.round(shippingCost).toLocaleString('en-IN')}`}</span>
                </div>

                {deliveryOption === 'whiteglove' && (
                  <div className="shv-pricing-row">
                    <span>White-Glove VIP Presentation</span>
                    <span>+₹249</span>
                  </div>
                )}

                <div className="shv-pricing-divider" />

                <div className="shv-pricing-row shv-total-row">
                  <span>Total Amount</span>
                  <span>₹{Math.round(finalPayable).toLocaleString('en-IN')}</span>
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
