# Agentryx — Solution Architecture

**Document 01 | Version 1.0 | May 2026**
**Prepared by Agentryx Australia**

> AI-Powered Operations Platform for NDIS Brokers & Agencies

---

## 1. Purpose & Scope

This document is the technical foundation for Agentryx — the AI-powered operations platform that automates the supply-demand matching work currently performed manually by NDIS brokers, agencies, and plan managers.

It defines the system architecture across all layers — presentation, workflow/agents, AI services, data, integration, and systems of record — and identifies the load-bearing component the entire platform pivots around.

All other Agentryx documents (Phasing Plan, Phase PRDs, POC PRD, pitch artefacts) reference this document as the single source of architectural truth. When this document and another disagree, this document wins until updated.

### In Scope
- End-to-end architecture for the multi-tenant Agentryx SaaS platform
- Functional layers, services, data, integrations, and AI components
- Security, residency, and non-functional requirements
- Deployment topology and environment strategy
- The load-bearing component (Matching & Confidence Engine) in detail
- Open Questions register for items requiring client/discovery input

### Out of Scope
- Detailed module-by-module functional requirements (covered in Phase PRDs)
- Sales, pricing, and go-to-market strategy (covered in pitch deck)
- Phase sequencing and gate logic (covered in Phasing Plan)

---

## 2. Architectural Thesis

Three architectural decisions shape every other choice in this document. These are non-negotiable for v1.

### Thesis 1 — Multi-Tenant SaaS, Tenant-Isolated by Default

Agentryx is sold to NDIS agencies. Every record, every event, every configuration is scoped to a `tenant_id`. Tenants share infrastructure but never share data. White-label and per-tenant configuration are first-class properties, not retrofits.

### Thesis 2 — AI is Augmentation, Not Replacement (Configurable)

Agency owners do not buy systems that take their job away. They buy systems that make their existing operation faster and cheaper. Agentryx wraps AI matchmaking in a configurable Automation Level (Manual / Assisted / Auto-with-review / Full-auto) that lets each tenant pick their comfort level. The same engine serves all four modes; only the action threshold changes.

### Thesis 3 — Workflow is the Product, Matching is the Spine

The visible product is the operations console, the seeker portal, and the provider portal. The invisible product — the spine — is the **Matching & Confidence Engine**. Every other module either feeds it (provider data, participant requests, plan budgets) or consumes its output (booking, notification, claims). Quality of matching determines whether the platform is worth buying. Matching is therefore the load-bearing component.

> **Load-Bearing Component**
> The Matching & Confidence Engine is the load-bearing component of Agentryx. It is the differentiator, the riskiest piece, the data flywheel, and the upgrade path for SaaS pricing. It is detailed separately in **Section 7**.

---

## 3. Layered Architecture

Agentryx is organised into six layers. Requests flow top to bottom; events flow bottom to top.

| Layer | Components |
|---|---|
| 1. Experience | Seeker portal (web, mobile), Provider portal (web, mobile), Agency Operations Console (web), Voice intake (inbound IVR + AI), Chat (AI agent), Admin |
| 2. API Gateway | Authentication, tenant resolution, rate limiting, request routing, audit logging, feature flags |
| 3. Workflow / Agents | Orchestration service (sagas), notification orchestrator, escalation engine, AI intake agent, AI matching agent, claim agent |
| 4. AI Services | Matching & Confidence Engine, intent classifier, voice transcription (STT/TTS), recommendation explainer, anomaly detector, embedding service |
| 5. Core Domain Services | Tenant, User, Participant, Provider, Plan, Request, Booking, Service Agreement, Claim, Compliance, Review, Audit |
| 6. Integration & Systems of Record | NDIA / PRODA / myplace adapter, plan-manager adapters, identity providers, communication gateways (SMS/email/voice), background-check providers, accounting (Xero/MYOB) |

### Layer Responsibilities

