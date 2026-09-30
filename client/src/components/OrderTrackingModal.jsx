import React, { useState, useEffect } from 'react';
import {
  Truck,
  Package,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  X,
  ExternalLink,
  ShieldCheck,
  Navigation,
} from 'lucide-react';
import { apiTrackOrder } from '../services/api';

const formatDateTime = (dtStr) => {
  if (!dtStr) return '—';
  try {
    const d = new Date(dtStr);
    if (isNaN(d.getTime())) return String(dtStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return String(dtStr);
  }
};

const getStageIndex = (statusStr = '') => {
  const s = statusStr.toLowerCase();
  if (s.includes('deliver')) return 3;
  if (s.includes('out for delivery') || s.includes('out_for_delivery') || s.includes('ofd')) return 2;
  if (s.includes('transit') || s.includes('in-transit') || s.includes('reach') || s.includes('arrived') || s.includes('dispatch') || s.includes('shipped')) return 1;
  return 0; // Manifested / Booked / Registered
};

const STAGES = [
  { label: 'Order Manifested', desc: 'Package registered with carrier' },
  { label: 'In Transit', desc: 'On its way through network' },
  { label: 'Out for Delivery', desc: 'Courier out for doorstep handover' },
  { label: 'Delivered', desc: 'Safely handed over to patron' },
];

export const OrderTrackingModal = ({ order, isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [copiedWaybill, setCopiedWaybill] = useState(false);

  const waybill = order?.waybill || '';
  const orderRef = order?.orderNumber || order?._id || 'ORD';

  const fetchTracking = async () => {
    if (!waybill) {
      setTrackingData(null);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await apiTrackOrder(waybill);
      if (data && data.success) {
        setTrackingData(data);
      } else {
        setError(data?.message || 'Unable to retrieve tracking details at this moment.');
      }
    } catch (err) {
      setError(err?.message || 'Network error while contacting Delhivery tracking service.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (waybill) {
        fetchTracking();
      } else {
        setTrackingData(null);
        setError('');
      }
    } else {
      setTrackingData(null);
      setError('');
    }
  }, [isOpen, waybill]);

  if (!isOpen) return null;

  const copyWaybill = () => {
    if (!waybill) return;
    navigator.clipboard.writeText(waybill);
    setCopiedWaybill(true);
    setTimeout(() => setCopiedWaybill(false), 2000);
  };

  const statusObj = trackingData?.status || {};
  const currentStatusText = statusObj.Status || order?.status || 'Manifested';
  const currentInstructions = statusObj.Instructions || '';
  const currentLocation = statusObj.StatusLocation || '';
  const currentDateTime = statusObj.StatusDateTime || '';
  const scansList = Array.isArray(trackingData?.Scans) ? trackingData.Scans : [];
  const currentStageIndex = getStageIndex(currentStatusText);

  return (
    <div className="shv-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="shv-modal-card shv-tracking-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="shv-modal-header shv-tracking-modal-header">
          <div className="shv-tracking-head-left">
            <div className="shv-tracking-pill-badge">
              <Truck size={14} className="shv-pulse-icon" />
              <span>Delhivery Express Live Tracking</span>
            </div>
            <h3 className="shv-tracking-modal-title">Consignment Live Tracker</h3>
            <div className="shv-tracking-submeta">
              <span className="shv-track-ref-label">Order:</span>
              <strong className="shv-track-ref-code">{orderRef}</strong>
              {waybill && (
                <>
                  <span className="shv-track-dot">•</span>
                  <span className="shv-track-ref-label">Waybill:</span>
                  <span className="shv-track-waybill-code">{waybill}</span>
                  <button
                    type="button"
                    onClick={copyWaybill}
                    className="shv-copy-mini-btn"
                    title="Copy Waybill"
                  >
                    {copiedWaybill ? (
                      <Check size={12} color="#10B981" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
          <button
            type="button"
            className="shv-modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="shv-tracking-modal-body">
          {/* Missing Waybill Notice */}
          {!waybill && (
            <div className="shv-track-empty-state">
              <div className="shv-track-empty-icon-wrap">
                <Package size={36} />
              </div>
              <h4>Consignment Being Prepared</h4>
              <p>
                Your order is currently being inspected and packaged in our Jaipur Atelier with hallmark verification.
                The official Delhivery waybill and live telemetry updates will appear here automatically once the courier collects your shipment.
              </p>
              <div className="shv-track-carrier-badge">
                <ShieldCheck size={14} />
                <span>100% Insured Silver Logistics Guaranteed</span>
              </div>
            </div>
          )}

          {/* Loading State */}
          {waybill && loading && (
            <div className="shv-track-loading-state">
              <RefreshCw size={32} className="shv-spin-icon" />
              <h4>Connecting to Delhivery Network...</h4>
              <p>Querying real-time telemetry scans for consignment {waybill}.</p>
            </div>
          )}

          {/* Error State */}
          {waybill && !loading && error && (
            <div className="shv-track-error-card">
              <AlertCircle size={22} className="shv-error-icon" />
              <div className="shv-track-error-info">
                <strong>Tracking Status Update</strong>
                <p>{error}</p>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline shv-track-retry-btn"
                onClick={fetchTracking}
              >
                <RefreshCw size={14} />
                <span>Retry</span>
              </button>
            </div>
          )}

          {/* Active Tracking Content */}
          {waybill && !loading && trackingData && (
            <>
              {/* Status Hero Card */}
              <div className="shv-track-hero-card">
                <div className="shv-track-hero-top">
                  <div className="shv-track-status-badge">
                    <span className="shv-status-dot-pulse" />
                    <span>{currentStatusText}</span>
                  </div>
                  <button
                    type="button"
                    onClick={fetchTracking}
                    className="shv-track-refresh-link"
                    title="Refresh live status"
                  >
                    <RefreshCw size={13} />
                    <span>Live Refresh</span>
                  </button>
                </div>

                <div className="shv-track-hero-instruction">
                  <h4>{currentInstructions || currentStatusText}</h4>
                  {currentLocation && (
                    <div className="shv-track-loc-row">
                      <MapPin size={14} className="shv-gold-icon" />
                      <span>{currentLocation}</span>
                    </div>
                  )}
                  {currentDateTime && (
                    <div className="shv-track-time-row">
                      <Clock size={14} className="shv-gold-icon" />
                      <span>Updated: {formatDateTime(currentDateTime)}</span>
                    </div>
                  )}
                </div>

                {/* Progress Stepper Bar */}
                <div className="shv-track-stepper">
                  {STAGES.map((st, i) => {
                    const isDone = i < currentStageIndex;
                    const isCurrent = i === currentStageIndex;
                    return (
                      <div
                        key={st.label}
                        className={`shv-step-node ${isDone ? 'completed' : ''} ${
                          isCurrent ? 'current' : ''
                        }`}
                      >
                        <div className="shv-step-indicator">
                          {isDone ? (
                            <Check size={13} strokeWidth={2.6} />
                          ) : (
                            <span>{i + 1}</span>
                          )}
                        </div>
                        <div className="shv-step-text">
                          <span className="shv-step-title">{st.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Scans Timeline Section */}
              <div className="shv-track-timeline-wrap">
                <div className="shv-track-section-heading">
                  <Navigation size={15} />
                  <span>Telemetry Scan History ({scansList.length})</span>
                </div>

                {scansList.length === 0 ? (
                  <div className="shv-track-no-scans">
                    <Clock size={20} style={{ opacity: 0.5 }} />
                    <p>Shipment manifest is recorded. Telemetry scans will populate as your package moves across hubs.</p>
                  </div>
                ) : (
                  <div className="shv-track-timeline">
                    {scansList.map((item, idx) => {
                      const detail = item.ScanDetail || item;
                      const scanTitle = detail.Scan || detail.Instructions || 'Hub Scan';
                      const scanInstr = detail.Instructions !== scanTitle ? detail.Instructions : '';
                      const scanLocation = detail.ScannedLocation || '';
                      const scanTime = detail.ScanDateTime || detail.StatusDateTime || '';
                      const isLatest = idx === 0;

                      return (
                        <div
                          key={idx}
                          className={`shv-timeline-item ${isLatest ? 'is-latest' : ''}`}
                        >
                          <div className="shv-timeline-marker">
                            <span className="shv-marker-dot" />
                            {idx < scansList.length - 1 && <span className="shv-marker-line" />}
                          </div>

                          <div className="shv-timeline-content">
                            <div className="shv-timeline-title-row">
                              <h5 className="shv-timeline-title">{scanTitle}</h5>
                              {isLatest && (
                                <span className="shv-latest-pill">Latest Scan</span>
                              )}
                            </div>

                            {scanInstr && (
                              <p className="shv-timeline-desc">{scanInstr}</p>
                            )}

                            <div className="shv-timeline-meta">
                              {scanLocation && (
                                <span className="shv-meta-tag">
                                  <MapPin size={12} />
                                  <span>{scanLocation}</span>
                                </span>
                              )}
                              {scanTime && (
                                <span className="shv-meta-tag">
                                  <Clock size={12} />
                                  <span>{formatDateTime(scanTime)}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Destination Details Footer Strip */}
          {order?.address && (
            <div className="shv-track-dest-card">
              <MapPin size={16} className="shv-dest-icon" />
              <div>
                <span className="shv-dest-title">Delivery Destination</span>
                <p className="shv-dest-text">
                  {[
                    order.address.addressline || order.address.street,
                    order.address.city,
                    order.address.state,
                    order.address.pincode,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shv-modal-footer shv-tracking-modal-footer">
          <a
            href={`https://wa.me/919876543210?text=${encodeURIComponent(
              `Hello Shveraa Concierge, I am inquiring about tracking status for order ${orderRef} (Waybill: ${waybill || 'N/A'})`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="shv-track-concierge-link"
          >
            <ExternalLink size={14} />
            <span>Need Help? Contact Atelier Concierge</span>
          </a>
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingModal;
