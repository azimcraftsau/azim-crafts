// Cloudflare Pages Function: /api/reviews (D1 Reviews CRUD)

export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    if (!env.DB) {
      return new Response(JSON.stringify([]), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);
    const all = url.searchParams.get('all');
    const pendingOnly = url.searchParams.get('pending');

    let sql = 'SELECT * FROM reviews';
    if (pendingOnly === 'true') {
      sql += " WHERE status = 'pending'";
    } else if (all !== 'true') {
      // Public: only approved
      sql += " WHERE status = 'approved'";
    }
    sql += ' ORDER BY created_at DESC';

    const { results } = await env.DB.prepare(sql).all();

    return new Response(JSON.stringify(results || []), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=10, s-maxage=30, stale-while-revalidate=60'
      }
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
    const r = await request.json();

    if (!r.customer_name || !r.comment) {
      return new Response(JSON.stringify({ error: 'Name and comment are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const id = r.id || `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const rating = Math.min(5, Math.max(1, Number(r.rating) || 5));

    if (env.DB) {
      await env.DB.prepare(`
        INSERT INTO reviews (id, order_id, customer_name, customer_email, rating, title, comment, location, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `).bind(
        id,
        r.order_id || '',
        r.customer_name,
        r.customer_email || '',
        rating,
        r.title || '',
        r.comment,
        r.location || 'Verified Buyer'
      ).run();
    }

    return new Response(JSON.stringify({
      success: true,
      review: { id, customer_name: r.customer_name, rating, status: 'pending' }
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
  try {
    const { request, env } = context;
    const { id, status } = await request.json();

    if (!id || !status) {
      return new Response(JSON.stringify({ error: 'id and status are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return new Response(JSON.stringify({ error: 'Invalid status. Must be pending, approved, or rejected.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (env.DB) {
      await env.DB.prepare('UPDATE reviews SET status = ? WHERE id = ?').bind(status, id).run();
    }

    return new Response(JSON.stringify({ success: true, id, status }), {
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

    if (env.DB && id) {
      await env.DB.prepare('DELETE FROM reviews WHERE id = ?').bind(id).run();
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
