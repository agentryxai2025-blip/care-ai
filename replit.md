# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## GitHub Repository

[![CI](https://github.com/agentryxai2025-blip/care-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/agentryxai2025-blip/care-ai/actions/workflows/ci.yml)
[![GitHub Sync](https://github.com/agentryxai2025-blip/care-ai/actions/workflows/sync.yml/badge.svg)](https://github.com/agentryxai2025-blip/care-ai/actions/workflows/sync.yml)

- **Remote**: `https://github.com/agentryxai2025-blip/care-ai`
- **Branch**: `main`
- **Status**: Remote `origin` configured and all commits pushed successfully (May 2026).
- Authentication uses the `GITHUB_PAT` secret (stored in Replit Secrets — never commit to tracked files).
- The PAT is injected at push-time only: `git push "https://$GITHUB_PAT@github.com/agentryxai2025-blip/care-ai.git" main`
- The repository was created via the GitHub API (account: `agentryxai2025-blip`) since it did not exist.
- To push future updates manually: `bash scripts/push-to-github.sh` (requires `GITHUB_PAT` in environment).
- **Auto-sync**: `scripts/post-merge.sh` automatically pushes to GitHub after every Replit task merge (when `GITHUB_PAT` is set in Replit Secrets).
- **CI**: `.github/workflows/ci.yml` runs typecheck and build on every push to `main` via GitHub Actions.

### Sync failure notifications

When a push to GitHub fails, `post-merge.sh` sends proactive alerts through two channels:

| Channel | Secret required | Works if PAT expired? |
|---|---|---|
| **Slack webhook** (primary) | `SLACK_WEBHOOK_URL` | Yes — independent of `GITHUB_PAT` |
| GitHub issue (secondary) | `GITHUB_PAT` (existing) | Only if PAT is still valid |

**To enable Slack alerts:**
1. Create an incoming webhook at <https://api.slack.com/apps> for your workspace channel.
2. Add the URL to Replit Secrets as `SLACK_WEBHOOK_URL`.

The **GitHub Sync badge** above reflects the last successful push that reached GitHub. If the badge is stale (no run in the expected timeframe), it may indicate a missing push — check the post-merge logs and verify `GITHUB_PAT` is valid.
