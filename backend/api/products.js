// Cloudflare Pages Function: /api/products (Cloudflare D1 SQL Handler)
export async function onRequestGet(context) {
  try {
    const { env } = context;
    if (!env.DB) {
      return new Response(JSON.stringify([]), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { results } = await env.DB.prepare(
      'SELECT * FROM products ORDER BY product_number ASC'
    ).all();

    const mapped = (results || []).map(p => ({
      ...p,
      images: p.images ? JSON.parse(p.images) : [p.image],
      videos: p.videos ? JSON.parse(p.videos) : [],
      perfectFor: p.perfect_for ? JSON.parse(p.perfect_for) : [],
      specifications: p.specifications ? JSON.parse(p.specifications) : {},
      isSoldOut: Boolean(p.is_sold_out),
      isOnSale: Boolean(p.is_on_sale)
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
    const p = await request.json();

    if (env.DB) {
      await env.DB.prepare(`
        INSERT OR REPLACE INTO products (
          id, product_number, title, handle, price, regular_price, currency,
          category, category_name, is_sold_out, is_on_sale, badge, image,
          hover_image, images, videos, vendor, description, specifications,
          perfect_for, dimensions, weight, materials, shipping_info, disclaimer,
          rating, reviews_count
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?
        )
      `).bind(
        p.id, p.productNumber || 0, p.title, p.handle || '', p.price || 0, p.regularPrice || p.price || 0, p.currency || 'USD',
        p.category || 'shields', p.categoryName || '', p.isSoldOut ? 1 : 0, p.isOnSale ? 1 : 0, p.badge || '', p.image || '',
        p.hoverImage || '', JSON.stringify(p.images || [p.image]), JSON.stringify(p.videos || []), p.vendor || 'Vintage To Modern Craft',
        p.description || '', JSON.stringify(p.specifications || {}), JSON.stringify(p.perfectFor || []), p.dimensions || '',
        p.weight || '', p.materials || '', p.shippingInfo || '', p.disclaimer || '', p.rating || 5, p.reviewsCount || 10
      ).run();
    }

    return new Response(JSON.stringify({ success: true, product: p }), {
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
      await env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
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
