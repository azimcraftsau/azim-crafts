import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, ArrowUp, ArrowDown, Video, 
  Image, Sparkles, CheckCircle2, Eye, LayoutTemplate, 
  Smartphone, Monitor, Megaphone, Save, Check, X, 
  ExternalLink, Play, Layers
, Loader2} from 'lucide-react';
import { allProducts } from '../../data/products';
import { getHeroSlides, saveHeroSlidesToDB, getStoreSettings, saveStoreSettingsToDB } from '../../lib/cloudflareService';

export const DEFAULT_HERO_SLIDES = [
  {
    id: 1,
    title: 'Discover Our Vintage\nCollection',
    subtitle: 'Authentic Nautical Antiques, Battle-Ready Medieval Armour & Fine Goods',
    badgeText: 'HANDCRAFTED HISTORICAL HERITAGE',
    btnText: 'Shop Now',
    targetProductId: 'product-1',
    desktopVideo: '/desktop banner/video1.mp4',
    mobileVideo: '/mobile banner/video1.mp4',
    active: true
  },
  {
    id: 2,
    title: 'Battle-Ready Viking\nRound Shields & Swords',
    subtitle: 'Hand-painted Norse dragon knotwork with heavy metal rim & center umbo',
    badgeText: '18-GAUGE STEEL & SOLID WOOD',
    btnText: 'Explore Viking Shields',
    targetProductId: 'product-1',
    desktopVideo: '/desktop banner/video2.mp4',
    mobileVideo: '/mobile banner/video2.mp4',
    active: true
  },
  {
    id: 3,
    title: 'Forged Knight Armour\n& Centurion Helmets',
    subtitle: 'Authentic wearable historical reproductions for cosplay, collectors & decor',
    badgeText: 'LEGENDARY MEDIEVAL REENACTMENT',
    btnText: 'View Warriors Collection',
    targetProductId: 'product-3',
    desktopVideo: '/desktop banner/video3.mp4',
    mobileVideo: '/mobile banner/video3.mp4',
    active: true
  },
  {
    id: 4,
    title: 'Thor Mjolnir Hammers\n& Medieval Weaponry',
    subtitle: 'Solid steel casting with carved ashwood handles and Norse rune engravings',
    badgeText: 'HAND-FORGED CARBON STEEL',
    btnText: 'Explore Mjolnir Collection',
    targetProductId: 'product-2',
    desktopVideo: '/desktop banner/video4.mp4',
    mobileVideo: '/mobile banner/video4.mp4',
    active: true
  },
  {
    id: 5,
    title: 'Solid Brass Compasses\n& Handcrafted Journals',
    subtitle: 'Navigational sextants, diving helmets and 100% genuine buffalo leather crafts',
    badgeText: 'AUTHENTIC MARITIME & LEATHER',
    btnText: 'Discover Artisan Goods',
    targetProductId: 'product-11',
    desktopVideo: '/desktop banner/video5.mp4',
    mobileVideo: '/mobile banner/video5.mp4',
    active: true
  },
  {
    id: 6,
    title: 'Master Artisans &\nHandcrafted Heritage',
    subtitle: 'Generational craftsmen shaping bespoke leather journals, heraldic shields, armour & artisan chandeliers',
    badgeText: 'ORIGINAL ARTISAN ATELIER',
    btnText: 'Explore Workshop Creations',
    targetProductId: 'product-14',
    desktopVideo: '/desktop banner/video6.mp4',
    mobileVideo: '',
    active: true
  }
];

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 bg-gray-900 text-white px-5 py-3.5 rounded-xl shadow-2xl text-sm font-medium animate-fade-in border border-gray-700 font-menu">
      <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
      <span>{msg}</span>
    </div>
  );
}

