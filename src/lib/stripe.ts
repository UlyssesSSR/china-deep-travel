import Stripe from 'stripe';

/**
 * Stripe client singleton. Returns null when STRIPE_SECRET_KEY is not configured
 * so callers can distinguish "not configured" from "configured but broken".
 */
let _stripe: Stripe | null = null;
let _checked = false;

export function getStripe(): Stripe | null {
  if (_checked) return _stripe;
  _checked = true;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  _stripe = new Stripe(key, { apiVersion: '2024-06-20', typescript: true });
  return _stripe;
}
