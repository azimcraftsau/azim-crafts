# Azim Crafts — Serverless Edge Backend & Database

This folder contains the serverless edge backend API and database architecture powering Azim Crafts.

## Architecture Overview
The backend runs as globally distributed Cloudflare Pages Edge Functions with zero cold starts, automatic 256-bit SSL encryption, and high-performance SQL persistence.

## Directory Structure
```
backend/
├── api/                          # Serverless API Endpoints
│   ├── create-payment-intent.js  # Stripe Live Payment Intent creation (USD)
│   ├── auth.js                   # Customer Registration, Login, and 15-Min Password Resets
│   ├── orders.js                 # Orders Management, Tracking, and Fulfillment
│   ├── products.js               # Products CRUD & Catalog Synchronization
│   ├── coupons.js                # Promo & Discount Code Engine (FIRST15, etc.)
│   ├── messages.js               # Customer Inquiries & Contact Forms
│   ├── settings.js               # Store Announcements & Configuration
│   └── upload.js                 # Media/Image Uploads via Cloudflare R2
├── database/
│   ├── schema.sql                # Cloudflare D1 SQL Database Schema (8 Tables)
│   └── .local_db/                # Local Development JSON Database Store
└── wrangler.toml                 # Cloudflare D1 Binding & Edge Deployment Config
```

## API Endpoints Reference

### 1. Payment Processing (`/api/create-payment-intent`)
- **Method:** `POST`
- **Payload:** `{ amount: Number, currency: "usd", customerEmail: String, customerName: String, shippingAddress: String }`
- **Description:** Calls the Stripe Live API with the configured secret key, creates an encrypted `PaymentIntent`, and returns the `clientSecret` to the frontend.

### 2. Authentication (`/api/auth`)
- **Actions:**
  - `POST /api/auth?action=register` — Register a new customer account with phone country code and hashed credentials.
  - `POST /api/auth?action=login` — Authenticate customer and issue session token.
  - `POST /api/auth?action=forgot-password` — Generate a 15-minute secure single-use password reset link.
  - `POST /api/auth?action=reset-password` — Set a new password using the validated token.

### 3. Orders (`/api/orders`)
- **Methods:** `GET`, `POST`, `PUT`, `DELETE`
- **Description:** Manages order placement, status updates (`Processing`, `Shipped`, `Delivered`), and DHL Express tracking numbers.

### 4. Products (`/api/products`)
- **Methods:** `GET`, `POST`, `PUT`, `DELETE`
- **Description:** Retrieves all active products, supports administrative product updates, image associations, and pricing adjustments.

## Database Deployment
To deploy or update the Cloudflare D1 SQL database in production:
```bash
npx wrangler d1 execute vtm-db --file=./backend/database/schema.sql
```
