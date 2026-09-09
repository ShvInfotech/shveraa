import React, { useState } from 'react';
import {
  Clock,
  Truck,
  PackageCheck,
  TrendingUp,
  TrendingDown,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Calendar,
  Box,
} from 'lucide-react';
import { MONTHLY_SALES_CHART } from './adminData';

const AdminDashboard = ({ orders, onSelectOrder }) => {
  const [selectedMonth, setSelectedMonth] = useState('Aug');
  const [timeRange, setTimeRange] = useState('Last Month');
  const [tableFilter, setTableFilter] = useState('All');
  const [selectedRowIds, setSelectedRowIds] = useState(['ORD-2341-0']);

  // Calculated metrics
  const pendingOrders = orders.filter(
    (o) => o.status === 'Scheduled' || o.status === 'On Hold' || o.status === 'Pending'
  ).length;

  const deliveredOrders = orders.filter((o) => o.status === 'Delivered').length;
  const totalOrdersCount = orders.length;

  // Flattened items for Upcoming Deliveries table
  const deliveryTableRows = [
    {
      id: 'ORD-2341-0',
      orderCode: 'ORD-2341',
      item: 'Concrete Blocks',
      productName: 'Lumina 925 Solitaire Ring',
      qty: '800 pcs',
      date: 'Sep 29, 2025',
      status: 'Scheduled',
      statusType: 'scheduled',
    },
    {
      id: 'ORD-2341-1',
      orderCode: 'ORD-2341',
      item: 'Wooden Planks',
      productName: 'Celeste Diamond Pendant',
      qty: '500 pcs',
      date: 'Sep 22, 2025',
      status: 'On The Way',
      statusType: 'ontheway',
    },
    {
      id: 'ORD-2341-2',
      orderCode: 'ORD-2341',
      item: 'Cement Bags',
      productName: 'Aura Silver Bangle Cuff',
      qty: '300 pcs',
      date: 'Sep 23, 2025',
      status: 'Scheduled',
      statusType: 'scheduled',
    },
    {
      id: 'ORD-2342-0',
      orderCode: 'ORD-2342',
      item: 'Silver Stacking Bands',
      productName: 'Eternal Wave Silver Band',
      qty: '120 pcs',
      date: 'Oct 02, 2025',
      status: 'On The Way',
      statusType: 'ontheway',
    },
  ];

  const handleToggleRow = (id) => {
    if (selectedRowIds.includes(id)) {
      setSelectedRowIds(selectedRowIds.filter((r) => r !== id));
    } else {
      setSelectedRowIds([...selectedRowIds, id]);
    }
  };

  return (
    <div className="shv-admin-dashboard-view">
      {/* 1. Welcome Greeting Banner */}
      <div className="shv-admin-welcome-banner">
        <h1 className="shv-admin-welcome-title">Welcome, Danang Calvin 👋</h1>
        <p className="shv-admin-welcome-sub">
          Manage orders, track shipments, and shop products — all in one place.
        </p>
      </div>

      {/* 2. Stat Cards Row (3 Cards matching Modulix image) */}
      <div className="shv-admin-stats-grid">
        {/* Pending Orders Card */}
        <div className="shv-admin-stat-card">
          <div className="shv-stat-card-header">
            <div className="shv-stat-card-icon">
              <Clock size={18} />
            </div>
            <span>Pending Orders</span>
          </div>
          <div className="shv-stat-card-body">
            <div>
              <div className="shv-stat-card-number">219</div>
              <div className="shv-stat-trend positive">
                <span>+21%</span>
                <span>vs Last Month</span>
              </div>
            </div>
            {/* Sparkline Graphic (Green Line) */}
            <svg className="shv-stat-sparkline" viewBox="0 0 100 40" fill="none">
              <path
                d="M5 32 Q 25 35, 45 28 T 85 10 T 95 14"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Recent Delivered Card */}
        <div className="shv-admin-stat-card">
          <div className="shv-stat-card-header">
            <div className="shv-stat-card-icon">
              <Truck size={18} />
            </div>
            <span>Recent Delivered</span>
          </div>
          <div className="shv-stat-card-body">
            <div>
              <div className="shv-stat-card-number">231</div>
              <div className="shv-stat-trend positive">
                <span>+11%</span>
                <span>vs Last Month</span>
              </div>
            </div>
            {/* Sparkline Graphic (Green Line) */}
            <svg className="shv-stat-sparkline" viewBox="0 0 100 40" fill="none">
              <path
                d="M5 28 Q 30 30, 50 24 T 80 16 T 95 8"
                stroke="#10B981"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="shv-admin-stat-card">
          <div className="shv-stat-card-header">
            <div className="shv-stat-card-icon">
              <Box size={18} />
            </div>
            <span>Total Orders</span>
          </div>
          <div className="shv-stat-card-body">
            <div>
              <div className="shv-stat-card-number">500</div>
              <div className="shv-stat-trend negative">
                <span>-125</span>
                <span>vs Last Month</span>
              </div>
            </div>
            {/* Sparkline Graphic (Muted Line) */}
            <svg className="shv-stat-sparkline" viewBox="0 0 100 40" fill="none">
              <path
                d="M5 12 Q 30 18, 55 26 T 85 28 T 95 32"
                stroke="#CBD5E1"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
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
              <option value="Last Month">Last Month</option>
              <option value="This Month">This Month</option>
              <option value="Year 2026">Year 2026</option>
            </select>
          </div>

          <div className="shv-overview-avg-row">
            <div className="shv-overview-avg-label">Avg Per month</div>
            <div className="shv-overview-avg-val-group">
              <span className="shv-overview-avg-number">1,860/3K</span>
              <span className="shv-overview-avg-badge">
                <span>50,2%</span>
                <span>▲</span>
              </span>
            </div>
          </div>

          {/* Bar Chart matching Modulix reference */}
          <div className="shv-chart-bars-wrap">
            {MONTHLY_SALES_CHART.map((item) => {
              const isSelected = selectedMonth === item.month;
              return (
                <div
                  key={item.month}
                  className={`shv-chart-bar-col ${isSelected ? 'highlighted' : ''}`}
                  onClick={() => setSelectedMonth(item.month)}
                >
                  {/* Active Tooltip matching exact screenshot */}
                  {isSelected && (
                    <div className="shv-chart-tooltip">
                      <div>August 2025</div>
                      <div>{item.volume} pcs</div>
                    </div>
                  )}

                  <div className="shv-chart-bar-track">
                    <div
                      className="shv-chart-bar-fill"
                      style={{ height: item.height }}
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
            {/* Item 1 */}
            <div className="shv-history-item">
              <img
                src="https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=200&q=85"
                alt="Concrete Blocks"
                className="shv-history-img"
              />
              <div className="shv-history-info">
                <div className="shv-history-name">Concrete Blocks</div>
                <div className="shv-history-meta-row">
                  <span>Status :</span>
                  <span className="shv-status-pill ontheway" style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem' }}>
                    On Progress
                  </span>
                </div>
                <div className="shv-history-meta-row" style={{ marginTop: '0.2rem' }}>
                  <span>Order ID : #PV_243...</span>
                </div>
                <div className="shv-history-meta-row">
                  <span>Delivery Date : Sep 29</span>
                </div>
              </div>
            </div>

            {/* Item 2 */}
            <div className="shv-history-item">
              <img
                src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=200&q=85"
                alt="Cement Bags"
                className="shv-history-img"
              />
              <div className="shv-history-info">
                <div className="shv-history-name">Cement Bags — 3</div>
                <div className="shv-history-meta-row">
                  <span>Status :</span>
                  <span className="shv-status-pill onhold" style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem' }}>
                    On Hold
                  </span>
                </div>
                <div className="shv-history-meta-row" style={{ marginTop: '0.2rem' }}>
                  <span>Order ID : #PV_243...</span>
                </div>
                <div className="shv-history-meta-row">
                  <span>Delivery Date : Sep 23</span>
                </div>
              </div>
            </div>

            {/* Item 3 */}
            <div className="shv-history-item">
              <img
                src="https://images.unsplash.com/photo-1611591475155-4286fa7c2e7f?auto=format&fit=crop&w=200&q=85"
                alt="Concrete Blocks"
                className="shv-history-img"
              />
              <div className="shv-history-info">
                <div className="shv-history-name">Concrete Blocks</div>
                <div className="shv-history-meta-row">
                  <span>Status :</span>
                  <span className="shv-status-pill cancelled" style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem' }}>
                    Cancelled
                  </span>
                </div>
                <div className="shv-history-meta-row" style={{ marginTop: '0.2rem' }}>
                  <span>Order ID : #PV_243...</span>
                </div>
                <div className="shv-history-meta-row">
                  <span>Delivery Date : Sep 18</span>
                </div>
              </div>
            </div>

            {/* Item 4 */}
            <div className="shv-history-item">
              <img
                src="https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=200&q=85"
                alt="Wooden Planks"
                className="shv-history-img"
              />
              <div className="shv-history-info">
                <div className="shv-history-name">Wooden Planks —</div>
                <div className="shv-history-meta-row">
                  <span>Status :</span>
                  <span className="shv-status-pill ontheway" style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem' }}>
                    On Progress
                  </span>
                </div>
                <div className="shv-history-meta-row" style={{ marginTop: '0.2rem' }}>
                  <span>Order ID : #PV_243...</span>
                </div>
                <div className="shv-history-meta-row">
                  <span>Delivery Date : Sep 22</span>
                </div>
              </div>
            </div>
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
            onClick={() =>
              setTableFilter(tableFilter === 'All' ? 'Scheduled' : 'All')
            }
          >
            <SlidersHorizontal size={14} />
            <span>Filter</span>
          </button>
        </div>

        <div className="shv-admin-table-wrap">
          <table className="shv-admin-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={selectedRowIds.length === deliveryTableRows.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedRowIds(deliveryTableRows.map((r) => r.id));
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
              {deliveryTableRows.map((row) => {
                const isChecked = selectedRowIds.includes(row.id);
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
                      <span>{row.qty}</span>
                    </td>
                    <td>
                      <span>{row.date}</span>
                    </td>
                    <td>
                      <span className={`shv-status-pill ${row.statusType}`}>
                        {row.status === 'Scheduled' && <Box size={13} />}
                        {row.status === 'On The Way' && <Truck size={13} />}
                        <span>{row.status}</span>
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
