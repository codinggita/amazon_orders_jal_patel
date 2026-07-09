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

  // Build donut chart data from status breakdown, grouping cases like 'Shipped' and 'shipped'
  const categoryData = [];
  if (Array.isArray(statusArr)) {
    const grouped = statusArr.reduce((acc, s) => {
      const name = s.status
        ? s.status.charAt(0).toUpperCase() + s.status.slice(1).toLowerCase()
        : 'Unknown';
      acc[name] = (acc[name] || 0) + s.count;
      return acc;
    }, {});
    for (const [name, value] of Object.entries(grouped)) {
      categoryData.push({ name, value });
    }
  }

  const totalOrders    = overview.orders?.total     || 0;
  const totalRevenue   = overview.revenue?.total    || 0;
  const pendingOrders  = overview.orders?.pending   || 0;
  const deliveredOrders = overview.orders?.delivered || 0;

  return {
    kpis: {
      totalRevenue: {
        value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
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
