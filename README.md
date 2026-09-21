# Azim Crafts — Handcrafted Heritage & Vintage Collectibles

High-performance luxury e-commerce platform built with React, Vite, Tailwind CSS, Stripe Live international payment processing, and Cloudflare Pages Serverless Edge Functions with Cloudflare D1 SQL database.

## Monorepo Architecture

```
Azim Crafts/
├── frontend/                     # Client-Side Application (React 18 + Vite)
│   ├── public/                   # High-resolution videos, product photography, icons
│   ├── src/                      # Pages, Components, State Contexts, Services
│   ├── index.html                # Entry HTML with Stripe Elements & Razorpay SDKs
│   ├── vite.config.js            # Vite bundler & local API development middleware
│   ├── tailwind.config.js        # Luxury styling theme and typography
│   ├── postcss.config.js         # PostCSS configuration
│   └── package.json              # Frontend dependencies
│
├── backend/                      # Serverless Edge Backend & Database
│   ├── api/                      # Cloudflare Edge serverless API endpoints
│   │   ├── create-payment-intent.js # Stripe Live Card Payment Handler (USD)
│   │   ├── auth.js               # Registration, Login, 15-min Password Reset
│   │   ├── orders.js             # Order processing & status management
│   │   ├── products.js           # Products CRUD API
│   │   ├── coupons.js            # Discount coupon engine (e.g., FIRST15)
│   │   ├── messages.js           # Customer inquiries & contact form
│   │   ├── upload.js             # Media/Image upload handler (Cloudflare R2)
│   │   └── settings.js           # Store announcements & configuration
│   ├── database/
│   │   ├── schema.sql            # Cloudflare D1 SQL Schema (8 Tables)
│   │   └── .local_db/            # Local development JSON persistence
│   ├── wrangler.toml             # Cloudflare D1 and Pages configuration
│   └── README.md                 # Detailed backend documentation
│
├── functions/                    # Cloudflare Pages Serverless Functions mirror
├── package.json                  # Root monorepo workspace orchestrator
└── README.md                     # Project documentation
```

## Quick Start (Development)

To run the full-stack development environment:

```bash
npm run dev
```

The frontend and local backend server will start at:
👉 **`http://localhost:3000/`**

## Production Build

To build the production bundle:

```bash
npm run build
```

The compiled assets will be generated in `frontend/dist`.

## Payment Gateways
- **Credit / Debit Cards (Stripe Live):** Accepts global cards (Visa, MasterCard, AMEX, Discover, JCB) in USD with zero currency conversion friction.
- **PayPal:** Official PayPal Smart Buttons with 100% Buyer Protection.
- **International Bank Transfer:** Direct SWIFT/BIC & IBAN wire routing details.
