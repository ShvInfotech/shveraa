import React from 'react';
import {
  Search,
  Calendar,
  LayoutDashboard,
  ShoppingBag,
  Truck,
  Package,
  DollarSign,
  Settings,
  HelpCircle,
  Layers,
  Tag,
  Sparkles,
  ExternalLink,
  LogOut,
  Shield,
} from 'lucide-react';
import { logoutAdmin } from '../services/storeService';

const TAB_ICONS = {
  dashboard: <LayoutDashboard size={16} />,
  orders: <ShoppingBag size={16} />,
  deliveries: <Truck size={16} />,
  categories: <Layers size={16} />,
  products: <Package size={16} />,
  'product-editor': <Sparkles size={16} />,
  cms: <Sparkles size={16} />,
  coupons: <Tag size={16} />,
  payments: <DollarSign size={16} />,
  settings: <Settings size={16} />,
  support: <HelpCircle size={16} />,
};

const TAB_NAMES = {
  dashboard: 'Dashboard',
  orders: 'Orders',
  deliveries: 'Track Deliveries',
  categories: 'Categories',
  products: 'Products',
  'product-editor': 'Jewellery Studio & Editor',
  cms: 'Storefront CMS',
  coupons: 'Coupons',
  payments: 'Payment',
  settings: 'Settings',
  support: 'Support & Help',
};

const AdminHeader = ({ currentTab, searchQuery, setSearchQuery, onSignOut }) => {
  const handleLogout = () => {
    logoutAdmin();
    if (onSignOut) onSignOut();
    else window.location.reload();
  };

  return (
    <header className="shv-admin-header">
      {/* Breadcrumbs matching image: "Main Menu / ⊞ Dashboard" */}
      <div className="shv-admin-breadcrumb">
        <span>Main Menu</span>
        <span>/</span>
        <div className="shv-admin-breadcrumb-active">
          {TAB_ICONS[currentTab] || <LayoutDashboard size={16} />}
          <span>{TAB_NAMES[currentTab] || 'Dashboard'}</span>
        </div>
      </div>

      {/* Right Search, Live Store & Logout Actions */}
      <div className="shv-admin-header-actions">
        <div className="shv-admin-search-wrap">
          <Search size={15} className="shv-admin-search-icon" />
          <input
            type="text"
            placeholder="Search inventory, orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="shv-admin-search-input"
          />
        </div>

        {/* Live Storefront Link */}
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="shv-admin-live-store-btn"
          title="Open Public Boutique in New Tab"
        >
          <ExternalLink size={14} />
          <span>Live Boutique</span>
        </a>

        {/* Security Badge Pill */}
        <div className="shv-admin-badge-pill" title="Protected 925 Pure Silver Admin Session">
          <Shield size={13} />
          <span>Admin</span>
        </div>

        {/* Header Sign Out */}
        <button
          type="button"
          onClick={handleLogout}
          className="shv-admin-calendar-btn"
          title="Sign Out of Atelier Master Portal"
          aria-label="Sign Out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
