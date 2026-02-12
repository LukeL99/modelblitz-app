#!/usr/bin/env bash
set -euo pipefail

ENV_FILE=".env.local"
WEBHOOK_ENDPOINT="http://localhost:3000/api/webhooks/stripe"

cleanup() {
  echo ""
  echo "Shutting down..."
  kill 0 2>/dev/null
  wait 2>/dev/null
  exit 0
}
trap cleanup SIGINT SIGTERM

# Start stripe listen in the background, capturing its output
stripe listen --forward-to "$WEBHOOK_ENDPOINT" > /tmp/stripe-listen.log 2>&1 &
STRIPE_PID=$!

# Wait for the webhook secret to appear in the output
echo "Waiting for Stripe CLI webhook secret..."
WEBHOOK_SECRET=""
for i in $(seq 1 30); do
  if SECRET=$(grep -oE 'whsec_[A-Za-z0-9]+' /tmp/stripe-listen.log 2>/dev/null | head -1); then
    if [ -n "$SECRET" ]; then
      WEBHOOK_SECRET="$SECRET"
      break
    fi
  fi
  sleep 0.5
done

if [ -z "$WEBHOOK_SECRET" ]; then
  echo "ERROR: Could not capture Stripe webhook secret after 15s."
  echo "Stripe CLI output:"
  cat /tmp/stripe-listen.log
  kill $STRIPE_PID 2>/dev/null
  exit 1
fi

echo "Got webhook secret: ${WEBHOOK_SECRET:0:12}..."

# Update or add STRIPE_WEBHOOK_SECRET in .env.local
if grep -q '^STRIPE_WEBHOOK_SECRET=' "$ENV_FILE" 2>/dev/null; then
  # Use a temp file for portable sed in-place editing
  sed "s|^STRIPE_WEBHOOK_SECRET=.*|STRIPE_WEBHOOK_SECRET=$WEBHOOK_SECRET|" "$ENV_FILE" > "$ENV_FILE.tmp"
  mv "$ENV_FILE.tmp" "$ENV_FILE"
  echo "Updated STRIPE_WEBHOOK_SECRET in $ENV_FILE"
else
  echo "" >> "$ENV_FILE"
  echo "STRIPE_WEBHOOK_SECRET=$WEBHOOK_SECRET" >> "$ENV_FILE"
  echo "Added STRIPE_WEBHOOK_SECRET to $ENV_FILE"
fi

# Now start Next.js dev server in the foreground, with stripe running in background
echo ""
echo "Starting Next.js dev server..."
echo "---"
npx next dev --turbopack &
NEXT_PID=$!

# Tail stripe logs so they're visible too
tail -f /tmp/stripe-listen.log &

wait $NEXT_PID
