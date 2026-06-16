import React, { useState, useEffect } from 'react';
import useDocumentTitle from '../hooks/useDocumentTitle';
import EmptyState from '../components/EmptyState';
import Skeleton from '../components/Skeleton';
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications([
        { id: 1, type: 'order', title: 'New Order #ORD-001', message: 'Order has been placed successfully.', time: '2 min ago', read: false },
        { id: 2, type: 'shipping', title: 'Shipment Update', message: 'Package #SH-1234 has been delivered.', time: '15 min ago', read: false },
        { id: 3, type: 'info', title: 'System Update', message: 'System maintenance scheduled for tonight.', time: '1 hour ago', read: false },
        { id: 4, type: 'alert', title: 'Low Stock Warning', message: 'Product #PROD-567 is running low on stock.', time: '3 hours ago', read: true },
        { id: 5, type: 'order', title: 'Order #ORD-002 Cancelled', message: 'Customer requested cancellation.', time: '5 hours ago', read: true },
      ]);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const getIcon = (type) => {
    switch (type) {
      case 'order': return <ShoppingBag className="h-4 w-4 text-blue-400" />;
      case 'shipping': return <Truck className="h-4 w-4 text-purple-400" />;
      case 'info': return <Info className="h-4 w-4 text-emerald-400" />;
      case 'alert': return <AlertCircle className="h-4 w-4 text-amber-400" />;
      default: return <Bell className="h-4 w-4 text-slate-400" />;
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAll = () => {
    setNotifications([]);
  };

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
        {notifications.length > 0 && (
          <button onClick={clearAll} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-400 hover:text-slate-200 transition-colors">
            <X className="h-3.5 w-3.5" /> Clear All
          </button>
        )}
      </div>

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
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markAsRead(n.id)}
                className={`flex items-start gap-4 p-4 hover:bg-slate-800/30 transition-colors cursor-pointer ${!n.read ? 'bg-slate-800/20 border-l-2 border-amazon-orange' : ''}`}
              >
                <div className={`p-2 rounded-lg shrink-0 ${!n.read ? 'bg-slate-800' : 'bg-slate-900'}`}>
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-sm ${!n.read ? 'font-bold text-slate-100' : 'font-medium text-slate-300'}`}>{n.title}</h4>
                    <span className="text-[10px] text-slate-500 shrink-0">{n.time}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>
                </div>
                {!n.read && <span className="h-2 w-2 rounded-full bg-amazon-orange shrink-0 mt-2" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
