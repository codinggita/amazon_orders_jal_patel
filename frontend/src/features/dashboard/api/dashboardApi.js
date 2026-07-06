import axiosClient from '../../../api/axios';

export const fetchDashboardStats = async () => {
  const [overviewRes, revenueRes, statusRes] = await Promise.all([
    axiosClient.get('/amazon-orders/overview'),
    axiosClient.get('/amazon-orders/revenue/monthly'),
    axiosClient.get('/amazon-orders/by-status'),
  ]);

  const overview = overviewRes.data || overviewRes;
  const revenueArr = revenueRes.data || revenueRes;
  const statusArr  = statusRes.data  || statusRes;

  // Build chart-ready revenue data from monthly array
  const revenueData = Array.isArray(revenueArr)
    ? revenueArr.map((r) => ({ name: r.period, revenue: r.revenue }))
    : [];

  // Build donut chart data from status breakdown
  const categoryData = Array.isArray(statusArr)
    ? statusArr.map((s) => ({
        name: s.status
          ? s.status.charAt(0).toUpperCase() + s.status.slice(1)
          : 'Unknown',
        value: s.count,
      }))
    : [];

  const totalOrders    = overview.orders?.total     || 0;
  const totalRevenue   = overview.revenue?.total    || 0;
  const pendingOrders  = overview.orders?.pending   || 0;
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
