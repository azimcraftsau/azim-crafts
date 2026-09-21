// Cloudflare Pages Function: /api/chat (Cloudflare D1 SQL Handler for Live Storefront Chat CRM)
export async function onRequestGet(context) {
  try {
    const { request, env } = context;
    if (!env.DB) {
      return new Response(JSON.stringify([]), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);
    const threadId = url.searchParams.get('id');

    if (threadId) {
      const { results } = await env.DB.prepare(
        'SELECT * FROM chat_threads WHERE id = ?'
      ).bind(threadId).all();

      const item = results && results[0];
      if (!item) {
        return new Response(JSON.stringify(null), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      let parsedMessages = [];
      try {
        parsedMessages = typeof item.messages === 'string' ? JSON.parse(item.messages) : (item.messages || []);
      } catch (e) {
        parsedMessages = [];
      }

      return new Response(JSON.stringify({
        ...item,
        isGuest: Boolean(item.is_guest),
        userEmail: item.user_email,
        userId: item.user_id,
        lastMessage: item.last_message,
        lastUpdated: item.last_updated,
        read: Boolean(item.is_read),
        replied: Boolean(item.is_replied),
        isResolved: Boolean(item.is_resolved),
        isLiveChat: true,
        messages: parsedMessages
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { results } = await env.DB.prepare(
      'SELECT * FROM chat_threads ORDER BY last_updated DESC'
    ).all();

    const mapped = (results || []).map(item => {
      let parsedMessages = [];
      try {
        parsedMessages = typeof item.messages === 'string' ? JSON.parse(item.messages) : (item.messages || []);
      } catch (e) {
        parsedMessages = [];
      }

      return {
        ...item,
        isGuest: Boolean(item.is_guest),
        userEmail: item.user_email,
        userId: item.user_id,
        lastMessage: item.last_message,
        lastUpdated: item.last_updated,
        read: Boolean(item.is_read),
        replied: Boolean(item.is_replied),
        isResolved: Boolean(item.is_resolved),
        isLiveChat: true,
        messages: parsedMessages
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
    const t = await request.json();

    if (env.DB && t.id) {
      const messagesStr = typeof t.messages === 'string' ? t.messages : JSON.stringify(t.messages || []);
      await env.DB.prepare(`
        INSERT OR REPLACE INTO chat_threads (
          id, name, email, is_guest, user_email, user_id, subject,
          last_message, last_updated, date, is_read, is_replied, is_resolved, priority, messages
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?, ?, ?, ?
        )
      `).bind(
        t.id,
        t.name || 'Guest User',
        t.email || '',
        t.isGuest ? 1 : 0,
        t.userEmail || '',
        t.userId || '',
        t.subject || 'Live Chat Session',
        t.lastMessage || '',
        Number(t.lastUpdated) || Date.now(),
        t.date || 'Today',
        t.read ? 1 : 0,
        t.replied ? 1 : 0,
        t.isResolved ? 1 : 0,
        t.priority || 'high',
        messagesStr
      ).run();
    }

    return new Response(JSON.stringify({ success: true, thread: t }), {
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
    const { id, isResolved, read, replied, lastMessage, messages } = await request.json();

    if (env.DB && id) {
      if (messages !== undefined) {
        const messagesStr = typeof messages === 'string' ? messages : JSON.stringify(messages || []);
        await env.DB.prepare(`
          UPDATE chat_threads 
          SET messages = ?, 
              last_message = COALESCE(?, last_message), 
              last_updated = ?, 
              is_replied = CASE WHEN ? IS NOT NULL THEN ? ELSE is_replied END,
              is_read = CASE WHEN ? IS NOT NULL THEN ? ELSE is_read END,
              is_resolved = CASE WHEN ? IS NOT NULL THEN ? ELSE is_resolved END
          WHERE id = ?
        `).bind(
          messagesStr,
          lastMessage || null,
          Date.now(),
          replied !== undefined ? (replied ? 1 : 0) : null,
          replied !== undefined ? (replied ? 1 : 0) : null,
          read !== undefined ? (read ? 1 : 0) : null,
          read !== undefined ? (read ? 1 : 0) : null,
          isResolved !== undefined ? (isResolved ? 1 : 0) : null,
          isResolved !== undefined ? (isResolved ? 1 : 0) : null,
          id
        ).run();
      } else if (isResolved !== undefined) {
        await env.DB.prepare(`
          UPDATE chat_threads SET is_resolved = ? WHERE id = ?
        `).bind(isResolved ? 1 : 0, id).run();
      }
    }

    return new Response(JSON.stringify({ success: true }), {
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
      await env.DB.prepare('DELETE FROM chat_threads WHERE id = ?').bind(id).run();
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
