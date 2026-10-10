import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Box,
  Clock,
  PackageCheck,
  SlidersHorizontal,
  Truck,
  XCircle,
} from 'lucide-react';
import { apiAdminGetDashboardStats, getImageUrl } from '../services/api';
import { getAdminAuth } from '../services/storeService';

/* --------------------------------------------------------------------------
   Helpers
   -------------------------------------------------------------------------- */
// The live API uses the slug statuses from the order model
// ("pending" | "accepted" | "processing" | "shipped" | "out_for_delivery" |
// "delivered" | "cancelled") while legacy seeded orders use display statuses
// ("Scheduled" | "On The Way" | "On Hold"). Both are mapped here so the
// Dashboard renders correct pills for either source.
const STATUS_LABELS = {
  pending: 'Pending',
  accepted: 'Accepted',
  processing: 'Processing',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  scheduled: 'Scheduled',
  'on the way': 'On The Way',
  'on hold': 'On Hold',
};

const getStatusBadgeClass = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'delivered':
      return 'delivered';
    case 'shipped':
    case 'out_for_delivery':
    case 'on the way':
      return 'ontheway';
    case 'cancelled':
      return 'cancelled';
    case 'accepted':
    case 'processing':
    case 'on hold':
      return 'onhold';
    default:
      return 'scheduled';
  }
};

const STATUS_ICONS = {
  scheduled: <Box size={13} />,
  ontheway: <Truck size={13} />,
  delivered: <PackageCheck size={13} />,
  onhold: <Clock size={13} />,
  cancelled: <XCircle size={13} />,
};

const statusLabel = (status) => {
  const key = (status || '').toLowerCase();
  return STATUS_LABELS[key] || status || 'Pending';
};

const formatDateValue = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return typeof value === 'string' ? value : '—';
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};

const trendPercent = (current, previous) => {
  if (!previous) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
};

