import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const Toast = () => {
  const { toast } = useCart();
  if (!toast) return null;

  const isError = toast.type === 'error';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-fade-in flex items-center gap-3 bg-[#1b1a1a] text-white px-4 py-3 rounded-lg shadow-2xl border border-neutral-700 max-w-sm">
      {isError ? (
        <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
      ) : (
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
      )}
      <p className="text-xs md:text-sm font-medium leading-snug">
        {toast.message}
      </p>
    </div>
  );
};
