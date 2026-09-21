import React, { useState, useEffect } from 'react';
import { Search, User, ShoppingBag, Menu, ChevronDown, ArrowRight, Sparkles, Compass, Shield, BookOpen, Anchor } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { allProductsTabs } from '../../data/navigation';
import { allProducts } from '../../data/products';
import { MobileDrawer } from './MobileDrawer';

export const Header = () => {
  const { totalItems, setIsCartOpen, setIsSearchOpen, setQuickViewProduct, navigateTo, openCategory } = useCart();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeMegaTab, setActiveMegaTab] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Accessibility: Close dropdowns and menus with Escape key (STORE-003)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter products for tabbed mega menu
  const selectedTab = allProductsTabs[activeMegaTab] || allProductsTabs[0];
  const tabProducts = selectedTab?.productIds 
    ? selectedTab.productIds.map(id => allProducts.find(p => p.id === id)).filter(Boolean).slice(0, 3)
    : allProducts.slice(0, 3);
  const displayMegaProducts = tabProducts.length > 0 ? tabProducts : allProducts.slice(0, 3);

  // Clean, Authentic Category Links mapped to real category keys
  const vikingLinks = [
    { title: 'Vintage Armour & Suits', catKey: 'vintage-armour' },
    { title: 'Handmade Wooden Shields', catKey: 'wooden-shields' },
    { title: 'Vintage Medieval Helmets', catKey: 'medieval-helmets' },
    { title: 'Vintage Gauntlets', catKey: 'vintage-gauntlets' },
    { title: 'Fantasy & Gothic Armour Suit', catKey: 'fantasy-gothic-armour' },
    { title: 'Cinematic Antiques & Lore', catKey: 'cinematic-antiques' }
  ];

  const lightingLinks = [
    { title: 'Vintage Chandeliers', catKey: 'vintage-chandeliers' },
    { title: 'Vintage Wall Lights', catKey: 'vintage-wall-lights' }
  ];

  const maritimeLinks = [
    { title: 'Vintage Compasses', catKey: 'vintage-compasses' },
    { title: 'US Navy Diving Helmets', catKey: 'diving-helmets' },
    { title: 'Vintage Table & Wall Clocks', catKey: 'table-clocks' }
  ];

  const leatherLinks = [
    { title: 'Handmade Leather Journals', catKey: 'leather-journals' },
    { title: 'Walking Sticks & Brolly Stand', catKey: 'walking-sticks' }
  ];

  const handleNavCategoryClick = (e, catKey) => {
    e.preventDefault();
    setActiveDropdown(null);
    openCategory(catKey);
  };

  const scrollToAbout = (e) => {
    e.preventDefault();
    setActiveDropdown(null);
    const el = document.getElementById('about-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToContact = (e) => {
    e.preventDefault();
    setActiveDropdown(null);
    const el = document.getElementById('footer-section') || document.querySelector('footer');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header 
      className="sticky top-0 z-40 bg-white border-b border-neutral-200 shadow-2xs font-menu select-none w-full"
      onMouseLeave={() => setActiveDropdown(null)}
    >
      <div className="max-w-[1440px] mx-auto px-2.5 sm:px-4 xl:px-6 py-2 flex items-center justify-between gap-1.5 lg:gap-2 xl:gap-4">
        
        {/* Left: Mobile Menu Trigger (Mobile only) */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 text-neutral-800 hover:text-black focus:outline-none cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 stroke-[1.5]" />
          </button>
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-1.5 text-neutral-800 hover:text-black cursor-pointer"
            aria-label="Search"
          >
            <Search className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Left: Logo */}
        <div className="flex items-center shrink-0">
          <a 
            href="/" 
            onClick={(e) => {
              e.preventDefault();
              navigateTo('home');
            }}
            className="flex items-center gap-2 group py-0.5"
          >
            <img
              src="/logo/logo without bg.png"
              alt="Azim Crafts"
              className="h-10 sm:h-11 md:h-12 lg:h-12 xl:h-15 w-auto object-contain transition-transform duration-200 group-hover:scale-105 drop-shadow-xs"
            />
            <div className="hidden xl:flex flex-col text-left">
              <span className="font-heading font-bold text-sm xl:text-base text-neutral-900 tracking-wider uppercase leading-none group-hover:text-[#ae2828] transition-colors">
                Azim
              </span>
              <span className="text-[9.5px] xl:text-[10.5px] font-semibold text-neutral-500 tracking-[0.22em] uppercase leading-tight mt-0.5">
                Crafts
              </span>
            </div>
          </a>
        </div>

        {/* Center: Clean Single Line Navigation Links */}
        <nav className="hidden lg:flex items-center justify-center flex-1 px-1 xl:px-3 min-w-0">
          <ul className="flex items-center gap-2 lg:gap-2.5 xl:gap-4 2xl:gap-6 text-[11.5px] lg:text-[12px] xl:text-[13px] 2xl:text-[13.5px] font-medium text-[#131313] whitespace-nowrap">
            
            {/* 0. Home Normal Button */}
            <li>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  setActiveDropdown(null);
                  navigateTo('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="py-2 hover:text-[#ae2828] transition-colors cursor-pointer font-semibold"
                onMouseEnter={() => setActiveDropdown(null)}
              >
                Home
              </button>
            </li>

            {/* 1. All Products Normal Button (Direct Click to All Products Page with All selected) */}
            <li>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  setActiveDropdown(null);
                  openCategory('all');
                }}
                className="py-2 hover:text-[#ae2828] transition-colors cursor-pointer font-semibold"
                onMouseEnter={() => setActiveDropdown(null)}
              >
                All Products
              </button>
            </li>

            {/* 2. Shop by Category Dropdown (With Tabbed Mega Menu) */}
            <li 
              className="relative"
              onMouseEnter={() => setActiveDropdown('shop-by-category')}>
              <button 
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveDropdown(activeDropdown === 'shop-by-category' ? null : 'shop-by-category');
                  } else if (e.key === 'Escape') {
                    setActiveDropdown(null);
                    e.currentTarget.focus();
                  }
                }}
                aria-haspopup="true"
                aria-expanded={activeDropdown === "shop-by-category"} 
                className={`flex items-center gap-0.5 py-2 hover:text-[#ae2828] transition-colors cursor-pointer font-medium ${
                  activeDropdown === 'shop-by-category' ? 'text-[#ae2828] font-bold' : ''
                }`}
              >
                <span>Shop by Category</span>
                <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
              </button>
            </li>

            {/* 3. Medieval & Vikings Dropdown */}
            <li 
              className="relative"
              onMouseEnter={() => setActiveDropdown('viking')}>
              <button 
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveDropdown(activeDropdown === 'viking' ? null : 'viking');
                  } else if (e.key === 'Escape') {
                    setActiveDropdown(null);
                    e.currentTarget.focus();
                  }
                }}
                aria-haspopup="true"
                aria-expanded={activeDropdown === "viking"} 
                className={`flex items-center gap-0.5 py-2 hover:text-[#ae2828] transition-colors cursor-pointer font-medium ${
                  activeDropdown === 'viking' ? 'text-[#ae2828] font-bold' : ''
                }`}
              >
                <span>Medieval & Vikings</span>
                <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
              </button>
            </li>

            {/* 4. Vintage Lighting Dropdown */}
            <li 
              className="relative"
              onMouseEnter={() => setActiveDropdown('lighting')}>
              <button 
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveDropdown(activeDropdown === 'lighting' ? null : 'lighting');
                  } else if (e.key === 'Escape') {
                    setActiveDropdown(null);
                    e.currentTarget.focus();
                  }
                }}
                aria-haspopup="true"
                aria-expanded={activeDropdown === "lighting"} 
                className={`flex items-center gap-0.5 py-2 hover:text-[#ae2828] transition-colors cursor-pointer font-medium ${
                  activeDropdown === 'lighting' ? 'text-[#ae2828] font-bold' : ''
                }`}
              >
                <span>Vintage Lighting</span>
                <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
              </button>
            </li>

            {/* 5. Nautical & Maritime Dropdown */}
            <li 
              className="relative"
              onMouseEnter={() => setActiveDropdown('maritime')}>
              <button 
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveDropdown(activeDropdown === 'maritime' ? null : 'maritime');
                  } else if (e.key === 'Escape') {
                    setActiveDropdown(null);
                    e.currentTarget.focus();
                  }
                }}
                aria-haspopup="true"
                aria-expanded={activeDropdown === "maritime"} 
                className={`flex items-center gap-0.5 py-2 hover:text-[#ae2828] transition-colors cursor-pointer font-medium ${
                  activeDropdown === 'maritime' ? 'text-[#ae2828] font-bold' : ''
                }`}
              >
                <span>Nautical Antiques</span>
                <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
              </button>
            </li>

            {/* 6. Handmade Leather Journals Dropdown */}
            <li 
              className="relative"
              onMouseEnter={() => setActiveDropdown('leather')}>
              <button 
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setActiveDropdown(activeDropdown === 'leather' ? null : 'leather');
                  } else if (e.key === 'Escape') {
                    setActiveDropdown(null);
                    e.currentTarget.focus();
                  }
                }}
                aria-haspopup="true"
                aria-expanded={activeDropdown === "leather"} 
                className={`flex items-center gap-0.5 py-2 hover:text-[#ae2828] transition-colors cursor-pointer font-medium ${
                  activeDropdown === 'leather' ? 'text-[#ae2828] font-bold' : ''
                }`}
              >
                <span>Leather & Canes</span>
                <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
              </button>
            </li>

            {/* 7. Contact */}
            <li>
              <button 
                onClick={scrollToContact}
                className="py-2 hover:text-[#ae2828] transition-colors cursor-pointer"
                onMouseEnter={() => setActiveDropdown(null)}
              >
                Contact
              </button>
            </li>
          </ul>
        </nav>

        {/* Right: Utility Icons */}
        <div className="flex items-center gap-2 sm:gap-2.5 xl:gap-3.5 text-neutral-800 shrink-0">
          {/* Customer Account Login */}
          <button
            onClick={() => navigateTo('account')}
            className="p-1 hover:text-[#ae2828] transition-colors cursor-pointer"
            title="Customer Account / Sign In"
          >
            <User className="w-5 h-5 stroke-[1.6]" />
          </button>

          {/* Shopping Bag / Cart */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-1 hover:text-[#ae2828] transition-colors cursor-pointer"
            title="Cart"
          >
            <ShoppingBag className="w-5 h-5 stroke-[1.6]" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1.5 bg-[#ae2828] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>

          {/* Search Trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-1 hover:text-[#ae2828] transition-colors hidden sm:block cursor-pointer"
            title="Search"
          >
            <Search className="w-5 h-5 stroke-[1.6]" />
          </button>
        </div>
      </div>

      {/* DROPDOWN OVERLAYS */}

      {/* 1. Shop by Category Tabbed Mega Menu */}
      {activeDropdown === 'shop-by-category' && (
        <div 
          role="menu"
          className="absolute top-full left-0 w-full bg-white border-b border-neutral-200 shadow-xl py-6 animate-fade-in z-50"
          onMouseEnter={() => setActiveDropdown('shop-by-category')}
          onMouseLeave={() => setActiveDropdown(null)}
        >
          <div className="max-w-[1350px] mx-auto px-4 lg:px-6 xl:px-8 grid grid-cols-12 gap-4 lg:gap-6 xl:gap-8">
            
            {/* Left Category Tabs (4 cols) */}
            <div className="col-span-4 border-r border-neutral-100 pr-6 space-y-1.5">
              <div className="flex items-center justify-between mb-2 px-3">
                <span className="text-[11px] uppercase tracking-wider font-bold text-neutral-400">
                  Select Category
                </span>
                <button
                  onClick={() => {
                    setActiveDropdown(null);
                    openCategory('all');
                  }}
                  role="menuitem"
                  className="text-[11px] font-bold text-[#ae2828] hover:underline cursor-pointer"
                >
                  View All Products →
                </button>
              </div>

              {allProductsTabs.map((tab, idx) => (
                <button
                  key={idx}
                  onMouseEnter={() => setActiveMegaTab(idx)}
                  onClick={() => {
                    setActiveDropdown(null);
                    openCategory(tab.tag);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                    activeMegaTab === idx
                      ? 'bg-amber-50 text-[#ae2828] font-bold shadow-2xs'
                      : 'text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <span>{tab.title}</span>
                  <ArrowRight className={`w-3.5 h-3.5 transition-opacity ${activeMegaTab === idx ? 'opacity-100 text-[#ae2828]' : 'opacity-0'}`} />
                </button>
              ))}
            </div>

            {/* Right Products Preview (8 cols) */}
            <div className="col-span-8">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-heading text-sm font-bold text-neutral-900">
                  {selectedTab?.title}
                </h4>
                <button
                  onClick={() => {
                    setActiveDropdown(null);
                    openCategory(selectedTab?.tag);
                  }}
                  role="menuitem"
                  className="text-xs text-[#ae2828] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>View All in {selectedTab?.title}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {displayMegaProducts.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setActiveDropdown(null);
                      setQuickViewProduct(p);
                    }}
                    className="p-2.5 rounded-xl border border-neutral-100 hover:border-neutral-300 hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between bg-white"
                  >
                    <div className="aspect-square bg-neutral-50 rounded-lg overflow-hidden mb-2 p-1.5 flex items-center justify-center">
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <h5 className="font-heading text-xs font-medium text-neutral-900 line-clamp-2 group-hover:text-[#ae2828] transition-colors mb-1.5">
                      {p.title}
                    </h5>
                    <span className="text-xs font-bold text-neutral-900">
                      ${p.price.toFixed(2)} USD
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Medieval & Vikings Dropdown */}
      {activeDropdown === 'viking' && (
        <div 
          role="menu"
          className="absolute top-full left-0 w-full bg-white border-b border-neutral-200 shadow-xl py-6 animate-fade-in z-50"
          onMouseEnter={() => setActiveDropdown('viking')}
          onMouseLeave={() => setActiveDropdown(null)}
        >
          <div className="max-w-[1350px] mx-auto px-4 lg:px-6 xl:px-8 grid grid-cols-12 gap-4 lg:gap-6 xl:gap-8 items-center">
            <div className="col-span-5 space-y-2.5">
              <span className="text-[11px] uppercase tracking-wider font-bold text-neutral-400 block mb-1">
                Battle-Ready Replicas & Armour
              </span>
              {vikingLinks.map((link, i) => (
                <button 
                  key={i} 
                  onClick={(e) => handleNavCategoryClick(e, link.catKey)}
                  role="menuitem"
                  className="w-full text-left text-xs font-semibold text-neutral-700 hover:text-[#ae2828] hover:bg-neutral-50 p-2 rounded-lg transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>{link.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
                </button>
              ))}
            </div>

            <div className="col-span-7 bg-[#fcfaf7] p-5 rounded-2xl border border-neutral-200/80 flex items-center gap-5">
              <img
                src="/All categories/All Products/product 1/1.jpeg"
                alt="Battle-Ready Viking Shield"
                className="w-28 h-28 object-contain rounded-xl bg-white p-2 shadow-2xs border border-neutral-100 shrink-0"
              />
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#ae2828] block">
                  Battle Ready Reenactment
                </span>
                <h4 className="font-heading text-sm font-bold text-neutral-900 leading-snug">
                  Handcrafted Viking Round Shields & Armour
                </h4>
                <p className="text-[11.5px] text-neutral-500 leading-relaxed">
                  18-gauge steel, solid wood body with raised steel umbo designed for live reenactment & display.
                </p>
                <button 
                  onClick={(e) => handleNavCategoryClick(e, 'wooden-shields')}
                  className="text-xs font-bold text-neutral-900 hover:text-[#ae2828] underline pt-1 inline-flex items-center gap-1 cursor-pointer"
                >
                  View Wooden Shields →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Vintage Lighting Dropdown */}
      {activeDropdown === 'lighting' && (
        <div 
          role="menu"
          className="absolute top-full left-0 w-full bg-white border-b border-neutral-200 shadow-xl py-6 animate-fade-in z-50"
          onMouseEnter={() => setActiveDropdown('lighting')}
          onMouseLeave={() => setActiveDropdown(null)}
        >
          <div className="max-w-[1350px] mx-auto px-4 lg:px-6 xl:px-8 grid grid-cols-12 gap-4 lg:gap-6 xl:gap-8 items-center">
            <div className="col-span-5 space-y-2.5">
              <span className="text-[11px] uppercase tracking-wider font-bold text-neutral-400 block mb-1">
                Handcrafted Vintage Lighting
              </span>
              {lightingLinks.map((link, i) => (
                <button 
                  key={i} 
                  onClick={(e) => handleNavCategoryClick(e, link.catKey)}
                  role="menuitem"
                  className="w-full text-left text-xs font-semibold text-neutral-700 hover:text-[#ae2828] hover:bg-neutral-50 p-2 rounded-lg transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>{link.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
                </button>
              ))}
            </div>

            <div className="col-span-7 bg-[#fcfaf7] p-5 rounded-2xl border border-neutral-200/80 flex items-center gap-5">
              <img
                src="/All categories/Vintage Chandeliers/Product 40/1.jpeg"
                alt="Vintage Chandelier"
                className="w-28 h-28 object-contain rounded-xl bg-white p-2 shadow-2xs border border-neutral-100 shrink-0"
              />
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#ae2828] block">
                  Artisan Wrought Iron
                </span>
                <h4 className="font-heading text-sm font-bold text-neutral-900 leading-snug">
                  Gothic Chandeliers & Vintage Wall Sconces
                </h4>
                <p className="text-[11.5px] text-neutral-500 leading-relaxed">
                  Solid hand-forged wrought iron chandeliers and wall fixtures inspired by medieval castle illumination.
                </p>
                <button 
                  onClick={(e) => handleNavCategoryClick(e, 'vintage-chandeliers')}
                  className="text-xs font-bold text-neutral-900 hover:text-[#ae2828] underline pt-1 inline-flex items-center gap-1 cursor-pointer"
                >
                  Explore Chandeliers →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Nautical & Maritime Dropdown */}
      {activeDropdown === 'maritime' && (
        <div 
          role="menu"
          className="absolute top-full left-0 w-full bg-white border-b border-neutral-200 shadow-xl py-6 animate-fade-in z-50"
          onMouseEnter={() => setActiveDropdown('maritime')}
          onMouseLeave={() => setActiveDropdown(null)}
        >
          <div className="max-w-[1350px] mx-auto px-4 lg:px-6 xl:px-8 grid grid-cols-12 gap-4 lg:gap-6 xl:gap-8 items-center">
            <div className="col-span-5 space-y-2.5">
              <span className="text-[11px] uppercase tracking-wider font-bold text-neutral-400 block mb-1">
                Authentic Maritime Instruments
              </span>
              {maritimeLinks.map((link, i) => (
                <button 
                  key={i} 
                  onClick={(e) => handleNavCategoryClick(e, link.catKey)}
                  role="menuitem"
                  className="w-full text-left text-xs font-semibold text-neutral-700 hover:text-[#ae2828] hover:bg-neutral-50 p-2 rounded-lg transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>{link.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
                </button>
              ))}
            </div>

            <div className="col-span-7 bg-[#fcfaf7] p-5 rounded-2xl border border-neutral-200/80 flex items-center gap-5">
              <img
                src="/All categories/All Products/product 11/1.jpg"
                alt="Solid Brass Marine Sextant"
                className="w-28 h-28 object-contain rounded-xl bg-white p-2 shadow-2xs border border-neutral-100 shrink-0"
              />
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#ae2828] block">
                  Master Nautical Craft
                </span>
                <h4 className="font-heading text-sm font-bold text-neutral-900 leading-snug">
                  Solid Brass Marine Sextants & Compasses
                </h4>
                <p className="text-[11.5px] text-neutral-500 leading-relaxed">
                  Precision crafted solid brass instruments housed in hand-carved hardwood teak presentation cases.
                </p>
                <button 
                  onClick={(e) => handleNavCategoryClick(e, 'vintage-compasses')}
                  className="text-xs font-bold text-neutral-900 hover:text-[#ae2828] underline pt-1 inline-flex items-center gap-1 cursor-pointer"
                >
                  Explore Compasses & Sextants →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Handmade Leather Journals Dropdown */}
      {activeDropdown === 'leather' && (
        <div 
          role="menu"
          className="absolute top-full left-0 w-full bg-white border-b border-neutral-200 shadow-xl py-6 animate-fade-in z-50"
          onMouseEnter={() => setActiveDropdown('leather')}
          onMouseLeave={() => setActiveDropdown(null)}
        >
          <div className="max-w-[1350px] mx-auto px-4 lg:px-6 xl:px-8 grid grid-cols-12 gap-4 lg:gap-6 xl:gap-8 items-center">
            <div className="col-span-5 space-y-2.5">
              <span className="text-[11px] uppercase tracking-wider font-bold text-neutral-400 block mb-1">
                Artisan Hand-Bound Leather
              </span>
              {leatherLinks.map((link, i) => (
                <button 
                  key={i} 
                  onClick={(e) => handleNavCategoryClick(e, link.catKey)}
                  role="menuitem"
                  className="w-full text-left text-xs font-semibold text-neutral-700 hover:text-[#ae2828] hover:bg-neutral-50 p-2 rounded-lg transition-colors flex items-center justify-between cursor-pointer"
                >
                  <span>{link.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100" />
                </button>
              ))}
            </div>

            <div className="col-span-7 bg-[#fcfaf7] p-5 rounded-2xl border border-neutral-200/80 flex items-center gap-5">
              <img
                src="/All categories/All Products/product 14/1.jpg"
                alt="Embossed Leather Journal"
                className="w-28 h-28 object-contain rounded-xl bg-white p-2 shadow-2xs border border-neutral-100 shrink-0"
              />
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#ae2828] block">
                  Artisan Hand-Bound
                </span>
                <h4 className="font-heading text-sm font-bold text-neutral-900 leading-snug">
                  Handmade Embossed Leather Journals
                </h4>
                <p className="text-[11.5px] text-neutral-500 leading-relaxed">
                  Genuine buffalo leather diaries with hand-cut deckle edge cotton parchment paper and antique lock keys.
                </p>
                <button 
                  onClick={(e) => handleNavCategoryClick(e, 'leather-journals')}
                  className="text-xs font-bold text-neutral-900 hover:text-[#ae2828] underline pt-1 inline-flex items-center gap-1 cursor-pointer"
                >
                  Explore Leather Journals →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </header>
  );
};
