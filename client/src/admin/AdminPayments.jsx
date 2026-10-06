import React from 'react';
import { DollarSign, ArrowUpRight, CreditCard, Smartphone, Building, RefreshCw, CheckCircle2, RotateCcw } from 'lucide-react';

const AdminPayments = ({ orders }) => {
  const totalRevenue = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
  const paidOrders = orders.filter((o) => o.payment?.status === 'paid');
  const paidRevenue = paidOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  // Pending COD / Transit → ONLY orders whose payment status is "pending"
  // AND whose payment method is COD. Delivered and cancelled orders are
  // excluded — cash already collected / order no longer live in transit.
  const pendingCodOrders = orders.filter((o) => {
    const orderStatus = (o.status || '').toLowerCase();
    return (
      o.payment?.status === 'pending' &&
      o.payment?.method === 'cod' &&
      orderStatus !== 'delivered' &&
      orderStatus !== 'cancelled'
    );
  });
  const pendingCodRevenue = pendingCodOrders.reduce(
    (acc, o) => acc + (o.totalAmount || 0),
    0
  );

  // Refunded / reversed amounts are shown in their own card beside it.
  const refundedOrders = orders.filter((o) => o.payment?.status === 'refunded');
  const refundedRevenue = refundedOrders.reduce(
    (acc, o) => acc + (o.totalAmount || 0),
    0
  );

  return (
    <div className="shv-admin-payments-view">
      {/* Header Banner */}
      <div className="shv-table-card-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 className="shv-table-title" style={{ fontSize: '1.4rem' }}>
            Payments, Settlements &amp; Revenue Overview
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--admin-text-muted)' }}>
            Consolidated Razorpay UPI, Card gateway payouts &amp; COD collections.
          </p>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="shv-admin-stats-grid grid-4" style={{ marginBottom: '2rem' }}>
        <div className="shv-admin-stat-card">
          <div className="shv-stat-card-header">
            <div className="shv-stat-card-icon">
              <DollarSign size={18} />
            </div>
            <span>Gross Sales Volume</span>
          </div>
          <div className="shv-stat-card-body">
            <div>
              <div className="shv-stat-card-number">₹{totalRevenue.toLocaleString('en-IN')}</div>
              <div className="shv-stat-trend positive">
                <span>+34.2%</span>
                <span>vs Last Month</span>
              </div>
            </div>
          </div>
        </div>

        <div className="shv-admin-stat-card">
          <div className="shv-stat-card-header">
            <div className="shv-stat-card-icon">
              <CheckCircle2 size={18} />
            </div>
            <span>Settled Bank Balance</span>
          </div>
          <div className="shv-stat-card-body">
            <div>
              <div className="shv-stat-card-number">₹{paidRevenue.toLocaleString('en-IN')}</div>
              <div className="shv-stat-trend positive">
                <span>Direct HDFC Account</span>
              </div>
            </div>
          </div>
        </div>

        <div className="shv-admin-stat-card">
          <div className="shv-stat-card-header">
            <div className="shv-stat-card-icon">
              <RefreshCw size={18} />
            </div>
            <span>Pending COD / Transit</span>
          </div>
          <div className="shv-stat-card-body">
            <div>
              <div className="shv-stat-card-number">₹{pendingCodRevenue.toLocaleString('en-IN')}</div>
              <div className="shv-stat-trend">
                <span>{pendingCodOrders.length} Pending COD {pendingCodOrders.length === 1 ? 'Order' : 'Orders'} • On Air Express Delivery</span>
              </div>
            </div>
          </div>
        </div>

        <div className="shv-admin-stat-card">
          <div className="shv-stat-card-header">
            <div className="shv-stat-card-icon">
              <RotateCcw size={18} />
            </div>
            <span>Refunded / Reversals</span>
          </div>
          <div className="shv-stat-card-body">
            <div>
              <div className="shv-stat-card-number">₹{refundedRevenue.toLocaleString('en-IN')}</div>
              <div className="shv-stat-trend">
                <span>{refundedOrders.length} Refunded {refundedOrders.length === 1 ? 'Order' : 'Orders'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Table Card */}
      <div className="shv-admin-table-card">
        <div className="shv-table-card-header">
          <h3 className="shv-table-title">Recent Payment Transactions</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--admin-text-muted)' }}>
            256-Bit Encrypted Gateway Ledger
          </span>
        </div>

        <div className="shv-admin-table-wrap">
          <table className="shv-admin-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Order Ref</th>
                <th>Patron Name</th>
                <th>Payment Method</th>
                <th>Amount</th>
                <th>Settlement Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((ord, idx) => {
                const txnId = `TXN-${984102 + idx * 73}`;
                const isPaid = ord.paymentStatus === 'Paid';
                return (
                  <tr key={ord.orderId}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--admin-text-muted)' }}>
                        {ord.payment.paymentId || "COD"}
                      </span>
                    </td>
                    <td>
                      <strong>{ord.orderNumber}</strong>
                    </td>
                    <td>
                      <span>{ord.userData.name}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {ord.paymentMethod?.includes('UPI') ? (
                          <Smartphone size={14} style={{ color: '#2563EB' }} />
                        ) : ord.paymentMethod?.includes('Card') ? (
                          <CreditCard size={14} style={{ color: '#A07E52' }} />
                        ) : (
                          <Building size={14} style={{ color: '#64748B' }} />
                        )}
                        <span>{ord.payment.method}</span>
                      </div>
                    </td>
                    <td>
                      <strong>₹{(ord.totalAmount || 0).toLocaleString('en-IN')}</strong>
                    </td>
                    <td>
                      <span className={`shv-status-pill ${isPaid ? 'delivered' : ord.paymentStatus === 'Refunded' ? 'cancelled' : 'onhold'}`}>
                        {ord.payment.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;
