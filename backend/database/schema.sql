-- Cloudflare D1 Database Schema for Vintage To Modern Craft
-- Run in Cloudflare Dashboard D1 Console or via Wrangler: npx wrangler d1 execute vtm-db --file=./schema.sql

-- 1. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  product_number INTEGER,
  title TEXT NOT NULL,
  handle TEXT,
  price REAL NOT NULL,
  regular_price REAL,
  currency TEXT DEFAULT 'USD',
  category TEXT NOT NULL,
  category_name TEXT,
  is_sold_out INTEGER DEFAULT 0,
  is_on_sale INTEGER DEFAULT 0,
  badge TEXT,
  image TEXT,
  hover_image TEXT,
  images TEXT,
  videos TEXT,
  vendor TEXT DEFAULT 'Vintage To Modern Craft',
  description TEXT,
  specifications TEXT,
  perfect_for TEXT,
  dimensions TEXT,
  weight TEXT,
  materials TEXT,
  shipping_info TEXT,
  disclaimer TEXT,
  rating REAL DEFAULT 5.0,
  reviews_count INTEGER DEFAULT 10,
  sizes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  customer TEXT NOT NULL,
  customer_email TEXT,
  country TEXT DEFAULT 'Australia',
  shipping_address TEXT,
  phone TEXT,
  items TEXT NOT NULL,
  items_list TEXT,
  total REAL NOT NULL,
  status TEXT DEFAULT 'Processing',
  payment TEXT DEFAULT 'Paid',
  tracking TEXT,
  carrier TEXT DEFAULT 'DHL Express',
  date TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. COUPONS TABLE
CREATE TABLE IF NOT EXISTS coupons (
  id INTEGER PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  type TEXT DEFAULT 'percentage',
  value REAL NOT NULL,
  description TEXT,
  is_active INTEGER DEFAULT 1,
  uses_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  date TEXT,
  is_read INTEGER DEFAULT 0,
  is_replied INTEGER DEFAULT 0,
  priority TEXT DEFAULT 'medium',
  reply_text TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. STORE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS store_settings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  announcement_text TEXT DEFAULT 'Free Worldwide Express Shipping Over $200 USD',
  free_shipping_threshold REAL DEFAULT 200,
  store_email TEXT DEFAULT 'info@vintagetomodern.com',
  whatsapp_number TEXT DEFAULT '+61 400 000 000',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. BANNER SLIDES TABLE (Desktop & Mobile Videos)
CREATE TABLE IF NOT EXISTS banner_slides (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  badge_text TEXT,
  btn_text TEXT,
  target_product_id TEXT,
  desktop_video TEXT NOT NULL,
  mobile_video TEXT NOT NULL,
  active INTEGER DEFAULT 1,
  slide_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. USERS / CUSTOMER ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'customer',
  addresses TEXT DEFAULT '[]',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. PASSWORD RESETS TABLE (For 15-Minute Secure Token Reset Links)
CREATE TABLE IF NOT EXISTS password_resets (
  email TEXT PRIMARY KEY,
  token TEXT NOT NULL,
  expires INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Initialize default store settings
INSERT OR IGNORE INTO store_settings (id, announcement_text, free_shipping_threshold)
VALUES ('main', 'Free Worldwide Express Shipping Over $200 USD', 200);
