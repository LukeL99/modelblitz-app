---
status: diagnosed
trigger: "Step 2 allows unlimited uploads instead of N structured cards matching sample count from Step 1"
created: 2026-02-11T00:00:00Z
updated: 2026-02-11T00:00:00Z
---

## Current Focus

hypothesis: CONFIRMED - Step 2 uses a free-form upload model instead of N pre-defined upload slots
test: Code review of all relevant components
expecting: Architecture mismatch between "upload anything" and "N structured cards"
next_action: Return diagnosis

## Symptoms

expected: Step 2 should create exactly N upload cards (matching sample count from Step 1), each with its own upload zone. After uploading, the image collapses to a thumbnail and reveals the JSON editor. Clicking the thumbnail shows full-size. Clicking "Save" collapses the card.
actual: Single shared dropzone allows unlimited uploads. No pre-defined card slots. Images show full-size when expanded (no thumbnail-first behavior). No per-card "Save" button.
errors: None (functional but wrong UX pattern)
reproduction: Select 1 image in Step 1, go to Step 2, upload multiple images - no limit enforced at the card level
started: Original implementation - never matched the intended UX

## Eliminated

(none - root cause was clear from initial code review)

## Evidence

- timestamp: 2026-02-11T00:01:00Z
  checked: step-upload.tsx architecture
  found: Uses a SINGLE ImageUploader dropzone at the top, then renders ImageCard components dynamically as images are uploaded. No concept of "slots" or pre-defined cards.
  implication: The entire upload model is wrong - it's "upload files then they appear" instead of "here are N slots, fill each one"

- timestamp: 2026-02-11T00:02:00Z
  checked: image-uploader.tsx limit logic
  found: Uses MAX_IMAGES (10) from constants as the limit, NOT sampleCount. Line 24: `const remainingSlots = MAX_IMAGES - currentCount`. sampleCount is never passed to ImageUploader.
  implication: The upload zone enforces a global max (10) instead of the user-selected sample count

- timestamp: 2026-02-11T00:03:00Z
  checked: image-card.tsx expand/collapse behavior
  found: Card starts expanded if no JSON exists (line 54: `useState(!image.expectedJson.trim())`). When expanded, shows FULL image preview + JSON editor together. No "Save" button. No thumbnail-first state after upload.
  implication: Cards don't follow the intended lifecycle: upload -> thumbnail + JSON editor -> Save -> collapsed

- timestamp: 2026-02-11T00:04:00Z
  checked: page.tsx data flow for sampleCount
  found: sampleCount IS correctly passed from configData to StepUpload (line 387). It's used in validation (line 174 in step-upload: `totalCount >= sampleCount`) but NOT used to create pre-defined upload slots.
  implication: Data flow is correct; the problem is purely in the UI architecture of step-upload and image-uploader

- timestamp: 2026-02-11T00:05:00Z
  checked: step-upload.tsx handleFilesAccepted
  found: Accepts arbitrary file arrays, creates entries dynamically with nanoid(), appends to existing images array. No concept of "fill slot N" - just "add more images".
  implication: The upload handler needs to be restructured to assign files to specific slots

## Resolution

root_cause: The Step 2 upload UI uses a fundamentally different architecture than what the UX requires. Instead of N pre-defined upload card slots (one per sample count), it uses a single shared dropzone that allows unlimited uploads (capped at MAX_IMAGES=10, not sampleCount). The ImageCard component also lacks the correct state machine: it should start as an empty upload zone, transition to thumbnail+JSON editor on upload, and collapse on Save. Currently it starts fully expanded with the image shown full-size.

fix: (not applied - diagnosis only)
verification: (not applied - diagnosis only)
files_changed: []
