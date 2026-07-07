/**
 * @file amazonOrderService.js
 * @description Business logic for the real Amazon Orders dataset
 * living in the "database" MongoDB collection (21,629 documents).
 *
 * All monetary fields (UnitPrice, TotalAmount, etc.) are stored as strings
 * in the dataset — we cast them to Number for aggregations.
 */

"use strict";

const AmazonOrder = require("../models/AmazonOrder");

// ─────────────────────────────────────────────────────────────────────────────
// LIST / SEARCH / FILTER / SORT / PAGINATE
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns a paginated list of Amazon orders with optional filters.
 *
 * @param {object} query - Express req.query
 * @param {number} [query.page=1]
 * @param {number} [query.limit=20]
 * @param {string} [query.status]         - e.g. "Delivered"
 * @param {string} [query.category]       - e.g. "Books"
 * @param {string} [query.country]        - e.g. "Australia"
 * @param {string} [query.paymentMethod]  - e.g. "Amazon Pay"
 * @param {string} [query.search]         - free-text search (OrderID, CustomerName, ProductName)
 * @param {string} [query.sort]           - e.g. "-TotalAmount" or "OrderDate"
 */
const listOrders = async (query = {}) => {
  const {
    page = 1,
    limit = 20,
    status,
    category,
    country,
    paymentMethod,
    search,
    sort = "-OrderDate",
  } = query;

  const filter = {};

  if (status)        filter.OrderStatus   = { $regex: new RegExp(`^${status}$`, "i") };
  if (category)      filter.Category      = { $regex: new RegExp(category, "i") };
  if (country)       filter.Country       = { $regex: new RegExp(country, "i") };
  if (paymentMethod) filter.PaymentMethod = { $regex: new RegExp(paymentMethod, "i") };

  if (search) {
    filter.$or = [
      { OrderID:      { $regex: new RegExp(search, "i") } },
      { CustomerName: { $regex: new RegExp(search, "i") } },
      { ProductName:  { $regex: new RegExp(search, "i") } },
      { CustomerID:   { $regex: new RegExp(search, "i") } },
    ];
  }

  // Build sort object
  const sortObj = {};
  const sortField = sort.startsWith("-") ? sort.slice(1) : sort;
  sortObj[sortField] = sort.startsWith("-") ? -1 : 1;

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const [results, totalResults] = await Promise.all([
    AmazonOrder.find(filter).sort(sortObj).skip(skip).limit(parseInt(limit, 10)).lean(),
    AmazonOrder.countDocuments(filter),
  ]);

  return {
    results,
    page:         parseInt(page, 10),
    limit:        parseInt(limit, 10),
    totalResults,
    totalPages:   Math.ceil(totalResults / parseInt(limit, 10)),
  };
};

/**
 * Returns a single order by MongoDB _id.
 */
const getOrderById = async (id) => {
  // If it's a valid 24-char ObjectId, fetch by _id
  if (id && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
    const order = await AmazonOrder.findById(id).lean();
    if (order) return order;
  }
  
  // Otherwise, fallback to checking the Amazon custom OrderID string
  const orderFallback = await AmazonOrder.findOne({ OrderID: id }).lean();
  return orderFallback;
};

/**
 * Returns a single order by the flat OrderID string (e.g. "ORD0000011").
 */
const getOrderByOrderId = async (orderId) => {
  const order = await AmazonOrder.findOne({ OrderID: orderId }).lean();
  return order;
};

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD STATS (used by dashboardService and dashboard API)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * High-level KPI overview for the dashboard.
 */
const getOverview = async () => {
  const [revenueResult, statusCounts, countryCount, categoryCount] =
    await Promise.all([
      // Total revenue & average
      AmazonOrder.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: { $toDouble: "$TotalAmount" } },
            totalShipping: { $sum: { $toDouble: "$ShippingCost" } },
            totalTax:      { $sum: { $toDouble: "$Tax" } },
            totalOrders:   { $sum: 1 },
            avgOrderValue: { $avg: { $toDouble: "$TotalAmount" } },
          },
        },
      ]),

      // Orders by status
      AmazonOrder.aggregate([
        {
          $group: {
            _id:   "$OrderStatus",
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),

      // Distinct countries
      AmazonOrder.distinct("Country"),

      // Distinct categories
      AmazonOrder.distinct("Category"),
    ]);

  const rev = revenueResult[0] || {
    totalRevenue: 0,
    totalShipping: 0,
    totalTax: 0,
    totalOrders: 0,
    avgOrderValue: 0,
  };

  const statusMap = {};
  statusCounts.forEach((s) => {
    if (s._id) statusMap[s._id.toLowerCase()] = s.count;
  });

  return {
    revenue: {
      total:         Math.round(rev.totalRevenue * 100)  / 100,
      shipping:      Math.round(rev.totalShipping * 100) / 100,
      tax:           Math.round(rev.totalTax * 100)      / 100,
      avgOrderValue: Math.round(rev.avgOrderValue * 100) / 100,
    },
    orders: {
      total:          rev.totalOrders,
      delivered:      statusMap.delivered      || 0,
      pending:        statusMap.pending        || 0,
      processing:     statusMap.processing     || 0,
      shipped:        statusMap.shipped        || 0,
      cancelled:      statusMap.cancelled      || 0,
      returned:       statusMap.returned       || 0,
    },
    geography: {
      countriesCount:   countryCount.length,
    },
    catalog: {
      categoriesCount:  categoryCount.length,
    },
  };
};

