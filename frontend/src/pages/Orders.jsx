import React, { useState, useEffect, memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useDocumentTitle from '../hooks/useDocumentTitle';
import EmptyState from '../components/EmptyState';
import { TableRowSkeleton } from '../components/Skeleton';
import { orderService } from '../services/orderService';
import {
  ShoppingBag,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertCircle,
  ShieldAlert,
  RefreshCw
} from 'lucide-react';

const StatusBadge = memo(({ status }) => {
  const styles = {
    delivered: 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400',
    pending: 'bg-amber-950/40 border-amber-500/20 text-amber-400',
    processing: 'bg-blue-950/40 border-blue-500/20 text-blue-400',
    shipped: 'bg-purple-950/40 border-purple-500/20 text-purple-400',
    cancelled: 'bg-red-950/40 border-red-500/20 text-red-400',
  };
  const style = styles[status] || 'bg-slate-900 border-slate-700 text-slate-400';
  return (
    <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${style}`}>
      {status}
    </span>
  );
});
StatusBadge.displayName = 'StatusBadge';

const Orders = memo(() => {
  useDocumentTitle('Orders Management');
  const { user } = useAuth();
  const navigate = useNavigate();
  const isUserAdmin = user?.role === 'admin';

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('-createdAt');
  const limit = 10;

  const fetchOrders = useCallback(async () => {
    if (!isUserAdmin) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const params = { page, limit, sort: sortField };
      if (statusFilter) params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;
      const response = await orderService.getOrders(params);
      const data = response && response.data ? response.data : response;
      setOrders(data.results || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError('Failed to retrieve order records. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, sortField, isUserAdmin]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  }, [fetchOrders]);

  if (!isUserAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in p-4">
        <div className="glass-card max-w-md w-full p-8 rounded-2xl border border-red-500/20 shadow-2xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-950/50 border border-red-500/30 text-red-400 mb-6">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight mb-2">Access Restricted</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">The Orders Listing requires Administrative privileges.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amazon-orange/10 border border-amazon-orange/20 text-amazon-orange shadow-inner">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight">Orders Management</h2>
            <p className="text-xs text-slate-400 font-medium">View, search, filter, and modify customer order records</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-red-400 text-sm flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={fetchOrders} className="p-1 rounded-lg hover:bg-red-950/40 transition-colors cursor-pointer">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="glass-card rounded-2xl border border-slate-800 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by status (e.g., pending)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-amazon-orange/50 transition-all placeholder-slate-600"
          />
        </form>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-auto flex items-center">
            <Filter className="absolute left-3 h-4 w-4 text-slate-500 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-full md:w-48 bg-slate-900/80 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-sm text-slate-200 focus:outline-none focus:border-amazon-orange/50 appearance-none cursor-pointer transition-all"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <select
            value={sortField}
            onChange={(e) => { setSortField(e.target.value); setPage(1); }}
            className="w-full md:w-auto bg-slate-900/80 border border-slate-800 rounded-xl py-2 px-4 text-sm text-slate-200 focus:outline-none focus:border-amazon-orange/50 appearance-none cursor-pointer transition-all"
          >
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="-totalPrice">Highest Value</option>
            <option value="totalPrice">Lowest Value</option>
          </select>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl relative min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-900/80 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-6 py-4 font-bold">Order ID</th>
                <th className="px-6 py-4 font-bold">Customer</th>
                <th className="px-6 py-4 font-bold">Product</th>
                <th className="px-6 py-4 font-bold">Payment</th>
                <th className="px-6 py-4 font-bold">Country</th>
                <th className="px-6 py-4 font-bold">Date</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Total</th>
                <th className="px-6 py-4 font-bold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <>
                  <TableRowSkeleton columns={9} />
                  <TableRowSkeleton columns={9} />
                  <TableRowSkeleton columns={9} />
                  <TableRowSkeleton columns={9} />
                  <TableRowSkeleton columns={9} />
                </>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="9">
                    <EmptyState title="No Orders Found" message="Try adjusting your filters or search query." />
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-slate-300">
                      {order._id ? `${order._id.substring(0, 8)}...` : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-200">
                        {order.user?.firstName || 'Unknown'} {order.user?.lastName || ''}
                      </div>
                      <div className="text-[10px] text-slate-500">{order.user?.email || ''}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-xs max-w-[150px] truncate">
                      {order.orderItems?.length > 0
                        ? order.orderItems.map((i) => i.name).join(', ')
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-slate-400">
                        {order.paymentMethod
                          ? order.paymentMethod.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                          : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {order.shippingAddress?.country || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 text-right font-black text-slate-200 text-sm">
                      ${(order.totalPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => navigate(`/orders/${order._id}`)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-amazon-orange text-slate-400 hover:text-slate-950 transition-colors inline-flex items-center justify-center cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between glass-card p-4 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-500">
            Showing page <span className="font-bold text-slate-300">{page}</span> of <span className="font-bold text-slate-300">{totalPages}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-xs font-bold text-slate-300 px-2">{page}</div>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

Orders.displayName = 'Orders';

export default Orders;
