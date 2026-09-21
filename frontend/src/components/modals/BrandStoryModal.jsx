import React, { useEffect } from 'react';
import { X, Award, ShieldCheck, Compass, Sparkles, HeartHandshake, MapPin, Phone, Mail } from 'lucide-react';

export const BrandStoryModal = ({ isOpen, onClose }) => {
  // Background Scroll Lock (zero scroll jump)
  useEffect(() => {
    if (isOpen) {
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalBodyOverflow = document.body.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      return () => {
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.overflow = originalBodyOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-menu select-none">
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in border border-neutral-200">
          
          {/* Hero Banner Header */}
          <div className="relative h-48 sm:h-56 bg-neutral-900 overflow-hidden">
            <img
              src="https://vintageworld.com.au/cdn/shop/files/about-us-img.jpg?v=1613560706"
              alt="Azim Crafts Heritage"
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="absolute bottom-4 left-6 right-6 text-white">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Our Heritage & Craftsmanship</span>
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold leading-tight">
                Azim Crafts
              </h2>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 sm:p-8 space-y-6 max-h-[65vh] overflow-y-auto text-neutral-700 text-xs sm:text-sm leading-relaxed">
            <div>
              <h3 className="font-heading text-lg font-bold text-neutral-900 mb-2">
                Preserving Century-Old Heritage with Modern Precision
              </h3>
              <p className="text-neutral-600 leading-relaxed">
                Welcome to <strong>Azim Crafts</strong>. What began as a lifelong passion for historical nautical exploration and medieval craftsmanship has evolved into a premier destination for collectors, reenactors, and vintage connoisseurs worldwide.
              </p>
            </div>

            {/* 3 Core Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 py-2">
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-neutral-900 text-xs">Authentic Replicas</h4>
                <p className="text-[11px] text-neutral-500 leading-normal">
                  Accurate historical blueprints replicated in solid brass, hand-carved wood, and genuine leather.
                </p>
              </div>

              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-neutral-900 text-xs">Battle-Ready Grade</h4>
                <p className="text-[11px] text-neutral-500 leading-normal">
                  Heavy 18-gauge steel, reinforced umbos, solid brass rivets, and functional antique movements.
                </p>
              </div>

              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-neutral-900 text-xs">Global Dispatch</h4>
                <p className="text-[11px] text-neutral-500 leading-normal">
                  Secure worldwide courier shipping dispatched in custom reinforced protective packaging.
                </p>
              </div>
            </div>

            {/* Story Paragraphs */}
            <div className="space-y-3 text-neutral-600 text-xs sm:text-[13px]">
              <p>
                Every piece in our collection — from our 24-inch Hand-painted Norse Viking Round Shields and British Admiralty Diving Helmets to our Hand-bound Embossed Leather Journals — is meticulously handcrafted by skilled generational artisans who use traditional casting, forging, and hand-tooling techniques.
              </p>
              <p>
                Whether you are decorating an executive office, preparing for historical reenactments, searching for an unforgettable heirloom gift, or building a world-class nautical archive, <strong>Azim Crafts</strong> brings timeless elegance straight to your doorstep.
              </p>
            </div>

            {/* Our Global Presence: Stores & Manufacturing Unit */}
            <div className="p-4 bg-[#fcfaf7] rounded-xl border border-[#ede3d2] space-y-3">
              <h4 className="font-heading text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#ae2828]" />
                <span>Our Stores & Manufacturing Unit</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 rounded-lg border border-neutral-200 space-y-1">
                  <span className="font-bold text-neutral-900 block text-[11.5px]">🇦🇺 Australia Store</span>
                  <p className="text-neutral-700 font-medium">Shrin Malik</p>
                  <p className="text-neutral-600">42a chestnut road, Auburn, 2144, NSW, Australia</p>
                  <p className="text-[#ae2828] font-semibold flex items-center gap-1 pt-0.5">
                    <Mail className="w-3 h-3" />
                    <a href="mailto:contact@azimcrafts.com" className="hover:underline">contact@azimcrafts.com</a>
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-neutral-200 space-y-1">
                  <span className="font-bold text-neutral-900 block text-[11.5px]">🇬🇧 United Kingdom Store</span>
                  <p className="text-neutral-600">01 Oswald Street, Bolton, BL3 4BA, United Kingdom</p>
                </div>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-neutral-200 text-xs flex items-center gap-2">
                <span className="text-sm">🇮🇳</span>
                <div>
                  <strong className="text-neutral-900">Manufacturing Unit & Workshop:</strong>{' '}
                  <span className="text-neutral-600">Master Artisan Foundry, Roorkee, Uttarakhand, India</span>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-[11px] text-neutral-400">
                100% Satisfaction Guarantee • 30-Day Returns
              </span>
              <button
                onClick={onClose}
                className="bg-[#1b1a1a] hover:bg-[#333333] text-white px-6 py-2 rounded-lg font-semibold text-xs transition-colors"
              >
                Close Story
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
