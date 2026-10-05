import React, { useState, useEffect } from 'react';
import { 
  X, Sparkles, Send, CheckCircle2, Ruler, Palette, Home, 
  Phone, Mail, User, FileText, Clock, ShieldCheck, AlertCircle, Loader2, Layers, Check
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { saveMessageToDB } from '../../lib/cloudflareService';
import { featuredCategories } from '../../data/categories';

// Standard 13 Master Categories List
const DEFAULT_CATEGORIES = [
  'Vintage Wall Lights',
  'Vintage Chandeliers',
  'Vintage Armour & Suits',
  'Wooden Shields',
  'Fantasy & Gothic Armour Suit',
  'Vintage Medieval Helmets',
  'Vintage Diving Helmets',
  'Cinematic Antiques & Lore',
  'Vintage Compasses',
  'Nautical Telescopes',
  'Nautical Spotlights & Tripods',
  'Walking Sticks & Canes',
  'Vintage Gramophones & Decor',
  'Handmade Leather Journals',
  'Other Custom Handcrafted Commission'
];

export const CustomQuoteModal = () => {
  const { 
    customQuoteCategory, 
    customQuoteProduct, 
    closeCustomQuote, 
    categories: dynamicCategories,
    setToast 
  } = useCart();

  const quoteTarget = customQuoteCategory || customQuoteProduct;

  // Build full list of available categories
  const allCategoryNames = React.useMemo(() => {
    const list = [...DEFAULT_CATEGORIES];
    if (Array.isArray(dynamicCategories)) {
      dynamicCategories.forEach(cat => {
        const name = cat.name || cat.title || cat.label;
        if (name && !list.includes(name)) {
          list.push(name);
        }
      });
    }
    return list;
  }, [dynamicCategories]);

  const [formData, setFormData] = useState({
    category: 'Vintage Wall Lights',
    name: '',
    email: '',
    phone: '',
    dimensions: '',
    finish: 'Antique Brass (Aged Hand Patina)',
    quantity: '1 Piece',
    roomDetails: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill category when modal opens
  useEffect(() => {
    if (quoteTarget) {
      setIsSubmitted(false);
      setError('');
      
      const targetName = quoteTarget.categoryName || quoteTarget.title || quoteTarget.name || '';
      // Find closest match in categories list
      const matched = allCategoryNames.find(c => 
        c.toLowerCase() === targetName.toLowerCase() || 
        targetName.toLowerCase().includes(c.toLowerCase()) ||
        c.toLowerCase().includes(targetName.toLowerCase())
      ) || targetName || 'Vintage Wall Lights';

      setFormData(prev => ({
        ...prev,
        category: matched,
        dimensions: '',
        roomDetails: '',
        notes: ''
      }));
    }
  }, [quoteTarget, allCategoryNames]);

  if (!quoteTarget) return null;

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
      setError('Please provide a contact phone number.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const formattedMessage = [
      `🎨 BESPOKE CATEGORY COMMISSION / CUSTOM ORDER REQUEST`,
      `Target Category: ${formData.category}`,
      `Quantity Needed: ${formData.finish ? formData.quantity : '1'}`,
      ``,
      `--- CLIENT CONTACT DETAILS ---`,
      `Full Name: ${formData.name.trim()}`,
      `Email Address: ${formData.email.trim()}`,
      `Phone Number: ${formData.phone.trim()}`,
      ``,
      `--- CUSTOM SPECIFICATIONS ---`,
      `Requested Dimensions / Sizing: ${formData.dimensions.trim() || 'Custom / To Be Discussed with Artisan'}`,
      `Preferred Metal Finish & Tone: ${formData.finish}`,
      `Room / Installation Space: ${formData.roomDetails.trim() || 'Not specified'}`,
      ``,
      `--- CLIENT NOTES & DESIGN DETAILS ---`,
      formData.notes.trim() || 'No additional notes provided.'
    ].join('\n');

    const quoteMessage = {
      id: Date.now(),
      type: 'custom_order',
      category: formData.category,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      dimensions: formData.dimensions.trim() || 'Custom / To Be Discussed',
      finish: formData.finish,
      quantity: formData.finish ? formData.quantity : '1',
      roomDetails: formData.roomDetails.trim() || '',
      notes: formData.notes.trim() || '',
      subject: `🎨 Custom Order Request: ${formData.category}`,
      message: formattedMessage,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      priority: 'high',
      read: false,
      replied: false,
      replyText: '',
      isResolved: false
    };

    try {
      await saveMessageToDB(quoteMessage);
      setIsSubmitted(true);
      if (setToast) {
        setToast('✨ Custom order request submitted successfully! We will connect shortly.');
      }
    } catch (err) {
      console.error('Failed to submit custom quote inquiry:', err);
      setError('Failed to send request. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs font-sans overflow-y-auto">
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
            <span>Handcrafted Bespoke Commission</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-normal text-[#f7eddb] tracking-wide leading-snug">
            Request Custom {formData.category}
          </h2>
          <p className="text-xs text-neutral-300 mt-1 max-w-md leading-relaxed">
            Can't find the exact size, design, or finish in our listings? Our master artisans in Roorkee will build your piece to your exact custom specifications.
          </p>
        </div>

        {/* Category Highlight Bar */}
        <div className="px-6 py-3.5 sm:px-8 bg-[#faf8f5] border-b border-neutral-200/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">🛠️</span>
            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                Selected Commission Category
              </span>
              <span className="text-xs sm:text-sm font-bold text-neutral-900">
                {formData.category}
              </span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
            <Check className="w-3 h-3 text-emerald-600" />
            <span>100% Made-to-Order</span>
          </span>
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
                  Custom Order Request Received!
                </h3>
                <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong className="text-neutral-900">{formData.name}</strong>. Your custom inquiry for <strong className="text-[#c8924b]">{formData.category}</strong> has been sent directly to our workshop artisans.
                </p>
              </div>

              <div className="bg-[#faf8f5] border border-amber-200/80 rounded-2xl p-4 text-left max-w-md mx-auto space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-[#b57a2e]">
                  <Clock className="w-4 h-4" />
                  <span>Next Steps:</span>
                </div>
                <ul className="text-neutral-600 space-y-1.5 text-[11.5px] list-disc list-inside">
                  <li>Our artisans will calculate the exact metal, woodwork, and workshop time for your specifications.</li>
                  <li>We will reach out to you directly via <strong>Email / Phone ({formData.email || formData.phone})</strong> with custom design drawings, price quotation, and delivery lead time.</li>
                  <li>No upfront payment required until you approve the design and quote.</li>
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

              {/* 1. Category Switcher */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-neutral-700 uppercase tracking-wider">
                  Category for Custom Commission <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className="w-full bg-[#faf8f5] border border-neutral-300 focus:border-[#c8924b] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs font-semibold text-neutral-900 outline-none transition-all cursor-pointer"
                  >
                    {allCategoryNames.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-[10px] text-neutral-500">
                  You can change the category if you need custom items across different collections.
                </p>
              </div>

              {/* 2. Contact Information */}
              <div className="space-y-3 pt-2 border-t border-neutral-100">
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#c8924b]" />
                  <span>Your Contact Details</span>
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
                      placeholder="e.g. Johnathan Miller"
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
                      placeholder="e.g. jmiller@example.com"
                      className="w-full bg-[#faf8f5] border border-neutral-300 focus:border-[#c8924b] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="e.g. +1 (555) 234-5678 or +44 7911 123456"
                      className="w-full bg-[#faf8f5] border border-neutral-300 focus:border-[#c8924b] focus:bg-white rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 outline-none transition-all font-medium"
                    />
                  </div>
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Please include country code for international inquiries.
                  </p>
                </div>
              </div>

              {/* 3. Custom Specifications & Sizing */}
              <div className="space-y-3 pt-2 border-t border-neutral-100">
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-[#c8924b]" />
                  <span>Custom Sizing &amp; Materials</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                      Target Dimensions (Height, Width, Dia)
                    </label>
                    <input
                      type="text"
                      value={formData.dimensions}
                      onChange={(e) => handleChange('dimensions', e.target.value)}
                      placeholder="e.g. Height: 32in, Width: 20in, Chain: 48in"
                      className="w-full bg-[#faf8f5] border border-neutral-300 focus:border-[#c8924b] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 outline-none transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                      Preferred Metal Finish &amp; Patina
                    </label>
                    <select
                      value={formData.finish}
                      onChange={(e) => handleChange('finish', e.target.value)}
                      className="w-full bg-[#faf8f5] border border-neutral-300 focus:border-[#c8924b] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 outline-none transition-all font-medium cursor-pointer"
                    >
                      <option value="Antique Brass (Aged Hand Patina)">Antique Brass (Aged Hand Patina)</option>
                      <option value="Hand-Forged Wrought Iron (Matte Black)">Hand-Forged Wrought Iron (Matte Black)</option>
                      <option value="Burnished Bronze">Burnished Bronze</option>
                      <option value="Vintage Polished Copper">Vintage Polished Copper</option>
                      <option value="Distressed Antique Pewter / Steel">Distressed Antique Pewter / Steel</option>
                      <option value="Natural Hardwood with Brass Accents">Natural Hardwood with Brass Accents</option>
                      <option value="Polished High-Shine Brass">Polished High-Shine Brass</option>
                      <option value="Custom Finish (Specify in Notes)">Custom Finish (Specify in Notes)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                      Quantity Needed
                    </label>
                    <select
                      value={formData.quantity}
                      onChange={(e) => handleChange('quantity', e.target.value)}
                      className="w-full bg-[#faf8f5] border border-neutral-300 focus:border-[#c8924b] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 outline-none transition-all font-medium cursor-pointer"
                    >
                      <option value="1 Piece (Single Bespoke Unit)">1 Piece (Single Bespoke Unit)</option>
                      <option value="Pair (2 Pieces)">Pair (2 Pieces)</option>
                      <option value="Set of 3 to 5 Pieces">Set of 3 to 5 Pieces</option>
                      <option value="Bulk / Hospitality Project (6+ Pieces)">Bulk / Hospitality Project (6+ Pieces)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                      Room / Installation Space (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.roomDetails}
                      onChange={(e) => handleChange('roomDetails', e.target.value)}
                      placeholder="e.g. Dining Hall (14ft ceiling), Stairway wall"
                      className="w-full bg-[#faf8f5] border border-neutral-300 focus:border-[#c8924b] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 outline-none transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                    Design Notes, Special Engraving or Reference Link (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => handleChange('notes', e.target.value)}
                    placeholder="Describe specific motifs, historical era reference, bulb fittings, glass shade requirements, or paste a link to reference images..."
                    className="w-full bg-[#faf8f5] border border-neutral-300 focus:border-[#c8924b] focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 outline-none transition-all font-medium resize-none"
                  />
                </div>
              </div>

              {/* Artisan Guarantee Notice */}
              <div className="bg-[#faf8f5] p-3 rounded-xl border border-amber-200/60 flex items-start gap-2.5 text-[11px] text-neutral-600">
                <ShieldCheck className="w-4 h-4 text-[#c8924b] shrink-0 mt-0.5" />
                <p className="leading-normal">
                  <strong>Master Artisan Guarantee:</strong> No purchase obligation. Our master artisans in Roorkee review every request individually to deliver authentic craftsmanship, custom drawings, and fair pricing.
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
                      <span>Request Custom {formData.category} Quote</span>
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
