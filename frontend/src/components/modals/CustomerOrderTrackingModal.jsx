import React, { useState } from 'react';
import { 
  X, Truck, CheckCircle2, Clock, MapPin, Package, ShieldCheck, 
  ExternalLink, Copy, Check, Plane, Globe, ArrowRight
} from 'lucide-react';

export function CustomerOrderTrackingModal({ order, onClose }) {
  if (!order) return null;

  const [copied, setCopied] = useState(false);

  // Status mapping
  const status = order.status || 'Processing';
  const trackingCode = order.tracking || (status === 'Delivered' || status === 'Shipped' ? 'DHL-8492019382' : 'Pending Live Assignment');
  const isAssigned = trackingCode && trackingCode !== 'Pending Live Assignment';

  // Determine active step (0 to 4)
  let activeStep = 1; // 0: placed, 1: crafting/packing, 2: dispatched, 3: customs, 4: delivered
  if (status === 'Unfulfilled') activeStep = 0;
  else if (status === 'Processing') activeStep = 1;
  else if (status === 'Shipped') activeStep = 2;
  else if (status === 'Delivered') activeStep = 4;

  // Helper to parse order date safely
  const parseOrderDate = () => {
    if (order.created_at) {
      const d = new Date(order.created_at);
      if (!isNaN(d.getTime())) return d;
    }
    if (order.createdAt) {
      const d = new Date(order.createdAt);
      if (!isNaN(d.getTime())) return d;
    }
    if (order.date && order.date !== 'Today') {
      const d = new Date(order.date);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  };

  const baseDate = parseOrderDate();
  const formatStepDate = (daysToAdd = 0) => {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + daysToAdd);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const steps = [
    {
      title: 'Order Confirmed & Payment Verified',
      subtitle: 'Payment received via Secure Gateway',
      date: formatStepDate(0),
      location: 'Azim Crafts',
      icon: CheckCircle2,
      done: activeStep >= 0,
      current: activeStep === 0
    },
    {
      title: 'Artisan Crafted & Quality Inspection',
      subtitle: 'Hand-inspected & packaged with foam cushioning',
      date: activeStep >= 1 ? formatStepDate(0) : `Est. ${formatStepDate(1)}`,
      location: 'Roorkee Artisan Workshop, India',
      icon: Package,
      done: activeStep >= 1,
      current: activeStep === 1
    },
    {
      title: 'Dispatched via DHL Express Worldwide',
      subtitle: isAssigned ? `Air Waybill: ${trackingCode}` : 'Booking scheduled with air courier',
      date: activeStep >= 2 ? `In Transit (${formatStepDate(1)})` : `Expected ${formatStepDate(1)}`,
      location: 'Delhi International Airport Cargo Terminal (DEL)',
      icon: Plane,
      done: activeStep >= 2,
      current: activeStep === 2
    },
    {
      title: 'International Customs & Port Clearance',
      subtitle: 'Priority customs clearance with express documentation',
      date: activeStep >= 3 ? `Cleared (${formatStepDate(2)})` : `Est. ${formatStepDate(2)}`,
      location: `${order.country || 'Australia'} International Gateway`,
      icon: Globe,
      done: activeStep >= 3,
      current: activeStep === 3
    },
    {
      title: 'Delivered to Your Doorstep',
      subtitle: 'Final delivery with signature & contactless option',
      date: activeStep >= 4 ? `Delivered (${formatStepDate(3)})` : `Est: ${formatStepDate(3)} – ${formatStepDate(5)}`,
      location: order.shippingAddress || `${order.country || 'Australia'}`,
      icon: MapPin,
      done: activeStep >= 4,
      current: activeStep === 4
    }
  ];

  const handleCopy = () => {
    if (isAssigned) {
      navigator.clipboard.writeText(trackingCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const dhlTrackingUrl = isAssigned 
    ? `https://www.dhl.com/en/express/tracking.html?AWB=${trackingCode}`
    : 'https://www.dhl.com/en/express/tracking.html';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs font-menu animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-neutral-200 flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="bg-[#1a1918] text-white p-5 sm:p-6 flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-[#c8924b] font-bold flex items-center justify-center border border-amber-500/30 text-xl shadow-inner">
              🚚
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h3 className="font-mono text-base sm:text-lg font-bold text-[#f7eddb]">
                  Track Order #{order.id}
                </h3>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  status === 'Shipped' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                  'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {status}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Carrier: <strong className="text-neutral-200">{order.carrier || 'DHL Express Worldwide'}</strong> &bull; Priority Air
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Tracking Body */}
        <div className="p-5 sm:p-7 space-y-6 overflow-y-auto flex-1 bg-[#faf8f5]">
          
          {/* Tracking Number & Quick Action Card */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e8dfd3] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-neutral-500">
                Air Waybill / Tracking Number
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm sm:text-base text-neutral-900 bg-neutral-100 px-3 py-1 rounded-lg border border-neutral-200">
                  {trackingCode}
                </span>
                {isAssigned && (
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-neutral-600 transition-colors cursor-pointer"
                    title="Copy Tracking Number"
                  >
                    {copied ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
                  </button>
                )}
              </div>
            </div>

            <a
              href={dhlTrackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#c8924b] hover:bg-[#b57f38] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer whitespace-nowrap"
            >
              <span>Track on DHL Portal</span>
              <ExternalLink size={13} />
            </a>
          </div>

          {/* Live Interactive 5-Step Timeline */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#e8dfd3] shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h4 className="font-heading text-xs sm:text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-2">
                <Truck size={16} className="text-[#c8924b]" />
                <span>Live Shipment Journey</span>
              </h4>
              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 rounded-full">
                ● Live Updates Active
              </span>
            </div>

            <div className="relative pl-6 space-y-7 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-neutral-200">
              {steps.map((step, idx) => {
                const IconComponent = step.icon;
                return (
                  <div key={idx} className="relative group">
                    {/* Circle Node */}
                    <div className={`absolute -left-[30px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-transform ${
                      step.done 
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-xs' 
                        : step.current
                          ? 'bg-[#c8924b] text-white ring-4 ring-amber-100 animate-pulse'
                          : 'bg-neutral-200 text-neutral-400'
                    }`}>
                      <IconComponent size={12} />
                    </div>

                    {/* Step Details */}
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <p className={`text-xs sm:text-sm font-bold ${
                          step.done ? 'text-neutral-900' : 'text-neutral-400'
                        }`}>
                          {step.title}
                        </p>
                        <span className={`text-[10.5px] font-semibold ${
                          step.done ? 'text-[#c8924b]' : 'text-neutral-400'
                        }`}>
                          {step.date}
                        </span>
                      </div>
                      <p className="text-[11.5px] text-neutral-500 font-medium">
                        {step.subtitle}
                      </p>
                      <p className="text-[10px] text-neutral-400 flex items-center gap-1 pt-0.5">
                        <MapPin size={10} className="text-neutral-400" />
                        <span>{step.location}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Address & Guarantee Card */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            
            <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-1">
              <span className="font-bold text-[10.5px] text-neutral-400 uppercase tracking-wider">
                Destination Address:
              </span>
              <p className="font-bold text-neutral-900">{order.customer || 'Valued Customer'}</p>
              <p className="text-neutral-600 font-medium text-[11px] leading-relaxed">
                {order.shippingAddress || `Melbourne, Victoria, ${order.country || 'Australia'}`}
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-neutral-200 space-y-1">
              <span className="font-bold text-[10.5px] text-neutral-400 uppercase tracking-wider">
                Estimated Delivery:
              </span>
              <p className="font-bold text-emerald-700 text-sm">3 &ndash; 5 Business Days</p>
              <p className="text-neutral-500 text-[11px]">
                Air Express with 100% Transit Insurance &amp; Artisan Guarantee.
              </p>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
            <ShieldCheck size={15} className="text-emerald-600" />
            <span>Azim Crafts Official Verified Shipment</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-neutral-900 hover:bg-[#c8924b] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-2xs"
          >
            Close Tracking
          </button>
        </div>

      </div>
    </div>
  );
}
