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
  ExternalLink,
  Printer,
  ChevronRight,
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
  User,
  ShoppingBag,
} from 'lucide-react';

const Account = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { wishlistCount } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active tab state: 'orders' | 'addresses' | 'security'
  const initialTab = searchParams.get('tab') || 'orders';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [copiedOrderId, setCopiedOrderId] = useState(null);
  const [addressSavedNotice, setAddressSavedNotice] = useState(false);
  const [passwordSavedNotice, setPasswordSavedNotice] = useState(false);

  // Address state
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      isDefault: true,
      label: 'Primary Atelier Residence',
      name: user?.name || 'Aarav Mehta',
      phone: user?.phone || '+91 98765 43210',
      street: '402, Lotus Heritage, Linking Road',
      locality: 'Near Bandra West Post Office',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
    },
  ]);

  // Orders state - reads from localStorage or seeds realistic default orders
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    try {
      const storedOrders = localStorage.getItem('shveraa_orders');
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      } else {
        const lastOrderStr = localStorage.getItem('shveraa_last_order');
        if (lastOrderStr) {
          setOrders([JSON.parse(lastOrderStr)]);
        } else {
          // Pre-populate with realistic orders for rich immediate display
          setOrders([
            {
              orderId: 'SHV-856726',
              date: '09 Sep 2026',
              status: 'Dispatched — In Transit',
              statusStep: 3, // 1: Placed, 2: Inspected, 3: Dispatched, 4: Delivered
              carrier: 'BlueDart Air Express',
              trackingNumber: 'BD-84920491',
              customer: {
                fullName: user?.name || 'Aarav Mehta',
                email: user?.email || 'aarav@shveraa.luxury',
                phone: user?.phone || '+91 98765 43210',
                address: '402, Lotus Heritage, Linking Road, Mumbai, Maharashtra - 400050',
              },
              items: [
                {
                  id: 'prod_1',
                  name: 'Lumina 925 Silver Solitaire Ring',
                  image: '/hero-ring-banner.jpg',
                  price: 1899,
                  quantity: 1,
                  size: 'US 7 (54mm)',
                },
                {
                  id: 'prod_2',
                  name: 'Eternal Wave Stacking Silver Band',
                  image: '/category-bracelet.jpg',
                  price: 1299,
                  quantity: 1,
                  size: 'US 7 (54mm)',
                },
              ],
              pricing: {
                subtotal: 3198,
                discount: 0,
                shipping: 'FREE',
                total: 3198,
              },
            },
            {
              orderId: 'SHV-719302',
              date: '18 Aug 2026',
              status: 'Delivered',
              statusStep: 4,
              carrier: 'BlueDart Air Express',
              trackingNumber: 'BD-78901234',
              customer: {
                fullName: user?.name || 'Aarav Mehta',
                email: user?.email || 'aarav@shveraa.luxury',
                phone: user?.phone || '+91 98765 43210',
                address: '402, Lotus Heritage, Linking Road, Mumbai, Maharashtra - 400050',
              },
              items: [
                {
                  id: 'prod_3',
                  name: 'Fluid Sculpted Silver Cuff Bracelet',
                  image: '/muse-bracelet.jpg',
                  price: 3499,
                  quantity: 1,
                  size: 'Standard (65mm)',
                },
              ],
              pricing: {
                subtotal: 3499,
                discount: 350,
                shipping: 'FREE',
                total: 3149,
              },
            },
          ]);
        }
      }
    } catch (e) {
      console.error('Error parsing stored orders:', e);
    }
  }, [user]);

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName });
  };

  const copyOrderId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedOrderId(id);
    setTimeout(() => setCopiedOrderId(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    setAddressSavedNotice(true);
    setTimeout(() => setAddressSavedNotice(false), 3000);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPasswordSavedNotice(true);
    setTimeout(() => setPasswordSavedNotice(false), 3000);
  };

  if (!isAuthenticated) {
    return (
      <div className="shv-account-auth-gate">
        <div className="container">
          <div className="shv-auth-gate-card">
            <Sparkles size={40} className="shv-gate-icon" />
            <span className="shv-gate-eyebrow">The Atelier Vault</span>
            <h2>Sign In to Access Your Curation</h2>
            <p>
              Please sign in to view your orders, tracked BlueDart consignments, saved delivery addresses, and private silver privileges.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/login" className="btn btn-primary btn-lg">
                Sign In to Atelier <ArrowRight size={16} />
              </Link>
              <Link to="/shop" className="btn btn-outline btn-lg">
                Explore 925 Silver
              </Link>
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
                  <Phone size={14} /> {user?.phone || '+91 98765 43210'}
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

          <Link
            to="/shop?wishlist=true"
            className="shv-acc-tab-btn"
            style={{ textDecoration: 'none' }}
          >
            <Heart size={17} />
            <span>Curated Wishlist</span>
            {wishlistCount > 0 && <span className="shv-acc-tab-count">{wishlistCount}</span>}
          </Link>

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
            {orders.length === 0 ? (
              <div className="shv-orders-empty-state">
                <ShoppingBag size={44} className="shv-empty-icon" />
                <h3>No Atelier Orders Yet</h3>
                <p>You haven’t acquired any certified 925 sterling silver pieces yet.</p>
                <Link to="/shop" className="btn btn-primary">
                  Explore Current Collection <ArrowRight size={15} />
                </Link>
              </div>
            ) : (
              <div className="shv-orders-list">
                {orders.map((order, idx) => (
                  <div key={idx} className="shv-order-card">
                    {/* Order Header */}
                    <div className="shv-order-header">
                      <div className="shv-order-header-left">
                        <div className="shv-order-id-wrap">
                          <span className="shv-order-label">Order Ref:</span>
                          <strong>{order.orderId}</strong>
                          <button
                            type="button"
                            onClick={() => copyOrderId(order.orderId)}
                            className="shv-copy-mini-btn"
                            title="Copy Order ID"
                          >
                            {copiedOrderId === order.orderId ? (
                              <Check size={13} color="#10B981" />
                            ) : (
                              <Copy size={13} />
                            )}
                          </button>
                        </div>
                        <span className="shv-order-meta-dot">•</span>
                        <span className="shv-order-date">
                          <Clock size={13} /> Placed on {order.date}
                        </span>
                      </div>

                      <div className="shv-order-header-right">
                        <span
                          className={`shv-order-status-badge ${
                            order.status?.toLowerCase().includes('delivered')
                              ? 'delivered'
                              : 'in-transit'
                          }`}
                        >
                          <span className="shv-status-dot" />
                          {order.status || 'Dispatched — In Transit'}
                        </span>
                      </div>
                    </div>

                    {/* BlueDart Tracking Bar */}
                    <div className="shv-order-tracking-strip">
                      <div className="shv-tracking-info">
                        <Truck size={16} className="shv-truck-icon" />
                        <div>
                          <strong>{order.carrier || 'BlueDart Air Express (Insured)'}</strong>
                          <span>
                            Tracking ID: {order.trackingNumber || 'BD-84920491'} • Est. Delivery:{' '}
                            {order.estimatedDelivery || '2–4 Business Days'}
                          </span>
                        </div>
                      </div>
                      <div className="shv-tracking-actions">
                        <button
                          type="button"
                          onClick={handlePrint}
                          className="shv-order-action-link"
                          title="Print official tax invoice"
                        >
                          <Printer size={14} />
                          <span>Print Invoice</span>
                        </button>
                        <a
                          href={`https://wa.me/919876543210?text=Hello%20Shveraa%20Concierge,%20I%20would%20like%20to%20check%20tracking%20for%20order%20${order.orderId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shv-order-action-link"
                        >
                          <ExternalLink size={14} />
                          <span>Live Track</span>
                        </a>
                      </div>
                    </div>

                    {/* Items List */}
                    <div className="shv-order-items-grid">
                      {order.items?.map((item, itemIdx) => (
                        <div key={itemIdx} className="shv-order-item-card">
                          <div className="shv-order-item-img-wrap">
                            <img
                              src={item.image || '/hero-ring-banner.jpg'}
                              alt={item.name}
                              onError={(e) => {
                                e.currentTarget.src = '/hero-ring-banner.jpg';
                              }}
                            />
                          </div>
                          <div className="shv-order-item-info">
                            <h4>{item.name}</h4>
                            <div className="shv-order-item-meta">
                              <span>Size: {item.size || 'Standard'}</span>
                              <span>•</span>
                              <span>Qty: {item.quantity || 1}</span>
                              <span className="shv-bis-tag">925 BIS</span>
                            </div>
                            <div className="shv-order-item-price">
                              ₹{(item.price || 0) * (item.quantity || 1)}
                            </div>
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
                            {order.customer?.address ||
                              '402, Lotus Heritage, Linking Road, Mumbai - 400050'}
                          </span>
                        </div>
                      </div>

                      <div className="shv-order-totals-block">
                        <div className="shv-order-final-paid">
                          <span className="shv-paid-label">Total Amount Paid</span>
                          <span className="shv-paid-val">
                            ₹{order.pricing?.total || 3198}
                          </span>
                        </div>
                        <span className="shv-tax-inc">Inclusive of All GST &amp; Insurance</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Saved Addresses */}
        {activeTab === 'addresses' && (
          <div className="shv-addresses-tab-view">
            {addressSavedNotice && (
              <div className="shv-alert-notice">
                <CheckCircle2 size={16} />
                <span>Primary delivery address updated successfully!</span>
              </div>
            )}

            <div className="shv-addresses-grid">
              {addresses.map((addr) => (
                <div key={addr.id} className="shv-address-card default">
                  <div className="shv-addr-badge-row">
                    <span className="shv-addr-type-pill">Default Delivery Address</span>
                    <ShieldCheck size={16} color="#10B981" />
                  </div>
                  <h3 className="shv-addr-name">{addr.name}</h3>
                  <p className="shv-addr-phone">
                    <Phone size={13} /> {addr.phone}
                  </p>
                  <p className="shv-addr-text">
                    {addr.street},<br />
                    {addr.locality},<br />
                    {addr.city}, {addr.state} — <strong>{addr.pincode}</strong>
                  </p>
                  <div className="shv-addr-actions">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => alert('Address editor loaded for ' + addr.label)}
                    >
                      <Edit3 size={13} /> Edit Address
                    </button>
                  </div>
                </div>
              ))}

              {/* Add New Address Trigger */}
              <div
                className="shv-address-add-card"
                onClick={() => alert('Add secondary address form: you can save up to 5 shipping locations.')}
              >
                <div className="shv-add-icon-circle">
                  <Plus size={24} />
                </div>
                <h4>Add New Delivery Address</h4>
                <p>Save workplace, vacation retreat, or gifting recipient address.</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Security & Preferences */}
        {activeTab === 'security' && (
          <div className="shv-security-tab-view">
            {passwordSavedNotice && (
              <div className="shv-alert-notice">
                <CheckCircle2 size={16} />
                <span>Security preferences updated securely!</span>
              </div>
            )}

            <div className="shv-security-grid">
              {/* Profile Details */}
              <div className="shv-sec-card">
                <h3 className="shv-sec-title">Personal Particulars</h3>
                <form onSubmit={handleAddressSubmit} className="shv-sec-form">
                  <div className="form-group">
                    <label>Full Patron Name</label>
                    <input
                      type="text"
                      defaultValue={user?.name || 'Aarav Mehta'}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      defaultValue={user?.email || 'aarav@shveraa.luxury'}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Mobile Number (For WhatsApp Consignment Tracking)</label>
                    <input
                      type="tel"
                      defaultValue={user?.phone || '+91 98765 43210'}
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
                    <input type="password" placeholder="••••••••" required />
                  </div>
                  <div className="form-group">
                    <label>New Secret Password</label>
                    <input
                      type="password"
                      placeholder="Minimum 8 characters"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm Secret Password</label>
                    <input
                      type="password"
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
              <h3 className="shv-sec-title">Communication &amp; Concierge Alerts</h3>
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
