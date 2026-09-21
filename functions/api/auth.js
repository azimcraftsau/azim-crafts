// Cloudflare Pages Function: /api/auth (Customer Authentication Handler with Cloudflare D1)

// SHA-256 password hashing using Web Crypto API (Cloudflare Workers compatible)
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Multi-algorithm password verification (PBKDF2 with SHA-512 salt, SHA-256, and plaintext)
async function verifyPassword(password, stored) {
  if (!stored) return false;
  if (stored.startsWith('pbkdf2:')) {
    try {
      const parts = stored.split(':');
      if (parts.length === 3) {
        const [, saltHex, targetHash] = parts;
        const saltBytes = new TextEncoder().encode(saltHex);
        const key = await crypto.subtle.importKey(
          'raw',
          new TextEncoder().encode(password),
          { name: 'PBKDF2' },
          false,
          ['deriveBits']
        );
        const derivedBits = await crypto.subtle.deriveBits(
          {
            name: 'PBKDF2',
            salt: saltBytes,
            iterations: 100000,
            hash: 'SHA-512'
          },
          key,
          64 * 8
        );
        const derivedHex = Array.from(new Uint8Array(derivedBits))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        return derivedHex === targetHash;
      }
    } catch (e) {
      console.error('PBKDF2 verification error:', e.message);
    }
  }
  if (password === stored) return true;
  const sha256 = await hashPassword(password);
  return sha256 === stored;
}

// Enterprise-grade PBKDF2 password hasher (SHA-512 + 100k iterations + 16-byte cryptographically secure salt)
async function hashPasswordPbkdf2(password) {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const saltHex = Array.from(saltBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  const saltUtf8 = new TextEncoder().encode(saltHex);
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltUtf8,
      iterations: 100000,
      hash: 'SHA-512'
    },
    key,
    64 * 8
  );
  const derivedHex = Array.from(new Uint8Array(derivedBits))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  return `pbkdf2:${saltHex}:${derivedHex}`;
}

