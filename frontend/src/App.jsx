import React, { lazy, Suspense } from 'react';
import { CartProvider, useCart } from './context/CartContext';

const AdminApp = lazy(() => import('./admin/AdminApp'));
import { AnnouncementBar } from './components/layout/AnnouncementBar';
import { Header } from './components/layout/Header';
import { HeroSlider } from './components/home/HeroSlider';
import { CategoryProductSection } from './components/home/CategoryProductSection';
import { CollectionCategories } from './components/home/CollectionCategories';
import { AwardsSection } from './components/home/AwardsSection';
import { ReviewsCarousel } from './components/home/ReviewsCarousel';
import { AboutUsSection } from './components/home/AboutUsSection';
import { NewsletterSection } from './components/home/NewsletterSection';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/modals/CartDrawer';
import { SearchModal } from './components/modals/SearchModal';
import { QuickViewModal } from './components/product/QuickViewModal';
import { Toast } from './components/modals/Toast';
import { WelcomeOfferModal } from './components/modals/WelcomeOfferModal';
import { AuthModal } from './components/modals/AuthModal';
import { ChatWidget } from './components/layout/ChatWidget';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AccountPage } from './pages/AccountPage';
import { AllProductsPage } from './pages/AllProductsPage';
import { ErrorBoundary } from './components/common/ErrorBoundary';

