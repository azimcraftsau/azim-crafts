import React from 'react';
import { 
  X, Printer, MapPin, Truck, ShieldCheck, Mail, Phone, 
  Calendar, CheckCircle2, DollarSign, Package, ExternalLink, Clock, User, ArrowRight
} from 'lucide-react';

export function AdminOrderDetailsModal({ order, onClose, onOpenPrint, onOpenEditStatus }) {
  if (!order) return null;

  // Parse items list
  let itemsArray = [];
  if (Array.isArray(order.itemsList) && order.itemsList.length > 0) {
    itemsArray = order.itemsList;
  } else if (order.items) {
    const rawItems = order.items.split(',').map(s => s.trim()).filter(Boolean);
    itemsArray = rawItems.map((str, idx) => {
      let title = str;
      let qty = 1;
      const match = str.match(/(.*?)\s*\(?x?(\d+)\)?$/i);
      if (match) {
        title = match[1].trim();
        qty = parseInt(match[2], 10) || 1;
      }
      return {
        id: idx + 1,
        title,
        sku: `VTM-PRD-${100 + idx}`,
        quantity: qty,
        price: order.total ? Number(order.total) / (rawItems.length || 1) : 0
      };
    });
  }

  const subtotal = order.subtotal || order.total || 0;
  const total = order.total || 0;
  const discount = order.discountAmount || (subtotal > total ? subtotal - total : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs font-menu animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-gray-200 flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="bg-[#1b1a1a] text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/15 text-[#c8924b] font-bold flex items-center justify-center border border-amber-300/20 text-lg">
              📦
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h3 className="font-mono text-lg font-bold text-[#f7eddb]">{order.id}</h3>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10.5px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {order.status || 'Processing'}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Order Placed on <strong className="text-neutral-200">{order.date || 'Today'}</strong> &bull; Payment: <span className="text-emerald-400 font-semibold">{order.payment || 'Paid (Verified)'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                if (onOpenPrint) onOpenPrint(order);
              }}
              className="hidden sm:inline-flex items-center gap-1.5 bg-[#c8924b] hover:bg-[#b57f38] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-sm"
            >
              <Printer size={14} />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 sm:p-7 space-y-6 overflow-y-auto flex-1 bg-[#fbfbfb]">
          
          {/* Top Destination & Shipping Banner Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Delivery Destination (Ship To) */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                  <MapPin size={15} className="text-[#ae2828]" />
                  <span>Delivery Destination</span>
                </span>
                <span className="bg-gray-100 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded">
                  {order.country || 'Australia'}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <p className="font-bold text-sm text-gray-900">{order.customer || 'Valued Customer'}</p>
                <p className="text-gray-600 leading-relaxed font-medium">
                  {order.shipping_address || order.shippingAddress || (order.country ? `${order.customer || 'Customer'}, ${order.country}` : 'Customer Address')}
                </p>
                <div className="pt-2 border-t border-gray-100 space-y-1 text-[11px] text-gray-500">
                  <p className="flex items-center gap-1.5">
                    <Mail size={12} className="text-gray-400" />
                    <span className="text-gray-700 font-medium">{order.customer_email || order.customerEmail || 'collector@azimcrafts.com'}</span>
                  </p>
                  {order.phone && (
                    <p className="flex items-center gap-1.5">
                      <Phone size={12} className="text-gray-400" />
                      <span className="text-gray-700 font-medium">{order.phone}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Courier & Dispatch Logistics */}
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
                  <Truck size={15} className="text-[#c8924b]" />
                  <span>Logistics &amp; Courier Details</span>
                </span>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded">
                  Express Air
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping Carrier:</span>
                  <span className="font-bold text-gray-900">{order.carrier || 'DHL Express Worldwide'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Waybill / Tracking:</span>
                  <span className="font-mono font-bold text-neutral-900 bg-neutral-100 px-2 py-0.5 rounded">
                    {order.tracking || 'Pending Live Assignment'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Dispatched From:</span>
                  <span className="font-medium text-gray-800">Roorkee Artisan Workshop, India</span>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenEditStatus) onOpenEditStatus(order);
                    }}
                    className="w-full inline-flex items-center justify-center gap-1 text-xs font-bold text-[#c8924b] hover:text-[#b57f38] bg-amber-50/80 hover:bg-amber-100 border border-amber-200/80 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <span>Update Tracking Code or Status</span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Itemized Purchased Products List */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h4 className="font-heading text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Package size={15} className="text-[#c8924b]" />
                <span>Ordered Items ({itemsArray.length} Product{itemsArray.length > 1 ? 's' : ''})</span>
              </h4>
              <span className="text-xs text-gray-500 font-semibold">100% Handcrafted Replicas</span>
            </div>

            <div className="divide-y divide-gray-100">
              {itemsArray.map((item, idx) => {
                const qty = Number(item.quantity) || 1;
                const price = Number(item.price) || (Number(total) / (itemsArray.length || 1));
                const size = item.selectedSize || item.size || (typeof item.title === 'string' && item.title.match(/\(Size:\s*([^)]+)\)/i)?.[1]);
                return (
                  <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-amber-50 text-[#c8924b] font-bold text-lg flex items-center justify-center shrink-0 border border-amber-200/70 shadow-2xs">
                        🛡️
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm leading-snug">{item.title}</p>
                        <div className="flex items-center flex-wrap gap-2 text-[11px] text-gray-500 mt-1">
                          <span className="font-mono font-semibold text-gray-600">SKU: {item.sku || `VTM-PRD-${idx + 1}`}</span>
                          <span>&bull;</span>
                          <span>Solid Metal &amp; Hand-Carved Wood</span>
                          {size && (
                            <>
                              <span>&bull;</span>
                              <span className="bg-amber-100/70 text-[#9b6b28] font-bold text-[10px] px-2 py-0.5 rounded-md border border-amber-300">
                                Size: {size}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <span className="bg-gray-100 text-gray-800 font-bold px-2.5 py-1 rounded-lg text-xs">
                        Qty: {qty}
                      </span>
                      <span className="font-bold text-gray-900 text-sm">
                        ${(price * qty).toFixed(2)} USD
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing & Financial Breakdown */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-2.5">
            <h4 className="font-heading text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
              Payment &amp; Financial Summary
            </h4>
            
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-semibold text-gray-900">${Number(subtotal || total).toFixed(2)} USD</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#ae2828] font-semibold">
                  <span>Special Offer Discount ({order.appliedCoupon || 'FIRST15'}):</span>
                  <span>-${Number(discount).toFixed(2)} USD</span>
                </div>
              )}
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Worldwide Express Shipping (DHL):</span>
                <span className="font-bold">FREE ($0.00 USD)</span>
              </div>
              <div className="flex justify-between text-sm font-black text-gray-900 pt-2.5 border-t border-gray-200">
                <span>Total Paid by Customer:</span>
                <span>${Number(total).toFixed(2)} USD</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Actions Bar */}
        <div className="p-4 bg-white border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>Artisan Certified &bull; 30-Day Money-Back Guarantee</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                if (onOpenPrint) onOpenPrint(order);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-[#c8924b] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <Printer size={13} />
              <span>Print Parcel Slip</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
