import axiosClient from '../../../api/axios';

export const fetchDashboardStats = async () => {
  const [overviewRes, revenueRes, ordersRes] = await Promise.all([
    axiosClient.get('/dashboard/overview'),
    axiosClient.get('/dashboard/revenue', { params: { period: 'monthly' } }),
    axiosClient.get('/dashboard/orders'),
  ]);

  const overview = overviewRes.data || overviewRes;
  const revenue = revenueRes.data || revenueRes;
  const orders = ordersRes.data || ordersRes;

  const revenueData = (revenue || []).map((r) => ({
    name: r.period,
    revenue: r.revenue,
  }));

  const categoryData = (orders.byStatus || []).map((s) => ({
    name: s.status.charAt(0).toUpperCase() + s.status.slice(1),
    value: s.count,
  }));

  const totalOrders = overview.orders?.total || 0;
  const totalRevenue = overview.revenue?.total || 0;
  const pendingOrders = overview.orders?.pending || 0;
  const deliveredOrders = overview.orders?.delivered || 0;

  return {
    kpis: {
      totalRevenue: {
        value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        trend: 0,
      },
      totalOrders: {
        value: totalOrders.toLocaleString(),
        trend: 0,
      },
      pendingOrders: {
        value: pendingOrders.toLocaleString(),
        trend: 0,
      },
      deliveredOrders: {
        value: deliveredOrders.toLocaleString(),
        trend: 0,
      },
    },
    revenueData,
    categoryData,
  };
};
