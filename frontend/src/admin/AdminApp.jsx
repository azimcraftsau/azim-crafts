import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  MessageSquare,
  Settings,
  LogOut,
  Store,
  Bell,
  ChevronRight,
  Menu,
  X,
  Trash2,
  LayoutTemplate,
  ShieldCheck
} from 'lucide-react';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './views/AdminDashboard';
import { AdminProducts } from './views/AdminProducts';
import { AdminTrash } from './views/AdminTrash';
import { AdminBanners } from './views/AdminBanners';
import { AdminOrders } from './views/AdminOrders';
import { AdminUsers } from './views/AdminUsers';
import { AdminTeam } from './views/AdminTeam';
import { AdminCoupons } from './views/AdminCoupons';
import { AdminMessages } from './views/AdminMessages';
import { AdminSettings } from './views/AdminSettings';
import { 
  getTrashProducts, 
  getMessages, 
  getProducts, 
  getOrders, 
  getCategories, 
  getUsersList, 
  getHeroSlides 
} from '../lib/cloudflareService';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'team', label: 'Admins & Staff', icon: ShieldCheck },
  { id: 'trash', label: 'Trash Bin', icon: Trash2 },
  { id: 'banners', label: 'Banners & Media', icon: LayoutTemplate },
  { id: 'coupons', label: 'Coupons', icon: Tag },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const VIEW_COMPONENTS = {
  dashboard: AdminDashboard,
  products: AdminProducts,
  orders: AdminOrders,
  customers: AdminUsers,
  team: AdminTeam,
  trash: AdminTrash,
  banners: AdminBanners,
  coupons: AdminCoupons,
  messages: AdminMessages,
  settings: AdminSettings,
};

function Sidebar({ activeView, onNavigate, onLogout, session, mobileOpen, onMobileClose }) {
  const [trashCount, setTrashCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  const updateCounts = async () => {
    try {
      const [trash, msgs, chats] = await Promise.all([
        getTrashProducts().catch(() => []),
        getMessages().catch(() => []),
        fetch('/api/chat').then(r => r.json()).catch(() => [])
      ]);
      setTrashCount(Array.isArray(trash) ? trash.length : 0);
      const unreadMsgs = Array.isArray(msgs) ? msgs.filter(m => m.status === 'Unread' || !m.read).length : 0;
      const unreadChats = Array.isArray(chats) ? chats.filter(c => !c.read && !c.isResolved).length : 0;
      setUnreadMessagesCount(unreadMsgs + unreadChats);
    } catch {
      setTrashCount(0);
      setUnreadMessagesCount(0);
    }
  };

  useEffect(() => {
    updateCounts();
    window.addEventListener('vw_trash_updated', updateCounts);
    window.addEventListener('vw_messages_updated', updateCounts);
    window.addEventListener('storage', updateCounts);
    return () => {
      window.removeEventListener('vw_trash_updated', updateCounts);
      window.removeEventListener('vw_messages_updated', updateCounts);
      window.removeEventListener('storage', updateCounts);
    };
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-300
          lg:relative lg:translate-x-0 lg:z-auto
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{
          width: '240px',
          background: '#0f1117',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <img
              src="/logo/logo without bg.png"
              alt="Azim Crafts"
              className="w-10 h-10 object-contain flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-white font-bold text-sm leading-tight truncate">Azim Crafts</p>
              <p className="text-[10px] tracking-widest uppercase font-semibold" style={{ color: '#c8924b' }}>Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const isActive = activeView === id;
            return (
              <button
                key={id}
                onClick={() => { onNavigate(id); onMobileClose(); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative"
                style={{
                  background: isActive ? 'rgba(200,146,75,0.15)' : 'transparent',
                  color: isActive ? '#c8924b' : 'rgba(255,255,255,0.6)',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#1a1d26'; e.currentTarget.style.color = 'rgba(255,255,255,0.9)'; }}
                onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; } }}
              >
                {isActive && (
                  <span
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                    style={{ background: '#c8924b' }}
                  />
                )}
                <Icon size={17} />
                <span className="flex-1 text-left truncate">{label}</span>
                {id === 'trash' && trashCount > 0 && (
                  <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-500/30">
                    {trashCount}
                  </span>
                )}
                {id === 'messages' && unreadMessagesCount > 0 && (
                  <span className="bg-amber-500/20 text-[#c8924b] text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30 animate-pulse">
                    {unreadMessagesCount}
                  </span>
                )}
                {isActive && <ChevronRight size={13} className="opacity-60" />}
              </button>
            );
          })}
        </nav>

        {/* Session info + logout */}
        <div className="px-4 py-4 border-t border-white/5">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: '#c8924b' }}>
              {(session?.name || 'A').charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{session?.name || 'Store Admin'}</p>
              <p className="text-gray-500 text-[10px] truncate">{session?.email || ''}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-all text-red-400 hover:bg-red-900/20"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export function AdminApp() {
  const [session, setSession] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('vw_admin_session');
    const token = localStorage.getItem('vw_admin_token');
    if (stored && token) {
      try {
        const parsed = JSON.parse(stored);
        // Verify token with backend
        fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ action: 'verify_token' })
        }).then(res => res.json()).then(data => {
          if (data.success) {
            setSession(parsed);
          } else {
            localStorage.removeItem('vw_admin_session');
            localStorage.removeItem('vw_admin_token');
          }
        }).catch(() => {
          // If backend is down, still allow cached session
          setSession(parsed);
        });
      } catch { 
        localStorage.removeItem('vw_admin_session');
        localStorage.removeItem('vw_admin_token');
      }
    }
  }, []);

  // Pre-warm memory cache so tab switching between Products, Orders, Customers is 0ms instant!
  useEffect(() => {
    if (session) {
      getProducts().catch(() => {});
      getOrders().catch(() => {});
      getCategories().catch(() => {});
      getUsersList().catch(() => {});
      getHeroSlides().catch(() => {});
    }
  }, [session]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('vw_admin_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };

  const handleLogin = (s) => setSession(s);
  const handleLogout = () => {
    localStorage.removeItem('vw_admin_session');
    localStorage.removeItem('vw_admin_token');
    setSession(null);
  };

  if (!session) return <AdminLogin onLogin={handleLogin} />;

  const ActiveView = VIEW_COMPONENTS[activeView] || AdminDashboard;
  const activeLabel = NAV_ITEMS.find((n) => n.id === activeView)?.label || 'Dashboard';

  return (
    <div className="flex h-screen overflow-hidden" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        onLogout={handleLogout}
        session={session}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header
          className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b bg-white flex-shrink-0"
          style={{ borderColor: '#e5e7eb' }}
        >
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="font-bold text-gray-900 text-sm sm:text-base">{activeLabel}</h1>
              <p className="text-xs text-gray-400 hidden sm:block">Azim Crafts – Admin Control Panel</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#c8924b] rounded-full" />
            </button>
            <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-gray-200">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{ background: '#c8924b' }}>
                {(session?.name || 'A').charAt(0)}
              </div>
              <span className="text-sm font-semibold text-gray-700 hidden sm:block">{session?.name}</span>
            </div>
          </div>
        </header>

        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto" style={{ background: '#f4f5f7' }}>
          <ActiveView onNavigate={setActiveView} getAuthHeaders={getAuthHeaders} />
        </main>
      </div>
    </div>
  );
}

export default AdminApp;
