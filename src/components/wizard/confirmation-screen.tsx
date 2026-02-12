"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, Layers, ImageIcon, Zap, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";
import { REPORT_PRICE } from "@/lib/config/constants";
import { useMocks } from "@/lib/debug/mock-provider";

interface ConfirmationScreenProps {
  draftId: string;
  configData: {
    priorities: string[];
    strategy: string;
    sampleCount: number;
  };
  selectedModels: string[];
  onCancel: () => void;
}

export function ConfirmationScreen({
  draftId,
  configData,
  selectedModels,
  onCancel,
}: ConfirmationScreenProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mocks = useMocks();
  const isMock = mocks.includes("stripe");

  async function handleCheckout() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftId,
          ...(isMock ? { mock: true } : {}),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      if (isMock && data.reportId) {
        // Mock mode: navigate directly to processing page
        router.push(`/benchmark/${data.reportId}/processing`);
      } else if (data.url) {
        // Real Stripe: redirect to Checkout
        window.location.href = data.url;
      } else {
        setError("Unexpected response. Please try again.");
        setLoading(false);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  const priceFormatted = `$${REPORT_PRICE.toFixed(2)}`;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-text-primary">
          Confirm Your Benchmark
        </h2>
        <p className="text-sm text-text-secondary">
          Review your configuration before proceeding to payment.
        </p>
      </div>

      {/* Summary card */}
      <div className="rounded-xl border border-surface-border bg-surface-raised p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-ember/10">
              <Layers className="w-4 h-4 text-ember" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Models</p>
              <p className="text-sm font-semibold text-text-primary">
                {selectedModels.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-ember/10">
              <ImageIcon className="w-4 h-4 text-ember" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Sample images</p>
              <p className="text-sm font-semibold text-text-primary">
                {configData.sampleCount}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-ember/10">
              <Zap className="w-4 h-4 text-ember" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Strategy</p>
              <p className="text-sm font-semibold text-text-primary capitalize">
                {configData.strategy}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-ember/10">
              <ListOrdered className="w-4 h-4 text-ember" />
            </div>
            <div>
              <p className="text-xs text-text-muted">Priority</p>
              <p className="text-sm font-semibold text-text-primary capitalize">
                {configData.priorities[0]}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-surface-border pt-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">Total</span>
            <span className="text-2xl font-bold text-text-primary">
              {priceFormatted}
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            This is a one-time payment. You will receive a comprehensive
            benchmark report.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-800/50 bg-red-950/30 px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          size="lg"
          onClick={onCancel}
          disabled={loading}
          className="flex-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Edit
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={handleCheckout}
          disabled={loading}
          className="flex-1"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              Pay {priceFormatted}
            </>
          )}
        </Button>
      </div>

      {isMock && (
        <p className="text-xs text-amber-400 text-center">
          Mock mode: Payment will be simulated (no real charge).
        </p>
      )}
    </div>
  );
}
