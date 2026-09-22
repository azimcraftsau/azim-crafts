import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, ShoppingCart, DollarSign, Search, 
  Mail, Phone, MapPin, Calendar, ArrowRight, X, ExternalLink, ShieldCheck, Clock, Loader2
} from 'lucide-react';
import { getOrders, getUsersList, getCachedOrders, getCachedUsers } from '../../lib/cloudflareService';

export function AdminUsers() {
  const [users, setUsers] = useState(() => getCachedUsers() || []);
  const [orders, setOrders] = useState(() => getCachedOrders() || []);
  const [loading, setLoading] = useState(() => !getCachedUsers());
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  const loadData = async (silent = false) => {
    if (!silent && !getCachedUsers()) setLoading(true);
    let allOrders = [];
    try {
      allOrders = await getOrders();
    } catch (e) {}

    let registeredUsers = [];
    try {
      registeredUsers = await getUsersList();
    } catch (e) {
      console.warn('Failed to load users from DB:', e);
    }

    // Filter out Admins and Staff from Customers view (Admins belong in "Admins & Staff" menu)
    const isStaffOrAdmin = (u) => {
      const role = (u?.role || '').toLowerCase();
      const email = (u?.email || '').toLowerCase();
      const id = (u?.id || '').toLowerCase();
      return role === 'admin' || role === 'superadmin' || role === 'staff' || email === 'admin@azimcrafts.com' || id.includes('admin');
    };

    // Extract distinct customers from registered users (excluding admin/staff)
    const usersMap = new Map();

    registeredUsers.forEach(u => {
      if (u.email && !isStaffOrAdmin(u)) {
        usersMap.set(u.email.toLowerCase(), {
          id: u.id || `usr_${u.email}`,
          name: u.name || 'Valued Customer',
          email: u.email,
          phone: u.phone || '+61 400 000 000',
          country: u.country || 'Australia',
          createdAt: u.createdAt || 'Aug 2026',
          orders: []
        });
      }
    });

    if (Array.isArray(allOrders)) {
      allOrders.forEach(o => {
        const emailKey = (o.customerEmail || o.customer_email || '').toLowerCase();
        if (emailKey && emailKey !== 'admin@azimcrafts.com') {
          if (!usersMap.has(emailKey)) {
            usersMap.set(emailKey, {
              id: `usr_${emailKey}`,
              name: o.customer || o.customer_name || 'Valued Customer',
              email: o.customerEmail || o.customer_email,
              phone: o.phone || o.customer_phone || '+61 400 000 000',
              country: o.country || (o.shippingAddress && o.shippingAddress.country) || 'Australia',
              createdAt: o.date || o.created_at || 'Recent',
              orders: []
            });
          }
          usersMap.get(emailKey).orders.push(o);
        }
      });
    }

    // Convert map to array with calculated stats
    const combined = Array.from(usersMap.values()).map(u => {
      const totalSpent = u.orders.reduce((sum, ord) => sum + (Number(ord.total) || 0), 0);
      return {
        ...u,
        orderCount: u.orders.length,
        totalSpent
      };
    });

    setOrders(Array.isArray(allOrders) ? allOrders : []);
    setUsers(combined);
    setLoading(false);
  };

  useEffect(() => {
    loadData(false);
    const onUpdate = () => loadData(true);
    window.addEventListener('vw_users_updated', onUpdate);
    window.addEventListener('vw_orders_updated', onUpdate);
    const interval = setInterval(() => loadData(true), 15000);
    return () => {
      window.removeEventListener('vw_users_updated', onUpdate);
      window.removeEventListener('vw_orders_updated', onUpdate);
      clearInterval(interval);
    };
  }, []);

  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q))
    );
  });

  const totalCustomers = users.length;
  const activeBuyers = users.filter(u => u.orderCount > 0).length;
  const totalCustomerRevenue = users.reduce((sum, u) => sum + u.totalSpent, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl font-menu">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-[#c8924b]" />
            <span>Customers &amp; Registered Users</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time customer database, order histories, contact details &amp; lifetime value (LTV).
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#c8924b] flex items-center justify-center">
            <Users size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Registered</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{totalCustomers}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <UserCheck size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Active Buyers</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{activeBuyers}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign size={22} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Customer Revenue</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">${totalCustomerRevenue.toFixed(2)} USD</p>
          </div>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs">
        <div className="relative">
          <input
            type="text"
            placeholder="Search customers by name, email or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c8924b] outline-none"
          />
          <Search size={16} className="text-gray-400 absolute left-3.5 top-3" />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Contact Details</th>
                <th className="px-5 py-3.5">Country</th>
                <th className="px-5 py-3.5">Orders Placed</th>
                <th className="px-5 py-3.5">Total Spent</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-8 h-8 border-3 border-[#c8924b] border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-xs font-bold text-gray-500">Loading customers from database...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    <p className="font-semibold text-gray-700">No customers found</p>
                    <p className="text-xs text-gray-400 mt-1">When users sign up or place orders, they will appear here live.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const initials = u.name ? u.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

                  return (
                    <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-amber-100 text-[#c8924b] font-bold text-xs flex items-center justify-center shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{u.name}</p>
                            <span className="text-[11px] text-gray-400">ID: {u.id.substring(0, 12)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-xs text-gray-800 font-medium">{u.email}</p>
                        {u.phone && <p className="text-[11px] text-gray-400 mt-0.5">{u.phone}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-gray-700 font-medium">{u.country || 'Australia'}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          u.orderCount > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <ShoppingCart size={11} />
                          <span>{u.orderCount} {u.orderCount === 1 ? 'order' : 'orders'}</span>
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-gray-900">
                          ${u.totalSpent.toFixed(2)} USD
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedUser(u)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-[#c8924b] text-white text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                        >
                          <span>View Profile &amp; Orders</span>
                          <ArrowRight size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Modal / Drawer */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-menu">
          <div className="fixed inset-0" onClick={() => setSelectedUser(null)} />
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden z-10 border border-gray-200 animate-fade-in max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="bg-[#1b1a1a] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-amber-400/20 text-[#f7eddb] font-bold text-sm flex items-center justify-center border border-amber-300/30">
                  {selectedUser.name ? selectedUser.name.substring(0, 2).toUpperCase() : 'CU'}
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold">{selectedUser.name}</h3>
                  <p className="text-xs text-neutral-400">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-full hover:bg-neutral-800 text-neutral-300 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              
              {/* Contact Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-xs">
                <div>
                  <span className="text-gray-400 block uppercase tracking-wider text-[10px]">Email</span>
                  <span className="font-semibold text-gray-900 break-all">{selectedUser.email}</span>
                </div>
                <div>
                  <span className="text-gray-400 block uppercase tracking-wider text-[10px]">Mobile</span>
                  <span className="font-semibold text-gray-900">{selectedUser.phone || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block uppercase tracking-wider text-[10px]">Country</span>
                  <span className="font-semibold text-gray-900">{selectedUser.country || 'Australia'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block uppercase tracking-wider text-[10px]">Total LTV</span>
                  <span className="font-bold text-emerald-700 text-sm">${selectedUser.totalSpent.toFixed(2)} USD</span>
                </div>
              </div>

              {/* Order History for this Customer */}
              <div>
                <h4 className="font-heading text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <ShoppingCart size={15} className="text-[#c8924b]" />
                  <span>Orders Placed ({selectedUser.orders.length})</span>
                </h4>

                {selectedUser.orders.length === 0 ? (
                  <div className="p-6 bg-gray-50 rounded-xl text-center text-xs text-gray-500 border border-gray-100">
                    No orders placed yet by this user.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedUser.orders.map((ord) => (
                      <div key={ord.id} className="p-4 rounded-xl border border-gray-200 bg-white shadow-2xs space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <strong className="text-gray-900 font-mono">{ord.id}</strong>
                            <span className="bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded text-[10px]">
                              {ord.status || 'Processing'}
                            </span>
                          </div>
                          <span className="font-bold text-gray-900">${Number(ord.total).toFixed(2)} USD</span>
                        </div>
                        <p className="text-xs text-gray-600">{ord.items}</p>
                        <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1 border-t border-gray-100">
                          <span>Date: {ord.date}</span>
                          <span>Payment: {ord.payment}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
