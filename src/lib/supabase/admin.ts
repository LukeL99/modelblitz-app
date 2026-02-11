import { createClient } from "@supabase/supabase-js";

/**
 * Create a Supabase client with service-role key that bypasses RLS.
 * Server-only -- never expose the service role key to the client.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
