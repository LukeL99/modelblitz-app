import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-6">
      <div className="max-w-2xl text-center space-y-8">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Find the best vision model{" "}
          <span className="text-ember">for your data</span>
        </h1>
        <p className="text-lg text-text-secondary max-w-lg mx-auto">
          Upload sample images with expected JSON output, and get a detailed
          benchmark report ranking 20+ vision models on accuracy, cost, and
          speed — with field-level error diffs.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/auth/signup"
            className="inline-flex items-center justify-center px-8 py-3 rounded-lg bg-ember hover:bg-ember-hover text-white font-semibold transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center px-8 py-3 rounded-lg border border-surface-border hover:bg-surface-raised text-text-secondary hover:text-text-primary font-semibold transition-colors"
          >
            Sign In
          </Link>
        </div>
        <p className="text-sm text-text-muted">
          One-time $14.99 per benchmark report. No subscription.
        </p>
      </div>
    </div>
  );
}
