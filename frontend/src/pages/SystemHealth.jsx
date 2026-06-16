import React, { useState, useEffect } from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import Skeleton from '../components/Skeleton';
import {
  ServerCrash,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Database,
  Globe,
  Cpu,
  HardDrive,
  Activity
} from 'lucide-react';

const services = [
  { name: 'API Server', status: 'operational', icon: Globe, latency: '12ms' },
  { name: 'Database', status: 'operational', icon: Database, latency: '4ms' },
  { name: 'Cache Layer', status: 'operational', icon: Cpu, latency: '1ms' },
  { name: 'Storage', status: 'operational', icon: HardDrive, latency: '8ms' },
  { name: 'Email Service', status: 'operational', icon: Activity, latency: '23ms' },
  { name: 'Payment Gateway', status: 'degraded', icon: Activity, latency: '145ms' },
];

const SystemHealth = () => {
  useDocumentTitle('System Health');
  const [isLoading, setIsLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      setLastChecked(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const refresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setLastChecked(new Date().toLocaleTimeString());
    }, 1500);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational': return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
      case 'degraded': return <AlertTriangle className="h-5 w-5 text-amber-400" />;
      case 'down': return <XCircle className="h-5 w-5 text-red-400" />;
      default: return <CheckCircle2 className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'operational': return <span className="px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">Operational</span>;
      case 'degraded': return <span className="px-2 py-0.5 rounded-full bg-amber-950/40 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider">Degraded</span>;
      case 'down': return <span className="px-2 py-0.5 rounded-full bg-red-950/40 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-wider">Down</span>;
      default: return <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400 text-[10px] font-bold uppercase tracking-wider">Unknown</span>;
    }
  };

  const uptimePercent = (services.filter(s => s.status === 'operational').length / services.length * 100).toFixed(0);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amazon-orange/10 border border-amazon-orange/20 text-amazon-orange">
            <ServerCrash className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">System Health</h2>
            <p className="text-xs text-slate-400 font-medium">Monitor platform services and infrastructure</p>
          </div>
        </div>
        <button onClick={refresh} disabled={isLoading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50 cursor-pointer">
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl border border-slate-800 p-5 text-center">
          <p className="text-3xl font-black text-emerald-400">{uptimePercent}%</p>
          <p className="text-xs text-slate-400 mt-1">Uptime</p>
        </div>
        <div className="glass-card rounded-2xl border border-slate-800 p-5 text-center">
          <p className="text-3xl font-black text-slate-100">{services.length}</p>
          <p className="text-xs text-slate-400 mt-1">Total Services</p>
        </div>
        <div className="glass-card rounded-2xl border border-slate-800 p-5 text-center">
          <p className="text-3xl font-black text-emerald-400">{services.filter(s => s.status === 'operational').length}</p>
          <p className="text-xs text-slate-400 mt-1">Operational</p>
        </div>
        <div className="glass-card rounded-2xl border border-slate-800 p-5 text-center">
          <p className="text-3xl font-black text-amber-400">{services.filter(s => s.status !== 'operational').length}</p>
          <p className="text-xs text-slate-400 mt-1">Issues</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200">Service Status</h3>
          {lastChecked && <p className="text-[10px] text-slate-500">Last checked: {lastChecked}</p>}
        </div>
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton variant="circular" className="h-8 w-8" />
                <div className="flex-1"><Skeleton variant="text" className="w-32" /></div>
                <Skeleton variant="text" className="w-24" />
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {services.map((svc, i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-800/30 transition-colors">
                <div className="flex items-center gap-3">
                  <svc.icon className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-200">{svc.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-500">{svc.latency}</span>
                  {getStatusBadge(svc.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemHealth;
