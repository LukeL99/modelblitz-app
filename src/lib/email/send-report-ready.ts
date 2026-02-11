/**
 * Send report completion email via Resend.
 *
 * Stub: full implementation in Task 2 of Plan 02-03.
 */

export interface SendReportReadyParams {
  to: string;
  reportId: string;
  shareToken: string;
  modelCount: number;
  imageCount: number;
  recommendedModel: string | null;
}

/**
 * Send the "report ready" email notification.
 * Currently logs in mock mode; full Resend integration in Task 2.
 */
export async function sendReportReadyEmail(
  params: SendReportReadyParams
): Promise<void> {
  console.log("[email:stub] sendReportReadyEmail called:", {
    to: params.to,
    reportId: params.reportId,
    modelCount: params.modelCount,
    recommendedModel: params.recommendedModel,
  });
}
