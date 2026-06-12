const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Airtable = require('airtable');

// Initialize Airtable with your PAT and base ID
const base = new Airtable({ apiKey: process.env.AIRTABLE_PAT })
  .base(process.env.AIRTABLE_BASE_ID);
const blockedTable = base('BlockedRanges');

exports.handler = async (event) => {
  // 1. Only accept POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // 2. Verify Stripe webhook signature
  const sig = event.headers['stripe-signature'];
  let webhookEvent;

  try {
    // Construct the event using the raw request body
    webhookEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  // 3. Handle the specific event type
  if (webhookEvent.type === 'payment_intent.succeeded') {
    const paymentIntent = webhookEvent.data.object;
    const metadata = paymentIntent.metadata || {};

    // Retrieve rental dates from the metadata you set when creating the Checkout Session
    const startDate = metadata.rental_start;
    const endDate = metadata.rental_end;
    const customerEmail = metadata.customer_email;

    // Validate required fields
    if (!startDate || !endDate || !customerEmail) {
      console.error('Missing metadata: startDate, endDate, or customerEmail');
      return { statusCode: 200, body: 'Event received but missing metadata' };
    }

    // 4. Write the blocked date range to Airtable
    try {
      await blockedTable.create([
        {
          fields: {
            startDate: startDate,
            endDate: endDate,
            reason: `Booked by ${customerEmail} (PaymentIntent: ${paymentIntent.id})`,
          },
        },
      ]);
      console.log(`Blocked dates ${startDate} to ${endDate} for ${customerEmail}`);
    } catch (airtableError) {
      console.error('Failed to write to Airtable:', airtableError);
      // ⚠️ Even if Airtable fails, return 200 so Stripe doesn't retry.
      // In production, add retry logic or a dead‑letter queue.
      return { statusCode: 200, body: 'Webhook received but Airtable write failed (logged)' };
    }
  }

  // Always acknowledge receipt of the event to Stripe
  return { statusCode: 200, body: 'Webhook received' };
};
