import React from 'react';
import { Search, Calendar, LayoutDashboard, ShoppingBag, Truck, Package, DollarSign, Settings, HelpCircle, Layers, Tag } from 'lucide-react';

const TAB_ICONS = {
  dashboard: <LayoutDashboard size={16} />,
  orders: <ShoppingBag size={16} />,
  deliveries: <Truck size={16} />,
  categories: <Layers size={16} />,
  products: <Package size={16} />,
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
  coupons: 'Coupons',
  payments: 'Payment',
  settings: 'Settings',
  support: 'Support & Help',
};

const AdminHeader = ({ currentTab, searchQuery, setSearchQuery }) => {
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

      {/* Right Search and Calendar Action */}
      <div className="shv-admin-header-actions">
        <div className="shv-admin-search-wrap">
          <Search size={15} className="shv-admin-search-icon" />
          <input
            type="text"
            placeholder="Search anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="shv-admin-search-input"
          />
        </div>

        <button
          type="button"
          className="shv-admin-calendar-btn"
          title="Date Filter: 09 Sep 2026"
          aria-label="Filter by Date"
        >
          <Calendar size={18} />
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
