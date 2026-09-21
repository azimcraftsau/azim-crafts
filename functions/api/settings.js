// Cloudflare Pages Function: /api/settings (Cloudflare D1 SQL Handler)
export async function onRequestGet(context) {
  try {
    const { env } = context;
    if (!env.DB) {
      return new Response(JSON.stringify({
        announcementText: 'Free Worldwide Express Shipping Over $200 USD',
        freeShippingThreshold: 200,
        storeEmail: 'contact@azimcrafts.com',
        whatsappNumber: '+61 426 285 439',
        storeAddress: 'Store 1: Shrin Malik, 42a chestnut road, Auburn 2144, NSW, Australia | Store 2: 01 Oswald Street, Bolton BL3 4BA, UK'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await env.DB.prepare(
      'SELECT * FROM store_settings WHERE id = "main"'
    ).first();

    if (!result) {
      return new Response(JSON.stringify({
        announcementText: 'Free Worldwide Express Shipping Over $200 USD',
        freeShippingThreshold: 200,
        storeEmail: 'contact@azimcrafts.com',
        whatsappNumber: '+61 426 285 439',
        storeAddress: 'Store 1: Shrin Malik, 42a chestnut road, Auburn 2144, NSW, Australia | Store 2: 01 Oswald Street, Bolton BL3 4BA, UK'
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      announcementText: result.announcement_text || 'Free Worldwide Express Shipping Over $200 USD',
      freeShippingThreshold: result.free_shipping_threshold != null ? Number(result.free_shipping_threshold) : 200,
      storeEmail: result.store_email || 'contact@azimcrafts.com',
      whatsappNumber: result.whatsapp_number || '+61 426 285 439',
      storeAddress: result.store_address || 'Store 1: Shrin Malik, 42a chestnut road, Auburn 2144, NSW, Australia | Store 2: 01 Oswald Street, Bolton BL3 4BA, UK'
    }), {
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
    const s = await request.json();

    if (env.DB) {
      // Ensure row exists
      await env.DB.prepare(`
        INSERT OR IGNORE INTO store_settings (
          id, announcement_text, free_shipping_threshold, store_email, whatsapp_number, store_address
        ) VALUES (
          "main",
          "Free Worldwide Express Shipping Over $200 USD",
          200,
          "contact@azimcrafts.com",
          "+61 426 285 439",
          "Store 1: Shrin Malik, 42a chestnut road, Auburn 2144, NSW, Australia | Store 2: 01 Oswald Street, Bolton BL3 4BA, UK"
        )
      `).run();

      const updates = [];
      const values = [];

      if (s.announcementText !== undefined && s.announcementText !== null) {
        updates.push('announcement_text = ?');
        values.push(String(s.announcementText));
      }
      if (s.freeShippingThreshold !== undefined && s.freeShippingThreshold !== null && s.freeShippingThreshold !== '') {
        const num = Number(s.freeShippingThreshold);
        if (!isNaN(num)) {
          updates.push('free_shipping_threshold = ?');
          values.push(num);
        }
      }
      if (s.storeEmail !== undefined && s.storeEmail !== null) {
        updates.push('store_email = ?');
        values.push(String(s.storeEmail));
      }
      if (s.whatsappNumber !== undefined && s.whatsappNumber !== null) {
        updates.push('whatsapp_number = ?');
        values.push(String(s.whatsappNumber));
      }
      if (s.storeAddress !== undefined && s.storeAddress !== null) {
        updates.push('store_address = ?');
        values.push(String(s.storeAddress));
      }

      if (updates.length > 0) {
        updates.push('updated_at = CURRENT_TIMESTAMP');
        const sql = `UPDATE store_settings SET ${updates.join(', ')} WHERE id = "main"`;
        await env.DB.prepare(sql).bind(...values).run();
      }

      const result = await env.DB.prepare(
        'SELECT * FROM store_settings WHERE id = "main"'
      ).first();

      return new Response(JSON.stringify({
        success: true,
        settings: {
          announcementText: result.announcement_text,
          freeShippingThreshold: Number(result.free_shipping_threshold),
          storeEmail: result.store_email,
          whatsappNumber: result.whatsapp_number,
          storeAddress: result.store_address
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: true, settings: s }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
