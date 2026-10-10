import React from 'react';
import { DollarSign, CreditCard, Smartphone, Building, RefreshCw, CheckCircle2 } from 'lucide-react';

const AdminPayments = ({ orders = [] }) => {
  // Exclude cancelled orders entirely — cancelled orders do not count toward revenue or gross sales
  const validOrders = (orders || []).filter(
    (o) => (o.status || '').toLowerCase().trim() !== 'cancelled'
  );

  const totalRevenue = validOrders.reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0);
  const paidOrders = validOrders.filter((o) => (o.payment?.status || '').toLowerCase().trim() === 'paid');
  const paidRevenue = paidOrders.reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0);

  // Pending COD / Transit → ONLY orders whose payment status is "pending"
  // AND whose payment method is COD. Delivered and cancelled orders are excluded.
  const pendingCodOrders = validOrders.filter((o) => {
    const orderStatus = (o.status || '').toLowerCase().trim();
    const payStatus = (o.payment?.status || '').toLowerCase().trim();
    const payMethod = (o.payment?.method || '').toLowerCase().trim();
    return (
      payStatus === 'pending' &&
      payMethod === 'cod' &&
      orderStatus !== 'delivered'
    );
  });
  const pendingCodRevenue = pendingCodOrders.reduce(
    (acc, o) => acc + (Number(o.totalAmount) || 0),
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

      {/* 3 Metric Cards (Gross Sales, Settled Bank Balance, Pending COD) */}
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
                <span>{validOrders.length} Valid {validOrders.length === 1 ? 'Order' : 'Orders'}</span>
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
                <span>Direct Bank / Gateway Account</span>
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
                <span>
                  {pendingCodOrders.length} Pending COD {pendingCodOrders.length === 1 ? 'Order' : 'Orders'} • In Transit
                </span>
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
            256-Bit Encrypted Gateway Ledger ({validOrders.length} records)
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
              {validOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)' }}>
                    No payment transactions found.
                  </td>
                </tr>
              ) : (
                validOrders.map((ord, idx) => {
                  const isPaid = (ord.payment?.status || '').toLowerCase().trim() === 'paid';
                  const method = (ord.payment?.method || '').toLowerCase().trim();
                  return (
                    <tr key={ord._id || ord.orderNumber || idx}>
                      <td>
                        <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--admin-text-muted)' }}>
                          {ord.payment?.paymentId || ord.payment?.orderId || 'COD'}
                        </span>
                      </td>
                      <td>
                        <strong>{ord.orderNumber}</strong>
                      </td>
                      <td>
                        <span>{ord.userData?.name || ord.address?.name || 'Customer'}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {method === 'cod' ? (
                            <Building size={14} style={{ color: '#64748B' }} />
                          ) : method === 'razorpay' ? (
                            <Smartphone size={14} style={{ color: '#2563EB' }} />
                          ) : (
                            <CreditCard size={14} style={{ color: '#A07E52' }} />
                          )}
                          <span style={{ textTransform: 'uppercase' }}>{ord.payment?.method || 'N/A'}</span>
                        </div>
                      </td>
                      <td>
                        <strong>₹{(ord.totalAmount || 0).toLocaleString('en-IN')}</strong>
                      </td>
                      <td>
                        <span className={`shv-status-pill ${isPaid ? 'delivered' : 'onhold'}`}>
                          {ord.payment?.status || 'pending'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;
