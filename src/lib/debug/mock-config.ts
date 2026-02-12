/**
 * Debug mock configuration.
 * Reads environment variables to determine which services are mocked.
 */

/** Check if Stripe is mocked (server-side) */
export function isMockStripe(): boolean {
  return process.env.DEBUG_MOCK_STRIPE === "true";
}

/** Check if OpenRouter is mocked (server-side) */
export function isMockOpenRouter(): boolean {
  return process.env.DEBUG_MOCK_OPENROUTER === "true";
}

/** Check if Email (Resend) is mocked (server-side) */
export function isMockEmail(): boolean {
  return process.env.DEBUG_MOCK_EMAIL === "true";
}

/** Get list of active mock service names (server-side) */
export function getActiveMocks(): string[] {
  const mocks: string[] = [];
  if (isMockStripe()) mocks.push("stripe");
  if (isMockOpenRouter()) mocks.push("openrouter");
  if (isMockEmail()) mocks.push("email");
  return mocks;
}

