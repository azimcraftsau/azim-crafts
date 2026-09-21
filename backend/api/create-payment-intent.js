// Cloudflare Pages Function: /api/create-payment-intent (Stripe Live PaymentIntent Creator)
export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { amount, currency = 'usd', orderId, customerEmail, customerName } = body;

    const amountInCents = Math.round((Number(amount) || 0) * 100);
    if (amountInCents < 50) {
      return new Response(JSON.stringify({ success: false, error: 'Minimum amount is $0.50 USD' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const stripeKey = env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return new Response(JSON.stringify({ success: false, error: 'Stripe secret key not configured in environment.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const formParams = new URLSearchParams();
    formParams.append('amount', String(amountInCents));
    formParams.append('currency', (currency || 'usd').toLowerCase());
    formParams.append('description', `Azim Crafts Order ${orderId || 'Direct'} (${customerName || customerEmail || 'Customer'})`);
    if (customerEmail) formParams.append('receipt_email', customerEmail);
    if (orderId) formParams.append('metadata[orderId]', orderId);
    if (customerName) formParams.append('metadata[customerName]', customerName);
    if (customerEmail) formParams.append('metadata[customerEmail]', customerEmail);
    formParams.append('automatic_payment_methods[enabled]', 'true');

    const res = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formParams.toString()
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      return new Response(JSON.stringify({ success: false, error: data.error?.message || 'Stripe initialization failed' }), {
        status: res.status || 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      clientSecret: data.client_secret,
      paymentIntentId: data.id
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
