import React from 'react';
import { DollarSign, ArrowUpRight, CreditCard, Smartphone, Building, RefreshCw, CheckCircle2 } from 'lucide-react';

const AdminPayments = ({ orders }) => {
  const totalRevenue = orders.reduce((acc, o) => acc + (o.pricing?.total || 0), 0);
  const paidOrders = orders.filter((o) => o.paymentStatus === 'Paid');
  const paidRevenue = paidOrders.reduce((acc, o) => acc + (o.pricing?.total || 0), 0);
  const pendingRevenue = totalRevenue - paidRevenue;

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

      {/* 3 Metric Cards */}
      <div className="shv-admin-stats-grid" style={{ marginBottom: '2rem' }}>
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
              <div className="shv-stat-card-number">₹{pendingRevenue.toLocaleString('en-IN')}</div>
              <div className="shv-stat-trend">
                <span>On Air Express Delivery</span>
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
                        {txnId}
                      </span>
                    </td>
                    <td>
                      <strong>{ord.displayId || ord.orderId}</strong>
                    </td>
                    <td>
                      <span>{ord.customer.fullName}</span>
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
                        <span>{ord.paymentMethod}</span>
                      </div>
                    </td>
                    <td>
                      <strong>₹{(ord.pricing?.total || 0).toLocaleString('en-IN')}</strong>
                    </td>
                    <td>
                      <span className={`shv-status-pill ${isPaid ? 'delivered' : ord.paymentStatus === 'Refunded' ? 'cancelled' : 'onhold'}`}>
                        {ord.paymentStatus}
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
