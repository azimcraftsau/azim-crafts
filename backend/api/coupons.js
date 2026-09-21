// Cloudflare Pages Function: /api/coupons (Cloudflare D1 SQL Handler)
export async function onRequestGet(context) {
  try {
    const { env } = context;
    if (!env.DB) {
      return new Response(JSON.stringify([]), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { results } = await env.DB.prepare(
      'SELECT * FROM coupons ORDER BY id ASC'
    ).all();

    const mapped = (results || []).map(c => ({
      ...c,
      active: Boolean(c.is_active),
      uses: c.uses_count != null ? Number(c.uses_count) : (c.uses != null ? Number(c.uses) : 0)
    }));

    return new Response(JSON.stringify(mapped), {
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
    const c = await request.json();

    if (env.DB) {
      await env.DB.prepare(`
        INSERT OR REPLACE INTO coupons (
          id, code, type, value, description, is_active, uses_count
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?
        )
      `).bind(
        c.id, c.code.toUpperCase(), c.type, c.value, c.description || '', c.active ? 1 : 0, c.uses || c.uses_count || 0
      ).run();
    }

    return new Response(JSON.stringify({ success: true, coupon: c }), {
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
  return onRequestPost(context);
}

export async function onRequestDelete(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (env.DB && id) {
      await env.DB.prepare('DELETE FROM coupons WHERE id = ?').bind(id).run();
    }

    return new Response(JSON.stringify({ success: true, deletedId: id }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
