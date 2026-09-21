import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Copy, Check, ArrowRight, ShieldCheck, Tag, Clock } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const WelcomeOfferModal = () => {
  const { showToast, applyCouponCode, user } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const intervalRef = useRef(null);

  const offers = [
    {
      id: 'first15',
      code: 'FIRST15',
      discountTag: '15% OFF',
      badgeText: 'FIRST ORDER SPECIAL',
      badgeColor: 'bg-amber-50 text-amber-900 border-amber-200',
      headline: 'GET 15% OFF\nYOUR FIRST ORDER',
      subtitle: 'Enjoy 15% OFF storewide across our entire historical collection including Medieval Armour, Viking Shields, Diving Helmets & Leather Crafts!',
      image: '/All categories/All Products/product 4/1.jpeg',
      imageTitle: 'Battle-Ready\nArmour Guard',
      imageBadge: '15% OFF STOREWIDE',
      targetSection: 'featured-leather-journals',
      ctaText: 'CLAIM 15% OFF & SHOP ALL ITEMS →'
    },
    {
      id: 'viking20',
      code: 'VIKING20',
      discountTag: '20% OFF',
      badgeText: 'FLASH REENACTMENT SALE',
      badgeColor: 'bg-red-50 text-red-900 border-red-200',
      headline: '20% OFF BATTLE-READY\nVIKING SHIELDS & WEAPONS',
      subtitle: 'Unlock an instant 20% discount on 18-gauge steel Viking round shields, Thor Mjolnir hammers & Crusader broadswords.',
      image: '/All categories/All Products/product 1/1.jpeg',
      imageTitle: 'Authentic Viking\nRound Shields',
      imageBadge: '20% FLASH DISCOUNT',
      targetSection: 'warriors-section',
      ctaText: 'UNLOCK 20% OFF SHIELDS →'
    },
    {
      id: 'journal25',
      code: 'JOURNAL25',
      discountTag: '$25 OFF',
      badgeText: 'ARTISAN LEATHER SPECIAL',
      badgeColor: 'bg-amber-50 text-amber-900 border-amber-200',
      headline: '$25 OFF EMBOSSED\nGENUINE LEATHER JOURNALS',
      subtitle: 'Get $25 OFF our hand-bound buffalo leather grimoires & diaries featuring handmade deckle-edge cotton parchment.',
      image: '/All categories/All Products/product 10/1.jpeg',
      imageTitle: 'Handmade Embossed\nLeather Diaries',
      imageBadge: '$25 OFF CRAFTS',
      targetSection: 'featured-leather-journals',
      ctaText: 'GET $25 OFF LEATHER JOURNALS →'
    },
    {
      id: 'maritimefree',
      code: 'MARITIMEFREE',
      discountTag: 'FREE GIFT',
      badgeText: 'COLLECTOR BUNDLE BONUS',
      badgeColor: 'bg-blue-50 text-blue-900 border-blue-200',
      headline: 'FREE NAUTICAL COMPASS\nWITH EVERY SEXTANT',
      subtitle: 'Receive a complimentary solid brass pocket compass ($44 USD value) on every maritime sextant or diving helmet purchase.',
      image: '/All categories/All Products/product 11/1.jpg',
      imageTitle: 'Solid Brass\nNautical Sextants',
      imageBadge: 'FREE BONUS GIFT',
      targetSection: 'compasses-section',
      ctaText: 'CLAIM FREE NAUTICAL GIFT →'
    }
  ];

  // 1. Popup trigger 2.2 seconds after page loads (Only for NEW users who haven't ordered yet!)
  useEffect(() => {
    let isCancelled = false;

    const checkAndTriggerPopup = async () => {
      try {
        const userEmail = (user?.email || '').toLowerCase().trim();

        // Check real orders from database
        let orders = [];
        try {
          const res = await fetch('/api/orders');
          if (res.ok) {
            orders = await res.json();
          }
        } catch (e) {}

        // If database has orders for this user, they are an existing buyer -> do NOT show!
        if (userEmail && Array.isArray(orders) && orders.length > 0) {
          const hasPastOrderInDB = orders.some(o => 
            (o.customerEmail && o.customerEmail.toLowerCase().trim() === userEmail)
          );
          if (hasPastOrderInDB) {
            setIsOpen(false);
            return;
          }
        }

        // If database is clean or user has no past orders, reset any stale flags
        if (!userEmail || orders.length === 0) {
          localStorage.removeItem('vw_user_has_ordered');
          if (userEmail) localStorage.removeItem('vw_user_has_ordered_' + userEmail);
        }

        // Check if user has explicitly placed an order
        if (userEmail && localStorage.getItem('vw_user_has_ordered_' + userEmail) === 'true') {
          setIsOpen(false);
          return;
        }

        // Delay 2.2 seconds then open popup for new visitors
        setTimeout(() => {
          if (!isCancelled) {
            setIsOpen(true);
          }
        }, 2200);

      } catch (err) {
        setTimeout(() => {
          if (!isCancelled) setIsOpen(true);
        }, 2200);
      }
    };

    checkAndTriggerPopup();

    return () => {
      isCancelled = true;
    };
  }, [user]);

  // 2. Lock background scrolling when offer popup is open
  useEffect(() => {
    if (isOpen) {
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalBodyOverflow = document.body.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';

      const preventDefaultTouch = (e) => {
        if (!e.target.closest('.modal-content-scroll')) {
          e.preventDefault();
        }
      };
      document.addEventListener('touchmove', preventDefaultTouch, { passive: false });

      return () => {
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.overflow = originalBodyOverflow;
        document.removeEventListener('touchmove', preventDefaultTouch);
      };
    }
  }, [isOpen]);

  const activeOffer = offers[currentOfferIndex];

  const handleClose = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem('vw_welcome_offer_shown', 'true');
    } catch (e) {}
  };

  const handleClaimOffer = () => {
    setIsCopied(true);
    try {
      navigator.clipboard.writeText(activeOffer.code);
      sessionStorage.setItem('vw_welcome_offer_shown', 'true');
    } catch (e) {}
    applyCouponCode(activeOffer.code);
    handleClose();

    // Smoothly scroll to the featured section
    setTimeout(() => {
      const el = document.getElementById(activeOffer.targetSection) || document.getElementById('categories-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 font-menu select-none">
      {/* Dark Overlay */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={handleClose}
      />

      {/* ================= MOBILE POPUP UI (Compact, Beautiful & Fits Perfectly) ================= */}
      <div className="block md:hidden relative bg-white w-[90%] max-w-[340px] rounded-2xl shadow-2xl overflow-hidden animate-fade-in border border-neutral-200 z-10 flex flex-col mx-auto">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-2.5 right-2.5 z-30 w-7 h-7 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors shadow-lg cursor-pointer"
          aria-label="Close offer modal"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Mobile Photo Banner (Compact height 150px) */}
        <div className="relative w-full h-38 bg-[#111111] overflow-hidden flex items-center justify-center shrink-0">
          <img
            src={activeOffer.image}
            alt={activeOffer.imageTitle}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30" />

          {/* Floating Pill Badge */}
          <div className="absolute top-2.5 left-2.5 z-20">
            <span className="bg-[#ae2828] text-white text-[9.5px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-lg border border-white/20">
              {activeOffer.discountTag}
            </span>
          </div>

          <div className="absolute bottom-2 left-3 right-3 z-20 text-white">
            <p className="font-heading text-xs font-semibold tracking-wide text-white drop-shadow-md truncate">
              {activeOffer.imageTitle.replace('\n', ' - ')}
            </p>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="p-3.5 sm:p-4 text-center space-y-2.5 bg-white flex-1">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200/80 text-amber-900 px-2.5 py-0.5 rounded-full text-[9.5px] font-bold uppercase tracking-wider mx-auto">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>{activeOffer.badgeText}</span>
            </div>

            <h2 className="font-heading text-base font-extrabold text-neutral-900 leading-tight tracking-wide pt-0.5">
              {activeOffer.headline}
            </h2>

            <p className="text-[11px] text-neutral-600 font-medium px-1 leading-snug line-clamp-2">
              {activeOffer.subtitle}
            </p>
          </div>

          {/* Coupon Code Box */}
          <div 
            onClick={handleClaimOffer}
            className="group flex items-center justify-between bg-[#fcfaf7] hover:bg-[#f5efe6] border-2 border-dashed border-[#d8cdbc] hover:border-[#ae2828] rounded-lg p-2 px-3 transition-all duration-200 cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-[#ae2828]" />
              <div className="text-left">
                <span className="text-[8.5px] font-bold text-neutral-400 uppercase tracking-widest block leading-none mb-0.5">
                  Coupon Code
                </span>
                <span className="font-mono text-sm font-black tracking-widest text-neutral-900 leading-none">
                  {activeOffer.code}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-bold text-[#ae2828] group-hover:text-red-700 bg-white px-2 py-1 rounded border border-neutral-200 shadow-2xs">
              {isCopied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700 text-[10px]">COPIED</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>COPY</span>
                </>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-1 pt-0.5">
            <button
              onClick={handleClaimOffer}
              className="w-full bg-[#ae2828] hover:bg-[#8f1f1f] active:scale-[0.99] text-white font-bold text-[11px] py-2.5 px-4 rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5 tracking-wider uppercase cursor-pointer"
            >
              <span>{activeOffer.ctaText}</span>
            </button>

            <button
              onClick={handleClose}
              className="w-full text-center text-[10.5px] font-semibold text-neutral-400 hover:text-neutral-700 transition-colors py-0.5 cursor-pointer"
            >
              No thanks, continue browsing
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="pt-1.5 border-t border-neutral-100 flex items-center justify-center gap-3 text-[9.5px] text-neutral-500 font-medium">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>100% Authentic</span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>Worldwide Express</span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= DESKTOP POPUP UI (Compact 2-Column Split Layout) ================= */}
      <div className="hidden md:grid relative bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in border border-neutral-200 z-10 grid-cols-12 max-h-[90vh]">
        
        {/* Close Button Top Right */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-30 w-7 h-7 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-colors shadow-lg cursor-pointer"
          aria-label="Close offer modal"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Left Column: Product Showcase Photo */}
        <div className="col-span-5 relative bg-[#111111] overflow-hidden flex flex-col justify-between p-4 text-white min-h-[350px]">
          <img
            src={activeOffer.image}
            alt={activeOffer.imageTitle}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/40" />

          {/* Top Pill Badge */}
          <div className="relative z-10">
            <span className="bg-[#ae2828] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg border border-white/20">
              {activeOffer.imageBadge}
            </span>
          </div>

          {/* Bottom Title & Counter */}
          <div className="relative z-10 space-y-1">
            <p className="font-heading text-sm font-semibold tracking-wide leading-snug drop-shadow-md whitespace-pre-line text-white">
              {activeOffer.imageTitle}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-neutral-300">
              <Clock className="w-3 h-3 text-[#e8ce9f]" />
              <span>Limited First Order Deal</span>
            </div>
          </div>
        </div>

        {/* Right Column: Discount Coupon Details */}
        <div className="col-span-7 p-5 lg:p-6 flex flex-col justify-between bg-white text-center">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mx-auto">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>{activeOffer.badgeText}</span>
            </div>

            <h2 className="font-heading text-lg lg:text-xl font-extrabold text-neutral-900 leading-tight tracking-wide whitespace-pre-line pt-1.5">
              {activeOffer.headline}
            </h2>

            <p className="text-[11.5px] text-neutral-600 font-medium mt-1 leading-relaxed px-1">
              {activeOffer.subtitle}
            </p>
          </div>

          {/* Coupon Code Copy Box */}
          <div 
            onClick={handleClaimOffer}
            className="group my-3 flex items-center justify-between bg-[#fcfaf7] hover:bg-[#f5efe6] border-2 border-dashed border-[#d8cdbc] hover:border-[#ae2828] rounded-xl p-2.5 px-3.5 transition-all duration-200 cursor-pointer shadow-2xs"
          >
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#ae2828]" />
              <div className="text-left">
                <span className="text-[8.5px] font-bold text-neutral-400 uppercase tracking-widest block leading-none mb-0.5">
                  Coupon Code
                </span>
                <span className="font-mono text-sm lg:text-base font-black tracking-widest text-neutral-900 leading-none">
                  {activeOffer.code}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-bold text-[#ae2828] group-hover:text-red-700 bg-white px-2.5 py-1 rounded-md border border-neutral-200 shadow-2xs">
              {isCopied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700 text-[10.5px]">COPIED</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>COPY</span>
                </>
              )}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-1.5">
            <button
              onClick={handleClaimOffer}
              className="w-full bg-[#ae2828] hover:bg-[#8f1f1f] active:scale-[0.99] text-white font-bold text-xs py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 tracking-wider uppercase cursor-pointer"
            >
              <span>{activeOffer.ctaText}</span>
            </button>

            <button
              onClick={handleClose}
              className="w-full text-center text-[10.5px] font-semibold text-neutral-400 hover:text-neutral-700 transition-colors py-0.5 cursor-pointer"
            >
              No thanks, continue browsing
            </button>
          </div>

          {/* Guarantee Badges Footer */}
          <div className="pt-2 border-t border-neutral-100 flex items-center justify-center gap-4 text-[10px] text-neutral-500 font-medium">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Authentic Guarantee</span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Express Worldwide Delivery</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
