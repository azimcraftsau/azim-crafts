import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { signInUser, signUpUser } from '../../lib/cloudflareService';
import { COUNTRY_DIAL_CODES, DEFAULT_COUNTRY } from '../../data/countryDialCodes';
import { X, Lock, Mail, User, Phone, ArrowRight, ShieldCheck, Eye, EyeOff, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export const AuthModal = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, loginUser, showToast, authRedirectAction, setAuthRedirectAction, navigateTo } = useCart();
  
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [signupError, setSignupError] = useState('');
  
  // Login Form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);

  // Sign Up Form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(DEFAULT_COUNTRY);
  const [regPassword, setRegPassword] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    setIsAuthModalOpen(false);
  };

  const handleSuccessAuth = (email, name) => {
    loginUser(email, name);
    setIsAuthModalOpen(false);
    if (authRedirectAction && typeof authRedirectAction === 'function') {
      authRedirectAction();
      setAuthRedirectAction(null);
    }
  };

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
      showToast(`Welcome back, ${res.user.name}! Proceeding to checkout...`);
      handleSuccessAuth(res.user.email, res.user.name);
    } else {
      showToast(res.error || 'Invalid email or password.', 'error');
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupError('');
    if (!firstName || !lastName || !regEmail || !regPassword) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    setIsLoading(true);
    const fullName = `${firstName} ${lastName}`.trim();
    const formattedPhone = regPhone ? `${selectedCountry.dial} ${regPhone.trim()}` : '';
    const res = await signUpUser(fullName, regEmail, regPassword, formattedPhone, selectedCountry.name);
    setIsLoading(false);
    if (res.success && res.user) {
      showToast(`Account created! Welcome, ${fullName}! Proceeding to checkout...`);
      handleSuccessAuth(res.user.email, res.user.name);
    } else {
      const errorMsg = res.error || 'This email is already registered. Please log in.';
      setSignupError(errorMsg);
      showToast(errorMsg, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs font-menu">
      <div 
        className="fixed inset-0"
        onClick={handleClose}
      />
      
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-neutral-200 z-10 animate-fade-in">
        
        {/* Top Header */}
        <div className="bg-[#1b1a1a] text-white p-6 text-center relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
          
          <div className="w-12 h-12 bg-amber-400/20 text-[#f7eddb] rounded-2xl flex items-center justify-center mx-auto mb-3 border border-amber-300/30">
            <Lock size={22} className="text-[#c8924b]" />
          </div>
          
          <h2 className="font-heading text-xl font-bold text-white tracking-wide">
            {mode === 'login' ? 'Sign In to Proceed' : 'Create Customer Account'}
          </h2>
          <p className="text-xs text-neutral-400 mt-1 max-w-xs mx-auto">
            Sign in or register to secure your items and track live express shipping.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 bg-neutral-100 border-b border-neutral-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('login'); setSignupError(''); }}
            className={`py-2.5 rounded-xl transition-all cursor-pointer ${
              mode === 'login' 
                ? 'bg-white text-neutral-900 shadow-xs' 
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('signup'); setSignupError(''); }}
            className={`py-2.5 rounded-xl transition-all cursor-pointer ${
              mode === 'signup' 
                ? 'bg-white text-neutral-900 shadow-xs' 
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Create Account
          </button>
        </div>

        <div className="p-6 space-y-4">
          {mode === 'login' ? (
            /* ================= LOGIN FORM ================= */
            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="e.g. collector@vtmcraft.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#c8924b] outline-none"
                  />
                  <Mail size={15} className="text-neutral-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showLoginPass ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-9 pr-9 py-2.5 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#c8924b] outline-none"
                  />
                  <Lock size={15} className="text-neutral-400 absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowLoginPass(!showLoginPass)}
                    className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                  >
                    {showLoginPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <div className="text-right mt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAuthModalOpen(false);
                      navigateTo('account');
                      window.location.hash = '#account';
                    }}
                    className="text-[11px] text-neutral-500 hover:text-neutral-900 underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1b1a1a] hover:bg-[#333333] text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Sign In &amp; Continue to Checkout</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* ================= SIGN UP FORM ================= */
            <form onSubmit={handleSignupSubmit} className="space-y-3">
              {signupError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold leading-snug">{signupError}</p>
                    {signupError.toLowerCase().includes('already registered') && (
                      <button
                        type="button"
                        onClick={() => {
                          setSignupError('');
                          setLoginEmail(regEmail);
                          setMode('login');
                        }}
                        className="mt-1.5 text-[11px] font-bold text-[#c8924b] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <span>Click here to sign in with this email</span>
                        <ArrowRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#c8924b] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#c8924b] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="name@gmail.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#c8924b] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Mobile Number (Nationality &amp; STD Code)
                </label>
                <div className="flex rounded-xl border border-neutral-300 focus-within:ring-2 focus-within:ring-[#c8924b] overflow-hidden bg-white">
                  <div className="relative flex items-center bg-neutral-100 border-r border-neutral-300 shrink-0">
                    <select
                      value={selectedCountry.code}
                      onChange={(e) => {
                        const found = COUNTRY_DIAL_CODES.find(c => c.code === e.target.value);
                        if (found) setSelectedCountry(found);
                      }}
                      className="h-full py-2 pl-2.5 pr-6 text-xs bg-transparent border-0 outline-none appearance-none cursor-pointer font-medium text-neutral-800"
                      aria-label="Country Dial Code"
                    >
                      {COUNTRY_DIAL_CODES.map(c => (
                        <option key={c.code} value={c.code} className="bg-white text-neutral-900">
                          {c.flag} {c.dial} ({c.name})
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-1.5 text-neutral-500 text-[9px]">
                      ▼
                    </div>
                  </div>
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border-0 focus:outline-none bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Create Password *</label>
                <div className="relative">
                  <input
                    type={showRegPass ? 'text' : 'password'}
                    required
                    placeholder="At least 6 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full pl-3 pr-9 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[#c8924b] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPass(!showRegPass)}
                    className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                  >
                    {showRegPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#c8924b] hover:bg-[#b57f38] text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create Account &amp; Continue</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>
          )}

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400 pt-2 border-t border-neutral-100">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>256-Bit SSL Encrypted &bull; 100% Data Protection</span>
          </div>

        </div>

      </div>
    </div>
  );
};
