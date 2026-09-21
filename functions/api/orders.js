// Cloudflare Pages Function: /api/orders (Cloudflare D1 SQL Handler)
export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    if (!env.DB) {
      return new Response(JSON.stringify([]), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);
    const orderId = url.searchParams.get('orderId') || url.searchParams.get('id');
    const email = url.searchParams.get('email');

    const mapOrder = (r) => {
      let parsedItems = [];
      try {
        parsedItems = typeof r.items_list === 'string' ? JSON.parse(r.items_list) : (r.items_list || []);
      } catch (e) {
        parsedItems = [];
      }
      return {
        ...r,
        customerEmail: r.customer_email || r.customerEmail || '',
        shippingAddress: r.shipping_address || r.shippingAddress || '',
        itemsList: parsedItems,
        createdAt: r.created_at || r.createdAt || '',
      };
    };

    if (orderId && email) {
      const cleanId = orderId.replace('#', '').trim();
      const cleanEmail = email.toLowerCase().trim();
      const { results } = await env.DB.prepare(
        'SELECT * FROM orders WHERE (LOWER(REPLACE(id, "#", "")) = LOWER(?)) AND (LOWER(customer_email) = LOWER(?)) ORDER BY created_at DESC'
      ).bind(cleanId, cleanEmail).all();

      return new Response(JSON.stringify((results || []).map(mapOrder)), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { results } = await env.DB.prepare(
      'SELECT * FROM orders ORDER BY created_at DESC'
    ).all();

    return new Response(JSON.stringify((results || []).map(mapOrder)), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const o = await request.json();

    if (env.DB) {
      await env.DB.prepare(`
        INSERT OR REPLACE INTO orders (
          id, customer, customer_email, country, shipping_address, phone,
          items, items_list, total, status, payment, tracking, carrier, date, created_at
        ) VALUES (
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `).bind(
        o.id, o.customer, o.customerEmail || o.customer_email || '', o.country || 'Australia',
        o.shippingAddress || o.shipping_address || '', o.phone || '',
        o.items || '', JSON.stringify(o.itemsList || o.items_list || []),
        o.total || 0, o.status || 'Processing', o.payment || 'Paid', o.tracking || '',
        o.carrier || 'DHL Express', o.date || 'Today', o.createdAt || new Date().toISOString()
      ).run();

      // Deduct stock quantity and auto-mark sold out if 0
      const purchasedItems = Array.isArray(o.itemsList || o.items_list) ? (o.itemsList || o.items_list) : [];
      for (const it of purchasedItems) {
        const prodId = it.id || (it.product && it.product.id);
        const qty = Number(it.quantity) || 1;
        if (prodId) {
          try {
            await env.DB.prepare(`
              UPDATE products 
              SET stock_quantity = MAX(0, COALESCE(stock_quantity, 10) - ?),
                  is_sold_out = CASE WHEN COALESCE(stock_quantity, 10) - ? <= 0 THEN 1 ELSE is_sold_out END
              WHERE id = ?
            `).bind(qty, qty, prodId).run();
          } catch (e) {
            console.error('Failed to deduct stock for product', prodId, e);
          }
        }
      }
    }

    // Send itemized tax receipt / bill email if Resend is configured
    const customerEmail = (o.customerEmail || o.customer_email || '').toLowerCase().trim();
    const resendKey = env.RESEND_API_KEY;
    if (resendKey && customerEmail) {
      try {
        const items = Array.isArray(o.itemsList || o.items_list) && (o.itemsList || o.items_list).length > 0 
          ? (o.itemsList || o.items_list) 
          : [{ title: o.items || 'Handcrafted Artisan Item', quantity: 1, price: o.total }];

        const itemsRows = items.map(it => {
          const prod = it.product || it;
          const title = prod.title || prod.name || 'Handcrafted Collectible';
          const size = it.selectedSize || prod.selectedSize ? `<br/><span style="font-size: 11px; color: #888;">Size: ${it.selectedSize || prod.selectedSize}</span>` : '';
          const qty = it.quantity || 1;
          const lineTotal = (Number(prod.price || o.total || 0) * qty).toFixed(2);
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
            </tr>`;
        }).join('');

        const subtotal = Number(o.subtotal || o.total || 0).toFixed(2);
        const discount = Number(o.discountAmount || 0);
        const total = Number(o.total || 0).toFixed(2);

        const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #f7f5f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1b1a1a;">
  <div style="max-width: 600px; margin: 30px auto; background-color: #ffffff; border: 1px solid #e7dfd5; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #1b1a1a; padding: 26px 20px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 20px; letter-spacing: 3px; text-transform: uppercase;">AZIM CRAFTS</h1>
      <p style="margin: 4px 0 0; color: #d4a359; font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase;">Order Confirmation &amp; Official Bill</p>
    </div>
    <div style="padding: 30px 28px;">
      <table style="width: 100%; border-bottom: 2px solid #1b1a1a; padding-bottom: 12px; margin-bottom: 18px;">
        <tr>
          <td>
            <span style="font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; display: block;">Invoice / Order #</span>
            <strong style="font-size: 17px; color: #1b1a1a;">${o.id}</strong>
          </td>
          <td style="text-align: right;">
            <span style="font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; display: block;">Date</span>
            <strong style="font-size: 13px; color: #1b1a1a;">${o.date || 'Today'}</strong>
          </td>
        </tr>
      </table>

      <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #4a4a4a;">
        Dear <strong>${o.customer}</strong>,<br/>
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
            <td style="padding: 4px 0; font-size: 13px; color: #15803d;">Coupon Discount (${o.appliedCoupon || 'Promo'}):</td>
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
                <strong>${o.customer}</strong><br/>
                ${o.shippingAddress || o.shipping_address || ''}<br/>
                ${o.country || ''}
                ${o.phone ? `<br/>Tel: ${o.phone}` : ''}
              </p>
            </td>
            <td style="vertical-align: top; width: 50%; padding-left: 12px; border-left: 1px solid #ede7df;">
              <span style="font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 4px;">Payment &amp; Courier</span>
              <p style="margin: 0; font-size: 13px; line-height: 1.5; color: #1b1a1a;">
                <strong>Payment:</strong> ${o.payment || 'Confirmed'}<br/>
                <strong>Status:</strong> ${o.status || 'Processing'}<br/>
                <strong>Carrier:</strong> ${o.carrier || 'DHL Express Worldwide'}
              </p>
            </td>
          </tr>
        </table>
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

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'Azim Crafts <contact@azimcrafts.com>',
            to: [customerEmail],
            subject: `Order Confirmed: ${o.id} – Azim Crafts Official Bill`,
            html: emailHtml
          })
        });
      } catch (e) {
        console.error('Failed to send order email:', e.message);
      }
    }

    return new Response(JSON.stringify({ success: true, order: o }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPut(context) {
  try {
    const { request, env } = context;
    const { id, status, tracking, carrier } = await request.json();

    if (env.DB && id) {
      await env.DB.prepare(`
        UPDATE orders SET status = ?, tracking = ?, carrier = ? WHERE id = ?
      `).bind(status, tracking || '', carrier || 'DHL Express', id).run();
    }

    return new Response(JSON.stringify({ success: true, id, status, tracking, carrier }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestDelete(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const all = url.searchParams.get('all');

    if (env.DB) {
      if (all === 'true') {
        await env.DB.prepare('DELETE FROM orders').run();
      } else if (id) {
        await env.DB.prepare('DELETE FROM orders WHERE id = ?').bind(id).run();
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
