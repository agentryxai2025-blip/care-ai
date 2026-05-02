import { useState } from "react";
import { Database, RefreshCw, ArrowRight, CheckCircle, Clock, AlertCircle, ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const integrations = [
  { name: "NDIA / PRODA API", purpose: "Provider verification, claim submission, plan validation", status: "Simulated", format: "REST API", direction: "bidirectional", category: "Government", lastSync: "2 May 2026 09:00 AM", recordsIn: 1240, recordsOut: 892 },
  { name: "NDIS Worker Screening DB", purpose: "Credential verification and expiry monitoring", status: "Simulated", format: "REST API", direction: "inbound", category: "Government", lastSync: "2 May 2026 08:30 AM", recordsIn: 89, recordsOut: 0 },
  { name: "Plan Manager Platforms", purpose: "Budget sync, claim submission, invoice generation", status: "Simulated", format: "REST / Invoice", direction: "bidirectional", category: "Finance", lastSync: "2 May 2026 07:15 AM", recordsIn: 412, recordsOut: 234 },
  { name: "Twilio (SMS)", purpose: "SMS notifications with Australian sender ID", status: "Connected (Mock)", format: "REST API", direction: "outbound", category: "Communication", lastSync: "2 May 2026 09:14 AM", recordsIn: 0, recordsOut: 1847 },
  { name: "SendGrid (Email)", purpose: "Transactional email with DKIM/SPF/DMARC", status: "Connected (Mock)", format: "REST API", direction: "outbound", category: "Communication", lastSync: "2 May 2026 09:12 AM", recordsIn: 0, recordsOut: 2103 },
  { name: "Firebase (Push)", purpose: "Mobile push notifications for apps", status: "Connected (Mock)", format: "FCM REST", direction: "outbound", category: "Communication", lastSync: "2 May 2026 09:10 AM", recordsIn: 0, recordsOut: 3241 },
  { name: "Twilio Voice / IVR", purpose: "Inbound AI voice intake for service requests", status: "Simulated", format: "SIP / REST", direction: "inbound", category: "Communication", lastSync: "2 May 2026 08:45 AM", recordsIn: 12, recordsOut: 0 },
  { name: "Xero / MYOB", purpose: "Agency-side financial reconciliation", status: "Simulated", format: "OAuth REST", direction: "bidirectional", category: "Finance", lastSync: "1 May 2026 11:00 PM", recordsIn: 189, recordsOut: 234 },
  { name: "Apple / Google / Microsoft (SSO)", purpose: "Staff and participant identity verification", status: "Simulated", format: "OIDC", direction: "inbound", category: "Identity", lastSync: "2 May 2026 09:14 AM", recordsIn: 48, recordsOut: 0 },
  { name: "Stripe", purpose: "Agentryx SaaS subscription billing", status: "Connected (Mock)", format: "Stripe API", direction: "bidirectional", category: "Finance", lastSync: "2 May 2026 09:00 AM", recordsIn: 2, recordsOut: 8 },
];

const statusColors: Record<string, string> = {
  "Connected (Mock)": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  "Simulated": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "Error": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const directionColors: Record<string, string> = {
  inbound: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  outbound: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  bidirectional: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const dataNodes = [
  { id: "ext", label: "External Sources", x: 0, items: ["NDIA/PRODA", "Plan Managers", "SMS/Email", "Identity Providers"] },
  { id: "gateway", label: "API Gateway", x: 1 },
  { id: "domain", label: "Domain Services", x: 2 },
  { id: "ai", label: "AI Services", x: 3 },
  { id: "storage", label: "Storage Layer", x: 4, items: ["PostgreSQL", "Event Store", "Redis Cache", "Document Store", "Search Index", "Data Warehouse"] },
];

const mockEntities = [
  { entity: "Participants", count: 142, freshness: "Live", lastUpdated: "2 May 2026 09:14 AM" },
  { entity: "Providers", count: 89, freshness: "Live", lastUpdated: "2 May 2026 09:14 AM" },
  { entity: "Service Requests", count: 2847, freshness: "Live", lastUpdated: "2 May 2026 09:14 AM" },
  { entity: "Bookings", count: 12480, freshness: "Live", lastUpdated: "2 May 2026 09:14 AM" },
  { entity: "Claims", count: 8840, freshness: "Live", lastUpdated: "2 May 2026 09:12 AM" },
  { entity: "Audit Events", count: 284120, freshness: "Live", lastUpdated: "2 May 2026 09:14 AM" },
  { entity: "Match Records", count: 18923, freshness: "Live", lastUpdated: "2 May 2026 09:14 AM" },
  { entity: "Incidents", count: 42, freshness: "Live", lastUpdated: "2 May 2026 08:30 AM" },
];

const schemaEntities = [
  { name: "Participants", fields: ["id", "tenant_id", "ndis_number", "plan_id", "dob", "preferences_json", "status"] },
  { name: "Providers", fields: ["id", "tenant_id", "registration_tier", "skills_json", "rating", "reliability_score", "screening_status", "availability"] },
  { name: "Requests", fields: ["id", "tenant_id", "participant_id", "service_type", "location", "schedule", "urgency", "status", "raised_by"] },
  { name: "Matches", fields: ["id", "request_id", "provider_id", "score", "confidence", "rank", "rationale_json"] },
  { name: "Bookings", fields: ["id", "request_id", "provider_id", "state", "price", "agreement_id", "timestamps"] },
  { name: "Claims", fields: ["id", "booking_id", "line_item_id", "amount", "status", "submitted_at", "settled_at"] },
];

export default function DataSources() {
  const [lastRefresh, setLastRefresh] = useState("2 May 2026 09:14 AM");
  const [refreshing, setRefreshing] = useState(false);
  const [expandedSchema, setExpandedSchema] = useState<string | null>(null);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setLastRefresh("2 May 2026 09:" + String(Math.floor(Math.random() * 60)).padStart(2, "0") + " AM");
      setRefreshing(false);
    }, 1500);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Data Sources & Integrations</h1>
          <p className="text-sm text-muted-foreground">How data enters, flows, and is stored in the Agentryx platform</p>
        </div>
      </div>

      {/* External data interfaces */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" /> External Data Interfaces
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Integration</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Purpose</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Format</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Direction</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Last Sync</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {integrations.map((integ) => (
                  <tr key={integ.name} className="hover:bg-muted/30 transition-colors" data-testid={`integration-row-${integ.name.replace(/\s+/g, "-").toLowerCase()}`}>
                    <td className="px-4 py-3 font-medium text-foreground text-xs">{integ.name}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-48">{integ.purpose}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{integ.category}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{integ.format}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${directionColors[integ.direction]}`}>{integ.direction}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{integ.lastSync}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[integ.status]}`}>{integ.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Data flow diagram */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Data Flow Architecture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="flex items-stretch gap-2 min-w-max py-2">
              {/* External */}
              <div className="flex flex-col gap-1.5 w-36">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase text-center mb-1">External Sources</div>
                {["NDIA/PRODA", "Plan Managers", "Twilio SMS/Voice", "SendGrid", "Identity Providers", "Xero/MYOB"].map(s => (
                  <div key={s} className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded px-2 py-1 text-[10px] text-emerald-800 dark:text-emerald-300 font-medium text-center">{s}</div>
                ))}
              </div>

              <div className="flex items-center">
                <div className="flex flex-col items-center">
                  <ArrowRight className="w-5 h-5 text-muted-foreground/50" />
                  <div className="text-[9px] text-muted-foreground">REST/OIDC</div>
                </div>
              </div>

              {/* API Gateway */}
              <div className="flex flex-col justify-center w-28">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase text-center mb-1">API Gateway</div>
                <div className="bg-violet-50 dark:bg-violet-900/20 border-2 border-violet-300 dark:border-violet-700 rounded-lg p-3 text-center">
                  <div className="text-xs font-bold text-violet-800 dark:text-violet-300">Auth</div>
                  <div className="text-[10px] text-violet-600 dark:text-violet-400 mt-1">Rate Limit</div>
                  <div className="text-[10px] text-violet-600 dark:text-violet-400">Tenant Ctx</div>
                  <div className="text-[10px] text-violet-600 dark:text-violet-400">Audit Log</div>
                </div>
              </div>

              <div className="flex items-center">
                <ArrowRight className="w-5 h-5 text-muted-foreground/50" />
              </div>

              {/* Domain services */}
              <div className="flex flex-col justify-center w-32">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase text-center mb-1">Domain Services</div>
                <div className="bg-slate-50 dark:bg-slate-800/40 border-2 border-slate-300 dark:border-slate-600 rounded-lg p-3 text-center space-y-1">
                  {["Participant", "Provider", "Request", "Booking", "Claims"].map(s => (
                    <div key={s} className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded">{s}</div>
                  ))}
                </div>
              </div>

              <div className="flex items-center">
                <ArrowRight className="w-5 h-5 text-muted-foreground/50" />
              </div>

              {/* AI Services */}
              <div className="flex flex-col justify-center w-32">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase text-center mb-1">AI Services</div>
                <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-lg p-3 text-center space-y-1">
                  <div className="text-[10px] font-bold text-amber-800 dark:text-amber-300">★ CareAffinity Engine</div>
                  {["Intent Classifier", "Explainer", "Anomaly Detector"].map(s => (
                    <div key={s} className="text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-1 py-0.5 rounded">{s}</div>
                  ))}
                </div>
              </div>

              <div className="flex items-center">
                <ArrowRight className="w-5 h-5 text-muted-foreground/50" />
              </div>

              {/* Storage */}
              <div className="flex flex-col gap-1.5 w-36">
                <div className="text-[10px] font-semibold text-muted-foreground uppercase text-center mb-1">Storage Layer</div>
                {[
                  { label: "PostgreSQL", sub: "Core domain data", color: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300" },
                  { label: "Event Store", sub: "Domain events", color: "bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800 text-violet-800 dark:text-violet-300" },
                  { label: "Redis Cache", sub: "Sessions, hot config", color: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300" },
                  { label: "Document Store", sub: "PDFs, evidence", color: "bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300" },
                  { label: "Search Index", sub: "Provider/participant", color: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300" },
                  { label: "Data Warehouse", sub: "Analytics, ML training", color: "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-300" },
                ].map(s => (
                  <div key={s.label} className={`border rounded px-2 py-1 ${s.color}`}>
                    <div className="text-[10px] font-semibold">{s.label}</div>
                    <div className="text-[9px] opacity-70">{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mock data simulator */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} /> Mock Data Simulator
            </CardTitle>
            <Button size="sm" variant="outline" onClick={handleRefresh} disabled={refreshing} data-testid="btn-refresh-simulation">
              {refreshing ? "Refreshing..." : "Refresh Simulation"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">All data in this platform is simulated. This panel shows entity counts and simulated data freshness. Last refresh: <span className="font-medium text-foreground">{lastRefresh}</span></p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Entity</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Record Count</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Data Freshness</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Last "Synced"</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockEntities.map((e) => (
                  <tr key={e.entity} className="hover:bg-muted/30 transition-colors" data-testid={`entity-row-${e.entity.toLowerCase()}`}>
                    <td className="px-4 py-3 font-medium text-foreground">{e.entity}</td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground font-semibold">{e.count.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">{e.freshness}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{e.lastUpdated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Schema explorer */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Data Schema Explorer</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {schemaEntities.map((e) => (
            <div key={e.name} className="border border-border rounded-lg overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-3 bg-muted/20 hover:bg-muted/40 transition-colors text-left"
                onClick={() => setExpandedSchema(expandedSchema === e.name ? null : e.name)}
                data-testid={`schema-toggle-${e.name.toLowerCase()}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{e.name}</span>
                  <span className="text-xs text-muted-foreground">{e.fields.length} fields</span>
                </div>
                {expandedSchema === e.name ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
              </button>
              {expandedSchema === e.name && (
                <div className="px-4 py-3 bg-card flex flex-wrap gap-2">
                  {e.fields.map((f) => (
                    <span key={f} className="font-mono text-xs bg-muted px-2 py-1 rounded text-foreground">{f}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
