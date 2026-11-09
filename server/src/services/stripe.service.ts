import Stripe from 'stripe';

function getStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('Missing STRIPE_SECRET_KEY environment variable');
  return new Stripe(key, { apiVersion: '2025-02-24.acacia' });
}

export async function createPaymentIntent(
  amountInCents: number,
  currency: string = 'usd',
  metadata: Record<string, string> = {},
): Promise<Stripe.PaymentIntent> {
  const stripe = getStripeClient();
  return stripe.paymentIntents.create({
    amount: amountInCents,
    currency,
    metadata,
    automatic_payment_methods: { enabled: true },
  });
}

export async function createRefund(paymentIntentId: string): Promise<Stripe.Refund> {
  const stripe = getStripeClient();
  return stripe.refunds.create({ payment_intent: paymentIntentId });
}

export function constructWebhookEvent(
  payload: Buffer,
  signature: string,
): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error('Missing STRIPE_WEBHOOK_SECRET environment variable');
  const stripe = getStripeClient();
  return stripe.webhooks.constructEvent(payload, signature, secret);
}
