import React, { useState } from 'react';
import { Tag, Plus, Trash2, Check, X, Percent, DollarSign, Sparkles } from 'lucide-react';
import { saveCoupon, deleteCoupon } from '../services/storeService';

const AdminCoupons = ({ coupons, onRefresh }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minSpend: '999',
    description: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.discountValue) return;

    saveCoupon({
      ...formData,
      code: formData.code.trim().toUpperCase(),
      discountValue: Number(formData.discountValue),
      minSpend: Number(formData.minSpend || 0),
      isActive: true,
    });

    setShowModal(false);
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      minSpend: '999',
      description: '',
    });
    onRefresh && onRefresh();
  };

  const handleDelete = (code) => {
    if (window.confirm(`Delete promotion code ${code}?`)) {
      deleteCoupon(code);
      onRefresh && onRefresh();
    }
  };

  const handleToggleActive = (coupon) => {
    saveCoupon({
      ...coupon,
      isActive: !coupon.isActive,
    });
    onRefresh && onRefresh();
  };

  return (
    <div className="shv-admin-coupons-view">
      {/* Header Banner */}
      <div className="shv-table-card-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 className="shv-table-title" style={{ fontSize: '1.4rem' }}>
            Coupons, Vouchers &amp; Promotions Engine ({coupons.length})
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--admin-text-muted)' }}>
            Active discount codes are validated in real-time during customer checkout on the storefront.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="shv-btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={16} />
          <span>Create Coupon Code</span>
        </button>
      </div>

      {/* Coupons Table Card */}
      <div className="shv-admin-table-card">
        <div className="shv-admin-table-wrap">
          <table className="shv-admin-table">
            <thead>
              <tr>
                <th>Voucher Code</th>
                <th>Discount Benefit</th>
                <th>Minimum Cart Spend</th>
                <th>Promotion Description</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.code}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Tag size={16} style={{ color: '#A07E52' }} />
                      <strong style={{ fontFamily: 'monospace', fontSize: '0.95rem', letterSpacing: '0.04em' }}>
                        {c.code}
                      </strong>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--admin-green)' }}>
                      {c.discountType === 'percentage'
                        ? `${c.discountValue}% OFF`
                        : `₹${c.discountValue} FLAT OFF`}
                    </span>
                  </td>
                  <td>
                    <span>
                      {c.minSpend > 0 ? `₹${c.minSpend.toLocaleString('en-IN')}` : 'No Minimum'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.84rem', color: 'var(--admin-text-muted)' }}>
                      {c.description || 'Special Atelier Discount'}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(c)}
                      className={`shv-status-pill ${c.isActive ? 'delivered' : 'cancelled'}`}
                      style={{ cursor: 'pointer', border: 'none' }}
                      title="Click to toggle status"
                    >
                      {c.isActive ? <Check size={12} /> : <X size={12} />}
                      <span>{c.isActive ? 'Active' : 'Disabled'}</span>
                    </button>
                  </td>
                  <td>
                    <button
                      type="button"
                      onClick={() => handleDelete(c.code)}
                      className="shv-table-filter-btn"
                      title="Delete Coupon"
                      style={{
                        padding: '0.35rem 0.65rem',
                        color: 'var(--admin-red)',
                        borderColor: 'rgba(239, 68, 68, 0.2)',
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      {showModal && (
        <div className="shv-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="shv-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="shv-modal-header">
              <h3 className="shv-modal-title">Create New Promo Voucher</h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="shv-modal-close-btn"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="shv-form-group">
                <label className="shv-form-label">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DIWALI25 or FESTIVE500"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="shv-form-input"
                  style={{ fontFamily: 'monospace', fontWeight: 600, textTransform: 'uppercase' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="shv-form-group">
                  <label className="shv-form-label">Discount Type *</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="shv-form-select"
                  >
                    <option value="percentage">Percentage Discount (%)</option>
                    <option value="flat">Flat Cash Discount (₹)</option>
                  </select>
                </div>

                <div className="shv-form-group">
                  <label className="shv-form-label">
                    Discount Value {formData.discountType === 'percentage' ? '(%)' : '(₹)'} *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder={formData.discountType === 'percentage' ? '20' : '500'}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="shv-form-input"
                  />
                </div>
              </div>

              <div className="shv-form-group">
                <label className="shv-form-label">Minimum Cart Value (₹ INR)</label>
                <input
                  type="number"
                  placeholder="999"
                  value={formData.minSpend}
                  onChange={(e) => setFormData({ ...formData, minSpend: e.target.value })}
                  className="shv-form-input"
                />
              </div>

              <div className="shv-form-group">
                <label className="shv-form-label">Voucher Description (Displayed at checkout)</label>
                <input
                  type="text"
                  placeholder="e.g. 20% off on your debut silver heirloom piece"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="shv-form-input"
                />
              </div>

              <div className="shv-form-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="shv-btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="shv-btn-primary">
                  Activate Voucher Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
