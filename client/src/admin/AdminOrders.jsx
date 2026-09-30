import React, { useState } from 'react';
import { Eye, Printer, CheckSquare } from 'lucide-react';
import { getImageUrl } from '../services/api';

const STATUS_TABS = ['All', 'pending', 'accepted', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

const AdminOrders = ({ orders, onUpdateStatus, searchQuery }) => {
  const [selectedStatusTab, setSelectedStatusTab] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('');

  // Filter orders – uses real DB fields
  const filteredOrders = orders.filter((ord) => {
    const matchesTab =
      selectedStatusTab === 'All' ||
      (ord.status || '').toLowerCase() === selectedStatusTab.toLowerCase();

    const q = (searchQuery || '').toLowerCase();
    const orderRef = (ord.orderNumber || ord._id || '').toLowerCase();
    const phone = (ord.address?.phone || '').toLowerCase();
    const waybill = (ord.waybill || '').toLowerCase();
    const matchesSearch =
      !q ||
      orderRef.includes(q) ||
      phone.includes(q) ||
      waybill.includes(q);

    return matchesTab && matchesSearch;
  });

  // Tab-wise selection helpers
  const currentTabOrderIds = filteredOrders.map((ord) => ord._id || ord.orderNumber);
  const isAllSelected =
    currentTabOrderIds.length > 0 &&
    currentTabOrderIds.every((id) => selectedOrderIds.includes(id));

  // Switch tab and reset selection so selection stays tab-wise
  const handleTabChange = (tab) => {
    setSelectedStatusTab(tab);
    setSelectedOrderIds([]);
    setBulkStatus('');
  };

  const handleToggleSelect = (id) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(currentTabOrderIds);
    }
  };

  const handleApplyBulkStatus = async () => {
    if (!bulkStatus || selectedOrderIds.length === 0) return;
    if (onUpdateStatus) {
      for (const id of selectedOrderIds) {
        await onUpdateStatus(id, bulkStatus);
      }
    }
    setSelectedOrderIds([]);
    setBulkStatus('');
  };

  const getStatusBadgeClass = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'delivered': return 'delivered';
      case 'shipped':
      case 'out_for_delivery': return 'ontheway';
      case 'cancelled': return 'cancelled';
      case 'accepted':
      case 'processing': return 'onhold';
      default: return 'scheduled';
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
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabChange(tab)}
              className="shv-table-filter-btn"
              style={{
                background: selectedStatusTab === tab ? '#1E2229' : '#FFFFFF',
                color: selectedStatusTab === tab ? '#FFFFFF' : 'var(--admin-text-main)',
                borderColor: selectedStatusTab === tab ? '#1E2229' : 'var(--admin-border)',
                textTransform: 'capitalize',
              }}
            >
              {tab === 'out_for_delivery' ? 'Out for Delivery' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table Card */}
      <div className="shv-admin-table-card">
        {/* Bulk Action & Select All Bar - Hidden in 'All' tab */}
        {selectedStatusTab !== 'All' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1.25rem',
              background: selectedOrderIds.length > 0 ? '#F1F5F9' : '#FAFAFB',
              borderBottom: '1px solid var(--admin-border)',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={handleToggleSelectAll}
                className="shv-table-filter-btn"
                style={{
                  background: isAllSelected ? '#1E2229' : '#FFFFFF',
                  color: isAllSelected ? '#FFFFFF' : 'var(--admin-text-main)',
                  borderColor: isAllSelected ? '#1E2229' : 'var(--admin-border)',
                  fontSize: '0.8rem',
                  padding: '0.4rem 0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <CheckSquare size={14} />
                <span>{isAllSelected ? 'Deselect All' : `Select All (${filteredOrders.length})`}</span>
              </button>

              {selectedOrderIds.length > 0 && (
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--admin-text-main)' }}>
                  {selectedOrderIds.length} of {filteredOrders.length} orders selected
                </span>
              )}
            </div>

            {selectedOrderIds.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)', fontWeight: 500 }}>
                  Change Status:
                </span>
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value)}
                  className="shv-overview-select"
                  style={{ padding: '0.35rem 0.6rem', fontSize: '0.8rem', textTransform: 'capitalize' }}
                >
                  <option value="">Choose new status...</option>
                  <option value="pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button
                  type="button"
                  disabled={!bulkStatus}
                  onClick={handleApplyBulkStatus}
                  className="shv-btn-primary"
                  style={{
                    padding: '0.35rem 0.85rem',
                    fontSize: '0.8rem',
                    opacity: bulkStatus ? 1 : 0.5,
                    cursor: bulkStatus ? 'pointer' : 'not-allowed',
                  }}
                >
                  Apply
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrderIds([])}
                  className="shv-btn-secondary"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        )}

        <div className="shv-admin-table-wrap">
          <table className="shv-admin-table">
            <thead>
              <tr>
                {/* Select column - Hidden in 'All' tab */}
                {selectedStatusTab !== 'All' && (
                  <th style={{ width: '44px', textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={handleToggleSelectAll}
                      style={{
                        cursor: 'pointer',
                        width: '16px',
                        height: '16px',
                        accentColor: '#1E2229',
                      }}
                      title={isAllSelected ? 'Deselect all orders in this tab' : 'Select all orders in this tab'}
                    />
                  </th>
                )}
                <th>Order ID</th>
                <th>Shipping Address</th>
                <th>Silhouettes &amp; Qty</th>
                <th>Total Value</th>
                <th>Payment</th>
                <th>Dispatch Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={selectedStatusTab === 'All' ? 7 : 8}
                    style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)' }}
                  >
                    No orders found matching your active filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const orderRef = ord.orderNumber || ord._id;
                  const orderKey = ord._id || ord.orderNumber;
                  const isChecked = selectedOrderIds.includes(orderKey);
                  const itemCount = (ord.items || []).reduce((acc, i) => acc + (i.quantity || i.qty || 1), 0);
                  const firstItem = (ord.items || [])[0];
                  const placedDate = ord.createdAt
                    ? new Date(ord.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                    : '—';
                  const addrCity = ord.address?.city || '';
                  const addrPhone = ord.address?.phone || '';

                  return (
                    <tr
                      key={ord._id || orderRef}
                      style={{ background: isChecked ? '#F8FAFC' : undefined }}
                    >
                      {/* Select Checkbox Cell - Hidden in 'All' tab */}
                      {selectedStatusTab !== 'All' && (
                        <td style={{ width: '44px', textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleSelect(orderKey)}
                            style={{
                              cursor: 'pointer',
                              width: '16px',
                              height: '16px',
                              accentColor: '#1E2229',
                            }}
                            aria-label={`Select order ${orderRef}`}
                          />
                        </td>
                      )}
                      <td>
                        <strong className="shv-table-order-id">{orderRef}</strong>
                        <div style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)' }}>{placedDate}</div>
                        {ord.waybill && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-light)', marginTop: 2 }}>
                            Waybill: {ord.waybill}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{addrCity}</div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--admin-text-muted)' }}>{addrPhone}</div>
                      </td>
                      <td>
                        <div className="shv-table-item-cell">
                          {firstItem?.image && (
                            <img
                              src={getImageUrl(firstItem.image)}
                              alt={firstItem.name}
                              className="shv-table-item-thumb"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          )}
                          <div>
                            <div style={{ fontWeight: 500, fontSize: '0.84rem' }}>{firstItem?.name}</div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)' }}>
                              {itemCount} {itemCount === 1 ? 'Piece' : 'Pieces'}
                              {ord.items?.length > 1 ? ` • +${ord.items.length - 1} more` : ` • ${firstItem?.size || '925 Silver'}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <strong style={{ fontSize: '0.95rem' }}>
                          ₹{Number(ord.totalAmount || 0).toLocaleString('en-IN')}
                        </strong>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.82rem', fontWeight: 500, textTransform: 'capitalize' }}>
                          {ord.payment?.method || 'razorpay'}
                        </div>
                        <div style={{
                          fontSize: '0.74rem',
                          color: ord.payment?.status === 'paid' ? 'var(--admin-green)' : 'var(--admin-amber)',
                          textTransform: 'capitalize',
                        }}>
                          ● {ord.payment?.status || 'pending'}
                        </div>
                      </td>
                      <td>
                        <select
                          value={ord.status || 'pending'}
                          onChange={(e) => onUpdateStatus(ord._id || orderRef, e.target.value)}
                          className={`shv-status-pill ${getStatusBadgeClass(ord.status)}`}
                          style={{ border: 'none', outline: 'none', cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="accepted">Accepted</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
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
                <h3 className="shv-modal-title">
                  Consignment {selectedOrder.orderNumber || selectedOrder._id}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                  Placed on {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleDateString('en-IN') : '—'}
                  {selectedOrder.waybill ? ` • Waybill: ${selectedOrder.waybill}` : ' • BlueDart Air Express'}
                </span>
              </div>
              <button type="button" onClick={() => setSelectedOrder(null)} className="shv-modal-close-btn">
                ✕
              </button>
            </div>

            {/* Shipping Address */}
            <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem', border: '1px solid var(--admin-border)' }}>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--admin-text-light)', marginBottom: '0.5rem', fontWeight: 700 }}>
                Shipping Destination
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                {selectedOrder.address?.addressline || 'Address recorded'}
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--admin-text-muted)', marginBottom: '0.2rem' }}>
                {[selectedOrder.address?.city, selectedOrder.address?.state, selectedOrder.address?.pincode].filter(Boolean).join(', ')}
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--admin-text-main)' }}>
                Phone: {selectedOrder.address?.phone || '—'}
              </div>
            </div>

            {/* Items */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--admin-text-light)', marginBottom: '0.75rem', fontWeight: 700 }}>
                Certified 925 Pure Silver Pieces
              </div>
              {(selectedOrder.items || []).map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid var(--admin-border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {item.image && (
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover' }}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.86rem' }}>{item.name}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--admin-text-muted)' }}>
                        Qty: {item.quantity || item.qty || 1} • Size: {item.size || 'Free Size'}
                        {item.color ? ` • ${item.color}` : ''}
                      </div>
                    </div>
                  </div>
                  <strong style={{ fontSize: '0.9rem' }}>
                    ₹{((item.price || 0) * (item.quantity || item.qty || 1)).toLocaleString('en-IN')}
                  </strong>
                </div>
              ))}
            </div>

            {/* Total & actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--admin-border)' }}>
              <div>
                <span style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>Total Amount: </span>
                <strong style={{ fontSize: '1.2rem' }}>₹{Number(selectedOrder.totalAmount || 0).toLocaleString('en-IN')}</strong>
                <div style={{ fontSize: '0.76rem', color: 'var(--admin-text-muted)', marginTop: 2 }}>
                  Payment: <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                    {selectedOrder.payment?.method} — {selectedOrder.payment?.status}
                  </span>
                </div>
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
                <button type="button" onClick={() => setSelectedOrder(null)} className="shv-btn-primary">
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
