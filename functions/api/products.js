// Cloudflare Pages Function: /api/products (Cloudflare D1 SQL Handler)
function safeParse(val, fallback) {
  if (!val) return fallback;
  if (typeof val !== 'string') return val;
  try { return JSON.parse(val); } catch (e) { return fallback; }
}

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

    const mapped = (results || []).map(p => {
      const stockQty = p.stock_quantity !== undefined && p.stock_quantity !== null ? Number(p.stock_quantity) : 10;
      const isSoldOut = Boolean(p.is_sold_out) || stockQty <= 0;
      const price = Number(p.price) || 0;
      const regPrice = (p.regular_price !== undefined && p.regular_price !== null && p.regular_price !== '')
        ? Number(p.regular_price)
        : ((p.regularPrice !== undefined && p.regularPrice !== null && p.regularPrice !== '') ? Number(p.regularPrice) : price);
      const isOnSale = Boolean(p.is_on_sale) || (regPrice > price);
      const parsedVideos = safeParse(p.videos, []);
      const normalizedVideos = Array.isArray(parsedVideos) ? parsedVideos.filter(Boolean) : (p.video ? [p.video] : []);

      return {
        ...p,
        price,
        regularPrice: regPrice,
        regular_price: regPrice,
        stockQuantity: stockQty,
        stock_quantity: stockQty,
        isSoldOut,
        is_sold_out: isSoldOut ? 1 : 0,
        isOnSale,
        is_on_sale: isOnSale ? 1 : 0,
        sizes: safeParse(p.sizes, []),
        images: safeParse(p.images, [p.image]),
        videos: normalizedVideos,
        perfectFor: safeParse(p.perfect_for, []),
        specifications: safeParse(p.specifications, {})
      };
    });

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

    const price = Number(p.price) || 0;
    const regPrice = (p.regularPrice !== undefined && p.regularPrice !== '' && p.regularPrice !== null)
      ? Number(p.regularPrice)
      : ((p.regular_price !== undefined && p.regular_price !== '' && p.regular_price !== null) ? Number(p.regular_price) : price);
    const isOnSale = (regPrice > price) || Boolean(p.isOnSale);

    const stockQty = p.stockQuantity !== undefined ? Number(p.stockQuantity) : (p.stock_quantity !== undefined ? Number(p.stock_quantity) : 10);
    const isSoldOut = stockQty <= 0 ? 1 : (p.isSoldOut ? 1 : 0);

    const videosList = Array.isArray(p.videos) ? p.videos.filter(Boolean) : (p.video ? [p.video] : []);
    const imagesList = Array.isArray(p.images) && p.images.length > 0 ? p.images.filter(Boolean) : [p.image || ''];
    const primaryImg = p.image || (imagesList.length > 0 ? imagesList[0] : '');

    if (env.DB) {
      await env.DB.prepare(`
        INSERT OR REPLACE INTO products (
          id, product_number, title, handle, price, regular_price, currency,
          category, category_name, is_sold_out, is_on_sale, badge, image,
          hover_image, images, videos, vendor, description, specifications,
          perfect_for, dimensions, weight, materials, shipping_info, disclaimer,
          rating, reviews_count, sizes, stock_quantity
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?
        )
      `).bind(
        p.id, p.productNumber || p.product_number || 0, p.title || p.name || '', p.handle || '',
        price, regPrice, p.currency || 'USD',
        p.category || 'general', p.categoryName || p.category_name || '', isSoldOut, isOnSale ? 1 : 0,
        p.badge || '', primaryImg, p.hoverImage || p.hover_image || '',
        JSON.stringify(imagesList), JSON.stringify(videosList),
        p.vendor || 'Azim Crafts', p.description || '', JSON.stringify(p.specifications || {}),
        JSON.stringify(p.perfectFor || p.perfect_for || []), p.dimensions || '', p.weight || '',
        p.materials || '', p.shippingInfo || p.shipping_info || '', p.disclaimer || '',
        p.rating || 5, p.reviewsCount || p.reviews_count || 10,
        JSON.stringify(p.sizes || []), stockQty
      ).run();
    }

    return new Response(JSON.stringify({
      success: true,
      product: { 
        ...p, 
        price,
        regularPrice: regPrice,
        regular_price: regPrice,
        isOnSale: Boolean(isOnSale),
        is_on_sale: isOnSale ? 1 : 0,
        stockQuantity: stockQty, 
        stock_quantity: stockQty,
        isSoldOut: Boolean(isSoldOut),
        is_sold_out: isSoldOut,
        image: primaryImg,
        images: imagesList,
        videos: videosList
      }
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
