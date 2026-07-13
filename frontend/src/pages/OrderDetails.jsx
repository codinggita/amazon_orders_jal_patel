import React, { useState, useEffect, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { amazonOrderService } from '../services/amazonOrderService';
import {
  ArrowLeft,
  ShoppingBag,
  MapPin,
  CreditCard,
  Package,
  Loader2,
  AlertCircle,
  RefreshCw,
  Tag
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
        const response = await amazonOrderService.getOrderById(id);
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
    if (!status) return null;
    const styles = {
      delivered: 'bg-emerald-100 border-emerald-300 text-emerald-900',
      pending: 'bg-amber-100 border-amber-400 text-amber-900',
      processing: 'bg-blue-100 border-blue-300 text-blue-900',
      shipped: 'bg-purple-100 border-purple-300 text-purple-900',
      cancelled: 'bg-red-100 border-red-300 text-red-900',
      returned: 'bg-orange-100 border-orange-300 text-orange-900',
    };
    const normalized = String(status).toLowerCase();
    const style = styles[normalized] || 'bg-slate-200 border-slate-300 text-slate-800';
    return (
      <span className={`px-3 py-1.5 rounded-full border text-xs font-extrabold uppercase tracking-wider shadow-sm ${style}`}>
        {normalized}
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
            Order <span className="font-mono text-amazon-orange text-xl">#{order.OrderID || order._id}</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">Placed on {order.OrderDate || 'Unknown Date'}</p>
        </div>
        <div className="ml-auto">{getStatusBadge(order.OrderStatus)}</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl border border-slate-800 p-6 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-6 flex items-center gap-2">
              <Package className="h-4 w-4 text-amazon-orange" />
              Item Details
            </h3>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/50">
              <div className="h-20 w-20 bg-slate-800 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-700">
                <ShoppingBag className="h-8 w-8 text-slate-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-200 text-lg">{order.ProductName || 'Unknown Item'}</h4>
                <div className="flex gap-4 mt-2">
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Tag className="h-3 w-3" /> {order.Category || 'N/A'}
                  </p>
                  <p className="text-xs text-slate-400">Brand: <span className="font-semibold text-slate-300">{order.Brand || 'N/A'}</span></p>
                </div>
                <p className="text-xs text-slate-500 mt-2">Product ID: <span className="font-mono">{order.ProductID || 'N/A'}</span></p>
              </div>
              
              <div className="text-right sm:ml-4 flex flex-col justify-center">
                <p className="text-slate-400 text-sm">Unit Price</p>
                <p className="text-base font-black text-slate-200">${Number(order.UnitPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                <p className="text-xs font-semibold text-slate-500 uppercase mt-1">Qty: {order.Quantity || 1}</p>
              </div>
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
                <span>Subtotal</span>
                <span className="font-semibold text-slate-300">
                  ${(Number(order.UnitPrice || 0) * Number(order.Quantity || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              
              <div className="flex justify-between text-emerald-400/80">
                <span>Discount</span>
                <span className="font-semibold">-${Number(order.Discount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="flex justify-between text-slate-400">
                <span>Shipping Cost</span>
                <span className="font-semibold text-slate-300">${Number(order.ShippingCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              
              <div className="flex justify-between text-slate-400">
                <span>Tax</span>
                <span className="font-semibold text-slate-300">${Number(order.Tax || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              
              {order.PaymentMethod && (
                <div className="flex justify-between text-slate-400 mt-2 pt-2 border-t border-slate-800/50">
                  <span>Method</span>
                  <span className="font-semibold text-slate-300">{order.PaymentMethod}</span>
                </div>
              )}
              
              <div className="border-t border-slate-800 pt-3 mt-3 flex justify-between items-center">
                <span className="font-bold text-slate-200 uppercase tracking-wider">Gross Total</span>
                <span className="text-xl font-black text-emerald-400">${Number(order.TotalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl border border-slate-800 p-6 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-400" />
              Location Details
            </h3>
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/50">
              <div className="space-y-1 text-sm text-slate-300">
                <p className="font-semibold text-slate-200 text-lg mb-2">{order.City || 'Unknown City'}</p>
                <p className="text-slate-400">{order.State || 'Unknown State'}</p>
                <p className="text-slate-500 uppercase font-semibold text-xs tracking-wider mt-2">{order.Country || 'Unknown Country'}</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl border border-slate-800 p-6 shadow-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
              <Package className="h-4 w-4 text-orange-400" />
              Customer & Seller
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amazon-orange/10 border border-amazon-orange/20 flex items-center justify-center text-amazon-orange font-bold">
                  {order.CustomerName?.[0] || 'C'}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-200">{order.CustomerName || 'Unknown Customer'}</p>
                  <p className="text-xs text-slate-500 font-mono">ID: {order.CustomerID || 'N/A'}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-800">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Fulfillment (Seller)</p>
                <p className="text-sm font-mono text-slate-300">{order.SellerID || 'Amazon Retail'}</p>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
});

OrderDetails.displayName = 'OrderDetails';

export default OrderDetails;
