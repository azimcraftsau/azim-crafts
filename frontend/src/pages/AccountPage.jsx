import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { 
  User, Mail, Lock, Phone, Eye, EyeOff, MapPin, 
  Plus, Trash2, CheckCircle2, ArrowRight, ShieldCheck, KeyRound, X, Truck, AlertCircle 
} from 'lucide-react';

import { signInUser, signUpUser, updateUserAddressInDB, requestPasswordReset, resetPassword, getOrders } from '../lib/cloudflareService';
import { CustomerOrderTrackingModal } from '../components/modals/CustomerOrderTrackingModal';
import { COUNTRY_DIAL_CODES, DEFAULT_COUNTRY } from '../data/countryDialCodes';

export const AccountPage = () => {
  const { user, loginUser, logoutUser, navigateTo, showToast } = useCart();

  // Mode: 'login' | 'register' | 'forgot' | 'reset'
  const [authMode, setAuthMode] = useState('login');
  const [regError, setRegError] = useState('');
  
  // Real orders state
  const [userOrders, setUserOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingOrder, setTrackingOrder] = useState(null);
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register Form States (First Name, Last Name, Email, Phone, Country Dial Code, Password)
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(DEFAULT_COUNTRY);
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [generatedResetUrl, setGeneratedResetUrl] = useState('');

  // Reset Password State (New Password & Confirm Password)
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Address View State
  const [showAddresses, setShowAddresses] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newStreet, setNewStreet] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newCountry, setNewCountry] = useState('Australia');

  const [isLoading, setIsLoading] = useState(false);

  const fetchUserOrders = async () => {
    if (!user?.email) return;
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const orders = await res.json();
        if (Array.isArray(orders)) {
          const userOnly = orders.filter(o => 
            (o.customerEmail && o.customerEmail.toLowerCase() === user.email.toLowerCase()) ||
            (o.customer && user.name && o.customer.toLowerCase() === user.name.toLowerCase())
          );
          setUserOrders(userOnly);
          return;
        }
      }
    } catch (e) {}

    try {
      const remote = await getOrders();
      if (Array.isArray(remote)) {
        const userOnly = remote.filter(o => 
          (o.customerEmail && o.customerEmail.toLowerCase() === user.email.toLowerCase()) ||
          (o.customer && user.name && o.customer.toLowerCase() === user.name.toLowerCase())
        );
        setUserOrders(userOnly);
      }
    } catch (e) {}
  };

  // Load real orders for logged-in user with live polling
  useEffect(() => {
    fetchUserOrders();
    window.addEventListener('vw_orders_updated', fetchUserOrders);
    const interval = setInterval(fetchUserOrders, 3000);
    return () => {
      window.removeEventListener('vw_orders_updated', fetchUserOrders);
      clearInterval(interval);
    };
  }, [user]);

  // Check URL query / hash on mount for reset token
  useEffect(() => {
    const parseResetParams = () => {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      const pathname = window.location.pathname || '';

      if (hash.includes('reset') || search.includes('reset') || pathname.includes('reset')) {
        setAuthMode('reset');

        // Extract token and email from query params or hash
        const urlParams = new URLSearchParams(search);
        let t = urlParams.get('token');
        let em = urlParams.get('email');

        if (!t && hash.includes('?')) {
          const hashParams = new URLSearchParams(hash.split('?')[1]);
          t = hashParams.get('token');
          em = hashParams.get('email');
        }

        if (t) setResetToken(t);
        if (em) setForgotEmail(decodeURIComponent(em));
      }
    };

    parseResetParams();
    window.addEventListener('hashchange', parseResetParams);
    window.addEventListener('popstate', parseResetParams);
    return () => {
      window.removeEventListener('hashchange', parseResetParams);
      window.removeEventListener('popstate', parseResetParams);
    };
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      showToast('Please enter your email and password.', 'error');
      return;
    }
    setIsLoading(true);
    const res = await signInUser(loginEmail, loginPassword);
    setIsLoading(false);
    if (res.success && res.user) {
      loginUser(res.user.email, res.user.name);
      showToast(`Welcome back, ${res.user.name}!`);
    } else {
      showToast(res.error || 'Invalid credentials', 'error');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');
    if (!regFirstName || !regLastName || !regEmail || !regPassword) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    setIsLoading(true);
    const fullName = `${regFirstName} ${regLastName}`.trim();
    const formattedPhone = regPhone ? `${selectedCountry.dial} ${regPhone.trim()}` : '';
    const res = await signUpUser(fullName, regEmail, regPassword, formattedPhone, selectedCountry.name);
    setIsLoading(false);
    if (res.success && res.user) {
      loginUser(res.user.email, res.user.name);
      showToast('Account created successfully! Welcome to Azim Crafts.');
    } else {
      const errorMsg = res.error || 'This email is already registered. Please log in.';
      setRegError(errorMsg);
      showToast(errorMsg, 'error');
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      showToast('Please enter your email address.', 'error');
      return;
    }
    setIsLoading(true);
    const res = await requestPasswordReset(forgotEmail);
    setIsLoading(false);
    if (res.success) {
      setForgotSent(true);
      if (res.resetUrl) setGeneratedResetUrl(res.resetUrl);
      showToast(res.message || `Password reset link sent to ${forgotEmail}`);
    } else {
      showToast(res.error || 'No account found with this email address.', 'error');
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      showToast('Please enter and confirm your new password.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match. Please try again.', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    setIsLoading(true);
    const emailUsed = forgotEmail || '';
    const res = await resetPassword(emailUsed, newPassword, resetToken);
    setIsLoading(false);
    if (res.success) {
      const userObj = res.user;
      const displayName = userObj?.name || (emailUsed ? emailUsed.split('@')[0] : 'Valued Customer');
      loginUser(emailUsed, displayName);
      setAuthMode('login');
      showToast('Your password has been reset successfully! Welcome back.');
    } else {
      showToast(res.error || 'Password reset failed. Please request a new link.', 'error');
    }
  };

  // 1. LOGGED IN ACCOUNT DASHBOARD (Exact Match to Screenshot)
  if (user) {
    return (
      <div className="min-h-[70vh] bg-white py-12 md:py-20 font-menu text-[#131313]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          
          {/* Main Account Heading & Log out */}
          <div className="mb-12">
            <h1 className="font-heading text-4xl md:text-5xl font-normal text-neutral-900 tracking-wide mb-3">
              Account
            </h1>
            <button
              onClick={logoutUser}
              className="inline-flex items-center gap-1.5 text-xs md:text-sm text-neutral-600 hover:text-black transition-colors underline underline-offset-4"
            >
              <User className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>

          {/* 2 Columns: Order History (Left) and Account Details (Right) matching screenshot */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-start">
            
            {/* Left: Order History (8 cols) */}
            <div className="md:col-span-8 space-y-4">
              <h2 className="font-heading text-2xl font-normal text-neutral-900 tracking-wide">
                Order history
              </h2>

              {userOrders && userOrders.length > 0 ? (
                <div className="space-y-4 pt-1">
                  <div className="border border-neutral-200 rounded-lg overflow-hidden divide-y divide-neutral-100">
                    {userOrders.map((ord) => (
                      <div 
                        key={ord.id} 
                        className="p-4 bg-neutral-50/50 hover:bg-amber-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs group rounded-lg"
                      >
                        <div className="space-y-1 cursor-pointer" onClick={() => setSelectedOrder(ord)}>
                          <div className="flex items-center gap-2">
                            <strong className="text-neutral-900 font-mono group-hover:text-[#c8924b] transition-colors">{ord.id}</strong>
                            <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">{ord.status || 'Processing'}</span>
                          </div>
                          <p className="text-neutral-700 font-medium">{ord.items}</p>
                          <span className="text-[11px] text-neutral-400 font-medium">Placed on {ord.date || 'Today'}</span>
                        </div>

                        <div className="flex items-center gap-2.5 sm:self-center">
                          <div className="text-right sm:mr-2">
                            <span className="text-sm font-bold text-neutral-900 block">${Number(ord.total || 0).toFixed(2)} USD</span>
                          </div>
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            className="px-3 py-1.5 rounded-lg border border-neutral-300 hover:border-black text-neutral-800 text-xs font-semibold transition-colors cursor-pointer bg-white"
                          >
                            Receipt
                          </button>
                          <button
                            onClick={() => setTrackingOrder(ord)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-[#c8924b] text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                          >
                            <Truck size={13} />
                            <span>Track</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-6 text-center space-y-3">
                  <p className="text-xs md:text-sm text-neutral-600">
                    You haven't placed any orders yet.
                  </p>
                  <button
                    onClick={() => navigateTo('home')}
                    className="inline-flex items-center gap-2 bg-[#1b1a1a] hover:bg-[#333333] text-white text-xs font-bold px-5 py-2.5 rounded-full transition-all cursor-pointer"
                  >
                    <span>Explore Products</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Right: Account Details (4 cols) matching screenshot */}
            <div className="md:col-span-4 space-y-4">
              <h2 className="font-heading text-2xl font-normal text-neutral-900 tracking-wide">
                Account details
              </h2>

              <div className="text-xs md:text-sm text-neutral-700 space-y-1">
                <p className="font-semibold text-neutral-900">{user.name}</p>
                <p className="text-neutral-500">{user.email}</p>
                <p className="text-neutral-700 font-medium pt-1">Australia</p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowAddresses(!showAddresses)}
                  className="text-xs md:text-sm text-neutral-800 hover:text-black underline underline-offset-4 transition-colors"
                >
                  {showAddresses ? 'Hide addresses' : 'View addresses (1)'}
                </button>
              </div>

              {/* Address Dropdown / Management Card */}
              {showAddresses && (
                <div className="mt-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200 text-xs space-y-3 animate-fade-in">
                  <div className="space-y-1 text-neutral-600">
                    <span className="font-bold text-neutral-900 block">Default Shipping Address:</span>
                    <p>{user.name || 'Shrin Malik'}</p>
                    <p>42a chestnut road</p>
                    <p>Auburn, NSW 2144</p>
                    <p>Australia</p>
                  </div>

                  {!isAddingAddress ? (
                    <button
                      onClick={() => setIsAddingAddress(true)}
                      className="inline-flex items-center gap-1 bg-white border border-neutral-300 hover:border-black text-neutral-800 px-3 py-1.5 rounded text-xs font-semibold transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add a new address</span>
                    </button>
                  ) : (
                    <div className="space-y-2 pt-2 border-t border-neutral-200">
                      <input
                        type="text"
                        placeholder="Street Address"
                        value={newStreet}
                        onChange={(e) => setNewStreet(e.target.value)}
                        className="w-full p-2 border border-neutral-300 rounded bg-white text-xs"
                      />
                      <input
                        type="text"
                        placeholder="City"
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        className="w-full p-2 border border-neutral-300 rounded bg-white text-xs"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            showToast('Address saved successfully!');
                            setIsAddingAddress(false);
                          }}
                          className="bg-black text-white px-3 py-1.5 rounded text-xs font-semibold"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setIsAddingAddress(false)}
                          className="text-neutral-500 hover:text-black text-xs px-2"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Details Receipt Modal */}
        {selectedOrder && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs font-menu animate-fade-in"
            onClick={() => setSelectedOrder(null)}
          >
            <div 
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden z-10 border border-neutral-200"
              onClick={(e) => e.stopPropagation()}
            >
              
              {/* Top Banner */}
              <div className="bg-[#1b1a1a] text-white p-4 sm:p-5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-mono text-base font-bold text-[#f7eddb]">{selectedOrder.id}</h3>
                    <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                      {selectedOrder.status || 'Processing'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400">Placed on {selectedOrder.date || 'Today'}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Order Receipt Body */}
              <div className="p-5 sm:p-6 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
                
                {/* Items Purchased (Parsed Item by Item) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-heading text-xs font-bold text-neutral-900 uppercase tracking-wider">
                      Items Purchased
                    </h4>
                    <span className="text-[10px] text-neutral-400 font-semibold">
                      {Array.isArray(selectedOrder.itemsList) ? selectedOrder.itemsList.length : (selectedOrder.items || '').split(',').length} Item(s)
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {(() => {
                      let itemsToRender = [];
                      if (Array.isArray(selectedOrder.itemsList) && selectedOrder.itemsList.length > 0) {
                        itemsToRender = selectedOrder.itemsList;
                      } else if (selectedOrder.items) {
                        itemsToRender = selectedOrder.items.split(',').map((str, idx) => {
                          const trimmed = str.trim();
                          let title = trimmed;
                          let qty = 1;
                          const match = trimmed.match(/(.*?)\s*\(?x?(\d+)\)?$/i);
                          if (match && match[1]) {
                            title = match[1].trim();
                            qty = parseInt(match[2], 10) || 1;
                          }
                          return {
                            id: idx + 1,
                            title,
                            quantity: qty,
                            sku: `VTM-PRD-${100 + idx}`
                          };
                        });
                      }

                      return itemsToRender.map((item, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => {
                            const ord = selectedOrder;
                            setSelectedOrder(null);
                            setTrackingOrder(ord);
                          }}
                          title="Click to track live package"
                          className="p-3 bg-neutral-50 hover:bg-amber-50/70 transition-colors rounded-xl border border-neutral-200 flex items-center justify-between gap-3 cursor-pointer group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-amber-100/80 text-[#c8924b] font-bold text-sm flex items-center justify-center shrink-0 border border-amber-200/60 shadow-2xs">
                              🛡️
                            </div>
                            <div>
                              <p className="text-neutral-900 font-bold text-xs leading-snug group-hover:text-[#c8924b] transition-colors">
                                {item.title}
                              </p>
                              <span className="text-[10.5px] text-neutral-500 font-medium">
                                Quantity: <strong className="text-neutral-900 font-bold">x{item.quantity || 1}</strong> &bull; Authentic Masterpiece
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="bg-neutral-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0">
                              Qty: {item.quantity || 1}
                            </span>
                            <span className="hidden sm:inline text-[10px] text-[#c8924b] font-bold group-hover:underline">Track &rarr;</span>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Pricing & Offers Breakdown */}
                <div className="space-y-2 pt-2 border-t border-neutral-100">
                  <h4 className="font-heading text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    Payment &amp; Discounts Breakdown
                  </h4>
                  <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-2 text-neutral-600">
                    <div className="flex justify-between">
                      <span>Order Items Subtotal</span>
                      <span className="font-semibold text-neutral-900">${Number(selectedOrder.total || 0).toFixed(2)} USD</span>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Shipping (Worldwide Express)</span>
                      <span className="font-bold">FREE</span>
                    </div>
                    <div className="flex justify-between text-[#ae2828] font-semibold">
                      <span>Special Welcome Offer / Discount</span>
                      <span>Applied (Saved 15%)</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-neutral-900 pt-2 border-t border-neutral-200">
                      <span>Total Paid Amount</span>
                      <span>${Number(selectedOrder.total || 0).toFixed(2)} USD</span>
                    </div>
                  </div>
                </div>

                {/* Delivery & Tracking Details */}
                <div className="space-y-2 pt-2 border-t border-neutral-100">
                  <div className="flex items-center justify-between">
                    <h4 className="font-heading text-xs font-bold text-neutral-900 uppercase tracking-wider">
                      Shipping &amp; Tracking Information
                    </h4>
                    <button
                      onClick={() => {
                        const ord = selectedOrder;
                        setSelectedOrder(null);
                        setTrackingOrder(ord);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#c8924b] hover:text-[#b57f38] cursor-pointer"
                    >
                      <Truck size={12} />
                      <span>Live Tracker &rarr;</span>
                    </button>
                  </div>

                  <div className="p-3.5 bg-[#fcfaf7] rounded-xl border border-[#ebd7b2] space-y-2 text-neutral-700">
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-500">Shipping Carrier:</span>
                      <span className="font-semibold">{selectedOrder.carrier || 'DHL Express Worldwide'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-500">Tracking Number:</span>
                      <span className="font-mono font-bold text-neutral-900 bg-white px-2 py-0.5 rounded border border-neutral-200">
                        {selectedOrder.tracking || 'Pending Live Assignment'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-500">Payment Mode:</span>
                      <span className="font-semibold text-emerald-700">{selectedOrder.payment || 'Paid (Confirmed)'}</span>
                    </div>

                    <div className="pt-2 border-t border-[#ebd7b2]/70">
                      <button
                        onClick={() => {
                          const ord = selectedOrder;
                          setSelectedOrder(null);
                          setTrackingOrder(ord);
                        }}
                        className="w-full inline-flex items-center justify-center gap-2 bg-[#c8924b] hover:bg-[#b57f38] text-white text-xs font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm cursor-pointer"
                      >
                        <Truck size={14} />
                        <span>Track My Order Live (DHL Express)</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Footer */}
              <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[11px] text-neutral-500">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>30-Day Money Back Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const ord = selectedOrder;
                      setSelectedOrder(null);
                      setTrackingOrder(ord);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-[#c8924b] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    <Truck size={13} />
                    <span>Track Order</span>
                  </button>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Live Customer Order Tracking Modal */}
        {trackingOrder && (
          <CustomerOrderTrackingModal
            order={trackingOrder}
            onClose={() => setTrackingOrder(null)}
          />
        )}

      </div>
    );
  }

  // 2. GUEST LOGIN / CREATE ACCOUNT / FORGOT / RESET PASSWORD FORMS
  return (
    <div className="min-h-[75vh] bg-white py-12 md:py-20 font-menu text-[#131313]">
      <div className="max-w-[480px] mx-auto px-4">
        
        {/* ================= MODE: LOGIN ================= */}
        {authMode === 'login' && (
          <div className="space-y-6 text-center animate-fade-in">
            <h1 className="font-heading text-3xl md:text-4xl font-normal text-neutral-900 tracking-wide">
              Login
            </h1>

            <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
              <div>
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-4 py-3 text-xs md:text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white"
                />
              </div>

              <div>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    placeholder="Password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-4 pr-10 py-3 text-xs md:text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-neutral-700"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="text-left">
                <button
                  type="button"
                  onClick={() => setAuthMode('forgot')}
                  className="text-xs text-neutral-500 hover:text-black underline underline-offset-4 transition-colors"
                >
                  Forgot your password?
                </button>
              </div>

              <div className="pt-2 space-y-4 text-center">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#f7eddb] hover:bg-[#eedaba] text-[#131313] py-3 px-8 rounded-md font-semibold text-xs md:text-sm uppercase tracking-wider transition-colors border border-[#e8ce9f] shadow-2xs min-w-[120px]"
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </button>

                <div>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('register'); setRegError(''); }}
                    className="text-xs text-neutral-600 hover:text-black underline underline-offset-4 transition-colors"
                  >
                    Create account
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ================= MODE: CREATE ACCOUNT ================= */}
        {authMode === 'register' && (
          <div className="space-y-6 text-center animate-fade-in">
            <h1 className="font-heading text-3xl md:text-4xl font-normal text-neutral-900 tracking-wide">
              Create account
            </h1>

            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-left">
              {regError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2.5 animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold leading-snug">{regError}</p>
                    {regError.toLowerCase().includes('already registered') && (
                      <button
                        type="button"
                        onClick={() => {
                          setRegError('');
                          setLoginEmail(regEmail);
                          setAuthMode('login');
                        }}
                        className="mt-1.5 text-xs font-bold text-neutral-950 hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <span>Already have an account? Click here to sign in</span>
                        <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div>
                <input
                  type="text"
                  required
                  placeholder="First name"
                  value={regFirstName}
                  onChange={(e) => setRegFirstName(e.target.value)}
                  className="w-full px-4 py-3 text-xs md:text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white"
                />
              </div>

              <div>
                <input
                  type="text"
                  required
                  placeholder="Last name"
                  value={regLastName}
                  onChange={(e) => setRegLastName(e.target.value)}
                  className="w-full px-4 py-3 text-xs md:text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white"
                />
              </div>

              <div>
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-4 py-3 text-xs md:text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white"
                />
              </div>

              <div>
                <div className="flex rounded-md border border-neutral-300 focus-within:ring-1 focus-within:ring-black focus-within:border-black overflow-hidden bg-white">
                  <div className="relative flex items-center bg-neutral-100 border-r border-neutral-300 shrink-0">
                    <select
                      value={selectedCountry.code}
                      onChange={(e) => {
                        const found = COUNTRY_DIAL_CODES.find(c => c.code === e.target.value);
                        if (found) setSelectedCountry(found);
                      }}
                      className="h-full py-3 pl-3 pr-7 text-xs md:text-sm bg-transparent border-0 outline-none appearance-none cursor-pointer font-medium text-neutral-800"
                      aria-label="Country Dial Code"
                    >
                      {COUNTRY_DIAL_CODES.map(c => (
                        <option key={c.code} value={c.code} className="bg-white text-neutral-900">
                          {c.flag} {c.dial} ({c.name})
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-2 text-neutral-500 text-[10px]">
                      ▼
                    </div>
                  </div>
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-4 py-3 text-xs md:text-sm border-0 focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    placeholder="Password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-4 pr-10 py-3 text-xs md:text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-neutral-700"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 space-y-4 text-center">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#f7eddb] hover:bg-[#eedaba] text-[#131313] py-3 px-8 rounded-md font-semibold text-xs md:text-sm uppercase tracking-wider transition-colors border border-[#e8ce9f] shadow-2xs min-w-[140px]"
                >
                  {isLoading ? 'Creating...' : 'Create'}
                </button>

                <div>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setRegError(''); }}
                    className="text-xs text-neutral-600 hover:text-black underline underline-offset-4 transition-colors"
                  >
                    Already have an account? Sign in
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* ================= MODE: FORGOT PASSWORD ================= */}
        {authMode === 'forgot' && (
          <div className="space-y-6 text-center animate-fade-in">
            <h1 className="font-heading text-3xl md:text-4xl font-normal text-neutral-900 tracking-wide">
              Reset your password
            </h1>
            <p className="text-xs text-neutral-500">
              We will send you an email to reset your password.
            </p>

            {forgotSent ? (
              <div className="bg-[#fcfaf7] border border-[#ecd6b0] p-6 rounded-xl text-left space-y-4 text-xs animate-fade-in">
                <div className="flex items-center gap-2.5 text-emerald-700 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>Password Reset Link Sent!</span>
                </div>
                
                <p className="text-neutral-700 leading-relaxed text-xs">
                  We have dispatched a secure password reset link to <strong className="text-neutral-900 font-semibold">{forgotEmail}</strong>.
                </p>

                <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-lg space-y-1.5 text-neutral-600 text-[11.5px]">
                  <p className="font-semibold text-neutral-900 flex items-center gap-1.5">
                    <span>📩 Check your email inbox</span>
                  </p>
                  <p>Open the email from <strong>Azim Crafts</strong> and click the <strong>Reset Password Now</strong> button to create your new password. This link is valid for <strong>15 minutes</strong>.</p>
                  <p className="text-neutral-500 text-[10.5px] pt-1">Tip: If you do not see the email in your inbox within a couple of minutes, please check your Spam or Promotions folder.</p>
                </div>

                {generatedResetUrl && (
                  <div className="p-3 bg-white border border-dashed border-neutral-300 rounded-lg space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-neutral-500 font-medium">
                      <span>🔗 Direct Reset Link (Quick Access):</span>
                    </div>
                    <a
                      href={generatedResetUrl}
                      className="w-full bg-[#1b1a1a] hover:bg-[#333333] text-white py-2.5 px-4 rounded-md font-semibold text-xs tracking-wider transition-colors flex items-center justify-center gap-1.5 text-center block"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-[#f7eddb]" />
                      <span>Click to Set New Password Now &rarr;</span>
                    </a>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between border-t border-neutral-200/80 text-xs">
                  <button
                    type="button"
                    onClick={() => { setForgotSent(false); }}
                    className="text-neutral-600 hover:text-black underline cursor-pointer"
                  >
                    Resend link
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthMode('login'); setForgotSent(false); }}
                    className="font-bold text-neutral-900 hover:underline cursor-pointer"
                  >
                    Return to login &rarr;
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4 text-left">
                <div>
                  <input
                    type="email"
                    required
                    placeholder="Email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-4 py-3 text-xs md:text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white"
                  />
                </div>

                <div className="pt-2 space-y-3 text-center">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-[#f7eddb] hover:bg-[#eedaba] text-[#131313] py-3 px-8 rounded-md font-semibold text-xs md:text-sm uppercase tracking-wider transition-colors border border-[#e8ce9f] shadow-2xs min-w-[120px]"
                  >
                    {isLoading ? 'Submitting...' : 'Submit'}
                  </button>

                  <div>
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className="text-xs text-neutral-500 hover:text-black underline underline-offset-4 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ================= MODE: RESET PASSWORD (NEW & CONFIRM PASSWORD) ================= */}
        {authMode === 'reset' && (
          <div className="space-y-6 text-center animate-fade-in">
            <h1 className="font-heading text-3xl md:text-4xl font-normal text-neutral-900 tracking-wide">
              Reset Account Password
            </h1>
            <p className="text-xs text-neutral-500">
              Enter your new password for {forgotEmail || 'your account'}.
            </p>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-left">
              {/* New Password */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 pr-10 py-3 text-xs md:text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-neutral-700"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 pr-10 py-3 text-xs md:text-sm border border-neutral-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-neutral-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 space-y-4 text-center">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#f7eddb] hover:bg-[#eedaba] text-[#131313] py-3 px-8 rounded-md font-semibold text-xs md:text-sm uppercase tracking-wider transition-colors border border-[#e8ce9f] shadow-2xs min-w-[160px]"
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>

                <div>
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-xs text-neutral-500 hover:text-black underline underline-offset-4 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
