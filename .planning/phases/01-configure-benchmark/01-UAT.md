---
status: diagnosed
phase: 01-configure-benchmark
source: 01-01-SUMMARY.md, 01-02-SUMMARY.md, 01-03-SUMMARY.md, 01-04-SUMMARY.md
started: 2026-02-11T21:00:00Z
updated: 2026-02-11T21:10:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Landing Page
expected: Navigating to http://localhost:3000 shows a landing page with ModelPick branding, dark background with ember/orange accents, hero section describing the product, and a "Get Started" call-to-action button.
result: pass

### 2. Auth Pages Layout
expected: Navigating to /auth/login shows a centered card with Google and GitHub social login buttons above a divider, and an email/password form below with a "Magic Link" toggle. /auth/signup shows a similar layout with a registration form.
result: pass

### 3. Auth Guard
expected: Visiting /dashboard while not logged in automatically redirects to /auth/login.
result: pass

### 4. Dashboard Empty State
expected: After logging in, /dashboard shows an empty state with "Run your first benchmark" messaging and a CTA. The nav bar shows user email, "New Benchmark" button, and sign-out button.
result: pass

### 5. Sign Out
expected: Clicking the sign-out button in the nav logs the user out and redirects to the landing page (/).
result: pass

### 6. Wizard Step 1 — Config
expected: Navigating to /benchmark/new shows a 3-step indicator (Configure/Upload/Review). Step 1 displays drag-to-rank priorities (reorderable), three strategy preset cards (Quick Survey/Balanced/Deep Dive) that highlight on selection, and a sample count selector with +/- buttons.
result: pass

### 7. Step 2 — Image Upload
expected: After completing Step 1 and clicking Continue, Step 2 shows a drag-and-drop upload zone. Dropping or selecting images (PNG/JPG) displays thumbnail cards with status badges. Images upload successfully to Supabase Storage.
result: issue
reported: "if I choose 1 image in phase 1, it doesn't limit me to uploading 1 image in phase 2 (I can upload as many as I want). Instead of 1 upload card, there should be as many cards as the user selected in phase 1 (Image 1, Image 2, Image 3, Image 4) with a drag to upload or click to upload zone. When the user uploads the image, it should collapse down to thumbnail (don't show it full size) and it should prompt for the JSON schema in the editor. If the user clicks the thumbnail, then show the full size image. When the user clicks Save on each image, it should collapse that card to clean up screen real estate for uploading the other images and JSON"
severity: major

### 8. Step 2 — JSON Editor & Gate
expected: Each image card expands to reveal a CodeMirror JSON editor. Entering invalid JSON shows red underline errors. The Continue button to Step 3 is disabled until every uploaded image has valid JSON entered.
result: pass

### 9. Step 3 — Schema, Prompt & Cost
expected: Step 3 auto-infers a JSON schema from the uploaded examples shown in a read-only editor (with toggle to manual edit). An extraction prompt textarea is present. A cost preview card shows estimated cost, number of models, runs, time estimate, and budget utilization bar. Model chips allow adding/removing models.
result: pass

### 10. Wizard Completion
expected: After entering an extraction prompt (20+ chars) and confirming model selection, a "Ready for Payment" button appears. Clicking it completes the wizard and sets the draft status to 'ready'.
result: pass

## Summary

total: 10
passed: 9
issues: 1
pending: 0
skipped: 0

## Gaps

- truth: "Step 2 limits uploads to sample count from Step 1 and uses structured card-per-image UX"
  status: failed
  reason: "User reported: if I choose 1 image in phase 1, it doesn't limit me to uploading 1 image in phase 2 (I can upload as many as I want). Instead of 1 upload card, there should be as many cards as the user selected in phase 1 (Image 1, Image 2, Image 3, Image 4) with a drag to upload or click to upload zone. When the user uploads the image, it should collapse down to thumbnail (don't show it full size) and it should prompt for the JSON schema in the editor. If the user clicks the thumbnail, then show the full size image. When the user clicks Save on each image, it should collapse that card to clean up screen real estate for uploading the other images and JSON"
  severity: major
  test: 7
  root_cause: "StepUpload uses a single shared dropzone with dynamic card creation capped at MAX_IMAGES=10, ignoring sampleCount from Step 1. ImageCard has no three-state lifecycle (empty/editing/saved) and no Save button. Newly uploaded images start fully expanded instead of showing thumbnail with JSON editor."
  artifacts:
    - path: "src/components/wizard/step-upload.tsx"
      issue: "Single shared dropzone + dynamic cards instead of N pre-defined upload slots based on sampleCount"
    - path: "src/components/wizard/image-uploader.tsx"
      issue: "Uses MAX_IMAGES (10) as limit, never receives or respects sampleCount"
    - path: "src/components/wizard/image-card.tsx"
      issue: "Only two states (expanded/collapsed), needs three (empty/editing/saved) plus Save button and thumbnail-click-to-expand"
  missing:
    - "Restructure StepUpload to pre-initialize N empty slots based on sampleCount, each card has its own embedded dropzone"
    - "Add three-state ImageCard lifecycle: empty (upload zone), editing (thumbnail + JSON editor + Save), saved (collapsed thumbnail row)"
    - "Add Save button per card that validates JSON and collapses the card"
    - "Thumbnail-click-to-expand for viewing full-size image"
  debug_session: ".planning/debug/step2-upload-cards.md"
