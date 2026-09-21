// Cloudflare Pages Function: /api/paypal (PayPal Orders API Handler)
export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { action, orderId, amount, currency = 'USD' } = body;

    const clientId = env.PAYPAL_CLIENT_ID || env.VITE_PAYPAL_CLIENT_ID;
    const secret = env.PAYPAL_CLIENT_SECRET;
    if (!clientId || !secret) {
      return new Response(JSON.stringify({ error: 'PayPal credentials not configured in environment.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    const isLive = env.PAYPAL_ENV === 'live' || env.VITE_PAYPAL_ENV === 'live';
    const baseUrl = isLive ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';

    // 1. Get OAuth Access Token
    const auth = btoa(`${clientId}:${secret}`);
    const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      return new Response(JSON.stringify({ error: tokenData.error_description || 'PayPal authentication failed' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const accessToken = tokenData.access_token;

    // 2. Create Order
    if (action === 'create') {
      const createRes = await fetch(`${baseUrl}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: currency.toUpperCase(),
              value: Number(amount).toFixed(2)
            },
            description: body.description || 'Azim Crafts Order'
          }]
        })
      });
      const orderData = await createRes.json();
      return new Response(JSON.stringify(orderData), {
        status: createRes.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. Capture Order
    if (action === 'capture') {
      const captureRes = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      const captureData = await captureRes.json();
      return new Response(JSON.stringify(captureData), {
        status: captureRes.status,
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
