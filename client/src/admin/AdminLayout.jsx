import React, { useState, useEffect, useCallback } from 'react';
import './admin.css';
import AdminLogin from './AdminLogin';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminDashboard from './AdminDashboard';
import AdminCategories from './AdminCategories';
import AdminProducts from './AdminProducts';
import AdminProductEditor from './AdminProductEditor';
import AdminCMS from './AdminCMS';
import AdminOrders from './AdminOrders';
import AdminReturns from './AdminReturns';
import AdminCoupons from './AdminCoupons';
import AdminPayments from './AdminPayments';
import AdminSettings from './AdminSettings';
import { useDynamicStore, getAdminAuth, logoutAdmin } from '../services/storeService';
import { apiAdminGetAllOrders } from '../services/api';
import {
  HelpCircle,
  Mail,
  Phone,
  MessageSquare,
  LayoutDashboard,
  ShoppingBag,
  Package,
  Menu,
} from 'lucide-react';

const AdminLayout = () => {
  const [adminUser, setAdminUser] = useState(() => getAdminAuth());
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dynamic store hooks for real-time reactivity
  const { categories, products, coupons, settings, refreshStore } = useDynamicStore();
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const fetchAllOrders = useCallback(async () => {
    if (!getAdminAuth()) return;
    setOrdersLoading(true);
    try {
      const data = await apiAdminGetAllOrders({ limit: 200 });
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Admin: Failed to fetch orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  // Fetch orders as soon as an administrator session is available. This runs on the
  // very first mount (when a session was already restored from sessionStorage) AND
  // again right after a fresh login – without the `adminUser` dependency the effect
  // only fired once while still logged out, so the Orders tab stayed empty until a
  // manual page refresh.
  useEffect(() => {
    if (!adminUser) return;
    fetchAllOrders();
  }, [adminUser, fetchAllOrders]);

  // Drop straight back to the login screen when any admin request returns 401.
  useEffect(() => {
    const handleUnauthorized = () => setAdminUser(null);
    window.addEventListener('shveraa_admin_unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('shveraa_admin_unauthorized', handleUnauthorized);
    };
  }, []);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    // Optimistic update
    setOrders((prev) =>
      prev.map((o) =>
        (o._id === orderId || o.orderNumber === orderId) ? { ...o, status: newStatus } : o
      )
    );
  };


  // Dedicated Product Studio Opener
  const handleOpenProductEditor = (productToEdit = null) => {
    setEditingProduct(productToEdit);
    setCurrentTab('product-editor');
  };

  const handleSignOut = async () => {
    await logoutAdmin();
    setAdminUser(null);
  };

  // If not authenticated as administrator, show the luxury login portal
  if (!adminUser) {
    return <AdminLogin onLoginSuccess={(user) => setAdminUser(user)} />;
  }

  return (
    <div className="shv-admin-wrapper">
      {/* Mobile Drawer Backdrop */}
      <div
        className={`shv-admin-mobile-backdrop ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* 1. Modulix Sidebar (Desktop pinned / Mobile slide-over) */}
      <AdminSidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        orderCount={orders.length}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        onSignOut={handleSignOut}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* 2. Main Work Area */}
      <div className={`shv-admin-main ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Top Header */}
        <AdminHeader
          currentTab={currentTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSignOut={handleSignOut}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Content Body */}
        <main className="shv-admin-content-body">
          {currentTab === 'dashboard' && (
            <AdminDashboard
              orders={orders}
              products={products}
              categories={categories}
              onSelectOrder={(ord) => {
                setCurrentTab('orders');
              }}
            />
          )}

          {currentTab === 'categories' && (
            <AdminCategories
              categories={categories}
              products={products}
              onRefresh={refreshStore}
            />
          )}

          {currentTab === 'products' && (
            <AdminProducts
              products={products}
              categories={categories}
              searchQuery={searchQuery}
              onRefresh={refreshStore}
              onOpenEditor={handleOpenProductEditor}
            />
          )}

          {/* DEDICATED FULL-PAGE JEWELLERY PRODUCT STUDIO */}
          {currentTab === 'product-editor' && (
            <AdminProductEditor
              product={editingProduct}
              categories={categories}
              onBack={() => {
                setEditingProduct(null);
                setCurrentTab('products');
              }}
              onSaveSuccess={(savedProd) => {
                refreshStore();
                setEditingProduct(null);
                setCurrentTab('products');
              }}
            />
          )}

          {/* DEDICATED STOREFRONT CMS MANAGER */}
          {currentTab === 'cms' && (
            <AdminCMS
              onRefresh={refreshStore}
              settings={settings}
            />
          )}

          {currentTab === 'orders' && (
            <AdminOrders
              orders={orders}
              isLoading={ordersLoading}
              onUpdateStatus={handleUpdateOrderStatus}
              searchQuery={searchQuery}
            />
          )}

          {currentTab === 'returns' && (
            <AdminReturns searchQuery={searchQuery} />
          )}

          {currentTab === 'coupons' && (
            <AdminCoupons
              coupons={coupons}
              onRefresh={refreshStore}
            />
          )}

          {currentTab === 'payments' && (
            <AdminPayments orders={orders} />
          )}

          {currentTab === 'settings' && (
            <AdminSettings />
          )}

          {currentTab === 'support' && (
            <div style={{ maxWidth: '720px' }}>
              <div className="shv-table-card-header" style={{ marginBottom: '1.5rem' }}>
                <div>
                  <h2 className="shv-table-title" style={{ fontSize: '1.4rem' }}>
                    Atelier Support &amp; Technical Help
                  </h2>
                  <p style={{ fontSize: '0.86rem', color: 'var(--admin-text-muted)' }}>
                    Immediate assistance with e-commerce operations, payment gateways, or courier APIs.
                  </p>
                </div>
              </div>

              <div className="shv-admin-table-card">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E2229' }}>
                      <Phone size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>Customer Care Helpline</div>
                      <div style={{ fontSize: '0.84rem', color: 'var(--admin-text-muted)' }}>+91 99980 46559 (Priority Support Line)</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E2229' }}>
                      <Mail size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>Technical Operations Desk</div>
                      <div style={{ fontSize: '0.84rem', color: 'var(--admin-text-muted)' }}>shvera925@gmail.com</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E2229' }}>
                      <MessageSquare size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>Direct WhatsApp Channel</div>
                      <div style={{ fontSize: '0.84rem', color: 'var(--admin-text-muted)' }}>Instant resolution for courier consignments &amp; Razorpay payouts</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* 3. Shopify-style Mobile Bottom Navigation Bar */}
      <nav className="shv-admin-bottom-nav mobile-only-flex" aria-label="Mobile Bottom Navigation">
        <button
          type="button"
          onClick={() => {
            setCurrentTab('dashboard');
            setIsMobileMenuOpen(false);
          }}
          className={`shv-bottom-nav-item ${currentTab === 'dashboard' ? 'active' : ''}`}
        >
          <LayoutDashboard size={20} />
          <span>Home</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setCurrentTab('orders');
            setIsMobileMenuOpen(false);
          }}
          className={`shv-bottom-nav-item ${currentTab === 'orders' ? 'active' : ''}`}
        >
          <div className="shv-bottom-nav-icon-wrap">
            <ShoppingBag size={20} />
            {orders.length > 0 && (
              <span className="shv-bottom-badge">{orders.length}</span>
            )}
          </div>
          <span>Orders</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setCurrentTab('products');
            setIsMobileMenuOpen(false);
          }}
          className={`shv-bottom-nav-item ${currentTab === 'products' || currentTab === 'product-editor' ? 'active' : ''}`}
        >
          <Package size={20} />
          <span>Products</span>
        </button>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className={`shv-bottom-nav-item ${isMobileMenuOpen ? 'active' : ''}`}
          aria-label="Open More Menu"
        >
          <Menu size={20} />
          <span>Menu</span>
        </button>
      </nav>
    </div>
  );
};

export default AdminLayout;
