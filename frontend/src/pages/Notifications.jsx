import React, { useState, useEffect, useCallback } from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import EmptyState from '../components/EmptyState';
import Skeleton from '../components/Skeleton';
import axiosClient from '../api/axios';
import {
  Bell,
  Info,
  AlertCircle,
  CheckCircle2,
  ShoppingBag,
  Truck,
  RefreshCw,
  BellOff,
  X
} from 'lucide-react';

const Notifications = () => {
  useDocumentTitle('Notifications');
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axiosClient.get('/notifications');
      const data = res?.data || res;
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      // Fallback to empty state instead of crashing
      setNotifications([]);
      setError(err?.message || 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const getIcon = (type) => {
    switch (type) {
      case 'order': return <ShoppingBag className="h-4 w-4 text-blue-400" />;
      case 'shipping': return <Truck className="h-4 w-4 text-purple-400" />;
      case 'info': return <Info className="h-4 w-4 text-emerald-400" />;
      case 'alert': return <AlertCircle className="h-4 w-4 text-amber-400" />;
      case 'success': return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      default: return <Bell className="h-4 w-4 text-slate-400" />;
    }
  };

  const markAsRead = async (id) => {
    try {
      await axiosClient.patch(`/notifications/read/${id}`);
      setNotifications(prev => prev.map(n => n.id === id || n._id === id ? { ...n, read: true, isRead: true } : n));
    } catch {
      setNotifications(prev => prev.map(n => n.id === id || n._id === id ? { ...n, read: true, isRead: true } : n));
    }
  };

  const clearAll = () => setNotifications([]);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amazon-orange/10 border border-amazon-orange/20 text-amazon-orange">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">Notifications</h2>
            <p className="text-xs text-slate-400 font-medium">Stay updated with system events and alerts</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadNotifications} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
          {notifications.length > 0 && (
            <button onClick={clearAll} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
              <X className="h-3.5 w-3.5" /> Clear All
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-400 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error} — showing empty state.
        </div>
      )}

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex gap-4">
                <Skeleton variant="circular" className="h-10 w-10" />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" className="w-48" />
                  <Skeleton variant="text" className="w-64" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState icon={BellOff} title="No Notifications" message="You're all caught up! No new notifications at this time." />
        ) : (
          <div className="divide-y divide-slate-800/60">
            {notifications.map((n) => {
              const id = n._id || n.id;
              const isRead = n.isRead || n.read;
              return (
                <div
                  key={id}
                  onClick={() => markAsRead(id)}
                  className={`flex items-start gap-4 p-4 hover:bg-slate-800/30 transition-colors cursor-pointer ${!isRead ? 'bg-slate-800/20 border-l-2 border-amazon-orange' : ''}`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${!isRead ? 'bg-slate-800' : 'bg-slate-900'}`}>
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-sm ${!isRead ? 'font-bold text-slate-100' : 'font-medium text-slate-300'}`}>
                        {n.title || n.message}
                      </h4>
                      <span className="text-[10px] text-slate-500 shrink-0">
                        {n.time || new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{n.body || n.description || ''}</p>
                  </div>
                  {!isRead && <span className="h-2 w-2 rounded-full bg-amazon-orange shrink-0 mt-2" />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
