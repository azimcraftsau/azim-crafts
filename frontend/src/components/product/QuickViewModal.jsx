import React, { useState, useEffect } from 'react';
import { 
  X, ShoppingCart, ShoppingBag, Check, ChevronDown, ChevronUp,
  ShieldCheck, Truck, Ruler, FileText, CheckSquare, 
  ArrowLeft, MapPin, Box, Sparkles, Play
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { allProducts } from '../../data/products';

export const QuickViewModal = () => {
  const { quickViewProduct, setQuickViewProduct, addToCart, activeCategoryCollection, navigateTo, requireAuth, products } = useCart();
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('XL');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState({});
  const [addingPartId, setAddingPartId] = useState(null);
  
  // Collapsible Accordions State (Default open: description)
  const [openAccordions, setOpenAccordions] = useState({
    description: true,
    dimensions: false,
    materials: false,
    shipping: false,
    manufacturer: false,
    disclaimer: false
  });

  const toggleAccordion = (key) => {
    setOpenAccordions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  useEffect(() => {
    if (!quickViewProduct) return;
    setSelectedMediaIndex(0);
    setQuantity(1);
    const sizes = Array.isArray(quickViewProduct.sizes) && quickViewProduct.sizes.length > 0 
      ? quickViewProduct.sizes 
      : null;

    if (sizes && sizes.length > 0) {
      if (sizes.includes('24 inch')) {
        setSelectedSize('24 inch');
      } else if (sizes.includes('XL')) {
        setSelectedSize('XL');
      } else {
        setSelectedSize(sizes[0]);
      }
    } else {
      setSelectedSize(null);
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  // Always resolve master catalog defaults merged with live admin edits
  const masterDefaults = allProducts.find(p => p.id === quickViewProduct.id) || {};
  const product = { ...masterDefaults, ...quickViewProduct };
  // Strictly preserve live product.sizes (never let masterDefaults re-inject sizes if removed)
  if (Array.isArray(quickViewProduct.sizes)) {
    product.sizes = quickViewProduct.sizes;
  }

  const stockQty = quickViewProduct.stockQuantity !== undefined 
    ? Number(quickViewProduct.stockQuantity) 
    : (quickViewProduct.stock_quantity !== undefined 
        ? Number(quickViewProduct.stock_quantity) 
        : (masterDefaults.stockQuantity !== undefined 
            ? Number(masterDefaults.stockQuantity) 
            : (masterDefaults.stock_quantity !== undefined ? Number(masterDefaults.stock_quantity) : 10)));

  const isSoldOut = Boolean(quickViewProduct.isSoldOut || masterDefaults.isSoldOut) || stockQty <= 0;
  const isLowStock = !isSoldOut && stockQty > 0 && stockQty <= 5;

  product.stockQuantity = stockQty;
  product.stock_quantity = stockQty;
  product.isSoldOut = isSoldOut;
  product.is_sold_out = isSoldOut ? 1 : 0;

  const isArmourCategory = product.category === 'vintage-armour' || 
                           product.category === 'fantasy-gothic-armour' || 
                           (product.categoryName && (product.categoryName.includes('Armour') || product.categoryName.includes('Suit'))) ||
                           (product.title && (product.title.includes('Armour') || product.title.includes('Armor') || product.title.includes('Suit')));

  const isShieldCategory = product.category === 'wooden-shields' ||
                           (product.categoryName && (product.categoryName.toLowerCase().includes('shield') || product.categoryName.toLowerCase().includes('sheild'))) ||
                           (product.title && (product.title.toLowerCase().includes('shield') || product.title.toLowerCase().includes('sheild')));

  const productSizes = Array.isArray(product.sizes) && product.sizes.length > 0
    ? product.sizes
    : null;

  const images = product.images && product.images.length > 0 
    ? product.images 
    : [product.image];

  const videos = Array.isArray(product.videos) ? product.videos.filter(Boolean) : [];

  // Combined media list (images first, followed by videos)
  const mediaList = [
    ...images.map((src, i) => ({ type: 'image', src, label: `Photo ${i + 1}` })),
    ...videos.map((src, i) => ({ type: 'video', src, label: `Video Demo ${i + 1}` }))
  ];

  const currentMedia = mediaList[selectedMediaIndex] || mediaList[0] || { type: 'image', src: product.image };

  // Companion add-ons logic (Accurate Real Catalog Price)
  const catalogList = (products && products.length > 0) ? products : allProducts;
  const relatedCandidates = catalogList.filter(p => p.id !== product.id && p.category === product.category);
  const fallbackCandidates = catalogList.filter(p => p.id !== product.id);
  const chosenAddons = relatedCandidates.length >= 2 ? relatedCandidates.slice(0, 2) : fallbackCandidates.slice(0, 2);

  const availableAddons = chosenAddons.map(p => ({
    id: p.id,
    title: p.title || p.name,
    image: p.image,
    price: Number(p.price) || 0
  }));

  const toggleAddon = (addonId) => {
    setSelectedAddons(prev => ({
      ...prev,
      [addonId]: !prev[addonId]
    }));
  };

  const handleAddToCart = () => {
    if (isSoldOut) return;
    setIsAdding(true);
    const chosenSize = productSizes ? (selectedSize || productSizes[0]) : null;
    addToCart(product, Math.min(quantity, Math.max(1, stockQty)), chosenSize);

    // Add selected add-ons at accurate catalog price
    Object.keys(selectedAddons).forEach(addonId => {
      if (selectedAddons[addonId]) {
        const addonObj = availableAddons.find(a => a.id === addonId);
        if (addonObj) {
          addToCart({
            id: addonObj.id,
            title: addonObj.title,
            price: addonObj.price,
            image: addonObj.image,
            vendor: 'Azim Crafts'
          }, 1);
        }
      }
    });

    setTimeout(() => {
      setIsAdding(false);
      setQuickViewProduct(null);
    }, 400);
  };

  const handleAddPartToCart = (part) => {
    if (!part || !part.price) return;
    setAddingPartId(part.id);
    const chosenSize = productSizes ? (selectedSize || productSizes[0]) : null;
    const partProduct = {
      ...product,
      id: `${product.id}-part-${part.id}`,
      title: `${product.title} (${part.name})`,
      price: Number(part.price),
      regularPrice: Number(part.price),
      isModularPart: true,
      parentProductId: product.id,
      partName: part.name
    };
    addToCart(partProduct, 1, chosenSize);
    setTimeout(() => {
      setAddingPartId(null);
    }, 1200);
  };

  const specs = product.specifications || {
    brand: 'Azim Crafts',
    productName: product.title,
    model: `VTM-${product.productNumber || 100}`,
    packContents: '1x Handcrafted Masterpiece Item',
    colour: 'Natural Handcrafted Artisan Tones',
    keyAttributes: '100% Handcrafted, Decorative, Museum Quality'
  };

  const perfectForList = product.perfectFor || [
    'Home & office décor',
    'Historical display pieces & collector cabinets',
    'Gifts for history, nautical & art lovers',
    'Souvenir and heirloom collectible item',
    'Art and craft enthusiasts'
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-menu select-none">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setQuickViewProduct(null)}
      />

      <div className="relative min-h-screen flex items-center justify-center p-2 sm:p-4 md:p-6 my-4">
        <div className="relative bg-white w-full max-w-5xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden animate-fade-in border border-neutral-200">
          
          {/* Top Navigation Bar with Step-by-Step Back button */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-neutral-100/90 border-b border-neutral-200">
            {activeCategoryCollection ? (
              <button
                onClick={() => setQuickViewProduct(null)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-800 hover:text-[#ae2828] transition-colors py-1 px-2.5 rounded-lg hover:bg-neutral-200 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>← Back to {activeCategoryCollection.title}</span>
              </button>
            ) : (
              <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                Product Details
              </span>
            )}

            {/* Close button */}
            <button
              onClick={() => setQuickViewProduct(null)}
              className="p-1.5 rounded-full hover:bg-neutral-200 text-neutral-600 hover:text-black transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 p-4 sm:p-6 lg:p-8 max-h-[85vh] overflow-y-auto">
            
            {/* ================= LEFT COLUMN: Sticky Photo/Video Gallery & Guarantees (5 Cols) ================= */}
            <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-0 self-start">

              {/* Main Media Card (Photo or Video Player) */}
              <div className="aspect-square bg-[#fbf9f6] rounded-2xl overflow-hidden border border-neutral-200/80 relative flex items-center justify-center p-3 shadow-xs">
                {currentMedia.type === 'video' ? (
                  <div className="w-full h-full flex items-center justify-center bg-black rounded-xl overflow-hidden">
                    <video
                      key={currentMedia.src}
                      src={currentMedia.src}
                      controls
                      autoPlay
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-contain max-h-[380px]"
                    />
                  </div>
                ) : (
                  <>
                    <img
                      src={encodeURI(currentMedia.src || '')}
                      alt={product.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-contain max-h-[380px] drop-shadow-md transition-all duration-300"
                      onError={(e) => {
                        if (product.image && e.target.src !== encodeURI(product.image)) {
                          e.target.src = encodeURI(product.image);
                        } else {
                          e.target.src = '/logo.png';
                        }
                      }}
                    />
                    {product.badge && !product.isSoldOut && (
                      <span className="absolute top-3 left-3 bg-[#ae2828] text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider shadow-sm">
                        {product.badge}
                      </span>
                    )}
                    {product.isSoldOut && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-white text-neutral-900 font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-widest shadow-lg">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Thumbnails Row (Images + Clean Video Thumbnail at End) */}
              {mediaList.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto py-2 px-1 no-scrollbar">
                  {mediaList.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedMediaIndex(index)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 p-1 bg-white shrink-0 transition-all cursor-pointer shadow-2xs relative ${
                        selectedMediaIndex === index 
                          ? 'border-neutral-900 ring-2 ring-neutral-900/20 scale-105' 
                          : 'border-neutral-200 opacity-60 hover:opacity-100 hover:border-neutral-400'
                      }`}
                    >
                      {item.type === 'video' ? (
                        <div className="w-full h-full bg-neutral-900 rounded-lg flex items-center justify-center text-white relative">
                          <div className="w-7 h-7 rounded-full bg-neutral-800 border border-neutral-600 flex items-center justify-center">
                            <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
                          </div>
                        </div>
                      ) : (
                        <img 
                          src={item.src} 
                          alt="" 
                          decoding="async"
                          className="w-full h-full object-contain" 
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Guarantees Box below gallery */}
              <div className="bg-[#fbf9f6] border border-neutral-200/80 rounded-2xl p-3.5 space-y-2.5 text-xs text-neutral-600">
                <div className="flex items-center gap-2 font-medium">
                  <Sparkles className="w-4 h-4 text-[#c8924b] shrink-0" />
                  <span><strong>Export-Grade Quality:</strong> Multi-Layer Protective Packaging</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>100% Authentic Handcrafted:</strong> Master Artisan Made</span>
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <Truck className="w-4 h-4 text-amber-700 shrink-0" />
                  <span><strong>Express Shipping:</strong> DHL, FedEx & UPS Worldwide</span>
                </div>
              </div>

            </div>

            {/* ================= RIGHT COLUMN: Title, Pricing, Actions & Accordions (7 Cols) ================= */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Product Header */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#ae2828] bg-red-50 border border-red-100 px-2 py-0.5 rounded">
                    {product.categoryName || 'Authentic Historical Craft'}
                  </span>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    SKU: VTM-{product.productNumber || 100}
                  </span>
                </div>

                <h1 className="font-heading text-xl sm:text-2xl font-bold text-neutral-900 leading-snug tracking-wide">
                  {product.title}
                </h1>

                {/* Price Box */}
                <div className="flex items-center gap-3">
                  <div className="inline-block border border-neutral-300 rounded-xl px-4 py-1.5 bg-neutral-50 shadow-2xs">
                    <span className="text-xl font-black text-neutral-900">
                      ${product.price.toFixed(2)} USD
                    </span>
                  </div>
                  {product.regularPrice > product.price && (
                    <span className="text-sm font-semibold text-neutral-400 line-through">
                      ${product.regularPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-neutral-500">
                  Tax included. <span className="underline text-neutral-700 font-medium">Free Worldwide Express Shipping</span> on orders over $200 USD.
                </p>

                {/* Low Stock Urgency Alert */}
                {isLowStock && (
                  <div className="flex items-center gap-2.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300/80 p-3 rounded-xl text-amber-900 shadow-2xs animate-fade-in">
                    <span className="text-base animate-bounce">🔥</span>
                    <div className="text-xs">
                      <strong className="font-bold text-amber-950">Almost Gone! Only {stockQty} {stockQty === 1 ? 'unit' : 'units'} left in stock.</strong>
                      <span className="block text-[11px] text-amber-800">Order soon — handcrafted artisan item in high demand.</span>
                    </div>
                  </div>
                )}

                {/* Sold Out Notice */}
                {isSoldOut && (
                  <div className="flex items-center gap-2.5 bg-neutral-100 border border-neutral-300 p-3 rounded-xl text-neutral-700 shadow-2xs">
                    <span className="text-sm">❌</span>
                    <div className="text-xs">
                      <strong className="font-bold text-neutral-900">Currently Sold Out</strong>
                      <span className="block text-[11px] text-neutral-500">This piece is currently out of stock. Restock updates managed via artisan workshop.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Size Selector for Armour & Suits and Shields */}
              {productSizes && productSizes.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-neutral-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span>Select Size:</span>
                      <span className="text-[#c8924b] font-black bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {selectedSize || productSizes[0]}
                      </span>
                    </label>
                    <span className="text-[11px] text-neutral-500 font-medium">
                      {isShieldCategory
                        ? '18" (Compact) • 24" (Standard) • 36" (Grand)'
                        : 'M (38-40") • XL (44-46") • XXL (48-50")'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    {productSizes.map((size) => {
                      const isSelected = (selectedSize || productSizes[0]) === size;
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={`py-2.5 px-3 rounded-xl border font-bold text-xs tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm ring-2 ring-neutral-900/20'
                              : 'bg-white text-neutral-800 border-neutral-300 hover:border-neutral-500 hover:bg-neutral-50'
                          }`}
                        >
                          <span>{size}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#c8924b]" />}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 bg-neutral-50 p-2 rounded-lg border border-neutral-100">
                    <Ruler className="w-3.5 h-3.5 text-[#c8924b] shrink-0" />
                    <span>
                      {isShieldCategory
                        ? 'Handcrafted battle disc with heavy-duty genuine buffalo leather arm straps and solid iron boss.'
                        : 'Full-scale wearable steel plate armor with adjustable internal genuine leather straps.'}
                    </span>
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              {!isSoldOut && (
                <div className="space-y-1.5 pt-3 border-t border-neutral-100">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-neutral-800 uppercase tracking-wider">
                      Quantity
                    </label>
                    <span className="text-[11px] font-medium text-neutral-500">
                      {stockQty} {stockQty === 1 ? 'unit' : 'units'} available
                    </span>
                  </div>
                  <div className="inline-flex items-center border border-neutral-300 rounded-xl bg-white shadow-2xs">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3.5 py-2 hover:bg-neutral-100 text-neutral-600 transition-colors cursor-pointer rounded-l-xl font-bold"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="px-5 text-xs font-bold text-neutral-900 min-w-[2.5rem] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(stockQty, quantity + 1))}
                      disabled={quantity >= stockQty}
                      className="px-3.5 py-2 hover:bg-neutral-100 text-neutral-600 transition-colors cursor-pointer rounded-r-xl font-bold disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Select Optional Add-ons */}
              {availableAddons.length > 0 && (
                <div className="space-y-2.5 pt-3 border-t border-neutral-100">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#c8924b]" />
                    <h4 className="text-xs font-bold text-neutral-900 tracking-wide uppercase">
                      Frequently Bought Together
                    </h4>
                  </div>

                  <div className="space-y-2">
                    {availableAddons.map((addon) => (
                      <label
                        key={addon.id}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer select-none ${
                          selectedAddons[addon.id]
                            ? 'border-neutral-900 bg-neutral-50/80 shadow-2xs'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={!!selectedAddons[addon.id]}
                          onChange={() => toggleAddon(addon.id)}
                          className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black accent-black cursor-pointer"
                        />
                        <img
                          src={addon.image}
                          alt={addon.title}
                          className="w-10 h-10 object-contain rounded-lg bg-neutral-100 shrink-0 p-0.5 border border-neutral-100"
                        />
                        <div className="flex-1 text-xs">
                          <span className="font-medium text-neutral-900 block line-clamp-1">
                            {addon.title}
                          </span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="font-bold text-neutral-900">
                              ${Number(addon.price).toFixed(2)} <span className="text-[10px] font-normal text-neutral-500">USD</span>
                            </span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-3 border-t border-neutral-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    onClick={handleAddToCart}
                    disabled={isAdding || product.isSoldOut}
                    className="w-full bg-[#1b1a1a] hover:bg-[#333333] active:scale-[0.99] text-white py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isAdding ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>ADDED TO CART</span>
                      </>
                    ) : product.isSoldOut ? (
                      <span>SOLD OUT</span>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 text-[#f7eddb]" />
                        <span>ADD TO CART</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setQuickViewProduct(null);
                      navigateTo('cart');
                    }}
                    className="w-full bg-white hover:bg-neutral-50 active:scale-[0.99] text-neutral-900 border border-neutral-300 hover:border-black py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4 text-neutral-700" />
                    <span>VIEW MY CART</span>
                  </button>
                </div>

                {!product.isSoldOut && (
                  <button
                    onClick={() => {
                      handleAddToCart();
                      setQuickViewProduct(null);
                      requireAuth(() => navigateTo('checkout'));
                    }}
                    className="w-full bg-[#c8924b] hover:bg-[#b57f38] active:scale-[0.99] text-white py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md transition-colors cursor-pointer"
                  >
                    Buy it now
                  </button>
                )}

                {/* ================= MODULAR ARMOUR PIECES BREAKDOWN (4 BOXES) ================= */}
                {product.hasModularParts && Array.isArray(product.modularParts) && product.modularParts.filter(p => p.enabled !== false).length > 0 && (
                  <div className="pt-4 border-t border-neutral-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">⚔️</span>
                        <div>
                          <h4 className="text-xs font-bold text-neutral-900 tracking-wide uppercase">
                            Buy Individual Pieces Separately
                          </h4>
                          <p className="text-[11px] text-neutral-500">
                            Select and order individual suit pieces without purchasing the entire set:
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-[#c8924b] bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
                        {product.modularParts.filter(p => p.enabled !== false).length} Pieces Available
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                      {product.modularParts.filter(p => p.enabled !== false).map((part, index) => {
                        const isPartAdding = addingPartId === part.id;
                        const partIcon = index === 0 ? '🛡️' : index === 1 ? '🥋' : index === 2 ? '🧤' : '🥾';
                        return (
                          <div 
                            key={part.id || index}
                            className="flex flex-col justify-between p-3 rounded-xl border border-neutral-200 hover:border-neutral-400 bg-neutral-50/60 hover:bg-white transition-all shadow-2xs group"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-base">{partIcon}</span>
                                <span className="text-[9.5px] font-bold text-neutral-400 uppercase tracking-wider">
                                  Part {index + 1}
                                </span>
                              </div>
                              <h5 className="font-heading text-xs font-bold text-neutral-900 leading-tight line-clamp-1 group-hover:text-[#c8924b] transition-colors">
                                {part.name}
                              </h5>
                              <div className="text-xs font-black text-[#c8924b]">
                                ${Number(part.price).toFixed(2)} <span className="text-[9.5px] font-normal text-neutral-500">USD</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleAddPartToCart(part)}
                              disabled={isPartAdding}
                              className={`mt-2.5 w-full py-2 px-2.5 rounded-lg text-[11px] font-bold tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                                isPartAdding
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-white hover:bg-neutral-900 hover:text-white text-neutral-800 border border-neutral-300'
                              }`}
                            >
                              {isPartAdding ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Added!</span>
                                </>
                              ) : (
                                <>
                                  <ShoppingCart className="w-3.5 h-3.5" />
                                  <span>+ Add Piece</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* ================= 5 COLLAPSIBLE ACCORDIONS (Placed on Right Side) ================= */}
              <div className="border border-neutral-200 rounded-2xl divide-y divide-neutral-200 overflow-hidden bg-white shadow-2xs mt-4">
                
                {/* 1. Description Accordion */}
                <div>
                  <button
                    onClick={() => toggleAccordion('description')}
                    className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs text-neutral-900 hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-neutral-600" />
                      <span className="font-bold tracking-wide">Description</span>
                    </div>
                    {openAccordions.description ? (
                      <ChevronUp className="w-4 h-4 text-neutral-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-400" />
                    )}
                  </button>

                  {openAccordions.description && (
                    <div className="px-4 pb-5 pt-1 space-y-4 text-xs text-neutral-700 leading-relaxed font-normal animate-fade-in border-t border-neutral-100">
                      
                      {/* Product Story / Narrative */}
                      <p className="whitespace-pre-line text-neutral-700 leading-relaxed">
                        {product.description}
                      </p>

                      {/* Structured Product Specifications */}
                      <div className="bg-[#fbf9f6] rounded-xl p-3.5 border border-neutral-200/80 space-y-2 text-[11.5px]">
                        <div><strong className="text-neutral-900">Brand:</strong> {specs.brand || 'Azim Crafts'}</div>
                        <div><strong className="text-neutral-900">Product Name:</strong> {specs.productName}</div>
                        <div><strong className="text-neutral-900">Model:</strong> {specs.model}</div>
                        <div><strong className="text-neutral-900">Pack Contents:</strong> {specs.packContents}</div>
                        <div><strong className="text-neutral-900">Colour:</strong> {specs.colour}</div>
                        <div><strong className="text-neutral-900">Key Attributes:</strong> {specs.keyAttributes}</div>
                      </div>

                      {/* Perfect For List */}
                      <div className="space-y-1.5 pt-1">
                        <strong className="text-neutral-900 block text-xs">Perfect for:</strong>
                        <ul className="space-y-1 pl-4 list-disc text-neutral-600">
                          {perfectForList.map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      {/* Natural Variation Notice */}
                      <p className="text-[11px] text-neutral-500 italic bg-amber-50/50 p-2.5 rounded-lg border border-amber-200/50">
                        Please note that <strong>size, colour, design and pattern may vary from the images shown</strong>, as each piece is a handcrafted natural product. Variations are part of the unique character and authenticity of every piece.
                      </p>
                    </div>
                  )}
                </div>

                {/* 2. Dimensions Accordion */}
                <div>
                  <button
                    onClick={() => toggleAccordion('dimensions')}
                    className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs text-neutral-900 hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Ruler className="w-4 h-4 text-neutral-600" />
                      <span className="font-bold tracking-wide">Dimensions</span>
                    </div>
                    {openAccordions.dimensions ? (
                      <ChevronUp className="w-4 h-4 text-neutral-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-400" />
                    )}
                  </button>

                  {openAccordions.dimensions && (
                    <div className="px-4 pb-4 pt-1 space-y-2 text-xs text-neutral-700 font-medium animate-fade-in border-t border-neutral-100">
                      <div className="p-3 bg-neutral-50 rounded-xl space-y-1.5">
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-neutral-900">📏 Dimensions:</span>
                          <span>{product.dimensions || '600(L) * 600(W) * 75(H) mm (Approx) / 24 Inches Diameter'}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-neutral-900">⚖️ Weight:</span>
                          <span>{product.weight || 'Approx. 3.5 Kgs'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Materials Accordion */}
                <div>
                  <button
                    onClick={() => toggleAccordion('materials')}
                    className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs text-neutral-900 hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Box className="w-4 h-4 text-neutral-600" />
                      <span className="font-bold tracking-wide">Materials</span>
                    </div>
                    {openAccordions.materials ? (
                      <ChevronUp className="w-4 h-4 text-neutral-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-400" />
                    )}
                  </button>

                  {openAccordions.materials && (
                    <div className="px-4 pb-4 pt-1 text-xs text-neutral-700 animate-fade-in border-t border-neutral-100">
                      <div className="p-3 bg-neutral-50 rounded-xl font-medium leading-relaxed">
                        {product.materials || 'Solid wood body with metal rim & center boss (umbo), genuine leather arm straps.'}
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Shipping & Returns Accordion */}
                <div>
                  <button
                    onClick={() => toggleAccordion('shipping')}
                    className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs text-neutral-900 hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Truck className="w-4 h-4 text-neutral-600" />
                      <span className="font-bold tracking-wide">Shipping & Returns</span>
                    </div>
                    {openAccordions.shipping ? (
                      <ChevronUp className="w-4 h-4 text-neutral-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-400" />
                    )}
                  </button>

                  {openAccordions.shipping && (
                    <div className="px-4 pb-4 pt-1 space-y-2 text-xs text-neutral-700 animate-fade-in border-t border-neutral-100">
                      <div className="p-3 bg-neutral-50 rounded-xl space-y-2 leading-relaxed">
                        <div><strong className="text-neutral-900">Manufacturing Unit & Workshop:</strong> 155 / 1A Imli Road, Near Pinewood School, Roorkee Haridwar 247667.</div>
                        <div><strong className="text-neutral-900">Shipping Provider:</strong> DHL Express, FedEx, UPS & All Major International Courier services.</div>
                        <div><strong className="text-neutral-900">Additional Delivery Information:</strong> Order Processing 2 – 5 Business Days. Handcrafted by master artisans with export-grade protective packaging. For custom bulk inquiries or express shipping, please contact our support team.</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 5. Manufacturer Details Accordion */}
                <div>
                  <button
                    onClick={() => toggleAccordion('manufacturer')}
                    className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs text-neutral-900 hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-neutral-600" />
                      <span className="font-bold tracking-wide">Manufacturer Details</span>
                    </div>
                    {openAccordions.manufacturer ? (
                      <ChevronUp className="w-4 h-4 text-neutral-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-400" />
                    )}
                  </button>

                  {openAccordions.manufacturer && (
                    <div className="px-4 pb-4 pt-1 space-y-2 text-xs text-neutral-700 animate-fade-in border-t border-neutral-100">
                      <div className="p-3.5 bg-neutral-50 rounded-xl space-y-2.5 leading-relaxed">
                        <div><strong className="text-neutral-900">Brand / Artisan:</strong> Azim Crafts</div>
                        <div>
                          <strong className="text-neutral-900 block mb-1">Manufacturer & Workshop Address:</strong>
                          <div className="bg-white p-3 rounded-lg border border-neutral-200 font-medium text-neutral-800 leading-relaxed">
                            155 / 1A Imli Road<br />
                            Near Pinewood School<br />
                            Roorkee Haridwar 247667<br />
                            Uttarakhand, India
                          </div>
                        </div>
                        <div className="text-[11px] text-neutral-500">
                          Master craftsmen specializing in authentic hand-forged armor, battle shields, genuine leather journals, and maritime vintage antiques.
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 6. Disclaimer Accordion */}
                <div>
                  <button
                    onClick={() => toggleAccordion('disclaimer')}
                    className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs text-neutral-900 hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckSquare className="w-4 h-4 text-neutral-600" />
                      <span className="font-bold tracking-wide">Disclaimer</span>
                    </div>
                    {openAccordions.disclaimer ? (
                      <ChevronUp className="w-4 h-4 text-neutral-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-400" />
                    )}
                  </button>

                  {openAccordions.disclaimer && (
                    <div className="px-4 pb-4 pt-1 text-xs text-neutral-700 animate-fade-in border-t border-neutral-100">
                      <div className="p-3 bg-neutral-50 rounded-xl leading-relaxed text-neutral-600">
                        {product.disclaimer || 'All of our items are handmade (HANDCRAFTED) by master artisans who employ techniques (TOOLS) and traditions that are often centuries old. Some natural blemishes or imperfections are to be expected. These are not product flaws. Instead, they are precisely what make these pieces so extraordinary and beautiful.'}
                      </div>
                    </div>
                  )}
                </div>

              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
