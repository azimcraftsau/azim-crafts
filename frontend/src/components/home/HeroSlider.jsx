import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Shield, Compass, Hammer, Sword } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { allProducts } from '../../data/products';
import { getHeroSlides } from '../../lib/cloudflareService';

const DEFAULT_HERO_SLIDES = [
  {
    id: 1,
    desktopVideo: '/desktop banner/video1.mp4',
    desktopPoster: '/desktop banner/poster1.webp',
    mobileVideo: '/mobile banner/video1.mp4',
    mobilePoster: '/mobile banner/poster1.webp',
    badgeText: 'MUSEUM REPRODUCTION ARMOUR',
    title: 'Handcrafted Medieval Knight\nFull Armour Suits',
    subtitle: '18-gauge battle-ready steel plate armour, wearable warrior costumes & forged display sets',
    btnText: 'Explore Armour Suits',
    targetProductId: 'product-3',
    btnColor: 'bg-[#c8924b] hover:bg-[#b57f38]'
  },
  {
    id: 2,
    desktopVideo: '/desktop banner/video2.mp4',
    desktopPoster: '/desktop banner/poster2.webp',
    mobileVideo: '/mobile banner/video2.mp4',
    mobilePoster: '/mobile banner/poster2.webp',
    badgeText: 'HAND-CARVED SOLID HARDWOOD',
    title: 'Battle-Ready Viking\nWooden Round Shields',
    subtitle: 'Authentic Norse Celtic knotwork, heavy steel rims & hand-forged center umbo bosses',
    btnText: 'Explore Wooden Shields',
    targetProductId: 'product-47',
    btnColor: 'bg-[#c8924b] hover:bg-[#b57f38]'
  },
  {
    id: 3,
    desktopVideo: '/desktop banner/video3.mp4',
    desktopPoster: '/desktop banner/poster3.webp',
    mobileVideo: '/mobile banner/video3.mp4',
    mobilePoster: '/mobile banner/poster3.webp',
    badgeText: 'HAND-FORGED WROUGHT IRON',
    title: 'Vintage Medieval Chandeliers\n& Artisan Iron Pendants',
    subtitle: 'Gothic ring frames, candle-style lighting & rustic farmhouse iron ceiling lamps',
    btnText: 'Explore Chandeliers',
    targetProductId: 'product-66',
    btnColor: 'bg-[#c8924b] hover:bg-[#b57f38]'
  },
  {
    id: 4,
    desktopVideo: '/desktop banner/video4.mp4',
    desktopPoster: '/desktop banner/poster4.webp',
    mobileVideo: '/mobile banner/video4.mp4',
    mobilePoster: '/mobile banner/poster4.webp',
    badgeText: 'HAND-FORGED CARBON STEEL',
    title: 'Thor Mjolnir Hammers\n& Medieval Weaponry',
    subtitle: 'Solid steel casting with carved ashwood handles and Norse rune engravings',
    btnText: 'Explore Mjolnir Collection',
    targetProductId: 'product-2',
    btnColor: 'bg-[#c8924b] hover:bg-[#b57f38]'
  },
  {
    id: 5,
    desktopVideo: '/desktop banner/video5.mp4',
    desktopPoster: '/desktop banner/poster5.webp',
    mobileVideo: '',
    mobilePoster: '',
    badgeText: 'ARTICULATED 18-GAUGE STEEL',
    title: 'Handcrafted Steel Pauldrons\n& Articulated Armour',
    subtitle: '18-gauge solid carbon steel pauldrons, articulated knight armor plates & battle-ready protection',
    btnText: 'Explore Pauldrons',
    targetProductId: 'product-33',
    btnColor: 'bg-[#c8924b] hover:bg-[#b57f38]'
  },
  {
    id: 6,
    desktopVideo: '/desktop banner/video6.mp4',
    desktopPoster: '/desktop banner/poster6.webp',
    mobileVideo: '/mobile banner/video5.mp4',
    mobilePoster: '/mobile banner/poster5.webp',
    badgeText: 'BESPOKE ARTISAN WORKSHOP',
    title: 'Bespoke Custom Creations\n& Historical Artisanship',
    subtitle: 'We craft custom armour, heraldic shields, weapons & nautical antiquities tailored to your vision',
    btnText: 'Explore All Products',
    targetProductId: 'all-products',
    btnColor: 'bg-[#c8924b] hover:bg-[#b57f38]'
  }
];

