import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Phone, RefreshCw, CheckCircle2, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { apiGetInquiries, apiUpdateInquiryStatus } from '../services/api';

const AdminInquiries = ({ searchQuery = '' }) => {
  const [inquiries, setInquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchInquiries = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await apiGetInquiries();
      setInquiries(data.inquery || []);
    } catch (err) {
      setError('Failed to load inquiries. Please refresh.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const handleToggleStatus = async (inquiry) => {
    const newStatus = inquiry.status === 'replied' ? 'not_replied' : 'replied';
    setUpdatingId(inquiry._id);
    try {
      await apiUpdateInquiryStatus(inquiry._id, newStatus);
      setInquiries((prev) =>
        prev.map((inq) => (inq._id === inquiry._id ? { ...inq, status: newStatus } : inq))
      );
    } catch (err) {
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const q = (searchQuery || '').toLowerCase();
  const filtered = inquiries.filter((inq) => {
    const matchesSearch =
      !q ||
      (inq.name || '').toLowerCase().includes(q) ||
      (inq.email || '').toLowerCase().includes(q) ||
      (inq.subject || '').toLowerCase().includes(q) ||
      (inq.message || '').toLowerCase().includes(q);

    const matchesStatus =
      filterStatus === 'all' || inq.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const notRepliedCount = inquiries.filter((i) => i.status === 'not_replied').length;

  return (
    <div className="shv-admin-orders-view">
      {/* Header */}
      <div className="shv-table-card-header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h2 className="shv-table-title" style={{ fontSize: '1.4rem' }}>
            Customer Inquiries
            {notRepliedCount > 0 && (
              <span
                style={{
                  marginLeft: '10px',
                  background: '#EF4444',
                  color: '#fff',
                  fontSize: '0.72rem',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontWeight: 700,
                  verticalAlign: 'middle',
                }}
              >
                {notRepliedCount} Pending
              </span>
            )}
          </h2>
          <p style={{ fontSize: '0.86rem', color: 'var(--admin-text-muted)' }}>
            Messages submitted via the Contact page. Mark as replied after responding.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {['all', 'not_replied', 'replied'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setFilterStatus(s)}
              className="shv-table-filter-btn"
              style={{
                background: filterStatus === s ? '#1E2229' : '#FFFFFF',
                color: filterStatus === s ? '#FFFFFF' : 'var(--admin-text-main)',
                borderColor: filterStatus === s ? '#1E2229' : 'var(--admin-border)',
                textTransform: 'capitalize',
                whiteSpace: 'nowrap',
              }}
            >
              {s === 'all' ? 'All' : s === 'not_replied' ? '⏳ Pending' : '✅ Replied'}
            </button>
          ))}
          <button
            type="button"
            onClick={fetchInquiries}
            className="shv-table-filter-btn"
            title="Refresh"
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="shv-admin-table-card">
        {error && (
          <div style={{ padding: '1rem 1.25rem', color: 'var(--admin-red)', fontWeight: 600, fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        {/* Desktop Table */}
        <div className="shv-admin-table-wrap desktop-orders-table">
          <table className="shv-admin-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Subject</th>
                <th>Message</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)' }}>
                    Loading inquiries…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)' }}>
                    No inquiries found.
                  </td>
                </tr>
              ) : (
                filtered.map((inq, idx) => {
                  const isExpanded = expandedId === inq._id;
                  const isReplied = inq.status === 'replied';
                  const dateStr = inq.createdAt
                    ? new Date(inq.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })
                    : '—';

                  return (
                    <React.Fragment key={inq._id}>
                      <tr style={{ background: isExpanded ? '#F8FAFC' : undefined }}>
                        <td style={{ fontWeight: 600, color: 'var(--admin-text-muted)', fontSize: '0.8rem' }}>
                          {idx + 1}
                        </td>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{inq.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--admin-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <Mail size={11} /> {inq.email}
                          </div>
                          {inq.phone && (
                            <div style={{ fontSize: '0.74rem', color: 'var(--admin-text-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Phone size={11} /> {inq.phone}
                            </div>
                          )}
                        </td>
                        <td style={{ fontSize: '0.84rem', fontWeight: 500, maxWidth: '160px' }}>
                          {inq.subject || 'General Inquiry'}
                        </td>
                        <td style={{ maxWidth: '260px' }}>
                          <div
                            style={{
                              fontSize: '0.82rem',
                              color: 'var(--admin-text-muted)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: isExpanded ? 'normal' : 'nowrap',
                            }}
                          >
                            {inq.message}
                          </div>
                          <button
                            type="button"
                            onClick={() => setExpandedId(isExpanded ? null : inq._id)}
                            style={{
                              background: 'none', border: 'none', color: 'var(--admin-text-light)',
                              fontSize: '0.72rem', cursor: 'pointer', padding: '2px 0',
                              display: 'flex', alignItems: 'center', gap: '2px',
                            }}
                          >
                            {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            {isExpanded ? 'Less' : 'Read more'}
                          </button>
                        </td>
                        <td style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', whiteSpace: 'nowrap' }}>
                          {dateStr}
                        </td>
                        <td>
                          <span
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                              padding: '3px 10px', borderRadius: '999px', fontSize: '0.73rem', fontWeight: 700,
                              background: isReplied ? '#D1FAE5' : '#FEF3C7',
                              color: isReplied ? '#065F46' : '#92400E',
                            }}
                          >
                            {isReplied ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                            {isReplied ? 'Replied' : 'Pending'}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            disabled={updatingId === inq._id}
                            onClick={() => handleToggleStatus(inq)}
                            className="shv-table-filter-btn"
                            style={{
                              fontSize: '0.76rem', padding: '0.3rem 0.7rem',
                              background: isReplied ? '#FEF3C7' : '#D1FAE5',
                              color: isReplied ? '#92400E' : '#065F46',
                              borderColor: isReplied ? '#FCD34D' : '#6EE7B7',
                              opacity: updatingId === inq._id ? 0.6 : 1,
                              cursor: updatingId === inq._id ? 'progress' : 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {updatingId === inq._id
                              ? '...'
                              : isReplied
                              ? '↩ Mark Pending'
                              : '✓ Mark Replied'}
                          </button>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="shv-mobile-orders-list mobile-orders-cards">
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)' }}>
              Loading inquiries…
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--admin-text-muted)' }}>
              No inquiries found.
            </div>
          ) : (
            filtered.map((inq) => {
              const isReplied = inq.status === 'replied';
              const dateStr = inq.createdAt
                ? new Date(inq.createdAt).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })
                : '—';

              return (
                <div key={inq._id} className="shv-mobile-order-card">
                  <div className="shv-moc-header">
                    <div>
                      <div className="shv-moc-order-id">{inq.name}</div>
                      <div className="shv-moc-order-date">{inq.email} · {dateStr}</div>
                    </div>
                    <span
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        padding: '3px 10px', borderRadius: '999px', fontSize: '0.72rem', fontWeight: 700,
                        background: isReplied ? '#D1FAE5' : '#FEF3C7',
                        color: isReplied ? '#065F46' : '#92400E',
                      }}
                    >
                      {isReplied ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {isReplied ? 'Replied' : 'Pending'}
                    </span>
                  </div>

                  <div style={{ padding: '0.6rem 0', borderBottom: '1px solid var(--admin-border-subtle)' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--admin-text-light)', marginBottom: '2px' }}>
                      {inq.subject || 'General Inquiry'}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--admin-text-muted)' }}>
                      {inq.message}
                    </div>
                  </div>

                  <div className="shv-moc-footer">
                    {inq.phone ? (
                      <div style={{ fontSize: '0.78rem', color: 'var(--admin-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={12} /> {inq.phone}
                      </div>
                    ) : <span />}
                    <button
                      type="button"
                      disabled={updatingId === inq._id}
                      onClick={() => handleToggleStatus(inq)}
                      className="shv-moc-view-btn"
                      style={{
                        background: isReplied ? '#FEF3C7' : '#D1FAE5',
                        color: isReplied ? '#92400E' : '#065F46',
                        border: `1px solid ${isReplied ? '#FCD34D' : '#6EE7B7'}`,
                        opacity: updatingId === inq._id ? 0.6 : 1,
                      }}
                    >
                      {updatingId === inq._id
                        ? '...'
                        : isReplied
                        ? '↩ Mark Pending'
                        : '✓ Mark Replied'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminInquiries;
