import React, { useState } from 'react';
import { Eye, Printer, CheckSquare, Download, LoaderCircle, CircleAlert, CircleCheck } from 'lucide-react';
import { getImageUrl, apiAdminDownloadLabels, downloadBlobFile } from '../services/api';

const STATUS_TABS = ['pending', 'accepted', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

// Today in YYYY-MM-DD, used as the default Delhivery pickup date.
const todayISODate = () => new Date().toISOString().slice(0, 10);

const AdminOrders = ({ orders, onUpdateStatus, searchQuery, isLoading = false }) => {
  const [selectedStatusTab, setSelectedStatusTab] = useState('pending');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderIds, setSelectedOrderIds] = useState([]);
  const [isDownloadingLabels, setIsDownloadingLabels] = useState(false);
  const [labelNotice, setLabelNotice] = useState(null);
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('');
  console.log(orders)
  // Filter orders – uses real DB fields
  const filteredOrders = orders.filter((ord) => {
    const matchesTab =
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
    setLabelNotice(null);
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

  // Ask the server for the packing slips of every selected order and save the
  // merged PDF straight to disk. A pending batch additionally books a Delhivery
  // pickup, so it needs the chosen date/time; every other status omits them.
  const handleDownloadLabels = async () => {
    if (selectedOrderIds.length === 0 || isDownloadingLabels) return;

    const isPending = selectedStatusTab === 'pending';

    if (isPending && (!pickupDate || !pickupTime)) {
      setLabelNotice({ tone: 'error', text: 'Please select pickup date and time before downloading labels.' });
      alert('Please select pickup date and time before downloading labels / તમે pickup date અને time select નથી કરી.');
      return;
    }

    const selectedOrders = filteredOrders.filter((ord) =>
      selectedOrderIds.includes(ord._id || ord.orderNumber)
    );

    // Orders without a waybill cannot be shipped, so they are reported instead of sent.
    const waybills = selectedOrders.map((ord) => ord.waybill).filter(Boolean);
    const skippedCount = selectedOrders.length - waybills.length;
    if (waybills.length === 0) {
      setLabelNotice({
        tone: 'error',
        text: 'None of the selected orders have a waybill yet.',
      });
      return;
    }

    setIsDownloadingLabels(true);
    setLabelNotice(null);

    try {
      const { blob, fileName } = await apiAdminDownloadLabels({
        waybills,
        type: selectedStatusTab,
        time: pickupTime,
        date: pickupDate,
      });

      downloadBlobFile(blob, fileName);

      // The server moves pending orders to accepted once their pickup is booked,
      // so mirror that locally to keep the current tab consistent.
      if (isPending && onUpdateStatus) {
        selectedOrders.forEach((ord) => {
          if (ord.waybill) onUpdateStatus(ord._id || ord.orderNumber, 'accepted');
        });
      }

      setSelectedOrderIds([]);
      setLabelNotice({
        tone: 'success',
        text:
          `Downloaded ${waybills.length} label${waybills.length === 1 ? '' : 's'}.` +
          (skippedCount > 0 ? ` ${skippedCount} order(s) skipped — no waybill.` : ''),
      });
    } catch (err) {
      console.error('Admin: Label download failed:', err);
      setLabelNotice({ tone: 'error', text: err.message || 'Failed to download labels.' });
    } finally {
      setIsDownloadingLabels(false);
    }
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
        <div className="shv-status-tabs-scroll">
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
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {tab === 'out_for_delivery' ? 'Out for Delivery' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table Card */}
      <div className="shv-admin-table-card">
        {/* Bulk Action & Select All Bar */}
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
                Download Label:
              </span>

              {/* Only a pending batch books a Delhivery pickup, so only it needs a slot. */}
              {selectedStatusTab === 'pending' && (
                <>
                  <input
                    type="date"
                    value={pickupDate}
                    min={todayISODate()}
                    onChange={(e) => {
                      setPickupDate(e.target.value);
                      setLabelNotice(null);
                    }}
                    className="shv-overview-select"
                    aria-label="Pickup date"
                    title="Select Delhivery Pickup Date"
                    style={{
                      padding: '0.35rem 0.6rem',
                      fontSize: '0.8rem',
                      borderColor: labelNotice?.tone === 'error' && !pickupDate ? '#EF4444' : undefined,
                    }}
                  />
                  <input
                    type="time"
                    value={pickupTime}
                    onChange={(e) => {
                      setPickupTime(e.target.value);
                      setLabelNotice(null);
                    }}
                    className="shv-overview-select"
                    aria-label="Pickup time"
                    title="Select Delhivery Pickup Time"
                    style={{
                      padding: '0.35rem 0.6rem',
                      fontSize: '0.8rem',
                      borderColor: labelNotice?.tone === 'error' && !pickupTime ? '#EF4444' : undefined,
                    }}
                  />
                </>
              )}

              <button
                type="button"
                disabled={isDownloadingLabels}
                onClick={handleDownloadLabels}
                className="shv-btn-primary"
                style={{
                  padding: '0.35rem 0.85rem',
                  fontSize: '0.8rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  opacity: isDownloadingLabels ? 0.6 : 1,
                  cursor: isDownloadingLabels ? 'progress' : 'pointer',
                }}
              >
                {isDownloadingLabels ? (
                  <LoaderCircle size={14} className="shv-admin-spin" />
                ) : (
                  <Download size={14} />
                )}
                <span>{isDownloadingLabels ? 'Generating…' : 'Download Label'}</span>
              </button>

              {labelNotice && (
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: labelNotice.tone === 'error' ? 'var(--admin-red)' : 'var(--admin-green)',
                  }}
                >
                  {labelNotice.tone === 'error' ? <CircleAlert size={14} /> : <CircleCheck size={14} />}
                  <span>{labelNotice.text}</span>
                </span>
              )}
            </div>
          )}
        </div>

        <div className="shv-admin-table-wrap desktop-orders-table">
          <table className="shv-admin-table">
            <thead>
              <tr>
                {/* Select column */}
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
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)' }}
                  >
                    Loading orders…
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
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
                      {/* Select Checkbox Cell */}
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
                      <td>
                        <strong
                          className="shv-table-order-id"
                          onClick={() => setSelectedOrder(ord)}
                          style={{ cursor: 'pointer' }}
                          title="Click to view order details"
                        >
                          {orderRef}
                        </strong>
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
                        <p className={`shv-status-pill ${getStatusBadgeClass(ord.status)}`}>{ord.status || 'pending'}</p>
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

        {/* Shopify-style Mobile Order Cards */}
        <div className="shv-mobile-orders-list mobile-orders-cards">
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)' }}>
              Loading orders…
            </div>
          ) : filteredOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)' }}>
              No orders found matching your active filter.
            </div>
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
                <div
                  key={ord._id || orderRef}
                  className={`shv-mobile-order-card ${isChecked ? 'selected' : ''}`}
                >
                  <div className="shv-moc-header">
                    <div className="shv-moc-id-group">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleSelect(orderKey)}
                        className="shv-moc-checkbox"
                        aria-label={`Select order ${orderRef}`}
                      />
                      <div>
                        <div
                          className="shv-moc-order-id"
                          onClick={() => setSelectedOrder(ord)}
                          style={{ cursor: 'pointer' }}
                          title="Click to view order details"
                        >
                          {orderRef}
                        </div>
                        <div className="shv-moc-order-date">{placedDate}</div>
                      </div>
                    </div>

                    <span className={`shv-status-pill ${getStatusBadgeClass(ord.status)}`}>
                      {ord.status || 'pending'}
                    </span>
                  </div>

                  <div className="shv-moc-item" onClick={() => setSelectedOrder(ord)}>
                    {firstItem?.image && (
                      <img
                        src={getImageUrl(firstItem.image)}
                        alt={firstItem.name}
                        className="shv-moc-thumb"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}
                    <div className="shv-moc-item-details">
                      <div className="shv-moc-item-title">{firstItem?.name || 'Sterling Silver Silhouette'}</div>
                      <div className="shv-moc-item-sub">
                        {itemCount} {itemCount === 1 ? 'Piece' : 'Pieces'}
                        {ord.items?.length > 1 ? ` • +${ord.items.length - 1} more` : ` • ${firstItem?.size || '925 Silver'}`}
                      </div>
                    </div>
                  </div>

                  <div className="shv-moc-footer">
                    <div className="shv-moc-pricing">
                      <div className="shv-moc-amount">
                        ₹{Number(ord.totalAmount || 0).toLocaleString('en-IN')}
                      </div>
                      <div className={`shv-moc-payment-badge ${ord.payment?.status === 'paid' ? 'paid' : 'pending'}`}>
                        ● {ord.payment?.method || 'razorpay'} ({ord.payment?.status || 'pending'})
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedOrder(ord)}
                      className="shv-moc-view-btn"
                    >
                      <Eye size={14} />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
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

            {/* Customer Info */}
            <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem', border: '1px solid var(--admin-border)' }}>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--admin-text-light)', marginBottom: '0.5rem', fontWeight: 700 }}>
                Customer Details
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                {selectedOrder.userData?.name || selectedOrder.address?.addressline || '—'}
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--admin-text-muted)', marginBottom: '0.2rem' }}>
                Email: {selectedOrder.userData?.email || '—'}
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--admin-text-main)' }}>
                Phone: {selectedOrder.userData?.phone || selectedOrder.address?.phone || '—'}
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--admin-text-main)' }}>
                address: {`${selectedOrder.address?.addressline},${selectedOrder.address?.city},${selectedOrder.address?.state},${selectedOrder.address?.pincode}` || selectedOrder.address?.phone || '—'}
              </div>
            </div>

            {/* Pickup Request Info */}
            <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem', border: '1px solid var(--admin-border)' }}>
              <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--admin-text-light)', marginBottom: '0.5rem', fontWeight: 700 }}>
                Pickup Request
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--admin-text-muted)', marginBottom: '0.2rem' }}>
                Picup ID: {selectedOrder.picuprequest?.picupId || '—'}
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--admin-text-main)', marginBottom: '0.2rem' }}>
                Date: {selectedOrder.picuprequest?.picupdate || '—'}
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--admin-text-main)' }}>
                Time: {selectedOrder.picuprequest?.picupTime || '—'}
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

                <div>

                  <span style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>discount: </span>
                  <span style={{ fontSize: '1.2rem' }}>₹{Number(selectedOrder.discount || 0).toLocaleString('en-IN')}</span>
                </div>

                <div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>Shipping Charges: </span>
                  <span style={{ fontSize: '1.2rem' }}>₹{Number(selectedOrder.shippingcharges || 0).toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>Total Amount: </span>
                  <strong style={{ fontSize: '1.2rem' }}>₹{Number(selectedOrder.totalAmount || 0).toLocaleString('en-IN')}</strong>
                </div>

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
