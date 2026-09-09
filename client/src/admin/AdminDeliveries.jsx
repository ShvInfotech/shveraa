import React from 'react';
import { Truck, Box, CheckCircle2, Clock, XCircle, MapPin, ExternalLink } from 'lucide-react';

const AdminDeliveries = ({ orders, deliveryFilter, setDeliveryFilter, onUpdateStatus }) => {
  const filtered = orders.filter((ord) => {
    if (!deliveryFilter || deliveryFilter === 'All') return true;
    if (deliveryFilter === 'On Progress') return ord.status === 'On The Way' || ord.status === 'Scheduled';
    if (deliveryFilter === 'Delivered') return ord.status === 'Delivered';
    if (deliveryFilter === 'Canceled') return ord.status === 'Cancelled';
    if (deliveryFilter === 'Pending') return ord.status === 'Scheduled' || ord.status === 'On Hold';
    return true;
  });

  return (
    <div className="shv-admin-deliveries-view">
      <div className="shv-table-card-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 className="shv-table-title" style={{ fontSize: '1.4rem' }}>
            Air Express Logistics &amp; Consignments ({filtered.length})
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--admin-text-muted)' }}>
            Filter: <strong>{deliveryFilter || 'All'}</strong> • BlueDart Air Express &amp; Delhivery Partner Networks.
          </p>
        </div>

        {/* Quick filter pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['All', 'On Progress', 'Delivered', 'Canceled', 'Pending'].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setDeliveryFilter(f)}
              className="shv-table-filter-btn"
              style={{
                background: deliveryFilter === f ? '#1E2229' : '#FFFFFF',
                color: deliveryFilter === f ? '#FFFFFF' : 'var(--admin-text-main)',
                borderColor: deliveryFilter === f ? '#1E2229' : 'var(--admin-border)',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Deliveries Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {filtered.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem', background: '#FFFFFF', borderRadius: '16px', border: '1px solid var(--admin-border)' }}>
            <Truck size={36} style={{ color: 'var(--admin-text-light)', marginBottom: '1rem' }} />
            <h3>No shipments currently in "{deliveryFilter}" stage</h3>
            <p style={{ color: 'var(--admin-text-muted)', fontSize: '0.9rem' }}>
              Switch filter to view other consignment states.
            </p>
          </div>
        ) : (
          filtered.map((ord) => (
            <div
              key={ord.orderId}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid var(--admin-border)',
                padding: '1.5rem',
                boxShadow: 'var(--admin-shadow-card)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Top Row: Order ID & Status */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{ord.displayId || ord.orderId}</span>
                <span className={`shv-status-pill ${ord.status === 'Delivered' ? 'delivered' : ord.status === 'Cancelled' ? 'cancelled' : 'ontheway'}`}>
                  {ord.status}
                </span>
              </div>

              {/* Carrier & AWB */}
              <div style={{ background: '#F8FAFC', padding: '0.85rem', borderRadius: '10px', marginBottom: '1rem', border: '1px solid var(--admin-border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
                  <span>Carrier:</span>
                  <strong style={{ color: 'var(--admin-text-main)' }}>{ord.carrier || 'BlueDart Air Express'}</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--admin-text-muted)', marginTop: '0.35rem' }}>
                  <span>AWB Docket:</span>
                  <strong style={{ color: '#2563EB', fontFamily: 'monospace' }}>{ord.trackingNumber || 'BD-88492019'}</strong>
                </div>
              </div>

              {/* Destination */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.84rem' }}>
                <MapPin size={16} style={{ color: 'var(--admin-text-muted)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: 600 }}>{ord.customer.fullName}</div>
                  <div style={{ color: 'var(--admin-text-muted)', fontSize: '0.78rem' }}>{ord.customer.city}</div>
                </div>
              </div>

              {/* Delivery ETA & Actions */}
              <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--admin-border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '0.76rem', color: 'var(--admin-text-muted)' }}>
                  ETA: <strong style={{ color: 'var(--admin-text-main)' }}>{ord.estimatedDelivery}</strong>
                </div>

                {ord.status !== 'Delivered' && ord.status !== 'Cancelled' && (
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(ord.orderId, 'Delivered')}
                    className="shv-btn-secondary"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <CheckCircle2 size={13} style={{ color: 'var(--admin-green)' }} />
                    <span>Mark Delivered</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminDeliveries;
