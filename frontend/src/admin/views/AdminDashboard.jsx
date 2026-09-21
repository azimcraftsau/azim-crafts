import React, { useState, useEffect, useMemo } from 'react';
import { TrendingUp, ShoppingBag, Package, Clock, ArrowRight, Plus, Tag, Eye } from 'lucide-react';
import { allProducts } from '../../data/products';
import { getOrders, getProducts } from '../../lib/cloudflareService';
import { getMergedCategories, DEFAULT_CATEGORIES } from './AdminProducts';

const CATEGORY_COLORS = {
  'vintage-armour': '#c8924b',
  'wooden-shields': '#3b82f6',
  'vintage-wall-lights': '#eab308',
  'vintage-chandeliers': '#8b5cf6',
  'cinematic-antiques': '#ef4444',
  'fantasy-gothic-armour': '#6366f1',
  'medieval-helmets': '#14b8a6',
  'diving-helmets': '#06b6d4',
  'vintage-gauntlets': '#f97316',
  'vintage-compasses': '#10b981',
  'table-clocks': '#d97706',
  'leather-journals': '#84cc16',
  'walking-sticks': '#a855f7'
};

const PALETTE = ['#c8924b', '#3b82f6', '#8b5cf6', '#10b981', '#f43f5e', '#eab308', '#06b6d4', '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#84cc16', '#a855f7'];

const STATUS_COLORS = {
  Unfulfilled: { bg: 'bg-red-100', text: 'text-red-700' },
  Processing: { bg: 'bg-amber-100', text: 'text-amber-700' },
  Shipped: { bg: 'bg-blue-100', text: 'text-blue-700' },
  Delivered: { bg: 'bg-green-100', text: 'text-green-700' },
};

function KpiCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-start gap-4">
      <div className="rounded-xl p-3 flex-shrink-0" style={{ background: color + '18' }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export function AdminDashboard({ onNavigate }) {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  const refreshData = () => {
    getOrders().then(data => setOrders(Array.isArray(data) ? data : []));
    getProducts().then(data => setProducts(Array.isArray(data) ? data : []));
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('vw_orders_updated', refreshData);
    const interval = setInterval(refreshData, 3000);
    return () => {
      window.removeEventListener('vw_orders_updated', refreshData);
      clearInterval(interval);
    };
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + (Number(o.total) || 0), 0);
  const pendingCount = orders.filter((o) => o.status === 'Unfulfilled' || o.status === 'Processing').length;
  const activeProducts = products.filter((p) => !p.isSoldOut).length;

  const categoryStats = useMemo(() => {
    // 1. Get real store categories (including any created in admin)
    const categoriesList = typeof getMergedCategories === 'function' ? getMergedCategories() : DEFAULT_CATEGORIES;
    const allKnownProducts = (products && products.length > 0) ? products : allProducts;

    // 2. Initialize revenue accumulator
    const revenueMap = {};
    const orderCountMap = {};
    categoriesList.forEach(c => {
      revenueMap[c.key] = 0;
      orderCountMap[c.key] = 0;
    });

    // Helper: find category key for an item title or id
    const findCategoryForItem = (itemTitle, itemId) => {
      if (!itemTitle && !itemId) return null;
      if (itemId) {
        const p = allKnownProducts.find(prod => prod.id === itemId);
        if (p && p.category) return p.category;
      }
      const cleanTitle = (itemTitle || '').toLowerCase().trim();
      const pByTitle = allKnownProducts.find(prod => {
        const pt = (prod.title || '').toLowerCase().trim();
        return pt === cleanTitle || cleanTitle.includes(pt) || (pt.length > 10 && cleanTitle.includes(pt.substring(0, 15)));
      });
      if (pByTitle && pByTitle.category) return pByTitle.category;

      // Keyword fallback against real category definitions
      for (const cat of categoriesList) {
        const catNameLower = cat.name.toLowerCase();
        const catKeyLower = cat.key.toLowerCase().replace(/-/g, ' ');
        if (
          cleanTitle.includes(catNameLower) || 
          cleanTitle.includes(catKeyLower) ||
          (cat.key === 'wooden-shields' && (cleanTitle.includes('shield') || cleanTitle.includes('viking'))) ||
          (cat.key === 'vintage-chandeliers' && cleanTitle.includes('chandelier')) ||
          (cat.key === 'vintage-wall-lights' && (cleanTitle.includes('wall light') || cleanTitle.includes('sconce'))) ||
          (cat.key === 'vintage-armour' && (cleanTitle.includes('broadsword') || cleanTitle.includes('armour') || cleanTitle.includes('greaves') || cleanTitle.includes('suit'))) ||
          (cat.key === 'cinematic-antiques' && (cleanTitle.includes('captain america') || cleanTitle.includes('mjolnir') || cleanTitle.includes('hammer'))) ||
          (cat.key === 'medieval-helmets' && (cleanTitle.includes('medieval') && cleanTitle.includes('helmet'))) ||
          (cat.key === 'diving-helmets' && cleanTitle.includes('diving')) ||
          (cat.key === 'vintage-gauntlets' && cleanTitle.includes('gauntlet')) ||
          (cat.key === 'vintage-compasses' && cleanTitle.includes('compass')) ||
          (cat.key === 'table-clocks' && (cleanTitle.includes('clock') || cleanTitle.includes('watch'))) ||
          (cat.key === 'leather-journals' && (cleanTitle.includes('journal') || cleanTitle.includes('leather'))) ||
          (cat.key === 'walking-sticks' && (cleanTitle.includes('stick') || cleanTitle.includes('cane')))
        ) {
          return cat.key;
        }
      }
      return null;
    };

    // 3. Process each real order
    orders.forEach(order => {
      const orderTotal = Number(order.total) || 0;
      if (orderTotal <= 0) return;

      if (Array.isArray(order.itemsList) && order.itemsList.length > 0) {
        const orderSubtotal = order.itemsList.reduce((s, it) => s + ((Number(it.price) || 0) * (Number(it.quantity) || 1)), 0) || orderTotal;
        order.itemsList.forEach(it => {
          const catKey = it.category || findCategoryForItem(it.title, it.id);
          const itemVal = ((Number(it.price) || 0) * (Number(it.quantity) || 1));
          const share = (itemVal / orderSubtotal) * orderTotal;
          if (catKey && revenueMap[catKey] !== undefined) {
            revenueMap[catKey] += share;
            orderCountMap[catKey] += 1;
          } else if (categoriesList[0]) {
            revenueMap[categoriesList[0].key] += share;
          }
        });
        return;
      }

      const itemsStr = order.items || '';
      const rawParts = itemsStr.split(/,(?![^\(]*\))/).map(s => s.trim()).filter(Boolean);
      const matchedCats = [];

      rawParts.forEach(part => {
        const cleanName = part.replace(/\s*\([xX]?\d+\)/g, '').trim();
        const catKey = findCategoryForItem(cleanName);
        if (catKey) matchedCats.push(catKey);
      });

      if (matchedCats.length > 0) {
        const share = orderTotal / matchedCats.length;
        matchedCats.forEach(ck => {
          if (revenueMap[ck] !== undefined) {
            revenueMap[ck] += share;
            orderCountMap[ck] += 1;
          } else if (categoriesList[0]) {
            revenueMap[categoriesList[0].key] += share;
          }
        });
      } else {
        const fallbackKey = findCategoryForItem(itemsStr);
        if (fallbackKey && revenueMap[fallbackKey] !== undefined) {
          revenueMap[fallbackKey] += orderTotal;
          orderCountMap[fallbackKey] += 1;
        } else if (categoriesList[0]) {
          revenueMap[categoriesList[0].key] += orderTotal;
        }
      }
    });

    const maxRev = totalRevenue || 1;

    // 4. Map into categoryStats objects with percentage and color
    const stats = categoriesList.map((c, idx) => {
      const rev = revenueMap[c.key] || 0;
      const count = orderCountMap[c.key] || 0;
      const pct = totalRevenue > 0 ? Math.min(100, Math.round((rev / maxRev) * 100)) : 0;
      const color = CATEGORY_COLORS[c.key] || PALETTE[idx % PALETTE.length];
      return {
        key: c.key,
        name: c.name,
        revenue: rev,
        ordersCount: count,
        pct,
        color
      };
    });

    // 5. Sort categories: categories with revenue first (descending), then alphabetically
    return stats.sort((a, b) => {
      if (b.revenue !== a.revenue) return b.revenue - a.revenue;
      return a.name.localeCompare(b.name);
    });
  }, [orders, totalRevenue, products]);

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard icon={TrendingUp} label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} sub="All time" color="#c8924b" />
        <KpiCard icon={ShoppingBag} label="Total Orders" value={orders.length} sub="All time" color="#3b82f6" />
        <KpiCard icon={Package} label="Active Products" value={activeProducts} sub={`of ${products.length} total`} color="#10b981" />
        <KpiCard icon={Clock} label="Pending Orders" value={pendingCount} sub="Needs attention" color="#f43f5e" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Orders table */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <button
              onClick={() => onNavigate('orders')}
              className="flex items-center gap-1 text-xs text-[#c8924b] hover:text-[#b57f38] font-semibold transition-colors"
            >
              View All <ArrowRight size={13} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-4 py-3 text-left font-semibold">Order</th>
                  <th className="px-4 py-3 text-left font-semibold">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold">Total</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-xs">
                      No orders yet. Complete a test checkout to see live revenue &amp; analytics!
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const sc = STATUS_COLORS[order.status] || { bg: 'bg-gray-100', text: 'text-gray-600' };
                    return (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-[#c8924b] font-semibold">{order.id}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-800">{order.customer}</div>
                          <div className="text-xs text-gray-400">{order.country}</div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-900">${order.total}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${sc.bg} ${sc.text}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{order.date}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Category revenue */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3.5">
              <div>
                <h2 className="font-semibold text-gray-900 text-sm">Revenue by Category</h2>
                <p className="text-[11px] text-gray-400">All original store departments</p>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-[#c8924b] border border-amber-200/70">
                {categoryStats.filter(c => c.revenue > 0).length} Active
              </span>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {categoryStats.map((cat) => (
                <div 
                  key={cat.key} 
                  className="group cursor-pointer hover:bg-gray-50/80 p-1.5 rounded-lg transition-colors"
                  onClick={() => onNavigate && onNavigate('products')}
                  title={`Click to view ${cat.name} in Products`}
                >
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-700 font-medium group-hover:text-black transition-colors flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }} />
                      <span className="truncate max-w-[155px] sm:max-w-[175px]">{cat.name}</span>
                    </span>
                    <span className="text-gray-900 font-semibold font-mono">
                      ${Number(cat.revenue).toFixed(2)} USD
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${cat.pct}%`, 
                        background: cat.color,
                        minWidth: cat.revenue > 0 ? '6px' : '0px'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('products')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #c8924b, #e8b06a)', color: '#0f1117' }}
              >
                <Plus size={16} />
                Add New Product
              </button>
              <button
                onClick={() => onNavigate('orders')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
              >
                <Eye size={16} />
                View All Orders
              </button>
              <button
                onClick={() => onNavigate('coupons')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all"
              >
                <Tag size={16} />
                Create Coupon
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
