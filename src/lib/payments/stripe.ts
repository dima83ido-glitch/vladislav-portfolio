import Stripe from "stripe";

let client: Stripe | undefined;

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

/** Lazy singleton, same pattern as getDb()/resend's getClient() — only
 * throws once something actually tries to call Stripe, never at import
 * time. Every call site should check isStripeConfigured() first and show
 * a "coming soon" state instead of ever reaching this when it's false. */
export function getStripeClient(): Stripe {
  if (!client) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    client = new Stripe(apiKey);
  }
  return client;
}
