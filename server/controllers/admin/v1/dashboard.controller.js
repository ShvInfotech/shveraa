import orderModel from "../../../models/order.model.js";

/* --------------------------------------------------------------------------
   ADMIN DASHBOARD CONTROLLER
   Aggregates everything the admin Dashboard tab needs in ONE request:
   - KPI stat cards (pending / delivered / total) with month-over-month trends
   - Overview chart buckets (last 8 months | this month by day | year by month)
   - Upcoming Deliveries table rows
   - "Buying History" side-panel feed
   -------------------------------------------------------------------------- */

// Statuses that are strictly pending (stat card #1).
const PENDING_STATUSES = ["pending"];
// Statuses still moving towards the customer → "Upcoming Deliveries".
const ACTIVE_STATUSES = ["pending", "accepted", "processing", "shipped", "out_for_delivery"];

// Month-over-month trend in %, guarding against division by zero.
const trendPercent = (current, previous) => {
  if (!previous) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
};

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
};

// Empty time buckets for the requested Overview range:
//   8m (default) → last 8 calendar months
//   this-month   → one bucket per day of the current month
//   year         → 12 buckets for the current year
const buildBuckets = (range) => {
  const now = new Date();
  const buckets = [];

  if (range === "this-month") {
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day += 1) {
      const start = new Date(now.getFullYear(), now.getMonth(), day);
      buckets.push({
        month: String(day),
        fullLabel: start.toLocaleString("en-US", { month: "short", day: "numeric" }),
        start,
        end: new Date(now.getFullYear(), now.getMonth(), day + 1),
        volume: 0,
        revenue: 0,
      });
    }
    return { buckets, unit: "day" };
  }

  if (range === "year") {
    for (let month = 0; month < 12; month += 1) {
      const start = new Date(now.getFullYear(), month, 1);
      buckets.push({
        month: start.toLocaleString("en-US", { month: "short" }),
        fullLabel: start.toLocaleString("en-US", { month: "short", year: "numeric" }),
        start,
        end: new Date(now.getFullYear(), month + 1, 1),
        volume: 0,
        revenue: 0,
      });
    }
    return { buckets, unit: "month" };
  }

  // Default: last 8 calendar months.
  for (let offset = 7; offset >= 0; offset -= 1) {
    const start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 1);
    buckets.push({
      month: start.toLocaleString("en-US", { month: "short" }),
      fullLabel: start.toLocaleString("en-US", { month: "short", year: "numeric" }),
      start,
      end,
      volume: 0,
      revenue: 0,
    });
  }
  return { buckets, unit: "month" };
};

export const GetAdminDashboardStats = async (req, res, next) => {
  try {
    const { range = "8m" } = req.query;
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const { buckets, unit } = buildBuckets(range);
    const rangeStart = buckets[0].start;
    const rangeEnd = buckets[buckets.length - 1].end;

    const [
      pendingTotal,
      pendingThisMonth,
      pendingLastMonth,
      deliveredThisMonth,
      deliveredLastMonth,
      totalOrders,
      createdThisMonth,
      createdLastMonth,
      rangeOrders,
      upcomingOrders,
      recentOrders,
    ] = await Promise.all([
      orderModel.countDocuments({ status: "pending" }),
      orderModel.countDocuments({ status: "pending", createdAt: { $gte: startOfThisMonth } }),
      orderModel.countDocuments({
        status: "pending",
        createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
      }),
      orderModel.countDocuments({ status: "delivered", updatedAt: { $gte: startOfThisMonth } }),
      orderModel.countDocuments({
        status: "delivered",
        updatedAt: { $gte: startOfLastMonth, $lt: startOfThisMonth },
      }),
      orderModel.countDocuments({ status: { $ne: "cancelled" } }),
      orderModel.countDocuments({ createdAt: { $gte: startOfThisMonth }, status: { $ne: "cancelled" } }),
      orderModel.countDocuments({ createdAt: { $gte: startOfLastMonth, $lt: startOfThisMonth }, status: { $ne: "cancelled" } }),
      orderModel.find({ createdAt: { $gte: rangeStart, $lt: rangeEnd }, status: { $ne: "cancelled" } }, { createdAt: 1, totalAmount: 1 }).lean(),
      orderModel
        .find({ status: { $in: ACTIVE_STATUSES, $nin: ["cancelled", "delivered"] } }, { orderNumber: 1, status: 1, createdAt: 1, items: 1 })
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
      orderModel
        .find({ status: { $ne: "cancelled" } }, { orderNumber: 1, status: 1, createdAt: 1, items: 1, totalAmount: 1 })
        .sort({ createdAt: -1 })
        .limit(4)
        .lean(),
    ]);

    // Fill the Overview buckets with orders created inside each bucket.
    for (const order of rangeOrders) {
      const createdAt = new Date(order.createdAt);
      const bucket = buckets.find((b) => createdAt >= b.start && createdAt < b.end);
      if (bucket) {
        bucket.volume += 1;
        bucket.revenue += Number(order.totalAmount) || 0;
      }
    }

    // Strip the internal Date boundaries – the client only needs display data.
    const months = buckets.map(({ start, end, ...bucket }) => bucket);
    const totalVolume = months.reduce((sum, b) => sum + b.volume, 0);
    const avgVolume = Math.round(totalVolume / Math.max(months.length, 1));
    const lastVolume = months[months.length - 1]?.volume || 0;
    const prevVolume = months[months.length - 2]?.volume || 0;
    const growthPct = trendPercent(lastVolume, prevVolume);

    // Upcoming Deliveries – flatten order items into table rows (max 8 rows).
    const upcomingDeliveries = [];
    for (const order of upcomingOrders) {
      const items = Array.isArray(order.items) && order.items.length > 0 ? order.items : [null];
      for (let index = 0; index < items.length && upcomingDeliveries.length < 8; index += 1) {
        const item = items[index];
        upcomingDeliveries.push({
          id: `${order.orderNumber || order._id}-${index}`,
          orderCode: order.orderNumber || "",
          item: item?.name || "Order item",
          qty: Number(item?.quantity) || 1,
          date: formatDate(order.createdAt),
          status: order.status || "pending",
        });
      }
    }

    // Buying History – latest orders with their first product.
    const buyingHistory = recentOrders.map((order, index) => {
      const item = Array.isArray(order.items) ? order.items[0] : null;
      return {
        id: order._id?.toString() || `${order.orderNumber || "order"}-${index}`,
        orderCode: order.orderNumber || "",
        name: item?.name || "Order item",
        image: item?.image || "",
        qty: Number(item?.quantity) || 1,
        status: order.status || "pending",
        date: formatDate(order.createdAt),
        totalAmount: Number(order.totalAmount) || 0,
      };
    });

    return res.status(200).json({
      success: true,
      dashboard: {
        stats: {
          pending: { value: pendingTotal, trend: trendPercent(pendingThisMonth, pendingLastMonth) },
          delivered: { value: deliveredThisMonth, trend: trendPercent(deliveredThisMonth, deliveredLastMonth) },
          total: { value: totalOrders, trend: trendPercent(createdThisMonth, createdLastMonth) },
        },
        overview: { unit, avgVolume, growthPct, months },
        upcomingDeliveries,
        buyingHistory,
      },
    });
  } catch (error) {
    return next(error);
  }
};