- **Experience:** All human-facing UI. Tenant-branded. Accessible (WCAG 2.2 AA). Multi-actor — same backend serves participant, nominee, coordinator, plan manager, agency staff, provider.
- **API Gateway:** Single ingress for all clients. Resolves tenant from subdomain or JWT claim, enforces RBAC, rate-limits, writes audit log.
- **Workflow / Agents:** Subscribes to domain events, runs end-to-end automations (sagas), drives notifications and escalations. The behavioural "glue" of the platform.
- **AI Services:** Stateless inference services behind the workflow layer. Hosts the load-bearing Matching Engine and supporting AI capabilities.
- **Core Domain Services:** CRUD + business rules per domain entity. Tenant-scoped at every query. Emit domain events on state changes.
- **Integration & Systems of Record:** Adapters that abstract third-party systems behind a stable internal contract. Hot-swap-friendly.

---

## 4. Core Domain Services

Each service owns a bounded context. Services are independently deployable but share a common tenant-scoping convention and event bus.

| Service | Responsibility |
|---|---|
| Tenant Service | Tenant lifecycle, configuration, branding, automation level, billing tier |
| User & Identity | User accounts, authentication, RBAC, delegation (nominee/coordinator scopes) |
| Participant Service | Participant profile, NDIS number, preferences, delegations, plan reference |
| Plan Service | Plan lifecycle, line items by support category, budget tracking, utilisation |
| Provider Service | Provider profile, registration tier, screening status, certifications, availability, performance metrics |
| Request Service | Service request intake, validation, urgency classification, routing |
| Matching Service | Hosts the Matching & Confidence Engine (Section 7). Returns ranked, explained shortlists. |
| Booking Service | Booking state machine, lifecycle transitions, cancellations, reschedules |
| Service Agreement Service | Generation, e-signature, versioning, storage of NDIS-required service agreements |
| Claims Service | Plan budget validation, price-cap checks, claim submission, reconciliation |
| Compliance Service | Worker screening monitoring, certification expiry, incident reports, restrictive practices |
| Notification Service | Multi-channel delivery (SMS, email, push, voice), template rendering, send orchestration |
| Review Service | Post-service ratings, complaints, dispute workflow |
| Audit Service | Append-only event log with tamper-evident hash chain; export for NDIS Commission |
| Fraud Service | Anomaly detection on claims, bookings, provider behaviour; risk scoring |

---

## 5. Data Model

Logical multi-tenancy. Every table carries `tenant_id`. Foreign keys never cross tenant boundaries except via explicit cross-tenant provider opt-in.

### Core Entities

| Entity | Key Fields |
|---|---|
| Tenants | id, name, subdomain, plan_tier, automation_level, config_json, status, created_at |
| Users | id, tenant_id, role, email, phone, name, status, last_login_at |
| Delegations | id, participant_id, delegate_user_id, scope, valid_from, valid_to |
| Participants | id, tenant_id, user_id, ndis_number, plan_id, dob, preferences_json |
| Plans | id, participant_id, start_date, end_date, total_budget, management_type |
| PlanLineItems | id, plan_id, support_category, item_code, allocated, spent, balance |
| Providers | id, tenant_id, registration_tier, skills_json, rating, reliability_score, status |
| ProviderRegistrations | id, provider_id, ndis_reg_number, tier, supports_approved, expiry |
| WorkerScreening | id, provider_id, check_id, status, issued_date, expiry_date |
| Availability | id, provider_id, timeslot_start, timeslot_end, status, recurrence_rule |
| Requests | id, tenant_id, participant_id, service_type, location, schedule, urgency, status, raised_by |
| Matches | id, request_id, provider_id, score, confidence, rank, rationale_json |
| Bookings | id, request_id, provider_id, state, price, agreement_id, timestamps |
| ServiceAgreements | id, booking_id, version, signed_by, signed_at, document_url |
| Claims | id, booking_id, line_item_id, amount, status, submitted_at, settled_at |
| IncidentReports | id, booking_id, type, severity, reported_by, status, commission_ref |
| Reviews | id, booking_id, participant_rating, provider_rating, comments |
| AuditLog | id, tenant_id, actor_id, action, entity, before_json, after_json, ts, prev_hash, hash |

