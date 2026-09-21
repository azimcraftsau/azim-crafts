import React, { useState } from 'react';
import { Eye, EyeOff, Shield, Lock } from 'lucide-react';

export function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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
        if (data.user.role !== 'admin') {
          setError('Access denied: Administrator permissions required.');
          setLoading(false);
          return;
        }

        const session = {
          email: data.user.email,
          name: data.user.name || 'Store Admin',
          role: 'admin',
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
          <div className="text-center mb-8">
            <img
              src="/logo/logo without bg.png"
              alt="Azim Crafts"
              className="w-20 h-20 object-contain mx-auto mb-3"
            />
            <h1 className="text-white text-xl font-bold tracking-wide">Azim Crafts</h1>
            <div className="flex items-center justify-center gap-2 mt-1">
              <Shield size={13} className="text-[#c8924b]" />
              <span className="text-[#c8924b] text-xs font-semibold tracking-widest uppercase">Admin Control Panel</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
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
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1.5">
                Password
              </label>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#c8924b] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-900/30 border border-red-700/50 rounded-lg px-3 py-2.5">
                <Lock size={14} className="text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-bold text-sm tracking-wide transition-all mt-2 disabled:opacity-60"
              style={{
                background: loading ? '#a07238' : 'linear-gradient(135deg, #c8924b, #e8b06a)',
                color: '#0f1117',
              }}
            >
              {loading ? 'Authenticating...' : 'Sign In to Admin Panel'}
            </button>
          </form>

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
