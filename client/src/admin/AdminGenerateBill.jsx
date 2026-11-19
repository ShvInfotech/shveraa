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
  Package,
  Receipt,
  User,
  Percent,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';
import {
  apiAdminGetAllBills,
  apiAdminCreateBill,
  apiAdminDownloadBillPdf,
  apiAdminDeleteBill,
} from '../services/api';

const OFFICIAL_PHONE = '+91 99980 46559';
const OFFICIAL_EMAIL = 'shvera925@gmail.com';
const OFFICIAL_HALLMARK = 'HM/C-7190422317';

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
    items: [{ productName: '', price: '', quantity: 1 }],
    discountType: 'percentage', // 'percentage' | 'fixed'
    discountValue: '',
    shippingCharge: '',
    hallmarkNumber: OFFICIAL_HALLMARK,
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

  // Filter bills in-memory
  const filteredBills = useMemo(() => {
    if (!searchQuery.trim()) return bills;
    const q = searchQuery.toLowerCase().trim();
    return bills.filter(
      (b) =>
        (b.invoiceNumber && b.invoiceNumber.toLowerCase().includes(q)) ||
        (b.customerName && b.customerName.toLowerCase().includes(q)) ||
        (b.customerPhone && b.customerPhone.toLowerCase().includes(q)) ||
        (b.customerEmail && b.customerEmail.toLowerCase().includes(q)) ||
        (b.productName && b.productName.toLowerCase().includes(q)) ||
        (b.items && b.items.some((it) => it.productName && it.productName.toLowerCase().includes(q)))
    );
  }, [bills, searchQuery]);

  // Multiple items handlers
  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { productName: '', price: '', quantity: 1 }],
    }));
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, idx) => idx !== index),
    }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.items];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, items: updated };
    });
  };

  // Real-time calculations for subtotal, discount, shipping, grand total
  const calculationSummary = useMemo(() => {
    const subtotal = formData.items.reduce((sum, item) => {
      const p = Math.max(0, Number(item.price) || 0);
      const q = Math.max(1, Number(item.quantity) || 1);
      return sum + p * q;
    }, 0);

    const dVal = Math.max(0, Number(formData.discountValue) || 0);
    let discountAmount = 0;
    if (formData.discountType === 'percentage') {
      discountAmount = Math.round(((subtotal * dVal) / 100) * 100) / 100;
    } else {
      discountAmount = dVal;
    }
    discountAmount = Math.min(subtotal, Math.max(0, discountAmount));

    const shipping = Math.max(0, Number(formData.shippingCharge) || 0);
    const grandTotal = Math.max(0, Math.round((subtotal - discountAmount + shipping) * 100) / 100);

    return {
      subtotal,
      discountAmount,
      shipping,
      grandTotal,
    };
  }, [formData.items, formData.discountType, formData.discountValue, formData.shippingCharge]);

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
      showToast('Please enter customer delivery address', 'error');
      return;
    }

    // Validate items
    const validItems = formData.items
      .map((it) => ({
        productName: it.productName.trim(),
        price: Math.max(0, Number(it.price) || 0),
        quantity: Math.max(1, Number(it.quantity) || 1),
      }))
      .filter((it) => it.productName && it.price >= 0);

    if (validItems.length === 0) {
      showToast('Please enter at least one product with name and price', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customerName: formData.customerName.trim(),
        customerEmail: formData.customerEmail.trim(),
        customerPhone: formData.customerPhone.trim(),
        customerAddress: formData.customerAddress.trim(),
        items: validItems,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue) || 0,
        shippingCharge: Number(formData.shippingCharge) || 0,
        hallmarkNumber: formData.hallmarkNumber.trim() || OFFICIAL_HALLMARK,
        notes: formData.notes ? formData.notes.trim() : '',
      };

      const res = await apiAdminCreateBill(payload);
      const newBill = res.bill;

      // Prepend to current list
      setBills((prev) => [newBill, ...prev]);
      setShowModal(false);
      setFormData(initialForm);
      showToast(`Bill #${newBill.invoiceNumber} generated! Downloading PDF...`);

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
          marginBottom: '1rem',
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
            Create customer invoices with multi-product line items, percentage/fixed discounts, and instant PDF downloads.
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

      {/* Official Credentials Banner */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          backgroundColor: '#fbfaf8',
          border: '1px solid #efe8dd',
          borderRadius: '8px',
          padding: '0.65rem 1rem',
          marginBottom: '1.25rem',
          fontSize: '0.82rem',
          color: '#555',
        }}
      >
        <span style={{ fontWeight: 600, color: '#A07E52', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ShieldCheck size={14} /> Official Invoice Credentials:
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Phone size={12} style={{ color: '#A07E52' }} /> <strong>Phone:</strong> {OFFICIAL_PHONE}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Mail size={12} style={{ color: '#A07E52' }} /> <strong>Email:</strong> {OFFICIAL_EMAIL}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <FileText size={12} style={{ color: '#A07E52' }} /> <strong>Hallmark UID:</strong> {OFFICIAL_HALLMARK}
        </span>
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
                <th>Products / Items</th>
                <th>Subtotal</th>
                <th>Discount</th>
                <th>Shipping</th>
                <th>Grand Total</th>
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
                filteredBills.map((b) => {
                  const billItems = b.items && b.items.length > 0 ? b.items : [];
                  const subtotalAmount = b.subtotal !== undefined ? b.subtotal : b.price;

                  return (
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

                      {/* Contact */}
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

                      {/* Products / Items */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          {billItems.length > 0 ? (
                            billItems.slice(0, 2).map((it, idx) => (
                              <div
                                key={idx}
                                style={{
                                  fontSize: '0.82rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  color: '#374151',
                                }}
                              >
                                <Package size={11} style={{ color: '#A07E52' }} />
                                <span style={{ fontWeight: 500 }}>{it.productName}</span>
                                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                  (x{it.quantity || 1})
                                </span>
                              </div>
                            ))
                          ) : (
                            <div style={{ fontSize: '0.84rem', fontWeight: 500 }}>
                              <Package size={12} style={{ color: '#A07E52', display: 'inline', marginRight: '4px' }} />
                              {b.productName}
                            </div>
                          )}
                          {billItems.length > 2 && (
                            <span style={{ fontSize: '0.75rem', color: '#A07E52', fontWeight: 600 }}>
                              +{billItems.length - 2} more item(s)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Subtotal */}
                      <td>
                        <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>
                          ₹{Number(subtotalAmount || 0).toLocaleString('en-IN')}
                        </span>
                      </td>

                      {/* Discount */}
                      <td>
                        <span
                          style={{
                            fontSize: '0.84rem',
                            color: b.discount > 0 ? '#dc2626' : 'var(--admin-text-muted, #9ca3af)',
                          }}
                        >
                          {b.discount > 0
                            ? `-₹${Number(b.discount).toLocaleString('en-IN')}${b.discountType === 'percentage' && b.discountValue ? ` (${b.discountValue}%)` : ''
                            }`
                            : '₹0'}
                        </span>
                      </td>

                      {/* Shipping */}
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

                      {/* Grand Total */}
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE BILL MODAL (MULTIPLE PRODUCTS & PERCENTAGE/FIXED DISCOUNT) */}
      {showModal && (
        <div
          className="shv-modal-overlay"
          onClick={() => !submitting && setShowModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
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
              maxWidth: '750px',
              width: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            {/* Modal Header */}
            <div
              className="shv-modal-header"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.15rem 1.5rem',
                borderBottom: '1px solid #f3f4f6',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Receipt size={20} style={{ color: '#A07E52' }} />
                <h3 className="shv-modal-title" style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>
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
                    fontSize: '0.86rem',
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

              {/* Section 2: Multiple Products Items */}
              <div style={{ marginBottom: '1.25rem', paddingTop: '0.85rem', borderTop: '1px dashed #e5e7eb' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.75rem',
                  }}
                >
                  <h4
                    style={{
                      fontSize: '0.86rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#A07E52',
                      fontWeight: 700,
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    <Package size={14} /> Product Items ({formData.items.length})
                  </h4>

                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="shv-btn-secondary"
                    style={{
                      padding: '0.35rem 0.75rem',
                      fontSize: '0.82rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      borderColor: '#A07E52',
                      color: '#A07E52',
                      fontWeight: 600,
                    }}
                  >
                    <Plus size={14} /> Add Another Product
                  </button>
                </div>

                {/* Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {formData.items.map((item, idx) => {
                    const itemTotal =
                      Math.max(0, Number(item.price) || 0) * Math.max(1, Number(item.quantity) || 1);

                    return (
                      <div
                        key={idx}
                        style={{
                          backgroundColor: '#fbfbfb',
                          border: '1px solid #e9e9e9',
                          borderRadius: '8px',
                          padding: '0.75rem 1rem',
                          display: 'grid',
                          gridTemplateColumns: 'minmax(200px, 2fr) minmax(100px, 1fr) minmax(80px, 0.7fr) minmax(90px, 1fr) auto',
                          gap: '0.75rem',
                          alignItems: 'center',
                        }}
                      >
                        {/* Product Name */}
                        <div>
                          <label style={{ fontSize: '0.76rem', color: '#6b7280', fontWeight: 600 }}>
                            Product Name #{idx + 1} <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 925 Royal Silver Ring"
                            value={item.productName}
                            onChange={(e) => handleItemChange(idx, 'productName', e.target.value)}
                            className="shv-form-input"
                            style={{ height: '36px', fontSize: '0.85rem' }}
                          />
                        </div>

                        {/* Unit Price */}
                        <div>
                          <label style={{ fontSize: '0.76rem', color: '#6b7280', fontWeight: 600 }}>
                            Price (₹) <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <input
                            type="number"
                            required
                            min="0"
                            step="any"
                            placeholder="e.g. 2999"
                            value={item.price}
                            onChange={(e) => handleItemChange(idx, 'price', e.target.value)}
                            className="shv-form-input"
                            style={{ height: '36px', fontSize: '0.85rem' }}
                          />
                        </div>

                        {/* Quantity */}
                        <div>
                          <label style={{ fontSize: '0.76rem', color: '#6b7280', fontWeight: 600 }}>
                            Qty
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                            className="shv-form-input"
                            style={{ height: '36px', fontSize: '0.85rem' }}
                          />
                        </div>

                        {/* Line Total */}
                        <div>
                          <label style={{ fontSize: '0.76rem', color: '#6b7280', fontWeight: 600 }}>
                            Total
                          </label>
                          <div
                            style={{
                              height: '36px',
                              display: 'flex',
                              alignItems: 'center',
                              fontWeight: 700,
                              color: '#111827',
                              fontSize: '0.88rem',
                            }}
                          >
                            ₹{itemTotal.toLocaleString('en-IN')}
                          </div>
                        </div>

                        {/* Remove Button */}
                        <div style={{ paddingTop: '16px' }}>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            disabled={formData.items.length <= 1}
                            className="shv-table-filter-btn"
                            title="Remove Product"
                            style={{
                              padding: '0.35rem 0.5rem',
                              color: formData.items.length <= 1 ? '#d1d5db' : '#ef4444',
                              borderColor: formData.items.length <= 1 ? '#f3f4f6' : 'rgba(239, 68, 68, 0.2)',
                              cursor: formData.items.length <= 1 ? 'not-allowed' : 'pointer',
                            }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Section 3: Discounts, Shipping & Hallmark */}
              <div style={{ marginBottom: '1.25rem', paddingTop: '0.85rem', borderTop: '1px dashed #e5e7eb' }}>
                <h4
                  style={{
                    fontSize: '0.86rem',
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
                  <Percent size={14} /> Discounts &amp; Charges
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr', gap: '1rem', alignItems: 'flex-start' }}>
                  {/* Discount Type & Value */}
                  <div className="shv-form-group">
                    <label className="shv-form-label" style={{ fontWeight: 600, fontSize: '0.84rem' }}>
                      Discount Type &amp; Value <span style={{ color: '#9ca3af', fontWeight: 400 }}>(Optional)</span>
                    </label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <select
                        value={formData.discountType}
                        onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                        className="shv-form-select"
                        style={{ height: '38px', minWidth: '130px', fontSize: '0.84rem' }}
                      >
                        <option value="percentage">% Percentage</option>
                        <option value="fixed">₹ Fixed Amount</option>
                      </select>

                      <input
                        type="number"
                        min="0"
                        step="any"
                        placeholder={formData.discountType === 'percentage' ? 'e.g. 10 (%)' : 'e.g. 500 (₹)'}
                        value={formData.discountValue}
                        onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                        className="shv-form-input"
                        style={{ height: '38px', fontSize: '0.85rem' }}
                      />
                    </div>
                  </div>

                  {/* Shipping Charge */}
                  <div className="shv-form-group">
                    <label className="shv-form-label" style={{ fontWeight: 600, fontSize: '0.84rem' }}>
                      Shipping Charge (₹) <span style={{ color: '#9ca3af', fontWeight: 400 }}>(Optional)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="0 for FREE"
                      value={formData.shippingCharge}
                      onChange={(e) => setFormData({ ...formData, shippingCharge: e.target.value })}
                      className="shv-form-input"
                      style={{ height: '38px', fontSize: '0.85rem' }}
                    />
                  </div>

                  {/* Hallmark Number */}
                  <div className="shv-form-group">
                    <label className="shv-form-label" style={{ fontWeight: 600, fontSize: '0.84rem' }}>
                      BIS Hallmark UID
                    </label>
                    <input
                      type="text"
                      value={formData.hallmarkNumber}
                      onChange={(e) => setFormData({ ...formData, hallmarkNumber: e.target.value })}
                      className="shv-form-input"
                      style={{ height: '38px', fontSize: '0.85rem', fontFamily: 'monospace' }}
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
                {/* Subtotal */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem',
                    color: '#6b7280',
                    marginBottom: '4px',
                  }}
                >
                  <span>Subtotal ({formData.items.length} items):</span>
                  <span style={{ fontWeight: 600, color: '#111827' }}>
                    ₹{calculationSummary.subtotal.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Discount */}
                {calculationSummary.discountAmount > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.85rem',
                      color: '#dc2626',
                      marginBottom: '4px',
                    }}
                  >
                    <span>
                      Discount{' '}
                      {formData.discountType === 'percentage' && formData.discountValue
                        ? `(${formData.discountValue}% off)`
                        : '(Flat off)'}
                      :
                    </span>
                    <span>-₹{calculationSummary.discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}

                {/* Shipping */}
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
                  <span style={{ color: calculationSummary.shipping > 0 ? '#374151' : '#10b981', fontWeight: 600 }}>
                    {calculationSummary.shipping > 0
                      ? `+₹${calculationSummary.shipping.toLocaleString('en-IN')}`
                      : 'FREE'}
                  </span>
                </div>

                {/* Grand Total */}
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
                  <div>
                    <strong style={{ fontSize: '0.95rem', color: '#111827' }}>Grand Total Amount:</strong>
                    <div style={{ fontSize: '0.74rem', color: '#6b7280' }}>
                      Includes 100% 925 Hallmark Silver Assurance
                    </div>
                  </div>
                  <strong style={{ fontSize: '1.25rem', color: '#059669' }}>
                    ₹{calculationSummary.grandTotal.toLocaleString('en-IN')}
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
