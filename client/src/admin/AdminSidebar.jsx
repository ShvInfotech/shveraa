import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Truck,
  DollarSign,
  Settings,
  HelpCircle,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  LogOut,
  Store,
  Package,
  Layers,
  Tag,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

const AdminSidebar = ({
  currentTab,
  setCurrentTab,
  deliveryFilter,
  setDeliveryFilter,
  orderCount,
  isCollapsed,
  setIsCollapsed,
}) => {
  const [deliveriesExpanded, setDeliveriesExpanded] = useState(true);

  const handleDeliverySubItemClick = (filterName) => {
    setCurrentTab('deliveries');
    setDeliveryFilter(filterName);
  };

  return (
    <aside className={`shv-admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Brand Header */}
      <div className="shv-sidebar-brand">
        <Link to="/admin" className="shv-sidebar-logo-group">
          <div className="shv-sidebar-logo-badge">M</div>
          {!isCollapsed && <span className="shv-sidebar-brand-name">Modulix</span>}
        </Link>
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="shv-sidebar-collapse-btn"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label="Toggle Sidebar"
        >
          {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
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
                onClick={() => setCurrentTab('dashboard')}
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
                onClick={() => setCurrentTab('orders')}
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

            {/* Track Deliveries with Expandable Submenu */}
            <li>
              <button
                type="button"
                onClick={() => {
                  if (isCollapsed) {
                    setIsCollapsed(false);
                    setDeliveriesExpanded(true);
                  } else {
                    setDeliveriesExpanded(!deliveriesExpanded);
                  }
                  setCurrentTab('deliveries');
                }}
                className={`shv-sidebar-link ${currentTab === 'deliveries' ? 'active' : ''}`}
                title="Track Deliveries"
              >
                <div className="shv-sidebar-link-left">
                  <Truck size={18} />
                  {!isCollapsed && <span>Track Deliveries</span>}
                </div>
                {!isCollapsed && (
                  deliveriesExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                )}
              </button>

              {/* Submenu Tree */}
              {!isCollapsed && deliveriesExpanded && (
                <ul className="shv-sidebar-submenu">
                  <li>
                    <button
                      type="button"
                      onClick={() => handleDeliverySubItemClick('On Progress')}
                      className={`shv-sidebar-sublink ${
                        currentTab === 'deliveries' && deliveryFilter === 'On Progress' ? 'active' : ''
                      }`}
                    >
                      <span>On Progress</span>
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => handleDeliverySubItemClick('Delivered')}
                      className={`shv-sidebar-sublink ${
                        currentTab === 'deliveries' && deliveryFilter === 'Delivered' ? 'active' : ''
                      }`}
                    >
                      <span>Delivered</span>
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => handleDeliverySubItemClick('Canceled')}
                      className={`shv-sidebar-sublink ${
                        currentTab === 'deliveries' && deliveryFilter === 'Canceled' ? 'active' : ''
                      }`}
                    >
                      <span>Canceled</span>
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => handleDeliverySubItemClick('Pending')}
                      className={`shv-sidebar-sublink ${
                        currentTab === 'deliveries' && deliveryFilter === 'Pending' ? 'active' : ''
                      }`}
                    >
                      <span>Pending</span>
                    </button>
                  </li>
                </ul>
              )}
            </li>

            {/* Categories */}
            <li>
              <button
                type="button"
                onClick={() => setCurrentTab('categories')}
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
                onClick={() => setCurrentTab('products')}
                className={`shv-sidebar-link ${currentTab === 'products' ? 'active' : ''}`}
                title="925 Silver Inventory"
              >
                <div className="shv-sidebar-link-left">
                  <Package size={18} />
                  {!isCollapsed && <span>Products</span>}
                </div>
              </button>
            </li>

            {/* Coupons & Promotions */}
            <li>
              <button
                type="button"
                onClick={() => setCurrentTab('coupons')}
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
                onClick={() => setCurrentTab('payments')}
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
                onClick={() => setCurrentTab('settings')}
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
                onClick={() => setCurrentTab('support')}
                className={`shv-sidebar-link ${currentTab === 'support' ? 'active' : ''}`}
                title="Support & Help"
              >
                <div className="shv-sidebar-link-left">
                  <HelpCircle size={18} />
                  {!isCollapsed && <span>Support &amp; Help</span>}
                </div>
              </button>
            </li>

            <li>
              <Link to="/" className="shv-sidebar-link" title="Visit Live Storefront">
                <div className="shv-sidebar-link-left">
                  <Store size={18} />
                  {!isCollapsed && <span>Live Store</span>}
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
            <div className="shv-admin-avatar">DC</div>
            {!isCollapsed && (
              <div className="shv-admin-info">
                <span className="shv-admin-name">Danang Calvin</span>
                <span className="shv-admin-email">Calvin12@gmail.com</span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <Link to="/" className="shv-admin-exit-btn" title="Exit to Storefront">
              <LogOut size={16} />
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