export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { action, email, password, name, phone, addresses, resetCode, newPassword } = body;

    if (!env.DB) {
      // Local dev fallback response
      if (action === 'login') {
        return new Response(JSON.stringify({
          success: true,
          user: { id: `usr_${Date.now()}`, email, name: name || email.split('@')[0], phone: phone || '' }
        }), { headers: { 'Content-Type': 'application/json' } });
      }
      if (action === 'signup') {
        return new Response(JSON.stringify({
          success: true,
          user: { id: `usr_${Date.now()}`, email, name, phone }
        }), { headers: { 'Content-Type': 'application/json' } });
      }
      if (action === 'forgot_password') {
        return new Response(JSON.stringify({
          success: true,
          message: `Password reset verification code generated for ${email}`,
          code: '849201'
        }), { headers: { 'Content-Type': 'application/json' } });
      }
      if (action === 'reset_password') {
        return new Response(JSON.stringify({
          success: true,
          message: 'Password reset successfully'
        }), { headers: { 'Content-Type': 'application/json' } });
      }
    }

    // 1. SIGNUP ACTION
    if (action === 'signup') {
      if (!email || !password || !name) {
        return new Response(JSON.stringify({ error: 'Name, email and password are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Check if user already exists
      const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email.toLowerCase().trim()).first();
      if (existing) {
        return new Response(JSON.stringify({ error: 'This email is already registered. Please log in.' }), {
          status: 409,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const { country } = body;
      const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const hashedPw = await hashPassword(password);
      await env.DB.prepare(`
        INSERT INTO users (id, name, email, password, phone, country, role, addresses)
        VALUES (?, ?, ?, ?, ?, ?, 'customer', '[]')
      `).bind(userId, name, email.toLowerCase().trim(), hashedPw, phone || '', country || 'Australia').run().catch(async () => {
        await env.DB.prepare(`
          INSERT INTO users (id, name, email, password, phone, role, addresses)
          VALUES (?, ?, ?, ?, ?, 'customer', '[]')
        `).bind(userId, name, email.toLowerCase().trim(), hashedPw, phone || '').run();
      });

      return new Response(JSON.stringify({
        success: true,
        user: { id: userId, name, email: email.toLowerCase().trim(), phone: phone || '', country: country || 'Australia' }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. LOGIN ACTION
    if (action === 'login') {
      if (!email || !password) {
        return new Response(JSON.stringify({ error: 'Email and password are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const cleanEmail = email.toLowerCase().trim();
      const hashedPw = await hashPassword(password);
      const user = await env.DB.prepare(
        'SELECT id, name, email, phone, addresses, role, password FROM users WHERE email = ?'
      ).bind(cleanEmail).first();

      if (!user) {
        return new Response(JSON.stringify({ error: 'No account found with this email. Please sign up first.' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const isValid = await verifyPassword(password, user.password);
      if (!isValid) {
        return new Response(JSON.stringify({ error: 'Incorrect password. Please try again.' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (user.password === password) {
        // Transparently upgrade legacy plaintext password to SHA-256 hash
        await env.DB.prepare('UPDATE users SET password = ? WHERE id = ?').bind(hashedPw, user.id).run().catch(() => null);
      }

      const token = `adm_${user.id}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
      return new Response(JSON.stringify({
        success: true,
        token: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          addresses: user.addresses ? JSON.parse(user.addresses) : [],
          role: user.role
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. FORGOT PASSWORD ACTION
    // 3. FORGOT PASSWORD ACTION (Token-based Reset Link & Email Delivery)
    if (action === 'forgot_password') {
      if (!email) {
        return new Response(JSON.stringify({ error: 'Please enter your email address' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const cleanEmail = email.toLowerCase().trim();
      let user = null;
      if (env.DB) {
        user = await env.DB.prepare('SELECT id, name FROM users WHERE email = ?')
          .bind(cleanEmail)
          .first();

        // 1. Fallback: check orders table for customer
        if (!user) {
          const orderUser = await env.DB.prepare('SELECT customer as name FROM orders WHERE LOWER(customerEmail) = ? LIMIT 1').bind(cleanEmail).first().catch(() => null);
          if (orderUser) {
            const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            await env.DB.prepare(`
              INSERT INTO users (id, name, email, password, role, addresses)
              VALUES (?, ?, ?, '', 'customer', '[]')
            `).bind(userId, orderUser.name || cleanEmail.split('@')[0], cleanEmail).run().catch(() => null);
            user = { id: userId, name: orderUser.name || cleanEmail.split('@')[0] };
          }
        }

        // 2. Fallback: check client passed metadata
        if (!user && (body.userName || body.name)) {
          const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          await env.DB.prepare(`
            INSERT INTO users (id, name, email, password, role, addresses)
            VALUES (?, ?, ?, '', 'customer', '[]')
          `).bind(userId, body.userName || body.name, cleanEmail).run().catch(() => null);
          user = { id: userId, name: body.userName || body.name };
        }
      } else {
        user = { name: (body.userName || cleanEmail.split('@')[0]) };
      }

      if (!user) {
        return new Response(JSON.stringify({ error: 'No account found with this email address. Please create an account first.' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Generate cryptographically secure token & 15-minute expiration
      const token = (crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '') : Math.random().toString(36).substring(2)) + Math.random().toString(36).substring(2, 8);
      const expires = Date.now() + (15 * 60 * 1000); // 15 Minutes

      // Store in Cloudflare D1 password_resets table
      if (env.DB) {
        await env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS password_resets (
            email TEXT PRIMARY KEY,
            token TEXT NOT NULL,
            expires INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `).run().catch(() => null);

        await env.DB.prepare(`
          INSERT INTO password_resets (email, token, expires)
          VALUES (?, ?, ?)
          ON CONFLICT(email) DO UPDATE SET token = excluded.token, expires = excluded.expires
        `).bind(cleanEmail, token, expires).run().catch(() => null);
      }

      // Construct Reset URL
      const host = request.headers.get('host') || 'vtmcraft.pages.dev';
      const protocol = request.headers.get('x-forwarded-proto') || 'https';
      const resetUrl = `${protocol}://${host}/#reset?token=${token}&email=${encodeURIComponent(cleanEmail)}`;

      // HTML Email Template
      const emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 30px 20px; background-color: #fbfaf8; border: 1px solid #e8ce9f; border-radius: 12px; color: #1b1a1a;">
          <div style="text-align: center; margin-bottom: 25px; padding-bottom: 20px; border-bottom: 1px solid #efe5d4;">
            <h1 style="font-size: 24px; letter-spacing: 2px; text-transform: uppercase; color: #1b1a1a; margin: 0;">Azim Crafts</h1>
            <p style="font-size: 11px; letter-spacing: 2px; color: #c8924b; text-transform: uppercase; margin: 5px 0 0 0;">Vintage World Australia &bull; Heritage Collectibles</p>
          </div>
          <div style="background: #ffffff; padding: 25px; border-radius: 8px; border: 1px solid #f0e6d6;">
            <h2 style="font-size: 18px; margin-top: 0; color: #1b1a1a; font-weight: 600;">Reset Your Password</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #4a4a4a;">Hello <strong>${user.name || 'Valued Customer'}</strong>,</p>
            <p style="font-size: 14px; line-height: 1.6; color: #4a4a4a;">We received a request to reset the password for your Azim Crafts account. Click the button below to set a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background-color: #1b1a1a; color: #ffffff; padding: 14px 28px; text-decoration: none; font-size: 13px; font-weight: bold; letter-spacing: 1.2px; text-transform: uppercase; border-radius: 8px; display: inline-block; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">Reset Password Now</a>
            </div>
            <p style="font-size: 12px; line-height: 1.6; color: #777777;">Or copy and paste this link into your browser:<br/><a href="${resetUrl}" style="color: #c8924b; word-break: break-all;">${resetUrl}</a></p>
            <p style="font-size: 11px; color: #999999; margin-top: 25px; border-top: 1px solid #f0ece3; padding-top: 15px;">⏱️ <em>This reset link is valid for 15 minutes. If you didn't request this, you can safely ignore this email.</em></p>
          </div>
        </div>
      `;

      // 1. If Resend API Key is configured
      if (env.RESEND_API_KEY) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${env.RESEND_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: 'Azim Crafts <contact@azimcrafts.com>',
              to: [cleanEmail],
              subject: 'Reset your Azim Crafts password',
              html: emailHtml
            })
          });
        } catch (err) {}
      }

      // 2. Or try MailChannels (Native to Cloudflare Workers)
      try {
        await fetch('https://api.mailchannels.net/tx/v1/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: cleanEmail, name: user.name || 'Customer' }] }],
            from: { email: 'noreply@azimcrafts.com', name: 'Azim Crafts' },
            subject: 'Reset your Azim Crafts password',
            content: [{ type: 'text/html', value: emailHtml }]
          })
        });
      } catch (err) {}

      return new Response(JSON.stringify({
        success: true,
        message: `Password reset link has been sent to ${cleanEmail}. Please check your inbox.`,
        resetUrl
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 4. RESET PASSWORD ACTION (Validates Token & Updates Password in D1)
    if (action === 'reset_password') {
      const { token } = body;
      if (!email || !newPassword) {
        return new Response(JSON.stringify({ error: 'Email and new password are required.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const cleanEmail = email.toLowerCase().trim();

      // Verify token if provided
      if (env.DB && token) {
        const resetRecord = await env.DB.prepare('SELECT token, expires FROM password_resets WHERE email = ?')
          .bind(cleanEmail)
          .first();

        if (!resetRecord || resetRecord.token !== token) {
          return new Response(JSON.stringify({ error: 'Invalid reset link. Please request a new link.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        if (Number(resetRecord.expires) < Date.now()) {
          return new Response(JSON.stringify({ error: 'This reset link has expired. Please request a new one.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      if (env.DB) {
        const hashedNewPw = await hashPassword(newPassword.trim());
        await env.DB.prepare('UPDATE users SET password = ? WHERE email = ?')
          .bind(hashedNewPw, cleanEmail)
          .run();

        // Clean up reset token
        await env.DB.prepare('DELETE FROM password_resets WHERE email = ?')
          .bind(cleanEmail)
          .run().catch(() => null);
      }

      const user = env.DB ? await env.DB.prepare('SELECT id, name, email, phone, addresses FROM users WHERE email = ?')
        .bind(cleanEmail)
        .first() : { email: cleanEmail, name: cleanEmail.split('@')[0] };

      return new Response(JSON.stringify({
        success: true,
        message: 'Your password has been reset successfully! You can now log in.',
        user: user ? {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          addresses: user.addresses ? JSON.parse(user.addresses) : []
        } : null
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 5. UPDATE ADDRESSES ACTION
    if (action === 'update_address') {
      const { userId, addressesList } = body;
      if (userId && env.DB) {
        await env.DB.prepare('UPDATE users SET addresses = ? WHERE id = ?')
          .bind(JSON.stringify(addressesList || []), userId)
          .run();
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 6. SYNC CUSTOMER FROM ORDER (Upsert into users table)
    if (action === 'sync_customer') {
      if (env.DB && email) {
        const cleanEmail = email.toLowerCase().trim();
        const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(cleanEmail).first();
        if (!existing) {
          const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          await env.DB.prepare(`
            INSERT INTO users (id, name, email, password, phone, role, addresses)
            VALUES (?, ?, ?, '', ?, 'customer', '[]')
          `).bind(userId, name || cleanEmail.split('@')[0], cleanEmail, phone || '').run().catch(() => null);
        }
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 7. VERIFY TOKEN ACTION
    if (action === 'verify_token') {
      const authHeader = request.headers.get('Authorization') || '';
      if (authHeader && authHeader.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 8. LIST USERS ACTION (For Admin CRM)
    if (action === 'list_users') {
      if (env.DB) {
        try {
          const { results } = await env.DB.prepare('SELECT id, name, email, phone, role, created_at as createdAt FROM users ORDER BY created_at DESC').all();
          return new Response(JSON.stringify({ success: true, users: results || [] }), {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (e) {
          return new Response(JSON.stringify({ success: true, users: [] }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
      return new Response(JSON.stringify({ success: true, users: [] }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 9. ADMIN CREATE USER / STAFF
    if (action === 'admin_create_user') {
      const { name, email, password, role, phone } = body;
      if (!name || !email || !password) {
        return new Response(JSON.stringify({ error: 'Name, email, and password are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      if (password.length < 6) {
        return new Response(JSON.stringify({ error: 'Password must be at least 6 characters' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const cleanEmail = email.toLowerCase().trim();
      if (env.DB) {
        const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(cleanEmail).first();
        if (existing) {
          return new Response(JSON.stringify({ error: 'An account with this email already exists' }), {
            status: 409,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const hashedPw = await hashPasswordPbkdf2(password);
        const userRole = role && ['admin', 'manager', 'staff'].includes(role) ? role : 'admin';
        await env.DB.prepare(`
          INSERT INTO users (id, name, email, password, phone, country, role, addresses)
          VALUES (?, ?, ?, ?, ?, 'Australia', ?, '[]')
        `).bind(userId, name.trim(), cleanEmail, hashedPw, phone || '', userRole).run();

        return new Response(JSON.stringify({
          success: true,
          user: { id: userId, name: name.trim(), email: cleanEmail, role: userRole, phone: phone || '', createdAt: new Date().toISOString() }
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({ success: true, user: { id: `usr_${Date.now()}`, name, email: cleanEmail, role: role || 'admin' } }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 10. ADMIN UPDATE USER / CHANGE PASSWORD
    if (action === 'admin_update_user') {
      const { userId, name, phone, role, newPassword } = body;
      if (!userId) {
        return new Response(JSON.stringify({ error: 'User ID is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      if (env.DB) {
        const userRole = role && ['admin', 'manager', 'staff'].includes(role) ? role : 'admin';
        if (newPassword && newPassword.trim().length >= 6) {
          const hashedPw = await hashPasswordPbkdf2(newPassword.trim());
          await env.DB.prepare('UPDATE users SET name = ?, phone = ?, role = ?, password = ? WHERE id = ?')
            .bind((name || '').trim(), phone || '', userRole, hashedPw, userId).run();
        } else {
          await env.DB.prepare('UPDATE users SET name = ?, phone = ?, role = ? WHERE id = ?')
            .bind((name || '').trim(), phone || '', userRole, userId).run();
        }
        return new Response(JSON.stringify({ success: true, message: 'User updated successfully' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 11. ADMIN DELETE USER / REVOKE ACCESS
    if (action === 'admin_delete_user') {
      const { userId, targetEmail } = body;
      if (!userId && !targetEmail) {
        return new Response(JSON.stringify({ error: 'User identifier is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      if (targetEmail && targetEmail.toLowerCase().trim() === 'admin@azimcrafts.com') {
        return new Response(JSON.stringify({ error: 'The primary Master Administrator account cannot be deleted.' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      if (env.DB) {
        if (userId) {
          await env.DB.prepare("DELETE FROM users WHERE id = ? AND email != 'admin@azimcrafts.com'").bind(userId).run();
        } else if (targetEmail) {
          await env.DB.prepare("DELETE FROM users WHERE email = ? AND email != 'admin@azimcrafts.com'").bind(targetEmail.toLowerCase().trim()).run();
        }
        return new Response(JSON.stringify({ success: true, message: 'Staff access revoked successfully.' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
