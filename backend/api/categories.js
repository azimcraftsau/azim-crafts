// Cloudflare Pages Function: /api/categories (Cloudflare D1 SQL Handler)
export async function onRequestGet(context) {
  try {
    const { env } = context;
    if (!env.DB) {
      return new Response(JSON.stringify({ success: true, data: [] }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { results } = await env.DB.prepare(
      'SELECT * FROM categories ORDER BY name ASC'
    ).all();

    return new Response(JSON.stringify({ success: true, data: results || [] }), {
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

    if (!body || !body.name) {
      return new Response(JSON.stringify({ success: false, error: 'Category name is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const key = body.key || body.name.toLowerCase().replace(/\s+/g, '-');
    const description = body.description || '';

    if (env.DB) {
      await env.DB.prepare(`
        INSERT OR REPLACE INTO categories (key, name, description)
        VALUES (?, ?, ?)
      `).bind(key, body.name, description).run();
    }

    return new Response(JSON.stringify({ success: true, data: { key, name: body.name, description } }), {
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
    const key = url.searchParams.get('key');

    if (!key) {
      return new Response(JSON.stringify({ success: false, error: 'Category key is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (env.DB) {
      await env.DB.prepare('DELETE FROM categories WHERE key = ?').bind(key).run();
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
