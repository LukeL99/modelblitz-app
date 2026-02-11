import Link from "next/link";

export default async function CheckoutCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ draft?: string }>;
}) {
  const { draft: draftId } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-void">
      <div className="text-center space-y-6 max-w-md mx-auto px-6">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full bg-surface-raised border border-surface-border flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-7 h-7 text-text-muted"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m15 9-6 6" />
              <path d="m9 9 6 6" />
            </svg>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-text-primary">
            Payment Cancelled
          </h1>
          <p className="text-sm text-text-secondary">
            Your payment was not processed. No charges were made. You can try
            again whenever you are ready.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          {draftId ? (
            <Link
              href={`/benchmark/new?draft=${draftId}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-ember px-6 py-3 text-sm font-semibold text-white hover:bg-ember/90 transition-colors"
            >
              Try Again
            </Link>
          ) : (
            <Link
              href="/benchmark/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-ember px-6 py-3 text-sm font-semibold text-white hover:bg-ember/90 transition-colors"
            >
              Start New Benchmark
            </Link>
          )}
          <Link
            href="/dashboard"
            className="text-sm text-text-muted hover:text-text-secondary transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
