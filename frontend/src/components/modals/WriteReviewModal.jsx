import React, { useState, useEffect } from 'react';
import { X, Star, CheckCircle, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const WriteReviewModal = ({ isOpen, onClose, onReviewSubmitted }) => {
  const { showToast } = useCart();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Background Scroll Lock (zero scroll jump)
  useEffect(() => {
    if (isOpen) {
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalBodyOverflow = document.body.style.overflow;
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';

      return () => {
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.overflow = originalBodyOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim()) {
      showToast('Please fill in your name and review comment.', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const newReview = {
        id: Date.now(),
        name: name.trim(),
        rating,
        title: title.trim() || 'Exceptional craftsmanship & authentic detail!',
        comment: comment.trim(),
        date: 'Just now',
        location: 'Verified Buyer',
      };
      if (onReviewSubmitted) {
        onReviewSubmitted(newReview);
      }
      showToast('🎉 Thank you! Your review was submitted successfully and is now live.');
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto font-menu">
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in border border-neutral-200">
          
          {/* Header */}
          <div className="bg-[#1b1a1a] text-white p-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading text-base font-bold">Write a Customer Review</h3>
                <p className="text-xs text-neutral-300">Share your experience with Azim Crafts</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            
            {/* Star Rating Selector */}
            <div>
              <label className="block font-bold text-neutral-800 mb-1.5">
                Overall Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-115 focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= (hoverRating || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-neutral-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 font-bold text-neutral-700 text-sm">
                  {rating === 5 ? '5.0 - Excellent! ⭐⭐⭐⭐⭐' : `${rating}.0 / 5.0`}
                </span>
              </div>
            </div>

            {/* Review Title */}
            <div>
              <label className="block font-bold text-neutral-800 mb-1">
                Review Headline
              </label>
              <input
                type="text"
                placeholder="e.g. Masterpiece craftsmanship, exceeded expectations!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:border-black bg-neutral-50/50"
              />
            </div>

            {/* Review Comment */}
            <div>
              <label className="block font-bold text-neutral-800 mb-1">
                Your Review <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="Write your review here. What did you love about the quality, weight, finish, or fast delivery?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:border-black bg-neutral-50/50 resize-none"
              />
            </div>

            {/* Name & Email Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-neutral-800 mb-1">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marcus Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:border-black bg-neutral-50/50"
                />
              </div>

              <div>
                <label className="block font-bold text-neutral-800 mb-1">
                  Your Email (kept private)
                </label>
                <input
                  type="email"
                  placeholder="e.g. marcus@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:border-black bg-neutral-50/50"
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-neutral-300 hover:bg-neutral-100 rounded-lg font-semibold text-neutral-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-[#1b1a1a] hover:bg-[#333333] text-white rounded-lg font-semibold transition-colors shadow-sm flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Submit Review</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
