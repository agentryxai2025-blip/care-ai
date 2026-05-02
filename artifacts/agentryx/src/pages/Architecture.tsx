import { useState } from "react";
import {
  ArrowDown, ArrowRight, Info, X, Cpu, Users, Briefcase, BarChart3,
  Bell, MessageSquare, Settings, ShieldCheck, CreditCard, Calendar,
  Network, Database, FileText, Zap, Globe, Lock, Activity, GitBranch,
  ChevronRight, ArrowLeft
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { motion } from "framer-motion";

const layers = [
  {
    id: "experience",
    label: "Experience Layer",
    sublabel: "Layer 1",
    color: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
    headerColor: "bg-blue-100 dark:bg-blue-900/40",
    textColor: "text-blue-800 dark:text-blue-300",
    components: [
      { id: "seeker", label: "Seeker Portal", desc: "Web and mobile portal for NDIS participants, nominees, and support coordinators. Accessible (WCAG 2.2 AA). Tenant-branded.", sub: "Web + Mobile" },
      { id: "provider", label: "Provider Portal", desc: "Provider-facing portal for accepting requests, managing availability, viewing bookings, and uploading credentials.", sub: "Web + Mobile" },
      { id: "ops", label: "Agency Ops Console", desc: "Staff-facing operations console for request management, matching oversight, compliance monitoring, and reporting.", sub: "Web" },
      { id: "voice", label: "Voice / IVR", desc: "Inbound AI voice agent for service intake via phone. Twilio Voice with custom AI prompt for intake normalisation.", sub: "IVR + AI" },
      { id: "chat", label: "Chat Agent", desc: "AI-powered chat interface for participant self-service: request status, booking changes, and FAQ.", sub: "AI Chat" },
      { id: "admin", label: "Admin Console", desc: "Super-admin interface for tenant management, billing, global configuration, and platform health monitoring.", sub: "Internal" },
    ],
  },
  {
    id: "gateway",
    label: "API Gateway",
    sublabel: "Layer 2",
    color: "bg-violet-50 border-violet-200 dark:bg-violet-900/20 dark:border-violet-800",
    headerColor: "bg-violet-100 dark:bg-violet-900/40",
    textColor: "text-violet-800 dark:text-violet-300",
    components: [
      { id: "auth", label: "Authentication", desc: "OIDC-based auth. Tenant claim included in every JWT. MFA mandatory for staff.", sub: "OIDC / JWT" },
      { id: "tenant_res", label: "Tenant Resolution", desc: "Resolves tenant from subdomain or JWT claim. Loads per-tenant config into request context.", sub: "Middleware" },
      { id: "rate", label: "Rate Limiting", desc: "Per-tenant rate limits and resource quotas. Enforced at gateway before hitting services.", sub: "Redis-backed" },
      { id: "routing", label: "Request Routing", desc: "Routes requests to appropriate domain services. Path-based + header-based routing.", sub: "Reverse Proxy" },
      { id: "audit_gw", label: "Audit Logging", desc: "Every request logged with tenant_id, actor, action, entity, timestamp. Written to append-only audit service.", sub: "Append-only" },
      { id: "flags", label: "Feature Flags", desc: "Per-tenant feature toggles. Controls automation level, beta features, and gradual rollouts.", sub: "Runtime Config" },
    ],
  },
  {
    id: "workflow",
    label: "Workflow / Agents",
    sublabel: "Layer 3",
    color: "bg-teal-50 border-teal-200 dark:bg-teal-900/20 dark:border-teal-800",
    headerColor: "bg-teal-100 dark:bg-teal-900/40",
    textColor: "text-teal-800 dark:text-teal-300",
    components: [
      { id: "orchestration", label: "Orchestration (Sagas)", desc: "Event-driven saga orchestration. Automates multi-step workflows: Match→Book, Service→Claim, Incident sagas.", sub: "Event-driven" },
      { id: "notif_orch", label: "Notification Orchestrator", desc: "Multi-channel notification dispatch. Handles routing, retries, template rendering, and send scheduling.", sub: "Multi-channel" },
      { id: "intake_agent", label: "AI Intake Agent", desc: "Processes voice/chat intakes into canonical service requests. Classifies intent, extracts entities.", sub: "AI Agent" },
      { id: "match_agent", label: "CareAffinity Agent", desc: "Invokes the CareAffinity Engine. Handles auto-act vs human-review routing based on configured automation level and confidence threshold.", sub: "AI Agent" },
      { id: "claim_agent", label: "Claims Agent", desc: "Automates claim drafting, validation, and submission. Checks price caps and plan balance before submission.", sub: "AI Agent" },
      { id: "escalation", label: "Escalation Engine", desc: "Monitors SLA breaches, unresponded matches, expiring credentials. Routes escalations to correct staff.", sub: "Rule-based" },
    ],
  },
  {
    id: "ai",
    label: "AI Services",
    sublabel: "Layer 4",
    color: "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800",
    headerColor: "bg-amber-100 dark:bg-amber-900/40",
    textColor: "text-amber-800 dark:text-amber-300",
    components: [
      { id: "matching_engine", label: "CareAffinity Engine", desc: "6-stage pipeline: Intake Normalisation → Hard Filters → Feature Extraction → Scoring → Confidence → Explainability. The load-bearing component. Configurable weight vectors per tenant. Participant–provider affinity learning loop.", sub: "LOAD-BEARING ★", isLoadBearing: true },
      { id: "intent", label: "Intent Classifier", desc: "Classifies incoming requests and messages by intent. Powers the AI intake agent and chat agent.", sub: "NLP Model" },
      { id: "stt_tts", label: "STT / TTS", desc: "Speech-to-text and text-to-speech for voice intake and outbound voice notifications.", sub: "Twilio Voice + AI" },
      { id: "explainer", label: "Recommendation Explainer", desc: "Generates human-readable rationales for match results. Required for every match — regulatory context.", sub: "Templated AI" },
      { id: "anomaly", label: "Anomaly Detector", desc: "Monitors claim patterns, provider behaviour, and booking anomalies. Feeds fraud service.", sub: "ML Model" },
      { id: "embedding", label: "Embedding Service", desc: "Vector embeddings for participant-provider affinity scoring. Semantic search on profiles and notes.", sub: "Vector DB" },
    ],
  },
  {
    id: "domain",
    label: "Core Domain Services",
    sublabel: "Layer 5",
    color: "bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700",
    headerColor: "bg-slate-100 dark:bg-slate-800/60",
    textColor: "text-slate-700 dark:text-slate-300",
    components: [
      { id: "tenant_svc", label: "Tenant Service", desc: "Tenant lifecycle, configuration, branding, automation level, billing tier.", sub: "" },
      { id: "user_svc", label: "User & Identity", desc: "User accounts, authentication, RBAC, delegation (nominee/coordinator scopes).", sub: "" },
      { id: "participant_svc", label: "Participant Service", desc: "Participant profile, NDIS number, preferences, delegations, plan reference.", sub: "" },
      { id: "plan_svc", label: "Plan Service", desc: "Plan lifecycle, line items by support category, budget tracking, utilisation.", sub: "" },
      { id: "provider_svc", label: "Provider Service", desc: "Provider profile, registration tier, screening status, certifications, availability, performance metrics.", sub: "" },
      { id: "request_svc", label: "Request Service", desc: "Service request intake, validation, urgency classification, routing.", sub: "" },
      { id: "booking_svc", label: "Booking Service", desc: "Booking state machine, lifecycle transitions, cancellations, reschedules.", sub: "" },
      { id: "agreement_svc", label: "Agreement Service", desc: "NDIS service agreement generation, e-signature, versioning, storage.", sub: "" },
      { id: "claims_svc", label: "Claims Service", desc: "Plan budget validation, price-cap checks, claim submission, reconciliation.", sub: "" },
      { id: "compliance_svc", label: "Compliance Service", desc: "Worker screening monitoring, certification expiry, incident reports, restrictive practices.", sub: "" },
      { id: "review_svc", label: "Review Service", desc: "Post-service ratings, complaints, dispute workflow.", sub: "" },
      { id: "audit_svc", label: "Audit Service", desc: "Append-only event log with tamper-evident hash chain. Export for NDIS Commission.", sub: "" },
      { id: "fraud_svc", label: "Fraud Service", desc: "Anomaly detection on claims, bookings, provider behaviour. Risk scoring.", sub: "" },
    ],
  },
  {
    id: "integration",
    label: "Integration & Systems of Record",
    sublabel: "Layer 6",
    color: "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800",
    headerColor: "bg-emerald-100 dark:bg-emerald-900/40",
    textColor: "text-emerald-800 dark:text-emerald-300",
    components: [
      { id: "ndia", label: "NDIA / PRODA", desc: "Provider verification, claim submission, plan validation via myplace portal APIs. Document-based fallback.", sub: "Gov API" },
      { id: "screening_db", label: "Worker Screening DB", desc: "NDIS Worker Screening Database. Verification and expiry monitoring for all registered workers.", sub: "Gov API" },
      { id: "plan_mgrs", label: "Plan Managers", desc: "Direct integrations with major Australian plan-manager platforms. Invoice document fallback.", sub: "REST / Invoice" },
      { id: "sms", label: "SMS (Twilio)", desc: "SMS notifications with Australian sender ID compliance. Used for booking confirmations, reminders, alerts.", sub: "Twilio" },
      { id: "email", label: "Email (SendGrid)", desc: "Transactional email with DKIM/SPF/DMARC per tenant domain. Template-based.", sub: "SendGrid / SES" },
      { id: "push", label: "Push (FCM)", desc: "Firebase Cloud Messaging for mobile push notifications to participant and provider apps.", sub: "FCM" },
      { id: "identity", label: "Identity Providers", desc: "Apple Sign-In, Google, Microsoft for staff. MyGov ID for participant verification. SAML for enterprise.", sub: "OIDC / SAML" },
      { id: "accounting", label: "Xero / MYOB", desc: "Agency-side financial reconciliation. Claim settlement sync and invoice generation.", sub: "OAuth API" },
      { id: "billing", label: "Stripe", desc: "Agentryx SaaS subscription billing. Per-tenant metered billing based on booking volume.", sub: "Stripe API" },
    ],
  },
];

const sagas = [
  {
    name: "Match → Book Saga",
    color: "text-indigo-600",
    steps: ["REQUEST_VALIDATED", "→ Invoke Matching", "→ MATCH_PRODUCED", "→ PROVIDER_NOTIFIED", "→ Wait for response", "→ BOOKING_CREATED", "→ Generate agreement", "→ BOOKING_CONFIRMED"],
  },
  {
    name: "Service → Claim Saga",
    color: "text-emerald-600",
    steps: ["BOOKING_COMPLETED", "→ REVIEW_REQUESTED", "→ CLAIM_DRAFTED", "→ Validate budget + price cap", "→ CLAIM_SUBMITTED", "→ PAYMENT_SETTLED"],
  },
];

// Platform Map data
const supplyNodes = [
  { icon: Briefcase, label: "Provider Portal", sub: "Support workers · Care agencies", color: "border-violet-300 bg-violet-50 dark:bg-violet-900/20 dark:border-violet-700", iconColor: "text-violet-600" },
  { icon: ShieldCheck, label: "Worker Screening DB", sub: "NDIS Worker Screening · Gov API", color: "border-violet-300 bg-violet-50 dark:bg-violet-900/20 dark:border-violet-700", iconColor: "text-violet-600" },
  { icon: Globe, label: "NDIA / PRODA", sub: "Verification · Claims · Plans", color: "border-violet-300 bg-violet-50 dark:bg-violet-900/20 dark:border-violet-700", iconColor: "text-violet-600" },
  { icon: FileText, label: "Plan Managers", sub: "Invoice platforms · Budget APIs", color: "border-violet-300 bg-violet-50 dark:bg-violet-900/20 dark:border-violet-700", iconColor: "text-violet-600" },
];

const demandNodes = [
  { icon: Globe, label: "Seeker Portal", sub: "Participants · Nominees · Families", color: "border-teal-300 bg-teal-50 dark:bg-teal-900/20 dark:border-teal-700", iconColor: "text-teal-600" },
  { icon: Users, label: "NDIS Participants", sub: "142 active · Funded individuals", color: "border-teal-300 bg-teal-50 dark:bg-teal-900/20 dark:border-teal-700", iconColor: "text-teal-600" },
  { icon: FileText, label: "NDIS Plans", sub: "Budgets · Line items · Dates", color: "border-teal-300 bg-teal-50 dark:bg-teal-900/20 dark:border-teal-700", iconColor: "text-teal-600" },
  { icon: Network, label: "Coordinators", sub: "Support coordination · Nominees", color: "border-teal-300 bg-teal-50 dark:bg-teal-900/20 dark:border-teal-700", iconColor: "text-teal-600" },
];

const hubCaps = [
  { label: "AI Orchestration", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" },
  { label: "Workflow Engine", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  { label: "Unified Analytics", color: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300" },
  { label: "Smart Alerts", color: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" },
  { label: "Compliance Layer", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
  { label: "Human-in-Loop", color: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300" },
];

const featureModules = [
  { icon: BarChart3, label: "Analytics", sub: "Real-time dashboards · KPIs", color: "border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800", iconColor: "text-blue-600" },
  { icon: FileText, label: "Reports", sub: "NDIS compliance · Financials", color: "border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-800", iconColor: "text-blue-600" },
  { icon: Calendar, label: "Bookings", sub: "Lifecycle · Reschedules · SLAs", color: "border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10 dark:border-emerald-800", iconColor: "text-emerald-600" },
  { icon: CreditCard, label: "Claims", sub: "Auto-draft · Validation · Submit", color: "border-emerald-200 bg-emerald-50 dark:bg-emerald-900/10 dark:border-emerald-800", iconColor: "text-emerald-600" },
  { icon: ShieldCheck, label: "Compliance", sub: "Screening · Incidents · Alerts", color: "border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800", iconColor: "text-amber-600" },
  { icon: MessageSquare, label: "Messaging", sub: "SMS · Email · In-app · Push", color: "border-violet-200 bg-violet-50 dark:bg-violet-900/10 dark:border-violet-800", iconColor: "text-violet-600" },
  { icon: Bell, label: "Notifications", sub: "Smart alerts · Escalations", color: "border-violet-200 bg-violet-50 dark:bg-violet-900/10 dark:border-violet-800", iconColor: "text-violet-600" },
  { icon: Settings, label: "Configuration", sub: "Per-tenant · Feature flags", color: "border-slate-200 bg-slate-50 dark:bg-slate-800/40 dark:border-slate-700", iconColor: "text-slate-600" },
  { icon: Database, label: "Audit Trail", sub: "Append-only · NDIS Commission", color: "border-slate-200 bg-slate-50 dark:bg-slate-800/40 dark:border-slate-700", iconColor: "text-slate-600" },
  { icon: Lock, label: "Security", sub: "OWASP · RBAC · MFA · Pen-test", color: "border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800", iconColor: "text-red-600" },
  { icon: GitBranch, label: "Multi-Tenancy", sub: "Isolated · Branded · Configurable", color: "border-indigo-200 bg-indigo-50 dark:bg-indigo-900/10 dark:border-indigo-800", iconColor: "text-indigo-600" },
  { icon: Activity, label: "CareAffinity", sub: "6-stage pipeline · Live scoring", color: "border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-800", iconColor: "text-amber-600" },
];

const platformBenefits = [
  { icon: Zap, title: "One Platform, All Data", desc: "Every system — providers, participants, plans, claims — flows through a single intelligent hub. No silos, no manual handoffs.", color: "text-amber-600" },
  { icon: Cpu, title: "AI That Works With Humans", desc: "The engine never acts unilaterally. It drafts, scores, and recommends — staff review or auto-approve based on their configured confidence threshold.", color: "text-primary" },
  { icon: ShieldCheck, title: "Zero Disruption", desc: "Existing systems remain exactly as they are. Agentryx wraps around them, adding intelligence without requiring migration or re-training.", color: "text-emerald-600" },
];

function SideNode({ node, direction }: { node: typeof supplyNodes[0]; direction: "left" | "right" }) {
  const Icon = node.icon;
  return (
    <div className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-sm ${node.color} transition-all hover:shadow-sm`}>
      <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 bg-background/60`}>
        <Icon className={`w-4 h-4 ${node.iconColor}`} />
      </div>
      <div className="min-w-0">
        <div className="font-semibold text-foreground text-xs leading-tight">{node.label}</div>
        <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">{node.sub}</div>
      </div>
      {direction === "right" && <ChevronRight className="w-3 h-3 text-muted-foreground/50 flex-shrink-0 ml-auto" />}
      {direction === "left" && <ArrowLeft className="w-3 h-3 text-muted-foreground/50 flex-shrink-0 ml-auto" />}
    </div>
  );
}

function FeatureModule({ mod }: { mod: typeof featureModules[0] }) {
  const Icon = mod.icon;
  return (
    <div className={`p-3 rounded-xl border ${mod.color} hover:shadow-sm transition-all cursor-default`}>
      <Icon className={`w-4 h-4 ${mod.iconColor} mb-1.5`} />
      <div className="text-xs font-semibold text-foreground">{mod.label}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{mod.sub}</div>
    </div>
  );
}

export default function Architecture() {
  const [activeComponent, setActiveComponent] = useState<{ label: string; desc: string; sub: string } | null>(null);

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Solution Architecture</h1>
        <p className="text-sm text-muted-foreground">Agentryx AI-Powered Operations Platform</p>
      </div>

      <Tabs defaultValue="layers" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="layers">Layered Architecture</TabsTrigger>
          <TabsTrigger value="map">Platform Map</TabsTrigger>
        </TabsList>

        {/* ── TAB 1: Existing layered architecture ── */}
        <TabsContent value="layers" className="space-y-6 mt-0">
          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground"><span className="w-3 h-3 rounded-sm bg-blue-200 dark:bg-blue-800 inline-block" />Experience</div>
            <div className="flex items-center gap-1.5 text-muted-foreground"><span className="w-3 h-3 rounded-sm bg-violet-200 dark:bg-violet-800 inline-block" />API Gateway</div>
            <div className="flex items-center gap-1.5 text-muted-foreground"><span className="w-3 h-3 rounded-sm bg-teal-200 dark:bg-teal-800 inline-block" />Workflow/Agents</div>
            <div className="flex items-center gap-1.5 text-muted-foreground"><span className="w-3 h-3 rounded-sm bg-amber-200 dark:bg-amber-800 inline-block" />AI Services</div>
            <div className="flex items-center gap-1.5 text-muted-foreground"><span className="w-3 h-3 rounded-sm bg-slate-200 dark:bg-slate-700 inline-block" />Domain Services</div>
            <div className="flex items-center gap-1.5 text-muted-foreground"><span className="w-3 h-3 rounded-sm bg-emerald-200 dark:bg-emerald-800 inline-block" />Integrations</div>
            <div className="ml-auto flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-medium"><span className="text-amber-500">★</span> Load-Bearing Component — click components to learn more</div>
          </div>

          <div className="space-y-1">
            {layers.map((layer, layerIdx) => (
              <div key={layer.id}>
                <div className={`border rounded-lg ${layer.color} overflow-hidden`}>
                  <div className={`px-3 py-2 ${layer.headerColor} flex items-center gap-2`}>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{layer.sublabel}</span>
                    <span className={`text-sm font-bold ${layer.textColor}`}>{layer.label}</span>
                  </div>
                  <div className="p-3">
                    <div className="flex flex-wrap gap-2">
                      {layer.components.map((comp) => (
                        <button
                          key={comp.id}
                          data-testid={`component-${comp.id}`}
                          onClick={() => setActiveComponent(activeComponent?.label === comp.label ? null : comp)}
                          className={`text-left px-2.5 py-1.5 rounded-md border text-xs font-medium transition-all ${
                            comp.isLoadBearing
                              ? "border-amber-400 bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 ring-1 ring-amber-300 dark:ring-amber-700"
                              : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-primary/5"
                          } ${activeComponent?.label === comp.label ? "ring-2 ring-primary" : ""}`}
                        >
                          {comp.isLoadBearing && <span className="text-amber-500 mr-1">★</span>}
                          {comp.label}
                          {comp.sub && !comp.isLoadBearing && (
                            <span className="block text-[9px] text-muted-foreground font-normal mt-0.5">{comp.sub}</span>
                          )}
                          {comp.isLoadBearing && (
                            <span className="block text-[9px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">{comp.sub}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {layerIdx < layers.length - 1 && (
                  <div className="flex justify-center py-0.5">
                    <ArrowDown className="w-3.5 h-3.5 text-muted-foreground/40" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {activeComponent && (
            <div className="p-4 bg-primary/5 border border-primary/30 rounded-lg flex items-start gap-3" data-testid="component-detail-panel">
              <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-semibold text-foreground text-sm mb-1">{activeComponent.label}</div>
                <div className="text-xs text-muted-foreground">{activeComponent.desc}</div>
                {activeComponent.sub && (
                  <div className="text-[10px] text-primary font-medium mt-1">{activeComponent.sub}</div>
                )}
              </div>
              <button onClick={() => setActiveComponent(null)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div>
            <h2 className="text-sm font-bold text-foreground mb-3">Event-Driven Saga Flows</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {sagas.map((saga) => (
                <Card key={saga.name}>
                  <CardHeader className="pb-2">
                    <CardTitle className={`text-sm font-semibold ${saga.color}`}>{saga.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap items-center gap-1">
                      {saga.steps.map((step, i) => (
                        <div key={i} className="flex items-center gap-1">
                          {!step.startsWith("→") ? (
                            <span className="text-xs font-mono bg-muted px-2 py-1 rounded border border-border text-foreground font-medium">{step}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <ArrowRight className="w-3 h-3" />
                              <span className="bg-muted/50 px-1.5 py-0.5 rounded text-foreground">{step.replace("→ ", "")}</span>
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Non-Functional Requirements</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      <th className="text-left px-4 py-2 font-semibold text-muted-foreground">NFR</th>
                      <th className="text-left px-4 py-2 font-semibold text-muted-foreground">Target</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {[
                      ["Availability (Prod)", "99.9% monthly for core services; 99.5% for AI inference"],
                      ["Request creation latency", "p95 < 800 ms"],
                      ["Match generation latency", "p95 < 3 s for top-5 with rationale"],
                      ["UI page load", "p95 < 2 s on broadband"],
                      ["Throughput (v1)", "50 tenants × 1,000 bookings/month"],
                      ["Audit retention", "7 years (NDIS Commission requirement)"],
                      ["Accessibility", "WCAG 2.2 AA across all participant-facing surfaces"],
                      ["Data residency", "Australia (mandatory)"],
                      ["Security", "OWASP Top 10 mitigations baseline; annual penetration testing"],
                      ["RPO / RTO", "RPO 5 min; RTO 1 hour for full service"],
                    ].map(([nfr, target]) => (
                      <tr key={nfr} className="hover:bg-muted/30">
                        <td className="px-4 py-2 font-medium text-foreground">{nfr}</td>
                        <td className="px-4 py-2 text-muted-foreground">{target}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TAB 2: Visual Platform Map ── */}
        <TabsContent value="map" className="space-y-0 mt-0">

          {/* ── Central AI Engine Hub ── */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative rounded-2xl overflow-hidden border border-primary/30 bg-gradient-to-r from-indigo-600 via-primary to-teal-600 p-5 text-white mb-0"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Cpu className="w-4.5 h-4.5 text-white w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-base">Agentryx AI Engine</h2>
                    <p className="text-xs text-white/70">Core Intelligence Hub — All data flows in, intelligence flows out</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {hubCaps.map(cap => (
                    <span key={cap.label} className="text-[11px] font-medium bg-white/20 px-2.5 py-1 rounded-full">{cap.label}</span>
                  ))}
                </div>
              </div>
              <div className="text-right text-xs text-white/60 hidden lg:block">
                <div className="font-semibold text-white/80">Multi-tenant SaaS</div>
                <div>Australia · Data Residency</div>
                <div>NDIS Commission Compliant</div>
              </div>
            </div>
            {/* Animated pulse dots */}
            <div className="absolute top-3 right-3 flex gap-1.5">
              {[0, 0.3, 0.6].map((d, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: d }}
                  className="w-2 h-2 rounded-full bg-white/60"
                />
              ))}
            </div>
          </motion.div>

          {/* ── Flow direction labels ── */}
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium justify-center">
              <ArrowDown className="w-3 h-3 rotate-180" />
              Raw data flows up from Supply Side
              <ArrowDown className="w-3 h-3 rotate-180" />
            </div>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium justify-center">
              <ArrowDown className="w-3 h-3 rotate-180" />
              Raw data flows up from Demand Side
              <ArrowDown className="w-3 h-3 rotate-180" />
            </div>
          </div>

          {/* ── Supply & Demand columns ── */}
          <div className="grid grid-cols-2 gap-4">
            {/* Supply Side */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-xl border border-violet-200 dark:border-violet-800 overflow-hidden"
            >
              <div className="bg-violet-100 dark:bg-violet-900/40 px-3 py-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Supply Side</span>
                  <p className="text-sm font-bold text-violet-800 dark:text-violet-300">Providers & Credentials</p>
                </div>
                <Briefcase className="w-4 h-4 text-violet-500" />
              </div>
              <div className="p-3 space-y-2">
                {supplyNodes.map(node => (
                  <SideNode key={node.label} node={node} direction="right" />
                ))}
              </div>
              <div className="px-3 pb-3">
                <div className="text-[10px] text-violet-600 dark:text-violet-400 italic font-medium bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg p-2">
                  "Turns raw provider capacity into intelligent, ranked match candidates"
                </div>
              </div>
            </motion.div>

            {/* Demand Side */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="rounded-xl border border-teal-200 dark:border-teal-800 overflow-hidden"
            >
              <div className="bg-teal-100 dark:bg-teal-900/40 px-3 py-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Demand Side</span>
                  <p className="text-sm font-bold text-teal-800 dark:text-teal-300">Participants & Plans</p>
                </div>
                <Users className="w-4 h-4 text-teal-500" />
              </div>
              <div className="p-3 space-y-2">
                {demandNodes.map(node => (
                  <SideNode key={node.label} node={node} direction="left" />
                ))}
              </div>
              <div className="px-3 pb-3">
                <div className="text-[10px] text-teal-600 dark:text-teal-400 italic font-medium bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-2">
                  "Converts NDIS plans and participant needs into precise, fundable service requests"
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Outbound flow label ── */}
          <div className="flex items-center gap-3 py-3">
            <div className="flex-1 h-px border-t border-dashed border-border" />
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium whitespace-nowrap">
              <ArrowDown className="w-3 h-3" />
              Intelligence & platform capabilities radiate from the engine
              <ArrowDown className="w-3 h-3" />
            </div>
            <div className="flex-1 h-px border-t border-dashed border-border" />
          </div>

          {/* ── Platform Feature Modules ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="bg-muted/60 px-3 py-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Platform Capabilities</span>
                  <p className="text-sm font-bold text-foreground">What the Engine Powers</p>
                </div>
                <span className="text-[10px] text-muted-foreground">{featureModules.length} modules · Configurable per tenant</span>
              </div>
              <div className="p-3 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                {featureModules.map((mod, i) => (
                  <motion.div
                    key={mod.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, delay: 0.3 + i * 0.04 }}
                  >
                    <FeatureModule mod={mod} />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── What this means for agencies ── */}
          <div className="pt-2">
            <h2 className="text-sm font-bold text-foreground mb-3">What This Means for NDIS Agencies</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {platformBenefits.map((b, i) => {
                const Icon = b.icon;
                return (
                  <motion.div
                    key={b.title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: 0.5 + i * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-4">
                        <Icon className={`w-5 h-5 ${b.color} mb-2`} />
                        <h3 className="font-semibold text-sm text-foreground mb-1">{b.title}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{b.desc}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

        </TabsContent>
      </Tabs>
    </div>
  );
}
