import React, { useState } from 'react';
import { Star, CheckCircle2, MessageSquarePlus } from 'lucide-react';
import { customerReviews as initialReviews } from '../../data/reviews';
import { WriteReviewModal } from '../modals/WriteReviewModal';

export const ReviewsCarousel = () => {
  const [reviewsList, setReviewsList] = useState(initialReviews);
  const [isTapped, setIsTapped] = useState(false);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);

  // Duplicate reviews array to create an uninterrupted seamless infinite loop
  const seamlessReviews = [...reviewsList, ...reviewsList];

  const handleReviewSubmitted = (newReview) => {
    setReviewsList((prev) => [newReview, ...prev]);
  };

  return (
    <section id="reviews-section" className="py-14 md:py-20 bg-[#faf8f5] border-b border-neutral-200/80 font-menu select-none overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 mb-8 text-center">
        
        {/* Section Title & Verified Overall Score */}
        <span className="text-[11px] font-bold text-[#ae2828] uppercase tracking-[0.2em] block mb-1">
          Verified Testimonials
        </span>
        <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-normal text-neutral-900 tracking-wide mb-3">
          Our Customer Reviews
        </h2>
        
        {/* Trust Score Badge */}
        <div className="inline-flex items-center gap-2.5 bg-white px-4 py-2 rounded-full border border-neutral-200 shadow-2xs">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400" />
            ))}
          </div>
          <span className="text-xs font-bold text-neutral-800">4.9 / 5.0</span>
          <span className="text-xs text-neutral-500">• Over {reviewsList.length * 40}+ Verified Reviews</span>
        </div>
      </div>

      {/* Infinite Seamless Rolling Track */}
      <div 
        className="w-full overflow-hidden cursor-pointer"
        onClick={() => setIsTapped(!isTapped)}
      >
        <div className={`animate-marquee-slow flex gap-5 py-3 px-2 ${isTapped ? 'is-paused' : ''}`}>
          {seamlessReviews.map((review, idx) => (
            <div
              key={`${review.id}-${idx}`}
              className="shrink-0 w-[290px] sm:w-[340px] md:w-[360px] bg-white p-6 rounded-2xl border border-neutral-200/90 shadow-2xs hover:shadow-md hover:border-neutral-400 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Rating Stars & Date */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex text-amber-400">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10.5px] text-neutral-400">{review.date}</span>
                </div>

                {/* Title */}
                <h4 className="font-heading text-sm font-bold text-neutral-900 leading-snug mb-2">
                  "{review.title}"
                </h4>

                {/* Comment */}
                <p className="text-xs text-neutral-600 leading-relaxed italic line-clamp-3">
                  "{review.comment}"
                </p>
              </div>

              {/* Author Info */}
              <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-neutral-900 block">{review.name}</span>
                  <span className="text-[10px] text-neutral-400">{review.location}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Verified Buyer</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Write a review link (Interactive Modal Trigger) */}
      <div className="mt-8 text-center pt-2 text-xs">
        <span className="text-neutral-500 mr-2">
          Have you purchased from us? We'd love to hear your feedback!
        </span>
        <button
          type="button"
          onClick={() => setIsWriteModalOpen(true)}
          className="inline-flex items-center gap-1.5 font-bold text-neutral-900 hover:text-[#ae2828] underline underline-offset-4 transition-colors cursor-pointer"
        >
          <MessageSquarePlus className="w-3.5 h-3.5" />
          <span>Write a Review</span>
        </button>
      </div>

      {/* Write Review Modal */}
      <WriteReviewModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </section>
  );
};
