import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Mail, Clock, CheckCheck, AlertCircle, Inbox, Send, 
  Trash2, User, Search, CornerDownRight, CheckCircle2, 
  Plus, MessageSquare, Sparkles, Filter, ShieldCheck,
  Radio, MessageCircle, ArrowRight, Package, X, Check, Eye
, Loader2} from 'lucide-react';
import { allProducts } from '../../data/products';
import { getMessages, updateMessageStatusInDB, deleteMessageFromDB, getProducts } from '../../lib/cloudflareService';

export const DEFAULT_MESSAGES = [];

const PRIORITY_COLORS = {
  high: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', label: 'High Priority' },
  medium: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', label: 'Medium' },
  low: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', label: 'General' },
};

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 bg-gray-900 text-white px-5 py-3.5 rounded-xl shadow-2xl text-sm font-medium animate-fade-in border border-gray-700 font-menu">
      <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
      <span>{msg}</span>
    </div>
  );
}

// Modal to Select & Send Product to Customer in Live Chat
function ProductPickerModal({ onSendProduct, onClose }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [customNote, setCustomNote] = useState('');

  useEffect(() => {
    getProducts().then(data => {
      setProducts(Array.isArray(data) && data.length > 0 ? data : []);
    });
  }, []);

  const filteredProducts = products.filter(p => {
    const q = search.toLowerCase().trim();
    return !q || p.title.toLowerCase().includes(q) || 
      (p.categoryName && p.categoryName.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.id && p.id.toLowerCase().includes(q));
  });

  const handleSend = () => {
    if (!selectedProduct) return;
    onSendProduct(selectedProduct, customNote.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-menu">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl max-h-[88vh] overflow-hidden flex flex-col border border-gray-200 animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-neutral-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-50 rounded-xl text-[#c8924b] border border-amber-200">
              <Package size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Send Product Card in Live Chat</h3>
              <p className="text-xs text-gray-500">Customer will receive an interactive card they can click to view full details &amp; buy</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-200 text-gray-500 transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-100 bg-white">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full border border-gray-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs outline-none focus:ring-2 focus:ring-[#c8924b] focus:border-transparent"
              placeholder="Search product by title (e.g. Viking Shield, Thor Hammer, Diving Helmet, Compass)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {/* Products Grid / List */}
        <div className="p-4 overflow-y-auto flex-1 divide-y divide-gray-100 max-h-[340px]">
          {filteredProducts.map((p) => {
            const isSelected = selectedProduct?.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setSelectedProduct(p)}
                className={`p-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-all ${
                  isSelected ? 'bg-amber-50/90 border border-[#c8924b] ring-2 ring-[#c8924b]/20' : 'hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-white border border-gray-200 overflow-hidden flex items-center justify-center p-1 shrink-0">
                    <img src={p.image} alt={p.title} className="w-full h-full object-contain" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 line-clamp-1">{p.title}</h4>
                    <span className="text-[11px] text-gray-500 block">{p.categoryName || p.category}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-bold text-gray-900">${Number(p.price).toFixed(2)} USD</span>
                    {p.badge && (
                      <span className="block text-[10px] font-bold text-[#c8924b] uppercase">{p.badge}</span>
                    )}
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    isSelected ? 'bg-[#c8924b] border-[#c8924b] text-white' : 'border-gray-300'
                  }`}>
                    {isSelected && <Check size={12} />}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredProducts.length === 0 && (
            <div className="p-8 text-center text-xs text-gray-400">
              No products found matching "{search}".
            </div>
          )}
        </div>

        {/* Custom Message Note & Footer */}
        <div className="p-4 bg-neutral-50 border-t border-gray-200 space-y-3 shrink-0">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
              Optional Note with Recommendation:
            </label>
            <input
              className="w-full border border-gray-300 rounded-xl px-3.5 py-2 text-xs bg-white focus:ring-2 focus:ring-[#c8924b] outline-none"
              placeholder="e.g. Here is our 24-inch solid pine Viking Round Shield with steel rim and boss!"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!selectedProduct}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all hover:opacity-95 disabled:opacity-40 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #c8924b, #e8b06a)', color: '#0f1117' }}
            >
              <Send size={14} />
              <span>Send Product Card ({selectedProduct ? selectedProduct.title.slice(0, 20) + '...' : 'Select Product'})</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [liveThreads, setLiveThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'live' | 'unread' | 'high' | 'replied'
  const [search, setSearch] = useState('');
  const [replyInput, setReplyInput] = useState('');
  const [toast, setToast] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [productPickerOpen, setProductPickerOpen] = useState(false);

  const messagesEndRef = useRef(null);

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    let allMerged = [];

    // 1. Load Live Chat Threads from Storefront & D1 Database
    let threads = [];
    try {
      const res = await fetch('/api/chat');
      if (res.ok) {
        const remoteThreads = await res.json();
        if (Array.isArray(remoteThreads) && remoteThreads.length > 0) {
          threads = remoteThreads;
        }
      }
    } catch (e) {}

    try {
      const savedThreads = localStorage.getItem('vw_live_chat_threads');
      if (savedThreads) {
        const localThreads = JSON.parse(savedThreads);
        if (Array.isArray(localThreads)) {
          const map = new Map();
          threads.forEach(t => map.set(t.id, t));
          localThreads.forEach(t => {
            const existing = map.get(t.id);
            if (!existing || (t.lastUpdated || 0) > (existing.lastUpdated || 0)) {
              map.set(t.id, t);
              // Auto-sync thread to Cloudflare D1 so all other devices (laptop, mobile) see it live!
              fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(t)
              }).catch(() => {});
            }
          });
          threads = Array.from(map.values());
        }
      }
    } catch (e) {}
    setLiveThreads(threads);

    // 2. Load CRM Messages from DB
    let crm = [];
    try {
      const dbMsgs = await getMessages();
      if (Array.isArray(dbMsgs) && dbMsgs.length > 0) {
        crm = dbMsgs;
      }
    } catch (e) {
      crm = [];
    }

    // Clean up any legacy demo queries from local storage
    try {
      const savedAdminMsgs = localStorage.getItem('vw_admin_messages');
      if (savedAdminMsgs) {
        const parsed = JSON.parse(savedAdminMsgs);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.filter(m => !m.id || (!m.id.startsWith('inq-') && m.email !== 'rchen@gmail.com' && m.email !== 'sarah.w@yahoo.com' && m.email !== 'mthompson@outlook.com'));
          if (cleaned.length !== parsed.length) {
            localStorage.setItem('vw_admin_messages', JSON.stringify(cleaned));
          }
        }
      }
    } catch (e) {}

    const threadMapped = threads.map(t => {
      const isGuest = t.isGuest !== undefined 
        ? Boolean(t.isGuest) 
        : (!t.userEmail && (!t.email || t.email.includes('visitor-') || t.email.includes('guest_')));
      
      const displayName = isGuest ? (t.name && t.name.startsWith('Guest') ? t.name : `Guest User #${t.id}`) : (t.name || t.userEmail || t.email);
      const displayEmail = isGuest ? `Guest User (${t.id})` : (t.userEmail || t.email);

      return {
        id: t.id,
        name: displayName,
        email: displayEmail,
        userEmail: isGuest ? '' : (t.userEmail || t.email || ''),
        userId: t.userId || null,
        isGuest: isGuest,
        isResolved: Boolean(t.isResolved),
        subject: t.subject || (isGuest ? 'Guest Live Chat' : 'Customer Live Chat'),
        message: t.lastMessage || (t.messages && t.messages[t.messages.length - 1]?.text) || 'Live Chat Session',
        date: t.date || 'Today',
        read: t.read !== undefined ? t.read : false,
        replied: t.replied || false,
        priority: 'high',
        isLiveChat: true,
        messages: t.messages || []
      };
    });

    const threadIds = new Set(threadMapped.map(t => t.id));
    const uniqueCrm = crm.filter(c => !threadIds.has(c.id)).map(c => ({
      ...c,
      isResolved: Boolean(c.isResolved),
      isGuest: c.isGuest !== undefined ? Boolean(c.isGuest) : false,
      userEmail: c.isGuest ? '' : (c.email || '')
    }));
    allMerged = [...threadMapped, ...uniqueCrm];

    setMessages(allMerged);
    setSelectedId(prev => (prev !== null && allMerged.some(m => m.id === prev)) ? prev : allMerged[0]?.id);
    setLoading(false);
  };

  // Toggle Resolved status
  const handleToggleResolved = async (id) => {
    if (!id) return;
    const target = messages.find(m => m.id === id);
    if (!target) return;
    const nextStatus = !target.isResolved;

    const updated = messages.map(m => m.id === id ? { ...m, isResolved: nextStatus } : m);
    setMessages(updated);

    if (target.isLiveChat) {
      try {
        const savedThreads = localStorage.getItem('vw_live_chat_threads');
        if (savedThreads) {
          const threads = JSON.parse(savedThreads);
          const up = threads.map(t => t.id === id ? { ...t, isResolved: nextStatus } : t);
          localStorage.setItem('vw_live_chat_threads', JSON.stringify(up));
        }
      } catch (e) {}

      fetch('/api/chat', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: id,
          isResolved: nextStatus
        })
      }).catch(() => {});
    }

    try {
      localStorage.setItem('vw_admin_messages', JSON.stringify(updated));
    } catch (e) {}

    try {
      await updateMessageStatusInDB(id, { isResolved: nextStatus });
    } catch (e) {}

    window.dispatchEvent(new Event('vw_live_chat_updated'));
    window.dispatchEvent(new Event('vw_messages_updated'));

    setToast(nextStatus ? '🎉 Chat marked as Resolved!' : 'Chat reopened.');
  };

  useEffect(() => {
    loadData();
    const handleUpdate = () => loadData(true);
    window.addEventListener('vw_live_chat_updated', handleUpdate);
    window.addEventListener('vw_messages_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    // Auto-poll live chat every 4 seconds from D1 database so mobile chats show up live
    const pollInterval = setInterval(() => loadData(true), 4000);

    return () => {
      window.removeEventListener('vw_live_chat_updated', handleUpdate);
      window.removeEventListener('vw_messages_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      clearInterval(pollInterval);
    };
  }, []);

  const selected = useMemo(() => {
    return messages.find(m => m.id === selectedId) || messages[0] || null;
  }, [messages, selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selected]);

  const markRead = (id) => {
    const updated = messages.map((m) => (m.id === id ? { ...m, read: true } : m));
    setMessages(updated);

    try {
      const savedThreads = localStorage.getItem('vw_live_chat_threads');
      if (savedThreads) {
        const threads = JSON.parse(savedThreads);
        const up = threads.map(t => t.id === id ? { ...t, read: true } : t);
        localStorage.setItem('vw_live_chat_threads', JSON.stringify(up));
      }
      localStorage.setItem('vw_admin_messages', JSON.stringify(updated));
    } catch (e) {}

    const target = messages.find(m => m.id === id);
    if (target?.isLiveChat) {
      fetch('/api/chat', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, read: true })
      }).catch(() => {});
    } else if (id) {
      updateMessageStatusInDB(id, { read: true }).catch(() => {});
    }
  };

  // Send Text Reply
  const handleSendReply = (e) => {
    e?.preventDefault();
    if (!replyInput.trim() || !selected) return;

    setIsReplying(true);
    const replyText = replyInput.trim();
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setTimeout(() => {
      if (selected.isLiveChat) {
        try {
          const savedThreads = localStorage.getItem('vw_live_chat_threads');
          const threads = savedThreads ? JSON.parse(savedThreads) : [];
          
          const adminReplyObj = {
            id: Date.now(),
            sender: 'admin',
            senderName: 'Azim Crafts Support',
            text: replyText,
            time: currentTime,
            timestamp: Date.now()
          };

          const prevMsgs = (threads.find(t => t.id === selected.id)?.messages) || selected.messages || [];
          const nextMsgs = [...prevMsgs, adminReplyObj];

          const upThreads = threads.map(t => {
            if (t.id === selected.id) {
              return {
                ...t,
                read: true,
                replied: true,
                lastMessage: `Admin: ${replyText}`,
                messages: nextMsgs
              };
            }
            return t;
          });

          localStorage.setItem('vw_live_chat_threads', JSON.stringify(upThreads));
          window.dispatchEvent(new Event('vw_live_chat_updated'));

          // Push to Cloudflare D1 so customer sees it live
          fetch('/api/chat', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: selected.id,
              messages: nextMsgs,
              lastMessage: `Admin: ${replyText}`,
              replied: true,
              read: true
            })
          }).catch(() => {});
        } catch (e) {}
      } else {
        updateMessageStatusInDB(selected.id, {
          read: true,
          replied: true,
          replyText: replyText
        }).catch(() => {});
      }

      const updatedMessages = messages.map((m) => {
        if (m.id === selected.id) {
          const prevMsgs = m.messages || [];
          return {
            ...m,
            read: true,
            replied: true,
            replyText: replyText,
            repliedAt: `${currentTime} Today`,
            messages: selected.isLiveChat ? [...prevMsgs, {
              id: Date.now(),
              sender: 'admin',
              senderName: 'Azim Crafts Support',
              text: replyText,
              time: currentTime
            }] : prevMsgs
          };
        }
        return m;
      });

      setMessages(updatedMessages);
      localStorage.setItem('vw_admin_messages', JSON.stringify(updatedMessages));
      window.dispatchEvent(new Event('vw_messages_updated'));

      setReplyInput('');
      setIsReplying(false);
      setToast(`Live reply sent to ${selected.name}!`);
    }, 300);
  };

  // Send Recommended Product in Live Chat
  const handleSendProductRecommendation = (product, note) => {
    if (!selected) return;

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const productMsgText = note || `I recommend our handcrafted ${product.title}`;

    const adminProductMsg = {
      id: Date.now(),
      sender: 'admin',
      senderName: 'Azim Crafts Support',
      text: productMsgText,
      type: 'product_recommendation',
      time: currentTime,
      timestamp: Date.now(),
      product: {
        id: product.id,
        title: product.title,
        price: product.price,
        regularPrice: product.regularPrice,
        image: product.image,
        category: product.category,
        categoryName: product.categoryName || product.category,
        badge: product.badge,
        weight: product.weight,
        dimensions: product.dimensions
      }
    };

    if (selected.isLiveChat) {
      try {
        const savedThreads = localStorage.getItem('vw_live_chat_threads');
        const threads = savedThreads ? JSON.parse(savedThreads) : [];
        
        const upThreads = threads.map(t => {
          if (t.id === selected.id) {
            const prevMsgs = t.messages || [];
            return {
              ...t,
              read: true,
              replied: true,
              lastMessage: `Admin sent product: ${product.title}`,
              messages: [...prevMsgs, adminProductMsg]
            };
          }
          return t;
        });

        localStorage.setItem('vw_live_chat_threads', JSON.stringify(upThreads));
        window.dispatchEvent(new Event('vw_live_chat_updated'));

        // Push to Cloudflare D1
        const updatedThread = upThreads.find(t => t.id === selected.id);
        if (updatedThread) {
          fetch('/api/chat', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: selected.id,
              messages: updatedThread.messages,
              lastMessage: `Admin sent product: ${product.title}`,
              replied: true,
              read: true
            })
          }).catch(() => {});
        }
      } catch (e) {}
    }

    const updatedMessages = messages.map((m) => {
      if (m.id === selected.id) {
        const prevMsgs = m.messages || [];
        return {
          ...m,
          read: true,
          replied: true,
          replyText: `Product sent: ${product.title}`,
          repliedAt: `${currentTime} Today`,
          messages: [...prevMsgs, adminProductMsg]
        };
      }
      return m;
    });

    setMessages(updatedMessages);
    localStorage.setItem('vw_admin_messages', JSON.stringify(updatedMessages));
    window.dispatchEvent(new Event('vw_messages_updated'));

    setProductPickerOpen(false);
    setToast(`"${product.title}" card sent to ${selected.name} in chat!`);
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm('Delete this conversation?')) return;
    const updated = messages.filter(m => m.id !== id);
    setMessages(updated);
    
    try {
      const savedThreads = localStorage.getItem('vw_live_chat_threads');
      if (savedThreads) {
        const threads = JSON.parse(savedThreads).filter(t => t.id !== id);
        localStorage.setItem('vw_live_chat_threads', JSON.stringify(threads));
      }
      localStorage.setItem('vw_admin_messages', JSON.stringify(updated));
      window.dispatchEvent(new Event('vw_live_chat_updated'));
      window.dispatchEvent(new Event('vw_messages_updated'));
    } catch (e) {}

    try {
      await fetch('/api/chat?id=' + encodeURIComponent(id), { method: 'DELETE' });
    } catch (e) {}
    try {
      await deleteMessageFromDB(id);
    } catch (e) {}

    if (selectedId === id) {
      setSelectedId(updated[0]?.id || null);
    }
    setToast('Conversation deleted.');
  };

  const stats = useMemo(() => {
    return {
      total: messages.length,
      liveCount: messages.filter(m => m.isLiveChat).length,
      unread: messages.filter((m) => !m.read).length,
      highPriority: messages.filter((m) => m.priority === 'high').length,
      replied: messages.filter((m) => m.replied).length,
      resolved: messages.filter((m) => m.isResolved).length,
      active: messages.filter((m) => !m.isResolved).length,
    };
  }, [messages]);

  const filtered = useMemo(() => {
    return messages.filter((m) => {
      const matchFilter = 
        filter === 'all' ? true :
        filter === 'live' ? m.isLiveChat :
        filter === 'active' ? !m.isResolved :
        filter === 'resolved' ? m.isResolved :
        filter === 'unread' ? !m.read :
        filter === 'high' ? m.priority === 'high' :
        filter === 'replied' ? m.replied : true;

      const q = search.toLowerCase().trim();
      const matchSearch = !q || (
        (m.name && m.name.toLowerCase().includes(q)) ||
        (m.email && m.email.toLowerCase().includes(q)) ||
        (m.userEmail && m.userEmail.toLowerCase().includes(q)) ||
        (m.subject && m.subject.toLowerCase().includes(q)) ||
        (m.message && m.message.toLowerCase().includes(q))
      );

      return matchFilter && matchSearch;
    });
  }, [messages, filter, search]);

  return (
    <div className="p-6 max-w-7xl space-y-6 font-menu">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Customer Chat &amp; CRM</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Reply to storefront visitors live and send direct product recommendation cards to their chat widget.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Chat Sync Live</span>
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-[#c8924b] rounded-xl border border-amber-100">
            <Radio size={20} className="animate-pulse" />
          </div>
          <div>
            <span className="text-xs text-[#c8924b] font-bold uppercase tracking-wider">Live Chat Streams</span>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{stats.liveCount} Active</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-3">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-100">
            <Mail size={20} />
          </div>
          <div>
            <span className="text-xs text-red-700 font-bold uppercase tracking-wider">Unread Messages</span>
            <p className="text-2xl font-bold text-red-600 mt-0.5">{stats.unread}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-3">
          <div className="p-3 bg-neutral-100 text-neutral-800 rounded-xl">
            <Inbox size={20} />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Conversations</span>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span className="text-xs text-emerald-700 font-bold uppercase tracking-wider">Resolved Chats</span>
            <p className="text-2xl font-bold text-emerald-600 mt-0.5">{stats.resolved}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-4 flex flex-wrap gap-3 items-center justify-between">
        
        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Messages', count: stats.total },
            { key: 'live', label: 'Live Chats 🔴', count: stats.liveCount },
            { key: 'active', label: 'Open / Active', count: stats.active },
            { key: 'resolved', label: 'Resolved ✓', count: stats.resolved },
            { key: 'unread', label: 'Unread', count: stats.unread },
          ].map((tab) => {
            const isSelected = filter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                    : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                  isSelected ? 'bg-[#c8924b] text-neutral-900' : 'bg-neutral-200 text-neutral-800'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full border border-gray-300 rounded-xl pl-9 pr-3.5 py-2 text-xs outline-none focus:ring-2 focus:ring-[#c8924b] focus:border-transparent"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

      </div>

      {/* Main 2-Column Real-time Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
        
        {/* LEFT COLUMN: Live Feed (5 Columns) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[580px]">
          <div className="p-3.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between text-xs font-bold text-gray-700">
            <span>Conversations ({filtered.length})</span>
            <span className="text-[11px] text-gray-400 font-normal">Real-time sync</span>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 space-y-3">
                <div className="w-8 h-8 border-3 border-[#c8924b] border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-bold text-gray-500">Loading messages from database...</p>
              </div>
            ) : (
              <>
                {filtered.map((msg) => {
              const isSelected = selected?.id === msg.id;

              if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        <span className="ml-3 text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
                <div
                  key={msg.id}
                  onClick={() => {
                    setSelectedId(msg.id);
                    if (!msg.read) markRead(msg.id);
                  }}
                  className={`p-4 transition-all cursor-pointer text-left ${
                    isSelected 
                      ? 'bg-amber-50/80 border-l-4 border-l-[#c8924b]' 
                      : 'hover:bg-neutral-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      {msg.isLiveChat ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 animate-pulse" title="Live Storefront User" />
                      ) : !msg.read ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#c8924b] shrink-0" />
                      ) : null}
                      
                      <div className="flex items-center gap-1.5 min-w-0">
                        <h4 className={`text-xs truncate ${!msg.read ? 'font-black text-gray-900' : 'font-bold text-gray-700'}`}>
                          {msg.isGuest ? (msg.name || `Guest User (${msg.id})`) : (msg.name || msg.email)}
                        </h4>
                        {msg.isGuest ? (
                          <span className="text-[9px] font-bold bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded border border-neutral-200 shrink-0">
                            Guest
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 shrink-0" title={msg.email}>
                            User
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">{msg.date}</span>
                  </div>

                  <p className="text-xs font-semibold text-gray-800 line-clamp-1 mb-1">
                    {msg.subject}
                  </p>

                  <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed mb-2">
                    {msg.message}
                  </p>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-100/60">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {msg.isLiveChat ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <MessageCircle size={11} />
                          <span>Live Store Chat</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700">
                          Inquiry Form
                        </span>
                      )}

                      {msg.isResolved && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-0.5">
                          <CheckCircle2 size={10} />
                          <span>Resolved</span>
                        </span>
                      )}
                    </div>

                    {msg.replied ? (
                      <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCheck size={13} />
                        <span>Replied</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">
                        Needs Reply
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="p-12 text-center text-gray-400 space-y-2">
                <MessageSquare size={28} className="mx-auto text-gray-300" />
                <p className="text-xs font-bold text-gray-600">No conversations found</p>
                <p className="text-[11px]">When visitors chat on the storefront, their messages will appear here live.</p>
              </div>
            )}
              </>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time Dialogue & Live Reply Stream (7 Columns) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[580px]">
          {selected ? (
            <div className="flex flex-col h-full">
              
              {/* Detail Header */}
              <div className="p-4 border-b border-gray-100 bg-neutral-50/90 shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${
                        selected.isLiveChat ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-[#c8924b] border-amber-200'
                      }`}>
                        {selected.isLiveChat ? '🔴 Storefront Live Chat' : 'Customer Inquiry'}
                      </span>

                      {/* Guest vs Signed-In Customer Badge */}
                      {selected.isGuest ? (
                        <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-neutral-200/90 text-neutral-700 border border-neutral-300 flex items-center gap-1">
                          <User size={11} />
                          <span>Guest User</span>
                        </span>
                      ) : (
                        <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                          <ShieldCheck size={12} className="text-blue-600" />
                          <span>Signed In Customer</span>
                        </span>
                      )}

                      {/* Resolved Status Badge */}
                      {selected.isResolved ? (
                        <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          <span>Resolved</span>
                        </span>
                      ) : (
                        <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300">
                          Active / Open
                        </span>
                      )}

                      <span className="text-[11px] text-gray-400">{selected.date}</span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-gray-900 mt-1 flex items-center gap-2 flex-wrap">
                      <span>{selected.isGuest ? (selected.name || `Guest User #${selected.id}`) : selected.name}</span>
                      {!selected.isGuest && (selected.email || selected.userEmail) && (
                        <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                          ID: {selected.email || selected.userEmail}
                        </span>
                      )}
                    </h3>

                    <div className="text-xs text-gray-500 font-mono">
                      {selected.isGuest ? (
                        <span className="text-neutral-500 italic">Guest Session (ID: {selected.id}) • Not Signed In</span>
                      ) : (
                        <span className="flex items-center gap-1 text-neutral-700">
                          <Mail size={12} className="text-neutral-400" />
                          <span>Email: <strong className="text-neutral-900">{selected.email || selected.userEmail}</strong></span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Mark as Resolved / Reopen Button */}
                    <button
                      onClick={() => handleToggleResolved(selected.id)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-2xs ${
                        selected.isResolved
                          ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                      }`}
                      title={selected.isResolved ? 'Reopen this conversation' : 'Mark this chat as resolved'}
                    >
                      <CheckCircle2 size={14} />
                      <span>{selected.isResolved ? 'Reopen Chat' : 'Mark Resolved'}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteMessage(selected.id)}
                      className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete Conversation"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Message Feed / Chat Dialogue */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3.5 bg-neutral-50/40">
                
                {/* If it's a multi-message live chat thread */}
                {selected.isLiveChat && selected.messages && selected.messages.length > 0 ? (
                  selected.messages.map((m, idx) => (
                    <div key={m.id || idx} className="space-y-1">
                      {m.sender === 'user' ? (
                        /* Visitor Message */
                        <div className="flex flex-col items-start max-w-[85%]">
                          <span className="text-[10px] text-gray-400 font-semibold pl-1 mb-0.5">
                            Customer ({selected.name}) • {m.time}
                          </span>
                          <div className="bg-white border border-gray-200 text-gray-900 px-4 py-2.5 rounded-2xl rounded-tl-xs shadow-2xs text-xs leading-relaxed">
                            {m.text}
                          </div>
                        </div>
                      ) : m.sender === 'admin' ? (
                        /* Admin Response */
                        <div className="flex flex-col items-end max-w-[88%] ml-auto space-y-1">
                          <span className="text-[10px] text-[#c8924b] font-bold pr-1 mb-0.5 flex items-center gap-1">
                            <ShieldCheck size={12} />
                            <span>You (Store Admin) • {m.time}</span>
                          </span>

                          {/* If it contains recommended product */}
                          {m.product ? (
                            <div className="bg-[#1b1a1a] text-white p-3 rounded-2xl rounded-tr-xs shadow-md space-y-2 border border-neutral-700 text-left w-full max-w-sm">
                              {m.text && (
                                <p className="text-xs text-neutral-200 leading-relaxed font-medium">
                                  {m.text}
                                </p>
                              )}
                              <div className="bg-neutral-800 p-2.5 rounded-xl flex items-center gap-3 border border-neutral-700">
                                <img src={m.product.image} alt={m.product.title} className="w-12 h-12 rounded object-contain bg-neutral-900 shrink-0 p-1" />
                                <div className="min-w-0">
                                  <h5 className="text-xs font-bold text-white line-clamp-1">{m.product.title}</h5>
                                  <span className="text-xs font-black text-[#c8924b]">${Number(m.product.price).toFixed(2)} USD</span>
                                </div>
                              </div>
                              <span className="text-[10px] text-emerald-400 font-bold block">
                                ✅ Interactive Product Card sent to visitor
                              </span>
                            </div>
                          ) : (
                            <div className="bg-[#1b1a1a] text-white px-4 py-2.5 rounded-2xl rounded-tr-xs shadow-xs text-xs leading-relaxed">
                              {m.text}
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Bot / System Message */
                        <div className="flex flex-col items-start max-w-[85%]">
                          <span className="text-[10px] text-gray-400 pl-1 mb-0.5">Support Bot • {m.time}</span>
                          <div className="bg-neutral-100 text-gray-700 px-4 py-2 rounded-xl text-xs">
                            {m.text}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  /* Standard CRM Inquiry Display */
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                        <span>Message Content:</span>
                        <span className="text-[10px] text-gray-400 font-normal">{selected.date}</span>
                      </div>
                      <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {selected.message}
                      </p>
                    </div>

                    {selected.replied && selected.replyText && (
                      <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-2 animate-fade-in">
                        <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                          <div className="flex items-center gap-1.5">
                            <CornerDownRight size={14} className="text-[#c8924b]" />
                            <span>Your Sent Response:</span>
                          </div>
                          <span className="text-[10px] text-amber-700 font-normal">
                            {selected.repliedAt || 'Replied'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-800 leading-relaxed whitespace-pre-wrap">
                          {selected.replyText}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Real-time Reply Box with Attach Product Button */}
              <div className="p-3.5 border-t border-gray-200 bg-white shrink-0 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold px-1">
                  <span>Reply to <strong>{selected.name}</strong>:</span>
                  
                  {/* Attach / Recommend Product Button */}
                  <button
                    type="button"
                    onClick={() => setProductPickerOpen(true)}
                    className="flex items-center gap-1.5 text-xs font-bold text-[#c8924b] hover:text-[#b57f38] bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded-xl border border-amber-200/80 transition-all cursor-pointer"
                  >
                    <Package size={13} />
                    <span>+ Send Product Card</span>
                  </button>
                </div>

                <form onSubmit={handleSendReply} className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 border border-gray-300 rounded-xl px-3.5 py-2.5 text-xs focus:ring-2 focus:ring-[#c8924b] focus:border-transparent outline-none bg-neutral-50 focus:bg-white"
                    placeholder={`Type your reply to ${selected.name}...`}
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={isReplying || !replyInput.trim()}
                    className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all hover:opacity-95 disabled:opacity-40 cursor-pointer shrink-0"
                    style={{ background: 'linear-gradient(135deg, #c8924b, #e8b06a)', color: '#0f1117' }}
                  >
                    <Send size={14} />
                    <span>{isReplying ? 'Sending...' : 'Send Live'}</span>
                  </button>
                </form>
              </div>

            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-center p-8 text-gray-400 space-y-2 flex-col">
              <MessageSquare size={36} className="text-gray-300" />
              <p className="font-bold text-gray-700 text-sm">No Conversation Selected</p>
              <p className="text-xs">Select any live chat thread on the left to start replying in real-time.</p>
            </div>
          )}
        </div>

      </div>

      {/* Product Picker Modal */}
      {productPickerOpen && (
        <ProductPickerModal
          onSendProduct={handleSendProductRecommendation}
          onClose={() => setProductPickerOpen(false)}
        />
      )}

      {toast && <Toast msg={toast} onClose={() => setToast('')} />}
    </div>
  );
}