// Converts a list of numbers into an SVG path used by the stat-card sparklines.
const buildSparkPath = (values) => {
  if (!Array.isArray(values) || values.length < 2) return 'M5 20 L95 20';
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = Math.max(max - min, 1);
  const step = 90 / (values.length - 1);
  return values
    .map((value, index) => {
      const x = 5 + index * step;
      const y = 34 - ((value - min) / span) * 28;
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
};

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=200&q=85';

const PENDING_FALLBACK_STATUSES = ['pending'];

const isDeliveredStatus = (status) => (status || '').toLowerCase().trim() === 'delivered';
const isActiveStatus = (status) => {
  const s = (status || '').toLowerCase().trim();
  return s !== 'delivered' && s !== 'cancelled';
};

// Shared markup for the three KPI tiles.
const StatCard = ({ icon, label, value, trend, sparkPath, sparkColor }) => (
  <div className="shv-admin-stat-card">
    <div className="shv-stat-card-header">
      <div className="shv-stat-card-icon">{icon}</div>
      <span>{label}</span>
    </div>
    <div className="shv-stat-card-body">
      <div>
        <div className="shv-stat-card-number">{value}</div>
        <div className={`shv-stat-trend ${trend >= 0 ? 'positive' : 'negative'}`}>
          <span>
            {trend >= 0 ? '+' : ''}
            {trend}%
          </span>
          <span>vs Last Month</span>
        </div>
      </div>
      <svg className="shv-stat-sparkline" viewBox="0 0 100 40" fill="none">
        <path d={sparkPath} stroke={sparkColor} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    </div>
  </div>
);

const AdminDashboard = ({ orders = [], onSelectOrder }) => {
  const [adminName] = useState(() => getAdminAuth()?.name || 'Admin');
  const [timeRange, setTimeRange] = useState('8m');
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [tableFilter, setTableFilter] = useState('All');
  const [selectedRowIds, setSelectedRowIds] = useState([]);

  // Loads the aggregated dashboard payload from the admin endpoint. Re-runs
  // whenever the Overview range select changes (timeRange is a dependency).
  const fetchDashboard = useCallback(async () => {
    if (!getAdminAuth()) return;
    setIsLoading(true);
    try {
      const res = await apiAdminGetDashboardStats(timeRange);
      setDashboard(res.dashboard || null);
      setLoadError(null);
    } catch (err) {
      console.error('Admin: Failed to fetch dashboard stats:', err);
      setLoadError(err.message || 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleToggleRow = (id) => {
    setSelectedRowIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  // Local fallbacks (used until the API responds or when it fails) keep the
  // dashboard fully populated from the orders already loaded by AdminLayout.
  const fallbackStats = useMemo(() => {
    const pending = orders.filter((o) =>
      (o.status || '').toLowerCase().trim() === 'pending'
    ).length;
    const delivered = orders.filter((o) => isDeliveredStatus(o.status)).length;
    const total = orders.filter((o) => (o.status || '').toLowerCase().trim() !== 'cancelled').length;
    return {
      pending: { value: pending, trend: 0 },
      delivered: { value: delivered, trend: 0 },
      total: { value: total, trend: 0 },
    };
  }, [orders]);

  const fallbackMonths = useMemo(() => {
    const now = new Date();
    const buckets = [];
    for (let offset = 7; offset >= 0; offset -= 1) {
      const start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 1);
      const rows = orders.filter((o) => {
        const createdAt = new Date(o.createdAt);
        const notCancelled = (o.status || '').toLowerCase().trim() !== 'cancelled';
        return notCancelled && !Number.isNaN(createdAt.getTime()) && createdAt >= start && createdAt < end;
      });
      buckets.push({
        month: start.toLocaleString('en-US', { month: 'short' }),
        fullLabel: start.toLocaleString('en-US', { month: 'short', year: 'numeric' }),
        volume: rows.length,
        revenue: rows.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0),
      });
    }
    return buckets;
  }, [orders]);

  const fallbackUpcoming = useMemo(
    () =>
      orders
        .filter((o) => isActiveStatus(o.status))
        .slice(0, 8)
        .map((o, index) => ({
          id: o._id || o.orderId || `upcoming-${index}`,
          orderCode: o.orderNumber || o.orderId || '—',
          item: o.items?.[0]?.name || 'Order item',
          qty: Number(o.items?.[0]?.quantity ?? o.items?.[0]?.qty) || 1,
          date: formatDateValue(o.createdAt || o.date),
          status: (o.status || 'pending').toLowerCase().trim(),
        })),
    [orders]
  );

  const fallbackHistory = useMemo(
    () =>
      orders
        .filter((o) => (o.status || '').toLowerCase().trim() !== 'cancelled')
        .slice(0, 4)
        .map((o, index) => ({
          id: o._id || o.orderId || `history-${index}`,
          orderCode: o.orderNumber || o.orderId || '—',
          name: o.items?.[0]?.name || 'Order item',
          image: o.items?.[0]?.image || '',
          qty: Number(o.items?.[0]?.quantity ?? o.items?.[0]?.qty) || 1,
          status: (o.status || 'pending').toLowerCase().trim(),
          date: formatDateValue(o.createdAt || o.date),
        })),
    [orders]
  );

  const stats = dashboard?.stats || fallbackStats;
  const overview = dashboard?.overview;
  const chartMonths = overview?.months?.length ? overview.months : fallbackMonths;
  const unit = overview?.unit || 'month';
  const avgVolume =
    overview?.avgVolume ??
    Math.round(chartMonths.reduce((sum, b) => sum + b.volume, 0) / Math.max(chartMonths.length, 1));
  const growthPct =
    overview?.growthPct ??
    (chartMonths.length > 1
      ? trendPercent(chartMonths[chartMonths.length - 1].volume, chartMonths[chartMonths.length - 2].volume)
      : 0);
  const goalLabel = unit === 'day' ? '100' : '3K';

  const upcomingRows = dashboard?.upcomingDeliveries?.length
    ? dashboard.upcomingDeliveries
    : fallbackUpcoming;
  const historyItems = dashboard?.buyingHistory?.length ? dashboard.buyingHistory : fallbackHistory;

  const visibleRows =
    tableFilter === 'All'
      ? upcomingRows.filter((r) => (r.status || '').toLowerCase().trim() !== 'cancelled')
      : upcomingRows.filter((r) => (r.status || '').toLowerCase().trim() === 'pending');

  const maxVolume = Math.max(...chartMonths.map((m) => m.volume), 1);
  const sparkPending = useMemo(
    () => buildSparkPath(chartMonths.map((m) => m.volume)),
    [chartMonths]
  );
  const sparkDelivered = useMemo(
    () => buildSparkPath(chartMonths.map((m) => m.revenue)),
    [chartMonths]
  );
  const sparkTotal = useMemo(
    () =>
      buildSparkPath(
        chartMonths.reduce((acc, m) => [...acc, (acc[acc.length - 1] || 0) + m.volume], [])
      ),
    [chartMonths]
  );

  // The highlighted chart column must always point at a bucket that exists –
  // derived during render instead of via a setState effect.
  const activeMonth = chartMonths.some((m) => m.month === selectedMonth)
    ? selectedMonth
    : chartMonths[chartMonths.length - 1]?.month || '';

  const firstName = (adminName || 'Admin').split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';


  return (
    <div className="shv-admin-dashboard-view">
      {/* 1. Welcome Greeting Banner */}
      <div className="shv-admin-welcome-banner">
        <h1 className="shv-admin-welcome-title">
          {greeting}, {firstName} 👋
        </h1>
        <p className="shv-admin-welcome-sub">
          Manage orders, track shipments, and shop products — all in one place.
          {isLoading ? ' Syncing…' : ''}
        </p>
      </div>

      {/* Fallback notice – only shown when the dashboard endpoint is unreachable */}
      {loadError && !dashboard && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            padding: '0.7rem 1rem',
            borderRadius: '10px',
            background: '#FEF2F2',
            color: '#DC2626',
            fontSize: '0.84rem',
          }}
        >
          <AlertCircle size={15} />
          <span>{loadError} — showing locally calculated data.</span>
        </div>
      )}

      {/* 2. Stat Cards Row (3 Cards matching Modulix image) */}
      <div className="shv-admin-stats-grid">
        <StatCard
          icon={<Clock size={18} />}
          label="Pending Orders"
          value={stats.pending.value}
          trend={stats.pending.trend}
          sparkPath={sparkPending}
          sparkColor="#10B981"
        />
        <StatCard
          icon={<Truck size={18} />}
          label="Recent Delivered"
          value={stats.delivered.value}
          trend={stats.delivered.trend}
          sparkPath={sparkDelivered}
          sparkColor="#10B981"
        />
        <StatCard
          icon={<Box size={18} />}
          label="Total Orders"
          value={stats.total.value}
          trend={stats.total.trend}
          sparkPath={sparkTotal}
          sparkColor="#CBD5E1"
        />
      </div>

      {/* 3. Middle Section: Overview Chart (Left 65%) + Buying History (Right 35%) */}
      <div className="shv-admin-middle-grid">
        {/* Overview Chart Card */}
        <div className="shv-admin-overview-card">
          <div className="shv-overview-card-header">
            <h2 className="shv-overview-title">Overview</h2>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="shv-overview-select"
            >
              <option value="8m">Last 8 Months</option>
              <option value="this-month">This Month</option>
              <option value="year">{`Year ${new Date().getFullYear()}`}</option>
            </select>
          </div>

          <div className="shv-overview-avg-row">
            <div className="shv-overview-avg-label">{`Avg Per ${unit === 'day' ? 'day' : 'month'}`}</div>
            <div className="shv-overview-avg-val-group">
              <span className="shv-overview-avg-number">{`${avgVolume.toLocaleString('en-US')}/${goalLabel}`}</span>
              <span className="shv-overview-avg-badge">
                <span>{`${Math.abs(growthPct)}%`}</span>
                <span>{growthPct >= 0 ? '▲' : '▼'}</span>
              </span>
            </div>
          </div>

          {/* Bar Chart matching Modulix reference */}
          <div className="shv-chart-bars-wrap">
            {chartMonths.map((item) => {
              const isSelected = activeMonth === item.month;
              return (
                <div
                  key={item.month}
                  className={`shv-chart-bar-col ${isSelected ? 'highlighted' : ''}`}
                  onClick={() => setSelectedMonth(item.month)}
                >
                  {/* Active Tooltip matching exact screenshot */}
                  {isSelected && (
                    <div className="shv-chart-tooltip">
                      <div>{item.fullLabel || item.month}</div>
                      <div>{`${item.volume} orders`}</div>
                    </div>
                  )}

                  <div className="shv-chart-bar-track">
                    <div
                      className="shv-chart-bar-fill"
                      style={{
                        height: `${Math.max(8, Math.round((item.volume / maxVolume) * 100))}%`,
                      }}
                    />
                    {isSelected && <div className="shv-chart-bar-dot" />}
                  </div>

                  <span className="shv-chart-month-label">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Buying History Side Panel */}
        <div className="shv-admin-history-card">
          <h2 className="shv-history-title">Buying History</h2>

          <div className="shv-history-list">
            {historyItems.length === 0 && (
              <div style={{ color: 'var(--admin-text-muted)', fontSize: '0.85rem' }}>
                No orders yet — new orders will appear here.
              </div>
            )}
            {historyItems.map((entry) => {
              const badgeClass = getStatusBadgeClass(entry.status);
              return (
                <div
                  key={entry.id}
                  className="shv-history-item"
                  onClick={() => onSelectOrder && onSelectOrder(entry)}
                  style={{ cursor: onSelectOrder ? 'pointer' : 'default' }}
                >
                  <img
                    src={getImageUrl(entry.image) || PLACEHOLDER_IMAGE}
                    alt={entry.name}
                    className="shv-history-img"
                  />
                  <div className="shv-history-info">
                    <div className="shv-history-name">
                      {entry.name}
                      {entry.qty > 1 ? ` — ${entry.qty}` : ''}
                    </div>
                    <div className="shv-history-meta-row">
                      <span>Status :</span>
                      <span
                        className={`shv-status-pill ${badgeClass}`}
                        style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem' }}
                      >
                        {STATUS_ICONS[badgeClass]}
                        <span>{statusLabel(entry.status)}</span>
                      </span>
                    </div>
                    <div className="shv-history-meta-row" style={{ marginTop: '0.2rem' }}>
                      <span>{`Order ID : #${entry.orderCode}`}</span>
                    </div>
                    <div className="shv-history-meta-row">
                      <span>{`Order Date : ${entry.date}`}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4. Lower Section: Upcoming Deliveries Table */}
      <div className="shv-admin-table-card">
        <div className="shv-table-card-header">
          <h2 className="shv-table-title">Upcoming Deliveries</h2>
          <button
            type="button"
            className="shv-table-filter-btn"
            onClick={() => setTableFilter(tableFilter === 'All' ? 'Pending' : 'All')}
          >
            <SlidersHorizontal size={14} />
            <span>{tableFilter === 'All' ? 'Filter' : 'Pending Only'}</span>
          </button>
        </div>

        <div className="shv-admin-table-wrap">
          <table className="shv-admin-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={
                      visibleRows.length > 0 &&
                      visibleRows.every((r) => selectedRowIds.includes(r.id))
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRowIds(visibleRows.map((r) => r.id));
                      } else {
                        setSelectedRowIds([]);
                      }
                    }}
                  />
                </th>
                <th>ID Order ⇅</th>
                <th>Item</th>
                <th>Qty</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: 'center',
                      color: 'var(--admin-text-muted)',
                      padding: '1.5rem',
                    }}
                  >
                    No upcoming deliveries right now.
                  </td>
                </tr>
              )}
              {visibleRows.map((row) => {
                const isChecked = selectedRowIds.includes(row.id);
                const badgeClass = getStatusBadgeClass(row.status);
                return (
                  <tr key={row.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleRow(row.id)}
                      />
                    </td>
                    <td>
                      <span className="shv-table-order-id">{row.orderCode}</span>
                    </td>
                    <td>
                      <div className="shv-table-item-cell">
                        <strong>{row.item}</strong>
                      </div>
                    </td>
                    <td>
                      <span>{`${row.qty} pcs`}</span>
                    </td>
                    <td>
                      <span>{row.date}</span>
                    </td>
                    <td>
                      <span className={`shv-status-pill ${badgeClass}`}>
                        {STATUS_ICONS[badgeClass]}
                        <span>{statusLabel(row.status)}</span>
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

export default AdminDashboard;
