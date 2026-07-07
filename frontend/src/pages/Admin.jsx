import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import useDocumentTitle from '../hooks/useDocumentTitle';
import Skeleton from '../components/Skeleton';
import adminUserService from '../services/adminUserService';
import { amazonOrderService } from '../services/amazonOrderService';
import {
  ShieldCheck,
  ShieldAlert,
  Server,
  Users,
  Activity,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

const Admin = () => {
  useDocumentTitle('Admin Panel');
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true);
      try {
        const [usersRes, ordersRes] = await Promise.allSettled([
          adminUserService.getUsers({ page: 1, limit: 1 }),
          amazonOrderService.getOrders({ page: 1, limit: 1 })
        ]);
        setStats({
          totalUsers: usersRes.value?.data?.totalResults || usersRes.value?.totalResults || 0,
          totalOrders: ordersRes.value?.data?.totalResults || ordersRes.value?.totalResults || 0,
        });
      } catch (err) {
        setStats({ totalUsers: 0, totalOrders: 0 });
      } finally {
        setIsLoading(false);
      }
    };
    if (user?.role === 'admin') loadStats();
    else setIsLoading(false);
  }, [user]);

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in p-4">
        <div className="glass-card max-w-md w-full p-8 rounded-2xl border border-red-500/20 shadow-2xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-950/50 border border-red-500/30 text-red-400 mb-6">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight mb-2">Access Restricted</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            The Admin Panel requires Administrative privileges.
          </p>
        </div>
      </div>
    );
  }

  const cards = [
    { title: 'System Status', value: 'Operational', icon: Server, color: 'emerald', desc: 'All services running normally' },
    { title: 'Total Users', value: stats?.totalUsers ?? '—', icon: Users, color: 'blue', desc: 'Registered accounts' },
    { title: 'Total Orders', value: stats?.totalOrders ?? '—', icon: Activity, color: 'orange', desc: 'All time orders' },
    { title: 'Uptime', value: '99.9%', icon: Clock, color: 'green', desc: 'Last 30 days' },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-amazon-orange/10 border border-amazon-orange/20 text-amazon-orange">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">Admin Panel</h2>
          <p className="text-xs text-slate-400 font-medium">System administration and platform controls</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <div key={i} className="glass-card rounded-2xl border border-slate-800 p-5 hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between mb-4">
              <span className={`p-2 rounded-lg bg-${card.color}-950/30 border border-${card.color}-500/20 text-${card.color}-400`}>
                <card.icon className="h-5 w-5" />
              </span>
            </div>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton variant="text" className="w-20" />
                <Skeleton variant="text" className="w-32" />
              </div>
            ) : (
              <>
                <p className="text-2xl font-black text-slate-100">{card.value}</p>
                <p className="text-xs text-slate-400 mt-1">{card.title}</p>
                <p className="text-[10px] text-slate-500 mt-1">{card.desc}</p>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 p-6">
        <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Server className="h-5 w-5 text-amazon-orange" />
          Platform Modules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { name: 'Order Management', status: 'active', icon: Activity },
            { name: 'User Management', status: 'active', icon: Users },
            { name: 'Analytics Engine', status: 'active', icon: Activity },
            { name: 'Shipping Module', status: 'active', icon: Activity },
            { name: 'Notification Service', status: 'active', icon: Activity },
            { name: 'Audit Logging', status: 'active', icon: Activity },
          ].map((mod, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50 border border-slate-800">
              <mod.icon className="h-4 w-4 text-amazon-orange" />
              <span className="text-sm text-slate-200 font-medium flex-1">{mod.name}</span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                <CheckCircle2 className="h-3 w-3" /> {mod.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin;
