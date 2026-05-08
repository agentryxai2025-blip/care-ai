#!/bin/bash
set -e

pnpm install --frozen-lockfile
pnpm --filter db push

# Auto-sync to GitHub if GITHUB_PAT is available
if [ -n "${GITHUB_PAT:-}" ]; then
  echo "Syncing to GitHub..."
  bash scripts/push-to-github.sh
  echo "GitHub sync complete."
else
  echo "GITHUB_PAT not set — skipping GitHub sync."
fi
