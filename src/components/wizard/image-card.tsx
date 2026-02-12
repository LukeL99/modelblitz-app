"use client";

import { useState } from "react";
import { Check, X, Trash2, Minus, Loader2, Pencil } from "lucide-react";
import { SlotDropzone } from "@/components/wizard/image-uploader";
import { JsonEditor } from "@/components/wizard/json-editor";
import type { ImageEntry } from "@/types/wizard";

interface ImageCardProps {
  slotIndex: number;
  image: ImageEntry | null;
  uploading?: boolean;
  onFileAccepted: (file: File) => void;
  onJsonUpdate: (value: string, isValid: boolean, parsed: unknown) => void;
  onRemove: () => void;
  onError: (message: string) => void;
}

function JsonStatusBadge({
  jsonValid,
  expectedJson,
}: {
  jsonValid: boolean;
  expectedJson: string;
}) {
  if (!expectedJson.trim()) {
    return (
      <span className="flex items-center gap-1 text-xs text-text-muted">
        <Minus className="w-3 h-3" />
        No JSON
      </span>
    );
  }
  if (jsonValid) {
    return (
      <span className="flex items-center gap-1 text-xs text-emerald-400">
        <Check className="w-3 h-3" />
        Valid
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs text-red-400">
      <X className="w-3 h-3" />
      Invalid
    </span>
  );
}

export function ImageCard({
  slotIndex,
  image,
  uploading = false,
  onFileAccepted,
  onJsonUpdate,
  onRemove,
  onError,
}: ImageCardProps) {
  // saved state: true when user clicks Save (and JSON is valid)
  // Initialize to true if image already has valid JSON on mount (draft restoration)
  const [saved, setSaved] = useState(() => {
    return image?.jsonValid === true;
  });
  // Toggle for inline full-size image preview
  const [showPreview, setShowPreview] = useState(false);

  const slotLabel = `Image ${slotIndex + 1}`;

  // --- EMPTY STATE: no image yet, show dropzone ---
  if (!image && !uploading) {
    return (
      <div className="rounded-xl border-2 border-dashed border-surface-border bg-surface/50">
        <div className="p-1">
          <SlotDropzone
            slotLabel={slotLabel}
            onFileAccepted={onFileAccepted}
            onError={onError}
          />
        </div>
      </div>
    );
  }

  // --- UPLOADING STATE: show loading spinner ---
  if (uploading && !image) {
    return (
      <div className="rounded-xl border border-surface-border bg-surface p-6 flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-text-muted" />
        <span className="text-sm text-text-muted">Uploading {slotLabel}...</span>
      </div>
    );
  }

  // image is non-null past this point
  if (!image) return null;

  // --- SAVED STATE: compact single row ---
  if (saved) {
    return (
      <div className="rounded-xl border border-surface-border bg-surface overflow-hidden border-l-4 border-l-emerald-500/40">
        {/* Inline full-size preview (toggled by thumbnail click) */}
        {showPreview && (
          <div className="border-b border-surface-border p-4 flex justify-center bg-surface-raised/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.publicUrl}
              alt={image.filename}
              className="max-w-md max-h-64 rounded-lg object-contain"
            />
          </div>
        )}

        <div className="flex items-center gap-3 p-3">
          {/* Thumbnail */}
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-surface-raised relative"
          >
            {uploading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-text-muted" />
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image.publicUrl}
                alt={image.filename}
                className="w-full h-full object-cover"
              />
            )}
          </button>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              {slotLabel}: {image.filename}
            </p>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="text-xs text-text-muted">
                {(image.fileSize / 1024).toFixed(0)} KB
              </span>
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <Check className="w-3 h-3" />
                Valid
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => setSaved(false)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors"
              title="Edit JSON"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-surface-raised transition-colors"
              title="Remove image"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- EDITING STATE: thumbnail + JSON editor + Save button ---
  return (
    <div className="rounded-xl border border-ember/30 bg-surface overflow-hidden">
      {/* Inline full-size preview (toggled by thumbnail click) */}
      {showPreview && (
        <div className="border-b border-surface-border p-4 flex justify-center bg-surface-raised/50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.publicUrl}
            alt={image.filename}
            className="max-w-md max-h-64 rounded-lg object-contain"
          />
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center gap-3 p-3">
        {/* Thumbnail */}
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-surface-raised relative"
        >
          {uploading ? (
            <div className="w-full h-full flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin text-text-muted" />
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={image.publicUrl}
              alt={image.filename}
              className="w-full h-full object-cover"
            />
          )}
        </button>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">
            {slotLabel}: {image.filename}
          </p>
          <div className="flex items-center gap-3 mt-0.5">
            {uploading ? (
              <span className="text-xs text-text-muted">Uploading...</span>
            ) : (
              <span className="text-xs text-text-muted">
                {(image.fileSize / 1024).toFixed(0)} KB
              </span>
            )}
            <JsonStatusBadge
              jsonValid={image.jsonValid}
              expectedJson={image.expectedJson}
            />
          </div>
        </div>

        {/* Remove button */}
        <button
          type="button"
          onClick={onRemove}
          className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-surface-raised transition-colors flex-shrink-0"
          title="Remove image"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* JSON editor */}
      <div className="border-t border-surface-border p-4 space-y-4">
        <JsonEditor
          value={image.expectedJson}
          onChange={onJsonUpdate}
        />

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setSaved(true)}
            disabled={!image.jsonValid}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              image.jsonValid
                ? "bg-ember text-white hover:bg-ember/90"
                : "bg-surface-raised text-text-muted cursor-not-allowed"
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
