import React, { useState, useEffect } from 'react';
import { 
  X, RotateCcw, Truck, ShieldCheck, AlertCircle, 
  CheckCircle2, Mail, Phone, Clock, FileText, ArrowRight, Camera
} from 'lucide-react';

export function PolicyModal({ isOpen, onClose, initialTab = 'refund' }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs font-menu animate-fade-in">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden z-10 border border-neutral-200 flex flex-col max-h-[92vh]">
        
        {/* Header with Title and Close Button */}
        <div className="bg-[#1b1a1a] text-white p-5 sm:p-6 flex items-center justify-between border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-[#c8924b] font-bold flex items-center justify-center border border-amber-500/20 text-lg">
              📜
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-white tracking-wide">
                Customer Care &amp; Store Policies
              </h2>
              <p className="text-xs text-neutral-400">
                Azim Crafts Official Guarantee, Shipping &amp; Privacy Standards
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation Bar */}
        <div className="flex border-b border-neutral-200 bg-neutral-50 px-4 sm:px-6 gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'refund', label: 'Return & Refund Policy', icon: RotateCcw },
            { id: 'shipping', label: 'Shipping & Delivery', icon: Truck },
            { id: 'privacy', label: 'Privacy & Security', icon: ShieldCheck },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-3.5 border-b-2 font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#c8924b] text-[#c8924b] bg-white'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Policy Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 text-neutral-800 leading-relaxed text-xs sm:text-sm">
          
          {/* TAB 1: RETURN & REFUND POLICY */}
          {activeTab === 'refund' && (
            <div className="space-y-6">
              
              {/* Highlight 1: 14-Day Guarantee */}
              <div className="p-4 sm:p-5 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-amber-950 font-bold text-sm sm:text-base">
                  <RotateCcw size={18} className="text-[#c8924b]" />
                  <span>14-Day Return &amp; Satisfaction Guarantee</span>
                </div>
                <p className="text-neutral-700 text-xs sm:text-sm leading-relaxed">
                  At Azim Crafts, we take immense pride in our authentic heritage craftsmanship. <strong>If you are not satisfied with the quality of your handcrafted piece, or if the product arrives damaged in transit, you are entitled to a full return and refund within 14 days of delivery.</strong>
                </p>
              </div>

              {/* Transit Damage Clause */}
              <div className="space-y-2">
                <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                  <AlertCircle size={16} className="text-[#c8924b]" />
                  <span>Products Damaged in Transit</span>
                </h3>
                <p className="text-neutral-600">
                  Every parcel leaving our artisan foundry is securely packed in reinforced wooden crating or multi-layer shockproof boxes. However, if your order is damaged during international transit:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-neutral-600">
                  <li>Please notify us within <strong>14 days of delivery</strong> at <a href="mailto:contact@azimcrafts.com" className="text-[#c8924b] underline font-medium">contact@azimcrafts.com</a> or via our Storefront Live Chat.</li>
                  <li>Share clear photographs of the damaged product and outer packaging for verification.</li>
                  <li>We will immediately arrange a <strong>free replacement</strong> or issue a <strong>100% full refund</strong> to your original payment method.</li>
                </ul>
              </div>

              {/* CRITICAL: Custom Orders Exclusion Clause */}
              <div className="p-4 sm:p-5 bg-neutral-900 text-white rounded-2xl space-y-3 border border-neutral-800 shadow-md">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm sm:text-base">
                  <Camera size={18} className="text-[#e8b06a]" />
                  <span>Custom &amp; Bespoke Orders Policy</span>
                </div>
                <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed">
                  <strong>For all custom orders, bespoke dimensions, tailored sizing, and personalised artisan commissions, returns and refunds are NOT available.</strong>
                </p>
                <div className="p-3 bg-neutral-800/90 rounded-xl border border-neutral-700/60 text-xs text-neutral-300 space-y-1.5">
                  <p className="font-semibold text-white">📸 Pre-Dispatch Approval Guarantee:</p>
                  <p>
                    Before packing and dispatching your custom piece, our master artisans will share <strong>high-resolution pictures and video walkthroughs of the final finished product</strong> directly with you for your inspection and confirmation.
                  </p>
                  <p className="text-amber-200/90 font-medium pt-1">
                    Once you inspect the pictures and give final approval for dispatch, the piece is shipped, and no cancellations, returns, or refunds will be accepted thereafter.
                  </p>
                </div>
              </div>

              {/* Return Conditions */}
              <div className="space-y-2">
                <h3 className="font-bold text-neutral-900 text-sm">Return Eligibility for Standard Catalog Items:</h3>
                <ul className="list-disc pl-5 space-y-1 text-neutral-600">
                  <li>Item must be unused, in its original artisan condition, and accompanied by original packaging materials.</li>
                  <li>Custom engraved items or tailored bespoke sizing items cannot be returned (unless damaged in transit).</li>
                  <li>Return request must be initiated within 14 calendar days from the date tracking shows delivered.</li>
                </ul>
              </div>

              {/* Refund Timeline */}
              <div className="space-y-2 pt-2 border-t border-neutral-100">
                <h3 className="font-bold text-neutral-900 text-sm">Refund Processing:</h3>
                <p className="text-neutral-600">
                  Once your returned item is received and inspected at our workshop, your refund will be authorized within <strong>48 hours</strong>. The funds will reflect in your bank account, credit card, or PayPal balance within <strong>3 to 5 business days</strong> depending on your banking provider.
                </p>
              </div>

            </div>
          )}

          {/* TAB 2: SHIPPING & DELIVERY POLICY */}
          {activeTab === 'shipping' && (
            <div className="space-y-6">
              
              <div className="p-4 sm:p-5 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-amber-950 font-bold text-sm sm:text-base">
                  <Truck size={18} className="text-[#c8924b]" />
                  <span>Worldwide Express Courier Delivery</span>
                </div>
                <p className="text-neutral-700 text-xs sm:text-sm leading-relaxed">
                  We hand-deliver authentic artisanal antiques worldwide to over 200 countries, including Australia, United States, United Kingdom, Canada, Europe, UAE, and Asia.
                </p>
              </div>

              {/* Free Shipping Threshold */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-1">
                  <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">Orders Over $200 USD</span>
                  <p className="text-base font-bold text-emerald-700">100% Free Worldwide Express Shipping</p>
                  <p className="text-xs text-neutral-500">Fully tracked door-to-door courier delivery included at no extra cost.</p>
                </div>

                <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 space-y-1">
                  <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider block">Orders Under $200 USD</span>
                  <p className="text-base font-bold text-neutral-900">Flat $20 USD Standard Shipping</p>
                  <p className="text-xs text-neutral-500">Subsidized international courier express service.</p>
                </div>
              </div>

              {/* Delivery Carriers & Timelines */}
              <div className="space-y-2">
                <h3 className="font-bold text-neutral-900 text-sm">International Courier Partners &amp; Transit Times:</h3>
                <p className="text-neutral-600">
                  All dispatches are handled by top-tier international express carriers: <strong>DHL Express, FedEx International, UPS Worldwide, and Australia Post</strong>.
                </p>
                <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-neutral-200">
                    <span className="font-semibold text-neutral-800">Dispatch Time:</span>
                    <span className="text-neutral-600">1 – 3 business days for catalog items</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-neutral-200">
                    <span className="font-semibold text-neutral-800">Australia &amp; New Zealand:</span>
                    <span className="text-neutral-600">4 – 7 business days</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-neutral-200">
                    <span className="font-semibold text-neutral-800">United States &amp; Canada:</span>
                    <span className="text-neutral-600">4 – 8 business days</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-neutral-200">
                    <span className="font-semibold text-neutral-800">United Kingdom &amp; Europe:</span>
                    <span className="text-neutral-600">4 – 7 business days</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="font-semibold text-neutral-800">Custom / Bespoke Orders:</span>
                    <span className="text-neutral-600">Crafting time (7–14 days) + express transit</span>
                  </div>
                </div>
              </div>

              {/* Tracking & Insurance */}
              <div className="space-y-2">
                <h3 className="font-bold text-neutral-900 text-sm">Full Transit Insurance &amp; Live Tracking:</h3>
                <p className="text-neutral-600">
                  Every single shipment is 100% insured. As soon as your order leaves our workshop, you receive an automated confirmation email with a live tracking number and direct courier tracking link.
                </p>
              </div>

            </div>
          )}

          {/* TAB 3: PRIVACY & DATA POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              
              <div className="p-4 sm:p-5 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-amber-950 font-bold text-sm sm:text-base">
                  <ShieldCheck size={18} className="text-[#c8924b]" />
                  <span>Privacy &amp; Data Security Promise</span>
                </div>
                <p className="text-neutral-700 text-xs sm:text-sm leading-relaxed">
                  Your trust is our highest priority. Azim Crafts complies strictly with the Australian Privacy Principles (APPs) and global General Data Protection Regulation (GDPR) standards.
                </p>
              </div>

              {/* What Data We Collect */}
              <div className="space-y-2">
                <h3 className="font-bold text-neutral-900 text-sm">Information We Collect:</h3>
                <ul className="list-disc pl-5 space-y-1 text-neutral-600">
                  <li><strong>Contact Details:</strong> Your name, email address, and telephone number (used strictly for order fulfillment, delivery tracking, and custom quote coordination).</li>
                  <li><strong>Delivery Address:</strong> Street, city, state, postal code, and country for international courier customs declaration.</li>
                  <li><strong>Order History:</strong> Record of products purchased, customized requests, and customer reviews.</li>
                </ul>
              </div>

              {/* Zero Selling */}
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5">
                <h4 className="font-bold text-emerald-900 flex items-center gap-1.5 text-xs sm:text-sm">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>We Never Sell or Rent Your Personal Data</span>
                </h4>
                <p className="text-neutral-600 text-xs leading-relaxed">
                  Azim Crafts will never sell, lease, trade, or distribute your email, phone number, or personal details to any marketing networks, data brokers, or third parties under any circumstances.
                </p>
              </div>

              {/* Payment Security */}
              <div className="space-y-2">
                <h3 className="font-bold text-neutral-900 text-sm">Bank-Grade 256-Bit SSL Payment Processing:</h3>
                <p className="text-neutral-600 leading-relaxed">
                  All credit and debit card transactions are encrypted with bank-level 256-bit SSL encryption and processed directly via <strong>Stripe (PCI-DSS Level 1 Certified)</strong> and <strong>PayPal</strong>. Azim Crafts servers never store or have access to your full credit card numbers or security CVV codes.
                </p>
              </div>

              {/* Support Contact */}
              <div className="pt-3 border-t border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-neutral-500">
                <span>Data Privacy Officer: Azim Crafts Support Team</span>
                <a href="mailto:contact@azimcrafts.com" className="text-[#c8924b] font-bold hover:underline">
                  contact@azimcrafts.com
                </a>
              </div>

            </div>
          )}

        </div>

        {/* Footer Action Bar */}
        <div className="p-4 sm:p-5 bg-neutral-50 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-neutral-500">
            <ShieldCheck size={14} className="text-[#c8924b]" />
            <span>Azim Crafts Certified Artisan Policy • Last Updated October 2026</span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-neutral-900 hover:bg-neutral-800 text-white transition-colors cursor-pointer shadow-sm"
          >
            Close &amp; Continue Shopping
          </button>
        </div>

      </div>
    </div>
  );
}
