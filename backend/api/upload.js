// Cloudflare Pages Function: /api/upload (Cloudflare R2 Storage Handler)
export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const formData = await request.formData();
    const file = formData.get('file');
    const folder = formData.get('folder') || 'products';

    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const ext = file.name.split('.').pop() || 'jpg';
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`;

    if (env.BUCKET) {
      const arrayBuffer = await file.arrayBuffer();
      await env.BUCKET.put(fileName, arrayBuffer, {
        httpMetadata: {
          contentType: file.type || 'application/octet-stream'
        }
      });

      const publicDomain = env.R2_PUBLIC_DOMAIN || 'https://media.vintagetomoderncraft.com';
      const fileUrl = `${publicDomain}/${fileName}`;

      return new Response(JSON.stringify({
        success: true,
        url: fileUrl,
        key: fileName
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      url: `/uploads/${fileName}`
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
