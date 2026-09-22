import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Download, ChevronDown, ChevronUp, Search, Calendar, 
  TrendingUp, ShoppingBag, Truck, CheckCircle2, Clock, 
  Filter, ArrowRight, ShieldCheck, DollarSign, CalendarDays, Trash2, RefreshCw, Printer, Package, Eye
, Loader2} from 'lucide-react';
import { getOrders, getCachedOrders, updateOrderStatusInDB, deleteOrderFromDB, clearAllOrdersFromDB } from '../../lib/cloudflareService';
import { AdminShippingSlipModal } from '../components/AdminShippingSlipModal';
import { AdminOrderDetailsModal } from '../components/AdminOrderDetailsModal';

const STATUS_ORDER = ['Unfulfilled', 'Processing', 'Shipped', 'Delivered'];
const STATUS_COLORS = {
  Unfulfilled: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500' },
  Processing: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  Shipped: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  Delivered: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
};

// Generate realistic default sample orders spanning Today, Yesterday, This Month
export const generateDefaultOrders = () => {
  const now = new Date();
  
  const today1 = new Date(now);
  today1.setHours(today1.getHours() - 2);

  const today2 = new Date(now);
  today2.setHours(today2.getHours() - 5);

  const yesterday1 = new Date(now);
  yesterday1.setDate(now.getDate() - 1);
  yesterday1.setHours(14, 30);

  const yesterday2 = new Date(now);
  yesterday2.setDate(now.getDate() - 1);
  yesterday2.setHours(18, 15);

  const threeDaysAgo = new Date(now);
  threeDaysAgo.setDate(now.getDate() - 3);

  const fiveDaysAgo = new Date(now);
  fiveDaysAgo.setDate(now.getDate() - 5);

  const tenDaysAgo = new Date(now);
  tenDaysAgo.setDate(now.getDate() - 10);

  const lastMonth = new Date(now);
  lastMonth.setMonth(now.getMonth() - 1);
  lastMonth.setDate(15);

  return [
    {
      id: 'VTM-10045',
      customer: 'David Harrison',
      customerEmail: 'david.h@gmail.com',
      country: 'United States',
      items: 'Handmade Viking Wooden Round Shield (x1)',
      total: 185.00,
      status: 'Processing',
      payment: 'Paid',
      tracking: '',
      carrier: 'DHL Express',
      createdAt: today1.toISOString(),
      date: today1.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    },
    {
      id: 'VTM-10044',
      customer: 'Sarah Jenkins',
      customerEmail: 's.jenkins@outlook.com',
      country: 'Australia',
      items: 'Thor Mjolnir War Hammer (x1), Compass (x1)',
      total: 260.00,
      status: 'Unfulfilled',
      payment: 'Paid',
      tracking: '',
      carrier: 'FedEx',
      createdAt: today2.toISOString(),
      date: today2.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    },
    {
      id: 'VTM-10043',
      customer: 'James Mitchell',
      customerEmail: 'james.m@yahoo.com',
      country: 'United Kingdom',
      items: 'Vintage Diving Helmet US Navy Mark V (x1)',
      total: 320.00,
      status: 'Processing',
      payment: 'Paid',
      tracking: 'DHL987123456',
      carrier: 'DHL Express',
      createdAt: yesterday1.toISOString(),
      date: yesterday1.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    },
    {
      id: 'VTM-10042',
      customer: 'Elena Rostova',
      customerEmail: 'elena.rostova@gmail.com',
      country: 'Germany',
      items: 'Handmade Embossed Leather Journal (x2)',
      total: 148.00,
      status: 'Shipped',
      payment: 'Paid',
      tracking: 'FDX445566778',
      carrier: 'FedEx',
      createdAt: yesterday2.toISOString(),
      date: yesterday2.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    },
    {
      id: 'VTM-10041',
      customer: 'Liam Nguyen',
      customerEmail: 'liam.ng@hotmail.com',
      country: 'Canada',
      items: 'Full Knight Armour Set with Gauntlets (x1)',
      total: 490.00,
      status: 'Shipped',
      payment: 'Paid',
      tracking: 'UPS889900112',
      carrier: 'UPS',
      createdAt: threeDaysAgo.toISOString(),
      date: threeDaysAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    },
    {
      id: 'VTM-10040',
      customer: 'Aria Patel',
      customerEmail: 'aria.patel@craftlore.in',
      country: 'India',
      items: 'Solid Brass Nautical Sextant in Hardwood Box (x1)',
      total: 165.00,
      status: 'Delivered',
      payment: 'Paid',
      tracking: 'DHL556677889',
      carrier: 'DHL Express',
      createdAt: fiveDaysAgo.toISOString(),
      date: fiveDaysAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    },
    {
      id: 'VTM-10039',
      customer: 'Marcus Williams',
      customerEmail: 'marcus.w@gmail.com',
      country: 'Australia',
      items: 'Medieval Knight Crusader Helmet (x1), Round Shield (x1)',
      total: 345.00,
      status: 'Delivered',
      payment: 'Paid',
      tracking: 'DHL112233445',
      carrier: 'DHL Express',
      createdAt: tenDaysAgo.toISOString(),
      date: tenDaysAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    },
    {
      id: 'VTM-10038',
      customer: 'Jean-Luc Dubois',
      customerEmail: 'jldubois@paris.fr',
      country: 'France',
      items: 'Antique Brass Sundial Compass with Leather Case (x1)',
      total: 95.00,
      status: 'Delivered',
      payment: 'Paid',
      tracking: 'FDX998877665',
      carrier: 'FedEx',
      createdAt: lastMonth.toISOString(),
      date: lastMonth.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
  ];
};

function StatusModal({ order, onSave, onClose }) {
  const [status, setStatus] = useState(order.status);
  const [tracking, setTracking] = useState(order.tracking || '');
  const [carrier, setCarrier] = useState(order.carrier || 'DHL Express');
  const inputCls = 'w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-[#c8924b] focus:border-transparent outline-none transition-all bg-white';
  const labelCls = 'block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-menu">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-200 animate-fade-in">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-neutral-50/90">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Update Order Fulfillment</h3>
            <p className="text-xs text-gray-500 font-mono">Order ID: {order.id}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-200 text-gray-500 transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className={labelCls}>Order Status *</label>
            <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Shipping Carrier</label>
            <select className={inputCls} value={carrier} onChange={(e) => setCarrier(e.target.value)}>
              <option value="DHL Express">DHL Express</option>
              <option value="FedEx">FedEx International</option>
              <option value="UPS">UPS Worldwide</option>
              <option value="Australia Post">Australia Post</option>
              <option value="India Post EMS">India Post EMS</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Tracking Number</label>
            <input 
              className={inputCls} 
              value={tracking} 
              onChange={(e) => setTracking(e.target.value)} 
              placeholder="e.g. DHL1234567890" 
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
            <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer">
              Cancel
            </button>
            <button
              onClick={() => onSave({ ...order, status, tracking, carrier })}
              className="px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all hover:opacity-95 cursor-pointer"
              style={{ background: 'linear-gradient(135deg, #c8924b, #e8b06a)', color: '#0f1117' }}
            >
              Save &amp; Update Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminOrders() {
  const [orders, setOrders] = useState(() => getCachedOrders() || []);
  const [loading, setLoading] = useState(() => getCachedOrders() === null);
  const [dateFilter, setDateFilter] = useState('all'); // 'all' | 'today' | 'yesterday' | 'this_month' | 'custom'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'Unfulfilled' | 'Processing' | 'Shipped' | 'Delivered'
  const [search, setSearch] = useState('');
  
  // Custom Date Range states (YYYY-MM-DD)
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const [expanded, setExpanded] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [printModal, setPrintModal] = useState(null);
  const [viewOrderModal, setViewOrderModal] = useState(null);

  const DUMMY_IDS = ['VTM-10045','VTM-10044','VTM-10043','VTM-10042','VTM-10041','VTM-10040','VTM-10039','VTM-10038','VTM-10037','VTM-10036','VTM-10035'];

  const loadData = async (silent = false) => {
    if (!silent && !getCachedOrders()) setLoading(true);
    try {
      const remote = await getOrders();
      if (Array.isArray(remote)) {
        const realOnly = remote.filter(o => !DUMMY_IDS.includes(o.id));
        setOrders(realOnly);
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn('Failed to load orders from DB:', e);
    }

    setOrders([]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('vw_orders_updated', () => loadData(true));
    const interval = setInterval(() => {
      loadData(true);
    }, 3000);
    return () => {
      window.removeEventListener('vw_orders_updated', () => loadData(true));
      clearInterval(interval);
    };
  }, []);

  const handleSave = async (updated) => {
    const newOrders = orders.map((o) => (o.id === updated.id ? updated : o));
    setOrders(newOrders);
    setEditModal(null);
    await updateOrderStatusInDB(updated.id, updated.status, updated.tracking, updated.carrier);
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`Are you sure you want to delete order ${orderId}?`)) return;
    const newOrders = orders.filter((o) => o.id !== orderId);
    setOrders(newOrders);
    await deleteOrderFromDB(orderId);
  };

  const handleClearAllOrders = async () => {
    if (!window.confirm('⚠️ Are you sure you want to WIPE ALL ORDERS? This will clear all test orders for a fresh start.')) return;
    setOrders([]);
    await clearAllOrdersFromDB();
  };

  // Helper to parse order date safely
  const getOrderDate = (order) => {
    if (order.createdAt) {
      const d = new Date(order.createdAt);
      if (!isNaN(d.getTime())) return d;
    }
    if (order.date) {
      const d = new Date(order.date);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  };

  // Date Comparisons
  const isSameDay = (d1, d2) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isSameMonth = (d1, d2) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth()
    );
  };

  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  // Calculate live counts for each filter tab
  const todayCount = useMemo(() => {
    return orders.filter(o => isSameDay(getOrderDate(o), now)).length;
  }, [orders]);

  const yesterdayCount = useMemo(() => {
    return orders.filter(o => isSameDay(getOrderDate(o), yesterday)).length;
  }, [orders]);

  const thisMonthCount = useMemo(() => {
    return orders.filter(o => isSameMonth(getOrderDate(o), now)).length;
  }, [orders]);

  // Main Filter Logic
  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const orderDate = getOrderDate(o);

      // 1. Date Filter
      let matchDate = true;
      if (dateFilter === 'today') {
        matchDate = isSameDay(orderDate, now);
      } else if (dateFilter === 'yesterday') {
        matchDate = isSameDay(orderDate, yesterday);
      } else if (dateFilter === 'this_month') {
        matchDate = isSameMonth(orderDate, now);
      } else if (dateFilter === 'custom') {
        if (customStartDate) {
          const start = new Date(customStartDate);
          start.setHours(0, 0, 0, 0);
          if (orderDate < start) matchDate = false;
        }
        if (customEndDate) {
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          if (orderDate > end) matchDate = false;
        }
      }

      // 2. Status Filter
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;

      // 3. Search Filter
      const q = search.toLowerCase().trim();
      const matchSearch = !q || (
        (o.id && o.id.toLowerCase().includes(q)) ||
        (o.customer && o.customer.toLowerCase().includes(q)) ||
        (o.customerEmail && o.customerEmail.toLowerCase().includes(q)) ||
        (o.country && o.country.toLowerCase().includes(q)) ||
        (o.items && o.items.toLowerCase().includes(q)) ||
        (o.tracking && o.tracking.toLowerCase().includes(q))
      );

      return matchDate && matchStatus && matchSearch;
    });
  }, [orders, dateFilter, statusFilter, search, customStartDate, customEndDate]);

  // Totals for filtered orders
  const filteredRevenue = useMemo(() => {
    return filtered.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  }, [filtered]);

  const filteredPending = useMemo(() => {
    return filtered.filter(o => o.status === 'Unfulfilled' || o.status === 'Processing').length;
  }, [filtered]);

  const filteredDelivered = useMemo(() => {
    return filtered.filter(o => o.status === 'Delivered').length;
  }, [filtered]);

  // Export Filtered Orders to CSV
  const exportCSV = () => {
    const headers = ['Order ID', 'Customer Name', 'Email', 'Country', 'Items', 'Total (USD)', 'Payment', 'Status', 'Date', 'Tracking', 'Carrier'];
    const rows = filtered.map((o) => [
      o.id,
      `"${o.customer}"`,
      `"${o.customerEmail || ''}"`,
      `"${o.country}"`,
      `"${o.items}"`,
      `$${Number(o.total).toFixed(2)}`,
      o.payment,
      o.status,
      `"${o.date || ''}"`,
      `"${o.tracking || ''}"`,
      `"${o.carrier || ''}"`
    ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vtm-orders-${dateFilter}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectCls = 'border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-semibold focus:ring-2 focus:ring-[#c8924b] focus:border-transparent outline-none bg-white';

  return (
    <div className="p-6 max-w-7xl space-y-6 font-menu">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders & Fulfillment</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Track, filter by date, update fulfillment status, and add DHL/FedEx tracking codes.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {orders.length > 0 && (
            <button
              onClick={handleClearAllOrders}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 transition-all cursor-pointer shadow-2xs"
            >
              <Trash2 size={14} />
              <span>Wipe All Orders</span>
            </button>
          )}
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-gray-300 bg-white hover:bg-neutral-50 text-gray-700 shadow-2xs transition-all cursor-pointer"
          >
            <Download size={15} className="text-[#c8924b]" />
            <span>Export Filtered CSV ({filtered.length})</span>
          </button>
        </div>
      </div>

      {/* ================= DATE FILTER TABS BAR ================= */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[#c8924b]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Filter by Order Timeline
            </h3>
          </div>
          {dateFilter !== 'all' && (
            <button
              onClick={() => {
                setDateFilter('all');
                setCustomStartDate('');
                setCustomEndDate('');
              }}
              className="text-xs font-bold text-[#c8924b] hover:underline cursor-pointer"
            >
              Reset to All Time
            </button>
          )}
        </div>

        {/* Date Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            { key: 'all', label: 'All Time', count: orders.length },
            { key: 'today', label: 'Today', count: todayCount },
            { key: 'yesterday', label: 'Yesterday', count: yesterdayCount },
            { key: 'this_month', label: 'This Month', count: thisMonthCount },
            { key: 'custom', label: 'Custom Range', count: null },
          ].map((tab) => {
            const isSelected = dateFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setDateFilter(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs ring-2 ring-neutral-900/10'
                    : 'bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border-neutral-200'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isSelected ? 'bg-[#c8924b] text-neutral-900' : 'bg-neutral-200 text-neutral-800'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Custom Date Range Picker inputs when 'custom' is active */}
        {dateFilter === 'custom' && (
          <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center gap-3 animate-fade-in bg-amber-50/40 p-3 rounded-xl border border-amber-200/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-700">From Date:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs bg-white focus:ring-2 focus:ring-[#c8924b] outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-700">To Date:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs bg-white focus:ring-2 focus:ring-[#c8924b] outline-none"
              />
            </div>

            {(customStartDate || customEndDate) && (
              <button
                onClick={() => {
                  setCustomStartDate('');
                  setCustomEndDate('');
                }}
                className="text-xs font-bold text-red-600 hover:underline cursor-pointer ml-auto"
              >
                Clear Dates
              </button>
            )}
          </div>
        )}
      </div>

      {/* ================= DYNAMIC KPI SUMMARY BANNER ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-3">
          <div className="p-3 bg-neutral-100 text-neutral-800 rounded-xl">
            <ShoppingBag size={20} />
          </div>
          <div>
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Filtered Orders</span>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{filtered.length} Orders</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <DollarSign size={20} />
          </div>
          <div>
            <span className="text-xs text-emerald-700 font-bold uppercase tracking-wider">Filtered Revenue</span>
            <p className="text-2xl font-bold text-emerald-600 mt-0.5">${filteredRevenue.toFixed(2)} USD</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
            <Clock size={20} />
          </div>
          <div>
            <span className="text-xs text-amber-700 font-bold uppercase tracking-wider">Pending / Processing</span>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{filteredPending} Orders</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <Truck size={20} />
          </div>
          <div>
            <span className="text-xs text-blue-700 font-bold uppercase tracking-wider">Delivered</span>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{filteredDelivered} Orders</p>
          </div>
        </div>

      </div>

      {/* ================= SECONDARY FILTERS & SEARCH ================= */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-4 flex flex-wrap gap-3 items-center justify-between">
        
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {['all', 'Unfulfilled', 'Processing', 'Shipped', 'Delivered'].map((st) => {
            const isSelected = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#c8924b] text-white shadow-2xs'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700'
                }`}
              >
                {st === 'all' ? 'All Status' : st}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[240px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full border border-gray-300 rounded-xl pl-9 pr-3.5 py-2 text-xs outline-none focus:ring-2 focus:ring-[#c8924b] focus:border-transparent"
            placeholder="Search Order ID, Customer, Country, Item..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

      </div>

      {/* ================= ORDERS TABLE ================= */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/90 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-200">
                <th className="px-5 py-4 text-left font-bold min-w-[140px] whitespace-nowrap">Order ID</th>
                <th className="px-5 py-4 text-left font-bold min-w-[200px]">Customer &amp; Destination</th>
                <th className="px-5 py-4 text-left font-bold min-w-[220px]">Items Ordered</th>
                <th className="px-5 py-4 text-left font-bold min-w-[130px] whitespace-nowrap">Total Amount</th>
                <th className="px-5 py-4 text-left font-bold min-w-[130px] whitespace-nowrap">Fulfillment Status</th>
                <th className="px-5 py-4 text-left font-bold min-w-[110px] whitespace-nowrap">Order Date</th>
                <th className="px-5 py-4 text-right font-bold min-w-[280px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-24 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-8 h-8 border-3 border-[#c8924b] border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs font-bold text-gray-700">Loading orders from database...</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <>
                  {filtered.map((o) => {
                const sc = STATUS_COLORS[o.status] || STATUS_COLORS.Processing;
                const isExpanded = expanded === o.id;

                // Parse items count
                const itemCount = Array.isArray(o.itemsList) ? o.itemsList.length : (o.items || '').split(',').length;

                if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
        <span className="ml-3 text-gray-500">Loading...</span>
      </div>
    );
  }

  return (
                  <React.Fragment key={o.id}>
                    <tr className="hover:bg-amber-50/30 transition-colors group">
                      
                      {/* Order ID */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setViewOrderModal(o)}
                          className="flex items-center gap-1.5 font-mono font-bold text-gray-900 group-hover:text-[#c8924b] transition-colors cursor-pointer text-xs"
                          title="Click to view full order details"
                        >
                          <span className="bg-neutral-100 hover:bg-amber-100 px-2.5 py-1 rounded-md border border-neutral-200 font-mono font-bold tracking-tight">
                            {o.id}
                          </span>
                        </button>
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-4">
                        <div className="font-bold text-gray-900 text-xs">{o.customer || 'Valued Customer'}</div>
                        <div className="text-[11px] text-gray-400 font-medium truncate max-w-[180px]">
                          {o.customerEmail || o.country || 'Australia'}
                        </div>
                      </td>

                      {/* Items */}
                      <td className="px-5 py-4">
                        <div className="space-y-1 max-w-[240px]">
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200/70 text-[10.5px] font-bold px-2 py-0.5 rounded-full">
                            📦 {itemCount} {itemCount === 1 ? 'Item' : 'Items'}
                          </span>
                          <p className="text-xs text-gray-700 font-medium truncate">
                            {o.items}
                          </p>
                        </div>
                      </td>

                      {/* Total */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="font-bold text-gray-900 text-xs">
                          ${Number(o.total || 0).toFixed(2)} USD
                        </div>
                        <div className="text-[10px] font-semibold text-emerald-700">
                          {o.payment || 'Paid (Verified)'}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${sc.bg} ${sc.text} ${sc.border}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          <span>{o.status}</span>
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap font-medium">
                        {o.date || 'Today'}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewOrderModal(o)}
                            title="View Full Order Details & Items"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-[#c8924b] text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
                          >
                            <Eye size={13} />
                            <span>View Details</span>
                          </button>
                          <button
                            onClick={() => setPrintModal(o)}
                            title="Print Parcel Shipping Slip"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-300 bg-white hover:bg-neutral-50 text-gray-800 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                          >
                            <Printer size={13} className="text-[#c8924b]" />
                            <span>Print Slip</span>
                          </button>
                          <button
                            onClick={() => setEditModal(o)}
                            title="Update Tracking Code & Status"
                            className="px-2.5 py-1.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-amber-50 hover:text-[#c8924b] hover:border-[#c8924b] transition-all cursor-pointer"
                          >
                            Status
                          </button>
                          <button
                            onClick={() => handleDeleteOrder(o.id)}
                            title="Delete Order"
                            className="p-1.5 rounded-xl border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  </React.Fragment>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-gray-400 space-y-2">
                    <Calendar size={28} className="mx-auto text-gray-300" />
                    <p className="font-semibold text-gray-700 text-sm">No orders found for this filter selection.</p>
                    <p className="text-xs text-gray-400">Try changing the date timeline or search criteria.</p>
                  </td>
                </tr>
              )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Full Order Details Modal */}
      {viewOrderModal && (
        <AdminOrderDetailsModal
          order={viewOrderModal}
          onClose={() => setViewOrderModal(null)}
          onOpenPrint={(o) => setPrintModal(o)}
          onOpenEditStatus={(o) => setEditModal(o)}
        />
      )}

      {/* Edit Status Modal */}
      {editModal && (
        <StatusModal
          order={editModal}
          onSave={handleSave}
          onClose={() => setEditModal(null)}
        />
      )}

      {/* Print Shipping Slip Modal */}
      {printModal && (
        <AdminShippingSlipModal
          order={printModal}
          onClose={() => setPrintModal(null)}
        />
      )}

    </div>
  );
}
