import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Truck, Eye } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const CartDrawer = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    discountAmount,
    finalTotal,
    appliedCoupon,
    applyCouponCode,
    removeCoupon,
    freeShippingThreshold,
    freeShippingProgress,
    amountToFreeShipping,
    clearCart,
    showToast,
    navigateTo,
    requireAuth
  } = useCart();

  const [promoCode, setPromoCode] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  if (!isCartOpen) return null;

  const handleApplyPromo = (e) => {
    e.preventDefault();
    applyCouponCode(promoCode);
  };

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    requireAuth(() => navigateTo('checkout'));
  };

  const handleViewCart = () => {
    setIsCartOpen(false);
    navigateTo('cart');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-menu">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-slide-drawer">
          
          {/* Header */}
          <div className="p-5 border-b border-neutral-200 flex items-center justify-between bg-[#1b1a1a] text-white">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[#f7eddb]" />
              <h2 className="font-heading text-lg font-semibold tracking-wide">
                Your Shopping Cart ({cart.reduce((s, i) => s + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-[#f7eddb]/60 border-b border-[#ebd7b2] p-4 text-xs">
            <div className="flex items-center justify-between font-medium text-neutral-800 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[#3F5147]" />
                {(amountToFreeShipping || 0) === 0 ? (
                  <strong className="text-[#3F5147]">You have qualified for FREE Shipping! 🎉</strong>
                ) : (
                  <span>Add <strong>${(amountToFreeShipping || 0).toFixed(2)} USD</strong> more for <strong>FREE Shipping</strong></span>
                )}
              </span>
              <span>{Math.round(freeShippingProgress || 0)}%</span>
            </div>
            <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#3F5147] transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, freeShippingProgress || 0)}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-neutral-500">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-neutral-800 mb-1">
                    Your cart is currently empty
                  </h3>
                  <p className="text-xs text-neutral-500 max-w-xs">
                    Explore our authentic handcrafted maritime, medieval, and vintage collection to fill your cart.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="bg-[#1b1a1a] hover:bg-[#333333] text-white text-xs font-semibold px-6 py-2.5 rounded-full transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              (Array.isArray(cart) ? cart : []).map((item, index) => {
                if (!item) return null;
                const product = item.product || item;
                const prodId = product.id || `drawer-item-${index}`;
                const prodTitle = product.title || 'Azim Crafts Item';
                const prodImage = product.image || '/vintage-to-modern-logo.png';
                const prodVendor = product.vendor || 'Azim Crafts';
                const qty = Number(item.quantity) || 1;
                const price = Number(product.price) || 0;
                const selectedSize = item.selectedSize || null;

                return (
                  <div
                    key={`${prodId}-${selectedSize || index}`}
                    className="flex gap-4 p-3 border border-neutral-100 rounded-lg hover:border-neutral-200 transition-colors bg-white"
                  >
                    <img
                      src={prodImage}
                      alt={prodTitle}
                      loading="lazy"
                      className="w-20 h-20 object-contain rounded bg-neutral-50 shrink-0 border border-neutral-100 p-1"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] uppercase font-medium text-neutral-400">
                            {prodVendor}
                          </span>
                          <h4 className="font-heading text-xs font-medium text-neutral-900 line-clamp-2 leading-snug">
                            {prodTitle}
                          </h4>
                          {selectedSize && (
                            <span className="inline-block mt-1 text-[10px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Size: {selectedSize}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => removeFromCart(prodId, selectedSize)}
                          className="text-neutral-400 hover:text-[#ae2828] p-1 transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-neutral-100">
                        {/* Quantity Selector */}
                        <div className="flex items-center border border-neutral-300 rounded overflow-hidden">
                          <button
                            onClick={() => updateQuantity(prodId, qty - 1, selectedSize)}
                            className="px-2 py-1 hover:bg-neutral-100 text-neutral-600 text-xs cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-semibold text-neutral-800">
                            {qty}
                          </span>
                          <button
                            onClick={() => updateQuantity(prodId, qty + 1, selectedSize)}
                            className="px-2 py-1 hover:bg-neutral-100 text-neutral-600 text-xs cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-semibold text-neutral-900">
                            ${(price * qty).toFixed(2)} USD
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Actions */}
          {cart.length > 0 && (
            <div className="p-5 border-t border-neutral-200 bg-neutral-50/80 space-y-3">
              {/* Promo Code box */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Promo code (e.g. FIRST15)"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs border border-neutral-300 rounded bg-white focus:outline-none focus:border-black uppercase font-mono"
                />
                <button
                  type="submit"
                  className="bg-neutral-800 hover:bg-black text-white px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </form>

              {/* Subtotals */}
              <div className="space-y-1.5 text-xs text-neutral-600 pt-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-neutral-800">${Number(subtotal || 0).toFixed(2)} USD</span>
                </div>
                {appliedCoupon && Number(discountAmount || 0) > 0 && (
                  <div className="flex justify-between text-[#ae2828] font-semibold items-center">
                    <div className="flex items-center gap-1.5">
                      <span>{appliedCoupon.code} ({appliedCoupon.type === 'percentage' ? appliedCoupon.value + '%' : '$' + appliedCoupon.value} OFF)</span>
                      <button 
                        type="button" 
                        onClick={removeCoupon} 
                        className="text-neutral-400 hover:text-red-600 text-[10px] underline ml-1 cursor-pointer"
                      >
                        remove
                      </button>
                    </div>
                    <span>-${Number(discountAmount || 0).toFixed(2)} USD</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="font-medium text-neutral-800">
                    {amountToFreeShipping === 0 ? 'FREE' : 'Calculated at checkout'}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-neutral-900 pt-2 border-t border-neutral-200">
                  <span>Total</span>
                  <span>${Number(finalTotal || 0).toFixed(2)} USD</span>
                </div>
              </div>

              {/* Action Buttons: VIEW MY CART & CHECKOUT */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleViewCart}
                  className="w-full bg-white hover:bg-neutral-100 text-neutral-900 border border-neutral-300 hover:border-black py-3 px-4 rounded-md font-semibold text-xs uppercase tracking-wider shadow-2xs transition-all flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4 text-neutral-700" />
                  <span>VIEW MY CART</span>
                </button>

                <button
                  onClick={handleCheckoutClick}
                  disabled={isCheckingOut}
                  className="w-full bg-[#1b1a1a] hover:bg-[#333333] text-white py-3.5 px-4 rounded-md font-semibold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 group"
                >
                  {isCheckingOut ? (
                    <span className="inline-block animate-spin">⏳ Processing...</span>
                  ) : (
                    <>
                      <span>CHECK OUT</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Guaranteed Safe & Secure Checkout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
