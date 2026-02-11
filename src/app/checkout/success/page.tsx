import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  if (!session_id) {
    redirect("/dashboard");
  }

  const supabase = await createClient();

  // Look up report by stripe_session_id
  const { data: report } = await supabase
    .from("reports")
    .select("id")
    .eq("stripe_session_id", session_id)
    .single();

  if (report) {
    redirect(`/benchmark/${report.id}/processing`);
  }

  // Webhook hasn't processed yet -- show waiting state with auto-refresh
  return (
    <div className="min-h-screen flex items-center justify-center bg-void">
      <div className="text-center space-y-4 max-w-md mx-auto px-6">
        <div className="flex justify-center">
          <div className="w-10 h-10 rounded-full border-2 border-ember border-t-transparent animate-spin" />
        </div>
        <h1 className="text-xl font-bold text-text-primary">
          Setting up your benchmark...
        </h1>
        <p className="text-sm text-text-secondary">
          Your payment was received. We are preparing your benchmark report.
          This page will refresh automatically.
        </p>
        <noscript>
          <meta httpEquiv="refresh" content="2" />
        </noscript>

        <div className="pt-6">
          <p className="text-xs text-text-muted">
            If this takes more than a minute, your benchmark will appear on
            your dashboard shortly.
          </p>
          <Link
            href="/dashboard"
            className="text-sm text-ember hover:text-ember/80 underline underline-offset-2 mt-2 inline-block"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>

      {/* Client-side auto-refresh script */}
      <RefreshScript />
    </div>
  );
}

function RefreshScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            var start = Date.now();
            var interval = setInterval(function() {
              if (Date.now() - start > 30000) {
                clearInterval(interval);
                return;
              }
              window.location.reload();
            }, 2000);
          })();
        `,
      }}
    />
  );
}
