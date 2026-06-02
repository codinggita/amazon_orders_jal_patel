import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import shippingService from '../services/shippingService';
import { 
  ArrowLeft,
  Truck,
  PackageCheck,
  PackageOpen,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldAlert
} from 'lucide-react';

const Tracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trackingData, setTrackingData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrackingInfo = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await shippingService.getTrackingInfo(id);
        const data = response.data || response;
        setTrackingData(data);
      } catch (err) {
        console.error('Failed to fetch tracking data:', err);
        setError('Tracking information not found or unavailable. Please verify the order ID.');
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchTrackingInfo();
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 text-amazon-orange animate-spin" />
        <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider animate-pulse">Locating Package...</p>
      </div>
    );
  }

  if (error || !trackingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in p-4">
        <div className="glass-card max-w-md w-full p-8 rounded-2xl border border-red-500/20 shadow-2xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-950/50 border border-red-500/30 text-red-400 mb-6">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight mb-2">
            Tracking Not Found
          </h2>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed">
            {error || 'Unable to locate tracking logs for this shipment.'}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold py-2.5 px-6 rounded-xl transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { trackingNumber, carrier, status, estimatedDelivery, trackingEvents = [] } = trackingData;

  const getStatusDisplay = (currentStatus) => {
    switch(currentStatus) {
      case 'delivered': return { color: 'text-emerald-400', bg: 'bg-emerald-950/40', border: 'border-emerald-500/30', label: 'Delivered', icon: PackageCheck };
      case 'out_for_delivery': return { color: 'text-cyan-400', bg: 'bg-cyan-950/40', border: 'border-cyan-500/30', label: 'Out for Delivery', icon: Truck };
      case 'shipped': return { color: 'text-purple-400', bg: 'bg-purple-950/40', border: 'border-purple-500/30', label: 'In Transit', icon: Truck };
      case 'processing': return { color: 'text-blue-400', bg: 'bg-blue-950/40', border: 'border-blue-500/30', label: 'Processing', icon: PackageOpen };
      case 'exception': return { color: 'text-red-400', bg: 'bg-red-950/40', border: 'border-red-500/30', label: 'Exception', icon: AlertTriangle };
      default: return { color: 'text-amber-400', bg: 'bg-amber-950/40', border: 'border-amber-500/30', label: 'Pending', icon: Clock };
    }
  };

  const statusConfig = getStatusDisplay(status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all cursor-pointer"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100 tracking-tight flex items-center gap-3">
            Tracking Details
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Order <span className="font-mono text-amazon-orange">#{id}</span>
          </p>
        </div>
      </div>

      {/* Global Status Card */}
      <div className={`glass-card rounded-3xl border ${statusConfig.border} p-6 shadow-2xl relative overflow-hidden`}>
        <div className={`absolute -right-10 -top-10 h-40 w-40 rounded-full ${statusConfig.bg} blur-[60px] pointer-events-none`}></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className={`h-16 w-16 rounded-2xl ${statusConfig.bg} border ${statusConfig.border} flex items-center justify-center ${statusConfig.color} shadow-inner`}>
              <StatusIcon className="h-8 w-8" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current Status</p>
              <h3 className={`text-2xl md:text-3xl font-black ${statusConfig.color} tracking-tight leading-none`}>
                {statusConfig.label}
              </h3>
              {estimatedDelivery && (
                <p className="text-sm font-semibold text-slate-300 mt-2 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  Est. Delivery: {new Date(estimatedDelivery).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
          
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 md:min-w-[200px]">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tracking Number</p>
            <p className="text-lg font-mono font-bold text-slate-200 mb-3">{trackingNumber || 'Awaiting Dispatch'}</p>
            
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Carrier</p>
            <p className="text-sm font-bold text-amazon-yellow uppercase">{carrier || 'Pending Assignment'}</p>
          </div>
        </div>
      </div>

      {/* Tracking Timeline Log */}
      <div className="glass-card rounded-3xl border border-slate-800 p-8 shadow-xl">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-8 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-amazon-orange" />
          Shipment Activity Log
        </h3>

        <div className="relative pl-6 space-y-8">
          {/* Timeline Line */}
          <div className="absolute top-2 left-[11px] bottom-6 w-0.5 bg-slate-800/80"></div>

          {trackingEvents.length === 0 ? (
            <div className="text-slate-500 text-sm italic pl-4">No tracking events recorded yet.</div>
          ) : (
            // Reverse to show newest on top
            [...trackingEvents].reverse().map((event, idx) => {
              const isFirst = idx === 0;
              return (
                <div key={idx} className="relative pl-6">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[22px] top-1 h-5 w-5 rounded-full border-4 border-slate-900 flex items-center justify-center ${isFirst ? 'bg-amazon-orange shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'bg-slate-700'}`}>
                    {isFirst && <div className="h-1.5 w-1.5 bg-slate-900 rounded-full"></div>}
                  </div>
                  
                  <div className={`p-4 rounded-xl border ${isFirst ? 'bg-slate-900/80 border-slate-700 shadow-lg' : 'bg-slate-900/30 border-slate-800/50'}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                      <h4 className={`font-bold ${isFirst ? 'text-slate-100' : 'text-slate-300'} uppercase text-sm`}>
                        {event.status.replace(/_/g, ' ')}
                      </h4>
                      <span className="text-[10px] font-semibold text-slate-500 whitespace-nowrap bg-slate-950 px-2 py-1 rounded-md border border-slate-800">
                        {new Date(event.date).toLocaleString()}
                      </span>
                    </div>
                    
                    {event.description && (
                      <p className={`text-sm ${isFirst ? 'text-slate-300' : 'text-slate-400'}`}>
                        {event.description}
                      </p>
                    )}
                    
                    {event.location && (
                      <p className="text-xs font-semibold text-slate-500 mt-2 flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
    </div>
  );
};

export default Tracking;
