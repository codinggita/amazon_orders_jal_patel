// Mock API for Dashboard to decouple UI development from backend availability

export const fetchDashboardStats = async () => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    kpis: {
      totalRevenue: { value: '$124,563.00', trend: 12.5 },
      totalOrders: { value: '1,423', trend: 8.2 },
      pendingOrders: { value: '56', trend: -2.4 },
      deliveredOrders: { value: '1,280', trend: 14.1 },
    },
    revenueData: [
      { name: 'Jan', revenue: 45000 },
      { name: 'Feb', revenue: 52000 },
      { name: 'Mar', revenue: 48000 },
      { name: 'Apr', revenue: 61000 },
      { name: 'May', revenue: 59000 },
      { name: 'Jun', revenue: 75000 },
      { name: 'Jul', revenue: 82000 },
    ],
    categoryData: [
      { name: 'Electronics', value: 45 },
      { name: 'Apparel', value: 25 },
      { name: 'Home & Kitchen', value: 20 },
      { name: 'Books', value: 10 },
    ],
  };
};