### Storage Strategy

- **Relational (PostgreSQL):** Core domain tables. Row-level security enforced on `tenant_id`. Strong consistency for booking, plan, claims.
- **Event store (append-only):** All domain events. Source of truth for audit and replay.
- **Document store:** Service agreements, signed PDFs, uploaded evidence, incident attachments.
- **Search index:** Provider search, request search, full-text on profiles and notes.
- **Cache (Redis):** Session, hot tenant config, recent matches, rate limit counters.
- **Data warehouse:** Analytics, reports, anomaly detection training data, learning loop ingestion.

### Tenant Isolation

- `tenant_id` on every domain row; primary key includes `(tenant_id, id)` for sharding readiness
- Database-level row security policies; ORM-level query rewriting; gateway-level tenant claim verification
- No service is permitted to query without a resolved tenant context (enforced in middleware)
- Cross-tenant provider sharing is opt-in and explicit; surfaced as a separate join table, never via shared records

---

## 6. Event-Driven Design

Domain services are the source of truth for state. The Workflow / Orchestration layer subscribes to domain events and runs end-to-end sagas. This is how the manual work of a human broker is automated — the human's mental "if X then Y" rules become event subscriptions.

### Canonical Event Catalogue

- `REQUEST_CREATED { tenant_id, request_id, participant_id, raised_by, urgency }`
- `REQUEST_VALIDATED { request_id, plan_balance_ok, eligibility_ok }`
- `MATCH_PRODUCED { request_id, top_matches[], confidence, requires_review }`
- `MATCH_APPROVED { request_id, selected_provider_id, approved_by }`
- `PROVIDER_NOTIFIED { match_id, provider_id, channel }`
- `PROVIDER_RESPONDED { match_id, response, latency_ms }`
- `BOOKING_CREATED { booking_id, request_id, provider_id }`
- `BOOKING_CONFIRMED { booking_id, agreement_url }`
- `BOOKING_STARTED` / `BOOKING_COMPLETED` / `BOOKING_CANCELLED`
- `INCIDENT_REPORTED { booking_id, severity, type, reported_by }`
- `CLAIM_SUBMITTED` / `CLAIM_ACCEPTED` / `CLAIM_REJECTED` / `PAYMENT_SETTLED`
- `REVIEW_SUBMITTED { booking_id, ratings, comments }`
- `PROVIDER_CREDENTIAL_EXPIRING` / `PROVIDER_SUSPENDED`
- `PLAN_BUDGET_THRESHOLD_REACHED { plan_id, line_item_id, percent }`

### Saga Examples

- **Match → Book Saga:** `REQUEST_VALIDATED` → invoke Matching → `MATCH_PRODUCED` → if auto, `PROVIDER_NOTIFIED` → wait for `PROVIDER_RESPONDED` with timeout → on accept, `BOOKING_CREATED` → generate agreement → `BOOKING_CONFIRMED` → schedule reminders.
- **Service → Claim Saga:** `BOOKING_COMPLETED` → `REVIEW_REQUESTED` → `CLAIM_DRAFTED` → validate against plan + price cap → `CLAIM_SUBMITTED` → on settle, `PAYMENT_SETTLED` → close booking.
- **Incident Saga:** `INCIDENT_REPORTED` → freeze provider matching → notify compliance officer → if reportable, draft Commission report within 24h → track resolution.

### Sync vs Async Boundaries

- **Synchronous:** Authentication, request creation, viewing matches, viewing booking detail, claim status check.
- **Asynchronous:** Notification dispatch, claim submission, AI re-scoring, fraud checks, audit writes, learning-loop updates, NDIA portal interactions.

---

