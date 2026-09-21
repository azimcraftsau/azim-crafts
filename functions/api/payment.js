// Cloudflare Pages Function: /api/payment (Razorpay Order Creator)
export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { amount, currency = 'INR', receipt, notes } = body;

    const keyId = env.RAZORPAY_KEY_ID || 'rzp_test_TW9fz7Ibx8tajH';
    const keySecret = env.RAZORPAY_KEY_SECRET || 'vlI82X2jiv5dyyzgFzE4h0lS';

    const credentials = btoa(`${keyId}:${keySecret}`);

    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${credentials}`
      },
      body: JSON.stringify({
        amount: Math.round(amount), // in paise / subunits
        currency: currency.toUpperCase(),
        receipt: receipt || `rcpt_${Date.now()}`,
        notes: notes || {}
      })
    });

    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data.error?.description || 'Razorpay order creation failed' }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      keyId: keyId
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
