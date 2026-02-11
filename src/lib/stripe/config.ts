/**
 * Stripe configuration constants.
 */

/** Stripe webhook signing secret */
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

/** Base URL for constructing Stripe redirect URLs */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Stripe Checkout success redirect URL */
export const CHECKOUT_SUCCESS_URL = `${SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;

/** Stripe Checkout cancel redirect URL (draft ID appended dynamically) */
export function getCheckoutCancelUrl(draftId: string): string {
  return `${SITE_URL}/checkout/cancel?draft=${draftId}`;
}
