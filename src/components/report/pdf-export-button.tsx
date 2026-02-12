"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";

interface PdfExportButtonProps {
  filename?: string;
}

export function PdfExportButton({
  filename = "benchmark-report.pdf",
}: PdfExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  async function handleExport() {
    setExporting(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const element = document.getElementById("report-content");
      if (!element) return;

      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename,
          image: { type: "jpeg", quality: 0.95 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#0A0A0B" },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        })
        .from(element)
        .save();
    } catch (err) {
      console.error("PDF export failed:", err);
    } finally {
      setExporting(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors bg-surface-raised border border-surface-border text-text-primary hover:bg-surface hover:border-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-surface-border focus-visible:ring-offset-2 focus-visible:ring-offset-void disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <FileDown className="h-4 w-4" />
      {exporting ? "Exporting..." : "Export PDF"}
    </button>
  );
}
