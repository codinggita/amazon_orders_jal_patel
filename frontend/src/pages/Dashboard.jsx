import React, { memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, ShoppingBag, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { StatsCard } from '../components/shared/StatsCard';
import { RevenueChart } from '../features/dashboard/components/RevenueChart';
import { CategoryDonutChart } from '../features/dashboard/components/CategoryDonutChart';
import { fetchDashboardStats } from '../features/dashboard/api/dashboardApi';

const DashboardSkeleton = memo(() => (
  <div className="space-y-6 animate-fade-in">
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="text-slate-400 text-sm">Overview of your operations and key metrics.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-32 rounded-lg glass-card border border-slate-800 animate-pulse bg-slate-800/50" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 h-96 rounded-lg glass-card border border-slate-800 animate-pulse bg-slate-800/50" />
      <div className="h-96 rounded-lg glass-card border border-slate-800 animate-pulse bg-slate-800/50" />
    </div>
  </div>
));

const DashboardError = memo(({ onRetry }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in p-4">
    <div className="glass-card max-w-md w-full p-8 rounded-2xl border border-red-500/20 shadow-2xl text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-950/50 border border-red-500/30 text-red-400 mb-6">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-bold text-slate-100 tracking-tight mb-2">Failed to Load Dashboard</h2>
      <p className="text-slate-400 text-sm mb-6 leading-relaxed">
        Unable to retrieve dashboard data. The server may be unavailable or your session may have expired.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-amazon-orange hover:bg-amazon-orange/90 text-slate-950 text-sm font-bold py-2.5 px-6 rounded-xl transition-all cursor-pointer inline-flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      )}
    </div>
  </div>
));

const Dashboard = memo(() => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
    staleTime: 30000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <DashboardSkeleton />;

  if (isError) return <DashboardError onRetry={() => refetch()} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-100">Dashboard</h1>
        <p className="text-slate-400 text-sm">Overview of your operations and key metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          value={data.kpis.totalRevenue.value}
          trend={data.kpis.totalRevenue.trend}
          icon={DollarSign}
          color="blue"
          delay={0.1}
        />
        <StatsCard
          title="Total Orders"
          value={data.kpis.totalOrders.value}
          trend={data.kpis.totalOrders.trend}
          icon={ShoppingBag}
          color="orange"
          delay={0.2}
        />
        <StatsCard
          title="Pending Orders"
          value={data.kpis.pendingOrders.value}
          trend={data.kpis.pendingOrders.trend}
          icon={Clock}
          color="red"
          delay={0.3}
        />
        <StatsCard
          title="Delivered Orders"
          value={data.kpis.deliveredOrders.value}
          trend={data.kpis.deliveredOrders.trend}
          icon={CheckCircle}
          color="green"
          delay={0.4}
        />
      </div>

      {data.revenueData.length === 0 && data.categoryData.length === 0 ? (
        <div className="glass-card rounded-2xl border border-slate-800 p-12 text-center">
          <ShoppingBag className="h-12 w-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-300 mb-2">No Data Available</h3>
          <p className="text-slate-500 text-sm">No orders found in the system. Start by adding orders.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 h-[400px]">
            <RevenueChart data={data.revenueData} />
          </div>
          <div className="h-[400px]">
            <CategoryDonutChart data={data.categoryData} />
          </div>
        </div>
      )}
    </div>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;
