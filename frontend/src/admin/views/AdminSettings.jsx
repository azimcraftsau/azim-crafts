import React, { useState, useEffect } from 'react';
import { Save, Download, CheckCircle } from 'lucide-react';
import { allProducts } from '../../data/products';

function Toast({ msg, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 bg-gray-900 text-white px-5 py-3.5 rounded-xl shadow-2xl text-sm font-medium">
      <CheckCircle size={16} className="text-green-400" />
      {msg}
    </div>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-900">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#c8924b] focus:border-transparent outline-none transition-all';

import { getStoreSettings, saveStoreSettingsToDB, getProducts, getOrders } from '../../lib/cloudflareService';

export function AdminSettings() {
  const [toast, setToast] = useState('');
  const [session] = useState(() => {
    try { return JSON.parse(localStorage.getItem('vw_admin_session') || '{}'); } catch { return {}; }
  });

  const [storeInfo, setStoreInfo] = useState({
    name: 'Azim Crafts',
    email: 'contact@azimcrafts.com',
    whatsapp: '0426285439 (+61 426 285 439)',
    address: 'Store 1: Shrin Malik, 42a chestnut road, Auburn 2144, NSW, Australia | Store 2: 01 Oswald Street, Bolton BL3 4BA, UK',
  });

  const [announcement, setAnnouncement] = useState('Free Worldwide Express Shipping Over $200 USD');
  const [freeShipping, setFreeShipping] = useState(200);

  useEffect(() => {
    getStoreSettings().then(s => {
      if (s) {
        if (s.announcementText) setAnnouncement(s.announcementText);
        if (s.freeShippingThreshold) setFreeShipping(s.freeShippingThreshold);
        if (s.storeEmail || s.whatsappNumber) {
          setStoreInfo(prev => ({
            ...prev,
            email: s.storeEmail || prev.email,
            whatsapp: s.whatsappNumber || prev.whatsapp
          }));
        }
      }
    });
  }, []);

  const saveSection = async (key, value, label) => {
    if (key === 'announcement') {
      const cleanVal = (value || '').trim() || 'Free Worldwide Express Shipping Over $200 USD';
      setAnnouncement(cleanVal);
      await saveStoreSettingsToDB({ announcementText: cleanVal, freeShippingThreshold: freeShipping });
    }
    if (key === 'shipping') {
      const val = parseInt(value) || 200;
      setFreeShipping(val);
      await saveStoreSettingsToDB({ announcementText: announcement, freeShippingThreshold: val });
    }
    if (key === 'store') {
      setStoreInfo(value);
      await saveStoreSettingsToDB({ storeEmail: value.email, whatsappNumber: value.whatsapp });
    }
    setToast(`${label} saved & synced live to Database!`);
  };

  const exportCSV = async (type) => {
    let headers, rows, filename;
    if (type === 'products') {
      const products = await getProducts();
      headers = ['ID', 'Title', 'Category', 'Price', 'Regular Price', 'Stock', 'Badge', 'Rating'];
      rows = (products || []).map((p) => [p.id, `"${p.title}"`, p.category, p.price, p.regularPrice, p.isSoldOut ? 'Sold Out' : 'In Stock', p.badge || '', p.rating]);
      filename = 'vtm-products.csv';
    } else {
      const orders = await getOrders();
      headers = ['Order ID', 'Customer', 'Country', 'Items', 'Total', 'Payment', 'Status', 'Date'];
      rows = (orders || []).map((o) => [o.id, o.customer, o.country, `"${o.items}"`, `$${o.total}`, o.payment, o.status, o.date]);
      filename = 'vtm-orders.csv';
    }
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const loginTime = session.loginTime ? new Date(session.loginTime).toLocaleString() : 'Unknown';

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage store configuration and preferences</p>
      </div>

      {/* Store Information */}
      <SectionCard title="Store Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Store Name</label>
            <input className={inputCls} value={storeInfo.name} onChange={(e) => setStoreInfo((s) => ({ ...s, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Contact Email</label>
            <input className={inputCls} type="email" value={storeInfo.email} onChange={(e) => setStoreInfo((s) => ({ ...s, email: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">WhatsApp Number</label>
            <input className={inputCls} value={storeInfo.whatsapp} onChange={(e) => setStoreInfo((s) => ({ ...s, whatsapp: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Store Address</label>
            <input className={inputCls} value={storeInfo.address} onChange={(e) => setStoreInfo((s) => ({ ...s, address: e.target.value }))} />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={() => saveSection('store', storeInfo, 'Store information')} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all" style={{ background: 'linear-gradient(135deg, #c8924b, #e8b06a)', color: '#0f1117' }}>
            <Save size={14} />
            Save Store Info
          </button>
        </div>
      </SectionCard>

      {/* Announcement Bar */}
      <SectionCard title="Announcement Bar">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Scrolling Banner Text</label>
          <input
            className={inputCls}
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            placeholder="Enter announcement bar text..."
          />
          <p className="text-xs text-gray-400 mt-1.5">This text appears in the scrolling announcement bar at the top of the storefront.</p>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={() => saveSection('announcement', announcement, 'Announcement text')} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all" style={{ background: 'linear-gradient(135deg, #c8924b, #e8b06a)', color: '#0f1117' }}>
            <Save size={14} />
            Save Announcement
          </button>
        </div>
      </SectionCard>

      {/* Shipping */}
      <SectionCard title="Shipping Settings">
        <div>
          <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Free Shipping Threshold (USD)</label>
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-xs">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">$</span>
              <input
                className={inputCls + ' pl-7'}
                type="number"
                value={freeShipping}
                onChange={(e) => setFreeShipping(parseInt(e.target.value) || 0)}
                min={0}
              />
            </div>
            <button onClick={() => saveSection('shipping', freeShipping, 'Shipping threshold')} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all" style={{ background: 'linear-gradient(135deg, #c8924b, #e8b06a)', color: '#0f1117' }}>
              <Save size={14} />
              Save
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1.5">Orders above this amount qualify for free worldwide shipping.</p>
        </div>
      </SectionCard>

      {/* Admin Account */}
      <SectionCard title="Admin Account">
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-gray-500 font-medium">Admin Name</span>
            <span className="text-sm font-semibold text-gray-800">{session.name || 'Store Admin'}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-gray-50">
            <span className="text-sm text-gray-500 font-medium">Email</span>
            <span className="text-sm font-mono text-gray-700">{session.email || '—'}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-500 font-medium">Session Started</span>
            <span className="text-sm text-gray-700">{loginTime}</span>
          </div>
        </div>
      </SectionCard>

      {/* Payment Gateways */}
      <SectionCard title="Payment Gateways">
        <div className="space-y-3">
          {[
            { name: 'Stripe', desc: 'Credit / Debit Cards, Apple Pay & Google Pay (Live USD)', status: 'Active', active: true },
            { name: 'Bank Transfer', desc: 'Direct International Wire / SWIFT / IBAN', status: 'Active', active: true },
          ].map((gw) => (
            <div key={gw.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="font-semibold text-gray-900">{gw.name}</p>
                <p className="text-xs text-gray-400">{gw.desc}</p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                gw.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${gw.active ? 'bg-green-500' : 'bg-gray-400'}`} />
                {gw.status}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">Payment processing is configured via Stripe Live keys and Direct Bank Wire.</p>
      </SectionCard>

      {/* Export Data */}
      <SectionCard title="Export Data">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => exportCSV('products')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
          >
            <Download size={15} />
            Export Products CSV
          </button>
          <button
            onClick={() => exportCSV('orders')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all"
          >
            <Download size={15} />
            Export Orders CSV
          </button>
        </div>
      </SectionCard>

      {toast && <Toast msg={toast} onClose={() => setToast('')} />}
    </div>
  );
}
