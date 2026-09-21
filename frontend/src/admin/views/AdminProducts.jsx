import React, { useState, useEffect } from 'react';
import { allProducts } from '../../data/products';
import { 
  Search, Plus, Pencil, Trash2, X, ChevronDown, CheckCircle, 
  Package, Image, FileText, Ruler, Box, Truck, ShieldCheck, 
  Layers, Star, Sparkles, AlertCircle, Tag, FolderPlus, ArrowRight
, Loader2} from 'lucide-react';
import { 
  getProducts, 
  saveProductToDB, 
  deleteProductFromDB, 
  uploadProductImage,
  getCategories,
  saveCategoryToDB,
  getTrashProducts
} from '../../lib/cloudflareService';

export const DEFAULT_CATEGORIES = [
  { key: 'vintage-armour', name: 'Vintage Armour & Suits' },
  { key: 'wooden-shields', name: 'Wooden Shields' },
  { key: 'vintage-wall-lights', name: 'Vintage Wall Lights' },
  { key: 'vintage-chandeliers', name: 'Vintage Chandeliers' },
  { key: 'cinematic-antiques', name: 'Cinematic Antiques & Lore' },
  { key: 'fantasy-gothic-armour', name: 'Fantasy & Gothic Armour Suit' },
  { key: 'medieval-helmets', name: 'Vintage Medieval Helmets' },
  { key: 'diving-helmets', name: 'Vintage Diving Helmets' },
  { key: 'vintage-gauntlets', name: 'Vintage Gauntlets' },
  { key: 'vintage-compasses', name: 'Vintage Compasses' },
  { key: 'table-clocks', name: 'Vintage Table & Wall Clocks' },
  { key: 'leather-journals', name: 'Handmade Leather Journals' },
  { key: 'walking-sticks', name: 'Walking Sticks & Brolly Stand' }
];

export const getMergedCategories = () => {
  return DEFAULT_CATEGORIES;
};

const EMPTY_PRODUCT = {
  title: '',
  category: 'wooden-shields',
  categoryName: 'Wooden Shields',
  price: '',
  regularPrice: '',
  currency: 'USD',
  badge: '',
  sizes: [],
  stockQuantity: 12,
  isSoldOut: false,
  isOnSale: false,
  hasModularParts: false,
  modularParts: [],
  image: '',
  images: [],
  videos: [],
  rating: 5,
  reviewsCount: 25,
  vendor: 'Azim Crafts',
  description: '',
  dimensions: '',
  weight: '',
  materials: '',
  specifications: {
    brand: 'Azim Crafts',
    productName: '',
    model: '',
    packContents: '1x Handcrafted Masterpiece Item',
    colour: 'Natural Handcrafted Artisan Tones',
    keyAttributes: '100% Handcrafted, Solid Metal & Hardwood, Museum Quality'
  },
  perfectFor: [
    'Home & executive office décor',
    'Historical display pieces & collector cabinets',
    'Gifts for history, nautical & art lovers',
    'Cosplay, LARP & reenactment prop'
  ],
  shippingInfo: 'Shipped From: Artisan Workshop, Roorkee, Uttarakhand, India.\nShipping Provider: DHL Express, FedEx, UPS & All Major International Courier services.\nAdditional Delivery Information: Order Processing 2 – 5 Business Days. Handcrafted by master artisans with export-grade protective packaging. Free worldwide shipping available.',
  disclaimer: 'All of our items are handmade (HANDCRAFTED) by master artisans who employ techniques (TOOLS) and traditions that are often centuries old. Some natural blemishes or imperfections are to be expected. These are not product flaws. Instead, they are precisely what make these pieces so extraordinary and beautiful.'
};

function Toast({ msg, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 bg-gray-900 text-white px-5 py-3.5 rounded-xl shadow-2xl text-sm font-medium animate-fade-in border border-gray-700">
      <CheckCircle size={18} className="text-emerald-400 shrink-0" />
      <span>{msg}</span>
    </div>
  );
}

// ================= MODAL: ADD NEW CATEGORY =================
function AddCategoryModal({ onSave, onClose }) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const handleNameChange = (val) => {
    setName(val);
    setError('');
    // Auto generate clean slug
    const generated = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(generated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      setError('Please enter a valid category name.');
      return;
    }
    onSave({
      key: slug.trim(),
      name: name.trim(),
      description: description.trim()
    });
  };

  const inputCls = 'w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#c8924b] focus:border-transparent outline-none transition-all bg-white';
  const labelCls = 'block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-menu">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-gray-200 animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-neutral-50/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 rounded-xl text-[#c8924b] border border-amber-200">
              <FolderPlus size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Create New Category</h3>
              <p className="text-xs text-gray-500">Add a new department / category to your store</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-200 text-gray-500 transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}
          <div>
            <label className={labelCls}>Category Name *</label>
            <input 
              className={inputCls} 
              value={name} 
              onChange={(e) => handleNameChange(e.target.value)} 
              placeholder="e.g. Medieval Battle Swords & Daggers" 
              autoFocus
            />
          </div>

          <div>
            <label className={labelCls}>Category Key / Slug *</label>
            <input 
              className={inputCls} 
              value={slug} 
              onChange={(e) => setSlug(e.target.value)} 
              placeholder="e.g. medieval-swords" 
            />
            <span className="text-[11px] text-gray-400 mt-1 block">
              Unique identifier used in filters and store routes.
            </span>
          </div>

          <div>
            <label className={labelCls}>Description (Optional)</label>
            <textarea 
              className={inputCls} 
              rows={3} 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Short description of this product collection..." 
            />
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all hover:opacity-95 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #c8924b, #e8b06a)', color: '#0f1117' }}
            >
              <Plus size={16} />
              <span>Create Category</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

