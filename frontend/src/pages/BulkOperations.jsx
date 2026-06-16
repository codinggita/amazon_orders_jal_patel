import React, { useState } from 'react';
import useAuth from '../hooks/useAuth';
import useDocumentTitle from '../hooks/useDocumentTitle';
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
  Send
} from 'lucide-react';

const BulkOperations = () => {
  useDocumentTitle('Bulk Operations');
  const { user } = useAuth();
  const [selectedAction, setSelectedAction] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);

  const actions = [
    { value: 'status', label: 'Update Status', icon: RefreshCw, desc: 'Bulk update order statuses' },
    { value: 'archive', label: 'Archive Orders', icon: Archive, desc: 'Move selected orders to archive' },
    { value: 'restore', label: 'Restore Orders', icon: RotateCcw, desc: 'Restore archived orders' },
    { value: 'delete', label: 'Delete Orders', icon: Trash2, desc: 'Permanently remove orders' },
  ];

  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  const handleExecute = () => {
    setProcessing(true);
    setResult(null);
    setTimeout(() => {
      setResult({ success: true, message: `${selectedAction === 'status' ? 'Status updated' : selectedAction + ' completed'} successfully for batch of 0 orders.` });
      setProcessing(false);
    }, 1500);
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
          <p className="text-xs text-slate-400">Perform batch operations on orders, users, and system data</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl border border-slate-800 p-6">
          <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Send className="h-4 w-4 text-amazon-orange" /> Batch Action
          </h3>
          <div className="space-y-4">
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
            <div className="text-center py-6 text-slate-500">
              <FileText className="h-8 w-8 mx-auto mb-2 text-slate-700" />
              <p className="text-xs">No recent operations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkOperations;
