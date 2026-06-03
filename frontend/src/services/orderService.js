import axiosClient from '../api/axios';

export const orderService = {
  // Fetch all orders with pagination support
  getOrders: async (params) => {
    return axiosClient.get('/orders', { params });
  },

  // Fetch complete order details
  getOrderById: async (orderId) => {
    return axiosClient.get(`/orders/${orderId}`);
  },

  // Create a new order
  createOrder: async (orderData) => {
    return axiosClient.post('/orders', orderData);
  },

  // Replace complete order information
  replaceOrder: async (orderId, orderData) => {
    return axiosClient.put(`/orders/${orderId}`, orderData);
  },

  // Partially update order fields
  updateOrder: async (orderId, orderData) => {
    return axiosClient.patch(`/orders/${orderId}`, orderData);
  },

  // Permanently delete an order
  deleteOrder: async (orderId) => {
    return axiosClient.delete(`/orders/${orderId}`);
  },

  // Check whether order exists
  checkOrderExists: async (orderId) => {
    return axiosClient.get(`/orders/${orderId}/exists`);
  },

  // Fetch summarized order details
  getOrderSummary: async (orderId) => {
    return axiosClient.get(`/orders/${orderId}/summary`);
  },

  // Fetch items of an order
  getOrderItems: async (orderId) => {
    return axiosClient.get(`/orders/${orderId}/items`);
  },

  // Fetch order status history
  getOrderHistory: async (orderId) => {
    return axiosClient.get(`/orders/${orderId}/history`);
  },

  // Archive an order
  archiveOrder: async (orderId) => {
    return axiosClient.patch(`/orders/${orderId}/archive`);
  },

  // Restore archived order
  restoreOrder: async (orderId) => {
    return axiosClient.patch(`/orders/${orderId}/restore`);
  },

  // Cancel an order
  cancelOrder: async (orderId, cancelData) => {
    return axiosClient.post(`/orders/${orderId}/cancel`, cancelData);
  },

  // Duplicate an order
  duplicateOrder: async (orderId) => {
    return axiosClient.post(`/orders/${orderId}/duplicate`);
  },

  // Generate invoice details
  getOrderInvoice: async (orderId) => {
    return axiosClient.get(`/orders/${orderId}/invoice`);
  },

  // Phase 9 Bulk Operations
  bulkUpdateStatus: async (orderIds, status) => {
    return axiosClient.post('/orders/bulk', { ids: orderIds, status });
  },

  // Analytics endpoint
  getOrderAnalytics: async () => {
    return axiosClient.get('/admin/analytics');
  }
};

export default orderService;
