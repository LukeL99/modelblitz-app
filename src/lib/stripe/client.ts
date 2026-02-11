import Stripe from "stripe";

/**
 * Stripe server SDK singleton.
 * When DEBUG_MOCK_STRIPE is enabled, exports null (mock mode bypasses Stripe entirely).
 */
export const stripe: Stripe | null =
  process.env.DEBUG_MOCK_STRIPE === "true"
    ? null
    : new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: "2026-01-28.clover",
        typescript: true,
      });
