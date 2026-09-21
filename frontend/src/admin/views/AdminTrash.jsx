import React, { useState, useEffect } from 'react';
import { 
  Trash2, RotateCcw, Search, AlertCircle, CheckCircle, 
  Package, ArrowLeft, Layers, Sparkles, RefreshCw
} from 'lucide-react';
import { 
  getTrashProducts, 
  restoreProductFromTrash, 
  permanentlyDeleteFromTrash, 
  emptyTrash 
} from '../../lib/cloudflareService';

function Toast({ msg, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 bg-gray-900 text-white px-5 py-3.5 rounded-xl shadow-2xl text-sm font-medium animate-fade-in border border-gray-700">
      <CheckCircle size={18} className="text-emerald-400 shrink-0" />
      <span>{msg}</span>
    </div>
  );
}

export function AdminTrash({ onNavigate }) {
  const [trashedProducts, setTrashedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [permanentDeleteConfirm, setPermanentDeleteConfirm] = useState(null); // product obj
  const [emptyTrashConfirm, setEmptyTrashConfirm] = useState(false);

  const loadTrash = async () => {
    try {
      const data = await getTrashProducts();
      setTrashedProducts(Array.isArray(data) ? data : []);
    } catch {
      setTrashedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrash();
    window.addEventListener('vw_trash_updated', loadTrash);
    window.addEventListener('focus', loadTrash);
    return () => {
      window.removeEventListener('vw_trash_updated', loadTrash);
      window.removeEventListener('focus', loadTrash);
    };
  }, []);

  // RESTORE PRODUCT BACK TO ACTIVE STORE CATALOG
  const handleRestore = async (productToRestore) => {
    try {
      const updatedTrash = trashedProducts.filter(p => p.id !== productToRestore.id);
      setTrashedProducts(updatedTrash);
      setToast(`"${productToRestore.title}" restored back to live storefront!`);
      await restoreProductFromTrash(productToRestore.id);
    } catch (e) {
      console.error(e);
      setToast('Error restoring product.');
    }
  };

  // PERMANENTLY DELETE PRODUCT
  const handlePermanentDelete = async (productToDelete) => {
    try {
      const updatedTrash = trashedProducts.filter(p => p.id !== productToDelete.id);
      setTrashedProducts(updatedTrash);
      setPermanentDeleteConfirm(null);
      setToast(`"${productToDelete.title}" permanently erased forever.`);
      await permanentlyDeleteFromTrash(productToDelete.id);
    } catch (e) {
      console.error(e);
      setToast('Error permanently deleting product.');
    }
  };

  // EMPTY ENTIRE TRASH BIN
  const handleEmptyAllTrash = async () => {
    try {
      setTrashedProducts([]);
      setEmptyTrashConfirm(false);
      setToast('All items in trash permanently deleted.');
      await emptyTrash();
    } catch (e) {
      console.error(e);
      setToast('Error emptying trash.');
    }
  };

  const filtered = trashedProducts.filter((p) => {
    return (
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.categoryName && p.categoryName.toLowerCase().includes(search.toLowerCase())) ||
      (p.id && p.id.toLowerCase().includes(search.toLowerCase()))
    );
  });

  return (
    <div className="p-6 max-w-7xl space-y-6 font-menu">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => onNavigate && onNavigate('products')}
              className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to Products</span>
            </button>
            <span className="text-gray-300">•</span>
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded">
              Trash Bin
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Deleted Products (Trash)</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Items here are hidden from the storefront. You can restore them anytime or delete them permanently.
          </p>
        </div>

        {trashedProducts.length > 0 && (
          <button
            onClick={() => setEmptyTrashConfirm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 transition-all cursor-pointer shadow-2xs self-start sm:self-auto"
          >
            <Trash2 size={16} />
            <span>Empty Trash ({trashedProducts.length})</span>
          </button>
        )}
      </div>

      {/* Stats and Filter */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs p-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#c8924b] focus:border-transparent"
            placeholder="Search deleted products in trash..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="text-xs font-bold text-gray-500">
          Showing {filtered.length} of {trashedProducts.length} trashed items
        </div>
      </div>

      {/* Trashed Products Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-3 border-[#c8924b] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-bold text-gray-500">Checking trash bin...</p>
          </div>
        ) : trashedProducts.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto text-gray-400">
              <Trash2 size={28} />
            </div>
            <h3 className="text-base font-bold text-gray-800">Trash Bin is Empty</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              No products have been deleted. When you delete a product from the catalog, it will appear here safely before permanent removal.
            </p>
            {onNavigate && (
              <button
                onClick={() => onNavigate('products')}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-[#0f1117] transition-all hover:opacity-90 cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #c8924b, #e8b06a)' }}
              >
                <Package size={14} />
                <span>Go to Active Products Catalog</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100">
                  <th className="px-5 py-3.5 text-left font-semibold w-16">Item</th>
                  <th className="px-5 py-3.5 text-left font-semibold">Title & Specs</th>
                  <th className="px-5 py-3.5 text-left font-semibold">Category</th>
                  <th className="px-5 py-3.5 text-left font-semibold">Price</th>
                  <th className="px-5 py-3.5 text-left font-semibold">Deleted Time</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Restore / Erase</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p) => {
                  const deletedDate = p.trashedAt ? new Date(p.trashedAt).toLocaleString() : 'Recently';
                  return (
                    <tr key={p.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="w-12 h-12 rounded-xl bg-neutral-100 border border-neutral-200 overflow-hidden flex items-center justify-center p-1 opacity-75">
                          <img
                            src={p.image}
                            alt={p.title}
                            className="w-full h-full object-contain grayscale"
                            onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23f3f4f6"/></svg>'; }}
                          />
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-gray-800 line-clamp-1 max-w-sm">{p.title}</div>
                        <div className="text-[11px] text-gray-400 font-mono mt-0.5">ID: {p.id}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-block bg-neutral-100 text-neutral-600 text-xs px-2.5 py-1 rounded-lg font-medium">
                          {p.categoryName || p.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-gray-800">
                        ${Number(p.price).toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5 text-xs text-gray-500">
                        {deletedDate}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          {/* Restore Button */}
                          <button 
                            onClick={() => handleRestore(p)} 
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 text-xs font-bold transition-all cursor-pointer shadow-2xs" 
                            title="Restore Product to Live Catalog"
                          >
                            <RotateCcw size={13} />
                            <span>Restore</span>
                          </button>

                          {/* Permanent Delete Button */}
                          <button 
                            onClick={() => setPermanentDeleteConfirm(p)} 
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 text-xs font-bold transition-all cursor-pointer shadow-2xs" 
                            title="Permanently Delete Forever"
                          >
                            <Trash2 size={13} />
                            <span>Erase</span>
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                      No deleted products matching "{search}".
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Single Item Permanent Delete */}
      {permanentDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full border border-gray-200 animate-fade-in">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <AlertCircle size={24} />
              <h3 className="text-lg font-bold text-gray-900">Permanently Delete Product?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Are you sure you want to permanently delete <strong>{permanentDeleteConfirm.title}</strong>? 
              <br /><br />
              <span className="text-red-600 font-semibold">⚠️ Warning:</span> This will completely erase the product from both database and storage. It cannot be recovered again.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setPermanentDeleteConfirm(null)} 
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={() => handlePermanentDelete(permanentDeleteConfirm)} 
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-sm transition-all cursor-pointer"
              >
                Erase Forever
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Empty All Trash */}
      {emptyTrashConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full border border-gray-200 animate-fade-in">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <AlertCircle size={24} />
              <h3 className="text-lg font-bold text-gray-900">Empty Entire Trash Bin?</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Are you sure you want to permanently delete all <strong>{trashedProducts.length} items</strong> currently in the trash? 
              <br /><br />
              <span className="text-red-600 font-semibold">⚠️ This action is irreversible.</span>
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setEmptyTrashConfirm(false)} 
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleEmptyAllTrash} 
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-bold shadow-sm transition-all cursor-pointer"
              >
                Yes, Empty Trash
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast} onClose={() => setToast('')} />}
    </div>
  );
}
