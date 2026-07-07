import axiosClient from '../api/axios';

const analyticsService = {
  getSalesReport: async (startDate, endDate, groupBy = 'month') => {
    try {
      const endpoint = groupBy === 'year' ? '/amazon-orders/revenue/yearly' : '/amazon-orders/revenue/monthly';
      const response = await axiosClient.get(endpoint);
      const data = response.data || response;
      
      const salesData = (Array.isArray(data) ? data : []).map((item) => {
        return {
          period: item.period || '',
          grossSales: item.revenue || 0,
          netRevenue: item.revenue || 0,
          totalItemsSold: item.ordersCount || 0,
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
      const endpoint = groupBy === 'year' ? '/amazon-orders/revenue/yearly' : '/amazon-orders/revenue/monthly';
      const response = await axiosClient.get(endpoint);
      const data = response.data || response;

      const revenueData = (Array.isArray(data) ? data : []).map((item) => {
        return {
          period: item.period || '',
          netRevenue: item.revenue || 0,
          grossRevenue: item.revenue || 0,
          taxCollected: 0,
          shippingFees: 0,
          totalOrders: item.ordersCount || 0,
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

  getTopProducts: async () => {
    try {
      const response = await axiosClient.get('/amazon-orders/products');
      const data = response.data || response;
      return Array.isArray(data) ? data.map(p => ({
        name: p._id,
        quantitySold: p.count,
        revenueGenerated: p.revenue
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
