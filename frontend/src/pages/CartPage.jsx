import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { 
  ShoppingBag, Trash2, Plus, Minus, ArrowLeft, ArrowRight, 
  ShieldCheck, Truck, Tag, Lock, ArrowUpRight 
} from 'lucide-react';
import { allProducts } from '../data/products';
import { ProductCard } from '../components/product/ProductCard';

export const CartPage = () => {
  const { 
    cart, 
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

  const [orderNote, setOrderNote] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    applyCouponCode(promoCode);
  };

  const handleProceedClick = () => {
    requireAuth(() => navigateTo('checkout'));
  };

  // Recommended products for the bottom of the cart
  const recommended = allProducts.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#fcfbfa] py-8 md:py-14 font-menu">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        
        {/* Breadcrumb & Top Bar */}
        <div className="flex items-center justify-between mb-6 text-xs text-neutral-500">
          <button
            onClick={() => navigateTo('home')}
            className="flex items-center gap-1.5 hover:text-black font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Continue Shopping</span>
          </button>
          <span>Home / Your Shopping Cart</span>
        </div>

        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-4 border-b border-neutral-200 mb-6">
          <h1 className="font-heading text-3xl md:text-4xl font-normal text-neutral-900 tracking-wide">
            Your Shopping Cart
          </h1>
          <span className="text-xs text-neutral-500 mt-1 sm:mt-0 font-medium">
            {cart.reduce((s, i) => s + i.quantity, 0)} items in your cart
          </span>
        </div>

        {/* Free Shipping Meter */}
        <div className="bg-[#f7eddb]/80 border border-[#ebd6b0] p-4 rounded-lg mb-8 text-xs md:text-sm">
          <div className="flex items-center justify-between font-medium text-neutral-800 mb-2">
            <span className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#3F5147]" />
              {(amountToFreeShipping || 0) === 0 ? (
                <strong className="text-[#3F5147]">You have unlocked FREE Express Shipping! 🎉</strong>
              ) : (
                <span>
                  Add <strong className="text-neutral-900">${(amountToFreeShipping || 0).toFixed(2)} USD</strong> more to qualify for <strong>FREE Express Shipping</strong>!
                </span>
              )}
            </span>
            <span className="font-bold text-[#3F5147]">{Math.round(freeShippingProgress || 0)}%</span>
          </div>
          <div className="w-full h-2.5 bg-neutral-200/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#3F5147] transition-all duration-500 rounded-full"
              style={{ width: `${Math.min(100, freeShippingProgress || 0)}%` }}
            />
          </div>
        </div>

        {cart.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center shadow-xs my-8 space-y-5">
            <div className="w-20 h-20 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h2 className="font-heading text-2xl font-semibold text-neutral-900">
                Your cart is currently empty
              </h2>
              <p className="text-xs md:text-sm text-neutral-500">
                Explore our authentic handcrafted collection of vintage shields, compasses, diving helmets, and leather journals.
              </p>
            </div>
            <div>
              <button
                onClick={() => navigateTo('home')}
                className="bg-[#1b1a1a] hover:bg-[#333333] text-white px-8 py-3.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all shadow-md inline-flex items-center gap-2"
              >
                <span>Start Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Active Cart Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Cart Items Table / List (8 Cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-xl border border-neutral-200 shadow-xs overflow-hidden">
                
                {/* Table Header on Desktop */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3.5 bg-neutral-50 border-b border-neutral-200 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  <div className="col-span-6">Product</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>

                {/* Items List */}
                <div className="divide-y divide-neutral-100">
                  {Array.isArray(cart) && cart.map((item, index) => {
                    if (!item) return null;
                    const product = item.product || item;
                    const prodId = product.id || `cart-item-${index}`;
                    const prodTitle = product.title || 'Azim Crafts Item';
                    const prodImage = product.image || '/vintage-to-modern-logo.png';
                    const prodVendor = product.vendor || 'Azim Crafts';
                    const qty = Number(item.quantity) || 1;
                    const price = Number(product.price) || 0;
                    const selectedSize = item.selectedSize || null;

                    return (
                      <div
                        key={`${prodId}-${selectedSize || index}`}
                        className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
                      >
                        {/* Product Info (6 cols) */}
                        <div className="md:col-span-6 flex items-center gap-4">
                          <img
                            src={prodImage}
                            alt={prodTitle}
                            className="w-20 h-20 sm:w-24 sm:h-24 object-contain rounded-lg bg-neutral-50 border border-neutral-100 p-1 shrink-0"
                          />
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider block">
                              {prodVendor}
                            </span>
                            <h3 className="font-heading text-sm font-semibold text-neutral-900 leading-snug">
                              {prodTitle}
                            </h3>
                            {selectedSize && (
                              <span className="inline-block text-[11px] font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                Size: {selectedSize}
                              </span>
                            )}
                            <div>
                              <button
                                onClick={() => removeFromCart(prodId, selectedSize)}
                                className="text-xs text-neutral-400 hover:text-[#ae2828] flex items-center gap-1 transition-colors pt-1 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Unit Price (2 cols) */}
                        <div className="md:col-span-2 text-left md:text-center text-xs sm:text-sm font-medium text-neutral-700">
                          <span className="md:hidden text-neutral-400 text-xs mr-2">Price:</span>
                          ${price.toFixed(2)} USD
                        </div>

                        {/* Quantity Controls (2 cols) */}
                        <div className="md:col-span-2 flex items-center md:justify-center">
                          <span className="md:hidden text-neutral-400 text-xs mr-3">Qty:</span>
                          <div className="flex items-center border border-neutral-300 rounded-md bg-white">
                            <button
                              onClick={() => updateQuantity(prodId, qty - 1, selectedSize)}
                              className="p-1.5 sm:p-2 hover:bg-neutral-100 text-neutral-600 transition-colors cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3 text-xs font-bold text-neutral-900 min-w-[2rem] text-center">
                              {qty}
                            </span>
                            <button
                              onClick={() => updateQuantity(prodId, qty + 1, selectedSize)}
                              className="p-1.5 sm:p-2 hover:bg-neutral-100 text-neutral-600 transition-colors cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Line Total (2 cols) */}
                        <div className="md:col-span-2 text-left md:text-right font-bold text-sm sm:text-base text-neutral-900">
                          <span className="md:hidden text-neutral-400 text-xs font-normal mr-2">Total:</span>
                          ${(price * qty).toFixed(2)} USD
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Special Notes Box */}
              <div className="bg-white rounded-xl border border-neutral-200 p-5 shadow-xs">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2">
                  Special Order Instructions / Gift Note
                </label>
                <textarea
                  rows="3"
                  placeholder="Special instructions for delivery or custom gift message..."
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  className="w-full text-xs p-3 border border-neutral-300 rounded-md bg-neutral-50/50 focus:outline-none focus:border-black"
                />
              </div>
            </div>

            {/* Right: Order Summary Card (4 Cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs space-y-4">
                <h3 className="font-heading text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-3">
                  Order Summary
                </h3>

                {/* Promo Code Input */}
                <form onSubmit={handleApplyPromo} className="space-y-2">
                  <label className="block text-xs font-medium text-neutral-600">
                    Promo / Coupon Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. FIRST15"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs border border-neutral-300 rounded-md bg-white focus:outline-none focus:border-black uppercase font-mono"
                    />
                    <button
                      type="submit"
                      className="bg-neutral-800 hover:bg-black text-white px-4 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </form>

                {/* Subtotals breakdown */}
                <div className="space-y-2 text-xs text-neutral-600 pt-2 border-t border-neutral-100">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-neutral-900">${Number(subtotal || 0).toFixed(2)} USD</span>
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
                    <span>Shipping</span>
                    <span className="font-semibold text-neutral-900">
                      {amountToFreeShipping === 0 ? (
                        <span className="text-emerald-700 font-bold">FREE</span>
                      ) : (
                        'Calculated at checkout'
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-neutral-900 pt-3 border-t border-neutral-200">
                    <span>Estimated Total</span>
                    <span>${Number(finalTotal || 0).toFixed(2)} USD</span>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-400 italic text-center">
                  Taxes and shipping calculated at checkout.
                </p>

                {/* Proceed to Checkout Button */}
                <button
                  onClick={handleProceedClick}
                  disabled={isCheckingOut}
                  className="w-full bg-[#1b1a1a] hover:bg-[#333333] text-white py-4 px-6 rounded-md font-semibold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 group"
                >
                  {isCheckingOut ? (
                    <span className="inline-block animate-spin">⏳ Placing Order...</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-[#f7eddb]" />
                      <span>PROCEED TO CHECKOUT</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                {/* Security badges */}
                <div className="pt-2 text-center space-y-1.5">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-600 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>256-Bit SSL Encrypted Checkout</span>
                  </div>
                  <p className="text-[10.5px] text-neutral-400">
                    Roorkee (India) Warehouse Dispatch • 30-Day Money Back Guarantee
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Featured / Recommended Products */}
        <div className="mt-16 pt-12 border-t border-neutral-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[11px] font-bold text-[#ae2828] uppercase tracking-wider block mb-0.5">
                Recommended For You
              </span>
              <h2 className="font-heading text-2xl font-normal text-neutral-900 tracking-wide">
                You May Also Like
              </h2>
            </div>
            <button
              onClick={() => navigateTo('home')}
              className="text-xs font-semibold text-neutral-700 hover:text-[#ae2828] flex items-center gap-1"
            >
              <span>Explore All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {recommended.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
