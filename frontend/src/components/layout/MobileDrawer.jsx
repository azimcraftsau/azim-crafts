import React, { useState } from 'react';
import { X, ChevronDown, Phone, Mail, MapPin, Sparkles, Shield, Compass, BookOpen, Layers, Instagram, Linkedin } from 'lucide-react';
import { allProductsTabs } from '../../data/navigation';
import { useCart } from '../../context/CartContext';

export const MobileDrawer = ({ isOpen, onClose }) => {
  const { navigateTo, openCategory, user, currentPage } = useCart();
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(false);

  if (!isOpen) return null;

  const handleLinkClick = (targetId, catTag) => {
    onClose();
    if (catTag) {
      openCategory(catTag);
    } else if (targetId && targetId.startsWith('#')) {
      if (currentPage !== 'home') {
        navigateTo('home');
      }
      setTimeout(() => {
        const el = document.getElementById(targetId.replace('#', ''));
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    }
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden flex font-menu select-none">
      {/* Dark Overlay */}
      <div 
        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-[85%] max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-drawer">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-[#1b1a1a] text-white">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo/logo without bg.png"
              alt="Azim Crafts"
              className="h-10 w-auto object-contain"
            />
            <span className="font-heading font-semibold text-xs tracking-wider text-[#f7eddb] uppercase">
              Azim Crafts
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-300 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1 text-xs">
          
          {/* Quick Account Link */}
          <button
            onClick={() => {
              onClose();
              navigateTo('account');
            }}
            className="w-full py-2.5 px-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg text-left font-bold text-neutral-900 flex items-center justify-between border border-neutral-200 mb-3 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-xs">
                👤
              </span>
              <span className="font-semibold text-xs text-neutral-900">
                {user ? `Hi, ${user.name?.split(' ')[0] || 'Collector'} (My Account)` : 'Customer Account / Sign In'}
              </span>
            </div>
            <span className="text-neutral-400 text-xs">→</span>
          </button>

          {/* 0. Home Link (Normal Direct Button) */}
          <button
            onClick={() => {
              onClose();
              navigateTo('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="block w-full text-left py-3 px-2 text-sm font-semibold text-neutral-900 hover:text-[#ae2828] border-b border-neutral-100 transition-colors cursor-pointer"
          >
            Home
          </button>

          {/* 1. All Products (Normal Direct Button to All Products Page with All selected) */}
          <button
            onClick={() => {
              onClose();
              openCategory('all');
            }}
            className="block w-full text-left py-3 px-2 text-sm font-semibold text-neutral-900 hover:text-[#ae2828] border-b border-neutral-100 transition-colors cursor-pointer"
          >
            All Products
          </button>

          {/* 2. Shop by Category Accordion */}
          <div className="border-b border-neutral-100 pb-1">
            <button
              onClick={() => setIsCategoryExpanded(!isCategoryExpanded)}
              className="w-full py-3 px-2 flex items-center justify-between text-left font-semibold text-sm text-neutral-900 hover:text-[#ae2828] cursor-pointer"
            >
              <span>Shop by Category</span>
              <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform ${isCategoryExpanded ? 'rotate-180 text-[#ae2828]' : ''}`} />
            </button>
            {isCategoryExpanded && (
              <div className="pl-3 pr-2 py-2 space-y-1 bg-neutral-50 rounded-lg mb-2">
                {allProductsTabs.map((tab, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleLinkClick(null, tab.tag)}
                    className="block w-full text-left py-2 px-2 text-xs font-medium text-neutral-700 hover:text-[#ae2828] hover:bg-white rounded transition-all cursor-pointer"
                  >
                    • {tab.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* 3. Medieval & Vikings Direct Link */}
          <button
            onClick={() => handleLinkClick(null, 'wooden-shields')}
            className="block w-full text-left py-3 px-2 text-sm font-medium text-neutral-800 hover:text-[#ae2828] border-b border-neutral-100 transition-colors cursor-pointer"
          >
            Medieval & Vikings
          </button>

          {/* 4. Nautical Antiques Direct Link */}
          <button
            onClick={() => handleLinkClick(null, 'vintage-compasses')}
            className="block w-full text-left py-3 px-2 text-sm font-medium text-neutral-800 hover:text-[#ae2828] border-b border-neutral-100 transition-colors cursor-pointer"
          >
            Nautical Antiques
          </button>

          {/* 5. Leather Journals Direct Link */}
          <button
            onClick={() => handleLinkClick(null, 'leather-journals')}
            className="block w-full text-left py-3 px-2 text-sm font-medium text-neutral-800 hover:text-[#ae2828] border-b border-neutral-100 transition-colors cursor-pointer"
          >
            Leather Journals
          </button>

          {/* 6. About Us Link */}
          <button
            onClick={() => handleLinkClick('#about-section')}
            className="block w-full text-left py-3 px-2 text-sm font-medium text-neutral-800 hover:text-[#ae2828] border-b border-neutral-100 transition-colors cursor-pointer"
          >
            About Us
          </button>

          {/* 7. Contact Link */}
          <button
            onClick={() => handleLinkClick('#footer-section')}
            className="block w-full text-left py-3 px-2 text-sm font-medium text-neutral-800 hover:text-[#ae2828] border-b border-neutral-100 transition-colors cursor-pointer"
          >
            Contact
          </button>

          {/* Quick Contact Box in Drawer */}
          <div className="pt-6 pb-4 space-y-2.5 text-xs text-neutral-600 border-t border-neutral-200 mt-4">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#ae2828] shrink-0" />
              <a href="mailto:contact@azimcrafts.com" className="text-neutral-800 hover:text-[#ae2828] font-medium">contact@azimcrafts.com</a>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-[#ae2828] shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-[11px]">
                <p><strong className="text-neutral-800">Australia Store:</strong> 42a chestnut road, Auburn NSW</p>
                <p><strong className="text-neutral-800">UK Store:</strong> 01 Oswald Street, Bolton BL3 4BA</p>
                <p><strong className="text-neutral-800">Manufacturing:</strong> Roorkee, Uttarakhand, India</p>
              </div>
            </div>

            {/* Social Links */}
            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://www.instagram.com/azimcrafts?stkn=eTkzc2x5YjZ2ZzZ6"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-neutral-100 hover:bg-[#ae2828] hover:text-white transition-colors text-[11px] font-medium text-neutral-700"
              >
                <Instagram className="w-3.5 h-3.5" />
                <span>Instagram</span>
              </a>
              <a
                href="https://www.linkedin.com/company/azim-crafts/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-neutral-100 hover:bg-[#0077b5] hover:text-white transition-colors text-[11px] font-medium text-neutral-700"
              >
                <Linkedin className="w-3.5 h-3.5" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer info in drawer */}
        <div className="p-3.5 bg-neutral-100 border-t border-neutral-200 text-center">
          <span className="text-[11px] text-neutral-500 font-medium flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>Azim Crafts • 100% Handcrafted</span>
          </span>
        </div>
      </div>
    </div>
  );
};
