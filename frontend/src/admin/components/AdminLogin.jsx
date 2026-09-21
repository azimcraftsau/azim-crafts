import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Shield, Lock, ArrowLeft, CheckCircle2, Mail, KeyRound } from 'lucide-react';

export function AdminLogin({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'forgot' | 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Check URL parameters for password reset token
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      let token = urlParams.get('reset_token') || urlParams.get('token');
      let mail = urlParams.get('email');

      if (!token && window.location.hash.includes('?')) {
        const hashQuery = window.location.hash.split('?')[1];
        const hashParams = new URLSearchParams(hashQuery);
        token = hashParams.get('reset_token') || hashParams.get('token');
        mail = hashParams.get('email');
      }

      if (token && mail) {
        setResetToken(token);
        setEmail(mail);
        setMode('reset');
      }
    } catch (e) {}
  }, []);

  // 1. Submit Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: email.trim(),
          password
        })
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success && data?.user) {
        const allowedRoles = ['admin', 'superadmin', 'subadmin', 'manager', 'staff'];
        if (!allowedRoles.includes(data.user.role)) {
          setError('Access denied: Administrator permissions required.');
          setLoading(false);
          return;
        }

        const session = {
          email: data.user.email,
          name: data.user.name || 'Store Admin',
          role: data.user.role || 'admin',
          token: data.token,
          loginTime: Date.now(),
        };
        localStorage.setItem('vw_admin_session', JSON.stringify(session));
        localStorage.setItem('vw_admin_token', data.token);
        onLogin(session);
      } else {
        setError(data?.error || 'Invalid credentials. Access denied.');
        setLoading(false);
      }
    } catch (err) {
      setError('Unable to connect to authentication server. Please try again.');
      setLoading(false);
    }
  };

  // 2. Submit Forgot Password (Request Reset Link)
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'admin_forgot_password',
          email: email.trim()
        })
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        setSuccessMsg(data.message || `Password reset link sent to ${email}. Check your inbox!`);
        setLoading(false);
      } else {
        setError(data?.error || 'Unable to send reset link. Please check the email entered.');
        setLoading(false);
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  // 3. Submit Reset Password (Set New Password with Token)
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (newPassword.trim().length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'admin_reset_password',
          email: email.trim(),
          token: resetToken,
          newPassword: newPassword.trim()
        })
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        setSuccessMsg('Password updated successfully! You can now sign in with your new password.');
        setPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setMode('login');
        setLoading(false);
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        setError(data?.error || 'Failed to reset password. The link may have expired.');
        setLoading(false);
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: '#0f1117',
        backgroundImage: `
          linear-gradient(rgba(200,146,75,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(200,146,75,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }}
    >
      {/* Glow blob */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(200,146,75,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="relative w-full max-w-md mx-4">
        {/* Card */}
        <div
          className="rounded-2xl p-8 shadow-2xl"
          style={{
            background: '#1a1d26',
            border: '1px solid #c8924b',
            boxShadow: '0 0 40px rgba(200,146,75,0.15), 0 25px 50px rgba(0,0,0,0.5)',
          }}
        >
          {/* Logo / Brand */}
          <div className="text-center mb-6">
            <img
              src="/logo/logo without bg.png"
              alt="Azim Crafts"
              className="w-20 h-20 object-contain mx-auto mb-3"
            />
            <h1 className="text-white text-xl font-bold tracking-wide">Azim Crafts</h1>
            <div className="flex items-center justify-center gap-2 mt-1">
              <Shield size={13} className="text-[#c8924b]" />
              <span className="text-[#c8924b] text-xs font-semibold tracking-widest uppercase">
                {mode === 'forgot'
                  ? 'Password Recovery Portal'
                  : mode === 'reset'
                  ? 'Set New Admin Password'
                  : 'Admin Control Panel'}
              </span>
            </div>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-4 flex items-start gap-2.5 bg-emerald-950/40 border border-emerald-600/50 rounded-xl p-3.5 text-emerald-300 text-xs">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p>{successMsg}</p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-4 flex items-center gap-2 bg-red-900/30 border border-red-700/50 rounded-lg px-3 py-2.5">
              <Lock size={14} className="text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-xs">{error}</p>
            </div>
          )}

          {/* ================= MODE 1: LOGIN FORM ================= */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@azimcrafts.com"
                  required
                  className="w-full px-4 py-3 rounded-lg text-sm text-white placeholder-gray-600 outline-none transition-all"
                  style={{
                    background: '#0f1117',
                    border: '1px solid #2a2d3a',
                    color: 'white',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#c8924b')}
                  onBlur={(e) => (e.target.style.borderColor = '#2a2d3a')}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError('');
                      setSuccessMsg('');
                    }}
                    className="text-xs text-[#c8924b] hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full px-4 py-3 pr-12 rounded-lg text-sm outline-none transition-all"
                    style={{
                      background: '#0f1117',
                      border: '1px solid #2a2d3a',
                      color: 'white',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#c8924b')}
                    onBlur={(e) => (e.target.style.borderColor = '#2a2d3a')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#c8924b] transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-bold text-sm tracking-wide transition-all mt-2 disabled:opacity-60 cursor-pointer"
                style={{
                  background: loading ? '#a07238' : 'linear-gradient(135deg, #c8924b, #e8b06a)',
                  color: '#0f1117',
                }}
              >
                {loading ? 'Authenticating...' : 'Sign In to Admin Panel'}
              </button>
            </form>
          )}

          {/* ================= MODE 2: FORGOT PASSWORD FORM ================= */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <p className="text-gray-300 text-xs leading-relaxed">
                Enter your registered administrator or sub-admin email address. We will send you a secure password reset link valid for 30 minutes.
              </p>

              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                  Administrator Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@azimcrafts.com"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-lg text-sm text-white placeholder-gray-600 outline-none transition-all"
                    style={{
                      background: '#0f1117',
                      border: '1px solid #2a2d3a',
                      color: 'white',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#c8924b')}
                    onBlur={(e) => (e.target.style.borderColor = '#2a2d3a')}
                  />
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-bold text-sm tracking-wide transition-all mt-2 disabled:opacity-60 cursor-pointer"
                style={{
                  background: loading ? '#a07238' : 'linear-gradient(135deg, #c8924b, #e8b06a)',
                  color: '#0f1117',
                }}
              >
                {loading ? 'Sending Reset Link...' : 'Send Password Reset Link'}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft size={13} />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </form>
          )}

          {/* ================= MODE 3: RESET PASSWORD FORM ================= */}
          {mode === 'reset' && (
            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div className="bg-[#0f1117] p-3 rounded-xl border border-white/5 mb-3">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider block">Resetting Account:</span>
                <span className="text-white text-xs font-mono font-semibold">{email}</span>
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                  New Password (min 6 characters)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 pr-12 rounded-lg text-sm outline-none transition-all"
                    style={{
                      background: '#0f1117',
                      border: '1px solid #2a2d3a',
                      color: 'white',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#c8924b')}
                    onBlur={(e) => (e.target.style.borderColor = '#2a2d3a')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#c8924b] transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 rounded-lg text-sm outline-none transition-all"
                  style={{
                    background: '#0f1117',
                    border: '1px solid #2a2d3a',
                    color: 'white',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#c8924b')}
                  onBlur={(e) => (e.target.style.borderColor = '#2a2d3a')}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-bold text-sm tracking-wide transition-all mt-2 disabled:opacity-60 cursor-pointer"
                style={{
                  background: loading ? '#a07238' : 'linear-gradient(135deg, #c8924b, #e8b06a)',
                  color: '#0f1117',
                }}
              >
                {loading ? 'Updating Password...' : 'Save & Set New Password'}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ArrowLeft size={13} />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </form>
          )}

          {/* Footer note */}
          <p className="text-center text-gray-600 text-xs mt-6 flex items-center justify-center gap-1.5">
            <Lock size={10} />
            Restricted Access – Authorized Personnel Only
          </p>
        </div>
      </div>
    </div>
  );
}