function AppContent() {
  const { currentPage } = useCart();

  // Distraction-Free Dedicated Checkout Page matching screenshot
  if (currentPage === 'checkout') {
    return (
      <ErrorBoundary
        title="Checkout Encountered a Temporary Error"
        description="We could not load the checkout page. Your cart items are saved and completely safe."
      >
        <div className="min-h-screen bg-white text-[#131313]">
          <CheckoutPage />
          <Toast />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#131313]">
      {/* Top Banner */}
      <AnnouncementBar />

      {/* Main Single-Line Header */}
      <Header />

      {/* Main Page Routing */}
      {currentPage === 'cart' ? (
        <main id="MainContent" className="flex-1">
          <CartPage />
        </main>
      ) : currentPage === 'account' ? (
        <main id="MainContent" className="flex-1">
          <AccountPage />
        </main>
      ) : currentPage === 'all-products' ? (
        <main id="MainContent" className="flex-1">
          <AllProductsPage />
        </main>
      ) : (
        <main id="MainContent" className="flex-1 focus:none">
          {/* 1. Hero 3-Panel Cinematic Banner */}
          <HeroSlider />

          {/* 2. Explore Signature Categories Carousel (Vintage Collection) */}
          <CollectionCategories />

          {/* 1. Handmade Leather Journals */}
          <CategoryProductSection
            id="leather-journals"
            categoryKey="leather-journals"
            tag="ANTIQUE DECKLE-EDGE COTTON PAPER"
            title="Handmade Leather Journals"
            subtitle="Embossed genuine buffalo leather grimoires, travel diaries & artist sketchbooks"
            bgColor="bg-white"
          />

          {/* 2. Vintage Armour & Suits */}
          <CategoryProductSection
            id="vintage-armour"
            categoryKey="vintage-armour"
            tag="16TH-CENTURY ARTICULATION & SUITS"
            title="Vintage Armour & Suits"
            subtitle="Full body knight plate armour suits, chainmail, articulated pauldrons & sabatons"
            bgColor="bg-[#fbfaf8]"
          />

          {/* 3. Wooden Shields */}
          <CategoryProductSection
            id="wooden-shields"
            categoryKey="wooden-shields"
            tag="HAND-CARVED NORSE & BATTLE SHIELDS"
            title="Wooden Shields"
            subtitle="Authentic solid wood round shields with metal rim, steel umbo & hand-painted knotwork"
            featuredProductIds={['product-5', 'product-35', 'product-47', 'product-74']}
            bgColor="bg-white"
          />

          {/* 4. Vintage Wall Lights */}
          <CategoryProductSection
            id="vintage-wall-lights"
            categoryKey="vintage-wall-lights"
            tag="HAND-FORGED WROUGHT IRON LIGHTING"
            title="Vintage Wall Lights"
            subtitle="Gothic wrought iron wall sconces, industrial pipe lamps & torch light candle sconces"
            bgColor="bg-[#fbfaf8]"
          />

          {/* 5. Vintage Chandeliers */}
          <CategoryProductSection
            id="vintage-chandeliers"
            categoryKey="vintage-chandeliers"
            tag="MEDIEVAL & INDUSTRIAL CEILING LIGHTS"
            title="Vintage Chandeliers"
            subtitle="Grand Gothic wrought iron chandeliers, rustic wagon wheel & farmhouse ring pendants"
            bgColor="bg-white"
          />

          {/* 6. Cinematic Antiques & Lore */}
          <CategoryProductSection
            id="cinematic-antiques"
            categoryKey="cinematic-antiques"
            tag="ICONIC MOVIE & HISTORICAL ARTIFACTS"
            title="Cinematic Antiques & Lore"
            subtitle="Legendary battle props, Thor Mjolnir war hammer & handcrafted hero round shields"
            bgColor="bg-[#fbfaf8]"
          />

          {/* 7. Fantasy & Gothic Armour Suit */}
          <CategoryProductSection
            id="fantasy-gothic-armour"
            categoryKey="fantasy-gothic-armour"
            tag="DARK LORD & FANTASY STEEL ARMOUR"
            title="Fantasy & Gothic Armour Suit"
            subtitle="Witch-King of Angmar & Lord Sauron dark gothic full body steel costumes"
            bgColor="bg-white"
          />

          {/* 8. Vintage Medieval Helmets */}
          <CategoryProductSection
            id="medieval-helmets"
            categoryKey="medieval-helmets"
            tag="HAND-FORGED 18-GAUGE STEEL"
            title="Vintage Medieval & Spartan Helmets"
            subtitle="Authentic wearable Spartan centurions, Crusader knights & miniature desk helmets"
            bgColor="bg-[#fbfaf8]"
          />

          {/* 9. Vintage Diving Helmets */}
          <CategoryProductSection
            id="diving-helmets"
            categoryKey="diving-helmets"
            tag="MARITIME DEEP SEA EXPLORATION"
            title="Vintage Diving Helmets"
            subtitle="Solid copper & brass US Navy Mark V master replica diving helmets"
            bgColor="bg-white"
          />

          {/* 10. Vintage Gauntlets */}
          <CategoryProductSection
            id="vintage-gauntlets"
            categoryKey="vintage-gauntlets"
            tag="ARTICULATED STEEL HAND ARMOUR"
            title="Vintage Gauntlets"
            subtitle="Hand-formed 18-gauge articulated steel combat gloves & dragon scale knight gauntlets"
            bgColor="bg-[#fbfaf8]"
          />

          {/* 11. Vintage Compasses & Sextants */}
          <CategoryProductSection
            id="vintage-compasses"
            categoryKey="vintage-compasses"
            tag="AUTHENTIC NAVIGATIONAL INSTRUMENTS"
            title="Vintage Compasses & Sextants"
            subtitle="Calibrated solid brass maritime compasses, sundials & teakwood heirloom boxes"
            bgColor="bg-white"
          />

          {/* 12. Vintage Table & Wall Clocks */}
          <CategoryProductSection
            id="table-clocks"
            categoryKey="table-clocks"
            tag="VICTORIAN DESK & WALL TIMEPIECES"
            title="Vintage Table & Wall Clocks"
            subtitle="Handcrafted brass tabletop clocks, Australian Penny coin faces & vintage timepieces"
            bgColor="bg-[#fbfaf8]"
          />

          {/* 13. Walking Sticks & Brolly Stand */}
          <CategoryProductSection
            id="walking-sticks"
            categoryKey="walking-sticks"
            tag="GENTLEMAN'S VICTORIAN WALKING CANES"
            title="Walking Sticks & Brolly Stand"
            subtitle="Solid hardwood canes with solid brass handles & vintage umbrella display stands"
            bgColor="bg-white"
          />

          {/* 12. Awards & Recognitions with Verify Modal */}
          <AwardsSection />

          {/* 13. Customer Reviews Carousel */}
          <ReviewsCarousel />

          {/* 14. About Us Dual Column Story */}
          <AboutUsSection />

          {/* 15. Newsletter Signup */}
          <NewsletterSection />
        </main>
      )}

      {/* Comprehensive Footer */}
      <Footer />

      {/* Global Interactive Modals & Drawers */}
      <CartDrawer />
      <AuthModal />
      <SearchModal />
      <QuickViewModal />
      <Toast />
      <WelcomeOfferModal />
      <ChatWidget />
    </div>
  );
}

export function App() {
  const [currentHash, setCurrentHash] = React.useState(() => window.location.hash);
  const [currentPath, setCurrentPath] = React.useState(() => window.location.pathname);

  React.useEffect(() => {
    const handleRoute = () => {
      setCurrentHash(window.location.hash);
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('popstate', handleRoute);
    return () => {
      window.removeEventListener('hashchange', handleRoute);
      window.removeEventListener('popstate', handleRoute);
    };
  }, []);

  const isAdmin =
    currentHash === '#admin' ||
    currentHash.startsWith('#admin/') ||
    currentPath === '/admin';

  if (isAdmin) {
    return (
      <Suspense fallback={
        <div className="min-h-screen bg-[#0f1117] flex items-center justify-center text-white text-lg tracking-widest">
          Loading Admin...
        </div>
      }>
        <AdminApp />
      </Suspense>
    );
  }

  return (
    <ErrorBoundary>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </ErrorBoundary>
  );
}

export default App;
