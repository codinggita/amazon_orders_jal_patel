import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import useDocumentTitle from '../hooks/useDocumentTitle';
import EmptyState from '../components/EmptyState';
import { TableRowSkeleton } from '../components/Skeleton';
import {
  Activity,
  ShieldAlert,
  UserPlus,
  LogIn,
  Edit,
  Trash2,
  AlertCircle,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const ActivityLogs = () => {
  useDocumentTitle('Activity Logs');
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages] = useState(3);
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      const allLogs = [
        { id: 1, action: 'User Login', user: 'admin@example.com', target: 'Authentication', detail: 'Successful login from 192.168.1.1', time: '2 min ago', type: 'auth' },
        { id: 2, action: 'Order Updated', user: 'admin@example.com', target: 'Order #ORD-001', detail: 'Status changed to delivered', time: '10 min ago', type: 'order' },
        { id: 3, action: 'User Created', user: 'admin@example.com', target: 'newuser@example.com', detail: 'New user account registered', time: '30 min ago', type: 'user' },
        { id: 4, action: 'Order Deleted', user: 'admin@example.com', target: 'Order #ORD-003', detail: 'Order removed from system', time: '1 hour ago', type: 'order' },
        { id: 5, action: 'Role Changed', user: 'admin@example.com', target: 'user@example.com', detail: 'Promoted to admin role', time: '2 hours ago', type: 'admin' },
        { id: 6, action: 'System Config Updated', user: 'system', target: 'Settings', detail: 'Payment gateway reconfigured', time: '3 hours ago', type: 'system' },
        { id: 7, action: 'User Banned', user: 'admin@example.com', target: 'spam@example.com', detail: 'Account banned for policy violation', time: '5 hours ago', type: 'user' },
        { id: 8, action: 'Bulk Operation', user: 'admin@example.com', target: '50 Orders', detail: 'Bulk status update to processing', time: '6 hours ago', type: 'order' },
      ];
      const filtered = typeFilter ? allLogs.filter(l => l.type === typeFilter) : allLogs;
      setLogs(filtered);
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [page, typeFilter]);

  const getActionIcon = (action) => {
    if (action.includes('Login')) return <LogIn className="h-4 w-4 text-emerald-400" />;
    if (action.includes('Created') || action.includes('Updated')) return <Edit className="h-4 w-4 text-blue-400" />;
    if (action.includes('Deleted')) return <Trash2 className="h-4 w-4 text-red-400" />;
    if (action.includes('Banned') || action.includes('Role')) return <ShieldAlert className="h-4 w-4 text-amber-400" />;
    return <Activity className="h-4 w-4 text-slate-400" />;
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in p-4">
        <div className="glass-card max-w-md w-full p-8 rounded-2xl border border-red-500/20 shadow-2xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-950/50 border border-red-500/30 text-red-400 mb-6">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight mb-2">Access Restricted</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">Activity Logs require Administrative privileges.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-amazon-orange/10 border border-amazon-orange/20 text-amazon-orange">
          <Activity className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">Activity Logs</h2>
          <p className="text-xs text-slate-400 font-medium">Audit trail of system actions and administrative events</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 p-4 flex items-center gap-4">
        <div className="relative w-full md:w-48 flex items-center">
          <Filter className="absolute left-3 h-4 w-4 text-slate-500 pointer-events-none" />
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} className="w-full bg-slate-900/80 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-sm text-slate-200 focus:outline-none focus:border-amazon-orange/50 appearance-none cursor-pointer transition-all">
            <option value="">All Events</option>
            <option value="auth">Authentication</option>
            <option value="order">Order Operations</option>
            <option value="user">User Management</option>
            <option value="admin">Admin Actions</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4 font-bold">Action</th>
                <th className="px-6 py-4 font-bold">User</th>
                <th className="px-6 py-4 font-bold">Target</th>
                <th className="px-6 py-4 font-bold">Details</th>
                <th className="px-6 py-4 font-bold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <>
                  <TableRowSkeleton columns={5} />
                  <TableRowSkeleton columns={5} />
                  <TableRowSkeleton columns={5} />
                  <TableRowSkeleton columns={5} />
                </>
              ) : logs.length === 0 ? (
                <tr><td colSpan="5"><EmptyState title="No Activity Logs" message="No events match your current filter." /></td></tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">{getActionIcon(log.action)}</span>
                        <span className="font-medium text-slate-200">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{log.user}</td>
                    <td className="px-6 py-4 text-slate-300">{log.target}</td>
                    <td className="px-6 py-4 text-slate-400 max-w-[200px] truncate">{log.detail}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{log.time}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between glass-card p-4 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-500">Page <span className="font-bold text-slate-300">{page}</span> of <span className="font-bold text-slate-300">{totalPages}</span></p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"><ChevronLeft className="h-4 w-4" /></button>
            <div className="text-xs font-bold text-slate-300 px-2">{page}</div>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;
