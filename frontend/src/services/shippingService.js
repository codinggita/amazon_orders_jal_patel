import axiosClient from '../api/axios';

const shippingService = {
  getPendingShipments: async (params) => {
    const response = await axiosClient.get('/shipping/pending', { params });
    return response.data || response;
  },

  getDeliveredShipments: async (params) => {
    const response = await axiosClient.get('/shipping/delivered', { params });
    return response.data || response;
  },

  getTrackingInfo: async (orderId) => {
    const response = await axiosClient.get(`/shipping/tracking/${orderId}`);
    return response.data || response;
  },

  updateStatus: async (orderId, payload) => {
    const response = await axiosClient.patch(`/shipping/update-status/${orderId}`, payload);
    return response.data || response;
  }
};

export default shippingService;
