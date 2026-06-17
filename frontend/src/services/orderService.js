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

  bulkUpdateStatus: async (orderIds, status) => {
    return axiosClient.post('/orders/bulk', { ids: orderIds, status });
  },

  getOrderAnalytics: async () => {
    return axiosClient.get('/analytics/revenue/total');
  },
};

export default orderService;