// Add/Edit Slide Modal
function SlideModal({ slide, isNew, onSave, onClose }) {
  const [form, setForm] = useState(slide || {
    id: Date.now(),
    title: 'New Artisan Collection\nHandcrafted Excellence',
    subtitle: 'Discover authentic historical replicas handcrafted in Roorkee workshop',
    badgeText: 'MASTER ARTISAN SERIES',
    btnText: 'Explore Collection',
    targetProductId: 'product-1',
    desktopVideo: '/desktop banner/video1.mp4',
    mobileVideo: '/mobile banner/video1.mp4',
    active: true
  });

  const inputCls = 'w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs bg-white focus:ring-2 focus:ring-[#c8924b] focus:border-transparent outline-none transition-all';
  const labelCls = 'block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-menu">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-200 animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-neutral-50 shrink-0">
          <div className="flex items-center gap-2">
            <Video size={18} className="text-[#c8924b]" />
            <h3 className="text-base font-bold text-gray-900">
              {isNew ? 'Add New Hero Banner Slide' : 'Edit Banner Slide'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-200 text-gray-500 transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Badge Text (Top Pill)</label>
              <input
                className={inputCls}
                value={form.badgeText}
                onChange={(e) => setForm({ ...form, badgeText: e.target.value })}
                placeholder="e.g. 18-GAUGE STEEL & SOLID WOOD"
              />
            </div>
            <div>
              <label className={labelCls}>Button Text</label>
              <input
                className={inputCls}
                value={form.btnText}
                onChange={(e) => setForm({ ...form, btnText: e.target.value })}
                placeholder="e.g. Explore Viking Shields"
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Headline Title (Use \n for line breaks)</label>
            <textarea
              rows={2}
              className={inputCls}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Battle-Ready Viking\nRound Shields & Swords"
            />
          </div>

          <div>
            <label className={labelCls}>Subtitle Description</label>
            <input
              className={inputCls}
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              placeholder="e.g. Hand-painted Norse dragon knotwork with heavy metal rim..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Desktop Video / Image */}
            <div className="space-y-2">
              <label className={labelCls}>Desktop Video / Image *</label>
              <input
                className={inputCls}
                value={form.desktopVideo}
                onChange={(e) => setForm({ ...form, desktopVideo: e.target.value })}
                placeholder="Paste Cloudflare R2 URL or file path..."
              />
              <div className="flex items-center gap-2">
                <label className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-dashed border-gray-300 hover:border-[#c8924b] bg-gray-50 hover:bg-amber-50/50 text-xs font-bold text-gray-700 hover:text-[#c8924b] transition-all cursor-pointer">
                  <Video size={13} />
                  <span>📁 Choose Desktop File</span>
                  <input
                    type="file"
                    accept="video/*,image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const blobUrl = URL.createObjectURL(file);
                        setForm({ ...form, desktopVideo: blobUrl });
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Mobile Video / Image */}
            <div className="space-y-2">
              <label className={labelCls}>Mobile Vertical Video (9:16) *</label>
              <input
                className={inputCls}
                value={form.mobileVideo}
                onChange={(e) => setForm({ ...form, mobileVideo: e.target.value })}
                placeholder="Paste Cloudflare R2 URL or file path..."
              />
              <div className="flex items-center gap-2">
                <label className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-dashed border-gray-300 hover:border-[#c8924b] bg-gray-50 hover:bg-amber-50/50 text-xs font-bold text-gray-700 hover:text-[#c8924b] transition-all cursor-pointer">
                  <Smartphone size={13} />
                  <span>📁 Choose Mobile File</span>
                  <input
                    type="file"
                    accept="video/*,image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const blobUrl = URL.createObjectURL(file);
                        setForm({ ...form, mobileVideo: blobUrl });
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className={labelCls}>Target Product on Button Click</label>
            <select
              className={inputCls}
              value={form.targetProductId}
              onChange={(e) => setForm({ ...form, targetProductId: e.target.value })}
            >
              {allProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} (${p.price} USD)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="activeSlide"
              checked={form.active !== false}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
              className="w-4 h-4 text-[#c8924b] rounded focus:ring-[#c8924b]"
            />
            <label htmlFor="activeSlide" className="text-xs font-bold text-gray-700 cursor-pointer">
              Enable this slide on live storefront
            </label>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all hover:opacity-95 cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #c8924b, #e8b06a)', color: '#0f1117' }}
          >
            Save Slide
          </button>
        </div>

      </div>
    </div>
  );
}

export function AdminBanners() {
  const [loading, setLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('banners'); // 'banners' | 'announcement'
  const [slides, setSlides] = useState([]);
  const [announcementText, setAnnouncementText] = useState('');
  const [toast, setToast] = useState('');
  const [editingSlide, setEditingSlide] = useState(null);
  const [isNewSlide, setIsNewSlide] = useState(false);

  const loadData = async () => {
    try {
      const [slidesData, settings] = await Promise.all([
        getHeroSlides(),
        getStoreSettings()
      ]);
      if (Array.isArray(slidesData) && slidesData.length > 0) {
        setSlides(slidesData);
      } else {
        setSlides(DEFAULT_HERO_SLIDES);
      }
      if (settings && settings.announcementText) {
        setAnnouncementText(settings.announcementText);
      }
    } catch {
      setSlides(DEFAULT_HERO_SLIDES);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('vw_slides_updated', loadData);
    window.addEventListener('vw_announcement_updated', loadData);
    return () => {
      window.removeEventListener('vw_slides_updated', loadData);
      window.removeEventListener('vw_announcement_updated', loadData);
    };
  }, []);

  const saveSlides = async (newSlides) => {
    setSlides(newSlides);
    await saveHeroSlidesToDB(newSlides);
  };

  const handleSaveAnnouncement = async () => {
    const clean = announcementText.trim() || 'Free Worldwide Express Shipping Over $200 USD';
    setAnnouncementText(clean);
    await saveStoreSettingsToDB({ announcementText: clean });
    setToast('Announcement Bar updated live and saved to database!');
  };

  const handleSaveSlideModal = (slide) => {
    if (isNewSlide) {
      const updated = [...slides, { ...slide, id: Date.now() }];
      saveSlides(updated);
      setToast('New banner slide added!');
    } else {
      const updated = slides.map(s => s.id === slide.id ? slide : s);
      saveSlides(updated);
      setToast('Banner slide updated!');
    }
    setEditingSlide(null);
    setIsNewSlide(false);
  };

  const handleDeleteSlide = (id) => {
    if (slides.length <= 1) {
      setToast('You must have at least 1 active slide in the banner.');
      return;
    }
    if (!window.confirm('Delete this banner slide?')) return;
    const updated = slides.filter(s => s.id !== id);
    saveSlides(updated);
    setToast('Slide deleted.');
  };

  const moveSlide = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= slides.length) return;
    const copy = [...slides];
    const item = copy.splice(index, 1)[0];
    copy.splice(targetIdx, 0, item);
    saveSlides(copy);
    setToast('Banner order updated.');
  };

  const toggleSlideActive = (id) => {
    const updated = slides.map(s => s.id === id ? { ...s, active: s.active === false ? true : false } : s);
    saveSlides(updated);
    setToast('Slide visibility toggled.');
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Banners &amp; Storefront Media</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your desktop &amp; mobile hero video sliders and top announcement bar ticker.
          </p>
        </div>

        {activeSubTab === 'banners' && (
          <button
            onClick={() => {
              setIsNewSlide(true);
              setEditingSlide({
                id: Date.now(),
                title: 'New Warrior Shield\n& Weapon Collection',
                subtitle: 'Authentic battle-ready medieval replicas handcrafted in solid carbon steel',
                badgeText: 'LIMITED EDITION REPLICA',
                btnText: 'Shop New Arrivals',
                targetProductId: 'product-1',
                desktopVideo: '/desktop banner/video1.mp4',
                mobileVideo: '/mobile banner/video1.mp4',
                active: true
              });
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all hover:opacity-95 cursor-pointer self-start sm:self-auto"
            style={{ background: 'linear-gradient(135deg, #c8924b, #e8b06a)', color: '#0f1117' }}
          >
            <Plus size={16} />
            <span>+ Add New Banner Slide / Video</span>
          </button>
        )}
      </div>

      {/* Top Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-3">
        <button
          onClick={() => setActiveSubTab('banners')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'banners'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-neutral-50'
          }`}
        >
          <LayoutTemplate size={15} />
          <span>Desktop &amp; Mobile Hero Banners ({slides.length} Videos)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('announcement')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'announcement'
              ? 'bg-neutral-900 text-white shadow-xs'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-neutral-50'
          }`}
        >
          <Megaphone size={15} />
          <span>Announcement Bar Ticker</span>
        </button>
      </div>

      {/* ================= SUB-TAB 1: HERO BANNERS & VIDEOS ================= */}
      {activeSubTab === 'banners' && (
        <div className="space-y-4">
          
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white rounded-xl text-[#c8924b] shadow-xs">
                <Video size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">Hero Slider Configuration</h4>
                <p className="text-[11px] text-gray-600">
                  Each slide supports 1080p Desktop Video + 9:16 Mobile Vertical Video with headline lore and direct purchase link.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100/80 px-3 py-1 rounded-lg">
              {slides.filter(s => s.active !== false).length} Active on Live Site
            </span>
          </div>

          {/* Slides List */}
          <div className="space-y-3">
            {slides.map((slide, idx) => (
              <div
                key={slide.id}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-gray-300 transition-all"
              >
                
                {/* Left: Slide Index & Preview */}
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="flex flex-col items-center justify-center gap-1 shrink-0">
                    <button
                      onClick={() => moveSlide(idx, -1)}
                      disabled={idx === 0}
                      className="p-1 rounded hover:bg-gray-100 disabled:opacity-20 text-gray-500 cursor-pointer"
                      title="Move Up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <span className="text-xs font-black text-gray-900 font-mono">#{idx + 1}</span>
                    <button
                      onClick={() => moveSlide(idx, 1)}
                      disabled={idx === slides.length - 1}
                      className="p-1 rounded hover:bg-gray-100 disabled:opacity-20 text-gray-500 cursor-pointer"
                      title="Move Down"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>

                  {/* Video Thumbnail / Icon */}
                  <div className="w-20 h-14 rounded-xl bg-neutral-900 text-white flex flex-col items-center justify-center shrink-0 overflow-hidden relative border border-neutral-800">
                    <Video size={18} className="text-[#c8924b]" />
                    <span className="text-[9px] font-mono text-gray-400 mt-0.5">Slide {idx + 1}</span>
                  </div>

                  {/* Text Lore Details */}
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#c8924b] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {slide.badgeText}
                      </span>
                      {slide.active === false && (
                        <span className="text-[9.5px] font-bold uppercase text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                          Disabled
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 truncate whitespace-pre-line">
                      {slide.title.replace('\n', ' ')}
                    </h3>
                    <p className="text-xs text-gray-500 truncate max-w-md">
                      {slide.subtitle}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-400 font-mono pt-0.5">
                      <span className="truncate">🖥️ {slide.desktopVideo.split('/').pop()}</span>
                      <span className="truncate">📱 {slide.mobileVideo.split('/').pop()}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => toggleSlideActive(slide.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      slide.active !== false
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {slide.active !== false ? 'Live Active' : 'Hidden'}
                  </button>

                  <button
                    onClick={() => {
                      setIsNewSlide(false);
                      setEditingSlide(slide);
                    }}
                    className="p-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-amber-50 hover:text-[#c8924b] hover:border-[#c8924b] transition-all cursor-pointer"
                    title="Edit Slide"
                  >
                    <Edit size={16} />
                  </button>

                  <button
                    onClick={() => handleDeleteSlide(slide.id)}
                    className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                    title="Delete Slide"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

      {/* ================= SUB-TAB 2: ANNOUNCEMENT BAR TICKER ================= */}
      {activeSubTab === 'announcement' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-gray-900">Announcement Bar Customization</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              This text scrolls continuously in the top marquee ticker across all storefront pages.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Announcement Message *
              </label>
              <textarea
                rows={2}
                className="w-full border border-gray-300 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-[#c8924b] focus:border-transparent outline-none bg-neutral-50 focus:bg-white"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                placeholder="e.g. Free Worldwide Express Shipping Over $200 USD"
              />
            </div>

            {/* Live Ticker Preview */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Live Storefront Marquee Preview:
              </label>
              <div className="w-full bg-[#faecd7] text-[#2c2b2b] py-2.5 px-4 rounded-xl border border-[#ebdcca] overflow-hidden">
                <div className="flex items-center gap-6 text-xs font-semibold text-neutral-900">
                  <span>✨ {announcementText || 'Free Worldwide Express Shipping Over $200 USD'} •</span>
                  <span>✨ {announcementText || 'Free Worldwide Express Shipping Over $200 USD'} •</span>
                  <span>✨ {announcementText || 'Free Worldwide Express Shipping Over $200 USD'}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveAnnouncement}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all hover:opacity-95 cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #c8924b, #e8b06a)', color: '#0f1117' }}
              >
                <Save size={15} />
                <span>Save Announcement Bar</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Slide Modal */}
      {editingSlide && (
        <SlideModal
          slide={editingSlide}
          isNew={isNewSlide}
          onSave={handleSaveSlideModal}
          onClose={() => {
            setEditingSlide(null);
            setIsNewSlide(false);
          }}
        />
      )}

      {toast && <Toast msg={toast} onClose={() => setToast('')} />}
    </div>
  );
}
