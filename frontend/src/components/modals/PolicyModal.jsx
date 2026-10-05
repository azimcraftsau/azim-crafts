import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs font-menu animate-fade-in">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden z-10 border border-neutral-200 flex flex-col max-h-[90vh]">
        
        {/* Clean Header */}
        <div className="px-6 py-5 border-b border-neutral-200 flex items-center justify-between bg-white">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight">
              Store Policies &amp; Terms
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Azim Crafts &bull; Return &amp; Refund, Shipping, and Privacy
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Clean Text-Only Tabs */}
        <div className="flex border-b border-neutral-200 px-6 gap-6 bg-white overflow-x-auto no-scrollbar">
          {[
            { id: 'refund', label: 'Return & Refund Policy' },
            { id: 'shipping', label: 'Shipping Policy' },
            { id: 'privacy', label: 'Privacy Policy' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 text-xs sm:text-sm font-semibold transition-colors border-b-2 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-neutral-900 text-neutral-900 font-bold'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Plain, Clean, Highly Legible Text Content */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1 text-neutral-800 text-xs sm:text-sm leading-relaxed bg-white">
          
          {/* TAB 1: RETURN & REFUND POLICY */}
          {activeTab === 'refund' && (
            <div className="space-y-6">
              
              <div>
                <h3 className="text-sm sm:text-base font-bold text-neutral-900 mb-2">
                  1. Return &amp; Refund Policy
                </h3>
                <p className="text-neutral-700 leading-relaxed">
                  If you are not satisfied with the quality of your product, or if the item is damaged in transit, you can request a return and full refund within <strong>14 days of delivery</strong>.
                </p>
              </div>

              <div className="border-t border-neutral-150 pt-5">
                <h3 className="text-sm sm:text-base font-bold text-neutral-900 mb-2">
                  2. Damaged in Transit
                </h3>
                <p className="text-neutral-700 leading-relaxed mb-2">
                  All products are inspected before shipment and packaged with protective materials. However, if your item arrives damaged during transit:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-neutral-700">
                  <li>Contact us within 14 days of receiving the package at contact@azimcrafts.com or via Live Chat.</li>
                  <li>Share clear photographs of the damaged product and outer packaging.</li>
                  <li>We will provide an immediate replacement or a full 100% refund to your original payment method.</li>
                </ul>
              </div>

              <div className="border-t border-neutral-150 pt-5">
                <h3 className="text-sm sm:text-base font-bold text-neutral-900 mb-2">
                  3. Custom Orders &amp; Bespoke Commissions
                </h3>
                <p className="text-neutral-700 leading-relaxed mb-2">
                  For custom orders, tailored sizes, and bespoke commissions, <strong>returns and refunds are not available</strong>.
                </p>
                <p className="text-neutral-700 leading-relaxed">
                  We will share pictures and videos of the final product with you before dispatching for your review and approval. Once you approve the photos and the product is dispatched, no returns, exchanges, or refunds are accepted.
                </p>
              </div>

              <div className="border-t border-neutral-150 pt-5">
                <h3 className="text-sm sm:text-base font-bold text-neutral-900 mb-2">
                  4. Return Eligibility for Standard Catalog Items
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 text-neutral-700">
                  <li>Item must be in its original condition and packaging.</li>
                  <li>Custom engraved items or bespoke tailored dimensions cannot be returned.</li>
                  <li>The return request must be submitted within 14 days from the recorded delivery date.</li>
                </ul>
              </div>

              <div className="border-t border-neutral-150 pt-5">
                <h3 className="text-sm sm:text-base font-bold text-neutral-900 mb-2">
                  5. Refund Processing Time
                </h3>
                <p className="text-neutral-700 leading-relaxed">
                  Once the returned item is received at our workshop, your refund is processed within 3 to 5 business days back to your original payment method (Card, Stripe, or Bank Account).
                </p>
              </div>

            </div>
          )}

          {/* TAB 2: SHIPPING & DELIVERY POLICY */}
          {activeTab === 'shipping' && (
            <div className="space-y-6">
              
              <div>
                <h3 className="text-sm sm:text-base font-bold text-neutral-900 mb-2">
                  1. Worldwide Shipping &amp; Express Couriers
                </h3>
                <p className="text-neutral-700 leading-relaxed">
                  We deliver worldwide to over 200 countries through trusted international courier services including DHL Express, FedEx, UPS, and Australia Post.
                </p>
              </div>

              <div className="border-t border-neutral-150 pt-5">
                <h3 className="text-sm sm:text-base font-bold text-neutral-900 mb-2">
                  2. Shipping Rates
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 text-neutral-700">
                  <li><strong>Orders over $200 USD:</strong> Free Worldwide Express Shipping.</li>
                  <li><strong>Orders under $200 USD:</strong> Flat shipping fee of $20 USD.</li>
                </ul>
              </div>

              <div className="border-t border-neutral-150 pt-5">
                <h3 className="text-sm sm:text-base font-bold text-neutral-900 mb-2">
                  3. Dispatch &amp; Transit Times
                </h3>
                <ul className="list-disc pl-5 space-y-1.5 text-neutral-700">
                  <li><strong>Dispatch:</strong> Standard catalog items ship within 1 to 3 business days.</li>
                  <li><strong>Transit Time:</strong> International delivery typically takes 4 to 8 business days.</li>
                  <li><strong>Custom Orders:</strong> Handcrafting takes approximately 7 to 14 days before dispatch.</li>
                </ul>
              </div>

              <div className="border-t border-neutral-150 pt-5">
                <h3 className="text-sm sm:text-base font-bold text-neutral-900 mb-2">
                  4. Tracking &amp; Transit Insurance
                </h3>
                <p className="text-neutral-700 leading-relaxed">
                  Every parcel is shipped with door-to-door tracking and transit insurance. As soon as your order is dispatched, you will receive an email containing your courier tracking number.
                </p>
              </div>

            </div>
          )}

          {/* TAB 3: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              
              <div>
                <h3 className="text-sm sm:text-base font-bold text-neutral-900 mb-2">
                  1. Information We Collect
                </h3>
                <p className="text-neutral-700 leading-relaxed mb-2">
                  We collect only the information necessary to fulfill your order and provide customer service:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-neutral-700">
                  <li>Name, email address, and telephone number.</li>
                  <li>Delivery address for shipping and customs clearance.</li>
                  <li>Order details and communication history.</li>
                </ul>
              </div>

              <div className="border-t border-neutral-150 pt-5">
                <h3 className="text-sm sm:text-base font-bold text-neutral-900 mb-2">
                  2. How We Protect Your Information
                </h3>
                <p className="text-neutral-700 leading-relaxed">
                  We do not sell, rent, or share your personal information with third-party marketing agencies. Your details are used strictly for order processing, shipping coordination, and customer support.
                </p>
              </div>

              <div className="border-t border-neutral-150 pt-5">
                <h3 className="text-sm sm:text-base font-bold text-neutral-900 mb-2">
                  3. Payment Security
                </h3>
                <p className="text-neutral-700 leading-relaxed">
                  All credit and debit card payments are handled securely through Stripe and PayPal using 256-bit SSL encryption. We do not store or have direct access to your card numbers or CVV.
                </p>
              </div>

              <div className="border-t border-neutral-150 pt-5">
                <h3 className="text-sm sm:text-base font-bold text-neutral-900 mb-2">
                  4. Contact
                </h3>
                <p className="text-neutral-700 leading-relaxed">
                  If you have any questions regarding our policies or your personal data, contact us at contact@azimcrafts.com.
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Clean Footer Bar */}
        <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between">
          <span className="text-[11px] text-neutral-500">
            Azim Crafts &bull; Official Store Policy
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
