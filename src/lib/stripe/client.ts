import Stripe from "stripe";

/**
 * Stripe server SDK singleton (lazy-initialized).
 * When DEBUG_MOCK_STRIPE is enabled, returns null (mock mode bypasses Stripe entirely).
 * Lazy initialization prevents build failures when STRIPE_SECRET_KEY is not set.
 */
let _stripe: Stripe | null | undefined;

export function getStripe(): Stripe | null {
  if (process.env.DEBUG_MOCK_STRIPE === "true") {
    return null;
  }

  if (_stripe === undefined) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      console.warn("[stripe] STRIPE_SECRET_KEY not set, Stripe client unavailable");
      _stripe = null;
    } else {
      _stripe = new Stripe(key, {
        apiVersion: "2026-01-28.clover",
        typescript: true,
      });
    }
  }

  return _stripe;
}
