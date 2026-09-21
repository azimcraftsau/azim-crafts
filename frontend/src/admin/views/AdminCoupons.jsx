import React, { useState, useEffect } from 'react';
import { 
  Plus, Pencil, Trash2, X, ToggleLeft, ToggleRight, CheckCircle, 
  Tag, Sparkles, Percent, DollarSign, Copy, Check, Search, ShieldCheck
, Loader2} from 'lucide-react';
import { getCoupons, saveCouponToDB, deleteCouponFromDB } from '../../lib/cloudflareService';

export const DEFAULT_COUPONS = [
  { id: 1, code: 'FIRST15', type: 'percentage', value: 15, description: '15% OFF First Order on Entire Catalog', active: true, uses: 14 },
  { id: 2, code: 'SPOOKY15', type: 'percentage', value: 15, description: '15% Early Halloween Special Discount', active: true, uses: 8 },
  { id: 3, code: 'VIKING20', type: 'percentage', value: 20, description: '20% OFF Viking Shields & Medieval Lore', active: true, uses: 15 },
  { id: 4, code: 'JOURNAL25', type: 'fixed', value: 25, description: '$25 OFF Handmade Leather Journals Collection', active: true, uses: 5 },
  { id: 5, code: 'VALENTINES10', type: 'percentage', value: 10, description: '10% OFF Special Gift Season', active: true, uses: 9 },
  { id: 6, code: 'VTM10', type: 'percentage', value: 10, description: '10% OFF Welcome Offer (Newsletter Signup)', active: true, uses: 22 },
  { id: 7, code: 'MARITIMEFREE', type: 'fixed', value: 44, description: 'Free Compass with Sextant (Inactive Offer)', active: false, uses: 2 },
];

const EMPTY = { code: '', type: 'percentage', value: '', description: '', active: true, uses: 0 };

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 bg-gray-900 text-white px-5 py-3.5 rounded-xl shadow-2xl text-sm font-medium animate-fade-in border border-gray-700">
      <CheckCircle size={18} className="text-emerald-400 shrink-0" />
      <span>{msg}</span>
    </div>
  );
}

function CouponModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial || EMPTY);
  const [formError, setFormError] = useState('');
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const inputCls = 'w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#c8924b] focus:border-transparent outline-none transition-all bg-white';
  const labelCls = 'block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5';

  const handleSave = () => {
    if (!form.code || !form.code.trim()) {
      setFormError('Coupon code is required.');
      return;
    }
    const val = parseFloat(form.value);
    if (isNaN(val) || val <= 0 || val > 100) {
      setFormError('Discount value must be a number between 1 and 100.');
      return;
    }
    setFormError('');
    onSave({ 
      ...form, 
      code: form.code.trim().toUpperCase(), 
      value: val, 
      discount: val,
      id: form.id || Date.now(),
      uses: form.uses || 0
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-menu">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-neutral-50/90 shrink-0">
          <div className="flex items-center gap-2">
            <Tag size={18} className="text-[#c8924b]" />
            <h3 className="text-base sm:text-lg font-bold text-gray-900">
              {form.id ? `Edit Coupon: ${form.code}` : 'Create New Coupon'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-200 text-gray-500 transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          <div>
            <label className={labelCls}>Coupon Code *</label>
            <input 
              className={`${inputCls} uppercase font-mono font-bold tracking-wider`} 
              value={form.code} 
              onChange={(e) => set('code', e.target.value.toUpperCase())} 
              placeholder="e.g. FLASH20" 
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Discount Type</label>
              <select className={inputCls} value={form.type} onChange={(e) => set('type', e.target.value)}>
                <option value="percentage">Percentage % Off</option>
                <option value="fixed">Fixed $ Off</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Value ({form.type === 'percentage' ? '%' : '$'}) *</label>
              <input 
                type="number" min="0" 
                className={inputCls} 
                value={form.value} 
                onChange={(e) => set('value', e.target.value)} 
                placeholder={form.type === 'percentage' ? '15' : '25'} 
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Description / Notes</label>
            <input 
              className={inputCls} 
              value={form.description} 
              onChange={(e) => set('description', e.target.value)} 
              placeholder="e.g. 15% OFF First Order on Entire Catalog" 
            />
          </div>

          {/* Active Status Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
            <div>
              <span className="text-xs font-bold text-gray-900 block">Coupon Status</span>
              <span className="text-[11px] text-gray-500">
                {form.active ? '✅ Active (Can be redeemed at checkout)' : '❌ Inactive (Disabled)'}
              </span>
            </div>
            <button 
              type="button" 
              onClick={() => set('active', !form.active)} 
              className="cursor-pointer transition-transform active:scale-95"
            >
              {form.active
                ? <ToggleRight size={32} className="text-[#c8924b]" />
                : <ToggleLeft size={32} className="text-gray-300" />}
            </button>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-gray-100">
            <div>
              {formError && (
                <span className="text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                  {formError}
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all hover:opacity-95 cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #c8924b, #e8b06a)', color: '#0f1117' }}
              >
                <Sparkles size={14} />
                <span>Save Coupon</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'active' | 'inactive'
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | EMPTY | coupon obj
  const [toast, setToast] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getCoupons();
      if (Array.isArray(data) && data.length > 0) {
        setCoupons(data);
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn('Failed to load coupons from DB:', e);
    }

    setCoupons(DEFAULT_COUPONS);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('vw_coupons_updated', loadData);
    return () => window.removeEventListener('vw_coupons_updated', loadData);
  }, []);

  const handleSave = async (coupon) => {
    if (coupon.price < 0 || coupon.stock < 0) {
      setToast({ message: 'Price and stock cannot be negative', type: 'error' });
      return;
    }
    const isNew = !coupon.id || typeof coupon.id !== 'number';
    const existing = coupons.find((c) => c.id === coupon.id);
    const updated = existing 
      ? coupons.map((c) => (c.id === coupon.id ? coupon : c)) 
      : [coupon, ...coupons];
    
    setCoupons(updated);
    setModal(null);
    setToast(existing ? `Coupon "${coupon.code}" updated in database!` : `Coupon "${coupon.code}" created & saved to database!`);
    await saveCouponToDB(coupon, isNew);
    const refreshed = await getCoupons();
    if (Array.isArray(refreshed) && refreshed.length > 0) setCoupons(refreshed);
  };

  const toggleActive = async (id) => {
    const target = coupons.find((c) => c.id === id);
    if (!target) return;
    const updatedCoupon = { ...target, active: !target.active };
    const updated = coupons.map((c) => (c.id === id ? updatedCoupon : c));
    setCoupons(updated);
    setToast(`Coupon "${target.code}" is now ${updatedCoupon.active ? 'Active ✅' : 'Inactive ❌'}`);
    await saveCouponToDB(updatedCoupon, false);
  };

  const handleDelete = async (id) => {
    const target = coupons.find((c) => c.id === id);
    const updated = coupons.filter((c) => c.id !== id);
    setCoupons(updated);
    setDeleteConfirm(null);
    setToast(`Coupon "${target?.code || ''}" removed from database.`);
    await deleteCouponFromDB(id);
  };

  const handleCopyCode = (code, id) => {
    navigator.clipboard?.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    setToast(`Code "${code}" copied to clipboard!`);
  };

  const activeCoupons = coupons.filter(c => c.active);
  const inactiveCoupons = coupons.filter(c => !c.active);

  const filtered = coupons.filter((c) => {
    const matchFilter = filterTab === 'all' 
      ? true 
      : filterTab === 'active' ? c.active : !c.active;
    const matchSearch = c.code.toLowerCase().includes(search.toLowerCase()) || 
      (c.description && c.description.toLowerCase().includes(search.toLowerCase()));
    return matchFilter && matchSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        <span className="ml-3 text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl space-y-6 font-menu">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons & Discount Codes</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage promotional promo codes, flash sales, newsletter welcome offers, and special checkout discounts.
          </p>
        </div>
        <button
          onClick={() => setModal(EMPTY)}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold shadow-md transition-all hover:opacity-90 active:scale-98 cursor-pointer self-start sm:self-auto"
          style={{ background: 'linear-gradient(135deg, #c8924b, #e8b06a)', color: '#0f1117' }}
        >
          <Plus size={18} />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-3">
          <div className="p-3 bg-neutral-100 text-neutral-800 rounded-xl">
            <Tag size={20} />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Coupons</span>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{coupons.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span className="text-xs text-emerald-700 font-bold uppercase tracking-wider">Active Coupons (Live)</span>
            <p className="text-2xl font-bold text-emerald-600 mt-0.5">{activeCoupons.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-[#c8924b] rounded-xl border border-amber-100">
            <Sparkles size={20} />
          </div>
          <div>
            <span className="text-xs text-[#c8924b] font-bold uppercase tracking-wider">Total Redemptions</span>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">
              {coupons.reduce((sum, c) => sum + (c.uses || 0), 0)} Uses
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-4 flex flex-wrap gap-3 items-center justify-between">
        
        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'all'
                ? 'bg-neutral-900 text-white shadow-2xs'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
            }`}
          >
            All Coupons ({coupons.length})
          </button>
          
          <button
            onClick={() => setFilterTab('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterTab === 'active'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active Live ({activeCoupons.length})</span>
          </button>

          <button
            onClick={() => setFilterTab('inactive')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterTab === 'inactive'
                ? 'bg-gray-800 text-white shadow-2xs'
                : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
            }`}
          >
            Inactive ({inactiveCoupons.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full border border-gray-300 rounded-xl pl-9 pr-3.5 py-2 text-xs outline-none focus:ring-2 focus:ring-[#c8924b] focus:border-transparent"
            placeholder="Search coupon code or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
                <th className="px-5 py-3.5 text-left font-semibold">Promo Code</th>
                <th className="px-5 py-3.5 text-left font-semibold">Discount Type</th>
                <th className="px-5 py-3.5 text-left font-semibold">Discount Value</th>
                <th className="px-5 py-3.5 text-left font-semibold">Description</th>
                <th className="px-5 py-3.5 text-left font-semibold">Live Status</th>
                <th className="px-5 py-3.5 text-left font-semibold">Redemptions</th>
                <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-8 h-8 border-3 border-[#c8924b] border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs font-bold text-gray-700">Loading coupons from database...</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-neutral-50/70 transition-colors">
                  
                  {/* Code + Copy */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-gray-900 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg text-xs tracking-wider shadow-2xs">
                        {c.code}
                      </span>
                      <button
                        onClick={() => handleCopyCode(c.code, c.id)}
                        className="p-1 rounded-lg hover:bg-neutral-200 text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
                        title="Copy coupon code"
                      >
                        {copiedId === c.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      c.type === 'percentage' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {c.type === 'percentage' ? '% Percentage Off' : '$ Fixed Amount Off'}
                    </span>
                  </td>

                  {/* Value */}
                  <td className="px-5 py-3.5 font-bold text-gray-900">
                    {c.type === 'percentage' ? `${c.value}% OFF` : `$${Number(c.value).toFixed(2)} OFF`}
                  </td>

                  {/* Description */}
                  <td className="px-5 py-3.5 text-xs text-gray-600 max-w-xs">
                    {c.description || 'Valid on all items across the store.'}
                  </td>

                  {/* Status Toggle */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleActive(c.id)} 
                        className="transition-transform active:scale-95 cursor-pointer" 
                        title={c.active ? 'Click to deactivate' : 'Click to activate'}
                      >
                        {c.active
                          ? <ToggleRight size={28} className="text-emerald-600" />
                          : <ToggleLeft size={28} className="text-gray-300" />}
                      </button>
                      <span className={`text-xs font-bold ${c.active ? 'text-emerald-700' : 'text-gray-400'}`}>
                        {c.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>

                  {/* Uses */}
                  <td className="px-5 py-3.5 text-xs font-semibold text-gray-700">
                    {c.uses || 0} orders
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => setModal(c)} 
                        className="p-2 rounded-xl hover:bg-amber-50 text-[#c8924b] transition-colors cursor-pointer" 
                        title="Edit Coupon"
                      >
                        <Pencil size={15} />
                      </button>
                      <button 
                        onClick={() => setDeleteConfirm(c)} 
                        className="p-2 rounded-xl hover:bg-red-50 text-red-600 transition-colors cursor-pointer" 
                        title="Delete Coupon"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400">
                    No coupons found matching your filter criteria.
                  </td>
                </tr>
              )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add/Edit */}
      {modal && <CouponModal initial={modal === EMPTY ? EMPTY : modal} onSave={handleSave} onClose={() => setModal(null)} />}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-full border border-gray-200 animate-fade-in font-menu">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Coupon?</h3>
            <p className="text-sm text-gray-500 mb-5 leading-relaxed">
              Are you sure you want to delete coupon <strong className="font-mono text-gray-800">{deleteConfirm.code}</strong>? Customers will no longer be able to use it.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm.id)} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm cursor-pointer">Delete Coupon</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast} onClose={() => setToast('')} />}
    </div>
  );
}
