import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  Package,
  MapPin,
  Heart,
  ShieldCheck,
  LogOut,
  Clock,
  Truck,
  Printer,
  Sparkles,
  CheckCircle2,
  Edit3,
  Plus,
  Phone,
  Mail,
  Lock,
  ArrowRight,
  Copy,
  Check,
  ShoppingBag,
  RefreshCw,
  Trash,
  RotateCcw,
  AlertCircle,
  Star,
  X,
} from 'lucide-react';

import {
  apiGetUserAddresses,
  apiAddUserAddress,
  apiUpdateUserAddress,
  apiDeleteUserAddress,
  apiSetDefaultUserAddress,
  apiGetMyOrders,
  apiCancelOrder,
  getImageUrl,
  apiReturnOrderRequest,
  apiSubmitReview,
  apiUserChangePasswordandDetails,
} from '../services/api';
import OrderTrackingModal from '../components/OrderTrackingModal';

import { downloadOrderInvoicePDF } from '../utils/invoiceGenerator';

const Account = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { wishlist, toggleWishlist, addToCart, wishlistCount, showToast } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active tab derived directly from URL query param: 'orders' | 'addresses' | 'wishlist' | 'security'
  const tabParam = searchParams.get('tab');
  const activeTab = ['orders', 'addresses', 'wishlist', 'security'].includes(tabParam) ? tabParam : 'orders';

  const [selectedSizes, setSelectedSizes] = useState({});
  const [copiedOrderId, setCopiedOrderId] = useState(null);
  const [addressSavedNotice, setAddressSavedNotice] = useState('');
  const [passwordSavedNotice, setPasswordSavedNotice] = useState(false);

  // Order actions & notice state
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [orderNotice, setOrderNotice] = useState('');

  const showOrderMsg = (msg) => {
    setOrderNotice(msg);
    setTimeout(() => setOrderNotice(''), 4500);
  };

  // COD Return Modal state
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnModalOrder, setReturnModalOrder] = useState(null);
  const [codBankForm, setCodBankForm] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    accountType: 'savings',
    reason: 'Defective / Damaged Item',

  });
  const [codBankErrors, setCodBankErrors] = useState({});
  const [submittingReturn, setSubmittingReturn] = useState(false);

  // ---------- Product Review (star popup) state ----------
  // Only DELIVERED orders can be reviewed. `reviewModal` holds the order/item
  // being rated plus the in-progress rating/title/comment for the popup.
  const [reviewModal, setReviewModal] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [Errormessage,setErrormessage] = useState('');
  // Open the review popup — pre-fill when the customer already reviewed
  // this product, otherwise pre-select the star they clicked.
  const openReviewModal = (order, item, starValue) => {
    const existing = item.review || null;
    setReviewError('');
    setReviewModal({
      orderId: order._id,
      item,
      existing: !!existing,
      rating: existing?.rating || starValue || 0,
      title: existing?.title || '',
      comment: existing?.comment || '',
    });
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewModal) return;

    if (!reviewModal.rating) {
      setReviewError('Please select a star rating between 1 and 5.');
      return;
    }
    if (!reviewModal.title.trim() || !reviewModal.comment.trim()) {
      setReviewError('Please add a review headline and your feedback.');
      return;
    }

    setSubmittingReview(true);
    setReviewError('');
    try {
      await apiSubmitReview({
        productId: reviewModal.item.productId,
        orderId: reviewModal.orderId,
        rating: reviewModal.rating,
        title: reviewModal.title.trim(),
        comment: reviewModal.comment.trim(),
        name: user?.name,
      });

      setReviewModal(null);
      showOrderMsg('Thank you! Your review has been submitted successfully.');

      // Refresh orders so the freshly saved review shows next to the product.
      const data = await apiGetMyOrders();
      setOrders(data.orders || []);
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Cancel order handler (allowed when status is pending or accepted)
  const handleCancelOrder = async (order) => {
    const st = (order.status || '').toLowerCase();
    if (!['pending', 'accepted', 'accept'].includes(st)) {
      showOrderMsg('This order cannot be cancelled at this stage.');
      return;
    }

    const orderRef = order.orderNumber || order._id || 'ORD';
    const confirmCancel = window.confirm(`Are you sure you want to cancel order #${orderRef}?`);
    if (!confirmCancel) return;

    setCancellingOrderId(order._id);
    try {
      await apiCancelOrder(order._id, order.waybill);
      showOrderMsg(`Order #${orderRef} has been cancelled successfully.`);
      const data = await apiGetMyOrders();
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Cancel order error:', err);
      showOrderMsg(err.message || 'Failed to cancel order.');
    } finally {
      setCancellingOrderId(null);
    }
  };

  // Return order handler (allowed only when status is delivered)
  const handleReturnClick = (order) => {
    const st = (order.status || '').toLowerCase();
    if (st !== 'delivered') {
      showOrderMsg('Return is only permitted once order is delivered.');
      return;
    }

    setReturnModalOrder(order);
    setCodBankForm({
      accountHolderName: user?.name || '',
      bankName: '',
      accountNumber: '',
      confirmAccountNumber: '',
      ifscCode: '',
      accountType: 'Savings',
      reason: 'Defective / Damaged Item',
    });
    setCodBankErrors({});
    setShowReturnModal(true);
  };

  // Return Form Submit (Handles both COD and Prepaid / Online orders)
  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!returnModalOrder) return;

    const isCod = (returnModalOrder.payment?.method || '').toLowerCase() === 'cod';
    let submissionData = null;

    if (isCod) {
      const errors = {};
      const accName = codBankForm.accountHolderName.trim();
      const bank = codBankForm.bankName.trim();
      const accNum = codBankForm.accountNumber.trim();
      const confAccNum = codBankForm.confirmAccountNumber.trim();
      const ifsc = codBankForm.ifscCode.trim().toUpperCase();

      if (!accName) {
        errors.accountHolderName = 'Account holder name is required';
      }
      if (!bank) {
        errors.bankName = 'Bank name is required';
      }
      if (!accNum) {
        errors.accountNumber = 'Account number is required';
      } else if (!/^\d{8,20}$/.test(accNum)) {
        errors.accountNumber = 'Enter a valid bank account number (8–20 digits)';
      }
      if (!confAccNum) {
        errors.confirmAccountNumber = 'Please confirm your account number';
      } else if (confAccNum !== accNum) {
        errors.confirmAccountNumber = 'Account numbers do not match';
      }
      if (!ifsc) {
        errors.ifscCode = 'IFSC code is required';
      } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(ifsc)) {
        errors.ifscCode = 'Invalid IFSC format (e.g., SBIN0001234)';
      }

      if (Object.keys(errors).length > 0) {
        setCodBankErrors(errors);
        return;
      }

      submissionData = {
        orderId: returnModalOrder?._id,
        accountDetails: {
          accountHolderName: accName,
          bankName: bank,
          accountNumber: accNum,
          confirmAccountNumber: confAccNum,
          ifscCode: ifsc,
          accountType: codBankForm.accountType,
        },
        reason: codBankForm.reason,
      };
    } else {
      // Non-COD / Prepaid / Online orders: only reason is required, no bank details
      submissionData = {
        orderId: returnModalOrder?._id,
        reason: codBankForm.reason,
      };
    }

    setSubmittingReturn(true);

    try {
      const result = await apiReturnOrderRequest(submissionData);
      console.log('=== Return Order Response ===', result);

      if (result && result.success !== false) {
        showOrderMsg(result.message || 'Return shipment request created successfully');
        setShowReturnModal(false);

        // Optimistically update order in local state so UI updates immediately
        setOrders((prev) =>
          prev.map((ord) =>
            ord._id === returnModalOrder._id
              ? {
                  ...ord,
                  type: 'return',
                  status: 'cancelled',
                  returnData: {
                    status: 'pending',
                    reason: codBankForm.reason,
                    ...(result.waybill ? { waybill: result.waybill } : {}),
                  },
                }
              : ord
          )
        );

        // Fetch fresh order list from server
        try {
          const freshData = await apiGetMyOrders();
          if (freshData?.orders) {
            setOrders(freshData.orders);
          }
        } catch (fetchErr) {
          console.error('Failed to reload orders:', fetchErr);
        }
      } else {
        // If response comes with success: false
        showOrderMsg(result?.message || 'Failed to submit return request');
      }
    } catch (err) {
      console.error('Return order error:', err);
      showOrderMsg(err.message || 'Failed to submit return request');
    } finally {
      setSubmittingReturn(false);
    }
  };


  // Live Track Order modal state
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [showTrackingModal, setShowTrackingModal] = useState(false);

  const handleOpenTrackingModal = (order) => {
    setTrackingOrder(order);
    setShowTrackingModal(true);
  };

  // Address state & Modal state
  const [addresses, setAddresses] = useState([]);
  const [showAddrModal, setShowAddrModal] = useState(false);
  const [editingAddr, setEditingAddr] = useState(null);
  const [savingAddr, setSavingAddr] = useState(false);
  const [addrForm, setAddrForm] = useState({
    fullName: user?.name || '',
    phone: user?.phone || '',
    street: '',
    locality: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
    label: 'Home',
    isDefault: false,
  });

  const showMsg = (msg) => {
    setAddressSavedNotice(msg);
    setTimeout(() => setAddressSavedNotice(''), 3500);
  };

  const loadAddresses = async () => {
    try {
      const data = await apiGetUserAddresses();
      if (data?.addresses) {
        setAddresses(data.addresses);
      }
    } catch (_) {
      // Fallback to localStorage
      try {
        const saved = localStorage.getItem('shveraa_user_addresses');
        if (saved) setAddresses(JSON.parse(saved));
      } catch {}
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const openAddAddrModal = () => {
    setEditingAddr(null);
    setAddrForm({
      fullName: user?.name || '',
      phone: user?.phone || '',
      street: '',
      locality: '',
      city: '',
      state: 'Maharashtra',
      pincode: '',
      label: 'Home',
      isDefault: addresses.length === 0,
    });
    setShowAddrModal(true);
  };

  const openEditAddrModal = (addr) => {
    setEditingAddr(addr);
    setAddrForm({
      fullName: addr.fullName || addr.name || '',
      phone: addr.phone || '',
      street: addr.street || '',
      locality: addr.locality || '',
      city: addr.city || '',
      state: addr.state || 'Maharashtra',
      pincode: addr.pincode || '',
      label: addr.label || 'Home',
      isDefault: Boolean(addr.isDefault),
    });
    setShowAddrModal(true);
  };

  const handleSaveAddr = async (e) => {
    e.preventDefault();
    setSavingAddr(true);
    try {
      if (editingAddr?._id) {
        const res = await apiUpdateUserAddress(editingAddr._id, addrForm);
        setAddresses(res.addresses);
        showMsg('Address updated successfully!');
      } else {
        const res = await apiAddUserAddress(addrForm);
        setAddresses(res.addresses);
        showMsg('New address added successfully!');
      }
      setShowAddrModal(false);
    } catch (err) {
      showMsg(err.message || 'Failed to save address');
    } finally {
      setSavingAddr(false);
    }
  };

  const handleDeleteAddr = async (addrId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        const res = await apiDeleteUserAddress(addrId);
        setAddresses(res.addresses);
        showMsg('Address deleted.');
      } catch (err) {
        showMsg(err.message || 'Delete failed');
      }
    }
  };

  const handleSetDefaultAddr = async (addrId) => {
    try {
      const res = await apiSetDefaultUserAddress(addrId);
      setAddresses(res.addresses);
      showMsg('Default address updated!');
    } catch (err) {
      showMsg(err.message || 'Update failed');
    }
  };

  // Orders state - fetched from API
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchOrders = async () => {
      setOrdersLoading(true);
      setOrdersError('');
      try {
        const data = await apiGetMyOrders();
        setOrders(data.orders || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setOrdersError(err.message || 'Could not load orders.');
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, [isAuthenticated]);

  const handleTabChange = (tabName) => {
    setSearchParams({ tab: tabName });
  };

  const handleSizeChange = (productId, size) => {
    setSelectedSizes((prev) => ({
      ...prev,
      [productId]: size,
    }));
  };

  const getVariantSizes = (product) => {
    const sizes = product.variants?.[0]?.sizes || product.sizes || [];
    return sizes
      .map((size) => (typeof size === 'object' ? size.size : size))
      .filter(Boolean);
  };

  const getCartSelection = (product, chosenSize) => {
    const variant = product.variants?.[0];
    const firstVariantSize = getVariantSizes(product)[0];

    return {
      size: chosenSize || firstVariantSize || 'Standard',
      options: {
        color: variant?.color || product.selectedColor || product.color || '',
        variantId: variant?._id || variant?.id || variant?.sku || '',
        image: variant?.images?.[0] || variant?.image || product.images?.[0] || product.image || '',
      },
    };
  };

  const handleMoveToBag = async (product) => {
    const id = product._id || product.slug;
    const { size, options } = getCartSelection(product, selectedSizes[id]);
    const price = product.variants[0]?.sizes[0]?.price || product.price
    const added = await addToCart({...product,price}, size, 1, options);

    if (added) {
      toggleWishlist(product);
      if (showToast) {
        showToast(`Moved "${product.name}" to your shopping bag!`);
      }
    }
  };

  const handleMoveAllToBag = async () => {
    if (!wishlist || wishlist.length === 0) return;
    const movedProducts = [];
    console.log(wishlist)
    for (const product of wishlist) {
      
      const id = product._id || product.slug;
      const { size, options } = getCartSelection(product, selectedSizes[id]);
    const price = product.variants[0]?.sizes[0]?.price || product.price

      const added = await addToCart({...product,price}, size, 1, { ...options, silent: true });
      if (added) movedProducts.push(product);
    }
    movedProducts.forEach((product) => toggleWishlist(product));
    if (movedProducts.length > 0 && showToast) {
      showToast('All preserved silhouettes moved to your shopping bag!');
    }
  };

  const handleClearWishlist = () => {
    if (window.confirm('Are you sure you want to clear all preserved pieces from your wishlist?')) {
      [...wishlist].forEach((p) => toggleWishlist(p));
      if (showToast) {
        showToast('Wishlist cleared.');
      }
    }
  };

  const copyOrderId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedOrderId(id);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const [generatingInvoiceId, setGeneratingInvoiceId] = useState(null);

  const handleDownloadInvoice = async (order) => {
    const ref = order?.orderNumber || order?._id || 'ORD';
    try {
      setGeneratingInvoiceId(ref);
      await downloadOrderInvoicePDF(order, user);
    } catch (err) {
      console.error('Invoice download failed:', err);
    } finally {
      setGeneratingInvoiceId(null);
    }
  };

  const handleUpdateProfileSubmit = async(e) => {
    e.preventDefault();
    // Print the Profile form's entered values only on submit.
    const formData = Object.fromEntries(new FormData(e.target))
    const result = await apiUserChangePasswordandDetails(formData)
    setErrormessage(result.message)
    if(result.success){
      const userData = JSON.parse(localStorage.getItem("shveraa_user"))
      userData.name = formData.name
      userData.phone = formData.phone
      localStorage.setItem("shveraa_user",JSON.stringify(userData))
       form.name.value = formData.name;
        form.phone.value = formData.phone;
    }
    setPasswordSavedNotice(true);
       e.target.reset();
    setTimeout(() => setPasswordSavedNotice(false), 3000);
  };

  const handlePasswordSubmit = async(e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target));
    if(formData.newPassword !== formData.confirmPassword){
        setErrormessage("NewPassword And ConfirmPassword Not Match ")
        return
    }
    setPasswordSavedNotice(true);

    if (formData.newPassword.length < 8) {
    setErrormessage("Password must be at least 8 characters");
    return;
}

if (!/[A-Z]/.test(formData.newPassword)) {
    setErrormessage("Password must contain at least one uppercase letter");
    return;
}

if (!/[a-z]/.test(formData.newPassword)) {
    setErrormessage("Password must contain at least one lowercase letter");
    return;
}

if (!/[0-9]/.test(formData.newPassword)) {
    setErrormessage("Password must contain at least one number");
    return;
}

if (!/[!@#$%^&*]/.test(formData.newPassword)) {
    setErrormessage("Password must contain at least one special character");
    return;
}
   const result = await apiUserChangePasswordandDetails(formData)
    
    setErrormessage(result.message)
    setPasswordSavedNotice(true);
       e.target.reset();
    setTimeout(() => setPasswordSavedNotice(false), 3000);
  };

  if (!isAuthenticated) {
    return (
      <div className="shv-account-auth-gate">
        <div className="container">
          {/* Breadcrumb */}
          <div className="shv-account-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Atelier Vault</span>
          </div>

          <div className="shv-auth-gate-wrapper">
            {/* Main Luxury Auth Gate Card */}
            <div className="shv-auth-gate-card">
              <div className="shv-gate-emblem-wrap">
                <div className="shv-gate-emblem-glow" />
                <div className="shv-gate-emblem">
                  <Sparkles size={28} />
                </div>
              </div>

              <div className="shv-gate-pill">
                <span>✦ Private Atelier Access • BIS 925 Hallmark</span>
              </div>

              <h1 className="shv-gate-title">Sign In to Your Private Curation</h1>
              <p className="shv-gate-desc">
                Welcome to your Shveraa Atelier sanctuary. Access real-time Delhivery express tracking, BIS 925 hallmarked authenticity records, saved delivery addresses, and private silver member privileges.
              </p>

              <div className="shv-gate-cta-group">
                <Link to="/login?redirect=/account" className="btn btn-primary btn-lg shv-gate-btn-primary">
                  Sign In to Atelier <ArrowRight size={16} />
                </Link>
                <Link to="/register?redirect=/account" className="btn btn-outline btn-lg shv-gate-btn-secondary">
                  Create an Account
                </Link>
              </div>

              <div className="shv-gate-browse-link">
                <span>Looking to explore first?</span>{' '}
                <Link to="/shop">Browse 925 Silver Collections &rarr;</Link>
              </div>
            </div>

            {/* Privilege Highlights Grid */}
            <div className="shv-gate-privileges-grid">
              <div className="shv-gate-privilege-card">
                <div className="shv-privilege-icon">
                  <Truck size={20} />
                </div>
                <div className="shv-privilege-content">
                  <h4>Insured Delhivery Express</h4>
                  <p>Live GPS telemetry, OTP verification, and insured tamper-proof courier transit across India.</p>
                </div>
              </div>

              <div className="shv-gate-privilege-card">
                <div className="shv-privilege-icon">
                  <ShieldCheck size={20} />
                </div>
                <div className="shv-privilege-content">
                  <h4>BIS 925 Hallmark Guarantee</h4>
                  <p>Authenticity records and purity documentation preserved for all your heirloom acquisitions.</p>
                </div>
              </div>

              <div className="shv-gate-privilege-card">
                <div className="shv-privilege-icon">
                  <RotateCcw size={20} />
                </div>
                <div className="shv-privilege-content">
                  <h4>2–3 Day Doorstep Returns</h4>
                  <p>Hassle-free reverse pickups, quick size swaps, and transparent status tracking with zero friction.</p>
                </div>
              </div>

              <div className="shv-gate-privilege-card">
                <div className="shv-privilege-icon">
                  <Heart size={20} />
                </div>
                <div className="shv-privilege-content">
                  <h4>Curated Silver Wishlist</h4>
                  <p>Save your favorite rings, necklaces, and bespoke pieces across devices with instantaneous sync.</p>
                </div>
              </div>
            </div>

            {/* Bottom Security / Trust Footer */}
            <div className="shv-gate-trust-bar">
              <div className="shv-gate-trust-item">
                <Lock size={14} />
                <span>256-Bit Encrypted Patron Vault</span>
              </div>
              <span className="shv-trust-dot">•</span>
              <div className="shv-gate-trust-item">
                <Sparkles size={14} />
                <span>100% Solid 925 Sterling Silver</span>
              </div>
              <span className="shv-trust-dot">•</span>
              <div className="shv-gate-trust-item">
                <Phone size={14} />
                <span>Concierge: +91 99980 46559</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shv-account-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="shv-account-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Atelier Account</span>
        </div>

        {/* Member Header Card */}
        <div className="shv-account-hero-card">
          <div className="shv-account-profile-main">
            <div className="shv-account-avatar">
              <span>{user?.name?.charAt(0).toUpperCase() || 'S'}</span>
            </div>
            <div className="shv-account-name-block">
              <div className="shv-member-tag">
                <Sparkles size={12} />
                <span>Atelier Silver Connoisseur • Tier I</span>
              </div>
              <h1 className="shv-account-name">{user?.name || 'Valued Patron'}</h1>
              <div className="shv-account-contacts">
                <span>
                  <Mail size={14} /> {user?.email || 'patron@shveraa.luxury'}
                </span>
                <span>
                  <Phone size={14} /> {user?.phone || '+91 99980 46559'}
                </span>
                <span>
                  <ShieldCheck size={14} /> Certified 925 Patron
                </span>
              </div>
            </div>
          </div>

          <div className="shv-account-stats-pills">
            <div className="shv-stat-pill">
              <span className="shv-stat-label">Total Curations</span>
              <strong className="shv-stat-val">{orders.length} Orders</strong>
            </div>
            <div className="shv-stat-pill">
              <span className="shv-stat-label">Purity Covenant</span>
              <strong className="shv-stat-val">100% 925 BIS</strong>
            </div>
            <div className="shv-stat-pill">
              <span className="shv-stat-label">Atelier Care</span>
              <strong className="shv-stat-val">Lifetime Free</strong>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="shv-account-tabs-bar">
          <button
            type="button"
            className={`shv-acc-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => handleTabChange('orders')}
          >
            <Package size={17} />
            <span>My Orders &amp; Dispatches</span>
            <span className="shv-acc-tab-count">{orders.length}</span>
          </button>

          <button
            type="button"
            className={`shv-acc-tab-btn ${activeTab === 'addresses' ? 'active' : ''}`}
            onClick={() => handleTabChange('addresses')}
          >
            <MapPin size={17} />
            <span>Saved Addresses</span>
          </button>

          <button
            type="button"
            className={`shv-acc-tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
            onClick={() => handleTabChange('wishlist')}
          >
            <Heart size={17} />
            <span>Curated Wishlist</span>
            {wishlistCount > 0 && <span className="shv-acc-tab-count">{wishlistCount}</span>}
          </button>

          <button
            type="button"
            className={`shv-acc-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => handleTabChange('security')}
          >
            <Lock size={17} />
            <span>Profile &amp; Security</span>
          </button>

          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="shv-acc-tab-btn shv-acc-logout-tab"
            title="Sign Out of Atelier"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
        {/* Tab 1: Orders Content */}
        {activeTab === 'orders' && (
          <div className="shv-orders-tab-view">
            {orderNotice && (
              <div className="shv-alert-notice" style={{ marginBottom: '1.25rem' }}>
                <CheckCircle2 size={16} />
                <span>{orderNotice}</span>
              </div>
            )}
            {ordersLoading ? (
              <div className="shv-orders-empty-state">
                <ShoppingBag size={44} className="shv-empty-icon" style={{ opacity: 0.4 }} />
                <h3 style={{ opacity: 0.6 }}>Loading your orders…</h3>
                <p style={{ opacity: 0.5 }}>Fetching your Atelier consignments from our server.</p>
              </div>
            ) : ordersError ? (
              <div className="shv-orders-empty-state">
                <ShoppingBag size={44} className="shv-empty-icon" />
                <h3>Could not load orders</h3>
                <p>{ordersError}</p>
                <button className="btn btn-primary" onClick={() => { setOrdersError(''); apiGetMyOrders().then(d => setOrders(d.orders || [])).catch(e => setOrdersError(e.message)); }}>
                  Retry
                </button>
              </div>
            ) : orders.length === 0 ? (
              <div className="shv-orders-empty-state">
                <ShoppingBag size={44} className="shv-empty-icon" />
                <h3>No Atelier Orders Yet</h3>
                <p>You haven't acquired any certified 925 sterling silver pieces yet.</p>
                <Link to="/shop" className="btn btn-primary">
                  Explore Current Collection <ArrowRight size={15} />
                </Link>
              </div>
            ) : (
              <div className="shv-orders-list">
                {orders.map((order, idx) => {
                  const orderRef = order.orderNumber || order._id || `ORD-${idx}`;
                  const placedDate = order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString('en-GB')
                    : '—';
                  const isReturned = order.type === 'return' || !!order.returnData;
                  const isDelivered = (order.status || '').toLowerCase() === 'delivered';
                  const addrObj = order.address || {};
                  const addressLine = [
                    addrObj.addressline || addrObj.street,
                    addrObj.city,
                    addrObj.state,
                    addrObj.pincode,
                  ].filter(Boolean).join(', ');
                  const paymentStatus = order.payment?.status || 'pending';

                  return (
                    <div key={order._id || idx} className="shv-order-card">
                      {/* Order Header */}
                      <div className="shv-order-header">
                        <div className="shv-order-header-left">
                          <div className="shv-order-id-wrap">
                            <span className="shv-order-label">Order Ref:</span>
                            <strong>{orderRef}</strong>
                            <button
                              type="button"
                              onClick={() => copyOrderId(orderRef)}
                              className="shv-copy-mini-btn"
                              title="Copy Order ID"
                            >
                              {copiedOrderId === orderRef ? (
                                <Check size={13} color="#10B981" />
                              ) : (
                                <Copy size={13} />
                              )}
                            </button>
                          </div>
                          <span className="shv-order-meta-dot">•</span>
                          <span className="shv-order-date">
                            <Clock size={13} /> Placed on {placedDate}
                          </span>
                        </div>

                        <div className="shv-order-header-right">
                          <span
                            className={`shv-order-status-badge ${
                              isReturned ? 'returned' : isDelivered ? 'delivered' : 'in-transit'
                            }`}
                          >
                            <span className="shv-status-dot" />
                            {isReturned ? 'Return Requested' : (order.status || 'pending')}
                          </span>
                        </div>
                      </div>

                      {/* BlueDart Tracking Bar */}
                      <div className="shv-order-tracking-strip">
                        <div className="shv-tracking-info">
                          <Truck size={16} className="shv-truck-icon" />
                          <div>
                            <strong>BlueDart Air Express (Insured)</strong>
                            <span>
                              {order.returnData?.waybill
                                ? `Return Waybill: ${order.returnData.waybill}`
                                : order.waybill
                                ? `Waybill: ${order.waybill}`
                                : 'Awaiting pickup'}{' '}
                              • Est. Delivery: 2–4 Business Days
                            </span>
                          </div>
                        </div>
                        <div className="shv-tracking-actions">
                          {/* Print Invoice - Only show when order is delivered or returned */}
                          {(isDelivered || isReturned) && (
                            <button
                              type="button"
                              onClick={() => handleDownloadInvoice(order)}
                              disabled={generatingInvoiceId === orderRef}
                              className="shv-order-action-link"
                              title="Download certified official Tax Invoice PDF"
                            >
                              {generatingInvoiceId === orderRef ? (
                                <>
                                  <RefreshCw size={14} className="shv-spin-icon" style={{ margin: 0 }} />
                                  <span>Generating...</span>
                                </>
                              ) : (
                                <>
                                  <Printer size={14} />
                                  <span>Print Invoice</span>
                                </>
                              )}
                            </button>
                          )}

                          {/* Live Track - Only show for active in-transit orders (not delivered, cancelled, returned) */}
                          {!isDelivered && !isReturned && !['cancelled', 'delivered'].includes((order.status || '').toLowerCase()) && (
                            <button
                              type="button"
                              onClick={() => handleOpenTrackingModal(order)}
                              className="shv-order-action-link"
                              title="Live Track Consignment Telemetry"
                            >
                              <Truck size={14} />
                              <span>Live Track</span>
                            </button>
                          )}

                          {/* Cancel Button - Only visible when order status is pending or accepted and not returned */}
                          {!isReturned && ['pending', 'accepted', 'accept'].includes((order.status || '').toLowerCase()) && (
                            <button
                              type="button"
                              onClick={() => handleCancelOrder(order)}
                              disabled={cancellingOrderId === (order._id || order.orderNumber)}
                              className="shv-order-action-link cancel-btn"
                              title="Cancel Order"
                            >
                              {cancellingOrderId === (order._id || order.orderNumber) ? (
                                <>
                                  <RefreshCw size={14} className="shv-spin-icon" style={{ margin: 0 }} />
                                  <span>Cancelling...</span>
                                </>
                              ) : (
                                <>
                                  <Trash size={14} />
                                  <span>Cancel</span>
                                </>
                              )}
                            </button>
                          )}

                          {/* Return Button - Only visible when order status is delivered and return not requested yet */}
                          {isDelivered && !isReturned && (
                            <button
                              type="button"
                              onClick={() => handleReturnClick(order)}
                              className="shv-order-action-link return-btn"
                              title="Return Order"
                            >
                              <RotateCcw size={14} />
                              <span>Return</span>
                            </button>
                          )}

                          {/* Return Requested Indicator */}
                          {isReturned && (
                            <span
                              className="shv-order-action-link"
                              style={{
                                cursor: 'default',
                                color: '#1E40AF',
                                background: '#EFF6FF',
                                padding: '4px 10px',
                                borderRadius: '4px',
                                border: '1px solid #BFDBFE',
                                fontWeight: 600,
                              }}
                              title="Return request submitted"
                            >
                              <RotateCcw size={14} />
                              <span>Return Requested</span>
                            </span>
                          )}
                        </div>
                      </div>


                      {/* Items List */}
                      <div className="shv-order-items-grid">
                        {order.items?.map((item, itemIdx) => (
                          <div key={itemIdx} className="shv-order-item-card">
                            <div className="shv-order-item-img-wrap">
                              <img
                                src={getImageUrl(item.image) || '/hero-ring-banner.jpg'}
                                alt={item.name}
                                onError={(e) => {
                                  e.currentTarget.src = '/hero-ring-banner.jpg';
                                }}
                              />
                            </div>
                            <div className="shv-order-item-info">
                              <h4>{item.name}</h4>
                              <div className="shv-order-item-meta">
                                {item.color && <span>{item.color} • </span>}
                                <span>Size: {item.size || 'Free Size'}</span>
                                <span>•</span>
                                <span>Qty: {item.quantity || 1}</span>
                                <span className="shv-bis-tag">925 BIS</span>
                              </div>
                              <div className="shv-order-item-price">
                                ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                              </div>
                            </div>

                            {/* Star Rating — right side of the product row.
                                Stars are clickable only for DELIVERED orders
                                (or when a review already exists to edit). */}
                            <div className="shv-order-item-rating">
                              <div className="shv-order-star-row">
                                {[1, 2, 3, 4, 5].map((star) => {
                                  const existingRating = item.review?.rating || 0;
                                  const canReview = (isDelivered && !isReturned) || existingRating > 0;
                                  return (
                                    <button
                                      key={star}
                                      type="button"
                                      className={`shv-order-star-btn${canReview ? '' : ' disabled'}`}
                                      disabled={!canReview}
                                      onClick={() => canReview && openReviewModal(order, item, star)}
                                      title={
                                        !canReview
                                          ? 'Review can be written only after delivery'
                                          : existingRating > 0
                                          ? 'Edit your review'
                                          : `Rate ${star} star${star > 1 ? 's' : ''}`
                                      }
                                      aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                    >
                                      <Star
                                        size={17}
                                        fill={star <= existingRating ? '#A07E52' : 'none'}
                                        color={star <= existingRating ? '#A07E52' : '#C9BFB2'}
                                      />
                                    </button>
                                  );
                                })}
                              </div>
                              <span
                                className={`shv-order-rating-label${
                                  item.review ? ' reviewed' : ''
                                }`}
                              >
                                {item.review
                                  ? `Your Review (${item.review.rating}★)`
                                  : isDelivered && !isReturned
                                  ? 'Rate this product'
                                  : 'Review after delivery'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Order Footer & Destination */}
                      <div className="shv-order-footer">
                        <div className="shv-order-destination">
                          <MapPin size={15} />
                          <div>
                            <span className="shv-dest-label">Delivery Destination:</span>
                            <span className="shv-dest-addr">
                              {addressLine || 'Address recorded'}
                            </span>
                          </div>
                        </div>

                        <div className="shv-order-totals-block">
                          <div className="shv-order-final-paid">
                            <span className="shv-paid-label">
                              Total Amount {paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                            </span>
                            <span className="shv-paid-val">
                              ₹{Number(order.totalAmount || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <span className="shv-tax-inc">Inclusive of All GST &amp; Insurance</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Saved Addresses */}
        {activeTab === 'addresses' && (
          <div className="shv-addresses-tab-view">
            {/* Success / Error Notice */}
            {addressSavedNotice && (
              <div className="shv-alert-notice">
                <CheckCircle2 size={16} />
                <span>{addressSavedNotice}</span>
              </div>
            )}

            {/* Addresses Grid */}
            <div className="shv-addresses-grid">
              {addresses.length === 0 && (
                <div className="shv-addr-empty-state">
                  <MapPin size={36} className="shv-empty-icon" />
                  <h3>No Saved Addresses</h3>
                  <p>Add your first delivery address to speed up checkout.</p>
                </div>
              )}

              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  className={`shv-address-card${addr.isDefault ? ' default' : ''}`}
                >
                  <div className="shv-addr-badge-row">
                    <span className="shv-addr-type-pill">{addr.label || 'Home'}</span>
                    {addr.isDefault && <ShieldCheck size={15} color="#10B981" />}
                    {addr.isDefault && <span className="shv-addr-default-tag">Default</span>}
                  </div>
                  <h3 className="shv-addr-name">{addr.fullName}</h3>
                  <p className="shv-addr-phone">
                    <Phone size={13} /> {addr.phone}
                  </p>
                  <p className="shv-addr-text">
                    {addr.street}
                    {addr.locality ? `, ${addr.locality}` : ''},<br />
                    {addr.city}, {addr.state} — <strong>{addr.pincode}</strong>
                  </p>
                  <div className="shv-addr-actions">
                    {!addr.isDefault && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleSetDefaultAddr(addr._id)}
                        title="Set as default address"
                      >
                        <CheckCircle2 size={13} /> Set Default
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => openEditAddrModal(addr)}
                    >
                      <Edit3 size={13} /> Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger-ghost btn-sm"
                      onClick={() => handleDeleteAddr(addr._id)}
                    >
                      ✕ Delete
                    </button>
                  </div>
                </div>
              ))}

              {/* Add New Address Card */}
              <div className="shv-address-add-card" onClick={openAddAddrModal}>
                <div className="shv-add-icon-circle">
                  <Plus size={24} />
                </div>
                <h4>Add New Delivery Address</h4>
                <p>Save home, workplace, or a gifting recipient address.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Curated Wishlist Content */}
        {activeTab === 'wishlist' && (
          <div className="shv-wishlist-tab-view">
            {wishlist.length === 0 ? (
              <div className="shv-orders-empty-state">
                <Heart size={44} className="shv-empty-icon" style={{ opacity: 0.4 }} />
                <h3>Your Atelier Wishlist is Empty</h3>
                <p>Preserve your favorite 925 sterling silver silhouettes to review or acquire whenever you're ready.</p>
                <Link to="/shop" className="btn btn-primary">
                  Explore 925 Silver Creations <ArrowRight size={15} />
                </Link>
              </div>
            ) : (
              <>
                {/* Wishlist Actions Toolbar */}
                <div className="shv-wishlist-toolbar">
                  <div className="shv-wishlist-toolbar-info">
                    <span className="shv-wishlist-counter-badge">
                      <strong>{wishlist.length}</strong> {wishlist.length === 1 ? 'Design' : 'Designs'} in Vault
                    </span>
                    <span className="shv-wishlist-stock-status">
                      ✦ Complimentary Insured Express Shipping on All Silver Pieces
                    </span>
                  </div>

                  <div className="shv-wishlist-toolbar-actions">
                    <button
                      type="button"
                      onClick={handleMoveAllToBag}
                      className="btn btn-primary btn-sm shv-wishlist-bulk-btn"
                    >
                      <ShoppingBag size={14} />
                      <span>Move All to Bag</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleClearWishlist}
                      className="shv-wishlist-clear-btn"
                    >
                      <Trash size={13} />
                      <span>Clear Wishlist</span>
                    </button>
                  </div>
                </div>

                {/* 4-Column Responsive Grid */}
                <div className="shv-shop-products-grid col-4" style={{ marginTop: '1.5rem' }}>
                  {wishlist.map((product) => {
                    const prodId = product._id || product.slug;
                    const variantSizes = getVariantSizes(product);
                    const currentSize = selectedSizes[prodId] || variantSizes[0] || 'Standard';
                    const firstVariant = product.variants?.[0];
                    const rawPrimary =
                      firstVariant?.images?.[0] ||
                      (product.images && product.images[0]) ||
                      product.image ||
                      '/hero-ring-banner.jpg';
                    const imageSrc = getImageUrl(rawPrimary) || '/hero-ring-banner.jpg';

                    const rawSecondary =
                      firstVariant?.images?.[1] ||
                      (product.images && product.images[1]) ||
                      rawPrimary;
                    const secondaryImg = getImageUrl(rawSecondary) || imageSrc;

                    return (
                      <div key={prodId} className="shv-wishlist-item-card">
                        {/* Card Media with Smooth Image Stack */}
                        <div className="product-image-container loaded">
                          <Link
                            to={`/product/${product.slug || product._id}`}
                            className="product-image-link"
                          >
                            <div className="product-image-stack">
                              <img
                                src={imageSrc}
                                alt={product.name}
                                loading="lazy"
                                className="product-main-img product-img-primary loaded"
                                onLoad={(e) => {
                                  e.currentTarget.classList.add('loaded');
                                  e.currentTarget.closest('.product-image-container')?.classList.add('loaded');
                                }}
                                onError={(e) => {
                                  e.currentTarget.src = '/hero-ring-banner.jpg';
                                  e.currentTarget.classList.add('loaded');
                                  e.currentTarget.closest('.product-image-container')?.classList.add('loaded');
                                }}
                              />
                              {secondaryImg && secondaryImg !== imageSrc && (
                                <img
                                  src={secondaryImg}
                                  alt={`${product.name} Alternate`}
                                  loading="lazy"
                                  className="product-main-img product-img-secondary"
                                />
                              )}
                            </div>
                          </Link>

                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() => toggleWishlist(product)}
                            className="shv-wishlist-remove-btn"
                            title="Remove from wishlist"
                            aria-label={`Remove ${product.name} from wishlist`}
                          >
                            <Trash size={15} />
                          </button>

                          {/* Hallmarks Badge Stack */}
                          <div className="product-badges-stack">
                            {product.badge && !/atelier/i.test(product.badge) && (
                              <span className="product-badge product-badge-silver">
                                {product.badge}
                              </span>
                            )}
                            <span className="product-hallmark-tag">925 BIS</span>
                          </div>
                        </div>

                        {/* Card Content & Details */}
                        <div className="shv-wishlist-card-body">
                          <div className="shv-wishlist-card-info">
                            <span className="shv-wishlist-cat-label">
                              {product.category ? product.category.toUpperCase() : '925 STERLING SILVER'}
                            </span>
                            <h3 className="shv-wishlist-prod-title">
                              <Link to={`/product/${product.slug || product._id}`}>
                                {product.name}
                              </Link>
                            </h3>

                            <div className="shv-wishlist-price-row">
                              <span className="shv-wishlist-price">
                                ₹{(() => {
                                  const sizeObj = firstVariant?.sizes?.find?.(s => (typeof s === 'object' ? s.size : s) === currentSize) ||
                                    firstVariant?.sizes?.[0];
                                  const variantPrice = typeof sizeObj === 'object' ? sizeObj.price : null;
                                  return (variantPrice || product.price || product.salePrice || 0).toLocaleString('en-IN');
                                })()}
                              </span>
                              {Boolean(product.originalPrice && Number(product.originalPrice) > Number(
                                (() => {
                                  const sizeObj = firstVariant?.sizes?.find?.(s => (typeof s === 'object' ? s.size : s) === currentSize) ||
                                    firstVariant?.sizes?.[0];
                                  const variantPrice = typeof sizeObj === 'object' ? sizeObj.price : null;
                                  return variantPrice || product.price || product.salePrice || 0;
                                })()
                              )) && (
                                <span className="shv-wishlist-orig-price">
                                  ₹{Number(product.originalPrice).toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>

                            {/* Size selector if variants exist */}
                            {/* {variantSizes.length > 1 && (
                              <div className="shv-wishlist-size-row">
                                <span className="shv-wishlist-size-label">Size:</span>
                                <div className="shv-wishlist-size-pills">
                                  {variantSizes.map((size) => (
                                    <button
                                      key={size}
                                      type="button"
                                      onClick={() => handleSizeChange(prodId, size)}
                                      className={`shv-wishlist-size-pill ${currentSize === size ? 'active' : ''}`}
                                    >
                                      {size}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )} */}
                          </div>

                          {/* Move to Bag Action Button */}
                          <button
                            type="button"
                            onClick={() => handleMoveToBag(product, currentSize)}
                            className="btn btn-primary btn-sm shv-wishlist-add-btn"
                          >
                            <ShoppingBag size={14} />
                            <span>Move to Bag • ₹{(() => {
                              const sizeObj = firstVariant?.sizes?.find?.(s => (typeof s === 'object' ? s.size : s) === currentSize) ||
                                firstVariant?.sizes?.[0];
                              const variantPrice = typeof sizeObj === 'object' ? sizeObj.price : null;
                              return (variantPrice || product.price || product.salePrice || 0).toLocaleString('en-IN');
                            })()}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Address Modal */}
        {showAddrModal && (
          <div className="shv-modal-overlay" onClick={() => setShowAddrModal(false)}>
            <div className="shv-modal-card shv-addr-modal" onClick={(e) => e.stopPropagation()}>
              <div className="shv-modal-header">
                <h3>{editingAddr ? 'Edit Address' : 'Add New Address'}</h3>
                <button
                  type="button"
                  className="shv-modal-close-btn"
                  onClick={() => setShowAddrModal(false)}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveAddr} className="shv-addr-modal-form">
                {/* Label selector */}
                <div className="shv-addr-label-pills">
                  {['Home', 'Work', 'Other'].map((lbl) => (
                    <button
                      key={lbl}
                      type="button"
                      className={`shv-label-pill${addrForm.label === lbl ? ' active' : ''}`}
                      onClick={() => setAddrForm((f) => ({ ...f, label: lbl }))}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>

                <div className="shv-form-row">
                  <div className="shv-input-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Recipient full name"
                      value={addrForm.fullName}
                      onChange={(e) => setAddrForm((f) => ({ ...f, fullName: e.target.value }))}
                    />
                  </div>
                  <div className="shv-input-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="10-digit mobile"
                      value={addrForm.phone}
                      onChange={(e) => setAddrForm((f) => ({ ...f, phone: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="shv-input-group">
                  <label>Street Address, Flat / House No. *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 402, Lotus Heritage, Linking Road"
                    value={addrForm.street}
                    onChange={(e) => setAddrForm((f) => ({ ...f, street: e.target.value }))}
                  />
                </div>

                <div className="shv-input-group">
                  <label>Locality / Area (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Bandra West"
                    value={addrForm.locality}
                    onChange={(e) => setAddrForm((f) => ({ ...f, locality: e.target.value }))}
                  />
                </div>

                <div className="shv-form-row-3">
                  <div className="shv-input-group">
                    <label>City *</label>
                    <input
                      type="text"
                      required
                      placeholder="Mumbai"
                      value={addrForm.city}
                      onChange={(e) => setAddrForm((f) => ({ ...f, city: e.target.value }))}
                    />
                  </div>
                  <div className="shv-input-group">
                    <label>State *</label>
                    <select
                      value={addrForm.state}
                      onChange={(e) => setAddrForm((f) => ({ ...f, state: e.target.value }))}
                      required
                    >
                      {['Maharashtra','Gujarat','Delhi','Karnataka','Tamil Nadu','Rajasthan','Uttar Pradesh','Telangana','West Bengal','Other'].map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="shv-input-group">
                    <label>PIN Code *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="400050"
                      value={addrForm.pincode}
                      onChange={(e) => setAddrForm((f) => ({ ...f, pincode: e.target.value }))}
                    />
                  </div>
                </div>

                <label className="shv-default-checkbox-row">
                  <input
                    type="checkbox"
                    checked={addrForm.isDefault}
                    onChange={(e) => setAddrForm((f) => ({ ...f, isDefault: e.target.checked }))}
                  />
                  <span>Set as default delivery address</span>
                </label>

                <div className="shv-modal-footer">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => setShowAddrModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={savingAddr}>
                    {savingAddr ? 'Saving…' : editingAddr ? 'Update Address' : 'Save Address'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Live Delhivery Tracking Modal */}
        <OrderTrackingModal
          order={trackingOrder}
          isOpen={showTrackingModal}
          onClose={() => {
            setShowTrackingModal(false);
            setTrackingOrder(null);
          }}
        />

        {/* Product Review Popup — opens when a star is clicked on an order item */}
        {reviewModal && (
          <div className="shv-modal-backdrop" onClick={() => !submittingReview && setReviewModal(null)}>
            <div className="shv-review-modal-card" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => setReviewModal(null)}
                className="shv-modal-close-btn"
                aria-label="Close review popup"
                disabled={submittingReview}
              >
                <X size={18} />
              </button>

              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '4px', color: '#1A1612' }}>
                {reviewModal.existing ? 'Edit Your Review' : 'Write a Review'}
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#716960', marginBottom: '14px' }}>
                {reviewModal.item?.name} — Order #{reviewModal.orderId?.slice(-6)}
              </p>

              <form onSubmit={handleSubmitReview}>
                {/* Star Picker */}
                <div>
                  <span className="shv-form-label">Your Rating</span>
                  <div className="shv-star-picker">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewModal((prev) => ({ ...prev, rating: star }))}
                        className="shv-star-pick-btn"
                        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                      >
                        <Star
                          size={26}
                          fill={star <= reviewModal.rating ? '#A07E52' : 'none'}
                          color={star <= reviewModal.rating ? '#A07E52' : '#D1C7BA'}
                        />
                      </button>
                    ))}
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, marginLeft: '8px', alignSelf: 'center', color: '#A07E52' }}>
                      {reviewModal.rating ? `${reviewModal.rating}.0 Stars` : 'Select rating'}
                    </span>
                  </div>
                </div>

                <div className="shv-form-group">
                  <label className="shv-form-label">Review Headline</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pure silver brilliance, incredible luster!"
                    value={reviewModal.title}
                    onChange={(e) => setReviewModal((prev) => ({ ...prev, title: e.target.value }))}
                    className="shv-form-input"
                  />
                </div>

                <div className="shv-form-group">
                  <label className="shv-form-label">Detailed Review</label>
                  <textarea
                    required
                    placeholder="Tell other collectors about the hand-feel, purity stamp, tarnish resistance, or unboxing..."
                    value={reviewModal.comment}
                    onChange={(e) => setReviewModal((prev) => ({ ...prev, comment: e.target.value }))}
                    className="shv-form-textarea"
                  />
                </div>

                {reviewError && (
                  <p style={{ color: '#E11D48', fontSize: '0.82rem', marginBottom: '10px' }}>
                    {reviewError}
                  </p>
                )}

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px' }}
                  disabled={submittingReview}
                >
                  {submittingReview
                    ? 'Submitting...'
                    : reviewModal.existing
                    ? 'Update Review'
                    : 'Submit Verified Review'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Return & Bank Details Modal */}
        {showReturnModal && returnModalOrder && (() => {
          const isCod = (returnModalOrder.payment?.method || '').toLowerCase() === 'cod';
          return (
            <div className="shv-modal-overlay" onClick={() => setShowReturnModal(false)}>
              <div
                className="shv-modal-card shv-return-modal"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '640px' }}
              >
                <div className="shv-modal-header">
                  <div>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <RotateCcw size={20} color="#A07E52" />
                      <span>{isCod ? 'Return Request & Bank Details' : 'Return Request'}</span>
                    </h3>
                    <span style={{ fontSize: '0.82rem', color: '#72685E' }}>
                      Order Ref: #{returnModalOrder.orderNumber || returnModalOrder._id} • ₹
                      {Number(returnModalOrder.totalAmount || 0).toLocaleString('en-IN')}
                      {' '}({isCod ? 'Cash on Delivery' : 'Online Paid'})
                    </span>
                  </div>
                  <button
                    type="button"
                    className="shv-modal-close-btn"
                    onClick={() => setShowReturnModal(false)}
                  >
                    ✕
                  </button>
                </div>

                {isCod ? (
                  <div className="shv-return-modal-notice">
                    <AlertCircle size={18} color="#A07E52" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <p>
                      Since this was a <strong>Cash on Delivery (COD)</strong> order, please enter your bank account details below. Your refund of <strong>₹{Number(returnModalOrder.totalAmount || 0).toLocaleString('en-IN')}</strong> will be safely transferred via NEFT/IMPS after the returned items are inspected.
                    </p>
                  </div>
                ) : (
                  <div className="shv-return-modal-notice" style={{ background: '#F5FAF7', borderColor: '#2E7D32' }}>
                    <CheckCircle2 size={18} color="#2E7D32" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <p style={{ color: '#1B5E20' }}>
                      Since this order was paid online, no bank details are required. Your refund of <strong>₹{Number(returnModalOrder.totalAmount || 0).toLocaleString('en-IN')}</strong> will be credited directly to your original payment source (UPI/Card/NetBanking) after the returned items are inspected.
                    </p>
                  </div>
                )}

                <form onSubmit={handleReturnSubmit} className="shv-addr-modal-form" style={{ paddingTop: '0.5rem' }}>
                  {isCod && (
                    <>
                      <div className="shv-form-row">
                        <div className="shv-input-group">
                          <label>Account Holder Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="Name as registered with bank"
                            value={codBankForm.accountHolderName}
                            onChange={(e) => {
                              setCodBankForm({ ...codBankForm, accountHolderName: e.target.value });
                              if (codBankErrors.accountHolderName) setCodBankErrors({ ...codBankErrors, accountHolderName: '' });
                            }}
                          />
                          {codBankErrors.accountHolderName && (
                            <span className="shv-field-error">{codBankErrors.accountHolderName}</span>
                          )}
                        </div>

                        <div className="shv-input-group">
                          <label>Bank Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. HDFC Bank, SBI, ICICI"
                            value={codBankForm.bankName}
                            onChange={(e) => {
                              setCodBankForm({ ...codBankForm, bankName: e.target.value });
                              if (codBankErrors.bankName) setCodBankErrors({ ...codBankErrors, bankName: '' });
                            }}
                          />
                          {codBankErrors.bankName && (
                            <span className="shv-field-error">{codBankErrors.bankName}</span>
                          )}
                        </div>
                      </div>

                      <div className="shv-form-row">
                        <div className="shv-input-group">
                          <label>Account Number *</label>
                          <input
                            type="password"
                            required
                            placeholder="Enter bank account number"
                            value={codBankForm.accountNumber}
                            onChange={(e) => {
                              setCodBankForm({ ...codBankForm, accountNumber: e.target.value });
                              if (codBankErrors.accountNumber) setCodBankErrors({ ...codBankErrors, accountNumber: '' });
                            }}
                          />
                          {codBankErrors.accountNumber && (
                            <span className="shv-field-error">{codBankErrors.accountNumber}</span>
                          )}
                        </div>

                        <div className="shv-input-group">
                          <label>Confirm Account Number *</label>
                          <input
                            type="text"
                            required
                            placeholder="Re-enter bank account number"
                            value={codBankForm.confirmAccountNumber}
                            onChange={(e) => {
                              setCodBankForm({ ...codBankForm, confirmAccountNumber: e.target.value });
                              if (codBankErrors.confirmAccountNumber) setCodBankErrors({ ...codBankErrors, confirmAccountNumber: '' });
                            }}
                          />
                          {codBankErrors.confirmAccountNumber && (
                            <span className="shv-field-error">{codBankErrors.confirmAccountNumber}</span>
                          )}
                        </div>
                      </div>

                      <div className="shv-form-row">
                        <div className="shv-input-group">
                          <label>IFSC Code *</label>
                          <input
                            type="text"
                            required
                            maxLength={11}
                            placeholder="e.g. HDFC0001234"
                            value={codBankForm.ifscCode}
                            style={{ textTransform: 'uppercase' }}
                            onChange={(e) => {
                              setCodBankForm({ ...codBankForm, ifscCode: e.target.value.toUpperCase() });
                              if (codBankErrors.ifscCode) setCodBankErrors({ ...codBankErrors, ifscCode: '' });
                            }}
                          />
                          {codBankErrors.ifscCode && (
                            <span className="shv-field-error">{codBankErrors.ifscCode}</span>
                          )}
                        </div>

                        <div className="shv-input-group">
                          <label>Account Type *</label>
                          <select
                            value={codBankForm.accountType}
                            onChange={(e) => setCodBankForm({ ...codBankForm, accountType: e.target.value })}
                          >
                            <option value="Savings">Savings Account</option>
                            <option value="Current">Current Account</option>
                          </select>
                        </div>
                      </div>
                    </>
                  )}

                  <div className="shv-input-group">
                    <label>Reason for Return *</label>
                    <select
                      value={codBankForm.reason}
                      onChange={(e) => setCodBankForm({ ...codBankForm, reason: e.target.value })}
                    >
                      <option value="Defective / Damaged Item">Defective or Damaged Item</option>
                      <option value="Incorrect Size / Fit">Incorrect Size / Fit</option>
                      <option value="Quality not as expected">Silver Quality / Finishing Not as Expected</option>
                      <option value="Received Wrong Item">Received Wrong Item</option>
                      <option value="Changed Mind">Changed Mind</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="shv-modal-footer">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setShowReturnModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      disabled={submittingReturn}
                      style={{ minWidth: '150px' }}
                    >
                      {submittingReturn ? 'Submitting…' : 'Submit Return'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          );
        })()}


        {/* Tab 3: Security & Preferences */}
        {activeTab === 'security' && (
          <div className="shv-security-tab-view">
            {passwordSavedNotice && (
              <div className="shv-alert-notice">
                <CheckCircle2 size={16} />
                <span>{Errormessage ||"Security preferences updated securely!"}</span>
              </div>
            )}

            <div className="shv-security-grid">
              {/* Profile Details */}
              <div className="shv-sec-card">
                <h3 className="shv-sec-title">Personal Particulars</h3>
                <form onSubmit={handleUpdateProfileSubmit} className="shv-sec-form">
                  <div className="form-group">
                    <label>Full Patron Name</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={user?.name || 'Aarav Mehta'}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      disabled
                      defaultValue={user?.email || 'aarav@shveraa.luxury'}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Mobile Number (For WhatsApp Consignment Tracking)</label>
                    <input
                      type="tel"
                      name="phone"
                      defaultValue={user?.phone || '+91 99980 46559'}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-sm">
                    Save Profile Changes
                  </button>
                </form>
              </div>

              {/* Password & Security */}
              <div className="shv-sec-card">
                <h3 className="shv-sec-title">Authentication &amp; Password</h3>
                <form onSubmit={handlePasswordSubmit} className="shv-sec-form">
                  <div className="form-group">
                    <label>Current Password</label>
                    <input type="password" name="currentPassword" placeholder="••••••••" required />
                  </div>
                  <div className="form-group">
                    <label>New Secret Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      placeholder="Minimum 8 characters"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm Secret Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm new password"
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-outline btn-sm">
                    Update Password
                  </button>
                </form>
              </div>
            </div>

            {/* Atelier Notifications */}
            <div className="shv-notifications-card">
              <h3 className="shv-sec-title">Communication &amp; Support Alerts</h3>
              <div className="shv-pref-row">
                <div>
                  <strong>WhatsApp Real-time Consignment Alerts</strong>
                  <p>Receive BlueDart Air tracking link and dispatch confirmation directly on WhatsApp.</p>
                </div>
                <input type="checkbox" defaultChecked className="shv-switch-input" />
              </div>
              <div className="shv-pref-row">
                <div>
                  <strong>Private Vault &amp; Bespoke Drop Invitations</strong>
                  <p>Early 24-hour access to numbered 925 silver limited editions before public release.</p>
                </div>
                <input type="checkbox" defaultChecked className="shv-switch-input" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Account;
