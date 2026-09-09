import React, { useState, useEffect } from 'react';
import './admin.css';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminDashboard from './AdminDashboard';
import AdminCategories from './AdminCategories';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminDeliveries from './AdminDeliveries';
import AdminCoupons from './AdminCoupons';
import AdminPayments from './AdminPayments';
import AdminSettings from './AdminSettings';
import {
  getAdminOrders,
  updateAdminOrderStatus,
} from './adminData';
import { useDynamicStore } from '../services/storeService';
import { HelpCircle, Mail, Phone, MessageSquare } from 'lucide-react';

const AdminLayout = () => {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [deliveryFilter, setDeliveryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Dynamic store hooks for real-time reactivity
  const { categories, products, coupons, settings, refreshStore } = useDynamicStore();
  const [orders, setOrders] = useState([]);

  // Load initial orders
  useEffect(() => {
    setOrders(getAdminOrders());
  }, []);

  // Update order status handler
  const handleUpdateOrderStatus = (orderId, newStatus) => {
    const updated = updateAdminOrderStatus(orderId, newStatus);
    setOrders([...updated]);
  };

  return (
    <div className="shv-admin-wrapper">
      {/* 1. Modulix Sidebar */}
      <AdminSidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        deliveryFilter={deliveryFilter}
        setDeliveryFilter={setDeliveryFilter}
        orderCount={orders.length}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      {/* 2. Main Work Area */}
      <div className="shv-admin-main">
        {/* Top Header */}
        <AdminHeader
          currentTab={currentTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
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
            />
          )}

          {currentTab === 'orders' && (
            <AdminOrders
              orders={orders}
              onUpdateStatus={handleUpdateOrderStatus}
              searchQuery={searchQuery}
            />
          )}

          {currentTab === 'deliveries' && (
            <AdminDeliveries
              orders={orders}
              deliveryFilter={deliveryFilter}
              setDeliveryFilter={setDeliveryFilter}
              onUpdateStatus={handleUpdateOrderStatus}
            />
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
                      <div style={{ fontWeight: 600 }}>Emergency Concierge Hotline</div>
                      <div style={{ fontSize: '0.84rem', color: 'var(--admin-text-muted)' }}>+91 98765 43210 (24/7 Priority Silversmith Line)</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E2229' }}>
                      <Mail size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600 }}>Technical Operations Desk</div>
                      <div style={{ fontSize: '0.84rem', color: 'var(--admin-text-muted)' }}>concierge@shveraa.luxury</div>
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
    </div>
  );
};

export default AdminLayout;
