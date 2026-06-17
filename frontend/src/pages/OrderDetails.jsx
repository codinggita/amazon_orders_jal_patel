import React, { useState, useEffect, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { orderService } from '../services/orderService';
import {
  ArrowLeft,
  ShoppingBag,
  MapPin,
  CreditCard,
  Package,
  Loader2,
  AlertCircle,
  ShieldAlert,
  RefreshCw
} from 'lucide-react';

const OrderDetails = memo(() => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isUserAdmin = user?.role === 'admin';

  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await orderService.getOrderById(id);
        const data = response && response.data ? response.data : response;
        setOrder(data);
      } catch (err) {
        setError('Failed to load order details. It may not exist or you do not have permission to view it.');
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchOrderDetails();
  }, [id]);

  const getStatusBadge = (status) => {
    const styles = {
      delivered: 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400',
      pending: 'bg-amber-950/40 border-amber-500/20 text-amber-400',
      processing: 'bg-blue-950/40 border-blue-500/20 text-blue-400',
      shipped: 'bg-purple-950/40 border-purple-500/20 text-purple-400',
      cancelled: 'bg-red-950/40 border-red-500/20 text-red-400',
    };
    const style = styles[status] || 'bg-slate-900 border-slate-700 text-slate-400';
    return (
      <span className={`px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-wider ${style}`}>
        {status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 text-amazon-orange animate-spin" />
        <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider animate-pulse">Loading Order Details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in p-4">
        <div className="glass-card max-w-md w-full p-8 rounded-2xl border border-red-500/20 shadow-2xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-950/50 border border-red-500/30 text-red-400 mb-6">
            <AlertCircle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight mb-2">Record Not Found</h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">{error || 'The requested order ID does not exist or you lack clearance to view it.'}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/orders')} className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold py-2.5 px-6 rounded-xl transition-all cursor-pointer inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Return to Orders
            </button>
            <button onClick={() => window.location.reload()} className="bg-amazon-orange hover:bg-amazon-orange/90 text-slate-950 text-sm font-bold py-2.5 px-6 rounded-xl transition-all cursor-pointer inline-flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/orders')} className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all cursor-pointer">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-3">
            Order <span className="font-mono text-amazon-orange text-xl">#{order._id}</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">Placed on {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</p>
        </div>
        <div className="ml-auto">{getStatusBadge(order.status)}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl border border-slate-800 p-6 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-6 flex items-center gap-2">
              <Package className="h-4 w-4 text-amazon-orange" />
              Manifest (Line Items)
            </h3>
            <div className="space-y-4">
              {order.orderItems?.length > 0 ? (
                order.orderItems.map((item, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/50">
                    <div className="h-16 w-16 bg-slate-800 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-700">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover opacity-80" />
                      ) : (
                        <ShoppingBag className="h-6 w-6 text-slate-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-200">{item.name || 'Unknown Item'}</h4>
                      <p className="text-xs text-slate-500 mt-1">ID: <span className="font-mono">{item.product || 'N/A'}</span></p>
                    </div>
                    <div className="text-right sm:ml-4">
                      <p className="text-sm font-black text-slate-200">${(item.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                      <p className="text-xs font-semibold text-slate-500 uppercase mt-1">Qty: {item.quantity || 0}</p>
                    </div>
                    <div className="hidden sm:block text-right w-24">
                      <p className="text-sm font-black text-amazon-orange">${((item.price || 0) * (item.quantity || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 italic">No items in this order.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-emerald-500/5 blur-[50px] pointer-events-none"></div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-5 flex items-center gap-2 relative z-10">
              <CreditCard className="h-4 w-4 text-emerald-400" />
              Financial Breakdown
            </h3>
            <div className="space-y-3 text-sm relative z-10">
              <div className="flex justify-between text-slate-400">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-300">${(order.itemsPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Shipping Fee</span>
                <span className="font-semibold text-slate-300">${(order.shippingPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Tax</span>
                <span className="font-semibold text-slate-300">${(order.taxPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              {order.paymentMethod && (
                <div className="flex justify-between text-slate-400">
                  <span>Payment Method</span>
                  <span className="font-semibold text-slate-300">{order.paymentMethod.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>
                </div>
              )}
              <div className="border-t border-slate-800 pt-3 mt-3 flex justify-between items-center">
                <span className="font-bold text-slate-200 uppercase tracking-wider">Gross Total</span>
                <span className="text-xl font-black text-emerald-400">${(order.totalPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl border border-slate-800 p-6 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-400" />
              Delivery Destination
            </h3>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/50">
              {order.shippingAddress ? (
                <div className="space-y-1 text-sm text-slate-300">
                  <p className="text-slate-400">{order.shippingAddress.street || order.shippingAddress.address || ''}</p>
                  <p>{[order.shippingAddress.city, order.shippingAddress.state].filter(Boolean).join(', ')} {order.shippingAddress.postalCode || ''}</p>
                  <p className="font-semibold text-slate-200">{order.shippingAddress.country || ''}</p>
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">No delivery address provided.</p>
              )}
            </div>
          </div>

          {isUserAdmin && order.user && (
            <div className="glass-card rounded-2xl border border-slate-800 p-6 shadow-xl">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Customer Identity</h3>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amazon-orange/10 border border-amazon-orange/20 flex items-center justify-center text-amazon-orange font-bold">
                  {order.user.firstName?.[0] || 'U'}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-200">{order.user.firstName || ''} {order.user.lastName || ''}</p>
                  <p className="text-xs text-slate-500">{order.user.email || ''}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

OrderDetails.displayName = 'OrderDetails';

export default OrderDetails;
