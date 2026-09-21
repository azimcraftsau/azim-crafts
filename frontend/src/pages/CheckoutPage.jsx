import React, { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { 
  Lock, ArrowLeft, ShieldCheck, CheckCircle2, ChevronDown, 
  HelpCircle, CreditCard, ShoppingBag, Loader2, AlertCircle, Landmark, Copy, Check 
} from 'lucide-react';
import { createOrderInDB } from '../lib/cloudflareService';
import { POPULAR_COUNTRIES, ALL_COUNTRIES, COUNTRY_TO_ISO } from '../data/countries';
import { validateCheckoutAddress } from '../utils/checkoutValidation';

const buildStructuredItems = (cartItems) => cartItems.map((i, idx) => {
  const prod = i?.product || i;
  return {
    id: prod?.id || `item-${idx}`,
    title: prod?.title || 'Azim Crafts Item',
    image: prod?.image || '/vintage-to-modern-logo.png',
    quantity: Number(i?.quantity) || 1,
    price: Number(prod?.price) || 0,
    selectedSize: i?.selectedSize || null,
    sku: `VTM-${prod?.productNumber || prod?.id || 'VTM'}${i?.selectedSize ? `-${i.selectedSize}` : ''}`
  };
});

export const CheckoutPage = () => {
  const { 
    cart = [], 
    subtotal = 0, 
    discountAmount = 0,
    finalTotal = 0,
    appliedCoupon = null,
    applyCouponCode,
    removeCoupon,
    user,
    logoutUser,
    setIsAuthModalOpen,
    requireAuth,
    clearCart, 
    showToast, 
    navigateTo,
    freeShippingThreshold = 200,
    standardShippingFee = 20,
    isFreeShipping = false,
    shippingFee = 0
  } = useCart() || {};

  // Form states
  const [deliveryMethod, setDeliveryMethod] = useState('ship'); // 'ship' | 'pickup'
  const [emailOrPhone, setEmailOrPhone] = useState(user?.email || '');
  const [emailOffers, setEmailOffers] = useState(true);
  const [firstName, setFirstName] = useState(typeof user?.name === 'string' ? user.name.split(' ')[0] : '');
  const [lastName, setLastName] = useState(typeof user?.name === 'string' ? user.name.split(' ').slice(1).join(' ') : '');
  const [company, setCompany] = useState('');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('VIC');
  const [postcode, setPostcode] = useState('');
  const [country, setCountry] = useState('Australia');
  const [phone, setPhone] = useState(user?.phone || '');
  const [textOffers, setTextOffers] = useState(false);
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.email && !emailOrPhone) setEmailOrPhone(user.email);
      if (typeof user.name === 'string' && (!firstName || firstName === 'Valued')) {
        const parts = user.name.split(' ');
        setFirstName(parts[0] || '');
        if (!lastName) setLastName(parts.slice(1).join(' ') || '');
      }
      if (user.phone && !phone) setPhone(user.phone);
    }
  }, [user]);

  // Address & Contact form validation states
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});

  const handleFieldBlur = (field) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    const currentData = {
      emailOrPhone,
      firstName,
      lastName,
      address,
      apartment,
      city,
      state,
      postcode,
      country,
      phone
    };
    const errs = validateCheckoutAddress(currentData);
    setFormErrors(errs);
  };

  const clearFieldError = (field) => {
    if (formErrors[field]) {
      setFormErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const getPostcodePlaceholder = () => {
    const c = (country || '').toLowerCase();
    if (c.includes('united states') || c === 'us') return 'ZIP code (e.g. 90210)';
    if (c.includes('australia') || c === 'au') return 'Postcode (e.g. 3000)';
    if (c.includes('united kingdom') || c === 'uk') return 'Postcode (e.g. SW1A 1AA)';
    if (c.includes('canada') || c === 'ca') return 'Postal code (e.g. K1A 0B1)';
    if (c.includes('india') || c === 'in') return 'PIN code (e.g. 110001)';
    if (['germany', 'france', 'italy', 'spain', 'mexico'].some(co => c.includes(co))) return 'Postal code (e.g. 75001)';
    return 'Postcode / ZIP';
  };

  // Keep a live ref of form & cart state to prevent unnecessary re-mounts
  const latestDataRef = useRef({});
  latestDataRef.current = {
    cart,
    subtotal,
    discountAmount,
    shippingFee,
    isFreeShipping,
    finalTotal,
    appliedCoupon,
    firstName,
    lastName,
    emailOrPhone,
    phone,
    address,
    apartment,
    city,
    state,
    postcode,
    country,
    user
  };

  // Sync user info if user logs in
  React.useEffect(() => {
    if (user && typeof user === 'object') {
      if (user.email && !emailOrPhone) setEmailOrPhone(user.email);
      if (user.phone && !phone) setPhone(user.phone);
      if (typeof user.name === 'string') {
        const parts = user.name.split(' ');
        if (!firstName) setFirstName(parts[0] || '');
        if (!lastName) setLastName(parts.slice(1).join(' ') || '');
      }
    }
  }, [user]);

  // Stripe configuration strictly loaded from environment with live fallback
  const STRIPE_PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_live_51UCyAZBqEUeXNNxVCCBmQ21HYaxkvhkrMrukURvj5IN6J6nX06VOgB99sdZFMsd88JQg0Xcqj5IBaEsHgIXWE5rq00S90KRKaX';

  // Payment states (Stripe Card, Bank Transfer)
  const [paymentMethod, setPaymentMethod] = useState('credit-card'); // 'credit-card' | 'bank'
  const [cardName, setCardName] = useState('');
  const [sameBilling, setSameBilling] = useState(true);
  const [cardError, setCardError] = useState('');
  const [isStripeReady, setIsStripeReady] = useState(false);
  const [stripeInstance, setStripeInstance] = useState(null);
  const [cardElement, setCardElement] = useState(null);
  const stripeElementRef = useRef(null);
  const paymentRequestRef = useRef(null);

  // Stripe PaymentRequest (Real Apple Pay & Google Pay) states
  const [canMakePaymentRequest, setCanMakePaymentRequest] = useState(false);
  const [paymentRequestInstance, setPaymentRequestInstance] = useState(null);

  // Promo code & processing
  const [discountCode, setDiscountCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState('');
  const [copiedKey, setCopiedKey] = useState(null);

  const handleCopy = (text, key) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2200);
    }
  };

  // Initialize and mount Stripe Card Element safely without React DOM collisions
  useEffect(() => {
    let card = null;
    let timer = null;
    let isCancelled = false;

    if (paymentMethod === 'credit-card') {
      const initStripe = () => {
        if (isCancelled) return;
        if (!window.Stripe) {
          timer = setTimeout(initStripe, 200);
          return;
        }

        try {
          const stripe = window.Stripe(STRIPE_PK);
          setStripeInstance(stripe);

          const container = stripeElementRef.current || document.getElementById('stripe-card-element');
          if (container && !isCancelled) {
            // Clean any stale iframe from previous mount without innerHTML
            while (container.firstChild) {
              container.removeChild(container.firstChild);
            }

            const elements = stripe.elements();

            card = elements.create('card', {
              style: {
                base: {
                  color: '#111827',
                  fontFamily: '"Work Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  fontSmoothing: 'antialiased',
                  fontSize: '14px',
                  lineHeight: '22px',
                  '::placeholder': {
                    color: '#9ca3af',
                  },
                },
                invalid: {
                  color: '#dc2626',
                  iconColor: '#dc2626',
                },
              },
              hidePostalCode: true,
            });

            card.mount(container);

            card.on('change', (event) => {
              if (event.error) {
                setCardError(event.error.message);
              } else {
                setCardError('');
              }
            });

            card.on('ready', () => {
              if (!isCancelled) setIsStripeReady(true);
            });

            setCardElement(card);
          }
        } catch (err) {
          console.error('Stripe setup error:', err);
        }
      };

      timer = setTimeout(initStripe, 60);
    }

    return () => {
      isCancelled = true;
      if (timer) clearTimeout(timer);
      if (card) {
        try {
          card.destroy();
        } catch (e) {}
      }
    };
  }, [paymentMethod]);

  // Initialize Stripe Payment Request Button (Real Apple Pay & Google Pay)
  useEffect(() => {
    let pr = null;
    let prButton = null;
    let timer = null;
    let isCancelled = false;

    const initPaymentRequest = () => {
      if (isCancelled) return;
      if (!window.Stripe) {
        timer = setTimeout(initPaymentRequest, 200);
        return;
      }

      try {
        const stripe = window.Stripe(STRIPE_PK);
        const data = latestDataRef.current;
        const initialAmount = Math.max(50, Math.round(Number(data.finalTotal || 1) * 100));

        pr = stripe.paymentRequest({
          country: 'US',
          currency: 'usd',
          total: {
            label: 'Azim Crafts Order',
            amount: initialAmount,
          },
          requestPayerName: true,
          requestPayerEmail: true,
          requestPayerPhone: true,
          requestShipping: true,
          shippingOptions: [
            {
              id: isFreeShipping ? 'free-express' : 'standard-express',
              label: isFreeShipping ? `Worldwide Express Courier (Free Over $${freeShippingThreshold})` : 'Worldwide Standard Express Courier',
              detail: 'DHL / FedEx / UPS (3-5 Days)',
              amount: Math.round(Number(shippingFee || 0) * 100),
            }
          ]
        });

        pr.canMakePayment().then((result) => {
          if (isCancelled) return;
          if (result) {
            setCanMakePaymentRequest(result);
            setPaymentRequestInstance(pr);

            const elements = stripe.elements();
            prButton = elements.create('paymentRequestButton', {
              paymentRequest: pr,
              style: {
                paymentRequestButton: {
                  type: 'buy',
                  theme: 'dark',
                  height: '44px',
                },
              },
            });

            const container = paymentRequestRef.current || document.getElementById('payment-request-button');
            if (container && !isCancelled) {
              while (container.firstChild) {
                container.removeChild(container.firstChild);
              }
              prButton.mount(container);
            }
          } else {
            setCanMakePaymentRequest(false);
          }
        }).catch(() => {
          if (!isCancelled) setCanMakePaymentRequest(false);
        });

        // Real payment authorization callback from Apple Pay / Google Pay
        pr.on('paymentmethod', async (ev) => {
          setIsProcessing(true);
          try {
            const currentData = latestDataRef.current;
            const currentCart = Array.isArray(currentData.cart) ? currentData.cart : [];
            const orderId = `VTM-${Math.floor(10000 + Math.random() * 90000)}`;

            const payerName = ev.payerName || `${currentData.firstName || 'Valued'} ${currentData.lastName || 'Customer'}`.trim();
            const payerEmail = ev.payerEmail || (currentData.emailOrPhone && currentData.emailOrPhone.includes('@') ? currentData.emailOrPhone : (currentData.user?.email || 'collector@azimcrafts.com'));
            const payerPhone = ev.payerPhone || currentData.phone || '';

            const shipAddr = ev.shippingAddress || {};
            const addressParts = [
              (shipAddr.addressLine || []).join(', ') || currentData.address,
              shipAddr.city || currentData.city,
              shipAddr.region || shipAddr.state || currentData.state,
              shipAddr.postalCode || currentData.postcode,
              shipAddr.country || currentData.country || 'Australia'
            ].filter(Boolean);
            const fullShippingAddress = addressParts.join(', ') || 'Customer Verified Address';

            const piRes = await fetch('/api/create-payment-intent', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                amount: Number(currentData.finalTotal || 0),
                currency: 'usd',
                orderId: orderId,
                customerEmail: payerEmail,
                customerName: payerName
              })
            });
            const piData = await piRes.json();
            if (!piData.clientSecret) {
              ev.complete('fail');
              showToast(piData.error || 'Failed to initialize wallet payment.', 'error');
              setIsProcessing(false);
              return;
            }

            const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(
              piData.clientSecret,
              { payment_method: ev.paymentMethod.id },
              { handleActions: false }
            );

            if (confirmError) {
              ev.complete('fail');
              showToast(confirmError.message || 'Wallet payment declined.', 'error');
              setIsProcessing(false);
              return;
            }

            ev.complete('success');

            if (paymentIntent.status === 'requires_action') {
              const { error: actionError } = await stripe.confirmCardPayment(piData.clientSecret);
              if (actionError) {
                showToast(actionError.message, 'error');
                setIsProcessing(false);
                return;
              }
            }

            const walletBrand = ev.paymentMethod?.wallet?.type 
              ? (ev.paymentMethod.wallet.type === 'apple_pay' ? 'Apple Pay' : 'Google Pay')
              : (ev.paymentMethod?.card?.wallet?.type || 'Digital Wallet');

            const itemsSummary = currentCart.map(i => {
              const prod = i?.product || i;
              return `${prod?.title || 'Vintage Item'}${i?.selectedSize ? ` (Size: ${i.selectedSize})` : ''} (x${i?.quantity || 1})`;
            }).join(', ');

            const structuredItems = buildStructuredItems(currentCart);

            await createOrderInDB({
              id: orderId,
              customer: payerName,
              customerEmail: payerEmail,
              phone: payerPhone,
              shippingAddress: fullShippingAddress,
              country: shipAddr.country || currentData.country || 'Australia',
              items: itemsSummary,
              itemsList: structuredItems,
              subtotal: Number(currentData.subtotal || 0),
              discountAmount: Number(currentData.discountAmount || 0),
              appliedCoupon: currentData.appliedCoupon ? currentData.appliedCoupon.code : null,
              total: Number(currentData.finalTotal || 0),
              payment: `Paid (${walletBrand}: ${paymentIntent.id})`,
              status: 'Processing',
              carrier: 'DHL Express'
            });

            finishOrderSuccess(`🎉 ${walletBrand} Payment Confirmed! Order #${orderId}`);
          } catch (err) {
            console.error('Wallet payment error:', err);
            ev.complete('fail');
            setIsProcessing(false);
            showToast(err.message || 'Payment processing error.', 'error');
          }
        });

      } catch (err) {
        console.warn('PaymentRequest error:', err);
        if (!isCancelled) setCanMakePaymentRequest(false);
      }
    };

    timer = setTimeout(initPaymentRequest, 100);

    return () => {
      isCancelled = true;
      if (timer) clearTimeout(timer);
      if (prButton) {
        try { prButton.destroy(); } catch (e) {}
      }
    };
  }, []);

  // Keep PaymentRequest amount synchronized with live finalTotal
  useEffect(() => {
    if (paymentRequestInstance) {
      try {
        paymentRequestInstance.update({
          total: {
            label: 'Azim Crafts Order',
            amount: Math.max(50, Math.round(Number(finalTotal || 1) * 100)),
          }
        });
      } catch (e) {}
    }
  }, [finalTotal, paymentRequestInstance]);

  const handleApplyDiscount = (e) => {
    e.preventDefault();
    applyCouponCode(discountCode);
  };

  const finishOrderSuccess = (msg) => {
    setTimeout(() => {
      setIsProcessing(false);
      setOrderComplete(true);
      try {
        const cleanEmail = (emailOrPhone || user?.email || '').toLowerCase().trim();
        localStorage.setItem('vw_user_has_ordered', 'true');
        if (cleanEmail) {
          localStorage.setItem('vw_user_has_ordered_' + cleanEmail, 'true');
          const usedKey = 'vw_used_coupons_' + cleanEmail;
          const usedList = JSON.parse(localStorage.getItem(usedKey) || '[]');
          if (appliedCoupon && !usedList.includes(appliedCoupon.code.toUpperCase())) {
            usedList.push(appliedCoupon.code.toUpperCase());
          }
          if (!usedList.includes('FIRST15')) {
            usedList.push('FIRST15');
          }
          localStorage.setItem(usedKey, JSON.stringify(usedList));
        }
        localStorage.removeItem('vw_applied_coupon');
      } catch (e) {}
      clearCart();
      showToast(msg || 'Order confirmed! A confirmation email has been sent.', 'success');
    }, 800);
  };

  const getOrderItemsData = () => {
    const safeList = Array.isArray(cart) ? cart.filter(Boolean) : [];
    const itemsSummary = safeList.map(i => {
      const prod = i?.product || i;
      return `${prod?.title || 'Azim Crafts Item'}${i?.selectedSize ? ` (Size: ${i.selectedSize})` : ''} (x${i?.quantity || 1})`;
    }).join(', ');

    const structuredItems = buildStructuredItems(safeList);

    return { itemsSummary, structuredItems };
  };

  const handlePayNow = async (e) => {
    e.preventDefault();

    // Comprehensive Address & Contact Verification
    const currentFormData = {
      emailOrPhone,
      firstName,
      lastName,
      address,
      apartment,
      city,
      state,
      postcode,
      country,
      phone
    };

    const addressErrors = validateCheckoutAddress(currentFormData);
    if (Object.keys(addressErrors).length > 0) {
      setFormErrors(addressErrors);
      const allTouched = {};
      Object.keys(addressErrors).forEach(k => { allTouched[k] = true; });
      setTouchedFields(prev => ({ ...prev, ...allTouched }));

      const firstErrKey = Object.keys(addressErrors)[0];
      const errorMsg = addressErrors[firstErrKey];
      showToast(errorMsg || 'Please correct the highlighted address fields before proceeding.', 'error');

      const el = document.querySelector(`[data-field="${firstErrKey}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const orderId = `VTM-${Math.floor(10000 + Math.random() * 90000)}`;
    const { itemsSummary, structuredItems } = getOrderItemsData();
    const customerName = `${firstName} ${lastName}`.trim();
    const customerEmail = emailOrPhone && emailOrPhone.includes('@') ? emailOrPhone : (user?.email || 'collector@azimcrafts.com');
    const fullShippingAddress = `${address}${apartment ? ', ' + apartment : ''}, ${city}, ${state} ${postcode}, ${country}`;

    if (paymentMethod === 'credit-card') {
      if (!stripeInstance || !cardElement) {
        showToast('Card terminal is initializing. Please wait a second and retry.', 'error');
        return;
      }

      setIsProcessing(true);
      setCardError('');

      try {
        // Step 1: Create Stripe PaymentIntent with live secret key
        const piRes = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: Number(finalTotal || 0),
            currency: 'usd',
            customerEmail: customerEmail,
            customerName: customerName,
            shippingAddress: fullShippingAddress,
            items: structuredItems,
            couponCode: appliedCoupon ? appliedCoupon.code : null,
          }),
        });

        const piData = await piRes.json();
        if (!piRes.ok || !piData.clientSecret) {
          throw new Error(piData.error || 'Failed to initialize secure card payment.');
        }

        // Map country name to ISO 2-letter code for Stripe (worldwide 217+ countries)
        const countryIso = COUNTRY_TO_ISO[country] || 'US';

        // Step 2: Confirm card payment directly with Stripe Live
        const { paymentIntent, error } = await stripeInstance.confirmCardPayment(piData.clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: cardName || customerName,
              email: customerEmail,
              phone: phone || '',
              address: {
                line1: address,
                city: city,
                state: state,
                postal_code: postcode,
                country: countryIso,
              },
            },
          },
        });

        if (error) {
          setIsProcessing(false);
          setCardError(error.message);
          showToast(`Card declined: ${error.message}`, 'error');
          return;
        }

        if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing')) {
          setCompletedOrderId(orderId);
          await createOrderInDB({
            id: orderId,
            customer: customerName,
            customerEmail: customerEmail,
            phone: phone || '',
            shippingAddress: fullShippingAddress,
            country: country,
            items: itemsSummary,
            itemsList: structuredItems,
            subtotal: Number(subtotal || 0),
            discountAmount: Number(discountAmount || 0),
            shippingFee: Number(shippingFee || 0),
            appliedCoupon: appliedCoupon ? appliedCoupon.code : null,
            total: Number(finalTotal || 0),
            payment: `Paid (Stripe Live: ${paymentIntent.id})`,
            status: 'Processing',
            carrier: 'DHL Express'
          });

          finishOrderSuccess(`🎉 Payment of $${Number(finalTotal || 0).toFixed(2)} USD Confirmed via Stripe!`);
        } else {
          throw new Error(`Unexpected card status: ${paymentIntent?.status}`);
        }
      } catch (err) {
        console.error('Stripe payment failed:', err);
        setIsProcessing(false);
        showToast(err.message || 'Payment processing error.', 'error');
      }
      return;
    }

    // Bank Deposit / International Wire Transfer
    if (paymentMethod === 'bank') {
      setIsProcessing(true);
      setCompletedOrderId(orderId);
      await createOrderInDB({
        id: orderId,
        customer: customerName,
        customerEmail: customerEmail,
        phone: phone || '',
        shippingAddress: fullShippingAddress,
        country: country,
        items: itemsSummary,
        itemsList: structuredItems,
        subtotal: Number(subtotal || 0),
        discountAmount: Number(discountAmount || 0),
        shippingFee: Number(shippingFee || 0),
        appliedCoupon: appliedCoupon ? appliedCoupon.code : null,
        total: Number(finalTotal || 0),
        payment: 'Pending (Bank / Wire Transfer)',
        status: 'Unfulfilled',
        carrier: 'DHL Express'
      });

      finishOrderSuccess('🎉 Order placed successfully! Direct bank wire transfer details are displayed below.');
      return;
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 md:px-8 font-menu">
        <div className="max-w-xl mx-auto text-center space-y-6 bg-neutral-50 p-8 rounded-2xl border border-neutral-200 shadow-sm">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest font-bold text-neutral-400">
              Order #{completedOrderId || `VTM-${Math.floor(10000 + Math.random() * 90000)}`}
            </span>
            <h1 className="font-heading text-3xl font-bold text-neutral-900">
              Thank You for Your Order!
            </h1>
            <p className="text-xs md:text-sm text-neutral-600">
              Your order has been received and is being prepared with heirloom craftsmanship at our Roorkee artisan workshop.
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-neutral-200 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-500">Shipping to:</span>
              <span className="font-semibold text-neutral-900">{firstName || 'Valued'} {lastName || 'Customer'}, {city || 'Australia'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Payment Status:</span>
              <span className={`font-semibold ${paymentMethod === 'bank' ? 'text-amber-700' : 'text-emerald-700'}`}>
                {paymentMethod === 'bank' ? `Awaiting Wire Transfer ($${Number(finalTotal || 0).toFixed(2)} USD)` : `Paid ($${Number(finalTotal || 0).toFixed(2)} USD)`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Estimated Delivery:</span>
              <span className="font-semibold text-neutral-900">3 - 5 Business Days (DHL Express)</span>
            </div>
          </div>

          {paymentMethod === 'bank' && (
            <div className="bg-gradient-to-b from-amber-50/90 to-stone-50 border border-amber-200/90 rounded-2xl p-5 text-left text-xs space-y-3.5 shadow-sm">
              <div className="flex items-center justify-between border-b border-amber-200/60 pb-2.5">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
                    <Landmark className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block leading-tight">Official Bank Wire Beneficiary</span>
                    <span className="text-[10.5px] font-normal text-amber-700">Westpac Banking Corporation • Australia</span>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-700" />
                  Verified
                </span>
              </div>

              <p className="text-neutral-700 text-xs leading-relaxed">
                Please transfer exactly <strong className="text-neutral-900 font-bold">${Number(finalTotal || 0).toFixed(2)} USD</strong> from your online banking or mobile app. Always enter your <strong>Transfer Reference</strong> in the payment description so our team can match and dispatch your order immediately.
              </p>

              {/* Bank Details Table */}
              <div className="bg-white p-4 rounded-xl border border-amber-200/70 text-xs space-y-2.5 text-neutral-800 shadow-2xs">
                {/* Beneficiary */}
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <span className="text-neutral-500 font-medium">Beneficiary Name</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-900">Shrin Malik / Azim Crafts</span>
                    <button
                      type="button"
                      onClick={() => handleCopy('Shrin Malik', 'name')}
                      className="p-1 rounded hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
                      title="Copy Beneficiary Name"
                    >
                      {copiedKey === 'name' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Bank Name */}
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <span className="text-neutral-500 font-medium">Bank Name</span>
                  <span className="font-semibold text-neutral-900">Westpac Bank (Australia)</span>
                </div>

                {/* BSB */}
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <div>
                    <span className="text-neutral-500 font-medium block">BSB Number</span>
                    <span className="text-[10px] text-neutral-400">Australian domestic transfer</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-neutral-900 tracking-wide bg-neutral-50 px-2 py-0.5 rounded border border-neutral-200">732-070</span>
                    <button
                      type="button"
                      onClick={() => handleCopy('732070', 'bsb')}
                      className="p-1 rounded hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
                      title="Copy BSB"
                    >
                      {copiedKey === 'bsb' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Account Number */}
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <span className="text-neutral-500 font-medium">Account Number</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-neutral-900 tracking-wide bg-neutral-50 px-2 py-0.5 rounded border border-neutral-200">879384</span>
                    <button
                      type="button"
                      onClick={() => handleCopy('879384', 'account')}
                      className="p-1 rounded hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
                      title="Copy Account Number"
                    >
                      {copiedKey === 'account' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* SWIFT / BIC */}
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <div>
                    <span className="text-neutral-500 font-medium block">SWIFT / BIC Code</span>
                    <span className="text-[10px] text-neutral-400">International wire (outside Australia)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-neutral-900 tracking-wider bg-neutral-50 px-2 py-0.5 rounded border border-neutral-200">WPACAU2S</span>
                    <button
                      type="button"
                      onClick={() => handleCopy('WPACAU2S', 'swift')}
                      className="p-1 rounded hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
                      title="Copy SWIFT Code"
                    >
                      {copiedKey === 'swift' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Support Email */}
                <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                  <span className="text-neutral-500 font-medium">Support & Inquiry</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-neutral-900">contact@azimcrafts.com</span>
                    <button
                      type="button"
                      onClick={() => handleCopy('contact@azimcrafts.com', 'email')}
                      className="p-1 rounded hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 transition-colors cursor-pointer"
                      title="Copy Support Email"
                    >
                      {copiedKey === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Reference ID (Highlighted) */}
                <div className="flex items-center justify-between bg-amber-50 p-2.5 rounded-lg border border-amber-200/90 text-amber-950">
                  <div>
                    <span className="font-bold block text-xs">Payment Reference</span>
                    <span className="text-[10.5px] text-amber-800">Must include in transfer description</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm tracking-wider text-amber-950 bg-white px-2.5 py-0.5 rounded border border-amber-300 shadow-2xs">
                      {completedOrderId}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(completedOrderId, 'ref')}
                      className="p-1 rounded bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 transition-colors cursor-pointer"
                      title="Copy Reference ID"
                    >
                      {copiedKey === 'ref' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Delivery & Dispatch Note */}
              <div className="flex items-start gap-2 text-[11px] text-neutral-600 bg-neutral-50 p-2.5 rounded-lg border border-neutral-200/60 leading-relaxed">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Priority Dispatch:</strong> Australian PayID/Osko transfers settle within seconds. International telegraphic transfers settle in 1–2 business days. Your items are reserved in our workshop immediately. A copy of these instructions and your invoice has been saved.
                </span>
              </div>
            </div>
          )}

          <button
            onClick={() => navigateTo('home')}
            className="w-full bg-[#1b1a1a] hover:bg-[#333333] text-white py-3.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-md"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (!orderComplete && (!cart || cart.length === 0)) {
    return (
      <div className="min-h-screen bg-white py-16 px-4 font-menu flex items-center justify-center">
        <div className="max-w-md mx-auto text-center space-y-4 bg-neutral-50 p-8 rounded-3xl border border-neutral-200 shadow-sm">
          <div className="w-16 h-16 bg-amber-50 text-[#c8924b] rounded-full flex items-center justify-center mx-auto border border-amber-200">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-neutral-900">Your Checkout Cart is Empty</h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            There are no items in your cart. Please browse our collections and add items to proceed with checkout.
          </p>
          <button
            onClick={() => navigateTo('home')}
            className="w-full bg-[#1b1a1a] hover:bg-[#333333] text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-menu text-[#131313]">
      
      {/* Top Header matching screenshot */}
      <div className="border-b border-neutral-200 py-2.5 sm:py-3 px-4 md:px-12 flex items-center justify-between max-w-[1440px] mx-auto">
        <a 
          href="/" 
          onClick={(e) => { e.preventDefault(); navigateTo('home'); }} 
          className="flex items-center gap-2 group"
        >
          <img
            src="/logo/logo without bg.png"
            alt="Azim Crafts"
            className="h-8 sm:h-9 md:h-10 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <span className="font-heading font-bold text-sm sm:text-base text-neutral-900 tracking-wider uppercase">
            Azim Crafts
          </span>
        </a>
        <button 
          onClick={() => navigateTo('cart')} 
          className="text-neutral-600 hover:text-black p-1 transition-colors"
          title="Return to Cart"
        >
          <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
        </button>
      </div>

      {/* Mobile Order Summary Collapsible Banner (Shopify Style) */}
      <div className="lg:hidden bg-neutral-50 border-b border-neutral-200">
        <button
          type="button"
          onClick={() => setShowMobileSummary(!showMobileSummary)}
          className="w-full py-3 px-4 flex items-center justify-between text-xs text-neutral-800"
        >
          <div className="flex items-center gap-2 text-[#0066cc] font-medium">
            <ShoppingBag className="w-4 h-4" />
            <span>{showMobileSummary ? 'Hide order summary' : 'Show order summary'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showMobileSummary ? 'rotate-180' : ''}`} />
          </div>
          <span className="font-bold text-sm text-neutral-900">${Number(finalTotal || 0).toFixed(2)} USD</span>
        </button>
        {showMobileSummary && (
          <div className="px-4 pb-4 pt-2 border-t border-neutral-200/70 bg-white space-y-3">
            <div className="space-y-2.5 divide-y divide-neutral-100 max-h-[35vh] overflow-y-auto pr-1">
              {Array.isArray(cart) && cart.map((item, index) => {
                if (!item) return null;
                const product = item.product || item;
                const prodId = product.id || `item-${index}`;
                const prodTitle = product.title || 'Azim Crafts Item';
                const prodImage = product.image || '/vintage-to-modern-logo.png';
                const qty = Number(item.quantity) || 1;
                const price = Number(product.price) || 0;
                const selectedSize = item.selectedSize || null;
                return (
                  <div key={`mob-${prodId}-${index}`} className="pt-2 first:pt-0 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="relative w-11 h-11 rounded-md bg-neutral-50 border border-neutral-200 flex items-center justify-center p-1 shrink-0">
                        <img src={prodImage} alt={prodTitle} className="w-full h-full object-contain" />
                        <span className="absolute -top-1.5 -right-1.5 bg-neutral-700 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                          {qty}
                        </span>
                      </div>
                      <div className="text-xs">
                        <p className="font-semibold text-neutral-900 line-clamp-1">{prodTitle}</p>
                        {selectedSize && <span className="text-[10px] text-amber-800">Size: {selectedSize}</span>}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-neutral-900">${(price * qty).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-neutral-100 pt-2 space-y-1 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-neutral-900">${Number(subtotal || 0).toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span>
                  <span>-${Number(discountAmount || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                {isFreeShipping ? (
                  <span className="font-semibold text-emerald-600">FREE</span>
                ) : (
                  <span className="font-semibold text-neutral-900">${Number(shippingFee || 0).toFixed(2)} USD</span>
                )}
              </div>
              <div className="flex justify-between font-bold text-neutral-900 pt-1 border-t border-neutral-100">
                <span>Total</span>
                <span>${Number(finalTotal || 0).toFixed(2)} USD</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main 2-Column Grid */}
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-60px)]">
        
        {/* LEFT COLUMN: Checkout Form (7 Columns) */}
        <div className="lg:col-span-7 p-4 sm:p-8 lg:p-12 lg:border-r border-neutral-200 space-y-8">

          {/* Express Checkout Section (Apple Pay / Google Pay via Stripe) */}
          {canMakePaymentRequest && (
            <div className="space-y-3">
              <span className="text-[11px] text-neutral-400 block text-center uppercase tracking-wider font-semibold">
                Express checkout
              </span>

              <div className="w-full">
                {/* Real Apple Pay / Google Pay (Stripe Payment Request Button) */}
                <div 
                  ref={paymentRequestRef} 
                  id="payment-request-button" 
                  className="min-h-[44px] rounded-md overflow-hidden" 
                />
              </div>

              {/* OR Divider */}
              <div className="relative flex py-3 items-center">
                <div className="flex-grow border-t border-neutral-200"></div>
                <span className="flex-shrink mx-4 text-neutral-400 text-[11px] font-bold uppercase tracking-widest">OR</span>
                <div className="flex-grow border-t border-neutral-200"></div>
              </div>
            </div>
          )}

          <form onSubmit={handlePayNow} className="space-y-8">
            
            {/* 1. Contact Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-neutral-900">Contact</h2>
                {user ? (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-neutral-500 hidden sm:inline">Logged in as</span>
                    <span className="font-semibold text-neutral-900 truncate max-w-[170px]" title={user.email || user.name}>
                      {user.email || user.name}
                    </span>
                    <span className="text-neutral-300">•</span>
                    <button
                      type="button"
                      onClick={() => {
                        logoutUser();
                        setEmailOrPhone('');
                      }}
                      className="text-xs text-[#0066cc] hover:underline font-medium cursor-pointer"
                    >
                      Log out
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="text-xs text-[#0066cc] hover:underline font-medium cursor-pointer"
                  >
                    Log in
                  </button>
                )}
              </div>
              <div>
                <div className="relative">
                  <input
                    type="text"
                    data-field="emailOrPhone"
                    autoComplete="email"
                    placeholder="Email or mobile phone number"
                    required
                    value={emailOrPhone}
                    onBlur={() => handleFieldBlur('emailOrPhone')}
                    onChange={(e) => {
                      setEmailOrPhone(e.target.value);
                      clearFieldError('emailOrPhone');
                    }}
                    className={`w-full px-3.5 py-3 text-xs md:text-sm border rounded-md focus:outline-none transition-colors ${
                      touchedFields.emailOrPhone && formErrors.emailOrPhone
                        ? 'border-red-500 bg-red-50/20 ring-1 ring-red-500'
                        : 'border-neutral-300 focus:border-black focus:ring-1 focus:ring-black'
                    }`}
                  />
                  <HelpCircle className="w-4 h-4 text-neutral-400 absolute right-3.5 top-3.5" />
                </div>
                {touchedFields.emailOrPhone && formErrors.emailOrPhone && (
                  <p className="flex items-center gap-1.5 text-[11px] text-red-600 mt-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{formErrors.emailOrPhone}</span>
                  </p>
                )}
              </div>
              <label className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={emailOffers}
                  onChange={(e) => setEmailOffers(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black accent-black"
                />
                <span>Email me with news and offers</span>
              </label>
            </div>

            {/* 2. Delivery Section */}
            <div className="space-y-4">
              <h2 className="text-base font-bold text-neutral-900">Delivery</h2>

              {/* Ship vs Pickup toggle buttons */}
              <div className="grid grid-cols-2 p-1 bg-neutral-100 rounded-lg border border-neutral-200 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('ship')}
                  className={`py-2 rounded-md flex items-center justify-center gap-2 transition-all ${
                    deliveryMethod === 'ship'
                      ? 'bg-white text-black shadow-xs font-bold'
                      : 'text-neutral-500 hover:text-black'
                  }`}
                >
                  <span>🚢 Ship</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryMethod('pickup')}
                  className={`py-2 rounded-md flex items-center justify-center gap-2 transition-all ${
                    deliveryMethod === 'pickup'
                      ? 'bg-white text-black shadow-xs font-bold'
                      : 'text-neutral-500 hover:text-black'
                  }`}
                >
                  <span>🏬 Pickup</span>
                </button>
              </div>

              {/* Country Dropdown */}
              <div>
                <label className="block text-[11px] font-medium text-neutral-500 mb-1">Country/Region</label>
                <select
                  value={country}
                  autoComplete="country"
                  onChange={(e) => {
                    const newC = e.target.value;
                    setCountry(newC);
                    if (touchedFields.postcode || postcode) {
                      setTimeout(() => handleFieldBlur('postcode'), 50);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 text-xs md:text-sm border border-neutral-300 rounded-md bg-white focus:outline-none focus:border-black cursor-pointer"
                >
                  <optgroup label="⭐ Popular Destinations">
                    {POPULAR_COUNTRIES.map((c) => (
                      <option key={`pop-${c}`} value={c}>{c}</option>
                    ))}
                  </optgroup>
                  <optgroup label="🌍 All Countries & Regions (A – Z)">
                    {ALL_COUNTRIES.map((c) => (
                      <option key={`all-${c}`} value={c}>{c}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* First & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    data-field="firstName"
                    autoComplete="given-name"
                    placeholder="First name"
                    required
                    value={firstName}
                    onBlur={() => handleFieldBlur('firstName')}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      clearFieldError('firstName');
                    }}
                    className={`w-full px-3.5 py-2.5 text-xs md:text-sm border rounded-md focus:outline-none transition-colors ${
                      touchedFields.firstName && formErrors.firstName
                        ? 'border-red-500 bg-red-50/20 ring-1 ring-red-500'
                        : 'border-neutral-300 focus:border-black'
                    }`}
                  />
                  {touchedFields.firstName && formErrors.firstName && (
                    <p className="flex items-center gap-1.5 text-[11px] text-red-600 mt-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{formErrors.firstName}</span>
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    data-field="lastName"
                    autoComplete="family-name"
                    placeholder="Last name"
                    required
                    value={lastName}
                    onBlur={() => handleFieldBlur('lastName')}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      clearFieldError('lastName');
                    }}
                    className={`w-full px-3.5 py-2.5 text-xs md:text-sm border rounded-md focus:outline-none transition-colors ${
                      touchedFields.lastName && formErrors.lastName
                        ? 'border-red-500 bg-red-50/20 ring-1 ring-red-500'
                        : 'border-neutral-300 focus:border-black'
                    }`}
                  />
                  {touchedFields.lastName && formErrors.lastName && (
                    <p className="flex items-center gap-1.5 text-[11px] text-red-600 mt-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{formErrors.lastName}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Company */}
              <input
                type="text"
                autoComplete="organization"
                placeholder="Company (optional)"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs md:text-sm border border-neutral-300 rounded-md focus:outline-none focus:border-black"
              />

              {/* Address */}
              <div>
                <input
                  type="text"
                  data-field="address"
                  autoComplete="address-line1"
                  placeholder="Street address (e.g. 124 King Street, Suite 4)"
                  required
                  value={address}
                  onBlur={() => handleFieldBlur('address')}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    clearFieldError('address');
                  }}
                  className={`w-full px-3.5 py-2.5 text-xs md:text-sm border rounded-md focus:outline-none transition-colors ${
                    touchedFields.address && formErrors.address
                      ? 'border-red-500 bg-red-50/20 ring-1 ring-red-500'
                      : 'border-neutral-300 focus:border-black'
                  }`}
                />
                {touchedFields.address && formErrors.address && (
                  <p className="flex items-center gap-1.5 text-[11px] text-red-600 mt-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{formErrors.address}</span>
                  </p>
                )}
              </div>

              {/* Apartment */}
              <input
                type="text"
                autoComplete="address-line2"
                placeholder="Apartment, suite, etc. (optional)"
                value={apartment}
                onChange={(e) => setApartment(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs md:text-sm border border-neutral-300 rounded-md focus:outline-none focus:border-black"
              />

              {/* City / State / Postcode */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <input
                    type="text"
                    data-field="city"
                    autoComplete="address-level2"
                    placeholder="City / Suburb"
                    required
                    value={city}
                    onBlur={() => handleFieldBlur('city')}
                    onChange={(e) => {
                      setCity(e.target.value);
                      clearFieldError('city');
                    }}
                    className={`w-full px-3.5 py-2.5 text-xs md:text-sm border rounded-md focus:outline-none transition-colors ${
                      touchedFields.city && formErrors.city
                        ? 'border-red-500 bg-red-50/20 ring-1 ring-red-500'
                        : 'border-neutral-300 focus:border-black'
                    }`}
                  />
                  {touchedFields.city && formErrors.city && (
                    <p className="flex items-center gap-1.5 text-[11px] text-red-600 mt-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{formErrors.city}</span>
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    data-field="state"
                    autoComplete="address-level1"
                    placeholder="State / Region"
                    required
                    value={state}
                    onBlur={() => handleFieldBlur('state')}
                    onChange={(e) => {
                      setState(e.target.value);
                      clearFieldError('state');
                    }}
                    className={`w-full px-3.5 py-2.5 text-xs md:text-sm border rounded-md focus:outline-none transition-colors ${
                      touchedFields.state && formErrors.state
                        ? 'border-red-500 bg-red-50/20 ring-1 ring-red-500'
                        : 'border-neutral-300 focus:border-black'
                    }`}
                  />
                  {touchedFields.state && formErrors.state && (
                    <p className="flex items-center gap-1.5 text-[11px] text-red-600 mt-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{formErrors.state}</span>
                    </p>
                  )}
                </div>
                <div>
                  <input
                    type="text"
                    data-field="postcode"
                    autoComplete="postal-code"
                    placeholder={getPostcodePlaceholder()}
                    required
                    value={postcode}
                    onBlur={() => handleFieldBlur('postcode')}
                    onChange={(e) => {
                      setPostcode(e.target.value);
                      clearFieldError('postcode');
                    }}
                    className={`w-full px-3.5 py-2.5 text-xs md:text-sm border rounded-md focus:outline-none transition-colors ${
                      touchedFields.postcode && formErrors.postcode
                        ? 'border-red-500 bg-red-50/20 ring-1 ring-red-500'
                        : 'border-neutral-300 focus:border-black'
                    }`}
                  />
                  {touchedFields.postcode && formErrors.postcode && (
                    <p className="flex items-center gap-1.5 text-[11px] text-red-600 mt-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{formErrors.postcode}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div>
                <div className="relative">
                  <input
                    type="tel"
                    data-field="phone"
                    autoComplete="tel"
                    placeholder="Phone"
                    required
                    value={phone}
                    onBlur={() => handleFieldBlur('phone')}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      clearFieldError('phone');
                    }}
                    className={`w-full px-3.5 py-2.5 text-xs md:text-sm border rounded-md focus:outline-none transition-colors ${
                      touchedFields.phone && formErrors.phone
                        ? 'border-red-500 bg-red-50/20 ring-1 ring-red-500'
                        : 'border-neutral-300 focus:border-black'
                    }`}
                  />
                  <HelpCircle className="w-4 h-4 text-neutral-400 absolute right-3.5 top-3" />
                </div>
                {touchedFields.phone && formErrors.phone && (
                  <p className="flex items-center gap-1.5 text-[11px] text-red-600 mt-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{formErrors.phone}</span>
                  </p>
                )}
              </div>

              <label className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={textOffers}
                  onChange={(e) => setTextOffers(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black accent-black"
                />
                <span>Text me with news and offers</span>
              </label>
            </div>

            {/* 3. Shipping Method */}
            <div className="space-y-2">
              <h2 className="text-base font-bold text-neutral-900">Shipping method</h2>
              <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 flex items-center justify-between text-xs md:text-sm">
                <div>
                  <span className="font-semibold text-neutral-900 block">
                    {isFreeShipping ? `Worldwide Express Shipping (Free Over $${freeShippingThreshold})` : 'Worldwide Standard Express Shipping'}
                  </span>
                  <span className="text-[11px] text-neutral-500">Estimated 3-5 business days (DHL / FedEx / UPS)</span>
                </div>
                {isFreeShipping ? (
                  <span className="font-bold text-emerald-700">FREE</span>
                ) : (
                  <span className="font-bold text-neutral-900">${Number(shippingFee || 0).toFixed(2)} USD</span>
                )}
              </div>
            </div>

            {/* 4. Payment Section */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-bold text-neutral-900">Payment</h2>
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold whitespace-nowrap">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Stripe Verified Live</span>
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-neutral-500">All transactions are encrypted with 256-bit SSL security.</p>
              </div>

              <div className="border border-neutral-300 rounded-lg overflow-hidden divide-y divide-neutral-200 bg-white shadow-sm">
                
                {/* #1: Credit or Debit Card (Stripe Live) */}
                <div className={`transition-colors ${paymentMethod === 'credit-card' ? 'bg-[#faf9f6]' : 'bg-white hover:bg-neutral-50'}`}>
                  <div 
                    className="p-3.5 sm:p-4 flex items-center justify-between cursor-pointer gap-2"
                    onClick={() => setPaymentMethod('credit-card')}
                  >
                    <label className="flex items-center gap-2 text-xs md:text-sm font-bold text-neutral-900 cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'credit-card'}
                        onChange={() => setPaymentMethod('credit-card')}
                        className="w-4 h-4 text-black focus:ring-black accent-black"
                      />
                      <span>Credit or Debit Card</span>
                    </label>
                    <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                      <span className="bg-white px-1.5 sm:px-2 py-0.5 rounded border border-neutral-200 text-[9px] sm:text-[10px] font-black text-blue-900 tracking-wider">VISA</span>
                      <span className="bg-white px-1.5 sm:px-2 py-0.5 rounded border border-neutral-200 text-[9px] sm:text-[10px] font-black text-red-600 tracking-wider">MC</span>
                      <span className="bg-white px-1.5 sm:px-2 py-0.5 rounded border border-neutral-200 text-[9px] sm:text-[10px] font-black text-blue-600 tracking-wider">AMEX</span>
                      <span className="bg-white px-1.5 sm:px-2 py-0.5 rounded border border-neutral-200 text-[9px] sm:text-[10px] font-black text-amber-600 tracking-wider">DISCOVER</span>
                    </div>
                  </div>

                  {paymentMethod === 'credit-card' && (
                    <div className="px-3.5 sm:px-4 pb-4 pt-1 space-y-3 border-t border-neutral-200/60">
                      <p className="text-[11px] text-neutral-500">
                        Direct international checkout in <strong>USD ($)</strong> with zero currency markup.
                      </p>

                      {/* Stripe Card Element Box */}
                      <div className="space-y-1.5">
                        <label className="block text-[11px] font-semibold text-neutral-700">Card information</label>
                        <div className="relative">
                          <div
                            ref={stripeElementRef}
                            id="stripe-card-element"
                            className="w-full h-11 px-3.5 py-2.5 text-sm border border-neutral-300 rounded-md bg-white focus-within:border-black focus-within:ring-1 focus-within:ring-black"
                          />
                          {!isStripeReady && (
                            <div className="absolute inset-0 bg-white/95 rounded-md flex items-center px-3.5 gap-2 text-xs text-neutral-400 pointer-events-none z-10 border border-neutral-300">
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-500" />
                              <span>Loading secure card field...</span>
                            </div>
                          )}
                        </div>
                        {cardError && (
                          <div className="flex items-center gap-1.5 text-xs text-red-600 pt-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>{cardError}</span>
                          </div>
                        )}
                      </div>

                      {/* Name on card */}
                      <div className="space-y-1">
                        <label className="block text-[11px] font-semibold text-neutral-700">Name on card</label>
                        <input
                          type="text"
                          placeholder="Cardholder Name"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          className="w-full h-11 px-3.5 text-xs md:text-sm border border-neutral-300 rounded-md bg-white focus:outline-none focus:border-black"
                        />
                      </div>

                      <label className="flex items-center gap-2 text-xs text-neutral-700 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={sameBilling}
                          onChange={(e) => setSameBilling(e.target.checked)}
                          className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black accent-black"
                        />
                        <span>Use shipping address as billing address</span>
                      </label>

                      <div className="text-[11px] text-neutral-500 bg-neutral-100/80 p-2.5 rounded-md flex items-start gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>Your credit card number is encrypted with Stripe PCI-DSS Level 1 compliance. We do not store your raw card details.</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* #2: Bank Deposit / Wire Transfer */}
                <div className={`transition-colors ${paymentMethod === 'bank' ? 'bg-[#faf9f6]' : 'bg-white hover:bg-neutral-50'}`}>
                  <div 
                    className="p-4 flex items-center justify-between cursor-pointer"
                    onClick={() => setPaymentMethod('bank')}
                  >
                    <label className="flex items-center gap-2.5 text-xs md:text-sm font-semibold text-neutral-900 cursor-pointer">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'bank'}
                        onChange={() => setPaymentMethod('bank')}
                        className="w-4 h-4 text-black focus:ring-black accent-black"
                      />
                      <span>Direct Bank / International Wire Transfer</span>
                    </label>
                    <span className="text-[11px] font-medium text-neutral-500 flex items-center gap-1">
                      <Landmark className="w-3.5 h-3.5 text-neutral-500" />
                      <span>SWIFT / IBAN</span>
                    </span>
                  </div>
                  {paymentMethod === 'bank' && (
                    <div className="px-4 pb-4 pt-1 border-t border-neutral-200/60 space-y-2.5">
                      <div className="bg-neutral-100/80 p-3.5 rounded-md text-xs text-neutral-700 leading-relaxed space-y-2">
                        <p className="font-bold text-neutral-900 flex items-center gap-1.5">
                          <Landmark className="w-4 h-4 text-neutral-700" />
                          <span>Direct Wire Transfer Instructions</span>
                        </p>
                        <p className="text-[11px] text-neutral-600 leading-relaxed">
                          Place your order now to immediately reserve your handcrafted items in our workshop. Official beneficiary bank details (Beneficiary: Shrin Malik / Azim Crafts, Westpac Bank Australia, BSB: 732070, Account: 879384, SWIFT: WPACAU2S) and your unique Order Reference will be provided on the order confirmation screen.
                        </p>
                        <div className="bg-white/90 p-2.5 rounded border border-neutral-200 text-[11px] text-neutral-700 space-y-1">
                          <p className="font-medium text-neutral-900">Supported transfer networks:</p>
                          <p className="text-neutral-500">• Australia: Direct BSB / Account Transfer (NPP / PayID)</p>
                          <p className="text-neutral-500">• UK / Europe: Faster Payments / SEPA / IBAN</p>
                          <p className="text-neutral-500">• Worldwide: International SWIFT / Telegraphic Wire (USD)</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Pay Now Button */}
            <div className="space-y-4 pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full bg-[#0066cc] hover:bg-[#0052a3] text-white py-4 rounded-md font-bold text-sm md:text-base tracking-wide shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-90"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2.5">
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span>Authorizing Payment...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4 text-white/90" />
                    <span>
                      {paymentMethod === 'bank' 
                        ? `Place Order via Bank Transfer • $${Number(finalTotal || 0).toFixed(2)} USD`
                        : `Pay now • $${Number(finalTotal || 0).toFixed(2)} USD`}
                    </span>
                  </div>
                )}
              </button>

              <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-2 border-t border-neutral-200">
                <a href="/pages/t-c-refund-policy" className="hover:underline text-[#0066cc]">Refund policy</a>
                <a href="#" className="hover:underline text-[#0066cc]">Shipping</a>
                <a href="/pages/privacy-policy" className="hover:underline text-[#0066cc]">Privacy policy</a>
                <a href="/policies/terms-of-service" className="hover:underline text-[#0066cc]">Terms of service</a>
              </div>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Order Summary Sidebar (5 Columns, Sticky on Desktop) */}
        <div className="lg:col-span-5 bg-neutral-50/70 p-4 sm:p-8 lg:p-12">
          <div className="lg:sticky lg:top-8 space-y-6">
            
            {/* Items List (Scrollable if many items, keeping summary pinned) */}
            <div className="space-y-3.5 divide-y divide-neutral-200 max-h-[42vh] overflow-y-auto pr-1 no-scrollbar">
              {Array.isArray(cart) && cart.map((item, index) => {
                if (!item) return null;
                const product = item.product || item;
                const prodId = product.id || `item-${index}`;
                const prodTitle = product.title || 'Azim Crafts Item';
                const prodImage = product.image || '/vintage-to-modern-logo.png';
                const prodVendor = product.vendor || 'Azim Crafts';
                const qty = Number(item.quantity) || 1;
                const price = Number(product.price) || 0;
                const selectedSize = item.selectedSize || null;

                return (
                  <div key={`${prodId}-${selectedSize || index}`} className="pt-3.5 first:pt-0 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="relative w-16 h-16 rounded-lg bg-white border border-neutral-200 flex items-center justify-center p-1 shrink-0">
                        <img
                          src={prodImage}
                          alt={prodTitle}
                          className="w-full h-full object-contain"
                        />
                        <span className="absolute -top-2 -right-2 bg-neutral-700 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                          {qty}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xs md:text-sm font-semibold text-neutral-900 line-clamp-2 leading-snug">
                          {prodTitle}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-neutral-400 uppercase font-medium">
                            {prodVendor}
                          </span>
                          {selectedSize && (
                            <span className="text-[10px] font-bold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
                              Size: {selectedSize}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className="text-xs md:text-sm font-bold text-neutral-900 shrink-0">
                      ${(price * qty).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Discount Code Input Box matching screenshot */}
            <form onSubmit={handleApplyDiscount} className="flex gap-2 pt-3 border-t border-neutral-200">
              <input
                type="text"
                placeholder="Discount code"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                className="flex-1 px-3 py-2.5 text-xs md:text-sm border border-neutral-300 rounded-md bg-white focus:outline-none focus:border-black uppercase font-mono"
              />
              <button
                type="submit"
                className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 px-4 py-2.5 rounded-md text-xs font-bold uppercase transition-colors"
              >
                Apply
              </button>
            </form>

            {/* Subtotals & Final Totals */}
            <div className="space-y-2 text-xs md:text-sm border-t border-neutral-200 pt-4 text-neutral-600">
              <div className="flex justify-between">
                <span>Subtotal • {(Array.isArray(cart) ? cart : []).reduce((s, i) => s + (Number(i?.quantity) || 1), 0)} items</span>
                <span className="font-semibold text-neutral-900">${Number(subtotal || 0).toFixed(2)}</span>
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
                  <span>-${Number(discountAmount || 0).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                {isFreeShipping ? (
                  <span className="font-semibold text-emerald-700">FREE</span>
                ) : (
                  <span className="font-semibold text-neutral-900">${Number(shippingFee || 0).toFixed(2)} USD</span>
                )}
              </div>
              <div className="flex items-baseline justify-between text-base md:text-lg font-bold text-neutral-900 pt-3 border-t border-neutral-200">
                <span>Total</span>
                <div className="text-right">
                  <span className="text-xs text-neutral-500 font-normal mr-2">USD</span>
                  <span>${Number(finalTotal || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