## 7. Load-Bearing Component — Matching & Confidence Engine

This is the spine. Quality, configurability, and explainability of matching determine whether Agentryx is a worth-paying-for product or a CRM with a chat widget. This section is intentionally deeper than the others.

### 7.1 Engine Responsibilities

- Intake a validated participant request
- Apply hard filters to the tenant's eligible provider pool
- Score and rank candidates using tenant-tuned weights
- Compute a confidence score for the top recommendation
- Produce a human-readable rationale for each candidate
- Decide whether to auto-act or route to human review based on tenant's automation level and confidence threshold
- Emit `MATCH_PRODUCED` with full payload
- Capture decision outcome (accepted / overridden / rejected) for the learning loop

### 7.2 Pipeline

The engine runs as a six-stage pipeline. Each stage is independently testable and replaceable.

1. **Intake Normalisation:** Convert request into a canonical match query (location, service category, schedule window, urgency, accessibility constraints, language, gender preference).
2. **Hard Filters:** Provider must match service category, hold required NDIS registration tier, have current worker screening, be available in window, fall within radius, satisfy language/gender constraints, be in `ACTIVE` state.
3. **Feature Extraction:** For each candidate, extract distance, skill match, availability fit, price vs reasonable rate, rating, reliability, response speed, repeat-with-this-participant signal, cultural fit signal.
4. **Scoring:** Apply tenant weight vector to normalised features. Output `Score = Σ(Wi × Fi)`.
5. **Confidence:** Compute confidence from data completeness, score gap to runner-up, historical accuracy on similar requests, provider freshness.
6. **Explainability:** Generate rationale per candidate using a small templated explainer with placeholders filled from feature values.

### 7.3 Configurable Automation Levels

The same engine serves all four levels. The level only changes what happens *after* `MATCH_PRODUCED`.

| Level | Behaviour after MATCH_PRODUCED | Sales positioning |
|---|---|---|
| Manual | Top 3–5 surfaced in Ops Console; staff picks; system handles all downstream automation | Entry tier; lowest objection; preserves human control |
| Assisted | Top 1 surfaced with one-click approve; staff approves; system contacts and books | Mid tier; obvious efficiency gain; staff still has veto |
| Auto-with-review | If confidence ≥ threshold: auto-book. Else: route to console. | Upper tier; sold once trust is established |
| Full-auto | Always auto-book. Console handles exceptions only. | Top tier; high volume operators |

### 7.4 Confidence Score

Confidence ∈ [0, 1]. Computed as a weighted blend:

- Data completeness (provider profile, participant preferences) — 25%
- Score gap between rank 1 and rank 2 — 30% (a clear winner is more confident)
- Historical accuracy on requests with similar features — 30%
- Provider freshness (recent successful bookings, current credentials) — 15%

Tenants set their own threshold (default 0.75). Below threshold → human review regardless of automation level.

### 7.5 Explainability

NDIS is a regulated context. Every match must come with a reason a participant, agency staff member, or auditor can understand. The engine never produces an unexplained match.

> Example rationale: "Top match: Sarah K. — 3.2 km from participant, available within 2 hours, 4.8★ from 47 bookings, 12 successful sessions with similar participants, has Mental Health First Aid certification, female (matches participant preference)."

### 7.6 Learning Loop

- **Implicit signals:** Acceptance, completion, repeat booking, no-show, cancellation, provider response latency.
- **Explicit signals:** Participant ratings, complaints, staff overrides with reason captured.
- **Use of signals:** Adjust per-tenant weight vectors monthly; update participant-provider affinity scores in near-real-time; tune confidence calibration; flag underperforming providers.
- **Cold-start:** New tenants begin with default weights derived from anonymised cross-tenant patterns, then specialise to their book of business over time.

### 7.7 Failure Modes & Safeguards

