import axiosClient from '../api/axios';

const analyticsService = {
  getDateBounds: async () => {
    try {
      const response = await axiosClient.get('/analytics/date-bounds');
      const data = response.data || response;
      return data || { minDate: '2022-01-01', maxDate: '2024-12-31' };
    } catch (error) {
      console.error('Failed to fetch date bounds:', error);
      return { minDate: '2022-01-01', maxDate: '2024-12-31' };
    }
  },

  getSalesReport: async (startDate, endDate, groupBy = 'month') => {
    try {
      const endpoint = groupBy === 'year' ? '/analytics/revenue/yearly' : '/analytics/revenue/monthly';
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await axiosClient.get(endpoint, { params });
      const resPayload = response.data || response;
      const dataArr = resPayload.data || resPayload;
      
      const salesData = (Array.isArray(dataArr) ? dataArr : []).map((item) => {
        return {
          period: item.period || item.month || item.year || '',
          grossSales: item.revenue || 0,
          netRevenue: item.revenue || 0,
          totalItemsSold: item.ordersCount || item.orders || 0,
          grossRevenue: item.revenue || 0,
        };
      });

      return salesData;
    } catch (error) {
      console.error('Failed to fetch sales report:', error);
      throw error;
    }
  },

  getRevenueReport: async (startDate, endDate, groupBy = 'month') => {
    try {
      const endpoint = groupBy === 'year' ? '/analytics/revenue/yearly' : '/analytics/revenue/monthly';
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await axiosClient.get(endpoint, { params });
      const resPayload = response.data || response;
      const dataArr = resPayload.data || resPayload;

      const revenueData = (Array.isArray(dataArr) ? dataArr : []).map((item) => {
        return {
          period: item.period || item.month || item.year || '',
          netRevenue: item.revenue || 0,
          grossRevenue: item.revenue || 0,
          taxCollected: 0,
          shippingFees: 0,
          totalOrders: item.orders || 0,
        };
      });

      return revenueData;
    } catch (error) {
      console.error('Failed to fetch revenue report:', error);
      throw error;
    }
  },

  getSystemHealth: async () => {
    try {
      const response = await axiosClient.get('/health');
      return response.data || response;
    } catch (error) {
      console.error('Failed to fetch system health:', error);
      throw error;
    }
  },

  getTopProducts: async (startDate, endDate) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const response = await axiosClient.get('/analytics/products/top-selling', { params });
      const resPayload = response.data || response;
      const dataArr = resPayload.data || resPayload;
      
      return Array.isArray(dataArr) ? dataArr.map(p => ({
        name: p.product || p.productName || p.name || p._id,
        quantitySold: p.quantitySold || p.count || 0,
        revenueGenerated: p.revenueGenerated || p.revenue || 0
      })) : [];
    } catch (error) {
      console.error('Failed to fetch top products:', error);
      throw error;
    }
  },

  getTopCategories: async () => {
    try {
      const response = await axiosClient.get('/analytics/categories/top');
      const data = response.data || response;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Failed to fetch top categories:', error);
      throw error;
    }
  },

  getPaymentDistribution: async () => {
    try {
      const response = await axiosClient.get('/analytics/payments/distribution');
      const data = response.data || response;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Failed to fetch payment distribution:', error);
      throw error;
    }
  },

  getOrderStats: async () => {
    try {
      const [countRes, cancelledRes, avgRes] = await Promise.all([
        axiosClient.get('/analytics/orders/count'),
        axiosClient.get('/analytics/orders/cancelled'),
        axiosClient.get('/analytics/orders/average-value'),
      ]);
      return {
        count: countRes.data || countRes,
        cancelled: cancelledRes.data || cancelledRes,
        avgValue: avgRes.data || avgRes,
      };
    } catch (error) {
      console.error('Failed to fetch order stats:', error);
      throw error;
    }
  },

  getTopCustomers: async () => {
    try {
      const response = await axiosClient.get('/analytics/customers/top');
      const data = response.data || response;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Failed to fetch top customers:', error);
      throw error;
    }
  },

  getTopCities: async () => {
    try {
      const response = await axiosClient.get('/analytics/locations/top-cities');
      const data = response.data || response;
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Failed to fetch top cities:', error);
      throw error;
    }
  },

  getReturnsRate: async () => {
    try {
      const response = await axiosClient.get('/analytics/returns/rate');
      return response.data || response;
    } catch (error) {
      console.error('Failed to fetch returns rate:', error);
      throw error;
    }
  },
};

export default analyticsService;
