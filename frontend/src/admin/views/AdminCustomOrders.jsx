import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, Mail, Phone, Clock, CheckCircle2, AlertCircle, 
  Trash2, User, Search, Filter, ShieldCheck, Ruler, 
  Palette, Home, FileText, ChevronRight, RefreshCw, Loader2,
  Layers, Package, Check, Eye
} from 'lucide-react';
import { getMessages, updateMessageStatusInDB, deleteMessageFromDB } from '../../lib/cloudflareService';

function Toast({ msg, onClose }) {
  useEffect(() => { 
    const t = setTimeout(onClose, 3000); 
    return () => clearTimeout(t); 
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 bg-gray-900 text-white px-5 py-3.5 rounded-xl shadow-2xl text-sm font-medium animate-fade-in border border-gray-700 font-menu">
      <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
      <span>{msg}</span>
    </div>
  );
}

// Helper to parse key custom order fields from structured properties or text fallback
function parseCustomOrder(item) {
  const msgText = item.message || '';
  
  // Try structured fields first
  let category = item.category || item.customCategory || '';
  let phone = item.phone || '';
  let dimensions = item.dimensions || '';
  let finish = item.finish || '';
  let quantity = item.quantity || '';
  let roomDetails = item.roomDetails || '';
  let notes = item.notes || '';

  // Fallback regex parsing if fields were formatted as raw message text
  if (!category) {
    const catMatch = msgText.match(/Target Category:\s*([^\n\r]+)/i);
    if (catMatch) category = catMatch[1].trim();
  }
  if (!phone) {
    const phoneMatch = msgText.match(/(?:Phone|WhatsApp)(?:\s*Number)?:\s*([^\n\r]+)/i);
    if (phoneMatch) phone = phoneMatch[1].trim();
  }
  if (!dimensions) {
    const dimMatch = msgText.match(/Requested Dimensions[^:]*:\s*([^\n\r]+)/i);
    if (dimMatch) dimensions = dimMatch[1].trim();
  }
  if (!finish) {
    const finMatch = msgText.match(/Preferred Metal Finish[^:]*:\s*([^\n\r]+)/i);
    if (finMatch) finish = finMatch[1].trim();
  }
  if (!quantity) {
    const qtyMatch = msgText.match(/Quantity Needed:\s*([^\n\r]+)/i);
    if (qtyMatch) quantity = qtyMatch[1].trim();
  }
  if (!roomDetails) {
    const roomMatch = msgText.match(/Room \/ Installation Space:\s*([^\n\r]+)/i);
    if (roomMatch) roomDetails = roomMatch[1].trim();
  }
  if (!notes) {
    const notesMatch = msgText.match(/--- CLIENT NOTES & DESIGN DETAILS ---\s*([\s\S]*)/i);
    if (notesMatch && notesMatch[1]) {
      notes = notesMatch[1].trim();
    }
  }

  // Fallback category from subject if still empty
  if (!category && item.subject) {
    const subMatch = item.subject.match(/Custom Order Request:\s*(.*)/i);
    if (subMatch) category = subMatch[1].trim();
  }

  return {
    ...item,
    parsedCategory: category || 'Custom Commission',
    parsedPhone: phone,
    parsedDimensions: dimensions || 'To be discussed with artisan',
    parsedFinish: finish || 'Standard Artisan Patina',
    parsedQuantity: quantity || '1 Piece',
    parsedRoom: roomDetails || 'Not specified',
    parsedNotes: notes || msgText || 'No additional notes provided.'
  };
}

export function AdminCustomOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'resolved' | 'unread'
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [adminNote, setAdminNote] = useState('');

  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const allMsgs = await getMessages();
      if (Array.isArray(allMsgs)) {
        // Filter strictly to Custom Orders & Bespoke Commissions
        const customOnly = allMsgs.filter(m => 
          m.type === 'custom_order' || 
          m.subject?.includes('Custom Quote') || 
          m.subject?.includes('Custom Order') || 
          m.subject?.includes('Bespoke')
        ).map(parseCustomOrder);

        setOrders(customOnly);
        if (customOnly.length > 0 && selectedId === null) {
          setSelectedId(customOnly[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load custom orders:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Auto refresh when new custom quotes arrive
    const handleUpdate = () => loadData(true);
    window.addEventListener('vw_messages_updated', handleUpdate);
    const interval = setInterval(() => loadData(true), 5000);

    return () => {
      window.removeEventListener('vw_messages_updated', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const selected = useMemo(() => {
    return orders.find(o => o.id === selectedId) || orders[0] || null;
  }, [orders, selectedId]);

  const markRead = (id) => {
    const updated = orders.map(o => (o.id === id ? { ...o, read: true } : o));
    setOrders(updated);
    updateMessageStatusInDB(id, { read: true }).catch(() => {});
  };

  const handleToggleResolved = async (id) => {
    if (!id) return;
    const target = orders.find(o => o.id === id);
    if (!target) return;
    const nextStatus = !target.isResolved;

    const updated = orders.map(o => o.id === id ? { ...o, isResolved: nextStatus } : o);
    setOrders(updated);

    try {
      await updateMessageStatusInDB(id, { isResolved: nextStatus });
      setToast(nextStatus ? '✓ Custom order marked as Resolved!' : 'Custom order reopened.');
    } catch (err) {
      console.error('Error toggling resolution:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this custom order request?')) return;
    const updated = orders.filter(o => o.id !== id);
    setOrders(updated);
    if (selectedId === id) {
      setSelectedId(updated[0]?.id || null);
    }
    try {
      await deleteMessageFromDB(id);
      setToast('Custom order request deleted.');
    } catch (err) {
      console.error('Error deleting custom order:', err);
    }
  };

  const stats = useMemo(() => {
    return {
      total: orders.length,
      active: orders.filter(o => !o.isResolved).length,
      resolved: orders.filter(o => o.isResolved).length,
      unread: orders.filter(o => !o.read).length
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const matchFilter = 
        filter === 'all' ? true :
        filter === 'active' ? !o.isResolved :
        filter === 'resolved' ? o.isResolved :
        filter === 'unread' ? !o.read : true;

      const q = search.toLowerCase().trim();
      const matchSearch = !q || (
        (o.name && o.name.toLowerCase().includes(q)) ||
        (o.email && o.email.toLowerCase().includes(q)) ||
        (o.parsedPhone && o.parsedPhone.toLowerCase().includes(q)) ||
        (o.parsedCategory && o.parsedCategory.toLowerCase().includes(q)) ||
        (o.parsedDimensions && o.parsedDimensions.toLowerCase().includes(q)) ||
        (o.parsedNotes && o.parsedNotes.toLowerCase().includes(q))
      );

      return matchFilter && matchSearch;
    });
  }, [orders, filter, search]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl space-y-6 font-menu">
      {toast && <Toast msg={toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-amber-500/10 text-[#c8924b] rounded-lg border border-amber-500/20">
              <Sparkles size={18} />
            </span>
            <h1 className="text-2xl font-bold text-gray-900">Custom Orders &amp; Bespoke Commissions</h1>
          </div>
          <p className="text-sm text-gray-500">
            Client requests for custom sizing, dimensions, tailored finishes, and made-to-order artisan pieces.
          </p>
        </div>

        <button
          onClick={() => loadData()}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors cursor-pointer border border-neutral-300"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin text-[#c8924b]' : ''} />
          <span>Refresh Requests</span>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">Total Custom Requests</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block">Active / In Progress</span>
          <p className="text-2xl font-bold text-[#c8924b] mt-1">{stats.active}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">Resolved &amp; Quoted</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.resolved}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider block">Unread Inquiries</span>
          <p className="text-2xl font-bold text-red-600 mt-1">{stats.unread}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-3.5 sm:p-4 flex flex-wrap gap-3 items-center justify-between">
        {/* Filter Pills */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Requests', count: stats.total },
            { key: 'active', label: 'Active / Open', count: stats.active },
            { key: 'resolved', label: 'Resolved ✓', count: stats.resolved },
            { key: 'unread', label: 'Unread', count: stats.unread },
          ].map((tab) => {
            const isSelected = filter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                    : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-0.2 rounded-full text-[10px] font-black ${
                  isSelected ? 'bg-[#c8924b] text-neutral-900' : 'bg-neutral-200 text-neutral-800'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative min-w-[240px] flex-1 sm:flex-initial">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full border border-gray-300 rounded-xl pl-9 pr-3.5 py-2 text-xs outline-none focus:ring-2 focus:ring-[#c8924b] focus:border-transparent bg-white"
            placeholder="Search by customer, category, sizing..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Main Split Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Requests List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden flex flex-col h-[650px]">
          <div className="p-3.5 border-b border-gray-100 bg-gray-50/80 flex items-center justify-between text-xs font-bold text-gray-700">
            <span>Requests ({filteredOrders.length})</span>
            <span className="text-[11px] text-gray-400 font-normal">Live database sync</span>
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-28 space-y-3">
                <Loader2 className="w-8 h-8 text-[#c8924b] animate-spin" />
                <p className="text-xs font-semibold text-gray-500">Loading custom orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="p-12 text-center text-gray-400 space-y-2">
                <Sparkles size={32} className="mx-auto text-gray-300" />
                <p className="text-xs font-bold text-gray-700">No custom orders found</p>
                <p className="text-[11px] text-gray-500">
                  When customers submit the custom commission form on the storefront, their requests will appear here.
                </p>
              </div>
            ) : (
              filteredOrders.map((item) => {
                const isSelected = selected?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedId(item.id);
                      if (!item.read) markRead(item.id);
                    }}
                    className={`p-4 transition-all cursor-pointer text-left border-l-4 ${
                      isSelected 
                        ? 'bg-amber-50/70 border-l-[#c8924b]' 
                        : 'border-l-transparent hover:bg-neutral-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        {!item.read && (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#c8924b] shrink-0" title="Unread Request" />
                        )}
                        <h4 className={`text-xs truncate ${!item.read ? 'font-black text-gray-900' : 'font-bold text-gray-800'}`}>
                          {item.name || 'Anonymous Client'}
                        </h4>
                      </div>
                      <span className="text-[10px] text-gray-400 shrink-0 font-medium">{item.date}</span>
                    </div>

                    {/* Category Badge */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-amber-100/80 text-amber-950 border border-amber-300/80 line-clamp-1">
                        🎨 {item.parsedCategory}
                      </span>
                      {item.isResolved ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Resolved
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                          Open
                        </span>
                      )}
                    </div>

                    {/* Sizing & details preview */}
                    <p className="text-[11.5px] text-gray-600 line-clamp-2 leading-relaxed">
                      <strong>Dimensions:</strong> {item.parsedDimensions}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Order Details & Specification Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden flex flex-col min-h-[650px]">
          {selected ? (
            <div className="flex flex-col h-full divide-y divide-gray-100">
              
              {/* Detail Header */}
              <div className="p-5 bg-neutral-50/80 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-950 border border-amber-300">
                      🎨 {selected.parsedCategory}
                    </span>
                    {selected.isResolved ? (
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 size={13} />
                        <span>Resolved</span>
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-300">
                        Active / Pending
                      </span>
                    )}
                    <span className="text-xs text-gray-400 font-medium">{selected.date}</span>
                  </div>

                  <h2 className="text-lg font-bold text-gray-900">
                    {selected.name || 'Custom Order Inquiry'}
                  </h2>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleResolved(selected.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border shadow-2xs ${
                      selected.isResolved
                        ? 'bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-neutral-300'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
                    }`}
                  >
                    <CheckCircle2 size={14} />
                    <span>{selected.isResolved ? 'Reopen Request' : 'Mark Resolved'}</span>
                  </button>

                  <button
                    onClick={() => handleDelete(selected.id)}
                    className="p-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors cursor-pointer border border-transparent hover:border-red-200"
                    title="Delete Request"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Detail Content Body */}
              <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
                
                {/* 1. Client Contact Details Box */}
                <div className="bg-[#faf8f5] p-4 rounded-xl border border-neutral-200 space-y-3">
                  <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                    <User size={14} className="text-[#c8924b]" />
                    <span>Client Contact Details</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Client Name</span>
                      <p className="text-xs font-bold text-gray-900 mt-0.5">{selected.name || 'Not provided'}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Email Address</span>
                      {selected.email ? (
                        <a 
                          href={`mailto:${selected.email}?subject=Re:%20Custom%20Order%20Quote%20-%20Azim%20Crafts`}
                          className="text-xs font-bold text-[#ae2828] hover:underline mt-0.5 block truncate"
                        >
                          {selected.email}
                        </a>
                      ) : (
                        <p className="text-xs font-medium text-gray-500 mt-0.5">Not provided</p>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Phone / Contact</span>
                      {selected.parsedPhone ? (
                        <a 
                          href={`tel:${selected.parsedPhone}`}
                          className="text-xs font-bold text-neutral-900 hover:text-[#c8924b] mt-0.5 block"
                        >
                          {selected.parsedPhone}
                        </a>
                      ) : (
                        <p className="text-xs font-medium text-gray-500 mt-0.5">Not provided</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Custom Specifications Grid */}
                <div className="border border-neutral-200 rounded-xl p-4 bg-white space-y-3.5 shadow-2xs">
                  <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Ruler size={14} className="text-[#c8924b]" />
                    <span>Custom Specifications &amp; Requirements</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                      <span className="text-[10.5px] font-bold text-neutral-500 block">Requested Dimensions &amp; Sizing</span>
                      <p className="text-xs font-bold text-neutral-900 mt-1 leading-relaxed">
                        {selected.parsedDimensions}
                      </p>
                    </div>

                    <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                      <span className="text-[10.5px] font-bold text-neutral-500 block">Preferred Metal Finish &amp; Tone</span>
                      <p className="text-xs font-bold text-neutral-900 mt-1 leading-relaxed">
                        {selected.parsedFinish}
                      </p>
                    </div>

                    <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                      <span className="text-[10.5px] font-bold text-neutral-500 block">Quantity Needed</span>
                      <p className="text-xs font-bold text-neutral-900 mt-1">
                        {selected.parsedQuantity}
                      </p>
                    </div>

                    <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-100">
                      <span className="text-[10.5px] font-bold text-neutral-500 block">Room / Installation Space</span>
                      <p className="text-xs font-bold text-neutral-900 mt-1">
                        {selected.parsedRoom}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 3. Client Notes & Design Instructions */}
                <div className="border border-neutral-200 rounded-xl p-4 bg-white space-y-2 shadow-2xs">
                  <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={14} className="text-[#c8924b]" />
                    <span>Client Notes &amp; Design Instructions</span>
                  </h3>
                  <div className="p-3.5 bg-neutral-50 rounded-lg border border-neutral-100 text-xs text-neutral-800 leading-relaxed font-mono whitespace-pre-wrap">
                    {selected.parsedNotes}
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-40 text-gray-400 space-y-3">
              <Sparkles size={36} className="text-gray-300" />
              <p className="text-xs font-bold text-gray-600">Select a custom order to view full details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
