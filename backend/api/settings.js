// Cloudflare Pages Function: /api/settings (Cloudflare D1 SQL Handler)
export async function onRequestGet(context) {
  try {
    const { env } = context;
    if (!env.DB) {
      return new Response(JSON.stringify({}), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await env.DB.prepare(
      'SELECT * FROM store_settings WHERE id = "main"'
    ).first();

    if (!result) {
      return new Response(JSON.stringify({}), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      announcementText: result.announcement_text,
      freeShippingThreshold: Number(result.free_shipping_threshold || 200),
      storeEmail: result.store_email,
      whatsappNumber: result.whatsapp_number
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
      await env.DB.prepare(`
        INSERT OR REPLACE INTO store_settings (
          id, announcement_text, free_shipping_threshold, store_email, whatsapp_number
        ) VALUES (
          "main", ?, ?, ?, ?
        )
      `).bind(
        s.announcementText || '', s.freeShippingThreshold || 200,
        s.storeEmail || 'info@vintagetomodern.com', s.whatsappNumber || '+61 400 000 000'
      ).run();
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
