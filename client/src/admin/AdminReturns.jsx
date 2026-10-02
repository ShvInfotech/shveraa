import React, { useState, useEffect, useCallback } from 'react';
import { Eye, Printer, RotateCcw, Undo2, RefreshCw, User, Phone, Mail, MapPin, Truck, CreditCard, Wallet, FileText } from 'lucide-react';
import { apiAdminGetRTOReturnOrders, getImageUrl } from '../services/api';

// Flow type badge config – the order `type` field decides which one applies
const FLOW_BADGES = {
  rto: { label: 'RTO', icon: RotateCcw, color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
  return: { label: 'Return', icon: Undo2, color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
};

const REFUND_STATUS_CLASS = {
  refunded: 'delivered',
  completed: 'delivered',
  pending: 'onhold',
  processing: 'ontheway',
  failed: 'cancelled',
  rejected: 'cancelled',
};

const getStatusBadgeClass = (status) => {
  const s = (status || '').toLowerCase();
  if (['refunded', 'completed', 'closed', 'delivered', 'success'].includes(s)) return 'delivered';
  if (['pending', 'processing', 'accepted', 'requested', 'initiated'].includes(s)) return 'onhold';
  if (['cancelled', 'failed', 'rejected'].includes(s)) return 'cancelled';
  if (['shipped', 'out_for_delivery', 'in_transit', 'in transit', 'picked', 'picked_up'].includes(s)) return 'ontheway';
  return 'scheduled';
};

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// Picks the logistics info that matches the order's flow (return vs RTO)
const getFlowData = (ord) => (ord?.type === 'rto' ? ord?.rtoData : ord?.returnData) || {};

const AdminReturns = ({ searchQuery }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  // No type is passed → the API returns BOTH return and RTO orders mixed together.
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiAdminGetRTOReturnOrders();
      setItems(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      setItems([]);
      setError(err.message || 'Failed to load records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  // Client-side search across order ref, customer, waybill & reason
  const q = (searchQuery || '').toLowerCase().trim();
  const filtered = q
    ? items.filter((ord) => {
        const flow = getFlowData(ord);
        return [
          ord.orderNumber,
          ord._id,
          ord.type,
          ord.waybill,
          ord.userInfo?.name,
          ord.userInfo?.phone,
          ord.userInfo?.email,
          ord.address?.phone,
          flow?.waybill,
          flow?.reason,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q));
      })
    : items;

return (
    <div className="shv-admin-orders-view">
      {/* Header Banner */}
      <div className="shv-table-card-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 className="shv-table-title" style={{ fontSize: '1.4rem' }}>
            Return &amp; RTO Management ({filtered.length})
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--admin-text-muted)' }}>
            Customer return requests and Return-To-Origin consignments for certified 925 sterling silver pieces.
          </p>
        </div>

        {/* Refresh */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => fetchRecords()}
            className="shv-table-filter-btn"
            title="Reload return & RTO records"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#DC2626',
            borderRadius: '12px',
            padding: '0.85rem 1.1rem',
            marginBottom: '1rem',
            fontSize: '0.86rem',
            fontWeight: 500,
          }}
        >
          {error}
        </div>
      )}

      {/* Records Table Card */}
      <div className="shv-admin-table-card">
        <div className="shv-admin-table-wrap">
          <table className="shv-admin-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Return / RTO Waybill</th>
                <th>Silhouettes &amp; Qty</th>
                <th>Refund</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)' }}>
                    Loading return &amp; RTO records…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)' }}>
                    No return or RTO records found.
                  </td>
                </tr>
              ) : (
                filtered.map((ord) => {
                  const flow = getFlowData(ord);
                  const refund = ord.refundData || {};
                  const firstItem = (ord.items || [])[0];
                  const itemCount = (ord.items || []).reduce((acc, i) => acc + (i.quantity || i.qty || 1), 0);
                  const flowStatus = flow?.status || ord.status || 'pending';
                  const flowBadge = FLOW_BADGES[ord.type] || FLOW_BADGES.return;
                  const FlowBadgeIcon = flowBadge.icon;

return (
                    <tr key={ord._id || ord.orderNumber}>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            padding: '0.22rem 0.6rem',
                            borderRadius: '999px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                            color: flowBadge.color,
                            background: flowBadge.bg,
                            border: `1px solid ${flowBadge.border}`,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <FlowBadgeIcon size={12} />
                          {flowBadge.label}
                        </span>
                      </td>
                      <td>
                        <strong className="shv-table-order-id">{ord.orderNumber || ord._id}</strong>
                        <div style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)' }}>
                          {formatDate(ord.createdAt)}
                        </div>
                        {ord.waybill && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--admin-text-light)', marginTop: 2 }}>
                            Forward: {ord.waybill}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{ord.userInfo?.name || 'Guest Customer'}</div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--admin-text-muted)' }}>
                          {ord.userInfo?.phone || ord.address?.phone || '—'}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontFamily: 'monospace', fontWeight: 600, color: '#2563EB', fontSize: '0.82rem' }}>
                          {flow?.waybill || '—'}
                        </div>
                        {flow?.reason && (
                          <div style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)' }} title={flow.reason}>
                            {flow.reason.length > 42 ? `${flow.reason.slice(0, 42)}…` : flow.reason}
                          </div>
                        )}
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
                            <div style={{ fontWeight: 500, fontSize: '0.84rem' }}>{firstItem?.name || '—'}</div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--admin-text-muted)' }}>
                              {itemCount} {itemCount === 1 ? 'Piece' : 'Pieces'}
                              {ord.items?.length > 1 ? ` • +${ord.items.length - 1} more` : ` • ${firstItem?.size || '925 Silver'}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: '0.82rem', fontWeight: 500 }}>
                          ₹{Number(ord.totalAmount || ord.amount || 0).toLocaleString('en-IN')}
                        </div>
                        <div
                          style={{
                            fontSize: '0.74rem',
                            textTransform: 'capitalize',
                            color: refund.status === 'refunded' ? 'var(--admin-green)' : 'var(--admin-amber)',
                          }}
                        >
                          ● {refund.status || 'pending'} {refund.method ? `• ${refund.method}` : ''}
                        </div>
                      </td>
                      <td>
                        <p className={`shv-status-pill ${getStatusBadgeClass(flowStatus)}`}>{flowStatus}</p>
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => setSelectedItem(ord)}
                          className="shv-table-filter-btn"
                          title="Inspect Return / RTO Consignment"
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

      {/* Full Detail Modal */}
      {selectedItem && (
        <div className="shv-modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="shv-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="shv-modal-header">
              <div>
                <h3 className="shv-modal-title">
                  {selectedItem.type === 'rto' ? 'RTO' : 'Return'} #{selectedItem.orderNumber || selectedItem._id}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                  Raised {formatDate(selectedItem.createdAt)}
                  {selectedItem.waybill ? ` • Original Waybill: ${selectedItem.waybill}` : ''}
                </span>
              </div>
              <button type="button" onClick={() => setSelectedItem(null)} className="shv-modal-close-btn">
                ✕
              </button>
            </div>

            {/* Return / RTO Flow Information */}
            <div
              style={{
                background: '#F8FAFC',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.25rem',
                border: '1px solid var(--admin-border)',
              }}
            >
              <div
                style={{
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--admin-text-light)',
                  marginBottom: '0.5rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <Truck size={13} />
                {selectedItem.type === 'rto' ? 'RTO Consignment Details' : 'Return Consignment Details'}
              </div>
              <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', fontSize: '0.86rem' }}>
                <div>
                  <span style={{ color: 'var(--admin-text-muted)' }}>Waybill: </span>
                  <strong style={{ fontFamily: 'monospace' }}>{getFlowData(selectedItem).waybill || '—'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--admin-text-muted)' }}>Status: </span>
                  <strong style={{ textTransform: 'capitalize' }}>{getFlowData(selectedItem).status || '—'}</strong>
                </div>
              </div>
              {getFlowData(selectedItem).reason && (
                <div style={{ marginTop: '0.6rem', fontSize: '0.86rem' }}>
                  <span style={{ color: 'var(--admin-text-muted)' }}>Reason: </span>
                  <strong>{getFlowData(selectedItem).reason}</strong>
                </div>
              )}
            </div>

            {/* Customer */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div
                style={{
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--admin-text-light)',
                  marginBottom: '0.5rem',
                  fontWeight: 700,
                }}
              >
                Customer Information
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.86rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={14} style={{ color: 'var(--admin-text-muted)' }} />
                  <strong>{selectedItem.userInfo?.name || 'Guest Customer'}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={14} style={{ color: 'var(--admin-text-muted)' }} />
                  <span>{selectedItem.userInfo?.phone || selectedItem.address?.phone || '—'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Mail size={14} style={{ color: 'var(--admin-text-muted)' }} />
                  <span>{selectedItem.userInfo?.email || '—'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <MapPin size={14} style={{ color: 'var(--admin-text-muted)', marginTop: 3, flexShrink: 0 }} />
                  <span>
                    {[
                      selectedItem.address?.addressline,
                      selectedItem.address?.city,
                      selectedItem.address?.state,
                      selectedItem.address?.pincode,
                      selectedItem.address?.country,
                    ]
                      .filter(Boolean)
                      .join(', ') || 'Address not available'}
                  </span>
                </div>
              </div>
            </div>

{/* Items */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div
                style={{
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--admin-text-light)',
                  marginBottom: '0.75rem',
                  fontWeight: 700,
                }}
              >
                Certified 925 Pure Silver Pieces
              </div>
              {(selectedItem.items || []).length === 0 ? (
                <div style={{ fontSize: '0.84rem', color: 'var(--admin-text-muted)' }}>No items recorded.</div>
              ) : (
                (selectedItem.items || []).map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 0',
                      borderBottom: '1px solid var(--admin-border-subtle)',
                    }}
                  >
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
                ))
              )}
            </div>

{/* Refund & Account Details */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div
                style={{
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--admin-text-light)',
                  marginBottom: '0.5rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <Wallet size={13} />
                Refund &amp; Settlement
              </div>
              <div style={{ fontSize: '0.86rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div>
                  <span style={{ color: 'var(--admin-text-muted)' }}>Refund Status: </span>
                  <span
                    className={`shv-status-pill ${REFUND_STATUS_CLASS[(selectedItem.refundData?.status || '').toLowerCase()] || 'onhold'}`}
                    style={{ padding: '0.15rem 0.55rem', fontSize: '0.74rem' }}
                  >
                    {selectedItem.refundData?.status || 'pending'}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--admin-text-muted)' }}>Method: </span>
                  <strong style={{ textTransform: 'capitalize' }}>
                    {selectedItem.refundData?.method || selectedItem.payment?.method || '—'}
                  </strong>
                </div>
                {selectedItem.refundData?.refundId && (
                  <div>
                    <span style={{ color: 'var(--admin-text-muted)' }}>Refund ID: </span>
                    <strong style={{ fontFamily: 'monospace' }}>{selectedItem.refundData.refundId}</strong>
                  </div>
                )}
                {selectedItem.refundData?.accountDetails && (
                  <div
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid var(--admin-border)',
                      borderRadius: '10px',
                      padding: '0.75rem 0.9rem',
                      marginTop: '0.15rem',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        marginBottom: '0.35rem',
                        fontWeight: 700,
                        fontSize: '0.78rem',
                        color: 'var(--admin-text-light)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      <FileText size={12} />
                      Bank Account
                    </div>
                    <div style={{ fontSize: '0.84rem', lineHeight: 1.6 }}>
                      <div>Holder: <strong>{selectedItem.refundData.accountDetails.accountHolderName || '—'}</strong></div>
                      <div>Account No: <strong style={{ fontFamily: 'monospace' }}>{selectedItem.refundData.accountDetails.accountNumber || '—'}</strong></div>
                      <div>IFSC: <strong style={{ fontFamily: 'monospace' }}>{selectedItem.refundData.accountDetails.ifscCode || '—'}</strong></div>
                      <div>Type: <strong style={{ textTransform: 'capitalize' }}>{selectedItem.refundData.accountDetails.accountType || '—'}</strong></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

{/* Payment */}
            <div style={{ marginBottom: '1.25rem' }}>
              <div
                style={{
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--admin-text-light)',
                  marginBottom: '0.5rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <CreditCard size={13} />
                Payment
              </div>
              <div style={{ fontSize: '0.86rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div>
                  <span style={{ color: 'var(--admin-text-muted)' }}>Method: </span>
                  <strong style={{ textTransform: 'capitalize' }}>{selectedItem.payment?.method || '—'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--admin-text-muted)' }}>Status: </span>
                  <strong style={{ textTransform: 'capitalize' }}>{selectedItem.payment?.status || '—'}</strong>
                </div>
                {selectedItem.payment?.paymentId && (
                  <div>
                    <span style={{ color: 'var(--admin-text-muted)' }}>Payment ID: </span>
                    <strong style={{ fontFamily: 'monospace' }}>{selectedItem.payment.paymentId}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Totals & Actions */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '1rem',
                borderTop: '1px solid var(--admin-border)',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>Total Amount: </span>
                <strong style={{ fontSize: '1.2rem' }}>
                  ₹{Number(selectedItem.totalAmount || selectedItem.amount || 0).toLocaleString('en-IN')}
                </strong>
                <div style={{ fontSize: '0.76rem', color: 'var(--admin-text-muted)', marginTop: 2 }}>
                  Discount: ₹{Number(selectedItem.discount || 0).toLocaleString('en-IN')} • Shipping: ₹
                  {Number(selectedItem.shippingcharges || 0).toLocaleString('en-IN')}
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
                <button type="button" onClick={() => setSelectedItem(null)} className="shv-btn-primary">
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

export default AdminReturns;