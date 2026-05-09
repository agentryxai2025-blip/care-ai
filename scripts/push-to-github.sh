#!/usr/bin/env bash
# Push current branch to the GitHub remote using GITHUB_PAT for authentication.
# Usage: GITHUB_PAT=<token> bash scripts/push-to-github.sh
set -euo pipefail

REMOTE_URL="https://github.com/agentryxai2025-blip/care-ai.git"
AUTH_URL="https://${GITHUB_PAT}@github.com/agentryxai2025-blip/care-ai.git"
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

# Fetch remote tracking refs so --force-with-lease has accurate stale-check data.
# Redirect stderr to suppress the PAT from appearing in logs.
echo "Fetching remote refs..."
git fetch "${AUTH_URL}" "${BRANCH}:refs/remotes/origin/${BRANCH}" 2>/dev/null || true

echo "Pushing branch '${BRANCH}' ..."
# --force-with-lease is safe: Replit is the source of truth, but this prevents
# accidentally overwriting a push made by another user outside of Replit.
git push --force-with-lease \
  "${AUTH_URL}" \
  "${BRANCH}:${BRANCH}"

echo "Push complete."
