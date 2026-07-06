/**
 * amazonOrderService.js
 * Frontend service for the real Amazon Orders dataset API (/api/v1/amazon-orders/*).
 */

import axiosClient from '../api/axios';

export const amazonOrderService = {
  /** Paginated order list with optional filters */
  getOrders: (params = {}) =>
    axiosClient.get('/amazon-orders', { params }),

  /** Single order by MongoDB _id */
  getOrderById: (id) =>
    axiosClient.get(`/amazon-orders/${id}`),

  /** KPI overview */
  getOverview: () =>
    axiosClient.get('/amazon-orders/overview'),

  /** Monthly revenue trend */
  getMonthlyRevenue: () =>
    axiosClient.get('/amazon-orders/revenue/monthly'),

  /** Yearly revenue trend */
  getYearlyRevenue: () =>
    axiosClient.get('/amazon-orders/revenue/yearly'),

  /** Orders grouped by status */
  getOrdersByStatus: () =>
    axiosClient.get('/amazon-orders/by-status'),

  /** Top categories */
  getTopCategories: (limit = 10) =>
    axiosClient.get('/amazon-orders/categories', { params: { limit } }),

  /** Top products */
  getTopProducts: (limit = 10) =>
    axiosClient.get('/amazon-orders/products', { params: { limit } }),

  /** Top countries */
  getTopCountries: (limit = 10) =>
    axiosClient.get('/amazon-orders/countries', { params: { limit } }),

  /** Payment method breakdown */
  getPaymentMethodBreakdown: () =>
    axiosClient.get('/amazon-orders/payment-methods'),

  /** Top customers */
  getTopCustomers: (limit = 10) =>
    axiosClient.get('/amazon-orders/customers', { params: { limit } }),
};

export default amazonOrderService;
