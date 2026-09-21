// Cloudflare Pages Function: /api/banners (Cloudflare D1 SQL Handler)
export async function onRequestGet(context) {
  try {
    const { env } = context;
    if (!env.DB) {
      return new Response(JSON.stringify({ success: true, data: [] }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { results } = await env.DB.prepare(
      'SELECT * FROM banner_slides ORDER BY slide_order ASC'
    ).all();

    const mapped = (results || []).map(b => ({
      id: b.id,
      title: b.title,
      subtitle: b.subtitle,
      badgeText: b.badge_text,
      btnText: b.btn_text,
      targetProductId: b.target_product_id,
      desktopVideo: b.desktop_video,
      mobileVideo: b.mobile_video,
      active: Boolean(b.active),
      slide_order: b.slide_order
    }));

    return new Response(JSON.stringify({ success: true, data: mapped }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();

    if (!env.DB) {
      return new Response(JSON.stringify({ success: true, data: body }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const slides = Array.isArray(body) ? body : (body.slides || [body]);

    if (Array.isArray(body)) {
      await env.DB.prepare('DELETE FROM banner_slides').run();
    }

    for (let i = 0; i < slides.length; i++) {
      const b = slides[i];
      if (!b || !b.id) continue;
      await env.DB.prepare(`
        INSERT OR REPLACE INTO banner_slides (
          id, title, subtitle, badge_text, btn_text, target_product_id,
          desktop_video, mobile_video, active, slide_order
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `).bind(
        String(b.id),
        b.title || '',
        b.subtitle || '',
        b.badgeText || b.badge_text || '',
        b.btnText || b.btn_text || 'Shop Now',
        b.targetProductId || b.target_product_id || '',
        b.desktopVideo || b.desktop_video || '',
        b.mobileVideo || b.mobile_video || '',
        b.active !== undefined ? (b.active ? 1 : 0) : 1,
        b.slide_order !== undefined ? b.slide_order : i
      ).run();
    }

    return new Response(JSON.stringify({ success: true, data: slides }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestPut(context) {
  return onRequestPost(context);
}

export async function onRequestDelete(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (env.DB && id) {
      await env.DB.prepare('DELETE FROM banner_slides WHERE id = ?').bind(String(id)).run();
    }

    return new Response(JSON.stringify({ success: true, deletedId: id }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
