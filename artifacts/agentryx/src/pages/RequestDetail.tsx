import { useState } from "react";
import { useParams, Link } from "wouter";
import { ArrowLeft, MapPin, Clock, Calendar, Cpu, CheckCircle, Activity, Zap, User, ShieldCheck, DollarSign, Star, Award, Phone, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const mockRequest = {
  id: "REQ-2847",
  participant: "Margaret Chen",
  participant_id: "P001",
  ndis_number: "430218967",
  service: "Personal Care",
  urgency: "Priority",
  location: "Newtown NSW 2042",
  schedule: "Daily 8:00–10:00 AM",
  frequency: "Daily",
  duration: "2 hours",
  notes: "Participant requires manual handling support. Prefers female worker. Wheelchair accessible home.",
  status: "Matching",
  created: "2 May 2026 09:14 AM",
  raised_by: "Helen Marsh",
  plan_balance_ok: true,
  eligibility_ok: true,
  matches: [
    { rank: 1, provider: "Maria Santos", agency: "CareConnect NSW", score: 92, confidence: 0.91, distance: "3.2 km", rating: 4.9, bookings: 47, available: true, response_time: "18 min", rationale: "3.2 km from participant, available within 2 hours, 4.9★ from 47 bookings, 12 successful sessions with similar participants, has Mental Health First Aid certification, female (matches participant preference)." },
    { rank: 2, provider: "Fatima Al-Hassan", agency: "SupportFirst", score: 85, confidence: 0.82, distance: "5.1 km", rating: 4.9, bookings: 121, available: true, response_time: "10 min", rationale: "5.1 km from participant, highly reliable (98%), 4.9★ from 121 bookings, cultural and language match, complex care experience." },
    { rank: 3, provider: "Sophie Laurent", agency: "Harmony Care", score: 76, confidence: 0.68, distance: "4.7 km", rating: 4.7, bookings: 38, available: true, response_time: "28 min", rationale: "4.7 km from participant, available in schedule window, 4.7★ rating, certified in manual handling, female worker." },
  ],
  timeline: [
    { event: "Request submitted", detail: "Via Operations Console", time: "9:14 AM", actor: "Helen Marsh", type: "info", stage: "intake" },
    { event: "Plan balance validated", detail: "$42,800 remaining — sufficient for service", time: "9:14 AM", actor: "System", type: "success", stage: "validation" },
    { event: "NDIS eligibility confirmed", detail: "Active plan, support category 01 approved", time: "9:14 AM", actor: "System", type: "success", stage: "validation" },
    { event: "AI Matching engine started", detail: "89 providers being evaluated across 6 criteria", time: "9:15 AM", actor: "AI Engine", type: "info", stage: "matching" },
    { event: "3 candidates identified", detail: "Top match: Maria Santos — 92% confidence", time: "9:15 AM", actor: "AI Engine", type: "success", stage: "matching" },
    { event: "Awaiting human review", detail: "Threshold 78% exceeded — auto-approve eligible", time: "9:15 AM", actor: "System", type: "warning", stage: "review" },
  ],
};

const WORKFLOW_STAGES = [
  {
    id: "intake",
    label: "Intake",
    sublabel: "Request received",
    icon: Activity,
    completedAt: "9:14 AM",
    color: "emerald",
    details: [
      { label: "Submitted by", value: "Helen Marsh" },
      { label: "Channel", value: "Operations Console" },
      { label: "Request ID", value: "REQ-2847" },
      { label: "Priority", value: "Priority" },
    ],
  },
  {
    id: "validation",
    label: "Validation",
    sublabel: "Plan & eligibility check",
    icon: ShieldCheck,
    completedAt: "9:14 AM",
    color: "emerald",
    details: [
      { label: "Plan balance", value: "$42,800 remaining ✓" },
      { label: "NDIS eligibility", value: "Active — Category 01 ✓" },
      { label: "Budget check", value: "Passed ✓" },
      { label: "Service category", value: "Core Supports ✓" },
    ],
  },
  {
    id: "matching",
    label: "AI Matching",
    sublabel: "Provider search & ranking",
    icon: Cpu,
    completedAt: "9:15 AM",
    color: "blue",
    details: [
      { label: "Providers scanned", value: "89" },
      { label: "Criteria evaluated", value: "6 dimensions" },
      { label: "Candidates found", value: "3 providers" },
      { label: "Top confidence", value: "92%" },
    ],
  },
  {
    id: "review",
    label: "Human Review",
    sublabel: "Approval pending",
    icon: User,
    completedAt: null,
    color: "amber",
    details: [
      { label: "Reviewer", value: "Unassigned" },
      { label: "Auto-approve eligible", value: "Yes (>78%)" },
      { label: "Action required", value: "Approve or reject match" },
    ],
  },
  {
    id: "booking",
    label: "Booking",
    sublabel: "Confirmation",
    icon: Calendar,
    completedAt: null,
    color: "slate",
    details: [
      { label: "Status", value: "Awaiting approval" },
      { label: "Provider", value: "TBC" },
    ],
  },
  {
    id: "delivery",
    label: "Delivery",
    sublabel: "Service in progress",
    icon: Award,
    completedAt: null,
    color: "slate",
    details: [
      { label: "Status", value: "Not started" },
    ],
  },
  {
    id: "claim",
    label: "Claim",
    sublabel: "NDIS billing",
    icon: DollarSign,
    completedAt: null,
    color: "slate",
    details: [
      { label: "Status", value: "Not submitted" },
    ],
  },
];

const urgencyColors: Record<string, string> = {
  Emergency: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Priority: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Routine: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

const statusColors: Record<string, string> = {
  Matching: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "Pending Match": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  Matched: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400",
  Booked: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
};

const stageStatusMap: Record<string, "done" | "active" | "pending"> = {
  intake: "done",
  validation: "done",
  matching: "done",
  review: "active",
  booking: "pending",
  delivery: "pending",
  claim: "pending",
};

const colorMap: Record<string, { done: string; active: string; dot: string }> = {
  emerald: { done: "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400", active: "bg-emerald-50 text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  blue: { done: "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400", active: "bg-blue-50 text-blue-600 dark:text-blue-400", dot: "bg-blue-500" },
  amber: { done: "bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400", active: "bg-amber-50 text-amber-600 dark:text-amber-400", dot: "bg-amber-500" },
  slate: { done: "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500", active: "bg-slate-50 text-slate-500", dot: "bg-slate-400" },
};

export default function RequestDetail() {
  const params = useParams<{ id: string }>();
  const r = mockRequest;
  const id = params.id || r.id;
  const [expandedStage, setExpandedStage] = useState<string | null>("review");
  const [matchApproved, setMatchApproved] = useState(false);
  const [bookingId] = useState("BKG-1025");

  const completedCount = WORKFLOW_STAGES.filter(s => stageStatusMap[s.id] === "done").length;
  const progressPct = Math.round((completedCount / WORKFLOW_STAGES.length) * 100);

  const handleApproveMatch = () => {
    setMatchApproved(true);
    setExpandedStage("booking");
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/requests" className="p-1.5 rounded-md hover:bg-muted text-muted-foreground inline-flex" data-testid="btn-back"><ArrowLeft className="w-4 h-4" /></Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">{id}</h1>
          <p className="text-sm text-muted-foreground">{r.participant} · {r.service}</p>
        </div>
        <div className="ml-auto flex gap-2 flex-wrap">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${urgencyColors[r.urgency]}`}>{r.urgency}</span>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[r.status]}`}>{r.status}</span>
          {!matchApproved && (
            <Button size="sm" onClick={handleApproveMatch} data-testid="btn-approve-match" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <Check className="w-3.5 h-3.5 mr-1.5" /> Approve Match
            </Button>
          )}
          {matchApproved && (
            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 px-2.5 py-1">
              <Check className="w-3.5 h-3.5 mr-1" /> Match Approved
            </Badge>
          )}
        </div>
      </div>

      {/* Workflow Pipeline */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 bg-muted/30 border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              Full Workflow Pipeline
            </CardTitle>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">{completedCount} of {WORKFLOW_STAGES.length} stages complete</span>
              <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
              <span className="text-xs font-semibold text-primary">{progressPct}%</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Stage strip */}
          <div className="flex border-b border-border overflow-x-auto">
            {WORKFLOW_STAGES.map((stage, i) => {
              const status = matchApproved && stage.id === "booking" ? "done" : matchApproved && stage.id === "delivery" ? "active" : stageStatusMap[stage.id];
              const colors = colorMap[stage.color] || colorMap.slate;
              const Icon = stage.icon;
              const isExpanded = expandedStage === stage.id;
              return (
                <button
                  key={stage.id}
                  onClick={() => setExpandedStage(isExpanded ? null : stage.id)}
                  data-testid={`workflow-stage-${stage.id}`}
                  className={cn(
                    "flex-1 min-w-[100px] flex flex-col items-center py-3 px-2 border-r last:border-r-0 border-border transition-all relative group",
                    isExpanded ? "bg-muted/60" : "hover:bg-muted/30",
                    status === "active" && !isExpanded ? "bg-amber-50/50 dark:bg-amber-900/10" : ""
                  )}
                >
                  {/* Connector line */}
                  {i < WORKFLOW_STAGES.length - 1 && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-px h-8 bg-border" />
                  )}

                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center mb-1.5 border transition-all",
                    status === "done" ? colors.done :
                    status === "active" ? "bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-600" :
                    "bg-muted border-border text-muted-foreground"
                  )}>
                    {status === "done" ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                  </div>
                  <div className={cn("text-[10px] font-semibold text-center", status === "done" ? "text-foreground" : status === "active" ? "text-amber-700 dark:text-amber-400" : "text-muted-foreground")}>{stage.label}</div>
                  <div className="text-[9px] text-muted-foreground text-center hidden sm:block">{stage.completedAt || (status === "active" ? "In progress" : "Pending")}</div>
                  {isExpanded ? <ChevronUp className="w-3 h-3 text-muted-foreground mt-0.5" /> : <ChevronDown className="w-3 h-3 text-muted-foreground mt-0.5 opacity-0 group-hover:opacity-100" />}
                </button>
              );
            })}
          </div>

          {/* Expanded stage detail */}
          <AnimatePresence>
            {expandedStage && (
              <motion.div
                key={expandedStage}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {(() => {
                  const stage = WORKFLOW_STAGES.find(s => s.id === expandedStage);
                  if (!stage) return null;
                  const status = matchApproved && stage.id === "booking" ? "done" : stageStatusMap[stage.id];
                  const Icon = stage.icon;
                  return (
                    <div className="p-4 bg-muted/20 border-t border-border">
                      <div className="flex items-start gap-4">
                        <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", status === "done" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" : status === "active" ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600" : "bg-muted text-muted-foreground")}>
                          {status === "done" ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-sm font-semibold text-foreground">{stage.label}</h3>
                            <span className="text-xs text-muted-foreground">— {stage.sublabel}</span>
                            {status === "done" && <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">Completed {stage.completedAt}</Badge>}
                            {status === "active" && <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">In Progress</Badge>}
                            {status === "pending" && <Badge variant="secondary" className="text-[10px]">Pending</Badge>}
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2">
                            {(matchApproved && stage.id === "booking"
                              ? [{ label: "Booking ID", value: bookingId }, { label: "Provider", value: "Maria Santos" }, { label: "Status", value: "Confirmed ✓" }, { label: "Schedule", value: "Daily 8–10 AM" }]
                              : stage.details
                            ).map(d => (
                              <div key={d.label}>
                                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">{d.label}</div>
                                <div className="text-xs text-foreground mt-0.5 font-medium">{d.value}</div>
                              </div>
                            ))}
                          </div>

                          {/* Special: matching stage shows mini pipeline */}
                          {stage.id === "matching" && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {["Eligibility", "Skills", "Availability", "Preferences", "Budget", "Ranking"].map((s, i) => (
                                <span key={s} className="flex items-center gap-1 text-[10px] px-2 py-0.5 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full">
                                  <Check className="w-2.5 h-2.5" /> Stage {i + 1}: {s}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Special: review stage shows approve CTA */}
                          {stage.id === "review" && !matchApproved && (
                            <div className="mt-3 flex items-center gap-3 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg">
                              <Zap className="w-4 h-4 text-amber-600 flex-shrink-0" />
                              <span className="text-xs text-amber-800 dark:text-amber-400">Auto-approve threshold exceeded (92% ≥ 78%). Click <strong>Approve Match</strong> to proceed to booking.</span>
                            </div>
                          )}
                          {stage.id === "review" && matchApproved && (
                            <div className="mt-3 flex items-center gap-2 p-2.5 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                              <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Match approved — booking confirmed as {bookingId}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Request details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Request Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ["Participant", <Link href={`/participants/${r.participant_id}`} className="text-primary hover:underline">{r.participant}</Link>],
              ["NDIS Number", <span className="font-mono text-xs">{r.ndis_number}</span>],
              ["Service Type", r.service],
              ["Location", <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{r.location}</span>],
              ["Schedule", <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{r.schedule}</span>],
              ["Created", <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{r.created}</span>],
              ["Raised by", r.raised_by],
            ].map(([label, value]: any) => (
              <div key={label}>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
                <div className="text-sm text-foreground mt-0.5">{value}</div>
              </div>
            ))}
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Notes</div>
              <div className="text-xs text-foreground bg-muted/40 p-2.5 rounded">{r.notes}</div>
            </div>
            <div className="flex gap-3 pt-1 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                <CheckCircle className="w-3.5 h-3.5" /> Plan balance OK
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                <CheckCircle className="w-3.5 h-3.5" /> Eligibility confirmed
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Matches */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2"><Cpu className="w-4 h-4 text-primary" />AI Match Results</CardTitle>
              <span className="text-xs text-muted-foreground">3 candidates · Assisted mode</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {r.matches.map((m) => (
              <div key={m.rank} className={`p-4 rounded-lg border transition-all ${m.rank === 1 && matchApproved ? "border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/10" : m.rank === 1 ? "border-primary/40 bg-primary/5" : "border-border bg-card"}`} data-testid={`match-rank-${m.rank}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${m.rank === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {m.rank === 1 && matchApproved ? <Check className="w-4 h-4" /> : `#${m.rank}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                      <div>
                        <span className="font-semibold text-foreground">{m.provider}</span>
                        <span className="text-xs text-muted-foreground ml-2">{m.agency}</span>
                        {m.rank === 1 && matchApproved && <Badge className="ml-2 text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Booked — {bookingId}</Badge>}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Score</div>
                          <div className="text-sm font-bold text-foreground">{m.score}/100</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">Confidence</div>
                          <div className={`text-sm font-bold ${m.confidence >= 0.78 ? "text-emerald-600" : "text-amber-600"}`}>{Math.round(m.confidence * 100)}%</div>
                        </div>
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${m.score}%` }}
                        transition={{ duration: 0.8, delay: m.rank * 0.15 }}
                        className={cn("h-full rounded-full", m.rank === 1 ? "bg-primary" : "bg-muted-foreground/40")}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground mb-2 bg-muted/30 p-2 rounded italic">
                      "{m.rationale}"
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{m.distance}</span>
                      <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" />{m.rating}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{m.bookings} bookings</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{m.response_time} avg response</span>
                    </div>
                  </div>
                  {m.rank === 1 && !matchApproved && (
                    <Button size="sm" className="flex-shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleApproveMatch} data-testid="btn-book-top-match">
                      <Check className="w-3.5 h-3.5 mr-1" /> Book
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Event Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Clock className="w-4 h-4" /> Event Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative pl-5 space-y-4">
            <div className="absolute left-2 top-0 bottom-0 w-px bg-border" />
            {[...r.timeline, ...(matchApproved ? [
              { event: "Match approved by operator", detail: "Maria Santos selected — confidence 92%", time: "Just now", actor: "Operator", type: "success", stage: "review" },
              { event: "Provider notified", detail: "SMS + app notification sent to Maria Santos", time: "Just now", actor: "System", type: "info", stage: "booking" },
              { event: `Booking confirmed — ${bookingId}`, detail: "Daily 8:00–10:00 AM · Personal Care · 2 hrs", time: "Just now", actor: "System", type: "success", stage: "booking" },
            ] : [])].map((t, i, arr) => (
              <motion.div
                key={i}
                initial={i >= r.timeline.length ? { opacity: 0, x: -10 } : false}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (i - r.timeline.length) * 0.15 }}
                className="relative pl-5"
                data-testid={`timeline-event-${i}`}
              >
                <div className={`absolute left-0 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-background ${
                  t.type === "success" ? "bg-emerald-500" :
                  t.type === "error" ? "bg-red-500" :
                  t.type === "warning" ? "bg-amber-500" :
                  "bg-blue-500"
                }`} />
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">{t.event}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{t.detail} · {t.actor}</div>
                  </div>
                  <div className="text-xs text-muted-foreground flex-shrink-0">{t.time}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
