import React, { useState, useEffect } from 'react';
import { getStoreSettings } from '../../lib/cloudflareService';

export const AnnouncementBar = () => {
  const [customText, setCustomText] = useState('Free Worldwide Express Shipping Over $200 USD');

  const loadSettings = async () => {
    try {
      const settings = await getStoreSettings();
      if (settings && settings.announcementText && settings.announcementText.trim()) {
        setCustomText(settings.announcementText.trim());
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadSettings();
    window.addEventListener('vw_announcement_updated', loadSettings);
    window.addEventListener('focus', loadSettings);

    return () => {
      window.removeEventListener('vw_announcement_updated', loadSettings);
      window.removeEventListener('focus', loadSettings);
    };
  }, []);

  const displayText = customText.trim() || 'Free Worldwide Express Shipping Over $200 USD';
  
  // Repeat the exact text 8 times so the marquee ticker scrolls smoothly across wide screens
  const items = Array(8).fill(displayText);

  return (
    <div className="w-full bg-[#faecd7] text-[#2c2b2b] py-2 overflow-hidden select-none border-b border-[#ebdcca] font-menu text-xs">
      <div className="flex whitespace-nowrap animate-marquee hover:[animation-play-state:paused] items-center gap-10 cursor-pointer">
        {items.map((text, idx) => (
          <div key={idx} className="flex items-center gap-3 shrink-0">
            <span className="text-xs">✨</span>
            <span className="font-semibold text-neutral-900 tracking-wide">
              {text}
            </span>
            <span className="text-neutral-400 mx-2">•</span>
          </div>
        ))}
      </div>
    </div>
  );
};
