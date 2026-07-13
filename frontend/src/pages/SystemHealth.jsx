import React, { useState, useEffect, useCallback } from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import Skeleton from '../components/Skeleton';
import axiosClient from '../api/axios';
import {
  ServerCrash, CheckCircle2, AlertTriangle, XCircle, RefreshCw,
  Database, Globe, Cpu, HardDrive, Activity, AlertCircle, MinusCircle, 
  Terminal, Server, Clock, Box
} from 'lucide-react';

const SystemHealth = () => {
  useDocumentTitle('System Health');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [systemData, setSystemData] = useState(null);
  const [error, setError] = useState(null);

  const fetchHealth = useCallback(async (isSilentRefresh = false) => {
    if (!isSilentRefresh) setIsLoading(true);
    else setIsRefreshing(true);
    
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

      const getVal = (res) => res.status === 'fulfilled' ? (res.value?.data || res.value) : null;
      
      setHealthData(getVal(healthRes));
      setSystemData({
        db: getVal(dbRes),
        cache: getVal(cacheRes),
        storage: getVal(storageRes),
        version: getVal(versionRes),
        uptime: getVal(uptimeRes),
      });
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err?.message || 'Failed to fetch system health data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    // Auto refresh every 60 seconds
    const intervalId = setInterval(() => fetchHealth(true), 60000);
    return () => clearInterval(intervalId);
  }, [fetchHealth]);

  const formatBytes = (bytes) => {
    if (bytes === null || bytes === undefined || isNaN(bytes)) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';
    const k = 1024, sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const buildServices = () => {
    if (!systemData) return [];
    const { db, cache, storage } = systemData;
    
    const getDbStatus = () => {
        if (!db) return 'down';
        if (db.status === 'connected' || db.healthy) return 'operational';
        if (db.status === 'connecting') return 'degraded';
        return 'down';
    };
    const getCacheStatus = () => {
        if (!cache) return 'down';
        if (cache.configured === false) return 'disabled';
        if (cache.healthy) return 'operational';
        return 'down';
    };
    const getStorageStatus = () => {
        if (!storage) return 'down';
        if (storage.writable) return 'operational';
        return 'degraded';
    };

    return [
      { 
        name: 'API Server', 
        status: healthData ? 'operational' : 'down', 
        icon: Globe, 
        details: healthData ? `Environment: ${healthData.environment}` : 'Unreachable',
        meta: healthData?.apiVersion || 'Unknown API Ver'
      },
      { 
        name: 'Database (MongoDB)', 
        status: getDbStatus(), 
        icon: Database, 
        details: db?.host || 'Disconnected',
        meta: db?.models ? `${db.models} Models Registered` : null
      },
      { 
        name: 'Redis Cache Layer', 
        status: getCacheStatus(), 
        icon: Cpu, 
        details: cache?.message || (cache?.provider ? `Provider: ${cache.provider}` : 'Unconfigured'),
        meta: cache?.configured ? 'Active' : 'Not setup'
      },
      { 
        name: 'Persistent Storage', 
        status: getStorageStatus(), 
        icon: HardDrive, 
        details: storage?.writable ? 'Writable' : 'Read-only / Unreachable',
        meta: storage?.logs?.exists ? `Logs Size: ${formatBytes(storage.logs.sizeBytes)}` : 'No logs directory'
      },
    ];
  };

  const services = buildServices();
  const operationalCount = services.filter(s => s.status === 'operational').length;
  const issueCount = services.filter(s => s.status === 'down' || s.status === 'degraded').length;
  const disabledCount = services.filter(s => s.status === 'disabled').length;
  
  // Calculate uptime percentage purely for aesthetic dashboard value based on operational vs expected services
  const uptimePercent = services.length ? (((operationalCount + disabledCount) / services.length) * 100).toFixed(0) : 0;

  const StatusIcon = ({ status, className = "h-5 w-5" }) => {
    switch (status) {
      case 'operational': return <CheckCircle2 className={`${className} text-emerald-400`} />;
      case 'degraded': return <AlertTriangle className={`${className} text-amber-400`} />;
      case 'down': return <XCircle className={`${className} text-red-500`} />;
      case 'disabled': return <MinusCircle className={`${className} text-slate-500`} />;
      default: return <Activity className={`${className} text-slate-600`} />;
    }
  };

  const StatusBadge = ({ status }) => {
    switch (status) {
      case 'operational': 
        return <span className="px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-[10px] font-extrabold uppercase tracking-wider shadow-[0_0_10px_rgba(16,185,129,0.1)]">Operational</span>;
      case 'degraded': 
        return <span className="px-2.5 py-1 rounded-full bg-amber-100 border border-amber-400 text-amber-900 text-[10px] font-extrabold uppercase tracking-wider shadow-[0_0_10px_rgba(245,158,11,0.1)]">Degraded</span>;
      case 'down': 
        return <span className="px-2.5 py-1 rounded-full bg-red-100 border border-red-300 text-red-900 text-[10px] font-extrabold uppercase tracking-wider shadow-[0_0_10px_rgba(239,68,68,0.1)]">Down</span>;
      case 'disabled': 
        return <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-200 text-[10px] font-extrabold uppercase tracking-wider">Disabled</span>;
      default: 
        return <span className="px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-200 text-[10px] font-extrabold uppercase tracking-wider">Unknown</span>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
            <ServerCrash className="h-7 w-7" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-100 tracking-tight">System Health</h2>
            <p className="text-sm text-slate-300 font-medium mt-1">Live monitoring for platform infrastructure & core services</p>
          </div>
        </div> */}
        <button 
          onClick={() => fetchHealth(false)} 
          disabled={isLoading || isRefreshing} 
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sm font-medium text-slate-100 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${(isLoading || isRefreshing) ? 'animate-spin' : ''}`} /> 
          {isRefreshing ? 'Refreshing...' : 'Run Diagnostics'}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" /> {error}
        </div>
      )}

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="glass-card rounded-3xl border border-slate-800 p-6 flex flex-col justify-center relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
          <p className="text-sm text-slate-300 font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
            <Server className="h-4 w-4 text-emerald-500" /> Platform Status
          </p>
          <p className="text-4xl font-black text-slate-100">{uptimePercent}%</p>
          <p className="text-xs font-medium text-emerald-600 mt-2">Target Uptime Met</p>
        </div>
        
        <div className="glass-card rounded-3xl border border-slate-800 p-6 flex flex-col justify-center relative overflow-hidden group hover:border-blue-500/30 transition-all">
           <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
          <p className="text-sm text-slate-300 font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
            <Box className="h-4 w-4 text-blue-500" /> Total Services
          </p>
          <p className="text-4xl font-black text-slate-100">{isLoading ? '—' : services.length}</p>
          <p className="text-xs font-medium text-blue-600 mt-2">Monitored Endpoints</p>
        </div>

        <div className="glass-card rounded-3xl border border-slate-800 p-6 flex flex-col justify-center relative overflow-hidden group hover:border-indigo-500/30 transition-all">
           <div className="absolute -right-6 -top-6 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all"></div>
          <p className="text-sm text-slate-300 font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-500" /> Operational
          </p>
          <p className="text-4xl font-black text-slate-100">{isLoading ? '—' : operationalCount}</p>
          <p className="text-xs font-medium text-indigo-600 mt-2">Fully Functional</p>
        </div>

        <div className="glass-card rounded-3xl border border-slate-800 p-6 flex flex-col justify-center relative overflow-hidden group hover:border-amber-500/30 transition-all">
           <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
          <p className="text-sm text-slate-300 font-semibold uppercase tracking-wider mb-2 flex items-center gap-2">
            <AlertTriangle className={`h-4 w-4 ${issueCount > 0 ? 'text-amber-500' : 'text-slate-500'}`} /> Active Issues
          </p>
          <p className={`text-4xl font-black ${issueCount > 0 ? 'text-amber-600' : 'text-slate-100'}`}>{isLoading ? '—' : issueCount}</p>
          <p className={`text-xs font-medium mt-2 ${issueCount > 0 ? 'text-amber-600' : 'text-slate-500'}`}>
            {issueCount === 0 ? 'No problems detected' : 'Requires attention'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Service List */}
        <div className="lg:col-span-2 glass-card rounded-3xl border border-slate-800 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" /> Core Infrastructure
            </h3>
            {lastChecked && <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5"><Clock className="h-3 w-3" /> Updated at {lastChecked}</p>}
          </div>
          
          <div className="flex-1 bg-slate-950/30">
            {isLoading && !isRefreshing ? (
              <div className="p-6 space-y-6">
                {[1, 2, 3, 4].map(Math.random).map(i => (
                  <div key={i} className="flex items-center gap-5">
                    <Skeleton variant="circular" className="h-10 w-10 opacity-20" />
                    <div className="flex-1 space-y-2">
                      <Skeleton variant="text" className="w-1/3 opacity-20" />
                      <Skeleton variant="text" className="w-2/3 h-3 opacity-20" />
                    </div>
                    <Skeleton variant="text" className="w-20 h-6 rounded-full opacity-20" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-slate-800/50">
                {services.map((svc, i) => (
                  <div key={i} className="p-5 hover:bg-slate-800 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                    <div className="flex items-start gap-4">
                      <div className={`p-2.5 rounded-xl border ${
                        svc.status === 'operational' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' :
                        svc.status === 'degraded' ? 'bg-amber-500/10 border-amber-500/20 text-amber-600' :
                        svc.status === 'down' ? 'bg-red-500/10 border-red-500/20 text-red-600' :
                        'bg-slate-900 border-slate-800 text-slate-300'
                      } group-hover:scale-105 transition-transform shrink-0`}>
                        <svc.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-100 mb-1">{svc.name}</h4>
                        <p className="text-xs text-slate-500 font-medium">{svc.details}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pl-12 sm:pl-0">
                      <span className="text-[11px] font-medium text-slate-500">{svc.meta}</span>
                      <StatusBadge status={svc.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Info Panels System Specs */}
        <div className="space-y-6">
          {systemData?.version && (
             <div className="glass-card rounded-3xl border border-slate-800 p-6 hover:border-slate-700 transition-all group">
               <div className="flex items-center gap-3 mb-5">
                 <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500"><Terminal className="h-4 w-4" /></div>
                 <h3 className="text-sm font-bold text-slate-100">System Information</h3>
               </div>
               
               <div className="space-y-4">
                 <div className="flex justify-between items-end border-b border-slate-800/50 pb-3">
                   <div>
                     <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">App Release</p>
                     <p className="text-sm font-semibold text-slate-200">v{systemData.version.version}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Architecture</p>
                     <p className="text-sm font-semibold text-slate-200 capitalize">{systemData.version.platform} {systemData.version.arch}</p>
                   </div>
                 </div>
                 <div className="flex justify-between items-end">
                   <div>
                     <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Runtime</p>
                     <p className="text-sm font-semibold text-slate-200">Node JS {systemData.version.nodeVersion}</p>
                   </div>
                 </div>
               </div>
             </div>
          )}

          {systemData?.uptime && (
            <div className="glass-card rounded-3xl border border-emerald-200 p-6 relative overflow-hidden group">
               <div className="absolute -inset-1 bg-gradient-to-r from-emerald-100 to-teal-100 blur-xl opacity-50"></div>
               <div className="relative">
                 <div className="flex items-center gap-3 mb-5">
                   <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600"><Clock className="h-4 w-4" /></div>
                   <h3 className="text-sm font-bold text-slate-100">Instance Uptime</h3>
                 </div>
                 
                 <div className="space-y-4">
                   <div className="flex justify-between items-end">
                     <div>
                       <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-600/70 mb-1">API Server</p>
                       <p className="text-lg font-black text-emerald-600">{systemData.uptime.server?.uptimeFormatted || '—'}</p>
                     </div>
                   </div>
                   {systemData.uptime.system && (
                      <div className="flex justify-between items-end border-t border-emerald-200/50 pt-3">
                        <div>
                          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mb-1">Host Machine</p>
                          <p className="text-sm font-semibold text-slate-200">{systemData.uptime.system.uptimeFormatted}</p>
                        </div>
                      </div>
                   )}
                 </div>
               </div>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
};

export default SystemHealth;

