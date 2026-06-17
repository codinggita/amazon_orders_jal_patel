import React, { useState, useEffect, useCallback } from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import Skeleton from '../components/Skeleton';
import axiosClient from '../api/axios';
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
  Activity,
  AlertCircle
} from 'lucide-react';

const SystemHealth = () => {
  useDocumentTitle('System Health');
  const [isLoading, setIsLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [systemData, setSystemData] = useState(null);
  const [error, setError] = useState(null);

  const fetchHealth = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [healthRes, dbRes, cacheRes, storageRes, versionRes, uptimeRes] = await Promise.allSettled([
        axiosClient.get('/health'),
        axiosClient.get('/system/status/database'),
        axiosClient.get('/system/status/cache'),
        axiosClient.get('/system/status/storage'),
        axiosClient.get('/system/version'),
        axiosClient.get('/system/uptime'),
      ]);

      const health = healthRes.status === 'fulfilled' ? (healthRes.value?.data || healthRes.value) : null;
      const db = dbRes.status === 'fulfilled' ? (dbRes.value?.data || dbRes.value) : null;
      const cache = cacheRes.status === 'fulfilled' ? (cacheRes.value?.data || cacheRes.value) : null;
      const storage = storageRes.status === 'fulfilled' ? (storageRes.value?.data || storageRes.value) : null;
      const version = versionRes.status === 'fulfilled' ? (versionRes.value?.data || versionRes.value) : null;
      const uptime = uptimeRes.status === 'fulfilled' ? (uptimeRes.value?.data || uptimeRes.value) : null;

      setHealthData(health);
      setSystemData({ db, cache, storage, version, uptime });
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err?.message || 'Failed to fetch system health data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  const buildServices = () => {
    if (!systemData) return [];
    const { db, cache, storage } = systemData;
    const getStatus = (data) => {
      if (!data) return 'unknown';
      if (data.status === 'connected' || data.status === 'healthy' || data.connected === true) return 'operational';
      if (data.status === 'degraded') return 'degraded';
      if (data.status === 'disconnected' || data.connected === false) return 'down';
      return 'operational';
    };
    return [
      { name: 'API Server', status: healthData ? 'operational' : 'down', icon: Globe, latency: healthData?.responseTime || '—' },
      { name: 'Database', status: getStatus(db), icon: Database, latency: db?.latency || db?.responseTime || '—' },
      { name: 'Cache Layer', status: getStatus(cache), icon: Cpu, latency: cache?.latency || '—' },
      { name: 'Storage', status: getStatus(storage), icon: HardDrive, latency: storage?.latency || '—' },
    ];
  };

  const services = buildServices();

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational': return <CheckCircle2 className="h-5 w-5 text-emerald-400" />;
      case 'degraded': return <AlertTriangle className="h-5 w-5 text-amber-400" />;
      case 'down': return <XCircle className="h-5 w-5 text-red-400" />;
      default: return <Activity className="h-5 w-5 text-slate-400" />;
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

  const operationalCount = services.filter(s => s.status === 'operational').length;
  const uptimePercent = services.length ? ((operationalCount / services.length) * 100).toFixed(0) : 0;

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
        <button onClick={fetchHealth} disabled={isLoading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50 cursor-pointer">
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl border border-slate-800 p-5 text-center">
          <p className="text-3xl font-black text-emerald-400">{uptimePercent}%</p>
          <p className="text-xs text-slate-400 mt-1">Uptime</p>
        </div>
        <div className="glass-card rounded-2xl border border-slate-800 p-5 text-center">
          <p className="text-3xl font-black text-slate-100">{isLoading ? '—' : services.length}</p>
          <p className="text-xs text-slate-400 mt-1">Total Services</p>
        </div>
        <div className="glass-card rounded-2xl border border-slate-800 p-5 text-center">
          <p className="text-3xl font-black text-emerald-400">{isLoading ? '—' : operationalCount}</p>
          <p className="text-xs text-slate-400 mt-1">Operational</p>
        </div>
        <div className="glass-card rounded-2xl border border-slate-800 p-5 text-center">
          <p className="text-3xl font-black text-amber-400">{isLoading ? '—' : services.filter(s => s.status !== 'operational').length}</p>
          <p className="text-xs text-slate-400 mt-1">Issues</p>
        </div>
      </div>

      {/* Server Info */}
      {systemData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {systemData.version && (
            <div className="glass-card rounded-2xl border border-slate-800 p-5">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">API Version</p>
              <p className="text-lg font-bold text-slate-100">{systemData.version?.version || systemData.version?.appVersion || '—'}</p>
              <p className="text-xs text-slate-500 mt-1">Node {systemData.version?.nodeVersion || '—'}</p>
            </div>
          )}
          {systemData.uptime && (
            <div className="glass-card rounded-2xl border border-slate-800 p-5">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Server Uptime</p>
              <p className="text-lg font-bold text-slate-100">
                {systemData.uptime?.uptime ? Math.floor(systemData.uptime.uptime / 3600) + 'h ' + Math.floor((systemData.uptime.uptime % 3600) / 60) + 'm' : (systemData.uptime?.formatted || '—')}
              </p>
            </div>
          )}
          {healthData && (
            <div className="glass-card rounded-2xl border border-slate-800 p-5">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Environment</p>
              <p className="text-lg font-bold text-slate-100">{healthData?.env || healthData?.environment || 'development'}</p>
              <p className="text-xs text-slate-500 mt-1">Status: {healthData?.status || 'healthy'}</p>
            </div>
          )}
        </div>
      )}

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200">Service Status</h3>
          {lastChecked && <p className="text-[10px] text-slate-500">Last checked: {lastChecked}</p>}
        </div>
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1,2,3,4].map(i => (
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
                  {getStatusIcon(svc.status)}
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
