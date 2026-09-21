// Cloudflare Pages Function: /api/trash (Cloudflare D1 SQL Handler)
export async function onRequestGet(context) {
  try {
    const { env } = context;
    if (!env.DB) {
      return new Response(JSON.stringify({ success: true, data: [] }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { results } = await env.DB.prepare('SELECT * FROM trash ORDER BY deleted_at DESC').all();

    const mapped = (results || []).map(r => {
      try {
        return JSON.parse(r.data);
      } catch (e) {
        return { id: r.id };
      }
    });

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

    if (!body || !body.id) {
      return new Response(JSON.stringify({ success: false, error: 'Item id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (env.DB) {
      // 1. If it's a product being moved to trash, delete from products
      await env.DB.prepare('DELETE FROM products WHERE id = ?').bind(body.id).run().catch(() => null);

      // 2. Insert into trash table
      await env.DB.prepare(`
        INSERT OR REPLACE INTO trash (id, data, deleted_at)
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `).bind(body.id, JSON.stringify(body)).run();
    }

    return new Response(JSON.stringify({ success: true, data: body }), {
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
  try {
    const { request, env } = context;
    const { id } = await request.json();

    if (!id) {
      return new Response(JSON.stringify({ success: false, error: 'Product id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (env.DB) {
      const record = await env.DB.prepare('SELECT data FROM trash WHERE id = ?').bind(id).first();
      if (record && record.data) {
        const p = JSON.parse(record.data);
        await env.DB.prepare(`
          INSERT OR REPLACE INTO products (
            id, product_number, title, handle, price, regular_price, currency,
            category, category_name, is_sold_out, is_on_sale, badge, image,
            hover_image, images, videos, vendor, description, specifications,
            perfect_for, dimensions, weight, materials, shipping_info, disclaimer,
            rating, reviews_count, sizes, stock_quantity
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          p.id, p.productNumber || p.product_number || 0, p.title || p.name || '', p.handle || '',
          p.price || 0, p.regularPrice || p.regular_price || p.price || 0, p.currency || 'USD',
          p.category || 'general', p.categoryName || p.category_name || '', p.isSoldOut ? 1 : 0,
          p.isOnSale ? 1 : 0, p.badge || '', p.image || '', p.hoverImage || p.hover_image || '',
          JSON.stringify(p.images || [p.image]), JSON.stringify(p.videos || []),
          p.vendor || 'Azim Crafts', p.description || '', JSON.stringify(p.specifications || {}),
          JSON.stringify(p.perfectFor || p.perfect_for || []), p.dimensions || '', p.weight || '',
          p.materials || '', p.shippingInfo || p.shipping_info || '', p.disclaimer || '',
          p.rating || 5, p.reviewsCount || p.reviews_count || 10,
          JSON.stringify(p.sizes || []), p.stockQuantity ?? p.stock_quantity ?? 10
        ).run();

        await env.DB.prepare('DELETE FROM trash WHERE id = ?').bind(id).run();
      }
    }

    return new Response(JSON.stringify({ success: true, restoredId: id }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
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
        await env.DB.prepare('DELETE FROM trash').run();
      } else if (id) {
        await env.DB.prepare('DELETE FROM trash WHERE id = ?').bind(id).run();
      }
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
