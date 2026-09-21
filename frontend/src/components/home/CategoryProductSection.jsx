import React from 'react';
import { ProductCard } from '../product/ProductCard';
import { useCart } from '../../context/CartContext';
import { allProducts } from '../../data/products';
import { ArrowRight } from 'lucide-react';

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
  const { products, openCategory, openCategoryCollection } = useCart();
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
        
        {/* Section Header (Clean without top-right button) */}
        <div className="mb-6 pb-4 border-b border-neutral-200">
          {tag && (
            <span className="text-[11px] font-bold text-[#ae2828] uppercase tracking-[0.15em] block mb-1">
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

        {/* View All Button below products */}
        <div className="mt-8 md:mt-10 text-center">
          <button
            onClick={handleViewAll}
            className="inline-flex items-center gap-2 border border-neutral-900 hover:bg-neutral-900 hover:text-white text-neutral-900 font-semibold text-xs py-3 px-8 rounded-md transition-all shadow-2xs cursor-pointer active:scale-98 tracking-wider uppercase group"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  );
};
