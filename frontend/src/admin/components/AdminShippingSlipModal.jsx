import React from 'react';
import { X, Printer, ShieldCheck, MapPin, Truck, CheckCircle2, Box } from 'lucide-react';

export function AdminShippingSlipModal({ order, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  // Parse items list if structured or string
  let itemsArray = [];
  if (Array.isArray(order.itemsList) && order.itemsList.length > 0) {
    itemsArray = order.itemsList;
  } else if (order.items) {
    // Split by comma
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
        sku: `VTM-${100 + idx}`,
        quantity: qty,
        price: order.total ? Number(order.total) / (rawItems.length || 1) : 0
      };
    });
  }

  const subtotal = order.subtotal || order.total || 0;
  const total = order.total || 0;
  const discount = order.discountAmount || (subtotal > total ? subtotal - total : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs font-menu print:p-0 print:bg-white animate-fade-in">
      {/* Backdrop */}
      <div className="fixed inset-0 print:hidden" onClick={onClose} />

      {/* Slip Modal Container */}
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 border border-neutral-300 print:border-none print:shadow-none print:w-full print:max-w-none flex flex-col max-h-[92vh] print:max-h-none">
        
        {/* Screen Controls Header (Hidden in Print) */}
        <div className="bg-[#1b1a1a] text-white p-4 px-6 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <Printer className="w-5 h-5 text-[#c8924b]" />
            <h3 className="font-heading text-sm font-bold tracking-wide">
              Official Shipping &amp; Parcel Packing Slip (Ready to Print)
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 bg-[#c8924b] hover:bg-[#b57f38] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Printer size={14} />
              <span>Print Slip / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ================= PRINTABLE PACKING SLIP CONTENT ================= */}
        <div className="p-8 space-y-6 overflow-y-auto print:overflow-visible print:p-6 bg-white text-[#131313]">
          
          {/* Top Brand & Barcode Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-neutral-900">
            <div className="flex items-center gap-3.5">
              <img
                src="/logo/logo without bg.png"
                alt="Azim Crafts"
                className="w-16 h-16 object-contain"
              />
              <div>
                <h1 className="font-heading text-xl font-black tracking-wider uppercase text-neutral-900">
                  Azim Crafts
                </h1>
                <p className="text-[11px] text-neutral-600 font-medium">
                  Artisan Handcrafted Historical Replicas &bull; Roorkee, Uttarakhand, India
                </p>
                <p className="text-[10px] text-neutral-500">
                  Email: info@azimcrafts.com &bull; Web: azimcrafts.com
                </p>
              </div>
            </div>

            {/* Simulated Parcel Barcode & Waybill */}
            <div className="text-right space-y-1 sm:self-center">
              <div className="font-mono text-lg font-black tracking-widest text-neutral-900">
                {order.id}
              </div>
              <div className="inline-block bg-neutral-900 text-white font-mono text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-widest">
                AIR WAYBILL &bull; DHL EXPRESS
              </div>
              <div className="text-[10px] text-neutral-500 font-mono">
                Tracking: {order.tracking || `AUS-DHL-${Math.floor(10000000 + Math.random() * 90000000)}`}
              </div>
            </div>
          </div>

          {/* Sender & Receiver Address Boxes (Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* SHIP TO (Customer Destination Box) */}
            <div className="p-4 rounded-xl border-2 border-neutral-900 bg-neutral-50/50 space-y-1 text-xs">
              <div className="flex items-center justify-between border-b border-neutral-300 pb-1.5 mb-1.5">
                <span className="font-heading font-black text-xs uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#ae2828]" />
                  <span>SHIP TO (RECIPIENT)</span>
                </span>
                <span className="font-bold text-[10px] uppercase bg-neutral-200 px-1.5 py-0.5 rounded text-neutral-800">
                  {order.country || 'Australia'}
                </span>
              </div>
              <p className="font-bold text-sm text-neutral-900">{order.customer || 'Valued Customer'}</p>
              <p className="text-neutral-700">{order.shippingAddress || `${order.country || 'Australia'}`}</p>
              <p className="text-neutral-600 font-medium">Email: {order.customerEmail || 'collector@vtmcraft.com'}</p>
              {order.phone && <p className="text-neutral-600 font-medium">Phone: {order.phone}</p>}
            </div>

            {/* DISPATCH FROM (Artisan Center Box) */}
            <div className="p-4 rounded-xl border border-neutral-300 bg-neutral-50/30 space-y-1 text-xs">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-1.5 mb-1.5">
                <span className="font-heading font-bold text-xs uppercase tracking-wider text-neutral-600 flex items-center gap-1.5">
                  <Truck size={13} className="text-[#c8924b]" />
                  <span>DISPATCHED FROM</span>
                </span>
                <span className="font-semibold text-[10px] text-neutral-500">EXPRESS DISPATCH</span>
              </div>
              <p className="font-bold text-neutral-900">Azim Crafts Export Division</p>
              <p className="text-neutral-600">Civil Lines Artisan Industrial Zone</p>
              <p className="text-neutral-600">Roorkee, Uttarakhand 247667, India</p>
              <p className="text-neutral-500 text-[11px]">Carrier: {order.carrier || 'DHL Express Worldwide'}</p>
            </div>

          </div>

          {/* Order Meta Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs border-y border-neutral-200 py-3 bg-[#fcfaf7]">
            <div>
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-semibold">Order Date</span>
              <span className="font-bold text-neutral-900">{order.date || 'Today'}</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-semibold">Payment Status</span>
              <span className="font-bold text-emerald-700">{order.payment || 'Paid (Verified)'}</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-semibold">Shipping Mode</span>
              <span className="font-bold text-neutral-900">Express Air (Free)</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-semibold">Total Declared</span>
              <span className="font-bold text-neutral-900">${Number(total).toFixed(2)} USD</span>
            </div>
          </div>

          {/* Itemized Order Table */}
          <div className="border border-neutral-300 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-100 border-b border-neutral-300 text-neutral-700 font-bold uppercase tracking-wider text-[10.5px]">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Item Description</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3 text-center">Qty</th>
                  <th className="p-3 text-right">Price</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 text-neutral-800">
                {itemsArray.map((item, index) => {
                  const qty = Number(item.quantity) || 1;
                  const price = Number(item.price) || (Number(total) / (itemsArray.length || 1));
                  const size = item.selectedSize || item.size || (typeof item.title === 'string' && item.title.match(/\(Size:\s*([^)]+)\)/i)?.[1]);
                  return (
                    <tr key={index} className="hover:bg-neutral-50/50">
                      <td className="p-3 font-semibold text-neutral-500">{index + 1}</td>
                      <td className="p-3">
                        <p className="font-bold text-neutral-900">{item.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-neutral-500">Authentic Handcrafted Piece</span>
                          {size && (
                            <span className="font-bold text-[9.5px] uppercase bg-neutral-200 text-neutral-900 px-1.5 py-0.5 rounded border border-neutral-300">
                              Size: {size}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-neutral-600">{item.sku || `VTM-PRD-${index + 1}`}</td>
                      <td className="p-3 text-center font-bold">{qty}</td>
                      <td className="p-3 text-right font-medium">${price.toFixed(2)}</td>
                      <td className="p-3 text-right font-bold">${(price * qty).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pricing Totals Box */}
          <div className="flex justify-end">
            <div className="w-full sm:w-72 p-4 bg-neutral-50 rounded-xl border border-neutral-300 space-y-1.5 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-neutral-900">${Number(subtotal || total).toFixed(2)} USD</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#ae2828] font-semibold">
                  <span>Offer / Coupon ({order.appliedCoupon || 'FIRST15'}):</span>
                  <span>-${Number(discount).toFixed(2)} USD</span>
                </div>
              )}
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Worldwide Express Shipping:</span>
                <span className="font-bold">FREE</span>
              </div>
              <div className="flex justify-between text-sm font-black text-neutral-900 pt-2 border-t-2 border-neutral-300">
                <span>Total Amount Paid:</span>
                <span>${Number(total).toFixed(2)} USD</span>
              </div>
            </div>
          </div>

          {/* Customs / Parcel Declaration Note */}
          <div className="p-3 rounded-lg border border-dashed border-neutral-300 bg-neutral-50/50 text-[10.5px] text-neutral-500 leading-relaxed space-y-1">
            <p className="font-bold text-neutral-700 uppercase tracking-wider text-[9.5px]">
              Customs &amp; Courier Declaration:
            </p>
            <p>
              This parcel contains authentic handcrafted historical decorative crafts made of solid wood, steel, and brass. Manufactured by traditional Indian master artisans. Delivered under 100% genuine export certification with a 30-day money-back satisfaction guarantee.
            </p>
          </div>

          {/* Barcode Footer Simulation */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-200 text-neutral-400 text-[10px] font-mono">
            <span>PACKING SLIP &bull; {order.id}</span>
            <span>THANK YOU FOR SUPPORTING AUTHENTIC ARTISANS</span>
            <span>PAGE 1 OF 1</span>
          </div>

        </div>

      </div>
    </div>
  );
}
