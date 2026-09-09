import React, { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Truck,
  XCircle,
  Clock,
  Printer,
  ChevronDown,
} from 'lucide-react';

const AdminOrders = ({ orders, onUpdateStatus, searchQuery }) => {
  const [selectedStatusTab, setSelectedStatusTab] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Filter orders
  const filteredOrders = orders.filter((ord) => {
    const matchesTab =
      selectedStatusTab === 'All' ||
      ord.status.toLowerCase().includes(selectedStatusTab.toLowerCase()) ||
      (selectedStatusTab === 'Scheduled' && (ord.status === 'Scheduled' || ord.status === 'Pending')) ||
      (selectedStatusTab === 'On Progress' && ord.status === 'On The Way');

    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      ord.orderId.toLowerCase().includes(q) ||
      (ord.displayId && ord.displayId.toLowerCase().includes(q)) ||
      ord.customer.fullName.toLowerCase().includes(q) ||
      ord.customer.email.toLowerCase().includes(q) ||
      (ord.customer.phone && ord.customer.phone.includes(q));

    return matchesTab && matchesSearch;
  });

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Delivered':
        return 'delivered';
      case 'On The Way':
      case 'On Progress':
      case 'Dispatched — In Transit':
        return 'ontheway';
      case 'Cancelled':
        return 'cancelled';
      case 'On Hold':
        return 'onhold';
      default:
        return 'scheduled';
    }
  };

  return (
    <div className="shv-admin-orders-view">
      {/* Header Banner */}
      <div className="shv-table-card-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 className="shv-table-title" style={{ fontSize: '1.4rem' }}>
            Store Order Ledger ({filteredOrders.length})
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--admin-text-muted)' }}>
            Real-time customer dispatches &amp; 925 sterling silver atelier consignments.
          </p>
        </div>

        {/* Status Tab Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['All', 'Scheduled', 'On Progress', 'Delivered', 'Cancelled'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setSelectedStatusTab(tab)}
              className="shv-table-filter-btn"
              style={{
                background: selectedStatusTab === tab ? '#1E2229' : '#FFFFFF',
                color: selectedStatusTab === tab ? '#FFFFFF' : 'var(--admin-text-main)',
                borderColor: selectedStatusTab === tab ? '#1E2229' : 'var(--admin-border)',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table Card */}
      <div className="shv-admin-table-card">
        <div className="shv-admin-table-wrap">
          <table className="shv-admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Client / Patron</th>
                <th>Silhouettes &amp; Qty</th>
                <th>Total Value</th>
                <th>Payment Mode</th>
                <th>Dispatch Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)' }}>
                    No orders found matching your active filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const itemCount = ord.items.reduce((acc, i) => acc + (i.qty || i.quantity || 1), 0);
                  const firstItem = ord.items[0];

                  return (
                    <tr key={ord.orderId}>
                      <td>
                        <strong className="shv-table-order-id">{ord.displayId || ord.orderId}</strong>
                        <div style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)' }}>{ord.date}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{ord.customer.fullName}</div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--admin-text-muted)' }}>
                          {ord.customer.city || ord.customer.phone}
                        </div>
                      </td>
                      <td>
                        <div className="shv-table-item-cell">
                          {firstItem?.image && (
                            <img src={firstItem.image} alt={firstItem.name} className="shv-table-item-thumb" />
                          )}
                          <div>
                            <div style={{ fontWeight: 500, fontSize: '0.84rem' }}>{firstItem?.name}</div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)' }}>
                              {itemCount} {itemCount === 1 ? 'Piece' : 'Pieces'} • {ord.items.length > 1 ? `+${ord.items.length - 1} more` : firstItem?.size || '925 Silver'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong style={{ fontSize: '0.95rem' }}>
                          ₹{(ord.pricing?.total || 0).toLocaleString('en-IN')}
                        </strong>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.82rem', fontWeight: 500 }}>{ord.paymentMethod?.split('(')[0]}</div>
                        <div style={{ fontSize: '0.74rem', color: ord.paymentStatus === 'Paid' ? 'var(--admin-green)' : 'var(--admin-amber)' }}>
                          ● {ord.paymentStatus}
                        </div>
                      </td>
                      <td>
                        {/* Status update inline selector */}
                        <select
                          value={ord.status}
                          onChange={(e) => onUpdateStatus(ord.orderId, e.target.value)}
                          className={`shv-status-pill ${getStatusBadgeClass(ord.status)}`}
                          style={{
                            border: 'none',
                            outline: 'none',
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                          }}
                        >
                          <option value="Scheduled">Scheduled</option>
                          <option value="On The Way">On The Way</option>
                          <option value="Delivered">Delivered</option>
                          <option value="On Hold">On Hold</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(ord)}
                          className="shv-table-filter-btn"
                          title="Inspect Consignment"
                        >
                          <Eye size={14} />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="shv-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="shv-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="shv-modal-header">
              <div>
                <h3 className="shv-modal-title">Consignment {selectedOrder.displayId || selectedOrder.orderId}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                  Placed on {selectedOrder.date} • {selectedOrder.carrier || 'BlueDart Air Express'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="shv-modal-close-btn"
              >
                ✕
              </button>
            </div>

            {/* Customer Details Box */}
            <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem', border: '1px solid var(--admin-border)' }}>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--admin-text-light)', marginBottom: '0.5rem', fontWeight: 700 }}>
                Patron &amp; Delivery Destination
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                {selectedOrder.customer.fullName}
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--admin-text-muted)', marginBottom: '0.2rem' }}>
                {selectedOrder.customer.phone} • {selectedOrder.customer.email}
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--admin-text-main)' }}>
                {selectedOrder.customer.address}, {selectedOrder.customer.city} - {selectedOrder.customer.pincode}
              </div>
            </div>

            {/* Items */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--admin-text-light)', marginBottom: '0.75rem', fontWeight: 700 }}>
                Certified 925 Pure Silver Pieces
              </div>
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--admin-border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {item.image && (
                      <img src={item.image} alt={item.name} style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }} />
                    )}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>{item.name}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--admin-text-muted)' }}>
                        Qty: {item.qty || item.quantity || 1} • Size: {item.size || 'Standard'}
                      </div>
                    </div>
                  </div>
                  <strong style={{ fontSize: '0.9rem' }}>₹{((item.price || 0) * (item.qty || item.quantity || 1)).toLocaleString('en-IN')}</strong>
                </div>
              ))}
            </div>

            {/* Total and Print button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--admin-border)' }}>
              <div>
                <span style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>Total Amount: </span>
                <strong style={{ fontSize: '1.2rem' }}>₹{(selectedOrder.pricing?.total || 0).toLocaleString('en-IN')}</strong>
              </div>

              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="shv-btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Printer size={15} />
                  <span>Print Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="shv-btn-primary"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
