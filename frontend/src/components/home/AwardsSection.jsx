import React, { useState } from 'react';
import { VerificationModal } from '../modals/VerificationModal';

export const AwardsSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="py-12 md:py-18 bg-white border-b border-neutral-100 font-menu select-none">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 text-center">
        
        {/* Section Heading */}
        <div className="mb-8 md:mb-10">
          <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-normal text-neutral-900 tracking-wide">
            Awards & Recognitions
          </h2>
        </div>

        {/* 100% Pure Clean Vector Certificate */}
        <div className="max-w-4xl lg:max-w-5xl mx-auto relative flex items-center justify-center">
          <div 
            onClick={() => setIsModalOpen(true)}
            className="vw-award-badge relative w-full cursor-pointer select-none drop-shadow-sm hover:drop-shadow-md transition-all duration-300"
            style={{ maxWidth: '1050px', margin: '0 auto' }}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 1200 340" 
              role="img" 
              aria-label="Quality Business Awards 2025 - Azim Crafts" 
              className="w-full h-auto block"
            >
              <defs>
                {/* Gold Metal Linear Gradient */}
                <linearGradient id="goldMetal" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8a6a1e"/>
                  <stop offset="12%" stopColor="#e8c97a"/>
                  <stop offset="25%" stopColor="#fff6dd"/>
                  <stop offset="38%" stopColor="#c9a24b"/>
                  <stop offset="50%" stopColor="#fff6dd"/>
                  <stop offset="62%" stopColor="#c9a24b"/>
                  <stop offset="75%" stopColor="#fff6dd"/>
                  <stop offset="88%" stopColor="#e8c97a"/>
                  <stop offset="100%" stopColor="#8a6a1e"/>
                </linearGradient>

                {/* Header Ribbon Metallic Gold Gradient */}
                <linearGradient id="headerBarGold" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ba8b39"/>
                  <stop offset="25%" stopColor="#dfb762"/>
                  <stop offset="50%" stopColor="#f8dc8e"/>
                  <stop offset="75%" stopColor="#dfb762"/>
                  <stop offset="100%" stopColor="#ba8b39"/>
                </linearGradient>

                {/* Podium Gradient */}
                <linearGradient id="podiumGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#8a6a1e"/>
                  <stop offset="50%" stopColor="#f6e6b3"/>
                  <stop offset="100%" stopColor="#8a6a1e"/>
                </linearGradient>

                {/* Medal Fill */}
                <radialGradient id="medalFill" cx="50%" cy="45%" r="60%">
                  <stop offset="0%" stopColor="#ffffff"/>
                  <stop offset="100%" stopColor="#fdf7e8"/>
                </radialGradient>
              </defs>

              {/* Background & Outer Frame */}
              <rect x="0" y="0" width="1200" height="340" fill="#ffffff"/>
              <rect x="16" y="46" width="1168" height="274" rx="26" fill="#ffffff" stroke="url(#goldMetal)" strokeWidth="5"/>
              
              {/* Top #1 BEST RATED 2025 Pill */}
              <rect x="430.0" y="18" width="340" height="46" rx="23.0" fill="url(#goldMetal)" stroke="#f6e6b3" strokeWidth="1.5"/>
              <text x="600.0" y="48.0" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="22" fontWeight="bold" fill="#ffffff" letterSpacing="1">#1 BEST RATED 2025</text>

              {/* Left Laurel Wreath Leaves */}
              <g transform="translate(146.2,255.4) rotate(200.0)"><path d="M0,0 C3.6,-10.08 16.8,-6.048 24.0,0 C16.8,6.048 3.6,10.08 0,0 Z" fill="#c9a24b" stroke="#7a5c17" strokeWidth="0.6"/></g>
              <g transform="translate(118.2,239.2) rotate(220.0)"><path d="M0,0 C3.34,-9.36 15.6,-5.616 22.28,0 C15.6,5.616 3.34,9.36 0,0 Z" fill="#e2bd6c" stroke="#7a5c17" strokeWidth="0.6"/></g>
              <g transform="translate(97.5,214.5) rotate(240.0)"><path d="M0,0 C3.08,-8.64 14.4,-5.184 20.57,0 C14.4,5.184 3.08,8.64 0,0 Z" fill="#c9a24b" stroke="#7a5c17" strokeWidth="0.6"/></g>
              <g transform="translate(86.4,184.1) rotate(260.0)"><path d="M0,0 C2.82,-7.92 13.2,-4.752 18.85,0 C13.2,4.752 2.82,7.92 0,0 Z" fill="#e2bd6c" stroke="#7a5c17" strokeWidth="0.6"/></g>
              <g transform="translate(86.4,151.9) rotate(280.0)"><path d="M0,0 C2.57,-7.2 12.0,-4.32 17.14,0 C12.0,4.32 2.57,7.2 0,0 Z" fill="#c9a24b" stroke="#7a5c17" strokeWidth="0.6"/></g>
              <g transform="translate(97.5,121.5) rotate(300.0)"><path d="M0,0 C2.31,-6.48 10.8,-3.888 15.42,0 C10.8,3.888 2.31,6.48 0,0 Z" fill="#e2bd6c" stroke="#7a5c17" strokeWidth="0.6"/></g>
              <g transform="translate(118.2,96.8) rotate(320.0)"><path d="M0,0 C2.05,-5.76 9.6,-3.456 13.71,0 C9.6,3.456 2.05,5.76 0,0 Z" fill="#c9a24b" stroke="#7a5c17" strokeWidth="0.6"/></g>
              <g transform="translate(146.2,80.6) rotate(340.0)"><path d="M0,0 C1.8,-5.04 8.4,-3.024 12.0,0 C8.4,3.024 1.8,5.04 0,0 Z" fill="#e2bd6c" stroke="#7a5c17" strokeWidth="0.6"/></g>

              {/* Right Laurel Wreath Leaves */}
              <g transform="translate(209.8,255.4) rotate(-20.0)"><path d="M0,0 C3.6,-10.08 16.8,-6.048 24.0,0 C16.8,6.048 3.6,10.08 0,0 Z" fill="#c9a24b" stroke="#7a5c17" strokeWidth="0.6"/></g>
              <g transform="translate(237.8,239.2) rotate(-40.0)"><path d="M0,0 C3.34,-9.36 15.6,-5.616 22.28,0 C15.6,5.616 3.34,9.36 0,0 Z" fill="#e2bd6c" stroke="#7a5c17" strokeWidth="0.6"/></g>
              <g transform="translate(258.5,214.5) rotate(-60.0)"><path d="M0,0 C3.08,-8.64 14.4,-5.184 20.57,0 C14.4,5.184 3.08,8.64 0,0 Z" fill="#c9a24b" stroke="#7a5c17" strokeWidth="0.6"/></g>
              <g transform="translate(269.6,184.1) rotate(-80.0)"><path d="M0,0 C2.82,-7.92 13.2,-4.752 18.85,0 C13.2,4.752 2.82,7.92 0,0 Z" fill="#e2bd6c" stroke="#7a5c17" strokeWidth="0.6"/></g>
              <g transform="translate(269.6,151.9) rotate(-100.0)"><path d="M0,0 C2.57,-7.2 12.0,-4.32 17.14,0 C12.0,4.32 2.57,7.2 0,0 Z" fill="#c9a24b" stroke="#7a5c17" strokeWidth="0.6"/></g>
              <g transform="translate(258.5,121.5) rotate(-120.0)"><path d="M0,0 C2.31,-6.48 10.8,-3.888 15.42,0 C10.8,3.888 2.31,6.48 0,0 Z" fill="#e2bd6c" stroke="#7a5c17" strokeWidth="0.6"/></g>
              <g transform="translate(237.8,96.8) rotate(-140.0)"><path d="M0,0 C2.05,-5.76 9.6,-3.456 13.71,0 C9.6,3.456 2.05,5.76 0,0 Z" fill="#c9a24b" stroke="#7a5c17" strokeWidth="0.6"/></g>
              <g transform="translate(209.8,80.6) rotate(-160.0)"><path d="M0,0 C1.8,-5.04 8.4,-3.024 12.0,0 C8.4,3.024 1.8,5.04 0,0 Z" fill="#e2bd6c" stroke="#7a5c17" strokeWidth="0.6"/></g>

              {/* Medal & Stars */}
              <circle cx="178" cy="168" r="84" fill="url(#medalFill)" stroke="url(#goldMetal)" strokeWidth="6"/>
              <circle cx="178" cy="168" r="74" fill="none" stroke="#c9a24b" strokeWidth="1.2"/>
              <polygon points="152.00,116.00 153.41,120.06 157.71,120.15 154.28,122.74 155.53,126.85 152.00,124.40 148.47,126.85 149.72,122.74 146.29,120.15 150.59,120.06" fill="#8a6a1e"/>
              <polygon points="178.00,116.00 179.41,120.06 183.71,120.15 180.28,122.74 181.53,126.85 178.00,124.40 174.47,126.85 175.72,122.74 172.29,120.15 176.59,120.06" fill="#8a6a1e"/>
              <polygon points="204.00,116.00 205.41,120.06 209.71,120.15 206.28,122.74 207.53,126.85 204.00,124.40 200.47,126.85 201.72,122.74 198.29,120.15 202.59,120.06" fill="#8a6a1e"/>

              <text x="178" y="148" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="15.5" fontWeight="bold" fill="#8a6a1e" letterSpacing="0.5">QUALITY</text>
              <text x="178" y="166" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="15.5" fontWeight="bold" fill="#8a6a1e" letterSpacing="0.5">BUSINESS</text>
              <text x="178" y="184" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="15.5" fontWeight="bold" fill="#8a6a1e" letterSpacing="0.5">AWARDS</text>
              <text x="178" y="213" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="26" fontWeight="bold" fill="#8a6a1e">2025</text>

              {/* Pedestal Bottom */}
              <ellipse cx="178" cy="272" rx="88" ry="12" fill="url(#podiumGrad)" stroke="#8a6a1e" strokeWidth="1"/>
              <rect x="90" y="272" width="176" height="20" fill="url(#podiumGrad)"/>
              <ellipse cx="178" cy="292" rx="88" ry="10" fill="#c9a24b" stroke="#8a6a1e" strokeWidth="1"/>
              <ellipse cx="178" cy="253" rx="62" ry="9" fill="url(#podiumGrad)" stroke="#8a6a1e" strokeWidth="1"/>
              <rect x="116" y="253" width="124" height="16" fill="url(#podiumGrad)"/>
              <ellipse cx="178" cy="269" rx="62" ry="8" fill="#c9a24b" stroke="#8a6a1e" strokeWidth="1"/>

              {/* Right Side: Inner Enclosed Box (Wrapping Header + Address ONLY) */}
              <rect x="340" y="88" width="826" height="126" rx="4" fill="#ffffff" stroke="#c9a24b" strokeWidth="1.5"/>
              
              {/* Header Ribbon Bar in Photo 1 Gold Gradient */}
              <rect x="340" y="88" width="826" height="38" fill="url(#headerBarGold)"/>
              <text x="356" y="115" fontFamily="Arial, Helvetica, sans-serif" fontSize="20" fontWeight="900" fill="#141a22" letterSpacing="0.5">AZIM CRAFTS</text>

              {/* Row 1: Antique Store */}
              <g transform="translate(356,138) scale(0.68)"><path d="M17 3a1 1 0 0 1 .993 .883l.007 .117v2.17a3 3 0 1 1 0 5.659v.171a6.002 6.002 0 0 1 -5 5.917v2.083h3a1 1 0 0 1 .117 1.993l-.117 .007h-8a1 1 0 0 1 -.117 -1.993l.117 -.007h3v-2.083a6.002 6.002 0 0 1 -4.996 -5.692l-.004 -.225v-.171a3 3 0 0 1 -3.996 -2.653l-.003 -.176l.005 -.176a3 3 0 0 1 3.995 -2.654l-.001 -2.17a1 1 0 0 1 1 -1h10zm-12 5a1 1 0 1 0 0 2a1 1 0 0 0 0 -2m14 0a1 1 0 1 0 0 2a1 1 0 0 0 0 -2" fill="#c9a24b"/></g>
              <text x="380" y="151" fontFamily="Arial, Helvetica, sans-serif" fontSize="14.5" fontWeight="bold" fill="#1b2436">Antique Store</text>

              {/* Row 1: City of Hume, VIC */}
              <g transform="translate(730,138) scale(0.68)"><path d="M18.364 4.636a9 9 0 0 1 .203 12.519l-.203 .21l-4.243 4.242a3 3 0 0 1 -4.097 .135l-.144 -.135l-4.244 -4.243a9 9 0 0 1 12.728 -12.728zm-6.364 3.364a3 3 0 1 0 0 6a3 3 0 0 0 0 -6" fill="#c9a24b"/></g>
              <text x="754" y="151" fontFamily="Arial, Helvetica, sans-serif" fontSize="14.5" fontWeight="bold" fill="#1b2436">City of Hume, VIC</text>

              {/* Row 2: Address */}
              <g transform="translate(356,168) scale(0.68)"><path d="M18.364 4.636a9 9 0 0 1 .203 12.519l-.203 .21l-4.243 4.242a3 3 0 0 1 -4.097 .135l-.144 -.135l-4.244 -4.243a9 9 0 0 1 12.728 -12.728zm-6.364 3.364a3 3 0 1 0 0 6a3 3 0 0 0 0 -6" fill="#c9a24b"/></g>
              <text x="380" y="181" fontFamily="Arial, Helvetica, sans-serif" fontSize="14.5" fontWeight="bold" fill="#1b2436">AZIM CRAFTS, 47 Merri</text>
              <text x="380" y="200" fontFamily="Arial, Helvetica, sans-serif" fontSize="14.5" fontWeight="bold" fill="#1b2436">Concourse, Campbellfield VIC 3061</text>

              {/* Below Inner Box: Subtitle Tagline */}
              <text x="340" y="235" fontFamily="Arial, Helvetica, sans-serif" fontSize="11.5" fill="#6d6d6d">Ranked as the best among City of Hume Antique Store businesses for 2025, <tspan fontWeight="bold" fill="#1b2436">AZIM CRAFTS</tspan> exceeded a quality score of 95%.</text>

              {/* Thin Divider Line below Subtitle */}
              <line x1="340" y1="246" x2="1166" y2="246" stroke="#e4e4e4" strokeWidth="1"/>

              {/* Bottom Row: Stars & Labels */}
              {/* Satisfaction */}
              <g transform="translate(340, 260)">
                <polygon points="0,0 1.76,4.57 6.66,4.84 2.85,7.93 4.11,12.66 0,10.00 -4.11,12.66 -2.85,7.93 -6.66,4.84 -1.76,4.57" fill="#1b2436" transform="translate(6,0)"/>
                <polygon points="0,0 1.76,4.57 6.66,4.84 2.85,7.93 4.11,12.66 0,10.00 -4.11,12.66 -2.85,7.93 -6.66,4.84 -1.76,4.57" fill="#1b2436" transform="translate(23,0)"/>
                <polygon points="0,0 1.76,4.57 6.66,4.84 2.85,7.93 4.11,12.66 0,10.00 -4.11,12.66 -2.85,7.93 -6.66,4.84 -1.76,4.57" fill="#1b2436" transform="translate(40,0)"/>
                <polygon points="0,0 1.76,4.57 6.66,4.84 2.85,7.93 4.11,12.66 0,10.00 -4.11,12.66 -2.85,7.93 -6.66,4.84 -1.76,4.57" fill="#1b2436" transform="translate(57,0)"/>
                <polygon points="0,0 1.76,4.57 6.66,4.84 2.85,7.93 4.11,12.66 0,10.00 -4.11,12.66 -2.85,7.93 -6.66,4.84 -1.76,4.57" fill="#1b2436" transform="translate(74,0)"/>
                <text x="96" y="11" fontFamily="Arial, Helvetica, sans-serif" fontSize="14" fontWeight="bold" fill="#8a6a1e">Satisfaction</text>
              </g>

              {/* Reputation */}
              <g transform="translate(340, 282)">
                <polygon points="0,0 1.76,4.57 6.66,4.84 2.85,7.93 4.11,12.66 0,10.00 -4.11,12.66 -2.85,7.93 -6.66,4.84 -1.76,4.57" fill="#1b2436" transform="translate(6,0)"/>
                <polygon points="0,0 1.76,4.57 6.66,4.84 2.85,7.93 4.11,12.66 0,10.00 -4.11,12.66 -2.85,7.93 -6.66,4.84 -1.76,4.57" fill="#1b2436" transform="translate(23,0)"/>
                <polygon points="0,0 1.76,4.57 6.66,4.84 2.85,7.93 4.11,12.66 0,10.00 -4.11,12.66 -2.85,7.93 -6.66,4.84 -1.76,4.57" fill="#1b2436" transform="translate(40,0)"/>
                <polygon points="0,0 1.76,4.57 6.66,4.84 2.85,7.93 4.11,12.66 0,10.00 -4.11,12.66 -2.85,7.93 -6.66,4.84 -1.76,4.57" fill="#1b2436" transform="translate(57,0)"/>
                <polygon points="0,0 1.76,4.57 6.66,4.84 2.85,7.93 4.11,12.66 0,10.00 -4.11,12.66 -2.85,7.93 -6.66,4.84 -1.76,4.57" fill="#1b2436" transform="translate(74,0)"/>
                <text x="96" y="11" fontFamily="Arial, Helvetica, sans-serif" fontSize="14" fontWeight="bold" fill="#8a6a1e">Reputation</text>
              </g>

              {/* Service */}
              <g transform="translate(615, 260)">
                <polygon points="0,0 1.76,4.57 6.66,4.84 2.85,7.93 4.11,12.66 0,10.00 -4.11,12.66 -2.85,7.93 -6.66,4.84 -1.76,4.57" fill="#1b2436" transform="translate(6,0)"/>
                <polygon points="0,0 1.76,4.57 6.66,4.84 2.85,7.93 4.11,12.66 0,10.00 -4.11,12.66 -2.85,7.93 -6.66,4.84 -1.76,4.57" fill="#1b2436" transform="translate(23,0)"/>
                <polygon points="0,0 1.76,4.57 6.66,4.84 2.85,7.93 4.11,12.66 0,10.00 -4.11,12.66 -2.85,7.93 -6.66,4.84 -1.76,4.57" fill="#1b2436" transform="translate(40,0)"/>
                <polygon points="0,0 1.76,4.57 6.66,4.84 2.85,7.93 4.11,12.66 0,10.00 -4.11,12.66 -2.85,7.93 -6.66,4.84 -1.76,4.57" fill="#1b2436" transform="translate(57,0)"/>
                <polygon points="0,0 1.76,4.57 6.66,4.84 2.85,7.93 4.11,12.66 0,10.00 -4.11,12.66 -2.85,7.93 -6.66,4.84 -1.76,4.57" fill="#1b2436" transform="translate(74,0)"/>
                <text x="96" y="11" fontFamily="Arial, Helvetica, sans-serif" fontSize="14" fontWeight="bold" fill="#8a6a1e">Service</text>
              </g>

              {/* Quality */}
              <g transform="translate(615, 282)">
                <polygon points="0,0 1.76,4.57 6.66,4.84 2.85,7.93 4.11,12.66 0,10.00 -4.11,12.66 -2.85,7.93 -6.66,4.84 -1.76,4.57" fill="#1b2436" transform="translate(6,0)"/>
                <polygon points="0,0 1.76,4.57 6.66,4.84 2.85,7.93 4.11,12.66 0,10.00 -4.11,12.66 -2.85,7.93 -6.66,4.84 -1.76,4.57" fill="#1b2436" transform="translate(23,0)"/>
                <polygon points="0,0 1.76,4.57 6.66,4.84 2.85,7.93 4.11,12.66 0,10.00 -4.11,12.66 -2.85,7.93 -6.66,4.84 -1.76,4.57" fill="#1b2436" transform="translate(40,0)"/>
                <polygon points="0,0 1.76,4.57 6.66,4.84 2.85,7.93 4.11,12.66 0,10.00 -4.11,12.66 -2.85,7.93 -6.66,4.84 -1.76,4.57" fill="#1b2436" transform="translate(57,0)"/>
                <polygon points="0,0 1.76,4.57 6.66,4.84 2.85,7.93 4.11,12.66 0,10.00 -4.11,12.66 -2.85,7.93 -6.66,4.84 -1.76,4.57" fill="#1b2436" transform="translate(74,0)"/>
                <text x="96" y="11" fontFamily="Arial, Helvetica, sans-serif" fontSize="14" fontWeight="bold" fill="#8a6a1e">Quality</text>
              </g>

              {/* Click to Verify Button in Desktop SVG: Default White BG -> Solid Gold on hover */}
              <g className="verify-btn-group cursor-pointer hidden md:block">
                <rect 
                  x="975" 
                  y="256" 
                  width="170" 
                  height="42" 
                  rx="6" 
                  className="verify-rect"
                />
                <text 
                  x="1060" 
                  y="282.5" 
                  textAnchor="middle" 
                  fontFamily="Arial, Helvetica, sans-serif" 
                  fontSize="15" 
                  fontWeight="bold" 
                  className="verify-text"
                >
                  Click to Verify
                </text>
              </g>
            </svg>

            {/* Continuous Shimmer Light Sheen Sweep Effect across the Certificate */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[24px]">
              <div 
                className="w-1/2 h-full absolute top-0 -left-1/2 bg-gradient-to-r from-transparent via-white/45 to-transparent transform -skew-x-25"
                style={{
                  animation: 'goldShimmer 3.2s cubic-bezier(0.4, 0, 0.2, 1) infinite'
                }}
              />
            </div>
          </div>
        </div>

        {/* Dedicated Mobile Click to Verify Button (Exact Match to Mobile Screenshot) */}
        <div className="block md:hidden mt-6 text-center">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center bg-white hover:bg-[#c8924b] text-[#b88936] hover:text-white border border-[#c8924b] px-8 py-3 rounded-md text-sm font-bold tracking-wide transition-all shadow-xs active:scale-96 cursor-pointer"
          >
            Click to Verify
          </button>
        </div>

      </div>

      <VerificationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
};