export const HeroSlider = () => {
  const { setQuickViewProduct, openCategory, products } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState(DEFAULT_HERO_SLIDES);

  const desktopVideoRef = useRef(null);
  const mobileVideoRef = useRef(null);
  
  // Touch swipe refs for mobile reel sliding
  const touchStartXRef = useRef(0);
  const touchEndXRef = useRef(0);

  const loadSlides = async () => {
    try {
      const data = await getHeroSlides();
      if (Array.isArray(data) && data.length > 0) {
        const activeOnly = data.filter(s => s.active !== false);
        setSlides(activeOnly.length > 0 ? activeOnly : DEFAULT_HERO_SLIDES);
        return;
      }
    } catch {}
    setSlides(DEFAULT_HERO_SLIDES);
  };

  useEffect(() => {
    loadSlides();
    window.addEventListener('vw_slides_updated', loadSlides);
    window.addEventListener('focus', loadSlides);
    return () => {
      window.removeEventListener('vw_slides_updated', loadSlides);
      window.removeEventListener('focus', loadSlides);
    };
  }, []);

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Phone screen has strictly 5 slides (video1 to video5), desktop displays all configured slides
  const displaySlides = isMobile
    ? slides.filter(s => Boolean(s.mobileVideo)).slice(0, 5)
    : slides;

  const totalSlides = displaySlides.length || 1;

  // Defer pre-buffering next slide to prevent bandwidth competition on initial load
  useEffect(() => {
    if (!Array.isArray(displaySlides) || displaySlides.length <= 1) return;
    const timer = setTimeout(() => {
      const nextIndex = (currentSlide + 1) % displaySlides.length;
      const nextSlideData = displaySlides[nextIndex];
      const targetVideo = isMobile ? nextSlideData?.mobileVideo : nextSlideData?.desktopVideo;
      if (targetVideo) {
        const vid = document.createElement('video');
        vid.src = targetVideo;
        vid.preload = 'metadata';
      }
    }, 3500);
    return () => clearTimeout(timer);
  }, [currentSlide, displaySlides, isMobile]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Touch handlers for mobile swipe gesture
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartXRef.current - touchEndXRef.current;
    const threshold = 40; // Minimum swipe distance in px
    if (diff > threshold) {
      nextSlide();
    } else if (diff < -threshold) {
      prevSlide();
    }
  };

  const safeSlideIndex = (currentSlide >= 0 && currentSlide < displaySlides.length) ? currentSlide : 0;
  const activeSlideData = displaySlides[safeSlideIndex] || displaySlides[0] || DEFAULT_HERO_SLIDES[0];
  const BadgeIcon = (typeof activeSlideData?.badgeIcon === 'function' ? activeSlideData.badgeIcon : Sparkles);
  const btnColor = activeSlideData?.btnColor || 'bg-[#c8924b] hover:bg-[#b57f38]';

  const handleHeroAction = (productId) => {
    if (!productId || productId === 'all-products' || productId === 'all' || productId === 'catalog') {
      if (openCategory) {
        openCategory('all');
        return;
      }
    }
    const productCatalog = (products && products.length > 0 ? products : allProducts);
    const targetProduct = productCatalog.find(p => p.id === productId);
    if (targetProduct && setQuickViewProduct) {
      setQuickViewProduct(targetProduct);
    } else if (openCategory) {
      openCategory('all');
    }
  };

  return (
    <section className="relative w-full bg-black overflow-hidden select-none font-menu">
      {/* ================= DESKTOP & TABLET CINEMATIC SLIDER ================= */}
      <div className="hidden md:block relative w-full aspect-[21/9] lg:aspect-[24/9] min-h-[520px] lg:min-h-[580px] bg-black">
        
        {/* Desktop Active Slide Video */}
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-black flex items-center justify-center">
          {!isMobile && (
            <video
              key={`desktop-video-${safeSlideIndex}`}
              ref={desktopVideoRef}
              src={activeSlideData.desktopVideo}
              poster={activeSlideData.desktopPoster || '/desktop banner/poster1.webp'}
              autoPlay
              muted
              playsInline
              preload="auto"
              onEnded={nextSlide}
              className="w-full h-full object-cover object-center opacity-90 transition-opacity duration-500"
            />
          )}
          {/* Pure Dark Vignette Gradients for Cinematic Text Legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/60" />
        </div>

        {/* Desktop Slide Content */}
        <div 
          key={`desktop-content-${safeSlideIndex}`}
          className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6 max-w-4xl mx-auto space-y-4 animate-fade-in"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 text-amber-300 text-xs font-bold tracking-widest uppercase shadow-lg">
            <BadgeIcon className="w-3.5 h-3.5" />
            <span>{activeSlideData.badgeText || 'HANDCRAFTED HERITAGE'}</span>
          </div>

          {/* Main Heading */}
          <h1 className="font-heading text-4xl lg:text-5xl xl:text-6xl font-normal text-white tracking-wide leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] whitespace-pre-line">
            {activeSlideData.title}
          </h1>

          {/* Subtitle */}
          <p className="text-sm lg:text-base text-neutral-200 font-medium max-w-2xl drop-shadow-md">
            {activeSlideData.subtitle}
          </p>

          {/* Action CTA Button */}
          <div className="pt-2">
            <button
              onClick={() => handleHeroAction(activeSlideData.targetProductId)}
              className={`${btnColor} text-white font-bold text-sm lg:text-base px-9 py-3.5 rounded-xl shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 tracking-wider uppercase border border-white/20 cursor-pointer`}
            >
              {activeSlideData.btnText || 'Explore Collection'}
            </button>
          </div>
        </div>

        {/* Desktop Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 hover:bg-black/80 text-white/80 hover:text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all duration-300 transform hover:scale-110 shadow-xl cursor-pointer"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 hover:bg-black/80 text-white/80 hover:text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all duration-300 transform hover:scale-110 shadow-xl cursor-pointer"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-6 h-6 stroke-[2.5]" />
        </button>

        {/* Desktop Slide Indicator Dots */}
        <div className="absolute bottom-6 inset-x-0 z-30 flex items-center justify-center gap-2.5">
          {displaySlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`h-2.5 rounded-full transition-all duration-500 cursor-pointer ${
                currentSlide === idx
                  ? 'w-10 bg-amber-400 shadow-md ring-2 ring-amber-400/40'
                  : 'w-2.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* ================= MOBILE RESPONSIVE SLIDER (Touch Swipe Gestures Supported) ================= */}
      <div 
        className="block md:hidden touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Mobile Media Frame - Full Immersive Vertical Reel Height */}
        <div className="relative w-full h-[76vh] min-h-[520px] max-h-[700px] aspect-[9/16] bg-black overflow-hidden select-none">
          {isMobile && (
            <video
              key={`mobile-video-${safeSlideIndex}`}
              ref={mobileVideoRef}
              src={activeSlideData.mobileVideo}
              poster={activeSlideData.mobilePoster || '/mobile banner/poster1.webp'}
              autoPlay
              muted
              playsInline
              preload="auto"
              onEnded={nextSlide}
              className="w-full h-full object-cover object-top opacity-95 transition-opacity duration-500 pointer-events-none"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 pointer-events-none" />

          {/* Mobile Slide Badge overlay */}
          <div className="absolute top-3.5 left-3.5 z-20 pointer-events-none">
            <span className="bg-black/65 backdrop-blur-md px-3 py-1.5 rounded-full text-[10.5px] font-bold text-amber-300 uppercase tracking-wider border border-white/20 shadow-md">
              {activeSlideData.badgeText || 'HANDCRAFTED HERITAGE'}
            </span>
          </div>

          {/* Mobile Overlay Content on Bottom of Video */}
          <div 
            key={`mobile-content-${safeSlideIndex}`}
            className="absolute bottom-0 inset-x-0 p-5 text-center z-20 space-y-3 bg-gradient-to-t from-black/95 via-black/80 to-transparent pt-12 animate-fade-in"
          >
            <h2 className="font-heading text-2xl sm:text-3xl font-normal text-white tracking-wide leading-snug whitespace-pre-line drop-shadow-md">
              {activeSlideData.title}
            </h2>
            <p className="text-xs text-neutral-200 font-medium px-2 leading-relaxed drop-shadow-xs">
              {activeSlideData.subtitle}
            </p>

            {/* Mobile CTA Button */}
            <div className="pt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleHeroAction(activeSlideData.targetProductId);
                }}
                className={`${btnColor} text-white font-bold text-xs sm:text-sm px-9 py-3.5 rounded-xl shadow-xl transition-all tracking-wider uppercase inline-block cursor-pointer active:scale-95 border border-white/20`}
              >
                {activeSlideData.btnText || 'Explore Collection'}
              </button>
            </div>

            {/* Mobile Dots - Strictly 5 dots on phone screen */}
            <div className="flex items-center justify-center gap-2 pt-1">
              {displaySlides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToSlide(idx);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    currentSlide === idx ? 'w-7 bg-amber-400' : 'w-2 bg-white/40'
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
