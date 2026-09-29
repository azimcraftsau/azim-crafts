// Cloudflare Pages Function: /api/users (Cloudflare D1 SQL Handler - Protected Admin Endpoint)
export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    if (!env.DB) {
      return new Response(JSON.stringify([]), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const authHeader = request.headers.get('Authorization') || '';
    if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.length < 15) {
      return new Response(JSON.stringify({ error: 'Unauthorized. Admin authentication required to view users list.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { results } = await env.DB.prepare(
      'SELECT id, name, email, phone, role, created_at as createdAt FROM users ORDER BY created_at DESC'
    ).all();

    return new Response(JSON.stringify(results || []), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
