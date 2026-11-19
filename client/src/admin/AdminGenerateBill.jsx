import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Plus,
  Download,
  Trash2,
  Search,
  RefreshCw,
  X,
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Package,
  Receipt,
  User,
  IndianRupee,
} from 'lucide-react';
import {
  apiAdminGetAllBills,
  apiAdminCreateBill,
  apiAdminDownloadBillPdf,
  apiAdminDeleteBill,
} from '../services/api';

const AdminGenerateBill = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [toast, setToast] = useState({ text: '', type: 'info' });

  // Form State
  const initialForm = {
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    productName: '',
    price: '',
    discount: '',
    shippingCharge: '',
    notes: '',
  };
  const [formData, setFormData] = useState(initialForm);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast({ text: '', type: 'info' }), 4000);
  };

  // Fetch all bills
  const fetchBills = async (search = '') => {
    setLoading(true);
    try {
      const data = await apiAdminGetAllBills(search);
      setBills(data.bills || []);
    } catch (err) {
      showToast(err.message || 'Failed to load bills', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  // Filter bills in-memory as well for responsive UI
  const filteredBills = useMemo(() => {
    if (!searchQuery.trim()) return bills;
    const q = searchQuery.toLowerCase().trim();
    return bills.filter(
      (b) =>
        (b.invoiceNumber && b.invoiceNumber.toLowerCase().includes(q)) ||
        (b.customerName && b.customerName.toLowerCase().includes(q)) ||
        (b.customerPhone && b.customerPhone.toLowerCase().includes(q)) ||
        (b.customerEmail && b.customerEmail.toLowerCase().includes(q)) ||
        (b.productName && b.productName.toLowerCase().includes(q))
    );
  }, [bills, searchQuery]);

  // Real-time calculation for modal preview
  const calculatedTotal = useMemo(() => {
    const priceNum = Number(formData.price) || 0;
    const discountNum = Number(formData.discount) || 0;
    const shippingNum = Number(formData.shippingCharge) || 0;
    return Math.max(0, priceNum - discountNum + shippingNum);
  }, [formData.price, formData.discount, formData.shippingCharge]);

  // Handle Create Bill Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customerName.trim()) {
      showToast('Please enter customer name', 'error');
      return;
    }
    if (!formData.customerPhone.trim()) {
      showToast('Please enter customer phone number', 'error');
      return;
    }
    if (!formData.customerAddress.trim()) {
      showToast('Please enter customer address', 'error');
      return;
    }
    if (!formData.productName.trim()) {
      showToast('Please enter product name', 'error');
      return;
    }
    if (!formData.price || Number(formData.price) < 0) {
      showToast('Please enter a valid price', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerName: formData.customerName.trim(),
        customerEmail: formData.customerEmail.trim(),
        customerPhone: formData.customerPhone.trim(),
        customerAddress: formData.customerAddress.trim(),
        productName: formData.productName.trim(),
        price: Number(formData.price),
        discount: formData.discount ? Number(formData.discount) : 0,
        shippingCharge: formData.shippingCharge ? Number(formData.shippingCharge) : 0,
        notes: formData.notes ? formData.notes.trim() : '',
      };

      const res = await apiAdminCreateBill(payload);
      const newBill = res.bill;

      // Prepend to current list
      setBills((prev) => [newBill, ...prev]);
      setShowModal(false);
      setFormData(initialForm);
      showToast(`Bill #${newBill.invoiceNumber} generated successfully! Downloading PDF...`);

      // Automatically download PDF right away
      try {
        await apiAdminDownloadBillPdf(newBill._id, newBill.invoiceNumber);
      } catch (dlErr) {
        console.error('Auto download error:', dlErr);
        showToast('Bill created, but PDF download failed. Use download button to retry.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Failed to generate bill', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Download Bill PDF
  const handleDownloadPdf = async (bill) => {
    if (downloadingId === bill._id) return;
    setDownloadingId(bill._id);
    try {
      await apiAdminDownloadBillPdf(bill._id, bill.invoiceNumber);
      showToast(`Invoice ${bill.invoiceNumber} downloaded.`);
    } catch (err) {
      showToast(err.message || 'Download failed', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  // Handle Delete Bill
  const handleDelete = async (bill) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete Bill #${bill.invoiceNumber} for ${bill.customerName}?`
    );
    if (!confirmDelete) return;

    try {
      await apiAdminDeleteBill(bill._id);
      setBills((prev) => prev.filter((b) => b._id !== bill._id));
      showToast(`Bill #${bill.invoiceNumber} deleted successfully.`);
    } catch (err) {
      showToast(err.message || 'Failed to delete bill', 'error');
    }
  };

  return (
    <div className="shv-admin-page-container">
      {/* Toast Alert */}
      {toast.text && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            backgroundColor: toast.type === 'error' ? '#ef4444' : '#10b981',
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 500,
            fontSize: '0.9rem',
          }}
        >
          <CheckCircle size={18} />
          <span>{toast.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div
        className="shv-table-card-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Receipt size={24} style={{ color: '#A07E52' }} />
            <h2 className="shv-table-title" style={{ fontSize: '1.4rem', margin: 0 }}>
              Generate Bill &amp; Invoice Management
            </h2>
          </div>
          <p
            style={{
              fontSize: '0.86rem',
              color: 'var(--admin-text-muted, #71717a)',
              margin: '4px 0 0 0',
            }}
          >
            Create customer invoices with live tax calculation, MongoDB records, and instant PDF downloads.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => fetchBills(searchQuery)}
            className="shv-btn-secondary"
            title="Refresh bills list"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 0.9rem',
              fontSize: '0.88rem',
            }}
          >
            <RefreshCw size={15} className={loading ? 'shv-spin' : ''} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="shv-btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.55rem 1.1rem',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            <Plus size={16} />
            <span>Add Bill</span>
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            position: 'relative',
            flex: '1',
            maxWidth: '420px',
            minWidth: '260px',
          }}
        >
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--admin-text-muted, #9ca3af)',
            }}
          />
          <input
            type="text"
            placeholder="Search by invoice #, customer name, phone, product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="shv-form-input"
            style={{
              paddingLeft: '36px',
              height: '38px',
              fontSize: '0.86rem',
              width: '100%',
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#9ca3af',
              }}
            >
              ✕
            </button>
          )}
        </div>

        <div style={{ fontSize: '0.86rem', color: 'var(--admin-text-muted, #71717a)' }}>
          Showing <strong>{filteredBills.length}</strong> of <strong>{bills.length}</strong> bills
        </div>
      </div>

      {/* Bills Records Table Card */}
      <div className="shv-admin-table-card">
        <div className="shv-admin-table-wrap">
          <table className="shv-admin-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Contact</th>
                <th>Product Details</th>
                <th>Price</th>
                <th>Discount</th>
                <th>Shipping</th>
                <th>Total</th>
                <th style={{ textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && bills.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem' }}>
                      <RefreshCw size={18} className="shv-spin" />
                      <span>Loading bills from database...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredBills.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '3rem' }}>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <Receipt size={40} style={{ color: '#d1d5db' }} />
                      <p style={{ fontWeight: 600, margin: 0, color: 'var(--admin-text-dark, #374151)' }}>
                        {searchQuery ? 'No matching bills found' : 'No bills generated yet'}
                      </p>
                      <p style={{ fontSize: '0.84rem', color: 'var(--admin-text-muted, #9ca3af)', margin: 0 }}>
                        {searchQuery
                          ? 'Try adjusting your search criteria'
                          : 'Click the "Add Bill" button above to generate your first invoice.'}
                      </p>
                      {!searchQuery && (
                        <button
                          type="button"
                          onClick={() => setShowModal(true)}
                          className="shv-btn-primary"
                          style={{ marginTop: '0.75rem', padding: '0.45rem 1rem', fontSize: '0.86rem' }}
                        >
                          <Plus size={14} style={{ marginRight: '4px' }} /> Generate Bill
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBills.map((b) => (
                  <tr key={b._id}>
                    {/* Invoice Number */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <FileText size={15} style={{ color: '#A07E52' }} />
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            fontSize: '0.92rem',
                            letterSpacing: '0.03em',
                            color: 'var(--admin-text-dark, #111827)',
                          }}
                        >
                          {b.invoiceNumber}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td>
                      <span style={{ fontSize: '0.84rem', color: 'var(--admin-text-muted, #6b7280)' }}>
                        {new Date(b.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </td>

                    {/* Customer */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 600, color: 'var(--admin-text-dark, #111827)' }}>
                          {b.customerName}
                        </span>
                        <span
                          style={{
                            fontSize: '0.78rem',
                            color: 'var(--admin-text-muted, #6b7280)',
                            maxWidth: '180px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={b.customerAddress}
                        >
                          {b.customerAddress}
                        </span>
                      </div>
                    </td>

                    {/* Contact (Phone / Email) */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Phone size={12} style={{ color: '#9ca3af' }} />
                          {b.customerPhone}
                        </span>
                        {b.customerEmail && (
                          <span
                            style={{
                              fontSize: '0.78rem',
                              color: 'var(--admin-text-muted, #6b7280)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Mail size={12} style={{ color: '#9ca3af' }} />
                            {b.customerEmail}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Product Name */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Package size={14} style={{ color: '#A07E52' }} />
                        <span
                          style={{
                            fontWeight: 500,
                            fontSize: '0.88rem',
                            maxWidth: '200px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                          title={b.productName}
                        >
                          {b.productName}
                        </span>
                      </div>
                    </td>

                    {/* Price */}
                    <td>
                      <span style={{ fontWeight: 600 }}>₹{Number(b.price || 0).toLocaleString('en-IN')}</span>
                    </td>

                    {/* Discount */}
                    <td>
                      <span
                        style={{
                          fontSize: '0.84rem',
                          color: b.discount > 0 ? '#dc2626' : 'var(--admin-text-muted, #9ca3af)',
                        }}
                      >
                        {b.discount > 0 ? `-₹${Number(b.discount).toLocaleString('en-IN')}` : '₹0'}
                      </span>
                    </td>

                    {/* Shipping Charge */}
                    <td>
                      <span
                        style={{
                          fontSize: '0.84rem',
                          color: b.shippingCharge > 0 ? 'var(--admin-text-dark, #374151)' : '#10b981',
                        }}
                      >
                        {b.shippingCharge > 0
                          ? `+₹${Number(b.shippingCharge).toLocaleString('en-IN')}`
                          : 'FREE'}
                      </span>
                    </td>

                    {/* Total Amount */}
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: '0.96rem',
                          color: 'var(--admin-green, #059669)',
                        }}
                      >
                        ₹{Number(b.totalAmount || 0).toLocaleString('en-IN')}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        {/* Download PDF Button */}
                        <button
                          type="button"
                          onClick={() => handleDownloadPdf(b)}
                          disabled={downloadingId === b._id}
                          className="shv-btn-secondary"
                          title="Download Invoice PDF"
                          style={{
                            padding: '0.35rem 0.65rem',
                            fontSize: '0.82rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            borderColor: 'rgba(160, 126, 82, 0.4)',
                            color: '#A07E52',
                          }}
                        >
                          {downloadingId === b._id ? (
                            <RefreshCw size={13} className="shv-spin" />
                          ) : (
                            <Download size={13} />
                          )}
                          <span>Download</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDelete(b)}
                          className="shv-table-filter-btn"
                          title="Delete Bill Record"
                          style={{
                            padding: '0.35rem 0.55rem',
                            color: 'var(--admin-red, #ef4444)',
                            borderColor: 'rgba(239, 68, 68, 0.2)',
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE BILL MODAL */}
      {showModal && (
        <div
          className="shv-modal-overlay"
          onClick={() => !submitting && setShowModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
            padding: '1rem',
          }}
        >
          <div
            className="shv-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: '#fff',
              borderRadius: '12px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
          >
            {/* Modal Header */}
            <div
              className="shv-modal-header"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid #f3f4f6',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Receipt size={20} style={{ color: '#A07E52' }} />
                <h3 className="shv-modal-title" style={{ margin: 0, fontSize: '1.18rem', fontWeight: 700 }}>
                  Generate New Customer Bill
                </h3>
              </div>
              <button
                type="button"
                onClick={() => !submitting && setShowModal(false)}
                className="shv-modal-close-btn"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  color: '#6b7280',
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
              {/* Section 1: Customer Details */}
              <div style={{ marginBottom: '1.25rem' }}>
                <h4
                  style={{
                    fontSize: '0.88rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#A07E52',
                    fontWeight: 700,
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <User size={14} /> Customer Information
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {/* Customer Name */}
                  <div className="shv-form-group">
                    <label className="shv-form-label" style={{ fontWeight: 600, fontSize: '0.84rem' }}>
                      Customer Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya Sharma"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="shv-form-input"
                    />
                  </div>

                  {/* Customer Phone */}
                  <div className="shv-form-group">
                    <label className="shv-form-label" style={{ fontWeight: 600, fontSize: '0.84rem' }}>
                      Phone Number <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. +91 9876543210"
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="shv-form-input"
                    />
                  </div>
                </div>

                {/* Email (Optional) */}
                <div className="shv-form-group" style={{ marginTop: '0.75rem' }}>
                  <label className="shv-form-label" style={{ fontWeight: 600, fontSize: '0.84rem' }}>
                    Email Address <span style={{ color: '#9ca3af', fontWeight: 400 }}>(Optional)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. priya.sharma@example.com"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    className="shv-form-input"
                  />
                </div>

                {/* Address */}
                <div className="shv-form-group" style={{ marginTop: '0.75rem' }}>
                  <label className="shv-form-label" style={{ fontWeight: 600, fontSize: '0.84rem' }}>
                    Delivery Address <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    required
                    rows="2"
                    placeholder="Full street address, city, state, pincode"
                    value={formData.customerAddress}
                    onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                    className="shv-form-input"
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>

              {/* Section 2: Product & Pricing Details */}
              <div style={{ marginBottom: '1.25rem', paddingTop: '0.75rem', borderTop: '1px dashed #e5e7eb' }}>
                <h4
                  style={{
                    fontSize: '0.88rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color: '#A07E52',
                    fontWeight: 700,
                    marginBottom: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  <Package size={14} /> Product &amp; Billing Calculation
                </h4>

                {/* Product Name */}
                <div className="shv-form-group">
                  <label className="shv-form-label" style={{ fontWeight: 600, fontSize: '0.84rem' }}>
                    Product Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 925 Sterling Silver Royal Solitaire Ring"
                    value={formData.productName}
                    onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                    className="shv-form-input"
                  />
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '0.75rem',
                    marginTop: '0.75rem',
                  }}
                >
                  {/* Price */}
                  <div className="shv-form-group">
                    <label className="shv-form-label" style={{ fontWeight: 600, fontSize: '0.84rem' }}>
                      Price (₹) <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="any"
                      placeholder="e.g. 2999"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="shv-form-input"
                    />
                  </div>

                  {/* Discount (Optional) */}
                  <div className="shv-form-group">
                    <label className="shv-form-label" style={{ fontWeight: 600, fontSize: '0.84rem' }}>
                      Discount (₹) <span style={{ color: '#9ca3af', fontWeight: 400 }}>(Optional)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="0"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      className="shv-form-input"
                    />
                  </div>

                  {/* Shipping Charge (Optional) */}
                  <div className="shv-form-group">
                    <label className="shv-form-label" style={{ fontWeight: 600, fontSize: '0.84rem' }}>
                      Shipping (₹) <span style={{ color: '#9ca3af', fontWeight: 400 }}>(Optional)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="0"
                      value={formData.shippingCharge}
                      onChange={(e) => setFormData({ ...formData, shippingCharge: e.target.value })}
                      className="shv-form-input"
                    />
                  </div>
                </div>
              </div>

              {/* Total Summary Preview Box */}
              <div
                style={{
                  backgroundColor: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem',
                    color: '#6b7280',
                    marginBottom: '4px',
                  }}
                >
                  <span>Base Price:</span>
                  <span>₹{Number(formData.price || 0).toLocaleString('en-IN')}</span>
                </div>
                {Number(formData.discount || 0) > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.85rem',
                      color: '#dc2626',
                      marginBottom: '4px',
                    }}
                  >
                    <span>Discount:</span>
                    <span>-₹{Number(formData.discount).toLocaleString('en-IN')}</span>
                  </div>
                )}
                {Number(formData.shippingCharge || 0) > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.85rem',
                      color: '#374151',
                      marginBottom: '4px',
                    }}
                  >
                    <span>Shipping Charge:</span>
                    <span>+₹{Number(formData.shippingCharge).toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '8px',
                    borderTop: '1px solid #e5e7eb',
                    marginTop: '6px',
                  }}
                >
                  <strong style={{ fontSize: '0.95rem', color: '#111827' }}>Grand Total Amount:</strong>
                  <strong style={{ fontSize: '1.25rem', color: '#059669' }}>
                    ₹{calculatedTotal.toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  alignItems: 'center',
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="shv-btn-secondary"
                  style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="shv-btn-primary"
                  style={{
                    padding: '0.6rem 1.4rem',
                    fontSize: '0.9rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontWeight: 600,
                  }}
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={16} className="shv-spin" />
                      <span>Generating &amp; Saving...</span>
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      <span>Generate &amp; Download Bill</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGenerateBill;
