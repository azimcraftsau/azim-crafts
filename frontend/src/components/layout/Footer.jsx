import React, { useState } from 'react';
import { footerQuickLinks } from '../../data/navigation';
import { useCart } from '../../context/CartContext';
import { 
  MapPin, Phone, Mail, Clock, Globe, 
  Facebook, Instagram, Youtube, Linkedin
} from 'lucide-react';

export const Footer = () => {
  const { currentPage, navigateTo, openCategory } = useCart();

  const handleFooterLinkClick = (e, link) => {
    e.preventDefault();
    if (link.href === '#about-section') {
      if (currentPage !== 'home') {
        navigateTo('home');
        setTimeout(() => {
          const el = document.getElementById('about-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      } else {
        const el = document.getElementById('about-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (link.href === '#categories-section' || link.title === 'All Products') {
      if (link.catKey && link.catKey !== 'all') {
        openCategory(link.catKey);
      } else {
        openCategory('all');
      }
    } else if (link.href && link.href.startsWith('#')) {
      const targetId = link.href.replace('#', '');
      if (currentPage !== 'home') {
        navigateTo('home');
        setTimeout(() => {
          const el = document.getElementById(targetId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 120);
      } else {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } else if (link.href) {
      window.location.href = link.href;
    }
  };

  return (
    <footer id="footer-section" className="bg-[#1b1a1a] text-neutral-300 font-menu text-xs border-t border-neutral-800">
      {/* Main Footer Grid */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Column 1: Brand & Bio (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3.5">
              <img
                src="/logo/logo without bg.png"
                alt="Azim Crafts"
                className="h-16 sm:h-20 w-auto object-contain"
              />
              <div>
                <span className="font-heading text-lg font-bold text-white tracking-wider block">
                  AZIM CRAFTS
                </span>
                <span className="text-[10.5px] tracking-[0.25em] text-[#f7eddb] uppercase block">
                  HANDCRAFTED HERITAGE
                </span>
              </div>
            </div>

            <p className="text-neutral-400 text-xs leading-relaxed max-w-sm">
              Your premier artisan destination for genuine handcrafted nautical antiques, deep sea diving helmets, medieval shields & armour, precision compasses, and hand-bound leather journals.
            </p>

            {/* Social Icons */}
            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-[#ae2828] text-white flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/azimcrafts?stkn=eTkzc2x5YjZ2ZzZ6"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-[#ae2828] text-white flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.linkedin.com/company/azim-crafts/"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-[#ae2828] text-white flex items-center justify-center transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-[#ae2828] text-white flex items-center justify-center transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider border-b border-neutral-800 pb-2">
              Quick links
            </h3>
            <ul className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
              {footerQuickLinks.map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link.href}
                    onClick={(e) => handleFooterLinkClick(e, link)}
                    className="text-neutral-400 hover:text-[#f7eddb] transition-colors inline-block py-0.5 cursor-pointer"
                  >
                    {link.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Our Stores & Workshop (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="font-heading text-sm font-bold text-white uppercase tracking-wider border-b border-neutral-800 pb-2">
              Our Stores & Workshop
            </h3>
            <div className="space-y-3 text-xs text-neutral-400">
              {/* Store 1: Australia */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-[#f7eddb] shrink-0" />
                  <span>Australia Store (Shrin Malik)</span>
                </div>
                <p className="pl-5 text-neutral-300 leading-relaxed">
                  42a chestnut road, Auburn, 2144, NSW, Australia
                </p>
                <p className="pl-5 flex items-center gap-1.5 text-neutral-400">
                  <Phone className="w-3 h-3 text-[#f7eddb] shrink-0" />
                  <span>Call / Text: <strong className="text-neutral-200">0426285439</strong> (+61 426 285 439)</span>
                </p>
              </div>

              {/* Store 2: United Kingdom */}
              <div className="space-y-1 pt-2 border-t border-neutral-800/80">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <MapPin className="w-3.5 h-3.5 text-[#f7eddb] shrink-0" />
                  <span>United Kingdom Store</span>
                </div>
                <p className="pl-5 text-neutral-300 leading-relaxed">
                  01 Oswald Street, Bolton, BL3 4BA, United Kingdom
                </p>
              </div>

              {/* Manufacturing Unit */}
              <div className="space-y-0.5 pt-2 border-t border-neutral-800/80">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <Globe className="w-3.5 h-3.5 text-[#f7eddb] shrink-0" />
                  <span>Manufacturing Unit & Workshop</span>
                </div>
                <p className="pl-5 text-neutral-400 leading-relaxed">
                  Master Artisan Foundry, Roorkee, Uttarakhand, India
                </p>
              </div>

              {/* Email & Support Hours */}
              <div className="pt-2 border-t border-neutral-800/80 space-y-1.5">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#f7eddb] shrink-0" />
                  <span>Support Email: <a href="mailto:contact@azimcrafts.com" className="text-neutral-100 underline hover:text-white font-bold">contact@azimcrafts.com</a></span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-[#f7eddb] shrink-0 mt-0.5" />
                  <span>Monday – Friday: 9:00am – 5:00pm AEST / GMT</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Utility Bar: Currency Selector & Payment Icons */}
        <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Official Currency & Payment Security */}
          <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium">
            <Globe className="w-3.5 h-3.5 text-[#c8924b]" />
            <span>All catalog pricing in <strong className="text-white font-semibold">USD ($)</strong> • Worldwide Express Delivery</span>
          </div>

          {/* Payment Method Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {['Visa', 'Mastercard', 'Amex', 'Discover', 'Apple Pay', 'Google Pay', 'Bank Transfer'].map((pay, pIdx) => (
              <span
                key={pIdx}
                className="bg-white text-[#131313] font-bold text-[10px] px-2.5 py-1 rounded shadow-2xs border border-neutral-300"
              >
                {pay}
              </span>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-center text-[11px] text-neutral-500 border-t border-neutral-900 pt-6">
          <p>© 2026, <a href="/" className="hover:underline text-neutral-400">Azim Crafts</a>. Handcrafted with authenticity.</p>
        </div>
      </div>
    </footer>
  );
};
