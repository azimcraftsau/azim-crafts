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

    // Auto-ensure is_resolved and metadata column exists in messages table
    try {
      await env.DB.prepare('ALTER TABLE messages ADD COLUMN is_resolved INTEGER DEFAULT 0').run();
    } catch (e) {}

    const { results } = await env.DB.prepare(
      'SELECT * FROM messages ORDER BY id DESC'
    ).all();

    const mapped = (results || []).map(m => ({
      ...m,
      read: Boolean(m.is_read),
      replied: Boolean(m.is_replied),
      isResolved: Boolean(m.is_resolved)
    }));

    return new Response(JSON.stringify(mapped), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
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
    const m = await request.json();

    if (env.DB) {
      // Auto-ensure is_resolved column exists
      try {
        await env.DB.prepare('ALTER TABLE messages ADD COLUMN is_resolved INTEGER DEFAULT 0').run();
      } catch (e) {}

      await env.DB.prepare(`
        INSERT OR REPLACE INTO messages (
          id, name, email, subject, message, date, is_read, is_replied, priority, reply_text, is_resolved
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )
      `).bind(
        m.id || Date.now(),
        m.name || '',
        m.email || '',
        m.subject || '',
        m.message || '',
        m.date || 'Today',
        m.read ? 1 : 0,
        m.replied ? 1 : 0,
        m.priority || 'medium',
        m.replyText || '',
        m.isResolved ? 1 : 0
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
    const body = await request.json();
    const { id, read, is_read, replied, is_replied, replyText, reply_text, isResolved, is_resolved } = body;

    if (env.DB && id) {
      // Auto-ensure is_resolved column exists
      try {
        await env.DB.prepare('ALTER TABLE messages ADD COLUMN is_resolved INTEGER DEFAULT 0').run();
      } catch (e) {}

      const updates = [];
      const values = [];

      const readVal = read !== undefined ? read : is_read;
      if (readVal !== undefined) {
        updates.push('is_read = ?');
        values.push(readVal ? 1 : 0);
      }

      const repliedVal = replied !== undefined ? replied : is_replied;
      if (repliedVal !== undefined) {
        updates.push('is_replied = ?');
        values.push(repliedVal ? 1 : 0);
      }

      const replyTextVal = replyText !== undefined ? replyText : reply_text;
      if (replyTextVal !== undefined) {
        updates.push('reply_text = ?');
        values.push(replyTextVal || '');
      }

      const resolvedVal = isResolved !== undefined ? isResolved : is_resolved;
      if (resolvedVal !== undefined) {
        updates.push('is_resolved = ?');
        values.push(resolvedVal ? 1 : 0);
      }

      if (updates.length > 0) {
        values.push(id);
        const sql = `UPDATE messages SET ${updates.join(', ')} WHERE id = ?`;
        await env.DB.prepare(sql).bind(...values).run();
      }
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
