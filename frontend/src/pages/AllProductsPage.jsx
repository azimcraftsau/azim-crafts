import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { allProducts } from '../data/products';
import { ProductCard } from '../components/product/ProductCard';
import { Search, ArrowUpDown, Sparkles } from 'lucide-react';

export const AllProductsPage = () => {
  const { products: liveProducts, navigateTo, selectedCategory, setSelectedCategory, categories: dynamicCategories } = useCart();
  const sourceProducts = liveProducts && liveProducts.length > 0 ? liveProducts : allProducts;

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const activeTabRef = useRef(null);

  // Default Categories with Strict Product ID Mapping
  const STATIC_CATEGORIES = [
    { 
      key: 'all', 
      label: 'All Products', 
      productIds: null 
    },
    { 
      key: 'leather-journals', 
      label: 'Handmade Leather Journals', 
      productIds: ['product-14', 'product-15']
    },
    { 
      key: 'vintage-armour', 
      label: 'Vintage Armour & Suits', 
      productIds: ['product-3', 'product-4', 'product-32', 'product-33', 'product-34', 'product-44', 'product-45', 'product-46', 'product-48', 'product-51', 'product-53', 'product-54', 'product-55', 'product-56', 'product-57', 'product-58', 'product-59', 'product-60', 'product-61', 'product-62', 'product-63']
    },
    { 
      key: 'wooden-shields', 
      label: 'Wooden Shields', 
      productIds: ['product-5', 'product-35', 'product-47', 'product-74', 'product-6', 'product-7', 'product-8', 'product-9', 'product-10', 'product-69']
    },
    { 
      key: 'vintage-wall-lights', 
      label: 'Vintage Wall Lights', 
      productIds: ['product-37', 'product-38', 'product-39', 'product-41', 'product-42', 'product-43', 'product-68', 'product-70', 'product-71']
    },
    { 
      key: 'vintage-chandeliers', 
      label: 'Vintage Chandeliers', 
      productIds: ['product-36', 'product-40', 'product-66', 'product-67', 'product-72', 'product-73']
    },
    { 
      key: 'cinematic-antiques', 
      label: 'Cinematic Antiques & Lore', 
      productIds: ['product-1', 'product-2', 'product-65']
    },
    { 
      key: 'fantasy-gothic-armour', 
      label: 'Fantasy & Gothic Armour Suit', 
      productIds: ['product-52', 'product-64']
    },
    { 
      key: 'medieval-helmets', 
      label: 'Vintage Medieval Helmets', 
      productIds: ['product-13', 'product-16', 'product-19', 'product-21', 'product-29']
    },
    { 
      key: 'diving-helmets', 
      label: 'Vintage Diving Helmets', 
      productIds: ['product-20', 'product-23', 'product-24', 'product-26', 'product-30']
    },
    { 
      key: 'vintage-gauntlets', 
      label: 'Vintage Gauntlets', 
      productIds: ['product-11', 'product-49', 'product-50']
    },
    { 
      key: 'vintage-compasses', 
      label: 'Vintage Compasses', 
      productIds: ['product-25', 'product-27', 'product-28', 'product-31']
    },
    { 
      key: 'table-clocks', 
      label: 'Vintage Table & Wall Clocks', 
      productIds: ['product-12', 'product-17']
    },
    { 
      key: 'walking-sticks', 
      label: 'Walking Sticks & Brolly Stand', 
      productIds: ['product-18', 'product-22']
    }
  ];

  // Merge default categories with any dynamic categories added by admin
  const categories = useMemo(() => {
    const baseList = [...STATIC_CATEGORIES];
    if (Array.isArray(dynamicCategories)) {
      dynamicCategories.forEach(cat => {
        if (!baseList.some(c => c.key === cat.key)) {
          baseList.push({
            key: cat.key,
            label: cat.name || cat.title || cat.key,
            productIds: null
          });
        }
      });
    }
    return baseList;
  }, [dynamicCategories]);

  // Filter & Sort Products (Strict category isolation)
  const filteredProducts = useMemo(() => {
    const activeCategoryObj = categories.find((c) => c.key === selectedCategory);

    return sourceProducts
      .filter((product) => {
        // 1. Category Filter (Matches by product.category OR productIds)
        if (selectedCategory !== 'all') {
          const matchesCategory = product.category === selectedCategory;
          const matchesProductId = activeCategoryObj?.productIds?.includes(product.id);
          if (!matchesCategory && !matchesProductId) {
            return false;
          }
        }

        // 2. Search Query Filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchTitle = product.title && product.title.toLowerCase().includes(query);
          const matchDesc = product.description && product.description.toLowerCase().includes(query);
          const matchCategory = product.category && product.category.toLowerCase().includes(query);
          if (!matchTitle && !matchDesc && !matchCategory) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'name-asc') return a.title.localeCompare(b.title);
        if (sortBy === 'name-desc') return b.title.localeCompare(a.title);
        return 0; // Default featured order
      });
  }, [sourceProducts, selectedCategory, searchQuery, sortBy]);

  const activeCategoryObj = categories.find((c) => c.key === selectedCategory) || categories[0];
  const isAll = selectedCategory === 'all';

  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedCategory]);

  return (
    <div className="bg-[#fcfaf7] min-h-screen font-menu select-none py-6 md:py-10">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        
        {/* Breadcrumb Header */}
        <div className="flex items-center gap-2 text-xs text-neutral-500 mb-4">
          <button 
            onClick={() => navigateTo('home')}
            className="hover:text-neutral-900 transition-colors cursor-pointer"
          >
            Home
          </button>
          <span>/</span>
          {isAll ? (
            <span className="text-neutral-900 font-semibold">All Products</span>
          ) : (
            <>
              <button
                onClick={() => setSelectedCategory('all')}
                className="hover:text-neutral-900 transition-colors cursor-pointer"
              >
                All Products
              </button>
              <span>/</span>
              <span className="text-neutral-900 font-semibold">{activeCategoryObj.label}</span>
            </>
          )}
        </div>

        {/* Page Title Banner */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 md:p-8 mb-6 shadow-xs text-center relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>{isAll ? 'Full Master Catalog' : `${filteredProducts.length} Authentic Items`}</span>
            </div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-neutral-900 tracking-wide">
              {isAll ? 'All Products' : activeCategoryObj.label}
            </h1>
            <p className="text-xs md:text-sm text-neutral-600 leading-relaxed font-medium">
              {isAll 
                ? 'Explore our complete collection of authentic handcrafted historical reproductions, nautical antiques, medieval armour, and leather crafts.'
                : `Explore our authentic handcrafted ${activeCategoryObj.label} collection made by master artisans at our Roorkee workshop with worldwide express delivery.`}
            </p>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4 mb-6 shadow-2xs space-y-3.5">
          
          {/* Category Filter Pills (Auto-scrolls to active category) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {categories.map((cat) => (
              <button
                key={cat.key}
                ref={selectedCategory === cat.key ? activeTabRef : null}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  selectedCategory === cat.key
                    ? 'bg-[#1b1a1a] text-white shadow-xs scale-102'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Controls Bar: Search + Sort Dropdown */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-neutral-100">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all"
              />
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <ArrowUpDown className="w-3.5 h-3.5 text-neutral-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-neutral-50 border border-neutral-200 text-xs font-semibold text-neutral-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900 cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Alphabetical: A-Z</option>
                <option value="name-desc">Alphabetical: Z-A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center space-y-3 my-8">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-lg font-bold text-neutral-900">
              No matching products found
            </h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              We couldn't find any products matching your current filters. Try changing your search keywords or category selection.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
              }}
              className="bg-[#c8924b] hover:bg-[#b57f38] text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-all cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
