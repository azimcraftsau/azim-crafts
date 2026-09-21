import React, { createContext, useContext, useState, useEffect } from 'react';
import { allProducts } from '../data/products';
import { getProducts, getCoupons, getOrders } from '../lib/cloudflareService';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [products, setProducts] = useState(allProducts);
  const [couponsList, setCouponsList] = useState([]);

  useEffect(() => {
    let isMounted = true;

    const refreshProducts = async () => {
      try {
        const data = await getProducts();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      } catch (err) {
        console.warn('Failed to refresh products from DB:', err);
      }
    };

    const refreshCoupons = async () => {
      try {
        const data = await getCoupons();
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setCouponsList(data);
        }
      } catch (err) {}
    };

    refreshProducts();
    refreshCoupons();

    window.addEventListener('vw_products_updated', refreshProducts);
    window.addEventListener('vw_coupons_updated', refreshCoupons);
    window.addEventListener('focus', refreshProducts);

    return () => {
      isMounted = false;
      window.removeEventListener('vw_products_updated', refreshProducts);
      window.removeEventListener('vw_coupons_updated', refreshCoupons);
      window.removeEventListener('focus', refreshProducts);
    };
  }, []);

  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('vw_cart');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.map(item => {
        if (!item) return null;
        if (item.product && typeof item.product === 'object') {
          return {
            product: {
              ...item.product,
              price: Number(item.product.price) || 0
            },
            quantity: Number(item.quantity) || 1,
            selectedSize: item.selectedSize || null
          };
        }
        return {
          product: {
            id: item.id || 'item-' + Math.random(),
            title: item.title || 'Vintage Item',
            price: Number(item.price) || 0,
            image: item.image || '/vintage-to-modern-logo.png',
            vendor: item.vendor || 'Azim Crafts'
          },
          quantity: Number(item.quantity) || 1,
          selectedSize: item.selectedSize || null
        };
      }).filter(Boolean);
    } catch {
      return [];
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('vw_user') || localStorage.getItem('vw_user_account');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authRedirectAction, setAuthRedirectAction] = useState(null);

  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('vw_applied_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState('home'); // 'home' | 'cart' | 'checkout' | 'account' | 'all-products'
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [quickViewProduct, setQuickViewProductState] = useState(null);
  const [activeCategoryCollection, setActiveCategoryCollection] = useState(null);
  const [toast, setToast] = useState(null);

  // Debounced cart saving to prevent micro-stutter on rapid item updates (STORE-006)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem('vw_cart', JSON.stringify(cart));
      } catch (e) {
        console.error(e);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [cart]);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('vw_user', JSON.stringify(user));
        localStorage.setItem('vw_user_account', JSON.stringify(user));
      } else {
        localStorage.removeItem('vw_user');
        localStorage.removeItem('vw_user_account');
      }
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  // Verify user session validity on startup (Removed insecure list_users call)
  useEffect(() => {
    // Session is maintained locally via localStorage.
    // Real validation happens securely on the backend when orders are placed.
  }, []);

  // Handle URL changes / Mobile Hardware Back Button Navigation
  useEffect(() => {
    const handleLocationChange = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;

      // 1. Handle Product Detail Hash / Route
      if (hash.startsWith('#product-')) {
        const prodId = hash.replace('#product-', '');
        const currentProducts = (() => {
          try {
            const saved = localStorage.getItem('vw_admin_products');
            return saved ? JSON.parse(saved) : (products || allProducts);
          } catch {
            return products || allProducts;
          }
        })();
        const found = currentProducts.find(p => String(p.id) === String(prodId)) || allProducts.find(p => String(p.id) === String(prodId));
        if (found) {
          setQuickViewProductState(found);
        }
      } else {
        setQuickViewProductState(null);
      }

      // 2. Handle Collection Hash / Route
      if (!hash.startsWith('#product-') && !hash.startsWith('#collection-')) {
        setActiveCategoryCollection(null);
      }

      // 3. Handle Page Routing & Category parameters
      if (path === '/checkout' || hash === '#checkout') {
        setCurrentPage('checkout');
        setIsCartOpen(false);
      } else if (path === '/cart' || hash === '#cart') {
        setCurrentPage('cart');
        setIsCartOpen(false);
      } else if (path === '/account/login' || path === '/account' || path === '/reset' || hash.startsWith('#account') || hash.startsWith('#reset')) {
        setCurrentPage('account');
        setIsCartOpen(false);
      } else if (path === '/collections/all' || path === '/products' || hash.startsWith('#all-products') || hash === '#products') {
        setCurrentPage('all-products');
        if (hash.includes('?cat=')) {
          const cat = hash.split('?cat=')[1];
          if (cat) setSelectedCategory(cat);
        }
        setIsCartOpen(false);
      } else {
        setCurrentPage('home');
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigateTo = (page, targetCategory = null) => {
    setCurrentPage(page);
    setQuickViewProductState(null);
    setActiveCategoryCollection(null);
    setIsCartOpen(false);

    if (page === 'checkout') {
      window.history.pushState({ page: 'checkout' }, '', '#checkout');
    } else if (page === 'cart') {
      window.history.pushState({ page: 'cart' }, '', '#cart');
    } else if (page === 'account') {
      window.history.pushState({ page: 'account' }, '', '#account');
    } else if (page === 'all-products') {
      if (targetCategory) {
        setSelectedCategory(targetCategory);
        window.history.pushState({ page: 'all-products', category: targetCategory }, '', `#all-products?cat=${targetCategory}`);
      } else {
        window.history.pushState({ page: 'all-products' }, '', '#all-products');
      }
    } else {
      window.history.pushState({ page: 'home' }, '', window.location.pathname);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openCategory = (categoryKey = 'all') => {
    navigateTo('all-products', categoryKey);
  };

  const openCategoryCollection = (collectionOrKey) => {
    if (!collectionOrKey) {
      setActiveCategoryCollection(null);
      return;
    }

    const key = typeof collectionOrKey === 'string' 
      ? collectionOrKey 
      : (collectionOrKey.id || collectionOrKey.categoryKey || collectionOrKey.category || 'all');

    // Alias mapping for backwards compatibility
    const aliasMap = {
      'shields': 'wooden-shields',
      'armour': 'vintage-armour',
      'leather': 'leather-journals',
      'compasses': 'vintage-compasses',
      'divingHelmets': 'diving-helmets',
      'clocks': 'table-clocks',
      'warriors': 'vintage-armour'
    };

    const resolvedKey = aliasMap[key] || key;
    setActiveCategoryCollection(null);
    navigateTo('all-products', resolvedKey);
  };

  const closeCategoryCollection = () => {
    setActiveCategoryCollection(null);
    setQuickViewProductState(null);
    if (window.location.hash.startsWith('#collection-')) {
      window.history.pushState({}, '', window.location.pathname + (currentPage !== 'home' ? `#${currentPage}` : ''));
    }
  };

  const setQuickViewProduct = (product) => {
    if (product) {
      setQuickViewProductState(product);
      window.history.pushState({ product: product.id }, '', `#product-${product.id}`);
    } else {
      setQuickViewProductState(null);
      // If closing product while inside a category collection, stay on category collection!
      if (activeCategoryCollection) {
        window.history.pushState({ collection: activeCategoryCollection.id }, '', `#collection-${activeCategoryCollection.id}`);
      } else if (window.location.hash.startsWith('#product-')) {
        window.history.pushState({}, '', window.location.pathname + (currentPage !== 'home' ? `#${currentPage}` : ''));
      }
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const loginUser = (email, name = 'Valued Collector', extra = {}) => {
    const cleanEmail = (email || '').toLowerCase().trim();
    const newUser = {
      id: extra.id || `usr_${Date.now()}`,
      email: cleanEmail,
      name,
      phone: extra.phone || '',
      joinedDate: extra.joinedDate || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      orders: []
    };
    setUser(newUser);
    try {
      localStorage.setItem('vw_user', JSON.stringify(newUser));
      localStorage.setItem('vw_user_account', JSON.stringify(newUser));
    } catch (e) {}
    showToast(`Welcome back, ${name}! 🎉`);
  };

  const logoutUser = () => {
    setUser(null);
    try {
      localStorage.removeItem('vw_user');
      localStorage.removeItem('vw_user_account');
    } catch (e) {}
    showToast('Logged out successfully.');
  };

  const addToCart = (product, quantity = 1, selectedSize = null) => {
    if (product.isSoldOut) {
      showToast(`${product.title} is currently sold out.`, 'error');
      return;
    }

    const effectiveSize = selectedSize || ((product.sizes && product.sizes.length > 0) ? product.sizes[0] : null);

    setCart(prevCart => {
      const existing = prevCart.find(
        item => item.product.id === product.id && (item.selectedSize || null) === (effectiveSize || null)
      );
      if (existing) {
        return prevCart.map(item =>
          item.product.id === product.id && (item.selectedSize || null) === (effectiveSize || null)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { product, quantity, selectedSize: effectiveSize }];
    });

    const sizeMsg = effectiveSize ? ` (Size: ${effectiveSize})` : '';
    showToast(`Added "${product.title}"${sizeMsg} to cart! 🛍️`);
    setIsCartOpen(true);
  };

  const removeFromCart = (productId, selectedSize = undefined) => {
    setCart(prevCart => prevCart.filter(item => {
      if (selectedSize !== undefined) {
        return !(item.product.id === productId && (item.selectedSize || null) === (selectedSize || null));
      }
      return item.product.id !== productId;
    }));
    showToast('Item removed from cart.');
  };

  const updateQuantity = (productId, newQuantity, selectedSize = undefined) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, selectedSize);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item => {
        const matches = selectedSize !== undefined
          ? (item.product.id === productId && (item.selectedSize || null) === (selectedSize || null))
          : item.product.id === productId;
        return matches ? { ...item, quantity: newQuantity } : item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const requireAuth = (callbackAction) => {
    if (user) {
      if (typeof callbackAction === 'function') {
        callbackAction();
      }
      return true;
    } else {
      setAuthRedirectAction(() => callbackAction);
      setIsAuthModalOpen(true);
      return false;
    }
  };

  const applyCouponCode = (code) => {
    if (!code) return { success: false, message: 'Please enter a coupon code.' };
    const upper = code.trim().toUpperCase();
    
    const list = couponsList.length > 0 ? couponsList : [
      { code: 'FIRST15', type: 'percentage', value: 15, description: '15% OFF First Order', active: true },
      { code: 'SPOOKY15', type: 'percentage', value: 15, description: '15% Halloween Special', active: true },
      { code: 'VIKING20', type: 'percentage', value: 20, description: '20% OFF Viking Shields', active: true },
      { code: 'JOURNAL25', type: 'fixed', value: 25, description: '$25 OFF Leather Journals', active: true },
      { code: 'VTM10', type: 'percentage', value: 10, description: '10% OFF Storewide', active: true },
    ];

    const matched = list.find(c => c.code.toUpperCase() === upper);
    if (!matched) {
      showToast(`Invalid coupon code "${code}"`, 'error');
      return { success: false, message: `Invalid coupon code "${code}"` };
    }
    if (!matched.active) {
      showToast(`Coupon "${matched.code}" is expired or inactive.`, 'error');
      return { success: false, message: `Coupon "${matched.code}" is expired or inactive.` };
    }

    // 1. Single-use validation per account / email
    const currentUserEmail = (user?.email || '').toLowerCase().trim();
    const usedKey = 'vw_used_coupons_' + (currentUserEmail || 'guest');
    let usedList = [];
    try {
      usedList = JSON.parse(localStorage.getItem(usedKey) || '[]');
    } catch(e) {}

    if (usedList.includes(upper)) {
      showToast(`Offer "${upper}" has already been used on this account. Each offer can only be used once.`, 'error');
      return { success: false, message: `Offer "${upper}" has already been used on this account.` };
    }

    // 2. Check past orders database
    let pastOrders = [];
    try {
      pastOrders = JSON.parse(localStorage.getItem('vw_admin_orders') || '[]');
    } catch(e) {}

    const userOrders = currentUserEmail 
      ? pastOrders.filter(o => (o.customerEmail || '').toLowerCase().trim() === currentUserEmail)
      : [];

    // If code is FIRST15, verify user has NEVER placed any order
    if (upper === 'FIRST15') {
      const hasOrdered = localStorage.getItem('vw_user_has_ordered') === 'true' || 
                         (currentUserEmail && localStorage.getItem('vw_user_has_ordered_' + currentUserEmail) === 'true') ||
                         userOrders.length > 0;
      if (hasOrdered) {
        showToast('FIRST15 is only valid for your first order. You have already placed an order on this account.', 'error');
        return { success: false, message: 'FIRST15 is only valid for your first order.' };
      }
    }

    // Check if user already used this specific coupon in a past order
    const couponAlreadyUsedInOrder = userOrders.some(o => 
      (o.appliedCoupon && o.appliedCoupon.toUpperCase() === upper) ||
      (o.payment && o.payment.toUpperCase().includes(upper))
    );

    if (couponAlreadyUsedInOrder) {
      showToast(`Coupon "${upper}" has already been applied to a previous order on this account.`, 'error');
      return { success: false, message: `Coupon "${upper}" has already been used on this account.` };
    }

    setAppliedCoupon(matched);
    localStorage.setItem('vw_applied_coupon', JSON.stringify(matched));
    showToast(`🎉 Coupon "${matched.code}" applied! ${matched.type === 'percentage' ? matched.value + '%' : '$' + matched.value} OFF saved.`, 'success');
    return { success: true, coupon: matched };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem('vw_applied_coupon');
    showToast('Coupon removed.');
  };

  const safeCart = Array.isArray(cart) ? cart.filter(Boolean) : [];
  const totalItems = safeCart.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0);
  const subtotal = safeCart.reduce((sum, item) => {
    const price = Number(item?.product?.price ?? item?.price ?? 0);
    const qty = Number(item?.quantity) || 1;
    return sum + (price * qty);
  }, 0);
  
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discountAmount = subtotal * (Number(appliedCoupon.value || 0) / 100);
    } else {
      discountAmount = Math.min(subtotal, Number(appliedCoupon.value || 0));
    }
  }

  const finalTotal = Math.max(0, subtotal - discountAmount);

  const freeShippingThreshold = 200;
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <CartContext.Provider
      value={{
        products,
        cart,
        user,
        currentPage,
        isCartOpen,
        isSearchOpen,
        quickViewProduct,
        activeCategoryCollection,
        toast,
        totalItems,
        subtotal,
        discountAmount,
        finalTotal,
        appliedCoupon,
        isAuthModalOpen,
        authRedirectAction,
        freeShippingThreshold,
        freeShippingProgress,
        amountToFreeShipping,
        selectedCategory,
        setSelectedCategory,
        openCategory,
        setIsCartOpen,
        setIsSearchOpen,
        setIsAuthModalOpen,
        setAuthRedirectAction,
        requireAuth,
        setQuickViewProduct,
        openCategoryCollection,
        closeCategoryCollection,
        navigateTo,
        loginUser,
        logoutUser,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCouponCode,
        removeCoupon,
        showToast
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
