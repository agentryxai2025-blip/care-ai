#!/bin/bash
set -e

GITHUB_REPO="agentryxai2025-blip/care-ai"

pnpm install --frozen-lockfile
pnpm --filter db push

# Auto-sync to GitHub if GITHUB_PAT is available.
# Skipping when GITHUB_PAT is unset is intentional — the secret is opt-in.
if [ -n "${GITHUB_PAT:-}" ]; then
  echo "Syncing to GitHub..."
  if bash scripts/push-to-github.sh; then
    echo "GitHub sync complete."
  else
    PUSH_EXIT=$?
    TIMESTAMP=$(date -u "+%Y-%m-%d %H:%M UTC")
    COMMIT_SHA=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

    echo ""
    echo "=============================================="
    echo "  GITHUB SYNC FAILED"
    echo "  Commit: ${COMMIT_SHA}  Time: ${TIMESTAMP}"
    echo "  Possible causes:"
    echo "    - GITHUB_PAT has expired or been revoked"
    echo "    - Network error reaching github.com"
    echo "    - Remote rejected the push (force-with-lease conflict)"
    echo ""
    echo "  To fix: update GITHUB_PAT in Replit Secrets,"
    echo "  then run: bash scripts/push-to-github.sh"
    echo "=============================================="
    echo ""

    # ── Primary alert: Slack webhook ──────────────────────────────────────────
    # SLACK_WEBHOOK_URL must be added to Replit Secrets. It is completely
    # independent of GITHUB_PAT, so it works even when the PAT is expired.
    # To set up: create an incoming webhook at https://api.slack.com/apps and
    # store the URL as SLACK_WEBHOOK_URL in Replit Secrets.
    if [ -n "${SLACK_WEBHOOK_URL:-}" ]; then
      SLACK_PAYLOAD="{\"text\":\":x: *GitHub sync failed* for \`${GITHUB_REPO}\`\n*Commit:* \`${COMMIT_SHA}\`  *Time:* ${TIMESTAMP}\n\nLikely cause: \`GITHUB_PAT\` expired/revoked or network error.\nFix: refresh \`GITHUB_PAT\` in Replit Secrets, then run \`bash scripts/push-to-github.sh\`\"}"
      # Use || true so a transport-level curl error (DNS/TLS) does not trigger
      # set -e and abort the script before we log the outcome or exit cleanly.
      SLACK_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
        --max-time 10 \
        -X POST \
        -H "Content-Type: application/json" \
        -d "${SLACK_PAYLOAD}" \
        "${SLACK_WEBHOOK_URL}" 2>/dev/null) || SLACK_STATUS="curl-error"
      if [ "${SLACK_STATUS}" = "200" ]; then
        echo "Slack alert sent successfully."
      else
        echo "Slack alert failed (status: ${SLACK_STATUS}) — check SLACK_WEBHOOK_URL."
      fi
    else
      echo "SLACK_WEBHOOK_URL not set — skipping Slack alert."
      echo "Add SLACK_WEBHOOK_URL to Replit Secrets for proactive failure notifications."
    fi

    # ── Secondary alert: GitHub issue (best-effort; may fail if PAT expired) ──
    ISSUE_TITLE="[Sync Failure] Replit → GitHub push failed (${TIMESTAMP})"
    ISSUE_BODY="## GitHub sync failed\n\n**Commit:** \`${COMMIT_SHA}\`\n**Time:** ${TIMESTAMP}\n\n### Likely causes\n- \`GITHUB_PAT\` has expired or been revoked\n- Network error reaching github.com\n- Remote rejected the push (force-with-lease conflict)\n\n### How to fix\n1. Refresh \`GITHUB_PAT\` in **Replit Secrets**\n2. Re-run: \`bash scripts/push-to-github.sh\`\n3. Close this issue once the push succeeds."

    # Use || true for the same reason: transport errors must not abort the script.
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
      --max-time 10 \
      -X POST \
      -H "Authorization: token ${GITHUB_PAT}" \
      -H "Accept: application/vnd.github+json" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      "https://api.github.com/repos/${GITHUB_REPO}/issues" \
      -d "{\"title\":\"${ISSUE_TITLE}\",\"body\":\"${ISSUE_BODY}\",\"labels\":[\"sync-failure\"]}" \
      2>/dev/null) || HTTP_STATUS="curl-error"

    if [ "${HTTP_STATUS}" = "201" ]; then
      echo "GitHub issue created — repository watchers will be emailed."
    else
      echo "GitHub issue skipped (status: ${HTTP_STATUS} — PAT may be expired; Slack alert above is the primary channel)."
    fi

    exit ${PUSH_EXIT}
  fi
else
  echo "GITHUB_PAT not set — skipping GitHub sync."
fi
