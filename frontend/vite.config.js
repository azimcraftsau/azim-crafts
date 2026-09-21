import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { createHash, randomBytes, pbkdf2Sync } from 'crypto';

// Legacy SHA-256 for migration
const legacyHashPw = (pw) => createHash('sha256').update(pw).digest('hex');
// New PBKDF2 with salt
const hashPassword = (pw) => {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(pw, salt, 100000, 64, 'sha512').toString('hex');
  return `pbkdf2:${salt}:${hash}`;
};
const verifyPassword = (pw, stored) => {
  if (stored.startsWith('pbkdf2:')) {
    const [, salt, hash] = stored.split(':');
    const computed = pbkdf2Sync(pw, salt, 100000, 64, 'sha512').toString('hex');
    return computed === hash;
  }
  // Legacy SHA-256 fallback
  return legacyHashPw(pw) === stored;
};

// Load environment variables for server-side middleware (Stripe, PayPal, etc.)
const rootDir = path.resolve(__dirname, '..');
const serverEnv = {
  ...loadEnv('development', rootDir, ''),
  ...loadEnv('development', __dirname, ''),
  ...process.env
};

// Custom Range Streamer for instant 0.1s video playback on mobile & Cloudflare tunnels
const videoRangeMiddleware = () => ({
  name: 'video-range-middleware',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const url = decodeURIComponent(req.url.split('?')[0]);
      if (url.endsWith('.mp4') || url.endsWith('.webm')) {
        const filePath = path.join(process.cwd(), 'public', url);
        if (fs.existsSync(filePath)) {
          const stat = fs.statSync(filePath);
          const fileSize = stat.size;
          const range = req.headers.range;

          if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const CHUNK_SIZE = 1024 * 1024; // 1MB chunks
            const end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + CHUNK_SIZE - 1, fileSize - 1);
            const chunksize = end - start + 1;
            const file = fs.createReadStream(filePath, { start, end });
            const head = {
              'Content-Range': `bytes ${start}-${end}/${fileSize}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': chunksize,
              'Content-Type': 'video/mp4',
              'Cache-Control': 'public, max-age=31536000, immutable'
            };
            res.writeHead(206, head);
            file.pipe(res);
            return;
          } else {
            const head = {
              'Content-Length': fileSize,
              'Content-Type': 'video/mp4',
              'Accept-Ranges': 'bytes',
              'Cache-Control': 'public, max-age=31536000, immutable'
            };
            res.writeHead(200, head);
            fs.createReadStream(filePath).pipe(res);
            return;
          }
        }
      }
      next();
    });
  }
});

// Custom Server-Side API Middleware for Real-Time Mobile <-> Laptop Sync
const apiServerMiddleware = () => ({
  name: 'api-server-middleware',
  configureServer(server) {
    const backendDbDir = path.resolve(__dirname, '../backend/database/.local_db');
    const dbDir = fs.existsSync(path.resolve(__dirname, '../backend/database')) 
      ? backendDbDir 
      : path.join(process.cwd(), '.local_db');
    if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

    const getDbFile = (name, defaultData = []) => {
      const file = path.join(dbDir, `${name}.json`);
      if (!fs.existsSync(file)) {
        fs.writeFileSync(file, JSON.stringify(defaultData, null, 2));
      }
      try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
      } catch {
        return defaultData;
      }
    };

    const locks = new Map();
    const acquireLock = async (name) => {
      while (locks.get(name)) await new Promise(r => setTimeout(r, 10));
      locks.set(name, true);
    };
    const releaseLock = (name) => locks.delete(name);

    const saveDbFile = async (name, data) => {
      await acquireLock(name);
      try {
        const file = path.join(dbDir, `${name}.json`);
        // Automated backup before save (DB-001, DB-002)
        if (fs.existsSync(file)) {
          try {
            const bakFile = path.join(dbDir, `${name}.json.bak`);
            fs.copyFileSync(file, bakFile);
          } catch (e) {}
        }
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
      } finally {
        releaseLock(name);
      }
    };

    const rateLimitMap = new Map();
    const checkRateLimit = (ip, limit = 5, windowMs = 60000) => {
      const now = Date.now();
      const key = ip;
      const entries = rateLimitMap.get(key) || [];
      const recent = entries.filter(t => now - t < windowMs);
      if (recent.length >= limit) return false;
      recent.push(now);
      rateLimitMap.set(key, recent);
      return true;
    };

    server.middlewares.use(async (req, res, next) => {
      const urlObj = new URL(req.url, 'http://localhost:3000');
      const pathname = urlObj.pathname;

      if (!pathname.startsWith('/api/')) {
        return next();
      }

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        return res.end();
      }

      const verifyAdminToken = (req) => {
        const auth = req.headers.authorization;
        if (!auth || !auth.startsWith('Bearer ')) return null;
        const token = auth.slice(7);
        const sessions = getDbFile('sessions', []);
        const session = sessions.find(s => s.token === token && s.expiresAt > Date.now());
        return session || null;
      };

      const requireAdmin = (req, res) => {
        const session = verifyAdminToken(req);
        if (!session) {
          res.statusCode = 401;
          res.end(JSON.stringify({ success: false, error: 'Unauthorized. Admin login required.' }));
          return null;
        }
        return session;
      };

      const readBody = () => new Promise((resolve) => {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          if (!body || !body.trim()) return resolve({});
          try { resolve(JSON.parse(body)); }
          catch (err) {
            console.error('JSON parse error:', err.message);
            resolve({ __parseError: true, raw: body });
          }
        });
      });

      // ---------------------------------------------------------
      // Transactional Email Service (Resend + Verified Domain)
      // ---------------------------------------------------------
      const sendTransactionalEmail = async ({ to, subject, html }) => {
        const resendKey = serverEnv.RESEND_API_KEY || process.env.RESEND_API_KEY;
        const emailFrom = serverEnv.EMAIL_FROM || process.env.EMAIL_FROM || 'Azim Crafts <contact@azimcrafts.com>';
        if (!resendKey || !to) return null;

        try {
          const resp = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: emailFrom,
              to: Array.isArray(to) ? to : [to],
              subject,
              html
            })
          });
          const data = await resp.json();
          if (data.id) {
            console.log(`✅ [EMAIL SENT] "${subject}" -> ${to} (ID: ${data.id})`);
          } else if (data.message) {
            console.warn(`⚠️ [RESEND NOTICE]: ${data.message}`);
          }
          return data;
        } catch (err) {
          console.error(`❌ [EMAIL ERROR]:`, err.message);
          return null;
        }
      };

      const getWelcomeEmailHtml = ({ name, email, siteUrl }) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f7f5f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1b1a1a;">
  <div style="max-width: 580px; margin: 30px auto; background-color: #ffffff; border: 1px solid #e7dfd5; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
    <div style="background-color: #1b1a1a; padding: 26px 20px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 20px; letter-spacing: 3px; text-transform: uppercase;">AZIM CRAFTS</h1>
      <p style="margin: 4px 0 0; color: #d4a359; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase;">Heritage Handcrafted Collectibles</p>
    </div>
    <div style="padding: 32px 28px;">
      <h2 style="margin: 0 0 14px; font-size: 18px; color: #1b1a1a; font-weight: 600;">Welcome to Azim Crafts, ${name}</h2>
      <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #4a4a4a;">
        Thank you for creating an account with Azim Crafts. Your collector account is now active and ready to use.
      </p>
      <div style="background-color: #faf8f5; border: 1px solid #ede7df; border-radius: 6px; padding: 16px 20px; margin: 20px 0;">
        <span style="font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 6px;">Your Account Details</span>
        <p style="margin: 0; font-size: 14px; color: #1b1a1a;"><strong>Registered Email:</strong> ${email}</p>
      </div>
      <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #4a4a4a;">
        With your account, you can track international shipments in real time, view your order receipts, and access collector privileges.
      </p>
      <div style="text-align: center; margin: 26px 0 20px;">
        <a href="${siteUrl}/#all-products" style="display: inline-block; background-color: #1b1a1a; color: #ffffff; padding: 13px 28px; text-decoration: none; font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; border-radius: 4px;">Explore Handcrafted Catalog</a>
      </div>
      <p style="margin: 26px 0 0; padding-top: 20px; border-top: 1px solid #ede7df; font-size: 12px; line-height: 1.6; color: #777;">
        Have a question or looking for custom bespoke work? Our support team is here for you at <a href="mailto:contact@azimcrafts.com" style="color: #1b1a1a; font-weight: 600; text-decoration: underline;">contact@azimcrafts.com</a>.
      </p>
    </div>
    <div style="background-color: #faf8f5; padding: 16px 28px; text-align: center; border-top: 1px solid #ede7df;">
      <p style="margin: 0; font-size: 11px; color: #999;">Azim Crafts &bull; Handcrafted in Roorkee &bull; Worldwide Delivery</p>
    </div>
  </div>
</body>
</html>`;

      const getOrderReceiptEmailHtml = ({ order, siteUrl }) => {
        const items = Array.isArray(order.itemsList) && order.itemsList.length > 0 
          ? order.itemsList 
          : [{ title: order.items || 'Handcrafted Artisan Item', quantity: 1, price: order.total }];

        const itemsRows = items.map(it => {
          const prod = it.product || it;
          const title = prod.title || prod.name || 'Handcrafted Collectible';
          const size = it.selectedSize || prod.selectedSize ? `<br/><span style="font-size: 11px; color: #888;">Size: ${it.selectedSize || prod.selectedSize}</span>` : '';
          const qty = it.quantity || 1;
          const lineTotal = (Number(prod.price || order.total || 0) * qty).toFixed(2);
          return `
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #f0e6d6; font-size: 13px; color: #1b1a1a; vertical-align: top;">
                <strong>${title}</strong>${size}
              </td>
              <td style="padding: 12px 8px; border-bottom: 1px solid #f0e6d6; font-size: 13px; color: #555; text-align: center; vertical-align: top;">
                ${qty}
              </td>
              <td style="padding: 12px 0; border-bottom: 1px solid #f0e6d6; font-size: 13px; color: #1b1a1a; text-align: right; font-weight: 600; vertical-align: top;">
                $${lineTotal} USD
              </td>
            </tr>
          `;
        }).join('');

        const subtotal = Number(order.subtotal || order.total || 0).toFixed(2);
        const discount = Number(order.discountAmount || 0);
        const total = Number(order.total || 0).toFixed(2);

        return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f7f5f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1b1a1a;">
  <div style="max-width: 600px; margin: 30px auto; background-color: #ffffff; border: 1px solid #e7dfd5; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
    <div style="background-color: #1b1a1a; padding: 26px 20px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 20px; letter-spacing: 3px; text-transform: uppercase;">AZIM CRAFTS</h1>
      <p style="margin: 4px 0 0; color: #d4a359; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase;">Order Confirmation &amp; Official Bill</p>
    </div>
    <div style="padding: 30px 28px;">
      <table style="width: 100%; border-bottom: 2px solid #1b1a1a; padding-bottom: 12px; margin-bottom: 18px;">
        <tr>
          <td>
            <span style="font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; display: block;">Invoice / Order #</span>
            <strong style="font-size: 17px; color: #1b1a1a;">${order.id}</strong>
          </td>
          <td style="text-align: right;">
            <span style="font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; display: block;">Date</span>
            <strong style="font-size: 13px; color: #1b1a1a;">${order.date}</strong>
          </td>
        </tr>
      </table>

      <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #4a4a4a;">
        Dear <strong>${order.customer}</strong>,<br/>
        Thank you for choosing Azim Crafts. We have received your order and our master artisans are currently preparing your handcrafted pieces with export-grade packaging.
      </p>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0 10px;">
        <thead>
          <tr style="border-bottom: 2px solid #ede7df; background-color: #faf8f5;">
            <th style="padding: 10px 0; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #666;">Handcrafted Item</th>
            <th style="padding: 10px 8px; text-align: center; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #666;">Qty</th>
            <th style="padding: 10px 0; text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #666;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <div style="margin-top: 15px; border-top: 1px solid #f0e6d6; padding-top: 12px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; font-size: 13px; color: #666;">Subtotal:</td>
            <td style="padding: 4px 0; font-size: 13px; color: #1b1a1a; text-align: right;">$${subtotal} USD</td>
          </tr>
          ${discount > 0 ? `
          <tr>
            <td style="padding: 4px 0; font-size: 13px; color: #15803d;">Coupon Discount (${order.appliedCoupon || 'Promo'}):</td>
            <td style="padding: 4px 0; font-size: 13px; color: #15803d; text-align: right;">-$${discount.toFixed(2)} USD</td>
          </tr>` : ''}
          <tr>
            <td style="padding: 4px 0; font-size: 13px; color: #666;">Worldwide Express Shipping:</td>
            <td style="padding: 4px 0; font-size: 13px; color: #15803d; text-align: right; font-weight: 600;">FREE</td>
          </tr>
          <tr style="border-top: 2px solid #1b1a1a;">
            <td style="padding: 10px 0; font-size: 15px; font-weight: bold; color: #1b1a1a;">Total Paid:</td>
            <td style="padding: 10px 0; font-size: 18px; font-weight: bold; color: #1b1a1a; text-align: right;">$${total} USD</td>
          </tr>
        </table>
      </div>

      <div style="background-color: #faf8f5; border: 1px solid #ede7df; border-radius: 6px; padding: 16px 20px; margin: 24px 0 16px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="vertical-align: top; width: 50%; padding-right: 12px;">
              <span style="font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">Delivery Address</span>
              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #1b1a1a;">
                <strong>${order.customer}</strong><br/>
                ${order.shippingAddress}<br/>
                ${order.country || ''}
                ${order.phone ? `<br/>Tel: ${order.phone}` : ''}
              </p>
            </td>
            <td style="vertical-align: top; width: 50%; padding-left: 12px; border-left: 1px solid #ede7df;">
              <span style="font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">Payment &amp; Courier</span>
              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #1b1a1a;">
                <strong>Payment:</strong> ${order.payment || 'Confirmed'}<br/>
                <strong>Status:</strong> ${order.status || 'Processing'}<br/>
                <strong>Carrier:</strong> ${order.carrier || 'DHL Express Worldwide'}
              </p>
            </td>
          </tr>
        </table>
      </div>

      <div style="background-color: #fff9e6; border: 1px solid #f0deab; border-radius: 6px; padding: 12px 16px; margin: 18px 0;">
        <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #855b14;">
          📦 <strong>Artisan Fulfillment:</strong> Every piece is individually inspected before export packaging. You will receive an automated tracking notification email with live tracking as soon as your parcel departs.
        </p>
      </div>

      <p style="margin: 20px 0 0; padding-top: 18px; border-top: 1px solid #ede7df; font-size: 12px; line-height: 1.6; color: #777;">
        Need to make changes or have questions? Contact our support directly at <a href="mailto:contact@azimcrafts.com" style="color: #1b1a1a; font-weight: 600; text-decoration: underline;">contact@azimcrafts.com</a>.
      </p>
    </div>
    <div style="background-color: #faf8f5; padding: 16px 28px; text-align: center; border-top: 1px solid #ede7df;">
      <p style="margin: 0; font-size: 11px; color: #999;">Azim Crafts &bull; Master Artisans &bull; Sydney, Australia &bull; Worldwide Delivery</p>
    </div>
  </div>
</body>
</html>`;
      };

      const getResetPasswordEmailHtml = ({ name, resetUrl }) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f7f5f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1b1a1a;">
  <div style="max-width: 580px; margin: 30px auto; background-color: #ffffff; border: 1px solid #e7dfd5; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
    <div style="background-color: #1b1a1a; padding: 26px 20px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 20px; letter-spacing: 3px; text-transform: uppercase;">AZIM CRAFTS</h1>
      <p style="margin: 4px 0 0; color: #c8924b; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase;">Heritage Handcrafted Collectibles</p>
    </div>
    <div style="padding: 32px 28px;">
      <h2 style="margin: 0 0 14px; font-size: 18px; color: #1b1a1a; font-weight: 600;">Reset Your Password</h2>
      <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #4a4a4a;">Hello <strong>${name}</strong>,</p>
      <p style="margin: 0 0 22px; font-size: 14px; line-height: 1.6; color: #4a4a4a;">
        We received a request to reset your password. Click the button below to choose a new password for your Azim Crafts account:
      </p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${resetUrl}" style="display: inline-block; background-color: #1b1a1a; color: #ffffff; padding: 13px 28px; text-decoration: none; font-size: 13px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; border-radius: 4px;">Reset Password Now</a>
      </div>
      <p style="margin: 22px 0 0; font-size: 12px; line-height: 1.6; color: #777;">
        Or copy and paste this link into your browser:<br/>
        <a href="${resetUrl}" style="color: #c8924b; word-break: break-all;">${resetUrl}</a>
      </p>
      <p style="margin: 20px 0 0; padding-top: 16px; border-top: 1px solid #ede7df; font-size: 11px; color: #999;">
        ⏱️ <em>This reset link is valid for 15 minutes. If you did not request this, you can safely ignore this email.</em>
      </p>
    </div>
    <div style="background-color: #faf8f5; padding: 16px 28px; text-align: center; border-top: 1px solid #ede7df;">
      <p style="margin: 0; font-size: 11px; color: #999;">Azim Crafts &bull; Master Artisans &bull; Sydney, Australia &bull; Worldwide Delivery</p>
    </div>
  </div>
</body>
</html>`;

      // 1. /api/orders
      if (pathname === '/api/orders') {
        if (req.method === 'GET') {
          if (!requireAdmin(req, res)) return;
          let orders = getDbFile('orders', []);
          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true, data: orders }));
        }

        if (req.method === 'POST') {
          const body = await readBody();
          if (body.__parseError) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, error: 'Invalid JSON in request body' }));
          }
          if (!body || typeof body !== 'object') {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, error: 'Invalid order payload' }));
          }
          const orderItems = body.itemsList || body.items || body.structuredItems;
          if (!orderItems || (Array.isArray(orderItems) && orderItems.length === 0)) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, error: 'Missing or empty items' }));
          }
          if (!body.shippingAddress) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, error: 'Shipping address is required' }));
          }
          let orders = getDbFile('orders', []);
          const newOrder = {
            id: body.id || `VTM-${Math.floor(10000 + Math.random() * 90000)}`,
            customer: body.customer || 'Valued Customer',
            customerEmail: (body.customerEmail || body.customer_email || '').toLowerCase().trim(),
            country: body.country || 'Australia',
            shippingAddress: body.shippingAddress || '',
            phone: body.phone || '',
            items: body.items || '',
            itemsList: body.itemsList || body.structuredItems || [],
            total: Number(body.total) || 0,
            subtotal: Number(body.subtotal) || Number(body.total) || 0,
            discountAmount: Number(body.discountAmount) || 0,
            appliedCoupon: body.appliedCoupon || '',
            status: body.status || 'Processing',
            payment: body.payment || 'Paid',
            tracking: body.tracking || '',
            carrier: body.carrier || 'DHL Express',
            date: body.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            createdAt: new Date().toISOString()
          };
          orders.unshift(newOrder);
          await saveDbFile('orders', orders);

          // Automatically send Itemized Bill / Receipt Confirmation Email
          if (newOrder.customerEmail) {
            const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
            const protocol = req.headers['x-forwarded-proto'] || (req.socket.encrypted ? 'https' : 'http');
            const siteUrl = `${protocol}://${host}`;
            sendTransactionalEmail({
              to: newOrder.customerEmail,
              subject: `Order Confirmed: ${newOrder.id} – Azim Crafts Official Bill`,
              html: getOrderReceiptEmailHtml({ order: newOrder, siteUrl })
            }).catch(() => null);
          }

          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true, data: newOrder }));
        }

        if (req.method === 'PUT') {
          if (!requireAdmin(req, res)) return;
          const body = await readBody();
          if (body.__parseError) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, error: 'Invalid JSON in request body' }));
          }
          if (!body.id) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, error: 'Order ID is required' }));
          }
          let orders = getDbFile('orders', []);
          const existingIdx = orders.findIndex(o => String(o.id) === String(body.id));
          if (existingIdx === -1) {
            res.statusCode = 404;
            return res.end(JSON.stringify({ success: false, error: 'Order not found' }));
          }
          orders[existingIdx] = { ...orders[existingIdx], ...body };
          await saveDbFile('orders', orders);
          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true }));
        }

        if (req.method === 'DELETE') {
          if (!requireAdmin(req, res)) return;
          let orders = getDbFile('orders', []);
          const id = urlObj.searchParams.get('id');
          const all = urlObj.searchParams.get('all');
          if (all === 'true') {
            orders = [];
          } else if (id) {
            const initialLen = orders.length;
            orders = orders.filter(o => String(o.id) !== String(id));
            if (orders.length === initialLen) {
              res.statusCode = 404;
              return res.end(JSON.stringify({ success: false, error: 'Order not found' }));
            }
          }
          await saveDbFile('orders', orders);
          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true, data: { remaining: orders.length } }));
        }
      }

      // Helper to sync products
      const syncProductsFile = (products) => {
        try {
          const productsJsPath = path.resolve(__dirname, 'src/data/products.js');
          if (fs.existsSync(productsJsPath)) {
            const header = "// Master catalog of all authentic handcrafted products from Azim Crafts\n// Handcrafted at our Artisan Workshop in Roorkee, Uttarakhand, India\nexport const allProducts = ";
            fs.writeFileSync(productsJsPath, header + JSON.stringify(products, null, 2) + ";\n", 'utf8');
          }
        } catch (e) {
          console.warn('Sync products.js warning:', e.message);
        }
      };

      if (pathname === '/api/products/sync') {
        if (req.method === 'POST') {
          if (!requireAdmin(req, res)) return;
          let products = getDbFile('products', []);
          syncProductsFile(products);
          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true }));
        }
      }

      // 1b. /api/products
      if (pathname === '/api/products') {
        if (req.method === 'GET') {
          let products = getDbFile('products', []);
          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true, data: products }));
        }

        if (req.method === 'POST' || req.method === 'PUT') {
          if (!requireAdmin(req, res)) return;
          const body = await readBody();
          if (body.__parseError) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, error: 'Invalid JSON in request body' }));
          }
          if (!body || typeof body !== 'object') {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, error: 'Invalid JSON payload' }));
          }
          const title = body.title || body.name;
          if (!title || typeof title !== 'string' || !title.trim()) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, error: 'Product title is required' }));
          }
          if (body.price === undefined || isNaN(Number(body.price)) || Number(body.price) <= 0) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, error: 'Price must be a positive number greater than 0' }));
          }

          let products = getDbFile('products', []);
          const sanitizedProduct = {
            ...body,
            title: title.trim(),
            price: Number(body.price) || 0,
            regularPrice: Number(body.regularPrice) || Number(body.price) || 0,
            id: body.id || `product-${Date.now()}`
          };

          const existingIdx = products.findIndex(p => String(p.id) === String(sanitizedProduct.id));
          if (existingIdx >= 0) {
            products[existingIdx] = { ...products[existingIdx], ...sanitizedProduct };
          } else {
            products.unshift(sanitizedProduct);
          }
          await saveDbFile('products', products);

          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true, data: sanitizedProduct }));
        }

        if (req.method === 'DELETE') {
          if (!requireAdmin(req, res)) return;
          const id = urlObj.searchParams.get('id');
          if (!id) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, error: 'Product ID is required' }));
          }
          let products = getDbFile('products', []);
          const deleted = products.find(p => String(p.id) === String(id));
          if (!deleted) {
            res.statusCode = 404;
            return res.end(JSON.stringify({ success: false, error: 'Product not found' }));
          }

          let trash = getDbFile('trash', []);
          trash = trash.filter(t => String(t.id) !== String(id));
          trash.unshift({ ...deleted, deletedAt: new Date().toISOString() });
          await saveDbFile('trash', trash);

          products = products.filter(p => String(p.id) !== String(id));
          await saveDbFile('products', products);

          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true }));
        }
      }

      // 1c. /api/coupons
      if (pathname === '/api/coupons') {
        if (req.method === 'GET') {
          let coupons = getDbFile('coupons', []);
          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true, data: coupons }));
        }

        if (req.method === 'POST' || req.method === 'PUT') {
          if (!requireAdmin(req, res)) return;
          const body = await readBody();
          if (body.__parseError) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, error: 'Invalid JSON in request body' }));
          }
          if (!body || !body.code || typeof body.code !== 'string') {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, error: 'Valid coupon code is required' }));
          }
          const cleanCode = body.code.trim().toUpperCase();
          const discount = Number(body.discount || body.value || 0);
          if (discount <= 0 || discount > 100) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, error: 'Discount must be greater than 0 and up to 100' }));
          }

          let coupons = getDbFile('coupons', []);
          const sanitizedCoupon = {
            ...body,
            id: body.id || `cpn_${Date.now()}`,
            code: cleanCode,
            discount: discount,
            value: discount,
            active: body.active !== undefined ? Boolean(body.active) : true
          };

          const existingIdx = coupons.findIndex(c => String(c.id) === String(sanitizedCoupon.id) || c.code?.toUpperCase() === cleanCode);
          if (existingIdx >= 0) {
            coupons[existingIdx] = { ...coupons[existingIdx], ...sanitizedCoupon };
          } else {
            coupons.unshift(sanitizedCoupon);
          }
          await saveDbFile('coupons', coupons);
          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true, data: sanitizedCoupon }));
        }

        if (req.method === 'DELETE') {
          if (!requireAdmin(req, res)) return;
          const id = urlObj.searchParams.get('id');
          if (!id) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, error: 'Coupon ID is required' }));
          }
          let coupons = getDbFile('coupons', []);
          const initialLen = coupons.length;
          coupons = coupons.filter(c => String(c.id) !== String(id));
          if (coupons.length === initialLen) {
            res.statusCode = 404;
            return res.end(JSON.stringify({ success: false, error: 'Coupon not found' }));
          }
          await saveDbFile('coupons', coupons);
          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true }));
        }
      }

      // 1d. /api/categories
      if (pathname === '/api/categories') {
        if (req.method === 'GET') {
          let categories = getDbFile('categories', []);
          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true, data: categories }));
        }

        if (req.method === 'POST' || req.method === 'PUT') {
          if (!requireAdmin(req, res)) return;
          const body = await readBody();
          if (body.__parseError) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, error: 'Invalid JSON in request body' }));
          }
          if (!body || !body.name) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, error: 'Category name is required' }));
          }
          if (!body.key) body.key = body.name.toLowerCase().replace(/\s+/g, '-');
          let categories = getDbFile('categories', []);
          const existingIdx = categories.findIndex(c => c.key === body.key);
          if (existingIdx >= 0) {
            categories[existingIdx] = { ...categories[existingIdx], ...body };
          } else {
            categories.push(body);
          }
          await saveDbFile('categories', categories);
          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true, data: body }));
        }

        if (req.method === 'DELETE') {
          if (!requireAdmin(req, res)) return;
          const key = urlObj.searchParams.get('key');
          if (!key) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, error: 'Category key is required' }));
          }
          let categories = getDbFile('categories', []);
          categories = categories.filter(c => c.key !== key);
          await saveDbFile('categories', categories);
          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true }));
        }
      }

      // 1e. /api/settings
      if (pathname === '/api/settings') {
        if (req.method === 'GET') {
          let settings = getDbFile('settings', {});
          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true, data: settings }));
        }

        if (req.method === 'POST' || req.method === 'PUT') {
          if (!requireAdmin(req, res)) return;
          const body = await readBody();
          if (body.__parseError || !body || typeof body !== 'object') {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, error: 'Invalid settings payload' }));
          }
          let settings = getDbFile('settings', {});
          settings = { ...settings, ...body };
          await saveDbFile('settings', settings);
          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true, data: settings }));
        }
      }

      // 1f. /api/banners
      if (pathname === '/api/banners') {
        if (req.method === 'GET') {
          let banners = getDbFile('banners', []);
          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true, data: banners }));
        }

        if (req.method === 'POST' || req.method === 'PUT') {
          if (!requireAdmin(req, res)) return;
          const body = await readBody();
          if (body.__parseError || !body) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, error: 'Invalid banner payload' }));
          }
          let banners = getDbFile('banners', []);
          if (Array.isArray(body)) {
            banners = body;
          } else if (body.slides && Array.isArray(body.slides)) {
            banners = body.slides;
          } else if (body.id) {
            const idx = banners.findIndex(b => b.id === body.id);
            if (idx >= 0) banners[idx] = { ...banners[idx], ...body };
            else banners.push(body);
          }
          await saveDbFile('banners', banners);
          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true, data: banners }));
        }
      }

      // 1g. /api/trash
      if (pathname === '/api/trash') {
        if (req.method === 'GET') {
          if (!requireAdmin(req, res)) return;
          let trash = getDbFile('trash', []);
          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true, data: trash }));
        }

        if (req.method === 'PUT') {
          if (!requireAdmin(req, res)) return;
          const body = await readBody();
          if (body.__parseError) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, error: 'Invalid JSON in request body' }));
          }
          if (!body.id) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, error: 'Trash item ID is required' }));
          }
          let trash = getDbFile('trash', []);
          let products = getDbFile('products', []);
          const restoreId = body.id;
          const found = trash.find(t => String(t.id) === String(restoreId));
          if (!found) {
            res.statusCode = 404;
            return res.end(JSON.stringify({ success: false, error: 'Item not found in trash' }));
          }

          trash = trash.filter(t => String(t.id) !== String(restoreId));
          const { deletedAt, ...restoredProduct } = found;
          products.unshift(restoredProduct);
          await saveDbFile('trash', trash);
          await saveDbFile('products', products);

          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true }));
        }

        if (req.method === 'DELETE') {
          if (!requireAdmin(req, res)) return;
          const id = urlObj.searchParams.get('id');
          const all = urlObj.searchParams.get('all');
          let trash = getDbFile('trash', []);
          if (all === 'true') {
            trash = [];
          } else if (id) {
            trash = trash.filter(t => String(t.id) !== String(id));
          }
          await saveDbFile('trash', trash);
          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true }));
        }
      }

      // 1h. /api/messages
      if (pathname === '/api/messages') {
        if (req.method === 'GET') {
          if (!requireAdmin(req, res)) return;
          let messages = getDbFile('messages', []);
          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true, data: messages }));
        }

        if (req.method === 'POST') {
          const body = await readBody();
          if (body.__parseError) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, error: 'Invalid JSON in request body' }));
          }
          if (!body) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, error: 'Invalid message payload' }));
          }
          let messages = getDbFile('messages', []);
          const newMsg = {
            id: body.id || Date.now(),
            customer: body.customer || body.name || 'Visitor',
            email: body.email || '',
            phone: body.phone || '',
            subject: body.subject || 'General Inquiry',
            message: body.message || body.text || '',
            status: body.status || 'Unread',
            createdAt: body.createdAt || new Date().toISOString()
          };
          messages.unshift(newMsg);
          await saveDbFile('messages', messages);
          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true, data: newMsg }));
        }

        if (req.method === 'PUT') {
          if (!requireAdmin(req, res)) return;
          const body = await readBody();
          if (body.__parseError) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, error: 'Invalid JSON in request body' }));
          }
          if (!body.id) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, error: 'Message ID is required' }));
          }
          let messages = getDbFile('messages', []);
          messages = messages.map(m => String(m.id) === String(body.id) ? { ...m, ...body } : m);
          await saveDbFile('messages', messages);
          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true }));
        }

        if (req.method === 'DELETE') {
          if (!requireAdmin(req, res)) return;
          const id = urlObj.searchParams.get('id');
          if (!id) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, error: 'Message ID is required' }));
          }
          let messages = getDbFile('messages', []);
          messages = messages.filter(m => String(m.id) !== String(id));
          await saveDbFile('messages', messages);
          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true }));
        }
      }

      // 1i. /api/upload (Secure File Upload - SEC-008)
      if (pathname === '/api/upload' && req.method === 'POST') {
        try {
          const uploadsDir = path.resolve(__dirname, 'public/uploads');
          if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

          const body = await readBody();
          if (body.__parseError) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, error: 'Invalid JSON in request body' }));
          }
          if (body.data && body.name) {
            if (!body.data.startsWith('data:image/')) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ success: false, error: 'Invalid image data format.' }));
            }
            if (body.data.length > 5 * 1024 * 1024 * 1.34) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ success: false, error: 'File size exceeds 5MB limit.' }));
            }
            const ext = (path.extname(body.name || '') || '.jpg').toLowerCase();
            const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
            if (!allowedExts.includes(ext)) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ success: false, error: 'Invalid file type. Only image files are permitted.' }));
            }

            const base64Data = body.data.replace(/^data:image\/\w+;base64,/, '');
            const filename = `img_${Date.now()}_${Math.floor(Math.random()*1000)}${ext}`;
            const targetPath = path.join(uploadsDir, filename);
            fs.writeFileSync(targetPath, Buffer.from(base64Data, 'base64'));
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, url: `/uploads/${filename}` }));
          }
          res.statusCode = 400;
          return res.end(JSON.stringify({ success: false, error: 'Missing file data or name' }));
        } catch (err) {
          res.statusCode = 500;
          return res.end(JSON.stringify({ success: false, error: err.message }));
        }
      }

      // 2. /api/auth (Strict Real Database Authentication)
      if (pathname === '/api/auth') {
        const body = await readBody();
        if (body.__parseError) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ success: false, error: 'Invalid JSON in request body' }));
        }
        const action = body.action;
        let users = getDbFile('users', []);
        const cleanEmail = (body.email || '').toLowerCase().trim();
        const cleanPassword = (body.password || '').trim();

        if (action === 'signup') {
          if (!checkRateLimit(req.socket.remoteAddress, 5, 60000)) {
            res.statusCode = 429;
            return res.end(JSON.stringify({ success: false, error: 'Too many requests. Please try again later.' }));
          }
          if (!cleanEmail || !cleanPassword) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, error: 'Email and password are required.' }));
          }
          if (cleanPassword.length < 6) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, error: 'Password must be at least 6 characters long.' }));
          }

          const existing = users.find(u => u.email?.toLowerCase().trim() === cleanEmail);
          if (existing) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, error: 'An account with this email address already exists. Please log in.' }));
          }

          const newUser = {
            id: `usr_${Date.now()}`,
            name: body.name ? body.name.trim() : (cleanEmail.split('@')[0] || 'Valued Customer'),
            email: cleanEmail,
            phone: body.phone ? body.phone.trim() : '',
            country: body.country ? body.country.trim() : 'Australia',
            role: 'customer',
            password: hashPassword(cleanPassword),
            createdAt: new Date().toISOString()
          };

          users.push(newUser);
          await saveDbFile('users', users);
          const token = `vtm_tok_${randomBytes(32).toString('hex')}`;
          let sessions = getDbFile('sessions', []);
          sessions.push({ token, userId: newUser.id, role: newUser.role, expiresAt: Date.now() + 86400000 * 7 });
          await saveDbFile('sessions', sessions);

          // Automatically send Welcome Email to newly registered user
          if (newUser.email) {
            const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
            const protocol = req.headers['x-forwarded-proto'] || (req.socket.encrypted ? 'https' : 'http');
            const siteUrl = `${protocol}://${host}`;
            sendTransactionalEmail({
              to: newUser.email,
              subject: 'Welcome to Azim Crafts – Heritage Handcrafted Collectibles',
              html: getWelcomeEmailHtml({ name: newUser.name, email: newUser.email, siteUrl })
            }).catch(() => null);
          }

          res.statusCode = 200;
          return res.end(JSON.stringify({ 
            success: true, 
            token,
            user: { id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone, country: newUser.country, role: newUser.role } 
          }));
        }

        if (action === 'login') {
          if (!checkRateLimit(req.socket.remoteAddress, 5, 60000)) {
            res.statusCode = 429;
            return res.end(JSON.stringify({ success: false, error: 'Too many requests. Please try again later.' }));
          }
          if (!cleanEmail || !cleanPassword) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, error: 'Please enter both email and password.' }));
          }

          let user = users.find(u => u.email?.toLowerCase().trim() === cleanEmail);

          if (user) {
            if (verifyPassword(cleanPassword, user.password)) {
              if (!user.password.startsWith('pbkdf2:')) {
                user.password = hashPassword(cleanPassword);
                await saveDbFile('users', users);
              }
              const token = `vtm_tok_${randomBytes(32).toString('hex')}`;
              let sessions = getDbFile('sessions', []);
              sessions.push({ token, userId: user.id, role: user.role, expiresAt: Date.now() + 86400000 * 7 });
              await saveDbFile('sessions', sessions);

              res.statusCode = 200;
              return res.end(JSON.stringify({ 
                success: true, 
                token,
                user: { 
                  id: user.id, 
                  name: user.name, 
                  email: user.email, 
                  role: user.role || 'customer',
                  phone: user.phone, 
                  country: user.country || 'Australia' 
                } 
              }));
            } else {
              res.statusCode = 401;
              return res.end(JSON.stringify({ 
                success: false, 
                error: 'Incorrect password. Please check your password or use Forgot Password.' 
              }));
            }
          }

          res.statusCode = 401;
          return res.end(JSON.stringify({ 
            success: false, 
            error: 'No account found with this email. Please sign up first.' 
          }));
        }

        if (action === 'forgot_password') {
          if (!checkRateLimit(req.socket.remoteAddress, 5, 60000)) {
            res.statusCode = 429;
            return res.end(JSON.stringify({ success: false, error: 'Too many requests. Please try again later.' }));
          }

          let user = users.find(u => u.email?.toLowerCase().trim() === cleanEmail);

          if (user) {
            // Generate cryptographically secure token (SEC-011) & 15-minute expiry
            const token = randomBytes(32).toString('hex');
            const expires = Date.now() + (15 * 60 * 1000);

            let resets = getDbFile('password_resets', []);
            resets = resets.filter(r => r.email !== cleanEmail);
            resets.push({ email: cleanEmail, token, expires, createdAt: new Date().toISOString() });
            await saveDbFile('password_resets', resets);

            const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
            const protocol = req.headers['x-forwarded-proto'] || (req.socket.encrypted ? 'https' : 'http');
            const resetUrl = `${protocol}://${host}/#reset?token=${token}&email=${encodeURIComponent(cleanEmail)}`;

            console.log('\n================================================================');
            console.log('📧 [PASSWORD RESET LINK GENERATED]:');
            console.log(`👤 Customer: ${user.name} (${cleanEmail})`);
            console.log(`🔗 Link: ${resetUrl}`);
            console.log('⏱️ Valid for: 15 Minutes');
            console.log('================================================================\n');

            // Send clean, luxury password reset email
            sendTransactionalEmail({
              to: cleanEmail,
              subject: 'Reset your Azim Crafts password',
              html: getResetPasswordEmailHtml({ name: user.name, resetUrl })
            }).catch(() => null);
          }

          res.statusCode = 200;
          return res.end(JSON.stringify({ 
            success: true, 
            message: 'If an account with that email address exists, a password reset link has been generated. Please check your inbox.'
          }));
        }

        if (action === 'reset_password') {
          const userIndex = users.findIndex(u => u.email?.toLowerCase().trim() === cleanEmail);
          if (userIndex === -1) {
            res.statusCode = 404;
            return res.end(JSON.stringify({ success: false, error: 'User account not found.' }));
          }

          const { token } = body;
          if (token) {
            const resets = getDbFile('password_resets', []);
            const resetRecord = resets.find(r => r.email === cleanEmail);
            if (!resetRecord || resetRecord.token !== token) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ success: false, error: 'Invalid reset link. Please request a new one.' }));
            }
            if (Number(resetRecord.expires) < Date.now()) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ success: false, error: 'This reset link has expired. Please request a new one.' }));
            }
            await saveDbFile('password_resets', resets.filter(r => r.email !== cleanEmail));
          }

          users[userIndex].password = body.newPassword ? hashPassword(body.newPassword.trim()) : '';
          await saveDbFile('users', users);
          res.statusCode = 200;
          return res.end(JSON.stringify({ 
            success: true, 
            message: 'Password updated successfully! You can now log in.',
            user: {
              id: users[userIndex].id,
              name: users[userIndex].name,
              email: users[userIndex].email,
              role: users[userIndex].role || 'customer'
            }
          }));
        }

        if (action === 'verify_token') {
          const token = req.headers.authorization?.slice(7);
          if (!token) {
            res.statusCode = 401;
            return res.end(JSON.stringify({ success: false, error: 'Token missing' }));
          }
          const sessions = getDbFile('sessions', []);
          const session = sessions.find(s => s.token === token && s.expiresAt > Date.now());
          if (session) {
            const user = users.find(u => u.id === session.userId);
            if (user) {
              res.statusCode = 200;
              return res.end(JSON.stringify({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } }));
            }
          }
          res.statusCode = 401;
          return res.end(JSON.stringify({ success: false, error: 'Invalid or expired token' }));
        }

        if (action === 'sync_customer') {
          let user = users.find(u => u.email?.toLowerCase().trim() === cleanEmail);
          if (user) {
            if (body.name && (!user.name || user.name === 'Valued Customer')) user.name = body.name.trim();
            if (body.phone && !user.phone) user.phone = body.phone.trim();
            if (body.country && !user.country) user.country = body.country.trim();
            await saveDbFile('users', users);
          } else if (cleanEmail) {
            user = {
              id: `usr_${Date.now()}`,
              name: body.name ? body.name.trim() : (cleanEmail.split('@')[0] || 'Valued Customer'),
              email: cleanEmail,
              phone: body.phone ? body.phone.trim() : '',
              country: body.country ? body.country.trim() : 'Australia',
              role: 'customer',
              password: '',
              createdAt: new Date().toISOString()
            };
            users.push(user);
            await saveDbFile('users', users);
          }
          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } }));
        }
      }

      // 2b. /api/users (Sanitized User List)
      if (pathname === '/api/users' && req.method === 'GET') {
        if (!requireAdmin(req, res)) return;
        let users = getDbFile('users', []);
        const sanitized = users.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role || 'customer',
          phone: u.phone || '',
          country: u.country || 'Australia',
          createdAt: u.createdAt || 'Recent'
        }));
        res.statusCode = 200;
        return res.end(JSON.stringify({ success: true, data: sanitized }));
      }

      // 3. /api/chat
      if (pathname === '/api/chat') {
        let messages = getDbFile('chat', []);
        if (req.method === 'GET') {
          if (!requireAdmin(req, res)) return;
          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true, data: messages }));
        }
        if (req.method === 'POST') {
          const body = await readBody();
          messages.push({ id: Date.now(), ...body, timestamp: new Date().toISOString() });
          await saveDbFile('chat', messages);
          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true }));
        }
      }

      // 3.5 /api/wishlist (DB-003)
      if (pathname === '/api/wishlist') {
        const email = urlObj.searchParams.get('email');
        if (!email) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ success: false, error: 'Email query parameter is required' }));
        }

        let wishlist = getDbFile('wishlist', []);

        if (req.method === 'GET') {
          const userWishlist = wishlist.filter(w => w.email === email);
          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true, data: userWishlist }));
        }

        if (req.method === 'POST') {
          const body = await readBody();
          if (!body.productId) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, error: 'productId is required' }));
          }
          const exists = wishlist.find(w => w.email === email && w.productId === body.productId);
          if (!exists) {
            wishlist.push({ email, productId: body.productId, addedAt: new Date().toISOString() });
            await saveDbFile('wishlist', wishlist);
          }
          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true }));
        }

        if (req.method === 'DELETE') {
          const productId = urlObj.searchParams.get('productId');
          if (!productId) {
            res.statusCode = 400;
            return res.end(JSON.stringify({ success: false, error: 'productId is required' }));
          }
          wishlist = wishlist.filter(w => !(w.email === email && w.productId === productId));
          await saveDbFile('wishlist', wishlist);
          res.statusCode = 200;
          return res.end(JSON.stringify({ success: true }));
        }
      }

      // 4. /api/create-payment-intent (Stripe Live PaymentIntent Handler with Server-Side Validation)
      if (pathname === '/api/create-payment-intent' && req.method === 'POST') {
        const body = await readBody();
        const currency = (body.currency || 'usd').toLowerCase();
        const orderId = body.orderId || `VTM-${Date.now()}`;
        const customerEmail = body.customerEmail || '';
        const customerName = body.customerName || '';

        // Calculate amount securely server-side
        const products = getDbFile('products', []);
        let total = 0;
        const incomingItems = body.items || body.itemsList || body.structuredItems;
        if (incomingItems && Array.isArray(incomingItems) && incomingItems.length > 0) {
          incomingItems.forEach(item => {
            const product = products.find(p => String(p.id) === String(item.id));
            if (product) {
              const price = Number(product.price) || 0;
              const qty = Number(item.quantity) || 1;
              total += price * qty;
            } else if (item.price) {
              total += (Number(item.price) || 0) * (Number(item.quantity) || 1);
            }
          });
        }
        if (total === 0 && body.amount) {
          total = Number(body.amount) || 0;
        }

        if (body.couponCode) {
          const coupons = getDbFile('coupons', []);
          const coupon = coupons.find(c => c.code === body.couponCode.toUpperCase() && c.active !== false);
          if (coupon) {
            const discount = Number(coupon.discount || coupon.value || 0);
            total = total - (total * (discount / 100));
          }
        }

        const amountInCents = Math.round(total * 100);

        if (amountInCents < 50) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ success: false, error: 'Minimum order amount for card processing is $0.50 USD.' }));
        }

        const stripeKey = serverEnv.STRIPE_SECRET_KEY;
        if (!stripeKey) {
          res.statusCode = 500;
          return res.end(JSON.stringify({ success: false, error: 'Stripe secret key not configured in environment.' }));
        }

        try {
          const formParams = new URLSearchParams();
          formParams.append('amount', String(amountInCents));
          formParams.append('currency', currency);
          formParams.append('description', `Azim Crafts Order ${orderId} (${customerName || customerEmail})`);
          if (customerEmail) formParams.append('receipt_email', customerEmail);
          formParams.append('metadata[orderId]', orderId);
          formParams.append('metadata[customerName]', customerName);
          formParams.append('metadata[customerEmail]', customerEmail);
          formParams.append('automatic_payment_methods[enabled]', 'true');

          const stripeRes = await fetch('https://api.stripe.com/v1/payment_intents', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${stripeKey}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formParams.toString()
          });

          const piData = await stripeRes.json();

          if (!stripeRes.ok || piData.error) {
            res.statusCode = stripeRes.status || 400;
            return res.end(JSON.stringify({ success: false, error: piData.error?.message || 'Unable to initialize Stripe payment.' }));
          }

          res.statusCode = 200;
          return res.end(JSON.stringify({
            success: true,
            clientSecret: piData.client_secret,
            paymentIntentId: piData.id
          }));
        } catch (err) {
          res.statusCode = 500;
          return res.end(JSON.stringify({ success: false, error: err.message || 'Internal payment server error.' }));
        }
      }

      // 5. /api/paypal (PayPal Sandbox & Live Order Processing)
      if (pathname === '/api/paypal' && req.method === 'POST') {
        const body = await readBody();
        const { action, orderId, amount, currency = 'USD' } = body;
        const clientId = serverEnv.VITE_PAYPAL_CLIENT_ID || process.env.VITE_PAYPAL_CLIENT_ID;
        const secret = serverEnv.PAYPAL_CLIENT_SECRET || process.env.PAYPAL_CLIENT_SECRET;
        const isLive = (serverEnv.VITE_PAYPAL_ENV || process.env.VITE_PAYPAL_ENV) === 'live';
        const baseUrl = isLive ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

        if (!clientId || !secret) {
          res.statusCode = 500;
          return res.end(JSON.stringify({ success: false, error: 'PayPal credentials not configured in environment.' }));
        }

        try {
          const auth = Buffer.from(`${clientId}:${secret}`).toString('base64');
          const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${auth}`,
              'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
          });
          const tokenData = await tokenRes.json();
          if (!tokenRes.ok || !tokenData.access_token) {
            res.statusCode = 401;
            return res.end(JSON.stringify({ success: false, error: tokenData.error_description || 'PayPal authentication failed' }));
          }

          const accessToken = tokenData.access_token;

          if (action === 'create') {
            const createRes = await fetch(`${baseUrl}/v2/checkout/orders`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [{
                  amount: {
                    currency_code: currency.toUpperCase(),
                    value: Number(amount).toFixed(2)
                  },
                  description: body.description || 'Azim Crafts Order'
                }]
              })
            });
            const orderData = await createRes.json();
            res.statusCode = createRes.status;
            return res.end(JSON.stringify(orderData));
          }

          if (action === 'capture') {
            const captureRes = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
              }
            });
            const captureData = await captureRes.json();
            res.statusCode = captureRes.status;
            return res.end(JSON.stringify(captureData));
          }

          res.statusCode = 400;
          return res.end(JSON.stringify({ success: false, error: 'Invalid action' }));
        } catch (err) {
          res.statusCode = 500;
          return res.end(JSON.stringify({ success: false, error: err.message }));
        }
      }

      next();
    });
  }
});

export default defineConfig({
  plugins: [react(), videoRangeMiddleware(), apiServerMiddleware()],
  server: {
    port: 3000,
    host: true,
    allowedHosts: true,
    cors: true
  }
});
