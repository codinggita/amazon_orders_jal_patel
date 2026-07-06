import React, { useState, useEffect, useCallback } from 'react';
import useAuth from '../hooks/useAuth';
import useDocumentTitle from '../hooks/useDocumentTitle';
import axiosClient from '../api/axios';
import {
  Layers3,
  ShieldCheck,
  ShieldAlert,
  Upload,
  Download,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
  Archive,
  RotateCcw,
  Send,
  Package
} from 'lucide-react';

const BulkOperations = () => {
  useDocumentTitle('Bulk Operations');
  const { user } = useAuth();
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [orderIds, setOrderIds] = useState('');
  const [recentOps, setRecentOps] = useState([]);

  const actions = [
    { value: 'status', label: 'Update Status', icon: RefreshCw, desc: 'Bulk update order statuses' },
    { value: 'archive', label: 'Archive Orders', icon: Archive, desc: 'Move selected orders to archive' },
    { value: 'restore', label: 'Restore Orders', icon: RotateCcw, desc: 'Restore archived orders' },
    { value: 'delete', label: 'Delete Orders', icon: Trash2, desc: 'Permanently remove orders' },
  ];

  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  const handleExecute = async () => {
    if (!selectedAction) return;
    setProcessing(true);
    setResult(null);

    const ids = orderIds
      .split(/[\n,]+/)
      .map(id => id.trim())
      .filter(id => id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id));

    if (ids.length === 0) {
      setResult({ success: false, message: 'Please enter valid MongoDB Order IDs (24-character hex strings).' });
      setProcessing(false);
      return;
    }

    try {
      let response;
      const payload = { orderIds: ids };

      if (selectedAction === 'status') {
        if (!selectedStatus) {
          setResult({ success: false, message: 'Please select a target status.' });
          setProcessing(false);
          return;
        }
        response = await axiosClient.patch('/orders/bulk/status', { ...payload, status: selectedStatus });
      } else if (selectedAction === 'archive') {
        response = await axiosClient.patch('/orders/bulk/archive', payload);
      } else if (selectedAction === 'restore') {
        response = await axiosClient.patch('/orders/bulk/restore', payload);
      } else if (selectedAction === 'delete') {
        response = await axiosClient.delete('/orders/bulk/delete', { data: payload });
      }

      const data = response?.data || response;
      const affected = data?.modifiedCount || data?.deletedCount || data?.affected || ids.length;
      const msg = `${selectedAction === 'status' ? 'Status updated to "' + selectedStatus + '"' : selectedAction.charAt(0).toUpperCase() + selectedAction.slice(1) + ' completed'} for ${affected} order(s).`;

      setResult({ success: true, message: msg });
      setRecentOps(prev => [{ action: selectedAction, status: selectedStatus, count: affected, time: new Date().toLocaleTimeString() }, ...prev.slice(0, 4)]);
      setOrderIds('');
    } catch (err) {
      setResult({ success: false, message: err?.message || 'Bulk operation failed. Please check your order IDs and try again.' });
    } finally {
      setProcessing(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in p-4">
        <div className="glass-card max-w-md w-full p-8 rounded-2xl border border-red-500/20 shadow-2xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-950/50 border border-red-500/30 text-red-400 mb-6">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight mb-2">Access Restricted</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">Bulk Operations require Administrative privileges.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-amazon-orange/10 border border-amazon-orange/20 text-amazon-orange">
          <Layers3 className="h-6 w-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-100">Bulk Transactions & Operations</h2>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amazon-orange/10 border border-amazon-orange/20 text-[9px] font-extrabold text-amazon-orange uppercase tracking-wider">
              <ShieldCheck className="h-3 w-3" /> Admin Exclusive
            </span>
          </div>
          <p className="text-xs text-slate-400">Perform batch operations on orders — enter valid Order IDs below</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl border border-slate-800 p-6">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Send className="h-4 w-4 text-amazon-orange" /> Batch Action
          </h3>
          <div className="space-y-4">
            {/* Action Type */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Action Type</label>
              <div className="grid grid-cols-2 gap-2">
                {actions.map((action) => (
                  <button
                    key={action.value}
                    onClick={() => { setSelectedAction(action.value); setResult(null); }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedAction === action.value
                        ? 'bg-amazon-orange/10 border-amazon-orange/30 text-amazon-orange'
                        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <action.icon className="h-4 w-4 mb-1" />
                    <p className="text-xs font-bold">{action.label}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">{action.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Status selector for status action */}
            {selectedAction === 'status' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">New Status</label>
                <div className="flex flex-wrap gap-2">
                  {statuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedStatus(s)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                        selectedStatus === s
                          ? 'bg-amazon-orange/10 border-amazon-orange/30 text-amazon-orange'
                          : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Order IDs Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Order IDs (one per line or comma separated)</label>
              <textarea
                value={orderIds}
                onChange={(e) => setOrderIds(e.target.value)}
                placeholder="Enter 24-character MongoDB Order IDs..."
                rows={4}
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amazon-orange/50 resize-none font-mono"
              />
              <p className="text-[10px] text-slate-600">IDs must be 24-character hexadecimal strings (MongoDB ObjectIds)</p>
            </div>

            <button
              onClick={handleExecute}
              disabled={!selectedAction || processing}
              className="w-full py-2.5 rounded-xl bg-amazon-orange hover:bg-amber-500 text-slate-950 text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {processing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {processing ? 'Processing...' : 'Execute Batch Operation'}
            </button>

            {result && (
              <div className={`p-3 rounded-xl flex items-start gap-2 text-sm ${
                result.success ? 'bg-emerald-950/20 border border-emerald-500/30 text-emerald-400' : 'bg-red-950/20 border border-red-500/30 text-red-400'
              }`}>
                {result.success ? <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" /> : <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />}
                <span>{result.message}</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card rounded-2xl border border-slate-800 p-6">
            <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Upload className="h-4 w-4 text-amazon-orange" /> Import / Export
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-slate-700 text-slate-400 hover:border-amazon-orange/50 hover:text-amazon-orange transition-all cursor-pointer bg-slate-900/30">
                <Upload className="h-5 w-5" />
                <span className="text-sm font-medium">Import Orders (CSV)</span>
              </button>
              <button className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-slate-700 text-slate-400 hover:border-amazon-orange/50 hover:text-amazon-orange transition-all cursor-pointer bg-slate-900/30">
                <Download className="h-5 w-5" />
                <span className="text-sm font-medium">Export Orders (CSV)</span>
              </button>
              <button className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-slate-700 text-slate-400 hover:border-amazon-orange/50 hover:text-amazon-orange transition-all cursor-pointer bg-slate-900/30">
                <FileText className="h-5 w-5" />
                <span className="text-sm font-medium">Generate Report (PDF)</span>
              </button>
            </div>
          </div>

          <div className="glass-card rounded-2xl border border-slate-800 p-6">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Recent Batch Operations</h3>
            {recentOps.length === 0 ? (
              <div className="text-center py-6 text-slate-500">
                <Package className="h-8 w-8 mx-auto mb-2 text-slate-700" />
                <p className="text-xs">No recent operations</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentOps.map((op, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800">
                    <div>
                      <p className="text-xs font-bold text-slate-200 capitalize">{op.action} {op.status && `→ ${op.status}`}</p>
                      <p className="text-[10px] text-slate-500">{op.count} orders · {op.time}</p>
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkOperations;
