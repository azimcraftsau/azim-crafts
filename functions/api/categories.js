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
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
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
      // 1. Find all active products belonging to this category
      const { results: categoryProducts } = await env.DB.prepare(
        'SELECT * FROM products WHERE category = ?'
      ).bind(key).all().catch(() => ({ results: [] }));

      // 2. Cascade each product to the trash table safely
      if (Array.isArray(categoryProducts) && categoryProducts.length > 0) {
        for (const prod of categoryProducts) {
          await env.DB.prepare(`
            INSERT OR REPLACE INTO trash (id, data, deleted_at)
            VALUES (?, ?, CURRENT_TIMESTAMP)
          `).bind(prod.id, JSON.stringify(prod)).run().catch(() => null);
        }

        // 3. Delete those products from active products table
        await env.DB.prepare('DELETE FROM products WHERE category = ?').bind(key).run().catch(() => null);
      }

      // 4. Delete the category itself from categories table
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
