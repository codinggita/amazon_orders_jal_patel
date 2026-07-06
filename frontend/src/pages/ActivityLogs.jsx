import React, { useState, useEffect, useCallback } from 'react';
import useAuth from '../hooks/useAuth';
import useDocumentTitle from '../hooks/useDocumentTitle';
import EmptyState from '../components/EmptyState';
import { TableRowSkeleton } from '../components/Skeleton';
import axiosClient from '../api/axios';
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
  ChevronRight,
  RefreshCw
} from 'lucide-react';

const ActivityLogs = () => {
  useDocumentTitle('Activity Logs');
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');

  const loadLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = { page, limit: 10 };
      if (typeFilter) params.type = typeFilter;
      const res = await axiosClient.get('/activity/logs', { params });
      const data = res?.data || res;
      const logsArray = Array.isArray(data) ? data : (data?.logs || data?.activities || []);
      setLogs(logsArray);
      setTotalPages(data?.totalPages || data?.pages || Math.ceil((data?.total || logsArray.length) / 10) || 1);
    } catch (err) {
      console.error('Failed to load activity logs:', err);
      setError(err?.message || 'Failed to load activity logs');
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, typeFilter]);

  useEffect(() => {
    if (user?.role === 'admin') loadLogs();
    else setIsLoading(false);
  }, [user, loadLogs]);

  const getActionIcon = (action) => {
    if (!action) return <Activity className="h-4 w-4 text-slate-400" />;
    const a = action.toLowerCase();
    if (a.includes('login') || a.includes('auth')) return <LogIn className="h-4 w-4 text-emerald-400" />;
    if (a.includes('create') || a.includes('register') || a.includes('add')) return <UserPlus className="h-4 w-4 text-blue-400" />;
    if (a.includes('update') || a.includes('edit') || a.includes('change')) return <Edit className="h-4 w-4 text-blue-400" />;
    if (a.includes('delete') || a.includes('remove')) return <Trash2 className="h-4 w-4 text-red-400" />;
    if (a.includes('ban') || a.includes('role') || a.includes('admin')) return <ShieldAlert className="h-4 w-4 text-amber-400" />;
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amazon-orange/10 border border-amazon-orange/20 text-amazon-orange">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">Activity Logs</h2>
            <p className="text-xs text-slate-400 font-medium">Audit trail of system actions and administrative events</p>
          </div>
        </div>
        <button onClick={loadLogs} disabled={isLoading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-400 hover:text-slate-200 disabled:opacity-50 transition-colors cursor-pointer">
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <div className="glass-card rounded-2xl border border-slate-800 p-4 flex items-center gap-4">
        <div className="relative w-full md:w-48 flex items-center">
          <Filter className="absolute left-3 h-4 w-4 text-slate-500 pointer-events-none" />
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-sm text-slate-200 focus:outline-none focus:border-amazon-orange/50 appearance-none cursor-pointer transition-all"
          >
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
                logs.map((log, idx) => {
                  const action = log.action || log.event || log.type || 'Unknown Action';
                  const logUser = log.user || log.email || log.userId || '—';
                  const target = log.target || log.resource || '—';
                  const detail = log.detail || log.description || log.message || '—';
                  const time = log.time || log.createdAt
                    ? (log.time || new Date(log.createdAt).toLocaleString())
                    : '—';
                  return (
                    <tr key={log._id || log.id || idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                            {getActionIcon(action)}
                          </span>
                          <span className="font-medium text-slate-200">{action}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{typeof logUser === 'object' ? (logUser.email || logUser._id) : logUser}</td>
                      <td className="px-6 py-4 text-slate-300">{target}</td>
                      <td className="px-6 py-4 text-slate-400 max-w-[200px] truncate">{detail}</td>
                      <td className="px-6 py-4 text-slate-500 text-xs">{time}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between glass-card p-4 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-500">
            Page <span className="font-bold text-slate-300">{page}</span> of <span className="font-bold text-slate-300">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-xs font-bold text-slate-300 px-2">{page}</div>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;
