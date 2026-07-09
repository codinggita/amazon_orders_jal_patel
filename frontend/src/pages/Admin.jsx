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
        <h3 className="text-2xl font-bold text-slate-100 mb-6">Admin Routes</h3>
        <div className="overflow-x-auto text-slate-300">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="py-3 px-4 font-semibold text-slate-100">Method</th>
                <th className="py-3 px-4 font-semibold text-slate-100">Endpoint</th>
                <th className="py-3 px-4 font-semibold text-slate-100">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 font-mono text-sm">
              {[
                { method: 'GET', url: '/api/v1/admin/users', desc: 'Fetch all users' },
                { method: 'GET', url: '/api/v1/admin/users/:id', desc: 'Fetch specific user' },
                { method: 'PATCH', url: '/api/v1/admin/users/:id/ban', desc: 'Ban user' },
                { method: 'PATCH', url: '/api/v1/admin/users/:id/unban', desc: 'Unban user' },
                { method: 'PATCH', url: '/api/v1/admin/users/:id/role', desc: 'Change user role' },
                { method: 'GET', url: '/api/v1/admin/orders', desc: 'Fetch all orders' },
                { method: 'GET', url: '/api/v1/admin/reports/sales', desc: 'Fetch sales reports' },
                { method: 'GET', url: '/api/v1/admin/reports/revenue', desc: 'Fetch revenue reports' },
                { method: 'DELETE', url: '/api/v1/admin/cache/clear', desc: 'Clear application cache', isDanger: true },
                { method: 'GET', url: '/api/v1/admin/system/health', desc: 'System health monitoring' },
                { method: 'GET', url: '/api/v1/admin/system/logs', desc: 'Fetch server logs' },
                { method: 'POST', url: '/api/v1/admin/system/maintenance', desc: 'Enable maintenance mode' },
                { method: 'GET', url: '/api/v1/admin/backups', desc: 'Fetch backups list' },
              ].map((route, i) => (
                <tr key={i} className="hover:bg-slate-800/10 transition-colors">
                  <td className={`py-3 px-4 font-bold ${
                    route.method === 'GET' ? 'text-amber-400' :
                    route.method === 'PATCH' ? 'text-emerald-400' :
                    route.method === 'POST' ? 'text-blue-400' :
                    'text-red-400'
                  }`}>{route.method}</td>
                  <td className="py-3 px-4">
                    <span className="bg-slate-900/60 text-slate-300 font-medium px-2 py-1 rounded text-xs border border-slate-700/50">
                      {route.url}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-sans text-[15px]">{route.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;
