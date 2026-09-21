import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { allProducts } from '../../data/products';

export const SearchModal = () => {
  const { products, isSearchOpen, setIsSearchOpen, setQuickViewProduct, addToCart } = useCart();
  const sourceProducts = products && products.length > 0 ? products : allProducts;
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const filteredProducts = query.trim() === ''
    ? []
    : sourceProducts.filter(p =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.categoryName?.toLowerCase().includes(query.toLowerCase()) ||
        p.description?.toLowerCase().includes(query.toLowerCase())
      );

  const quickTags = ['Compass', 'Helmet', 'Walking Stick', 'Leather Journal', 'Globe', 'Armillary', 'Sextant'];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={() => setIsSearchOpen(false)}
      />

      <div className="relative min-h-screen flex items-start justify-center p-4 sm:p-6 md:p-12">
        <div className="relative bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden animate-fade-in border border-neutral-200">
          
          {/* Search Input Bar */}
          <div className="p-4 sm:p-6 border-b border-neutral-200 bg-neutral-50 flex items-center gap-3">
            <Search className="w-5 h-5 text-neutral-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search products, collections, keywords..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent text-base md:text-lg text-neutral-900 placeholder-neutral-400 focus:outline-none font-medium"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-xs text-neutral-400 hover:text-black font-semibold uppercase px-2 py-1"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setIsSearchOpen(false)}
              className="p-1.5 rounded-full hover:bg-neutral-200 text-neutral-500 hover:text-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Suggestions & Tags */}
          <div className="px-6 py-3 bg-neutral-100/70 border-b border-neutral-200 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-neutral-500 font-medium">Popular Searches:</span>
            {quickTags.map((tag, idx) => (
              <button
                key={idx}
                onClick={() => setQuery(tag)}
                className="bg-white hover:bg-[#1b1a1a] hover:text-white px-2.5 py-1 rounded-full text-neutral-700 font-medium border border-neutral-200 transition-colors shadow-2xs"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Results Area */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {query.trim() === '' ? (
              <div className="py-12 text-center text-neutral-400">
                <Search className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
                <p className="text-sm font-medium text-neutral-600">Start typing to search products...</p>
                <p className="text-xs text-neutral-400 mt-1">Search through over 30+ vintage handcrafted items</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-12 text-center text-neutral-500">
                <p className="text-base font-semibold text-neutral-800">No results found for "{query}"</p>
                <p className="text-xs text-neutral-400 mt-1">Check spelling or try broader terms like "helmet" or "compass"</p>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between text-xs text-neutral-500 mb-4 pb-2 border-b border-neutral-100">
                  <span>Found <strong>{filteredProducts.length}</strong> items matching "{query}"</span>
                  <span className="text-neutral-400">Press Esc to close</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        setQuickViewProduct(product);
                      }}
                      className="flex items-center gap-3.5 p-3 rounded-lg border border-neutral-100 hover:border-neutral-300 hover:bg-neutral-50/50 transition-all cursor-pointer group"
                    >
                      <img
                        src={product.image}
                        alt={product.title}
                        loading="lazy"
                        className="w-16 h-16 object-cover rounded bg-neutral-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase font-medium text-neutral-400 block truncate">
                          {product.categoryName || product.vendor}
                        </span>
                        <h4 className="font-heading text-xs font-semibold text-neutral-900 line-clamp-2 group-hover:text-[#ae2828] transition-colors leading-snug">
                          {product.title}
                        </h4>
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-xs font-bold text-neutral-900">
                            ${product.price.toFixed(2)} USD
                          </span>
                          {product.isSoldOut ? (
                            <span className="text-[10px] bg-neutral-200 text-neutral-600 px-1.5 py-0.5 rounded font-medium">
                              Sold out
                            </span>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(product, 1);
                                setIsSearchOpen(false);
                              }}
                              className="text-[11px] text-white bg-[#1b1a1a] hover:bg-[#333333] px-2 py-0.5 rounded font-medium transition-colors"
                            >
                              Add
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
