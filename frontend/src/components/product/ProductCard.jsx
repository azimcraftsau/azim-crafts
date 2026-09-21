import React, { useState, useEffect, useRef } from 'react';
import { Play } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const ProductCard = ({ product }) => {
  const { setQuickViewProduct } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const hoverIntervalRef = useRef(null);

  const imagesList = product.images && product.images.length > 0 ? product.images : [product.image];
  const videosList = Array.isArray(product.videos) ? product.videos.filter(Boolean) : (product.video ? [product.video] : []);
  
  // Combine all images with video at the end
  const mediaList = [
    ...imagesList.map(src => ({ type: 'image', src })),
    ...videosList.map(src => ({ type: 'video', src }))
  ];
  const hasMultipleMedia = mediaList.length > 1;

  // Auto-cycle through all product images and auto-play video on hover
  useEffect(() => {
    if (isHovered && hasMultipleMedia) {
      const isVideo = mediaList[activeImageIndex]?.type === 'video';
      const delay = isVideo ? 3500 : 1000;

      const timer = setTimeout(() => {
        setActiveImageIndex((prevIndex) => (prevIndex + 1) % mediaList.length);
      }, delay);

      return () => clearTimeout(timer);
    } else {
      setActiveImageIndex(0); // Instantly reset to primary image 1
    }
  }, [isHovered, hasMultipleMedia, activeImageIndex, mediaList.length]);

  const handleCardClick = (e) => {
    e.preventDefault();
    setQuickViewProduct(product);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setActiveImageIndex(0); // Guarantee reset to Image 1
  };

  const stockQty = product.stockQuantity !== undefined 
    ? Number(product.stockQuantity) 
    : (product.stock_quantity !== undefined ? Number(product.stock_quantity) : 10);
  const isSoldOut = Boolean(product.isSoldOut) || stockQty <= 0;
  const isLowStock = !isSoldOut && stockQty > 0 && stockQty <= 5;

  const currentMedia = mediaList[activeImageIndex] || mediaList[0] || { type: 'image', src: product.image };

  return (
    <div 
      className="group relative flex flex-col justify-between bg-white rounded-xl border border-neutral-200 hover:border-neutral-400 hover:shadow-md p-3 sm:p-4 transition-all duration-300 cursor-pointer select-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
    >
      {/* Product Media Container */}
      <div className="aspect-square w-full relative mb-3 bg-white rounded-lg overflow-hidden flex items-center justify-center">
        
        {/* Sold Out Badge (only if sold out) */}
        {isSoldOut ? (
          <div className="absolute top-1 left-1 z-10">
            <span className="bg-[#757575] text-white text-[9.5px] font-semibold px-2 py-0.5 rounded-xs tracking-wider uppercase shadow-2xs">
              Sold out
            </span>
          </div>
        ) : product.badge ? (
          <div className="absolute top-2 left-2 z-10">
            <span className="bg-[#ae2828] text-white text-[9.5px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider shadow-xs">
              {product.badge}
            </span>
          </div>
        ) : null}

        {/* Video Badge (Top Right) */}
        {videosList.length > 0 && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-black/80 backdrop-blur-xs text-white text-[9.5px] font-bold px-2 py-0.5 rounded-full shadow-xs border border-white/10 group-hover:bg-[#ae2828] transition-colors">
            <Play className="w-2.5 h-2.5 fill-white" />
            <span>Video</span>
          </div>
        )}

        {/* Product Media Display (Cycles through photos and auto-plays video on hover) */}
        {currentMedia.type === 'video' ? (
          <video
            src={currentMedia.src}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="w-full h-full object-contain p-1 rounded-lg bg-black"
          />
        ) : (
          <img
            src={encodeURI(currentMedia.src || '')}
            alt={product.title}
            className="w-full h-full object-contain p-1 transition-all duration-300 transform group-hover:scale-105"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              if (product.image && e.target.src !== encodeURI(product.image)) {
                e.target.src = encodeURI(product.image);
              } else {
                e.target.src = '/logo.png';
              }
            }}
          />
        )}

        {/* Bottom thumbnail mini dots when hovered */}
        {hasMultipleMedia && isHovered && (
          <div className="absolute bottom-1.5 inset-x-0 z-10 flex items-center justify-center gap-1 animate-fade-in">
            {mediaList.map((item, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeImageIndex === idx 
                    ? (item.type === 'video' ? 'w-4 bg-red-600' : 'w-3.5 bg-neutral-900') 
                    : 'w-1.5 bg-neutral-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product Details */}
      <div className="flex-1 flex flex-col justify-between text-left space-y-2.5">
        <div>
          {/* Vendor */}
          <div className="text-[10px] font-medium tracking-[0.08em] text-neutral-400 uppercase mb-0.5">
            {product.vendor || 'Azim Crafts'}
          </div>

          {/* Title */}
          <h3 className="font-heading text-xs sm:text-[13.5px] font-normal text-neutral-900 leading-snug line-clamp-2 group-hover:text-[#ae2828] transition-colors">
            {product.title}
          </h3>

          {/* Low Stock Alert Badge / Sold Out Label */}
          {isLowStock ? (
            <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50/90 border border-amber-200/90 px-2 py-0.5 rounded-md">
              <span className="animate-pulse text-xs">🔥</span>
              <span>Only {stockQty} left in stock!</span>
            </div>
          ) : isSoldOut ? (
            <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-md">
              <span>Sold out</span>
            </div>
          ) : null}
        </div>

        {/* Polished Price Button Box */}
        <div className="w-full border border-neutral-300 group-hover:border-neutral-800 rounded-md py-2 px-3 text-center bg-white group-hover:bg-neutral-50/80 transition-all shadow-2xs">
          {isSoldOut ? (
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-xs sm:text-[13px] font-semibold text-neutral-400 uppercase tracking-wide">
                Sold Out
              </span>
              <span className="text-xs text-neutral-400">
                • ${product.price.toFixed(2)} USD
              </span>
            </div>
          ) : (product.isOnSale || (product.regularPrice && Number(product.regularPrice) > Number(product.price)) || (product.regular_price && Number(product.regular_price) > Number(product.price))) ? (
            <div className="flex items-center justify-center gap-1.5">
              <span className="text-xs sm:text-[13px] font-bold text-[#ae2828]">
                ${Number(product.price).toFixed(2)} USD
              </span>
              <span className="text-[10.5px] text-neutral-400 line-through">
                ${Number(product.regularPrice || product.regular_price).toFixed(2)}
              </span>
            </div>
          ) : (
            <span className="text-xs sm:text-[13px] font-semibold text-neutral-900 tracking-wide">
              ${Number(product.price).toFixed(2)} USD
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
