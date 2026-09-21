// Cloudflare Pages Function: /api/messages (Cloudflare D1 SQL Handler)
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
      return new Response(JSON.stringify({ error: 'Unauthorized. Admin authentication required to view messages.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { results } = await env.DB.prepare(
      'SELECT * FROM messages ORDER BY id DESC'
    ).all();

    const mapped = (results || []).map(m => ({
      ...m,
      read: Boolean(m.is_read),
      replied: Boolean(m.is_replied)
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
    const m = await request.json();

    if (env.DB) {
      await env.DB.prepare(`
        INSERT OR REPLACE INTO messages (
          id, name, email, subject, message, date, is_read, is_replied, priority, reply_text
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `).bind(
        m.id, m.name, m.email, m.subject, m.message, m.date || 'Today',
        m.read ? 1 : 0, m.replied ? 1 : 0, m.priority || 'medium', m.replyText || ''
      ).run();
    }

    return new Response(JSON.stringify({ success: true, message: m }), {
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
    const { id, read, replied, replyText } = await request.json();

    if (env.DB && id) {
      await env.DB.prepare(`
        UPDATE messages SET is_read = ?, is_replied = ?, reply_text = ? WHERE id = ?
      `).bind(read ? 1 : 0, replied ? 1 : 0, replyText || '', id).run();
    }

    return new Response(JSON.stringify({ success: true, id }), {
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
      await env.DB.prepare('DELETE FROM messages WHERE id = ?').bind(id).run();
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
