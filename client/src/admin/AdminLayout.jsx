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
import AdminInquiries from './AdminInquiries';
import { useDynamicStore, getAdminAuth, logoutAdmin } from '../services/storeService';
import { apiAdminGetAllOrders } from '../services/api';
import {
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
  const [pendingorders,setPendingorders] = useState(0)
  const fetchAllOrders = useCallback(async () => {
    if (!getAdminAuth()) return;
    setOrdersLoading(true);
    try {
      const data = await apiAdminGetAllOrders();
      setOrders(data.orders || []);
      const pendingCount = data.orders.filter(order => order.status === "pending").length;
      setPendingorders(pendingCount)
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
        orderCount={pendingorders}
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

          {currentTab === 'inquiries' && (
            <AdminInquiries searchQuery={searchQuery} />
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