// ================= MODAL: ADD / EDIT PRODUCT =================
function ProductModal({ initial, isNew, categories, onSave, onClose }) {
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'media' | 'specs' | 'lore' | 'shipping'
  const initialImages = initial?.images && initial.images.length > 0 
    ? initial.images 
    : (initial?.image ? [initial.image] : []);

  const isArmourInitial = initial?.category === 'vintage-armour' || 
                          initial?.category === 'fantasy-gothic-armour' || 
                          (initial?.categoryName && (initial?.categoryName.includes('Armour') || initial?.categoryName.includes('Suit'))) ||
                          (initial?.title && (initial?.title.includes('Armour') || initial?.title.includes('Armor') || initial?.title.includes('Suit')));

  const initialSizes = Array.isArray(initial?.sizes) 
    ? initial.sizes 
    : (isNew && isArmourInitial ? ['M', 'XL', 'XXL'] : []);

  const defaultModularParts = [
    { id: 'helmet', name: 'Helmet', price: Math.round((Number(initial?.price || 800) * 0.22) / 5) * 5 || 195, enabled: true },
    { id: 'body', name: 'Body Armour & Cuirass', price: Math.round((Number(initial?.price || 800) * 0.38) / 5) * 5 || 345, enabled: true },
    { id: 'arms', name: 'Articulated Gauntlets', price: Math.round((Number(initial?.price || 800) * 0.18) / 5) * 5 || 165, enabled: true },
    { id: 'legs', name: 'Greaves & Sabatons', price: Math.round((Number(initial?.price || 800) * 0.22) / 5) * 5 || 190, enabled: true }
  ];

  const initialModularParts = Array.isArray(initial?.modularParts) && initial.modularParts.length > 0
    ? initial.modularParts
    : defaultModularParts;

  const initialHasModularParts = initial?.hasModularParts !== undefined 
    ? Boolean(initial.hasModularParts) 
    : (isArmourInitial && (initial?.title?.toLowerCase().includes('suit') || isNew));

  const initialStockQty = initial?.stockQuantity !== undefined 
    ? Number(initial.stockQuantity) 
    : (initial?.stock_quantity !== undefined ? Number(initial.stock_quantity) : 12);

  const [form, setForm] = useState({ 
    ...EMPTY_PRODUCT, 
    ...initial,
    stockQuantity: initialStockQty,
    hasModularParts: initialHasModularParts,
    modularParts: initialModularParts,
    sizes: initialSizes,
    specifications: {
      ...EMPTY_PRODUCT.specifications,
      ...(initial?.specifications || {})
    },
    perfectFor: initial?.perfectFor || EMPTY_PRODUCT.perfectFor,
    images: initialImages,
    image: initial?.image || (initialImages.length > 0 ? initialImages[0] : '')
  });

  const [uploading, setUploading] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [formError, setFormError] = useState('');
  const [perfectForText, setPerfectForText] = useState(
    Array.isArray(form.perfectFor) ? form.perfectFor.join('\n') : (form.perfectFor || '')
  );

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setSpec = (k, v) => setForm((f) => ({ 
    ...f, 
    specifications: { ...(f.specifications || {}), [k]: v } 
  }));

  const handleCategoryChange = (e) => {
    const catKey = e.target.value;
    const catObj = categories.find(c => c.key === catKey);
    const isArmourCat = catKey === 'vintage-armour' || catKey === 'fantasy-gothic-armour' || (catObj && (catObj.name.includes('Armour') || catObj.name.includes('Suit')));
    const isShieldCat = catKey === 'wooden-shields' || (catObj && (catObj.name.toLowerCase().includes('shield') || catObj.name.toLowerCase().includes('shield')));

    setForm(f => {
      let newSizes = f.sizes;
      if (isNew && (!f.sizes || f.sizes.length === 0)) {
        if (isShieldCat) {
          newSizes = ['18 inch', '24 inch', '36 inch'];
        } else if (isArmourCat) {
          newSizes = ['M', 'XL', 'XXL'];
        }
      }
      return {
        ...f,
        category: catKey,
        categoryName: catObj ? catObj.name : 'Authentic Historical Craft',
        sizes: newSizes
      };
    });
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    const url = newImageUrl.trim();
    const updated = [...(form.images || []), url];
    setForm(f => ({
      ...f,
      images: updated,
      image: f.image || url
    }));
    setNewImageUrl('');
  };

  const handleRemoveImage = (indexToRemove) => {
    const updated = form.images.filter((_, idx) => idx !== indexToRemove);
    setForm(f => ({
      ...f,
      images: updated,
      image: f.image === form.images[indexToRemove] ? (updated[0] || '') : f.image
    }));
  };

  const handleSetPrimaryImage = (selectedUrl) => {
    const remaining = form.images.filter(img => img !== selectedUrl);
    setForm(f => ({
      ...f,
      image: selectedUrl,
      images: [selectedUrl, ...remaining]
    }));
  };

  const handleSave = () => {
    if (!form.title || !form.title.trim()) {
      setFormError('Please fill in required fields: Product Title is required.');
      return;
    }
    if (form.price === undefined || form.price === '' || isNaN(Number(form.price)) || Number(form.price) < 0) {
      setFormError('Price must be a valid non-negative number.');
      return;
    }
    setFormError('');
    const primaryImg = form.image || (form.images && form.images.length > 0 ? form.images[0] : '');
    
    // Parse perfect for bullets
    const parsedPerfectFor = perfectForText
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const catObj = categories.find(c => c.key === form.category);

    const finalSizes = Array.isArray(form.sizes) ? form.sizes : [];
    const parsedStock = parseInt(form.stockQuantity, 10);
    const finalStock = isNaN(parsedStock) || parsedStock < 0 ? 0 : parsedStock;
    const finalSoldOut = finalStock <= 0 ? true : Boolean(form.isSoldOut);

    const updatedProduct = {
      ...form,
      stockQuantity: finalStock,
      stock_quantity: finalStock,
      isSoldOut: finalSoldOut,
      is_sold_out: finalSoldOut ? 1 : 0,
      categoryName: catObj ? catObj.name : (form.categoryName || 'Authentic Historical Craft'),
      price: parseFloat(form.price),
      regularPrice: form.regularPrice ? parseFloat(form.regularPrice) : parseFloat(form.price),
      id: form.id || `product-${Date.now()}`,
      rating: Number(form.rating) || 5,
      reviewsCount: Number(form.reviewsCount) || 25,
      sizes: finalSizes,
      hasModularParts: Boolean(form.hasModularParts),
      modularParts: Array.isArray(form.modularParts) ? form.modularParts.map(p => ({
        ...p,
        price: Number(p.price) || 0,
        enabled: p.enabled !== false
      })) : [],
      image: primaryImg,
      images: form.images && form.images.length > 0 ? form.images : [primaryImg],
      perfectFor: parsedPerfectFor.length > 0 ? parsedPerfectFor : EMPTY_PRODUCT.perfectFor,
      specifications: {
        ...form.specifications,
        productName: form.specifications?.productName || form.title,
        brand: form.specifications?.brand || 'Azim Crafts'
      }
    };

    onSave(updatedProduct);
  };

  const inputCls = 'w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#c8924b] focus:border-transparent outline-none transition-all bg-white';
  const labelCls = 'block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 font-menu">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl max-h-[94vh] overflow-hidden flex flex-col border border-gray-200 animate-fade-in">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-neutral-50/90 shrink-0">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#c8924b]">
              {isNew ? 'Catalog Management' : `Product ID: ${form.id}`}
            </span>
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
              {isNew ? 'Add New Handcrafted Product' : `Edit: ${form.title}`}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-200 text-gray-500 transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 px-6 bg-white overflow-x-auto no-scrollbar shrink-0 gap-2 pt-2">
          {[
            { key: 'basic', label: '1. Basic Info & Pricing', icon: Package },
            { key: 'media', label: '2. Photos & Gallery', icon: Image },
            { key: 'specs', label: '3. Dimensions & Materials', icon: Ruler },
            { key: 'lore', label: '4. Description & Story', icon: FileText },
            { key: 'shipping', label: '5. Shipping & Disclaimer', icon: Truck },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 py-3 px-3.5 text-xs font-bold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                  isActive 
                    ? 'border-[#c8924b] text-[#c8924b]' 
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="overflow-y-auto p-6 flex-1 space-y-6 bg-[#fafafa]">
          
          {/* TAB 1: BASIC INFO */}
          {activeTab === 'basic' && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Product Title *</label>
                  <input 
                    className={inputCls} 
                    value={form.title} 
                    onChange={(e) => set('title', e.target.value)} 
                    placeholder="e.g. Handmade Viking Wooden Round Shield – Medieval Battle Ready Shield" 
                  />
                </div>

                <div>
                  <label className={labelCls}>Category *</label>
                  <select className={inputCls} value={form.category} onChange={handleCategoryChange}>
                    {categories.map((c) => (
                      <option key={c.key} value={c.key}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Product Badge / Ribbon</label>
                  <select className={inputCls} value={form.badge || ''} onChange={(e) => set('badge', e.target.value)}>
                    <option value="">None (No Badge - Default)</option>
                    <option value="Best Seller">🔥 Best Seller</option>
                    <option value="Popular">⭐ Popular</option>
                    <option value="Masterpiece">👑 Masterpiece</option>
                    <option value="Sale">🏷️ Sale</option>
                    <option value="Special Deal">⚡ Special Deal</option>
                    <option value="New">✨ New Arrival</option>
                    <option value="In Stock">✅ In Stock</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Selling Price (USD) *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                    <input 
                      type="number" min="0" 
                      className={`${inputCls} pl-8`} 
                      value={form.price} 
                      onChange={(e) => set('price', e.target.value)} 
                      placeholder="185.00" 
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Compare-at Regular Price (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                    <input 
                      type="number" min="0" 
                      className={`${inputCls} pl-8`} 
                      value={form.regularPrice} 
                      onChange={(e) => set('regularPrice', e.target.value)} 
                      placeholder="220.00" 
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Inventory Units (Available Stock) *</label>
                  <input 
                    type="number" 
                    min="0" 
                    className={inputCls} 
                    value={form.stockQuantity !== undefined ? form.stockQuantity : 12} 
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      const newQty = isNaN(val) ? '' : Math.max(0, val);
                      setForm(f => ({
                        ...f,
                        stockQuantity: newQty,
                        isSoldOut: newQty === 0 ? true : (newQty > 0 && f.isSoldOut ? false : f.isSoldOut)
                      }));
                    }} 
                    placeholder="e.g. 12" 
                  />
                  <p className="text-[11px] mt-1 font-medium">
                    {Number(form.stockQuantity) === 0 ? (
                      <span className="text-red-600">❌ 0 units: Automatically marked as Sold Out</span>
                    ) : Number(form.stockQuantity) <= 5 ? (
                      <span className="text-amber-600">🔥 Low Stock Alert (&le; 5 units will show on store)</span>
                    ) : (
                      <span className="text-emerald-600">✅ Normal Stock ({form.stockQuantity} units)</span>
                    )}
                  </p>
                </div>

                <div>
                  <label className={labelCls}>Stock Status</label>
                  <select 
                    className={inputCls} 
                    value={form.isSoldOut ? 'soldout' : 'instock'} 
                    onChange={(e) => {
                      const isSold = e.target.value === 'soldout';
                      setForm(f => ({
                        ...f,
                        isSoldOut: isSold,
                        stockQuantity: isSold ? 0 : (Number(f.stockQuantity) <= 0 ? 10 : f.stockQuantity)
                      }));
                    }}
                  >
                    <option value="instock">✅ In Stock (Available for Purchase)</option>
                    <option value="soldout">❌ Sold Out (Disabled)</option>
                  </select>
                </div>

                <div>
                  <label className={labelCls}>Customer Rating</label>
                  <select className={inputCls} value={form.rating} onChange={(e) => set('rating', e.target.value)}>
                    <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
                    <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
                    <option value={3}>⭐⭐⭐ 3 Stars</option>
                  </select>
                </div>

                {/* Available Sizes Section */}
                <div className="sm:col-span-2 pt-3 border-t border-gray-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className={labelCls}>Available Sizes &amp; Variants</label>
                    <span className="text-xs text-gray-500 font-medium">
                      {(form.sizes && form.sizes.length > 0) ? `Active: ${form.sizes.join(', ')}` : 'Standard Item (No Sizes)'}
                    </span>
                  </div>

                  {/* Shield Sizes (18 inch, 24 inch, 36 inch) */}
                  <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200/60">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-gray-800">🛡️ Shield Sizes (Diameter):</span>
                      <button
                        type="button"
                        onClick={() => set('sizes', ['18 inch', '24 inch', '36 inch'])}
                        className="text-[11px] font-bold text-[#c8924b] hover:underline cursor-pointer"
                      >
                        Set All Shields (18", 24", 36")
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {['18 inch', '24 inch', '36 inch'].map((sz) => {
                        const isSelected = (form.sizes || []).includes(sz);
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => {
                              const current = form.sizes || [];
                              const updated = isSelected
                                ? current.filter(s => s !== sz)
                                : [...current, sz];
                              set('sizes', updated);
                            }}
                            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all border cursor-pointer ${
                              isSelected
                                ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {isSelected ? `✓ ${sz}` : `+ ${sz}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Armour & Suits Sizes (M, XL, XXL) */}
                  <div className="bg-neutral-50 p-3 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-gray-800">⚔️ Armour &amp; Suits Sizes:</span>
                      <button
                        type="button"
                        onClick={() => set('sizes', ['M', 'XL', 'XXL'])}
                        className="text-[11px] font-bold text-[#c8924b] hover:underline cursor-pointer"
                      >
                        Set All Armour (M, XL, XXL)
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {['M', 'XL', 'XXL'].map((sz) => {
                        const isSelected = (form.sizes || []).includes(sz);
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => {
                              const current = form.sizes || [];
                              const updated = isSelected
                                ? current.filter(s => s !== sz)
                                : [...current, sz];
                              set('sizes', updated);
                            }}
                            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all border cursor-pointer ${
                              isSelected
                                ? 'bg-[#c8924b] text-white border-[#c8924b] shadow-xs'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {isSelected ? `✓ Size ${sz}` : `+ Size ${sz}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {form.sizes && form.sizes.length > 0 && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => set('sizes', [])}
                        className="text-xs font-semibold text-gray-400 hover:text-red-600 hover:underline cursor-pointer"
                      >
                        Clear All Sizes (Make Standard Item)
                      </button>
                    </div>
                  )}

                  <p className="text-[11px] text-gray-400">
                    Configured sizes are shown as selectable options on the customer product detail page and carried forward through checkout and logistics.
                  </p>
                </div>

                {/* Modular Armour Pieces Breakdown (Sell Parts Separately) */}
                <div className="sm:col-span-2 pt-4 border-t border-gray-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                        <span>⚔️ Modular Armour Pieces Breakdown</span>
                        <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                          4 Separate Pieces
                        </span>
                      </label>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        Allow customers to buy individual pieces (Helmet, Body Cuirass, Gauntlets, Leg Greaves) separately.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(form.hasModularParts)}
                        onChange={(e) => set('hasModularParts', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#c8924b]"></div>
                    </label>
                  </div>

                  {form.hasModularParts && (
                    <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-200/80 space-y-3 animate-fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(form.modularParts || []).map((part, index) => (
                          <div 
                            key={part.id || index}
                            className="bg-white p-3 rounded-xl border border-amber-200/60 shadow-2xs space-y-2"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                                <span>{index === 0 ? '🛡️' : index === 1 ? '🥋' : index === 2 ? '🧤' : '👢'}</span>
                                <span>Part {index + 1}</span>
                              </span>
                              <label className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={part.enabled !== false}
                                  onChange={(e) => {
                                    const updated = [...(form.modularParts || [])];
                                    updated[index] = { ...updated[index], enabled: e.target.checked };
                                    set('modularParts', updated);
                                  }}
                                  className="w-3.5 h-3.5 accent-[#c8924b] rounded"
                                />
                                <span>Active</span>
                              </label>
                            </div>

                            <div>
                              <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">
                                Piece Name
                              </label>
                              <input
                                type="text"
                                value={part.name || ''}
                                onChange={(e) => {
                                  const updated = [...(form.modularParts || [])];
                                  updated[index] = { ...updated[index], name: e.target.value };
                                  set('modularParts', updated);
                                }}
                                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-1 focus:ring-[#c8924b] outline-none"
                                placeholder="Piece Name"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">
                                Price ($ USD)
                              </label>
                              <input
                                type="number" min="0"
                                step="1"
                                value={part.price ?? ''}
                                onChange={(e) => {
                                  const updated = [...(form.modularParts || [])];
                                  updated[index] = { ...updated[index], price: Number(e.target.value) || 0 };
                                  set('modularParts', updated);
                                }}
                                className="w-full border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-[#c8924b] focus:ring-1 focus:ring-[#c8924b] outline-none"
                                placeholder="Price"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Price Summary Bar */}
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-amber-200/50 px-1">
                        <span className="text-gray-600 font-medium">
                          Total Sum of Selected Pieces:
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">
                            ${(form.modularParts || []).filter(p => p.enabled !== false).reduce((sum, p) => sum + (Number(p.price) || 0), 0)} USD
                          </span>
                          <span className="text-gray-400">|</span>
                          <span className="text-gray-500">
                            Full Suit Price: <strong className="text-gray-900">${form.price || 0} USD</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PHOTOS & GALLERY */}
          {activeTab === 'media' && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">Product Gallery Images</h4>
                  <p className="text-xs text-gray-500">First image in the list will be used as the primary cover photo.</p>
                </div>
                <span className="text-xs font-bold text-[#c8924b] bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  {form.images ? form.images.length : 0} Images
                </span>
              </div>

              {/* Photos Grid */}
              {form.images && form.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-neutral-50 rounded-2xl border border-neutral-200">
                  {form.images.map((imgUrl, idx) => {
                    const isPrimary = (form.image === imgUrl) || (!form.image && idx === 0);
                    return (
                      <div key={idx} className={`relative group rounded-xl overflow-hidden border-2 transition-all bg-white ${
                        isPrimary ? 'border-[#c8924b] ring-2 ring-[#c8924b]/20 shadow-sm' : 'border-neutral-200'
                      }`}>
                        <div className="aspect-square p-2 flex items-center justify-center">
                          <img 
                            src={imgUrl} 
                            alt={`Gallery ${idx + 1}`} 
                            className="w-full h-full object-contain"
                          />
                        </div>
                        
                        {/* Primary Badge or Make Cover */}
                        {isPrimary ? (
                          <span className="absolute bottom-0 inset-x-0 bg-[#c8924b] text-white text-[10px] font-black text-center py-0.5 uppercase tracking-wider">
                            Primary Cover
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryImage(imgUrl)}
                            className="absolute bottom-0 inset-x-0 bg-neutral-900/85 hover:bg-black text-white text-[10px] font-bold text-center py-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            Set As Cover
                          </button>
                        )}

                        {/* Remove Image */}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-md opacity-90 group-hover:opacity-100 transition-all cursor-pointer"
                          title="Remove photo"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Upload or Add URL */}
              <div className="space-y-3 pt-2">
                <div className="p-4 bg-neutral-50 rounded-xl border border-dashed border-gray-300 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">Upload Image Files</span>
                    <span className="text-[11px] text-gray-500">Supports JPG, PNG, WEBP from your computer</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={async (e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setUploading(true);
                        const uploadedUrls = [];
                        for (let i = 0; i < e.target.files.length; i++) {
                          const url = await uploadProductImage(e.target.files[i]);
                          if (url) uploadedUrls.push(url);
                        }
                        if (uploadedUrls.length > 0) {
                          setForm(f => ({
                            ...f,
                            images: [...(f.images || []), ...uploadedUrls],
                            image: f.image || uploadedUrls[0]
                          }));
                        }
                        setUploading(false);
                      }
                    }}
                    className="text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-gray-900 file:text-white hover:file:bg-[#c8924b] file:cursor-pointer cursor-pointer"
                  />
                </div>
                {uploading && <p className="text-xs text-[#c8924b] font-bold animate-pulse">Uploading photos...</p>}

                {/* Paste URL */}
                <div className="flex gap-2">
                  <input
                    className={inputCls}
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Or paste an image URL (e.g. /All categories/All Products/product 1/1.jpeg)"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddImageUrl(); } }}
                  />
                  <button
                    type="button"
                    onClick={handleAddImageUrl}
                    className="px-5 py-2.5 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl shrink-0 transition-colors cursor-pointer"
                  >
                    + Add Image URL
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DIMENSIONS & SPECIFICATIONS */}
          {activeTab === 'specs' && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Dimensions (Accurate) *</label>
                  <input 
                    className={inputCls} 
                    value={form.dimensions || ''} 
                    onChange={(e) => set('dimensions', e.target.value)} 
                    placeholder="e.g. 600(L) * 600(W) * 75(H) mm (Approx) / 24 Inches Diameter" 
                  />
                </div>

                <div>
                  <label className={labelCls}>Item Weight *</label>
                  <input 
                    className={inputCls} 
                    value={form.weight || ''} 
                    onChange={(e) => set('weight', e.target.value)} 
                    placeholder="e.g. Approx. 3.5 Kgs" 
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelCls}>Materials (Detailed Composition) *</label>
                  <input 
                    className={inputCls} 
                    value={form.materials || ''} 
                    onChange={(e) => set('materials', e.target.value)} 
                    placeholder="e.g. Solid wood body with metal rim & center boss (umbo), genuine leather arm straps." 
                  />
                </div>

                <div>
                  <label className={labelCls}>Brand Name</label>
                  <input 
                    className={inputCls} 
                    value={form.specifications?.brand || 'Azim Crafts'} 
                    onChange={(e) => setSpec('brand', e.target.value)} 
                  />
                </div>

                <div>
                  <label className={labelCls}>Model SKU Code</label>
                  <input 
                    className={inputCls} 
                    value={form.specifications?.model || ''} 
                    onChange={(e) => setSpec('model', e.target.value)} 
                    placeholder="e.g. SD-105" 
                  />
                </div>

                <div>
                  <label className={labelCls}>Pack Contents</label>
                  <input 
                    className={inputCls} 
                    value={form.specifications?.packContents || ''} 
                    onChange={(e) => setSpec('packContents', e.target.value)} 
                    placeholder="e.g. 1x 24-Inch Solid Hardwood Shield with Leather Back Straps" 
                  />
                </div>

                <div>
                  <label className={labelCls}>Colour & Finish</label>
                  <input 
                    className={inputCls} 
                    value={form.specifications?.colour || ''} 
                    onChange={(e) => setSpec('colour', e.target.value)} 
                    placeholder="e.g. Black and Gold / Rustic Wood Tones" 
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelCls}>Key Attributes</label>
                  <input 
                    className={inputCls} 
                    value={form.specifications?.keyAttributes || ''} 
                    onChange={(e) => setSpec('keyAttributes', e.target.value)} 
                    placeholder="e.g. Solid Wood Body with Metal Rim & Center Boss, 24 Inches, Approx 3.5 Kgs" 
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DESCRIPTION & LORE */}
          {activeTab === 'lore' && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
              <div>
                <label className={labelCls}>Full Product Description & Highlights *</label>
                <textarea 
                  className={`${inputCls} font-mono text-xs leading-relaxed`} 
                  rows={10} 
                  value={form.description || ''} 
                  onChange={(e) => set('description', e.target.value)} 
                  placeholder="Paste the complete product narrative, highlights, why choose section, and keywords..." 
                />
              </div>

              <div>
                <label className={labelCls}>"Perfect For" Bullets (One per line)</label>
                <textarea 
                  className={inputCls} 
                  rows={4} 
                  value={perfectForText} 
                  onChange={(e) => setPerfectForText(e.target.value)} 
                  placeholder="Viking battle reenactment & Norse wall display&#10;Man cave & historical collection centerpiece&#10;Gifts for history lovers" 
                />
              </div>
            </div>
          )}

          {/* TAB 5: SHIPPING & DISCLAIMER */}
          {activeTab === 'shipping' && (
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
              <div>
                <label className={labelCls}>Shipping & Delivery Information</label>
                <textarea 
                  className={inputCls} 
                  rows={4} 
                  value={form.shippingInfo || ''} 
                  onChange={(e) => set('shippingInfo', e.target.value)} 
                  placeholder="Shipped From: Artisan Workshop, Roorkee, Uttarakhand, India..." 
                />
              </div>

              <div>
                <label className={labelCls}>Handcrafted Disclaimer</label>
                <textarea 
                  className={inputCls} 
                  rows={4} 
                  value={form.disclaimer || ''} 
                  onChange={(e) => set('disclaimer', e.target.value)} 
                  placeholder="All of our items are handmade (HANDCRAFTED) by master artisans..." 
                />
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={onClose} 
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
            >
              Cancel
            </button>
            {formError && (
              <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                {formError}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold shadow-md transition-all hover:opacity-95 active:scale-98 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #c8924b, #e8b06a)', color: '#0f1117' }}
          >
            <Sparkles size={16} />
            <span>Save &amp; Sync to Storefront</span>
          </button>
        </div>

      </div>
    </div>
  );
}

// ================= MAIN COMPONENT: ADMIN PRODUCTS =================
export function AdminProducts({ onNavigate }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(getMergedCategories());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all'); // 'all' | category.key
  const [stockFilter, setStockFilter] = useState('all');
  const [modal, setModal] = useState(null); // null | 'add' | product obj for edit
  const [categoryModal, setCategoryModal] = useState(false);
  const [toast, setToast] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null); // product obj to move to trash
  const [trashCount, setTrashCount] = useState(0);

  const updateTrashCount = async () => {
    try {
      const trash = await getTrashProducts();
      setTrashCount(Array.isArray(trash) ? trash.length : 0);
    } catch {
      setTrashCount(0);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await getCategories();
      if (Array.isArray(cats) && cats.length > 0) {
        setCategories(cats);
        return;
      }
    } catch (e) {}
    setCategories(DEFAULT_CATEGORIES);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [data, cats, trash] = await Promise.all([
        getProducts(),
        getCategories(),
        getTrashProducts()
      ]);
      setProducts(Array.isArray(data) && data.length > 0 ? data : []);
      if (Array.isArray(cats) && cats.length > 0) setCategories(cats);
      setTrashCount(Array.isArray(trash) ? trash.length : 0);
    } catch (e) {
      console.warn('Error loading products from DB:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('vw_trash_updated', updateTrashCount);
    window.addEventListener('vw_products_updated', loadData);
    window.addEventListener('vw_categories_updated', loadCategories);
    return () => {
      window.removeEventListener('vw_trash_updated', updateTrashCount);
      window.removeEventListener('vw_products_updated', loadData);
      window.removeEventListener('vw_categories_updated', loadCategories);
    };
  }, []);

  // Save New Category
  const handleCreateCategory = async (newCat) => {
    try {
      if (categories.some(c => c.key === newCat.key)) {
        setToast('A category with this key/name already exists.');
        return;
      }
      await saveCategoryToDB(newCat, true);
      const updated = [...categories, newCat];
      setCategories(updated);
      setCategoryModal(false);
      setCatFilter(newCat.key);
      setToast(`Category "${newCat.name}" created and saved to database!`);
    } catch (e) {
      console.error(e);
      setToast('Error creating category.');
    }
  };
  const handleSaveProduct = async (product) => {
    if (product.price < 0 || product.stock < 0) {
      setToast({ message: 'Price and stock cannot be negative', type: 'error' });
      return;
    }
    const isNew = modal === 'add';
    let updated;
    if (isNew) {
      updated = [product, ...products];
    } else {
      updated = products.map((p) => (p.id === product.id ? product : p));
    }
    setProducts(updated);
    setModal(null);
    setToast(isNew ? 'New Product Created & Synced to DB!' : 'Product Updated & Synced to Database!');
    
    await saveProductToDB(product, isNew);
    const refreshed = await getProducts();
    if (Array.isArray(refreshed) && refreshed.length > 0) {
      setProducts(refreshed);
    }
  };

  // MOVE TO TRASH (Can be restored anytime)
  const handleMoveToTrash = async (productToTrash) => {
    try {
      const updated = products.filter((p) => p.id !== productToTrash.id);
      setProducts(updated);
      setDeleteConfirm(null);
      setToast(`"${productToTrash.title}" moved to Trash.`);
      await deleteProductFromDB(productToTrash.id);
      updateTrashCount();
    } catch (e) {
      console.error(e);
      setToast('Error moving product to Trash.');
    }
  };

  const activeCategoryObj = categories.find(c => c.key === catFilter);

  const filtered = products.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
      (p.categoryName && p.categoryName.toLowerCase().includes(search.toLowerCase())) ||
      (p.id && p.id.toLowerCase().includes(search.toLowerCase()));
    const matchCat = catFilter === 'all' || p.category === catFilter;
    const qty = p.stockQuantity !== undefined ? Number(p.stockQuantity) : (p.stock_quantity !== undefined ? Number(p.stock_quantity) : (p.isSoldOut ? 0 : 10));
    const isSold = p.isSoldOut || qty <= 0;
    const matchStock = stockFilter === 'all' 
      ? true 
      : stockFilter === 'instock' 
        ? !isSold 
        : stockFilter === 'lowstock'
          ? (!isSold && qty <= 5)
          : isSold;
    return matchSearch && matchCat && matchStock;
  });

  const selectCls = 'border border-gray-300 rounded-xl px-3.5 py-2 text-sm focus:ring-2 focus:ring-[#c8924b] focus:border-transparent outline-none bg-white font-medium';

  return (
    <div className="p-6 max-w-7xl space-y-6 font-menu">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Catalog Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage all handcrafted items, specifications, dimensions, weights, and descriptions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
          
          {/* Add Category Button */}
          <button
            onClick={() => setCategoryModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 transition-all shadow-2xs cursor-pointer"
          >
            <FolderPlus size={16} className="text-[#c8924b]" />
            <span>+ Add Category</span>
          </button>

          {/* Trash Bin Shortcut */}
          {onNavigate && (
            <button
              onClick={() => onNavigate('trash')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 transition-all shadow-2xs cursor-pointer"
            >
              <Trash2 size={15} className="text-red-500" />
              <span>Trash</span>
              {trashCount > 0 && (
                <span className="bg-red-100 text-red-700 text-[10px] font-black px-2 py-0.2 rounded-full">
                  {trashCount}
                </span>
              )}
            </button>
          )}

          {/* Add Product Button */}
          <button
            onClick={() => setModal('add')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all hover:opacity-90 active:scale-98 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #c8924b, #e8b06a)', color: '#0f1117' }}
          >
            <Plus size={16} />
            <span>+ Add Product</span>
          </button>

        </div>
      </div>

      {/* ================= CATEGORY TABS NAVIGATION WITH LIVE COUNTS ================= */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#c8924b]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Categories & Collections ({categories.length} Categories)
            </h3>
          </div>
          <button
            onClick={() => setCategoryModal(true)}
            className="text-xs font-bold text-[#c8924b] hover:underline cursor-pointer flex items-center gap-1"
          >
            <Plus size={13} />
            <span>New Category</span>
          </button>
        </div>

        {/* Scrollable Category Pills Bar */}
        <div className="flex gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          
          {/* Tab: All Products */}
          <button
            onClick={() => setCatFilter('all')}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
              catFilter === 'all'
                ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm ring-2 ring-neutral-900/10'
                : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
            }`}
          >
            <span>All Products</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              catFilter === 'all' ? 'bg-[#c8924b] text-neutral-900' : 'bg-neutral-200 text-neutral-800'
            }`}>
              {products.length}
            </span>
          </button>

                    {/* Individual Category Tabs */}
          {categories.map((c) => {
            const count = products.filter(p => p.category === c.key).length;
            const isSelected = catFilter === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setCatFilter(c.key)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 border ${
                  isSelected
                    ? 'bg-[#c8924b] text-white border-[#c8924b] shadow-sm ring-2 ring-[#c8924b]/20'
                    : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                }`}
              >
                <span>{c.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isSelected ? 'bg-white text-neutral-900' : 'bg-neutral-200 text-neutral-800'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}

        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-4 flex flex-wrap gap-3 items-center justify-between">
        
        {/* Active Category Indicator */}
        <div className="flex items-center gap-2 min-w-[200px]">
          <Tag size={16} className="text-[#c8924b]" />
          <div>
            <span className="text-xs font-bold text-gray-900 block">
              {catFilter === 'all' ? 'Showing All Categories' : activeCategoryObj?.name}
            </span>
            <span className="text-[11px] text-gray-400">
              {filtered.length} product{filtered.length !== 1 ? 's' : ''} listed
            </span>
          </div>
        </div>

        {/* Search and Stock filter */}
        <div className="flex flex-1 sm:flex-initial flex-wrap items-center gap-3">
          <div className="relative min-w-[220px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full border border-gray-300 rounded-xl pl-9 pr-3.5 py-2 text-xs outline-none focus:ring-2 focus:ring-[#c8924b] focus:border-transparent"
              placeholder={`Search in ${catFilter === 'all' ? 'catalog' : activeCategoryObj?.name}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select className={selectCls} value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
            <option value="all">All Stock Status</option>
            <option value="instock">In Stock Only</option>
            <option value="lowstock">🔥 Low Stock (&le; 5 units)</option>
            <option value="soldout">Sold Out Only</option>
          </select>
        </div>

      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
                <th className="px-5 py-3.5 text-left font-semibold w-16">Item</th>
                <th className="px-5 py-3.5 text-left font-semibold">Title & Specs</th>
                <th className="px-5 py-3.5 text-left font-semibold">Category</th>
                <th className="px-5 py-3.5 text-left font-semibold">Price</th>
                <th className="px-5 py-3.5 text-left font-semibold">Weight & Dimensions</th>
                <th className="px-5 py-3.5 text-left font-semibold">Stock</th>
                <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-9 h-9 border-3 border-[#c8924b] border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs font-bold text-gray-700 tracking-wide">Loading authentic catalog from database...</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="w-12 h-12 rounded-xl bg-neutral-50 border border-neutral-200 overflow-hidden flex items-center justify-center p-1">
                          <img
                            src={encodeURI(p.image || '')}
                            alt={p.title}
                            className="w-full h-full object-contain"
                            onError={(e) => { e.target.src = '/logo.png'; }}
                          />
                        </div>
                      </td>
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-gray-900 line-clamp-1 max-w-sm">{p.title}</div>
                    <div className="flex items-center flex-wrap gap-2 mt-1">
                      <span className="text-[11px] text-gray-400 font-mono">ID: {p.id}</span>
                      {p.badge && (
                        <span className="bg-amber-50 text-[#c8924b] text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-200 uppercase">
                          {p.badge}
                        </span>
                      )}
                      {p.sizes && p.sizes.length > 0 && (
                        <span className="bg-amber-50 text-[#9b6b28] text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-200/80">
                          Sizes: {p.sizes.join(', ')}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-block bg-neutral-100 text-neutral-800 text-xs px-2.5 py-1 rounded-lg font-medium">
                      {p.categoryName || p.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-gray-900">${Number(p.price).toFixed(2)}</div>
                    {p.regularPrice > p.price && (
                      <span className="text-xs text-gray-400 line-through">${Number(p.regularPrice).toFixed(2)}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-600">
                    <div className="font-medium text-gray-800">{p.weight || '3.5 kg'}</div>
                    <div className="text-[11px] text-gray-400 truncate max-w-[180px]">{p.dimensions || '24" Diameter'}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    {(() => {
                      const qty = p.stockQuantity !== undefined ? Number(p.stockQuantity) : (p.stock_quantity !== undefined ? Number(p.stock_quantity) : (p.isSoldOut ? 0 : 10));
                      const isSold = p.isSoldOut || qty <= 0;
                      return (
                        <div className="space-y-1">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isSold 
                              ? 'bg-red-100 text-red-700' 
                              : qty <= 5 
                                ? 'bg-amber-100 text-amber-800' 
                                : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isSold ? 'Sold Out' : qty <= 5 ? `🔥 Low Stock (${qty})` : 'In Stock'}
                          </span>
                          <div className="text-[11px] font-medium text-gray-500">
                            {isSold ? '0 units left' : `${qty} units in stock`}
                          </div>
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setModal(p)} 
                        className="p-2 rounded-xl hover:bg-amber-50 text-[#c8924b] hover:text-[#b57f38] transition-colors cursor-pointer" 
                        title="Edit Full Product Details"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => setDeleteConfirm(p)} 
                        className="p-2 rounded-xl hover:bg-red-50 text-red-600 transition-colors cursor-pointer" 
                        title="Move to Trash"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center space-y-3">
                    <div className="w-12 h-12 bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto text-neutral-400">
                      <Package size={24} />
                    </div>
                    <h4 className="text-sm font-bold text-gray-800">
                      No products found {catFilter !== 'all' ? `in "${activeCategoryObj?.name}"` : ''}
                    </h4>
                    <p className="text-xs text-gray-400 max-w-sm mx-auto">
                      {search ? `No products match your search "${search}".` : `There are currently no products in this category.`}
                    </p>
                    <button
                      onClick={() => setModal(catFilter !== 'all' ? { ...EMPTY_PRODUCT, category: catFilter, categoryName: activeCategoryObj?.name } : 'add')}
                      className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#0f1117] transition-all hover:opacity-90 cursor-pointer"
                      style={{ background: 'linear-gradient(135deg, #c8924b, #e8b06a)' }}
                    >
                      <Plus size={14} />
                      <span>+ Add Product to this Category</span>
                    </button>
                  </td>
                </tr>
              )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {modal && (
        <ProductModal 
          initial={modal === 'add' 
            ? (catFilter !== 'all' ? { ...EMPTY_PRODUCT, category: catFilter, categoryName: activeCategoryObj?.name } : EMPTY_PRODUCT) 
            : modal
          } 
          isNew={modal === 'add' || !modal.id} 
          categories={categories}
          onSave={handleSaveProduct} 
          onClose={() => setModal(null)} 
        />
      )}

      {/* Add New Category Modal */}
      {categoryModal && (
        <AddCategoryModal 
          onSave={handleCreateCategory} 
          onClose={() => setCategoryModal(false)} 
        />
      )}

      {/* Move to Trash Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full border border-gray-200 animate-fade-in font-menu">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <Trash2 size={24} />
              <h3 className="text-lg font-bold text-gray-900">Move Product to Trash?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Are you sure you want to move <strong>{deleteConfirm.title}</strong> to Trash? 
              <br /><br />
              <span className="text-gray-800 font-medium">ℹ️ It will immediately be hidden from the customer storefront, but you can restore it anytime from the <strong>Trash Bin</strong> tab.</span>
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setDeleteConfirm(null)} 
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleMoveToTrash(deleteConfirm)} 
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold shadow-sm transition-all cursor-pointer"
              >
                <Trash2 size={15} />
                <span>Move to Trash</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast} onClose={() => setToast('')} />}
    </div>
  );
}
