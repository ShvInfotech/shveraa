import React from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  RotateCcw,
  DollarSign,
  Settings,
  HelpCircle,
  MessageSquare,
  LogOut,
  Store,
  Package,
  Layers,
  Tag,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';

const AdminSidebar = ({
  currentTab,
  setCurrentTab,
  orderCount,
  isCollapsed,
  setIsCollapsed,
  onSignOut,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const handleNav = (tab) => {
    setCurrentTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className={`shv-admin-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
      {/* Brand Header */}
      <div className="shv-sidebar-brand">
        <Link
          to="/admin"
          className="shv-sidebar-logo-group"
          aria-label="Shveraa Admin"
          onClick={() => onCloseMobile && onCloseMobile()}
        >
          {isCollapsed ? (
            <div className="shv-sidebar-logo-badge" title="Shveraa Atelier">S</div>
          ) : (
            <img src="/logo.png" alt="SHVÈRAA Jewellery" className="shv-admin-sidebar-logo" />
          )}
        </Link>
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="shv-sidebar-collapse-btn desktop-only-btn"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label="Toggle Sidebar"
        >
          {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
        <button
          type="button"
          onClick={() => onCloseMobile && onCloseMobile()}
          className="shv-sidebar-mobile-close-btn mobile-only-btn"
          title="Close Navigation"
          aria-label="Close Navigation"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="shv-sidebar-nav-container">
        {/* MAIN MENU */}
        <div className="shv-sidebar-section">
          {!isCollapsed && <div className="shv-sidebar-section-title">MAIN MENU</div>}
          <ul className="shv-sidebar-menu">
            <li>
              <button
                type="button"
                onClick={() => handleNav('dashboard')}
                className={`shv-sidebar-link ${currentTab === 'dashboard' ? 'active' : ''}`}
                title="Dashboard"
              >
                <div className="shv-sidebar-link-left">
                  <LayoutDashboard size={18} />
                  {!isCollapsed && <span>Dashboard</span>}
                </div>
              </button>
            </li>

            <li>
              <button
                type="button"
                onClick={() => handleNav('orders')}
                className={`shv-sidebar-link ${currentTab === 'orders' ? 'active' : ''}`}
                title="Orders"
              >
                <div className="shv-sidebar-link-left">
                  <ShoppingBag size={18} />
                  {!isCollapsed && <span>Orders</span>}
                </div>
                {!isCollapsed && orderCount > 0 && (
                  <span className="shv-sidebar-badge">{orderCount}</span>
                )}
              </button>
            </li>

            {/* Return Management (Return / RTO) */}
            <li>
              <button
                type="button"
                onClick={() => handleNav('returns')}
                className={`shv-sidebar-link ${currentTab === 'returns' ? 'active' : ''}`}
                title="Return Management"
              >
                <div className="shv-sidebar-link-left">
                  <RotateCcw size={18} />
                  {!isCollapsed && <span>Return Management</span>}
                </div>
              </button>
            </li>

            {/* Categories */}
            <li>
              <button
                type="button"
                onClick={() => handleNav('categories')}
                className={`shv-sidebar-link ${currentTab === 'categories' ? 'active' : ''}`}
                title="Category Taxonomy"
              >
                <div className="shv-sidebar-link-left">
                  <Layers size={18} />
                  {!isCollapsed && <span>Categories</span>}
                </div>
              </button>
            </li>

            {/* Products / Inventory */}
            <li>
              <button
                type="button"
                onClick={() => handleNav('products')}
                className={`shv-sidebar-link ${currentTab === 'products' || currentTab === 'product-editor' ? 'active' : ''}`}
                title="925 Silver Inventory"
              >
                <div className="shv-sidebar-link-left">
                  <Package size={18} />
                  {!isCollapsed && <span>Products</span>}
                </div>
              </button>
            </li>

            {/* Storefront CMS */}
            <li>
              <button
                type="button"
                onClick={() => handleNav('cms')}
                className={`shv-sidebar-link ${currentTab === 'cms' ? 'active' : ''}`}
                title="Website CMS & Announcements"
              >
                <div className="shv-sidebar-link-left">
                  <Sparkles size={18} />
                  {!isCollapsed && <span>Storefront CMS</span>}
                </div>
              </button>
            </li>

            {/* Coupons & Promotions */}
            <li>
              <button
                type="button"
                onClick={() => handleNav('coupons')}
                className={`shv-sidebar-link ${currentTab === 'coupons' ? 'active' : ''}`}
                title="Coupons & Discounts"
              >
                <div className="shv-sidebar-link-left">
                  <Tag size={18} />
                  {!isCollapsed && <span>Coupons</span>}
                </div>
              </button>
            </li>

            {/* Payment */}
            <li>
              <button
                type="button"
                onClick={() => handleNav('payments')}
                className={`shv-sidebar-link ${currentTab === 'payments' ? 'active' : ''}`}
                title="Payments & Revenue"
              >
                <div className="shv-sidebar-link-left">
                  <DollarSign size={18} />
                  {!isCollapsed && <span>Payment</span>}
                </div>
              </button>
            </li>
          </ul>
        </div>

        {/* SETTING */}
        <div className="shv-sidebar-section">
          {!isCollapsed && <div className="shv-sidebar-section-title">SETTING</div>}
          <ul className="shv-sidebar-menu">
            <li>
              <button
                type="button"
                onClick={() => handleNav('settings')}
                className={`shv-sidebar-link ${currentTab === 'settings' ? 'active' : ''}`}
                title="Settings"
              >
                <div className="shv-sidebar-link-left">
                  <Settings size={18} />
                  {!isCollapsed && <span>Settings</span>}
                </div>
              </button>
            </li>

            <li>
              <button
                type="button"
                onClick={() => handleNav('inquiries')}
                className={`shv-sidebar-link ${currentTab === 'inquiries' ? 'active' : ''}`}
                title="Customer Inquiries"
              >
                <div className="shv-sidebar-link-left">
                  <MessageSquare size={18} />
                  {!isCollapsed && <span>Inquiries</span>}
                </div>
              </button>
            </li>

            <li>
              <Link
                to="/"
                className="shv-sidebar-link"
                title="Visit Live Storefront"
                target="_blank"
                onClick={() => onCloseMobile && onCloseMobile()}
              >
                <div className="shv-sidebar-link-left">
                  <Store size={18} />
                  {!isCollapsed && <span>Live Storefront</span>}
                </div>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Profile Card */}
      <div className="shv-sidebar-profile">
        <div className="shv-admin-user-card">
          <div className="shv-user-card-left">
            <div className="shv-admin-avatar">SH</div>
            {!isCollapsed && (
              <div className="shv-admin-info">
                <span className="shv-admin-name">Atelier Master</span>
                <span className="shv-admin-email">admin@shveraa.luxury</span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem('shveraa_admin_token');
                sessionStorage.removeItem('shveraa_admin_session');
                window.location.reload();
              }}
              className="shv-admin-exit-btn"
              title="Sign Out of Admin"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
