import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { nanoid } from "nanoid";
import { getStripe } from "@/lib/stripe/client";
import { STRIPE_WEBHOOK_SECRET } from "@/lib/stripe/config";
import { createAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 10;

export async function POST(request: NextRequest) {
  const stripeClient = getStripe();
  if (!stripeClient) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 }
    );
  }

  // CRITICAL: Use request.text() not request.json() for signature verification
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    );
  }

  let event;
  try {
    event = stripeClient.webhooks.constructEvent(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const draftId = session.metadata?.draft_id;
    const userId = session.metadata?.user_id;
    const optimizedRunsStr = session.metadata?.optimized_runs_per_model;
    const optimizedRuns = optimizedRunsStr
      ? parseInt(optimizedRunsStr, 10)
      : undefined;

    if (!draftId || !userId) {
      console.error("[webhook] Missing metadata:", session.metadata);
      return NextResponse.json(
        { error: "Missing metadata" },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Idempotency check: skip if already processed
    const { data: existingReport } = await admin
      .from("reports")
      .select("id")
      .eq("stripe_session_id", session.id)
      .single();

    if (existingReport) {
      console.log(
        `[webhook] Already processed session ${session.id}, report ${existingReport.id}`
      );
      return NextResponse.json({ message: "Already processed" });
    }

    // Load draft
    const { data: draft, error: draftError } = await admin
      .from("benchmark_drafts")
      .select("*")
      .eq("id", draftId)
      .single();

    if (draftError || !draft) {
      console.error("[webhook] Draft not found:", draftId, draftError);
      return NextResponse.json(
        { error: "Draft not found" },
        { status: 404 }
      );
    }

    const configData = (draft.config_data ?? {}) as Record<string, unknown>;
    const uploadData = (draft.upload_data ?? {}) as Record<string, unknown>;
    const schemaData = (draft.schema_data ?? {}) as Record<string, unknown>;
    const selectedModelIds =
      (schemaData?.selectedModelIds as string[]) ?? [];
    const images =
      (uploadData?.images as Array<{ path: string }>) ?? [];

    // Build config snapshot, overriding sampleCount if optimized
    const configSnapshot = {
      ...configData,
      ...(optimizedRuns !== undefined
        ? { sampleCount: optimizedRuns }
        : {}),
      selected_models: selectedModelIds,
      schema_data: schemaData,
      upload_data: uploadData,
    };

    // Parse JSON schema from schema data
    let jsonSchema: Record<string, unknown> = {};
    try {
      if (schemaData?.userSchema) {
        jsonSchema = JSON.parse(schemaData.userSchema as string);
      } else if (schemaData?.inferredSchema) {
        jsonSchema = schemaData.inferredSchema as Record<string, unknown>;
      }
    } catch {
      console.error("[webhook] Failed to parse JSON schema");
    }

    // Create report record
    const shareToken = nanoid(22);

    const { data: report, error: reportError } = await admin
      .from("reports")
      .insert({
        user_id: userId,
        draft_id: draftId,
        stripe_session_id: session.id,
        status: "paid",
        share_token: shareToken,
        config_snapshot: configSnapshot,
        image_paths: images.map((img) => img.path),
        extraction_prompt: (schemaData?.prompt as string) ?? "",
        json_schema: jsonSchema,
        model_count: selectedModelIds.length,
      })
      .select("id")
      .single();

    if (reportError) {
      console.error("[webhook] Report creation failed:", reportError);
      return NextResponse.json(
        { error: "Failed to create report" },
        { status: 500 }
      );
    }

    // Update draft status to paid
    await admin
      .from("benchmark_drafts")
      .update({ status: "paid" })
      .eq("id", draftId);

    console.log(
      `[webhook] Created report ${report.id} for session ${session.id}`
    );

    // Defer benchmark execution via after()
    after(async () => {
      try {
        const { runBenchmark } = await import("@/lib/benchmark/engine");
        await runBenchmark(report.id);
      } catch (err) {
        console.error("[webhook:after] Benchmark engine error:", err);
      }
    });

    return NextResponse.json({ message: "OK" });
  }

  // Unhandled event type - acknowledge receipt
  return NextResponse.json({ message: "Event type not handled" });
}
