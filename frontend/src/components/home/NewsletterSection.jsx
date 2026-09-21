import React, { useState } from 'react';
import { Mail, ArrowRight, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { showToast } = useCart();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    setIsSubmitted(true);
    showToast('Thank you for subscribing to Azim Crafts! 🎉');
    setEmail('');
    setTimeout(() => setIsSubmitted(false), 3000);
  };

  return (
    <section className="py-14 md:py-16 bg-[#f7eddb]/60 border-b border-[#eedaba]">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 text-center">
        <div className="max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#1b1a1a] text-[#f7eddb] flex items-center justify-center mx-auto mb-2 shadow-xs">
            <Mail className="w-5 h-5" />
          </div>
          
          <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-normal text-neutral-900 tracking-wide">
            Subscribe to our emails
          </h2>
          
          <p className="text-xs md:text-sm text-neutral-700">
            Be the first to know about new collections, rare restocks, and exclusive holiday discounts.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-2">
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-md border border-neutral-300 text-xs md:text-sm bg-white focus:outline-none focus:border-black text-neutral-900"
              required
            />
            <button
              type="submit"
              disabled={isSubmitted}
              className="bg-[#1b1a1a] hover:bg-[#333333] text-white px-6 py-3 rounded-md text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shrink-0 shadow-sm"
            >
              {isSubmitted ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Subscribed!</span>
                </>
              ) : (
                <>
                  <span>Subscribe</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-[11px] text-neutral-500">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
};
