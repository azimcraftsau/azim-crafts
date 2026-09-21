import React, { useRef, useEffect } from 'react';
import { allProducts } from '../../data/products';
import { useCart } from '../../context/CartContext';
import { ArrowRight } from 'lucide-react';

export const CollectionCategories = () => {
  const { products, openCategory, openCategoryCollection } = useCart();
  const sourceProducts = products && products.length > 0 ? products : allProducts;
  const scrollRef = useRef(null);

  const getCategoryProducts = (catKey, ids = []) => {
    const byCategory = sourceProducts.filter(p => p.category === catKey);
    if (byCategory.length > 0) return byCategory;
    return ids.map(id => sourceProducts.find(p => p.id === id)).filter(Boolean);
  };

  const collectionsList = [
    {
      id: 'leather-journals',
      title: 'Handmade Leather Journals',
      subtitle: 'Embossed genuine buffalo leather journals with deckle-edge cotton paper',
      image: '/All categories/Handmade Leather Journals/product 14/1.jpg',
      itemCount: '2 items',
      products: getCategoryProducts('leather-journals')
    },
    {
      id: 'vintage-armour',
      title: 'Vintage Armour & Suits',
      subtitle: 'Full medieval plate armour suits, chainmail & articulated knight sets',
      image: '/All categories/Vintage Armour & Suits/Product 44/1.jpeg',
      itemCount: '21 items',
      products: getCategoryProducts('vintage-armour')
    },
    {
      id: 'wooden-shields',
      title: 'Wooden Shields',
      subtitle: 'Handcrafted solid wood round shields with steel rim & Norse umbo boss',
      image: '/All categories/Wooden Shields/Product 47/1.jpeg',
      itemCount: '10 items',
      products: getCategoryProducts('wooden-shields')
    },
    {
      id: 'vintage-wall-lights',
      title: 'Vintage Wall Lights',
      subtitle: 'Gothic wrought iron wall sconces, torch lights & industrial pipe lamps',
      image: '/All categories/Vintage Wall Lights/Product 38/1.jpeg',
      itemCount: '9 items',
      products: getCategoryProducts('vintage-wall-lights')
    },
    {
      id: 'vintage-chandeliers',
      title: 'Vintage Chandeliers',
      subtitle: 'Handforged wrought iron chandeliers – Gothic, wagon wheel & farmhouse styles',
      image: '/All categories/Vintage Chandeliers/Product 40/1.jpeg',
      itemCount: '6 items',
      products: getCategoryProducts('vintage-chandeliers')
    },
    {
      id: 'cinematic-antiques',
      title: 'Cinematic Antiques & Lore',
      subtitle: 'Legendary battle props, Thor Mjolnir hammers & iconic warrior shields',
      image: '/All categories/Cinematic Antiques & Lore/product 1/1.jpeg',
      itemCount: '3 items',
      products: getCategoryProducts('cinematic-antiques')
    },
    {
      id: 'fantasy-gothic-armour',
      title: 'Fantasy & Gothic Armour Suit',
      subtitle: 'Witch-King, Sauron & dark lord gothic full body armour suits',
      image: '/All categories/Fantasy & Gothic Armour Suit/Product 64/1.jpeg',
      itemCount: '2 items',
      products: getCategoryProducts('fantasy-gothic-armour')
    },
    {
      id: 'medieval-helmets',
      title: 'Vintage Medieval Helmets',
      subtitle: 'Hand-forged steel helmets, Spartan centurions & Crusader knights',
      image: '/All categories/Vintage Medieval Helmets/product 13/1.jpg',
      itemCount: '5 items',
      products: getCategoryProducts('medieval-helmets')
    },
    {
      id: 'diving-helmets',
      title: 'Vintage Diving Helmets',
      subtitle: 'Solid brass & copper US Navy Mark V deep-sea master replica helmets',
      image: '/All categories/Vintage Diving Helmets/product 20/1.jpg',
      itemCount: '5 items',
      products: getCategoryProducts('diving-helmets')
    },
    {
      id: 'vintage-gauntlets',
      title: 'Vintage Gauntlets',
      subtitle: 'Articulated medieval finger gauntlets & dragon-scale knight hand armour',
      image: '/All categories/Vintage Gauntlets/Product 49/1.jpeg',
      itemCount: '3 items',
      products: getCategoryProducts('vintage-gauntlets')
    },
    {
      id: 'vintage-compasses',
      title: 'Vintage Compasses',
      subtitle: 'Solid brass nautical instruments, calibrated sundials & teakwood boxes',
      image: '/All categories/Vintage Compasses/product 28/1.jpg',
      itemCount: '4 items',
      products: getCategoryProducts('vintage-compasses')
    },
    {
      id: 'table-clocks',
      title: 'Vintage Table & Wall Clocks',
      subtitle: 'Victorian brass timepieces & Australian Penny coin table clocks',
      image: '/All categories/Vintage Table & Wall Clocks/product 12/1.jpg',
      itemCount: '2 items',
      products: getCategoryProducts('table-clocks')
    },
    {
      id: 'walking-sticks',
      title: 'Walking Sticks & Brolly Stand',
      subtitle: 'Solid hardwood canes with Victorian brass handles & umbrella stands',
      image: '/All categories/Walking Sticks & Brolly Stand/product 18/1.jpg',
      itemCount: '2 items',
      products: getCategoryProducts('walking-sticks')
    }
  ];

  // Auto slide smoothly right-to-left every 3.8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      if (!scrollRef.current) return;
      const cardWidth = scrollRef.current.firstChild?.offsetWidth || 280;
      const gap = 16;
      const maxScroll = scrollRef.current.scrollWidth - scrollRef.current.clientWidth;

      if (scrollRef.current.scrollLeft >= maxScroll - 10) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: cardWidth + gap, behavior: 'smooth' });
      }
    }, 3800);

    return () => clearInterval(timer);
  }, []);

  return (
    <section id="categories-section" className="py-10 md:py-16 bg-white border-b border-neutral-100 font-menu select-none">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        
        {/* Section Heading */}
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-neutral-200">
          <div>
            <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-normal text-neutral-900 tracking-wide">
              Vintage Collection
            </h2>
          </div>
          <button
            onClick={() => openCategory('all')}
            className="text-xs md:text-sm font-semibold text-neutral-700 hover:text-[#ae2828] underline underline-offset-4 transition-colors cursor-pointer"
          >
            Explore All Collections
          </button>
        </div>

        {/* Horizontal Slider (Right-to-Left Natural Sliding Carousel) */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 pb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {collectionsList.map((cat) => (
            <div
              key={cat.id}
              onClick={() => openCategory(cat.id)}
              className="w-[260px] sm:w-[280px] md:w-[300px] shrink-0 snap-start group relative rounded-xl overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 bg-black border border-neutral-200 hover:border-neutral-400 cursor-pointer"
            >
              {/* Category Image Box - Edge to Edge */}
              <div className="aspect-[4/5] w-full overflow-hidden relative bg-black flex items-center justify-center">
                <img
                  src={cat.image}
                  alt={cat.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-106"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                
                {/* Title & Arrow Box */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="font-heading text-lg md:text-xl font-normal leading-snug tracking-wide text-white group-hover:text-[#f7eddb] transition-colors mb-2">
                    {cat.title}
                  </h3>
                  
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#f7eddb] group-hover:underline">
                    <span>View All {cat.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
