import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, Send, CheckCircle2, Ruler, Palette, Home, 
  Phone, Mail, User, FileText, Clock, ShieldCheck, AlertCircle, Loader2
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { saveMessageToDB } from '../../lib/cloudflareService';

export const CustomQuoteModal = () => {
  const { customQuoteProduct, closeCustomQuote, setToast } = useCart();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dimensions: '',
    finish: 'Antique Brass (Aged Patina)',
    roomDetails: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (customQuoteProduct) {
      setIsSubmitted(false);
      setError('');
      setFormData(prev => ({
        ...prev,
        dimensions: '',
        roomDetails: '',
        notes: ''
      }));
    }
  }, [customQuoteProduct]);

  if (!customQuoteProduct) return null;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Please provide a WhatsApp or phone number so our artisans can reach you.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const formattedMessage = [
      `🎨 BESPOKE COMMISSION / CUSTOM QUOTE REQUEST`,
      `Item Reference: ${customQuoteProduct.title}`,
      `Category: ${customQuoteProduct.categoryName || customQuoteProduct.category || 'General'}`,
      `Product ID: #${customQuoteProduct.id}`,
      ``,
      `--- CLIENT CONTACT ---`,
      `Name: ${formData.name.trim()}`,
      `Email: ${formData.email.trim()}`,
      `WhatsApp / Phone: ${formData.phone.trim()}`,
      ``,
      `--- CUSTOM SPECIFICATIONS ---`,
      `Requested Dimensions / Sizing: ${formData.dimensions.trim() || 'Standard / Artisan Recommended'}`,
      `Preferred Finish / Material: ${formData.finish}`,
      `Room / Installation Space: ${formData.roomDetails.trim() || 'Not specified'}`,
      ``,
      `--- CLIENT NOTES & SPECIAL INSTRUCTIONS ---`,
      formData.notes.trim() || 'No additional notes provided.'
    ].join('\n');

    const quoteMessage = {
      id: Date.now(),
      name: formData.name.trim(),
      email: formData.email.trim(),
      subject: `🎨 Custom Quote: ${customQuoteProduct.title}`,
      message: formattedMessage,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      priority: 'high',
      read: false,
      replied: false,
      replyText: ''
    };

    try {
      await saveMessageToDB(quoteMessage);
      setIsSubmitted(true);
      if (setToast) {
        setToast('✨ Custom commission quote request sent successfully!');
      }
    } catch (err) {
      console.error('Failed to submit quote inquiry:', err);
      setError('Failed to send request. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs font-sans overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden my-auto animate-fade-in text-neutral-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Decorative Artisan Banner */}
        <div className="bg-[#1b1a1a] text-white px-6 py-5 sm:px-8 sm:py-6 border-b border-[#333333] relative">
          <button
            onClick={closeCustomQuote}
            className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-[#c8924b] text-xs font-bold uppercase tracking-widest mb-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Master Artisan Commission</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-normal text-[#f7eddb] tracking-wide leading-snug">
            Request Custom Quote
          </h2>
          <p className="text-xs text-neutral-300 mt-1 max-w-md leading-relaxed">
            Every home and space is unique. Submit your custom dimensions, metal finish &amp; room specs directly to our Roorkee artisans.
          </p>
        </div>

        {/* Product Snippet Header */}
        <div className="px-6 py-3.5 sm:px-8 bg-[#faf8f5] border-b border-neutral-200 flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-xl bg-white border border-neutral-200 p-1 shrink-0 overflow-hidden flex items-center justify-center">
            <img 
              src={customQuoteProduct.image || '/logo.png'} 
              alt={customQuoteProduct.title}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-bold text-[#c8924b] uppercase tracking-wider block">
              {customQuoteProduct.categoryName || customQuoteProduct.category || 'Handcrafted Masterpiece'}
            </span>
            <h3 className="text-xs sm:text-sm font-bold text-neutral-900 truncate">
              {customQuoteProduct.title}
            </h3>
            <span className="inline-block mt-0.5 text-[10.5px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
              ✓ 100% Made-to-Order Customization Available
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto">
          {isSubmitted ? (
            <div className="py-8 text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-xl font-serif font-bold text-neutral-900">
                  Quote Request Received!
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong className="text-neutral-900">{formData.name}</strong>. Your custom specifications have been routed directly to our master craftsmen in Roorkee.
                </p>
              </div>

              <div className="bg-[#faf8f5] border border-amber-200/80 rounded-2xl p-4 text-left max-w-md mx-auto space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-[#b57a2e]">
                  <Clock className="w-4 h-4" />
                  <span>What happens next?</span>
                </div>
                <ul className="text-neutral-600 space-y-1.5 text-[11.5px] list-disc list-inside">
                  <li>Our artisans will review your required dimensions and finish.</li>
                  <li>We will reach out to you via <strong>WhatsApp / Email ({formData.phone || formData.email})</strong> within 24 hours with a custom quotation and lead time.</li>
                  <li>Custom production begins immediately upon your design approval.</li>
                </ul>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={closeCustomQuote}
                  className="bg-[#1b1a1a] hover:bg-[#333333] text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md"
                >
                  Return to Store
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-medium animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Contact Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#c8924b]" />
                  <span>1. Your Contact Details</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      placeholder="e.g. Eleanor Vance"
                      className="w-full bg-[#faf8f5] border border-neutral-300 focus:border-[#c8924b] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 outline-none transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="e.g. eleanor@example.com"
                      className="w-full bg-[#faf8f5] border border-neutral-300 focus:border-[#c8924b] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                    WhatsApp / Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="e.g. +1 (555) 000-0000 or +44 7911 123456"
                      className="w-full bg-[#faf8f5] border border-neutral-300 focus:border-[#c8924b] focus:bg-white rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 outline-none transition-all font-medium"
                    />
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Include country code. Our master artisans will send quote details and photos directly on WhatsApp or Email.
                  </p>
                </div>
              </div>

              {/* Custom Specifications */}
              <div className="space-y-3 pt-2 border-t border-neutral-100">
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-[#c8924b]" />
                  <span>2. Custom Specifications &amp; Sizing</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                      Required Dimensions (Height, Width, Dia)
                    </label>
                    <input
                      type="text"
                      value={formData.dimensions}
                      onChange={(e) => handleChange('dimensions', e.target.value)}
                      placeholder="e.g. Diameter: 36 inches, Height: 48 inches"
                      className="w-full bg-[#faf8f5] border border-neutral-300 focus:border-[#c8924b] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 outline-none transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                      Preferred Metal Finish &amp; Tone
                    </label>
                    <select
                      value={formData.finish}
                      onChange={(e) => handleChange('finish', e.target.value)}
                      className="w-full bg-[#faf8f5] border border-neutral-300 focus:border-[#c8924b] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 outline-none transition-all font-medium cursor-pointer"
                    >
                      <option value="Antique Brass (Aged Patina)">Antique Brass (Aged Patina)</option>
                      <option value="Hand-Forged Wrought Iron (Matte Black)">Hand-Forged Wrought Iron (Matte Black)</option>
                      <option value="Burnished Bronze">Burnished Bronze</option>
                      <option value="Vintage Polished Copper">Vintage Polished Copper</option>
                      <option value="Distressed Antique Pewter / Steel">Distressed Antique Pewter / Steel</option>
                      <option value="Natural Hardwood &amp; Brass Accent">Natural Hardwood &amp; Brass Accent</option>
                      <option value="Custom Finish (Specify in Notes)">Custom Finish (Specify in Notes)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                    Room / Installation Space (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.roomDetails}
                    onChange={(e) => handleChange('roomDetails', e.target.value)}
                    placeholder="e.g. Living room high ceiling (12 ft), Dining foyer, Entrance archway"
                    className="w-full bg-[#faf8f5] border border-neutral-300 focus:border-[#c8924b] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 outline-none transition-all font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                    Special Instructions / Reference Link (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Describe any special chain lengths, bulb fittings, custom motifs, or paste link to reference photos/drawings..."
                    className="w-full bg-[#faf8f5] border border-neutral-300 focus:border-[#c8924b] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 outline-none transition-all font-medium resize-none"
                  />
                </div>
              </div>

              {/* Artisan Guarantee Notice */}
              <div className="bg-[#faf8f5] p-3 rounded-xl border border-amber-200/60 flex items-start gap-2.5 text-[11px] text-neutral-600">
                <ShieldCheck className="w-4 h-4 text-[#c8924b] shrink-0 mt-0.5" />
                <p leading-normal>
                  <strong>Artisan Guarantee:</strong> No obligation. We will provide a formal quotation, exact shipping timeframe, and workshop photos before any payment is requested.
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#1b1a1a] hover:bg-[#333333] active:scale-[0.99] text-white py-4 px-6 rounded-xl font-bold text-xs uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 border border-[#c8924b]/40 hover:border-[#c8924b]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#c8924b]" />
                      <span>Sending to Master Artisans...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-[#c8924b]" />
                      <span>Submit Bespoke Commission Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
