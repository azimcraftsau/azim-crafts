import React from 'react';
import { ProductCard } from '../product/ProductCard';
import { useCart } from '../../context/CartContext';
import { allProducts } from '../../data/products';
import { ArrowRight, Sparkles } from 'lucide-react';

export const CategoryProductSection = ({
  id,
  tag,
  title,
  subtitle,
  categoryKey,
  productIds = [],
  featuredProductIds = null,
  bgColor = 'bg-white'
}) => {
  const { products, openCategory, openCustomQuote } = useCart();
  const sourceProducts = products && products.length > 0 ? products : allProducts;

  // Retrieve products dynamically by categoryKey, fallback to productIds
  const matchedProducts = categoryKey
    ? sourceProducts.filter(p => p.category === categoryKey)
    : productIds.map(pId => sourceProducts.find(p => p.id === pId)).filter(Boolean);

  if (matchedProducts.length === 0) return null;

  // Show either explicitly selected featured product IDs or the first 4 items
  const displayedProducts = featuredProductIds && featuredProductIds.length > 0
    ? featuredProductIds.map(pId => sourceProducts.find(p => p.id === pId)).filter(Boolean)
    : matchedProducts.slice(0, 4);

  const handleViewAll = (e) => {
    e.preventDefault();
    openCategory(categoryKey || id);
  };

  return (
    <section id={id} className={`py-10 md:py-16 ${bgColor} border-b border-neutral-100 font-menu select-none`}>
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        
        {/* Section Header */}
        <div className="mb-6 pb-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            {tag && (
              <span className="text-xs font-bold text-[#ae2828] uppercase tracking-[0.15em] block mb-1">
                {tag}
              </span>
            )}
            <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-normal text-neutral-900 tracking-wide">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-neutral-500 font-medium mt-1">
                {subtitle}
              </p>
            )}
          </div>

          {/* Quick Custom Link */}
          <button
            onClick={() => openCustomQuote({ categoryName: title, categoryKey: categoryKey || id })}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#b57a2e] hover:text-neutral-900 transition-colors cursor-pointer self-start sm:self-auto py-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#c8924b]" />
            <span>Customize {title} &rarr;</span>
          </button>
        </div>

        {/* Products Grid (Max 4 items per row on homepage) */}
        <div className={`grid gap-3 sm:gap-6 ${
          displayedProducts.length === 1 
            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 max-w-sm sm:max-w-none'
            : displayedProducts.length === 2
            ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
            : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
        }`}>
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Action Controls & Category Bespoke Banner */}
        <div className="mt-8 md:mt-10 space-y-4">
          <div className="text-center">
            <button
              onClick={handleViewAll}
              className="inline-flex items-center gap-2 bg-[#1b1a1a] hover:bg-[#333333] text-white font-semibold text-xs py-3 px-8 rounded-md transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-98 tracking-wider uppercase group"
            >
              <span>View all {title}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Bespoke Category Commission Box */}
          <div className="bg-[#181615] bg-gradient-to-r from-[#181615] via-[#26221e] to-[#181615] text-white rounded-2xl p-5 md:p-6 shadow-md border border-[#c8924b]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 text-center sm:text-left">
              <div className="w-11 h-11 rounded-xl bg-[#c8924b]/20 border border-[#c8924b]/50 flex items-center justify-center shrink-0 text-[#c8924b]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-heading text-sm md:text-base font-bold text-white tracking-wide">
                  Looking for a custom {title}?
                </h4>
                <p className="text-xs text-stone-300 mt-1 max-w-xl leading-relaxed">
                  Need specific dimensions, customized metals, or an exclusive design? Our master artisans handcraft to your exact order.
                </p>
              </div>
            </div>

            <button
              onClick={() => openCustomQuote({ categoryName: title, categoryKey: categoryKey || id })}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#c8924b] hover:bg-[#b57f38] active:scale-98 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all shadow-md cursor-pointer tracking-wider uppercase shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Request Custom Order</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
