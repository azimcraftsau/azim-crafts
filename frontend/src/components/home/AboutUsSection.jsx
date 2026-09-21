import React, { useState } from 'react';
import { ArrowRight, Compass, Shield, Clock, Anchor } from 'lucide-react';
import { BrandStoryModal } from '../modals/BrandStoryModal';

export const AboutUsSection = () => {
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);

  return (
    <section id="about-section" className="py-14 md:py-20 bg-white border-b border-neutral-100 font-menu">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Authentic Banner Image */}
          <div className="lg:col-span-5">
            <div className="relative rounded-xl overflow-hidden shadow-xl bg-neutral-100 border border-neutral-200 group">
              <img
                src="/about/about'.jpg_2K_202608280338.jpeg"
                alt="About Azim Crafts"
                className="w-full h-auto object-cover group-hover:scale-103 transition-transform duration-700 max-h-[560px]"
                loading="lazy"
                onError={(e) => {
                  e.target.src = "/about/" + encodeURIComponent("about'.jpg_2K_202608280338.jpeg");
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#f7eddb]">
                  Master Artisans Workshop
                </span>
                <p className="font-heading text-lg font-bold">100% Handcrafted Heritage & Fine Goods</p>
              </div>
            </div>
          </div>

          {/* Right Column: Copy & Links */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-[11px] font-bold text-[#ae2828] uppercase tracking-[0.2em] block mb-1">
                Our Story & Heritage
              </span>
              <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-normal text-neutral-900 tracking-wide leading-tight">
                About Us
              </h2>
            </div>

            <div className="space-y-4 text-sm md:text-base text-neutral-700 leading-relaxed">
              <p>
                Looking for extraordinary gift ideas? How about an antique style brass telescope or compass? Or perhaps a battle-ready Norse Viking round shield or Roman Centurion helmet? If you’re searching for timeless handcrafted pieces for someone hard to buy for, we are here to help.
              </p>

              <p>
                From our full-sized decorative deep sea diving helmets and nautical themed table clocks to our antique reproduction pocket compasses, telescopes, armours and hand-bound leather journals; you’ll find hundreds of unique treasures right here at <strong>Azim Crafts</strong>.
              </p>
            </div>

            {/* Feature Highlights Matrix */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200/80 text-center">
                <Compass className="w-5 h-5 mx-auto text-[#ae2828] mb-1.5" />
                <span className="text-xs font-bold text-neutral-900 block">Nautical</span>
                <span className="text-[10px] text-neutral-500">Instruments</span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200/80 text-center">
                <Shield className="w-5 h-5 mx-auto text-[#ae2828] mb-1.5" />
                <span className="text-xs font-bold text-neutral-900 block">Medieval</span>
                <span className="text-[10px] text-neutral-500">Armor & Shields</span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200/80 text-center">
                <Clock className="w-5 h-5 mx-auto text-[#ae2828] mb-1.5" />
                <span className="text-xs font-bold text-neutral-900 block">Antique</span>
                <span className="text-[10px] text-neutral-500">Clocks & Decor</span>
              </div>
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200/80 text-center">
                <Anchor className="w-5 h-5 mx-auto text-[#ae2828] mb-1.5" />
                <span className="text-xs font-bold text-neutral-900 block">Fast Dispatch</span>
                <span className="text-[10px] text-neutral-500">Worldwide Express</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsStoryModalOpen(true)}
                className="inline-flex items-center gap-2 bg-[#1b1a1a] hover:bg-[#333333] text-white px-7 py-3 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
              >
                <span>Read Full Story</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Brand Story Modal */}
      <BrandStoryModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
      />
    </section>
  );
};
