import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, ShoppingBag, Clock, CheckCircle } from 'lucide-react';
import { StatsCard } from '../components/shared/StatsCard';
import { RevenueChart } from '../features/dashboard/components/RevenueChart';
import { CategoryDonutChart } from '../features/dashboard/components/CategoryDonutChart';
import { fetchDashboardStats } from '../features/dashboard/api/dashboardApi';

export default function Dashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
  });

  if (isLoading) {
    return (
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
    );
  }

  if (isError) {
    return <div className="text-rose-500">Failed to load dashboard data.</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-100">Dashboard</h1>
        <p className="text-slate-400 text-sm">Overview of your operations and key metrics.</p>
      </div>
      
      {/* KPI Cards */}
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-[400px]">
          <RevenueChart data={data.revenueData} />
        </div>
        <div className="h-[400px]">
          <CategoryDonutChart data={data.categoryData} />
        </div>
      </div>
    </div>
  );
}
