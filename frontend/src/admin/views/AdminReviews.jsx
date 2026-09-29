import React, { useState, useEffect, useMemo } from 'react';
import {
  Star, CheckCircle2, XCircle, Trash2, Search, Clock,
  ThumbsUp, ThumbsDown, MessageSquare, Filter, RefreshCw, Loader2, Mail, ShoppingBag
} from 'lucide-react';
import { getAllReviews, updateReviewStatusInDB, deleteReviewFromDB } from '../../lib/cloudflareService';

const STATUS_COLORS = {
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', label: 'Pending Approval' },
  approved: { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', label: 'Approved' },
  rejected: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', dot: 'bg-red-500', label: 'Rejected' }
};

export function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'
  const [search, setSearch] = useState('');

  const loadReviews = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await getAllReviews();
      if (Array.isArray(data)) setReviews(data);
    } catch (e) {
      console.warn('Failed to load reviews:', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadReviews();
    const handler = () => loadReviews(true);
    window.addEventListener('vw_reviews_updated', handler);
    const interval = setInterval(() => loadReviews(true), 5000);
    return () => {
      window.removeEventListener('vw_reviews_updated', handler);
      clearInterval(interval);
    };
  }, []);

  const handleApprove = async (id) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'approved' } : r));
    await updateReviewStatusInDB(id, 'approved');
  };

  const handleReject = async (id) => {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: 'rejected' } : r));
    await updateReviewStatusInDB(id, 'rejected');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this review?')) return;
    setReviews(prev => prev.filter(r => r.id !== id));
    await deleteReviewFromDB(id);
  };

  // Counts
  const pendingCount = useMemo(() => reviews.filter(r => r.status === 'pending').length, [reviews]);
  const approvedCount = useMemo(() => reviews.filter(r => r.status === 'approved').length, [reviews]);
  const rejectedCount = useMemo(() => reviews.filter(r => r.status === 'rejected').length, [reviews]);
  const avgRating = useMemo(() => {
    const approved = reviews.filter(r => r.status === 'approved');
    if (approved.length === 0) return '0.0';
    return (approved.reduce((sum, r) => sum + (r.rating || 5), 0) / approved.length).toFixed(1);
  }, [reviews]);

  // Filtered list
  const filtered = useMemo(() => {
    return reviews.filter(r => {
      if (filter !== 'all' && r.status !== filter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          (r.customer_name || '').toLowerCase().includes(q) ||
          (r.customer_email || '').toLowerCase().includes(q) ||
          (r.order_id || '').toLowerCase().includes(q) ||
          (r.title || '').toLowerCase().includes(q) ||
          (r.comment || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [reviews, filter, search]);

  return (
    <div className="space-y-6 font-menu">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare size={22} className="text-[#c8924b]" />
            Customer Reviews
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Moderate, approve, or reject customer reviews before they go live on the storefront.</p>
        </div>
        <button
          onClick={() => loadReviews()}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 bg-white hover:bg-neutral-50 text-gray-800 text-xs font-bold transition-all cursor-pointer shadow-2xs"
        >
          <RefreshCw size={13} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs text-center">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total</p>
          <p className="text-2xl font-black text-gray-900 mt-1">{reviews.length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-amber-200 p-4 shadow-xs text-center">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-black text-amber-700 mt-1">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-emerald-200 p-4 shadow-xs text-center">
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Approved</p>
          <p className="text-2xl font-black text-emerald-700 mt-1">{approvedCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-red-200 p-4 shadow-xs text-center">
          <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Rejected</p>
          <p className="text-2xl font-black text-red-700 mt-1">{rejectedCount}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs text-center">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Avg Rating</p>
          <p className="text-2xl font-black text-gray-900 mt-1 flex items-center justify-center gap-1">
            {avgRating} <Star size={16} className="fill-amber-400 text-amber-400" />
          </p>
        </div>
      </div>

      {/* Filter Tabs + Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
          {[
            { key: 'all', label: 'All', count: reviews.length },
            { key: 'pending', label: 'Pending', count: pendingCount },
            { key: 'approved', label: 'Approved', count: approvedCount },
            { key: 'rejected', label: 'Rejected', count: rejectedCount }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filter === tab.key
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.label}
              {tab.key === 'pending' && tab.count > 0 && (
                <span className="ml-1.5 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{tab.count}</span>
              )}
              {tab.key !== 'pending' && tab.count > 0 && (
                <span className="ml-1 text-gray-400 text-[10px]">({tab.count})</span>
              )}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-[#c8924b] focus:border-transparent outline-none bg-white"
          />
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          <span className="ml-3 text-gray-500 text-sm">Loading reviews...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 space-y-2">
          <MessageSquare size={32} className="mx-auto text-gray-300" />
          <p className="font-semibold text-gray-700 text-sm">No reviews found for this filter.</p>
          <p className="text-xs">Try changing the filter or search criteria.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(review => {
            const sc = STATUS_COLORS[review.status] || STATUS_COLORS.pending;
            return (
              <div
                key={review.id}
                className={`bg-white rounded-2xl border shadow-xs p-5 transition-all hover:shadow-md ${
                  review.status === 'pending' ? 'border-amber-200 border-l-4 border-l-amber-400' : 'border-gray-200'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Left Content */}
                  <div className="flex-1 space-y-2.5">
                    {/* Rating + Status + Date */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex text-amber-400">
                        {[...Array(review.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-400" />
                        ))}
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border ${sc.bg} ${sc.text} ${sc.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                        {sc.label}
                      </span>
                      <span className="text-[10.5px] text-gray-400 flex items-center gap-1">
                        <Clock size={11} />
                        {review.created_at ? new Date(review.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}
                      </span>
                    </div>

                    {/* Title */}
                    {review.title && (
                      <h4 className="font-bold text-gray-900 text-sm leading-snug">"{review.title}"</h4>
                    )}

                    {/* Comment */}
                    <p className="text-xs text-gray-600 leading-relaxed italic">"{review.comment}"</p>

                    {/* Customer Info */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
                      <span className="font-bold text-gray-800">{review.customer_name}</span>
                      {review.customer_email && (
                        <span className="flex items-center gap-1">
                          <Mail size={11} className="text-gray-400" />
                          {review.customer_email}
                        </span>
                      )}
                      {review.order_id && (
                        <span className="flex items-center gap-1">
                          <ShoppingBag size={11} className="text-gray-400" />
                          {review.order_id}
                        </span>
                      )}
                      {review.location && review.location !== 'Verified Buyer' && (
                        <span className="text-gray-400">{review.location}</span>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {review.status !== 'approved' && (
                      <button
                        onClick={() => handleApprove(review.id)}
                        title="Approve Review (Goes Live on Storefront)"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                      >
                        <ThumbsUp size={13} />
                        <span>Approve</span>
                      </button>
                    )}
                    {review.status !== 'rejected' && review.status !== 'approved' && (
                      <button
                        onClick={() => handleReject(review.id)}
                        title="Reject Review"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-300 bg-white hover:bg-red-50 hover:border-red-300 text-gray-700 hover:text-red-700 text-xs font-bold transition-all cursor-pointer"
                      >
                        <ThumbsDown size={13} />
                        <span>Reject</span>
                      </button>
                    )}
                    {review.status === 'approved' && (
                      <span className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                        <CheckCircle2 size={13} />
                        <span>Live on Storefront</span>
                      </span>
                    )}
                    {review.status === 'rejected' && (
                      <button
                        onClick={() => handleApprove(review.id)}
                        title="Re-approve Review"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                      >
                        <ThumbsUp size={13} />
                        <span>Approve</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(review.id)}
                      title="Delete Review Permanently"
                      className="p-2 rounded-xl border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