- **No eligible providers:** Expand radius, relax non-mandatory constraints, surface alternatives, escalate.
- **Stale data:** Provider availability or credentials out of date — engine refuses to match and triggers refresh.
- **Bias drift:** Periodic audit of match outcomes against protected attributes (gender, age, location, CALD background) to detect drift.
- **Engine outage:** Graceful degradation to Manual mode for all tenants until restored. Console flags status banner.
- **Adversarial provider behaviour:** Acceptance pattern anomalies feed Fraud Service (Section 4).

---

## 8. Security & Residency

### Authentication & Authorization
- OIDC-based authentication; tenant claim included in every JWT
- RBAC at gateway and service level; roles defined per tenant
- Delegation tokens for nominees and support coordinators with scope and expiry
- MFA mandatory for staff and admin roles; optional for participants
- Provider login isolated from participant login (different surfaces, different roles)

### Data Protection
- TLS 1.3 in transit; AES-256 at rest
- Field-level encryption for: NDIS number, health notes, restrictive practice notes, screening reference numbers
- Append-only audit log with hash chain (each entry's hash includes prev hash) for tamper evidence
- Australian Privacy Principles (APP) compliance
- Tenant-level encryption keys for the most sensitive fields (key per tenant, BYOK roadmap)

### Residency
- All data resident in Australian regions by default
- Backups in Australian regions only
- AI inference in Australian regions wherever model availability permits; foreign inference flagged in tenant config and audit log

### Compliance Posture
- Designed to satisfy NDIS Quality and Safeguards Commission audit requirements
- ISO 27001 alignment as v1.5 target
- Annual penetration testing
- Quarterly internal access reviews

---

## 9. Deployment Topology

### Environments
- **DEV:** Per-engineer or shared sandbox; synthetic data only; no NDIA integration.
- **STG:** Pre-production replica; sanitised data; sandbox NDIA endpoints; full integration testing.
- **PROD:** Australian regions; multi-AZ; live NDIA integration; full monitoring.

### Infrastructure
- Container-based services on a managed Kubernetes platform
- Managed PostgreSQL (multi-AZ with PITR)
- Managed event bus (Kafka or equivalent)
- Object storage for documents (encrypted, lifecycle-managed)
- Managed Redis for cache
- CDN for static assets and tenant white-label
- Inference services on dedicated GPU/CPU pools depending on model

### Per-Tenant Topology
- Shared compute, isolated data partitions
- Tenant subdomain or white-label custom domain via reverse proxy
- Per-tenant configuration loaded into gateway and services on tenant resolution
- Per-tenant rate limits and resource quotas

### Observability
- Structured logs with `tenant_id` correlation
- Distributed tracing across services
- Metrics: request rates, latencies, match quality, claim success rate, automation effectiveness
- Synthetic checks for critical paths (login, request creation, match)
- On-call rotation with runbooks per service

---

## 10. Non-Functional Requirements

| NFR | Target |
|---|---|
| Availability (Prod) | 99.9% monthly for core services; 99.5% for AI inference |
| Latency — request creation | p95 < 800 ms |
| Latency — match generation | p95 < 3 s for top-5 with rationale |
| Latency — UI page load | p95 < 2 s on broadband; mobile-tolerant |
| Throughput | Support 50 tenants × 1000 bookings/month at v1; 500 tenants × 1000 by v2 |
| RPO / RTO | RPO 5 min for transactional data; RTO 1 hour for full service |
| Audit retention | 7 years (NDIS Commission requirement floor) |
| Accessibility | WCAG 2.2 AA across all participant-facing surfaces |
| Browser support | Last 2 major versions of Chrome, Safari, Edge, Firefox |
| Mobile | iOS 15+, Android 10+ |
| Data residency | Australia (mandatory) |
| Security | OWASP Top 10 mitigations baseline; annual penetration testing |

---

## 11. Integration Points

### NDIA / Government
- **PRODA & myplace:** Provider verification, claim submission, plan validation. Where APIs are unavailable, document-based workflows with manual confirmation.
- **NDIS Worker Screening Database:** Verification and expiry monitoring.
- **NDIS Commission:** Reportable incident submission, complaint referrals.

### Plan Managers
Direct integrations with major Australian plan-manager platforms for participants in plan-managed mode. Where direct APIs are unavailable, generate compliant invoice documents and email to plan manager with structured payload.

### Communication
- **SMS:** Twilio (with Australian sender ID compliance)
- **Email:** SendGrid or AWS SES with DKIM/SPF/DMARC for tenant domains
- **Push:** Firebase Cloud Messaging
- **Voice (in/out):** Twilio Voice with AI agent for inbound intake

### Identity
- Apple Sign-In, Google, Microsoft (for staff)
- MyGov ID (where available for participant verification)
- SAML for enterprise tenants

### Accounting & Finance
- Xero, MYOB integrations for agency-side financial reconciliation
- Stripe for Agentryx subscription billing

---

## 12. Open Questions Register

Items that require client/discovery input before final design lock. To be closed during Phase 0 of the engagement.

| # | Question | Owner / Resolution Path |
|---|---|---|
| Q1 | Will the first tenant share its provider database with future tenants (cross-tenant pool) or remain isolated? | Tenant onboarding policy decision in Phase 0 |
| Q2 | Which NDIA integration mode is achievable for v1 — direct API where available, or document-based workflows only? | Engagement with NDIA Digital Partnerships in Phase 0 |
| Q3 | How is the AI matching engine actually trained for the first tenant (cold start)? | Phase 0: import historical bookings + run shadow-mode matching against historical decisions for calibration |
| Q4 | Default Automation Level for new tenants — Manual or Assisted? | Pilot data; recommend Manual for the first 30 days then propose upgrade |
| Q5 | Which plan-manager platforms have direct integration paths and which require document workflows? | Discovery in Phase 0; commercial conversations with top 3 plan managers |
| Q6 | Voice intake — build vs buy the AI voice agent? | Phase 0 spike comparing Twilio AI Voice + custom prompt vs full custom build |
| Q7 | How are restrictive practice authorisations represented and verified? | Compliance lawyer review in Phase 0 |
| Q8 | Mobile app v1 — native or PWA? | Decision after Phase 0 user research; PWA recommended for v1 |
| Q9 | Where do we draw the line between Agentryx-managed tenant config and self-serve config? | UX research in Phase 0; default: 80% self-serve, 20% admin-assisted |
| Q10 | Cross-border AI inference fallback — acceptable for non-sensitive workloads? | Privacy lawyer review; default: no foreign inference for v1 |

---

## 13. Appendix — Glossary & References

### Glossary
- **NDIS:** National Disability Insurance Scheme.
- **NDIA:** National Disability Insurance Agency — operates the NDIS.
- **Participant:** An individual receiving NDIS-funded supports.
- **Plan:** An individual participant's funding plan, divided into Core, Capacity Building, and Capital budgets.
- **Plan Management Mode:** NDIA-managed, plan-managed, or self-managed.
- **Provider:** Individual or organisation delivering NDIS-funded supports.
- **Registration Tier:** Risk-proportionate provider category — Advanced / General / Basic / Enrolled.
- **Worker Screening Check:** Mandatory background check for NDIS workers in 1:1+ roles.
- **LAC:** Local Area Coordinator — assists participants 9+ to access the NDIS.
- **Support Coordinator:** Funded role helping participants implement their plan.

### References
- Agentryx Phasing Plan v1.0 (Doc 02)
- Agentryx Phase 0 PRD — Foundation (Doc 03)
- Agentryx Phase 1 PRD — AI Matchmaking + Ops Console (Doc 04)
- Agentryx Phases 2–N PRDs Light (Doc 05)
- Agentryx POC PRD (Doc 06)
- NDIS Quality and Safeguards Commission — Provider Obligations
- NDIS Pricing Arrangements and Price Limits (current edition)
- Australian Privacy Principles (APPs)
