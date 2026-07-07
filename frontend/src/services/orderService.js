import axiosClient from '../api/axios';

export const orderService = {
  getOrders: async (params) => {
    return axiosClient.get('/orders', { params });
  },

  getOrderById: async (orderId) => {
    return axiosClient.get(`/orders/${orderId}`);
  },

  createOrder: async (orderData) => {
    return axiosClient.post('/orders', orderData);
  },

  replaceOrder: async (orderId, orderData) => {
    return axiosClient.put(`/orders/${orderId}`, orderData);
  },

  updateOrder: async (orderId, orderData) => {
    return axiosClient.patch(`/orders/${orderId}`, orderData);
  },

  deleteOrder: async (orderId) => {
    return axiosClient.delete(`/orders/${orderId}`);
  },

  checkOrderExists: async (orderId) => {
    return axiosClient.get(`/orders/${orderId}/exists`);
  },

  getOrderSummary: async (orderId) => {
    return axiosClient.get(`/orders/${orderId}/summary`);
  },

  getOrderItems: async (orderId) => {
    return axiosClient.get(`/orders/${orderId}/items`);
  },

  getOrderHistory: async (orderId) => {
    return axiosClient.get(`/orders/${orderId}/history`);
  },

  archiveOrder: async (orderId) => {
    return axiosClient.patch(`/orders/${orderId}/archive`);
  },

  restoreOrder: async (orderId) => {
    return axiosClient.patch(`/orders/${orderId}/restore`);
  },

  cancelOrder: async (orderId, cancelData) => {
    return axiosClient.post(`/orders/${orderId}/cancel`, cancelData);
  },

  duplicateOrder: async (orderId) => {
    return axiosClient.post(`/orders/${orderId}/duplicate`);
  },

  getOrderInvoice: async (orderId) => {
    return axiosClient.get(`/orders/${orderId}/invoice`);
  },

  // Search routes
  searchOrders: async (params) => {
    return axiosClient.get('/orders/search', { params });
  },
  searchByCustomer: async (q) => {
    return axiosClient.get('/orders/search/customer', { params: { q } });
  },
  searchByProduct: async (q) => {
    return axiosClient.get('/orders/search/product', { params: { q } });
  },
  searchByCategory: async (q) => {
    return axiosClient.get('/orders/search/category', { params: { q } });
  },
  searchByBrand: async (q) => {
    return axiosClient.get('/orders/search/brand', { params: { q } });
  },
  searchByStatus: async (q) => {
    return axiosClient.get('/orders/search/status', { params: { q } });
  },
  searchByPayment: async (q) => {
    return axiosClient.get('/orders/search/payment', { params: { q } });
  },
  searchByLocation: async (q) => {
    return axiosClient.get('/orders/search/location', { params: { q } });
  },
  searchByDate: async (q) => {
    return axiosClient.get('/orders/search/date', { params: { q } });
  },
  searchByTracking: async (q) => {
    return axiosClient.get('/orders/search/tracking', { params: { q } });
  },
  fuzzySearch: async (q) => {
    return axiosClient.get('/orders/search/fuzzy', { params: { q } });
  },
  autocompleteSearch: async (q) => {
    return axiosClient.get('/orders/search/autocomplete', { params: { q } });
  },
  highlightSearch: async (q) => {
    return axiosClient.get('/orders/search/highlight', { params: { q } });
  },
  getRecentSearches: async (limit) => {
    return axiosClient.get('/orders/search/recent', { params: { limit } });
  },
  getPopularSearches: async (limit) => {
    return axiosClient.get('/orders/search/popular', { params: { limit } });
  },

  // Filter routes
  filterByStatus: async (type) => {
    return axiosClient.get('/orders/filter/status', { params: { type } });
  },
  filterByPayment: async (method) => {
    return axiosClient.get('/orders/filter/payment', { params: { method } });
  },
  filterByCategory: async (name) => {
    return axiosClient.get('/orders/filter/category', { params: { name } });
  },
  filterByBrand: async (name) => {
    return axiosClient.get('/orders/filter/brand', { params: { name } });
  },
  filterByPrice: async (min, max) => {
    return axiosClient.get('/orders/filter/price', { params: { min, max } });
  },
  filterByDate: async (start, end) => {
    return axiosClient.get('/orders/filter/date', { params: { start, end } });
  },
  filterByCountry: async (name) => {
    return axiosClient.get('/orders/filter/country', { params: { name } });
  },
  filterByState: async (name) => {
    return axiosClient.get('/orders/filter/state', { params: { name } });
  },
  filterByCity: async (name) => {
    return axiosClient.get('/orders/filter/city', { params: { name } });
  },
  filterByHighValue: async (amount) => {
    return axiosClient.get('/orders/filter/high-value', { params: { amount } });
  },
  filterByDiscounted: async () => {
    return axiosClient.get('/orders/filter/discounted');
  },
  filterByCancelled: async () => {
    return axiosClient.get('/orders/filter/cancelled');
  },
  filterByRefunded: async () => {
    return axiosClient.get('/orders/filter/refunded');
  },
  filterByShipped: async () => {
    return axiosClient.get('/orders/filter/shipped');
  },
  filterByDelivered: async () => {
    return axiosClient.get('/orders/filter/delivered');
  },

  // Sort routes
  sortByHighestValue: async () => {
    return axiosClient.get('/orders/sort/highest-value');
  },
  sortByLowestValue: async () => {
    return axiosClient.get('/orders/sort/lowest-value');
  },
  sortByLatest: async () => {
    return axiosClient.get('/orders/sort/latest');
  },
  sortByOldest: async () => {
    return axiosClient.get('/orders/sort/oldest');
  },
  sortByMostItems: async () => {
    return axiosClient.get('/orders/sort/most-items');
  },
  sortByLeastItems: async () => {
    return axiosClient.get('/orders/sort/least-items');
  },
  sortByDiscountAmount: async () => {
    return axiosClient.get('/orders/sort/discount');
  },

  // Pagination routes
  getPagedOrders: async (page, limit) => {
    return axiosClient.get('/orders/paged', { params: { page, limit } });
  },
  getInfiniteScrollOrders: async (page, limit) => {
    return axiosClient.get('/orders/infinite', { params: { page, limit } });
  },
  getRecentOrders: async (page, limit) => {
    return axiosClient.get('/orders/recent', { params: { page, limit } });
  },
  getCancelledOrders: async (page, limit) => {
    return axiosClient.get('/orders/cancelled', { params: { page, limit } });
  },
  getRefundedOrders: async (page, limit) => {
    return axiosClient.get('/orders/refunded', { params: { page, limit } });
  },
  getCustomerOrders: async (customerId, page, limit) => {
    return axiosClient.get(`/orders/customer/${customerId}`, { params: { page, limit } });
  },
  getProductOrders: async (productId, page, limit) => {
    return axiosClient.get(`/orders/product/${productId}`, { params: { page, limit } });
  },

  // Bulk routes
  bulkCreate: async (payload) => {
    return axiosClient.post('/orders/bulk/create', payload);
  },
  bulkUpdate: async (payload) => {
    return axiosClient.patch('/orders/bulk/update', payload);
  },
  bulkDelete: async (payload) => {
    return axiosClient.delete('/orders/bulk/delete', { data: payload });
  },
  bulkUpdateStatus: async (payload) => {
    return axiosClient.patch('/orders/bulk/status', payload);
  },
  bulkArchive: async (payload) => {
    return axiosClient.patch('/orders/bulk/archive', payload);
  },
  bulkRestore: async (payload) => {
    return axiosClient.patch('/orders/bulk/restore', payload);
  },
  bulkApplyDiscount: async (payload) => {
    return axiosClient.post('/orders/bulk/apply-discount', payload);
  },
  bulkUpdatePaymentStatus: async (payload) => {
    return axiosClient.patch('/orders/bulk/payment-status', payload);
  },
  bulkUpdateShippingStatus: async (payload) => {
    return axiosClient.patch('/orders/bulk/shipping-status', payload);
  },
  bulkCleanupCancelled: async (payload) => {
    return axiosClient.delete('/orders/bulk/cleanup-cancelled', { data: payload });
  },

  getOrderAnalytics: async () => {
    return axiosClient.get('/analytics/revenue/total');
  },
};

export default orderService;
