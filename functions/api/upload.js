// Cloudflare Pages Function: /api/upload (Cloudflare R2 & Media Storage Handler)
export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const contentType = request.headers.get('content-type') || '';
    
    let fileBuffer = null;
    let fileName = '';
    let fileMime = 'image/jpeg';
    let folder = 'products';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      if (!body.data) {
        return new Response(JSON.stringify({ error: 'No data provided' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      folder = body.folder || 'products';
      const name = body.name || 'upload.jpg';
      const ext = name.split('.').pop() || 'jpg';
      fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

      // Extract base64
      const matches = body.data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches) {
        fileMime = matches[1];
        const binaryStr = atob(matches[2]);
        const len = binaryStr.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        fileBuffer = bytes.buffer;
      } else {
        return new Response(JSON.stringify({ success: true, url: body.data }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }
    } else {
      const formData = await request.formData();
      const file = formData.get('file');
      folder = formData.get('folder') || 'products';
      if (!file) {
        return new Response(JSON.stringify({ error: 'No file provided' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const ext = file.name ? file.name.split('.').pop() : 'jpg';
      fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;
      fileMime = file.type || 'application/octet-stream';
      fileBuffer = await file.arrayBuffer();
    }

    if (env.BUCKET && fileBuffer) {
      await env.BUCKET.put(fileName, fileBuffer, {
        httpMetadata: { contentType: fileMime }
      });
      const publicDomain = env.R2_PUBLIC_DOMAIN || 'https://media.azimcrafts.com';
      return new Response(JSON.stringify({
        success: true,
        url: `${publicDomain}/${fileName}`,
        key: fileName
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({
      success: true,
      url: `/uploads/${fileName}`
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