/**
 * Monthly revenue trend (grouped by YYYY-MM from the OrderDate string).
 */
const getMonthlyRevenue = async () => {
  const data = await AmazonOrder.aggregate([
    {
      $group: {
        _id:     { $substr: ["$OrderDate", 0, 7] }, // "YYYY-MM"
        revenue: { $sum: { $toDouble: "$TotalAmount" } },
        orders:  { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id:     0,
        period:  "$_id",
        revenue: { $round: ["$revenue", 2] },
        orders:  1,
      },
    },
  ]);
  return data;
};

/**
 * Yearly revenue trend.
 */
const getYearlyRevenue = async () => {
  const data = await AmazonOrder.aggregate([
    {
      $group: {
        _id:     { $substr: ["$OrderDate", 0, 4] }, // "YYYY"
        revenue: { $sum: { $toDouble: "$TotalAmount" } },
        orders:  { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id:     0,
        period:  "$_id",
        revenue: { $round: ["$revenue", 2] },
        orders:  1,
      },
    },
  ]);
  return data;
};

/**
 * Orders grouped by status (for donut/pie chart).
 */
const getOrdersByStatus = async () => {
  const data = await AmazonOrder.aggregate([
    {
      $group: {
        _id:          "$OrderStatus",
        count:        { $sum: 1 },
        totalRevenue: { $sum: { $toDouble: "$TotalAmount" } },
      },
    },
    { $sort: { count: -1 } },
    {
      $project: {
        _id:          0,
        status:       "$_id",
        count:        1,
        totalRevenue: { $round: ["$totalRevenue", 2] },
      },
    },
  ]);
  return data;
};

/**
 * Top selling categories by revenue and quantity.
 */
const getTopCategories = async (limit = 10) => {
  const data = await AmazonOrder.aggregate([
    {
      $group: {
        _id:          "$Category",
        totalRevenue: { $sum: { $toDouble: "$TotalAmount" } },
        totalQty:     { $sum: { $toInt: "$Quantity" } },
        orderCount:   { $sum: 1 },
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: limit },
    {
      $project: {
        _id:          0,
        category:     "$_id",
        totalRevenue: { $round: ["$totalRevenue", 2] },
        totalQty:     1,
        orderCount:   1,
      },
    },
  ]);
  return data;
};

/**
 * Top selling products by revenue.
 */
const getTopProducts = async (limit = 10) => {
  const data = await AmazonOrder.aggregate([
    {
      $group: {
        _id:          "$ProductName",
        totalRevenue: { $sum: { $toDouble: "$TotalAmount" } },
        totalQty:     { $sum: { $toInt: "$Quantity" } },
        orderCount:   { $sum: 1 },
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: limit },
    {
      $project: {
        _id:          0,
        productName:  "$_id",
        totalRevenue: { $round: ["$totalRevenue", 2] },
        totalQty:     1,
        orderCount:   1,
      },
    },
  ]);
  return data;
};

/**
 * Top countries by revenue.
 */
const getTopCountries = async (limit = 10) => {
  const data = await AmazonOrder.aggregate([
    {
      $group: {
        _id:          "$Country",
        totalRevenue: { $sum: { $toDouble: "$TotalAmount" } },
        orderCount:   { $sum: 1 },
      },
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: limit },
    {
      $project: {
        _id:          0,
        country:      "$_id",
        totalRevenue: { $round: ["$totalRevenue", 2] },
        orderCount:   1,
      },
    },
  ]);
  return data;
};

/**
 * Revenue breakdown by payment method.
 */
const getPaymentMethodBreakdown = async () => {
  const data = await AmazonOrder.aggregate([
    {
      $group: {
        _id:          "$PaymentMethod",
        totalRevenue: { $sum: { $toDouble: "$TotalAmount" } },
        orderCount:   { $sum: 1 },
      },
    },
    { $sort: { orderCount: -1 } },
    {
      $project: {
        _id:           0,
        paymentMethod: "$_id",
        totalRevenue:  { $round: ["$totalRevenue", 2] },
        orderCount:    1,
      },
    },
  ]);
  return data;
};

/**
 * Top customers by total spend.
 */
const getTopCustomers = async (limit = 10) => {
  const data = await AmazonOrder.aggregate([
    {
      $group: {
        _id:          "$CustomerID",
        customerName: { $first: "$CustomerName" },
        totalSpent:   { $sum: { $toDouble: "$TotalAmount" } },
        orderCount:   { $sum: 1 },
      },
    },
    { $sort: { totalSpent: -1 } },
    { $limit: limit },
    {
      $project: {
        _id:          0,
        customerId:   "$_id",
        customerName: 1,
        totalSpent:   { $round: ["$totalSpent", 2] },
        orderCount:   1,
      },
    },
  ]);
  return data;
};

module.exports = {
  listOrders,
  getOrderById,
  getOrderByOrderId,
  getOverview,
  getMonthlyRevenue,
  getYearlyRevenue,
  getOrdersByStatus,
  getTopCategories,
  getTopProducts,
  getTopCountries,
  getPaymentMethodBreakdown,
  getTopCustomers,
};
