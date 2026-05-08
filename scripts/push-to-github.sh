#!/usr/bin/env bash
# Push current branch to the GitHub remote using GITHUB_PAT for authentication.
# Usage: GITHUB_PAT=<token> bash scripts/push-to-github.sh
set -euo pipefail

REMOTE_URL="https://github.com/agentryxai2025-blip/care-ai.git"
BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [ -z "${GITHUB_PAT:-}" ]; then
  echo "ERROR: GITHUB_PAT environment variable is not set." >&2
  echo "       Add it via Replit Secrets (Secrets tab) before running this script." >&2
  exit 1
fi

# Ensure the origin remote points to the correct repository
if git remote get-url origin &>/dev/null; then
  git remote set-url origin "${REMOTE_URL}"
else
  git remote add origin "${REMOTE_URL}"
fi

echo "Remote 'origin' is set to: ${REMOTE_URL}"
echo "Pushing branch '${BRANCH}' ..."

# Use --force-with-lease so Replit is always the source of truth.
# This handles non-fast-forward situations (e.g. GitHub Actions commits)
# without blindly overwriting any push another human may have made concurrently.
git push --force-with-lease \
  "https://${GITHUB_PAT}@github.com/agentryxai2025-blip/care-ai.git" \
  "${BRANCH}:${BRANCH}"

echo "Push complete."
