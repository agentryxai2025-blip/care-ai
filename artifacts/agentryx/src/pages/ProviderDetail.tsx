import { useParams, Link } from "wouter";
import { ArrowLeft, Star, ShieldCheck, Calendar, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { TYPE_META, type ProviderType } from "@/pages/Providers";
import { cn } from "@/lib/utils";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = ["8am", "10am", "12pm", "2pm", "4pm", "6pm"];

const availability: Record<string, boolean[][]> = {
  PR001: [
    [true, true, true, false, false, false],
    [true, true, false, false, false, false],
    [true, true, true, true, false, false],
    [false, false, true, true, true, false],
    [true, true, true, false, false, false],
    [false, false, false, false, false, false],
    [false, false, false, false, false, false],
  ],
};

const defaultAvail = days.map((_, di) =>
  hours.map((_, hi) => Math.random() > 0.4 && !(di >= 5 && hi >= 3))
);

const providerData: Record<string, any> = {
  PR001: {
    id: "PR001", name: "Maria Santos",
    providerType: "Support Worker" as ProviderType,
    tier: "Advanced",
    skills: ["Personal Care", "Manual Handling", "Mental Health First Aid", "Dementia Care"],
    rating: 4.9, reliability: 97, screening: "Current",
    screening_expiry: "14 Jun 2027", availability: "Available",
    suburb: "Newtown", total_bookings: 347, response_time: "18 min",
    ndis_reg: "4050123456", reg_tier: "Advanced",
    profession: null,
    supports: ["Daily Living Activities", "High Intensity Daily Activities"],
    certifications: ["Certificate III Individual Support", "Mental Health First Aid", "Manual Handling", "First Aid (HLTAID011)"],
    completion_rate: 99, on_time_rate: 97, repeat_rate: 78,
    bookings: [
      { id: "BKG-1021", participant: "Margaret Chen", service: "Personal Care",  date: "2 May 2026",  status: "In Progress" },
      { id: "BKG-0998", participant: "Linda Zhao",    service: "Personal Care",  date: "29 Apr 2026", status: "Completed"   },
      { id: "BKG-0971", participant: "Tom Eriksen",   service: "Personal Care",  date: "22 Apr 2026", status: "Completed"   },
    ],
  },
  PR003: {
    id: "PR003", name: "Priya Sharma",
    providerType: "Allied Health" as ProviderType,
    tier: "Advanced",
    skills: ["Occupational Therapy", "Behaviour Support", "Therapy Support"],
    rating: 4.8, reliability: 96, screening: "Current",
    screening_expiry: "2 Mar 2028", availability: "Available",
    suburb: "Parramatta", total_bookings: 412, response_time: "12 min",
    ndis_reg: "4050345678", reg_tier: "Advanced",
    profession: "Occupational Therapist",
    ahpra_reg: "OCC0001234567",
    supports: ["Improved Daily Living", "Assistive Technology", "Home Modifications"],
    certifications: ["Bachelor of OT (Honours)", "AHPRA Registered OT", "NDIS OT Assessments", "Sensory Processing Certificate"],
    completion_rate: 98, on_time_rate: 96, repeat_rate: 82,
    bookings: [
      { id: "BKG-1025", participant: "Aisha Nguyen",   service: "Occupational Therapy", date: "3 May 2026",  status: "In Progress" },
      { id: "BKG-1001", participant: "James Patel",    service: "Therapy Support",      date: "30 Apr 2026", status: "Completed"   },
    ],
  },
  PR012: {
    id: "PR012", name: "Thomas Nkosi",
    providerType: "Behaviour Support" as ProviderType,
    tier: "Advanced",
    skills: ["Behaviour Support", "Mental Health", "Complex Needs", "PBS Plan Development"],
    rating: 4.8, reliability: 96, screening: "Current",
    screening_expiry: "8 Jan 2027", availability: "Available",
    suburb: "Blacktown", total_bookings: 267, response_time: "15 min",
    ndis_reg: "4050567890", reg_tier: "Advanced",
    profession: "Positive Behaviour Support Practitioner",
    ahpra_reg: "PSY0003456789",
    supports: ["Improved Relationships", "Behaviour Support", "Specialist Support Coordination"],
    certifications: ["Master of Applied Behaviour Analysis", "NDIS PBS Practitioner", "Restrictive Practices Auth.", "Crisis Intervention Cert."],
    completion_rate: 97, on_time_rate: 95, repeat_rate: 74,
    bookings: [
      { id: "BKG-1030", participant: "Robert Kirby", service: "Behaviour Support", date: "4 May 2026",  status: "In Progress" },
      { id: "BKG-1008", participant: "Ahmed Hassan", service: "Behaviour Support", date: "1 May 2026",  status: "Completed"   },
    ],
  },
  PR016: {
    id: "PR016", name: "Horizon Disability Svcs",
    providerType: "Organisation" as ProviderType,
    tier: "Advanced",
    skills: ["Personal Care", "Community Access", "Complex Care", "Therapy Support", "SIL Support"],
    rating: 4.8, reliability: 95, screening: "Current",
    screening_expiry: "30 Jun 2027", availability: "Available",
    suburb: "Parramatta", total_bookings: 1840, response_time: "8 min",
    ndis_reg: "4051230001", reg_tier: "Advanced",
    profession: null,
    staff_count: 52,
    supports: ["Daily Living", "Community Participation", "Supported Independent Living", "High Intensity Daily Activities"],
    certifications: ["NDIS Registered Provider", "ISO 9001 Quality Accredited", "NDIS Practice Standards", "NAATI Translation Services"],
    completion_rate: 97, on_time_rate: 94, repeat_rate: 91,
    bookings: [
      { id: "BKG-1035", participant: "Multiple Clients", service: "Personal Care",   date: "4 May 2026", status: "In Progress" },
      { id: "BKG-1040", participant: "Multiple Clients", service: "Complex Care",    date: "3 May 2026", status: "In Progress" },
    ],
  },
  PR018: {
    id: "PR018", name: "PlanFirst Management",
    providerType: "Plan Manager" as ProviderType,
    tier: "General",
    skills: ["NDIS Plan Management", "Financial Reporting", "Claims Processing", "Budget Monitoring"],
    rating: 4.6, reliability: 93, screening: "Current",
    screening_expiry: "15 Sep 2027", availability: "Available",
    suburb: "Parramatta", total_bookings: 612, response_time: "4 hr",
    ndis_reg: "4052100001", reg_tier: "General",
    profession: "NDIS Plan Management",
    supports: ["Plan Management", "Financial Intermediary Services"],
    certifications: ["NDIS Registered Plan Manager", "Financial Services Licence (AFS)", "CPA Australia Member", "NDIS Price Guide Compliant"],
    completion_rate: 99, on_time_rate: 97, repeat_rate: 88,
    bookings: [
      { id: "PM-3001", participant: "Margaret Chen", service: "Plan Management", date: "May 2026", status: "In Progress" },
      { id: "PM-3002", participant: "David Okonkwo", service: "Plan Management", date: "May 2026", status: "In Progress" },
    ],
  },
};

const fallback = {
  id: "PR002", name: "James O'Brien",
  providerType: "Support Worker" as ProviderType,
  tier: "General",
  skills: ["Community Access", "Transport", "Social Support"],
  rating: 4.7, reliability: 93, screening: "Current",
  screening_expiry: "3 Feb 2026", availability: "Busy",
  suburb: "Surry Hills", total_bookings: 218, response_time: "32 min",
  ndis_reg: "4050234567", reg_tier: "General",
  profession: null,
  supports: ["Assistance with Social, Economic and Community Participation"],
  certifications: ["Certificate III Individual Support", "Working with Children Check", "First Aid"],
  completion_rate: 96, on_time_rate: 92, repeat_rate: 61,
  bookings: [
    { id: "BKG-1022", participant: "David Okonkwo", service: "Community Access", date: "2 May 2026",  status: "In Progress" },
    { id: "BKG-0990", participant: "James Patel",   service: "Community Access", date: "28 Apr 2026", status: "Completed"   },
  ],
};

const tierColors: Record<string, string> = {
  Advanced: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400",
  General:  "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  Basic:    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  Enrolled: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
};

const screeningColors: Record<string, string> = {
  Current:  "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  Expiring: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  Expired:  "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const statusColors: Record<string, string> = {
  "In Progress": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  Completed:     "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
};

export default function ProviderDetail() {
  const params = useParams<{ id: string }>();
  const p = providerData[params.id || ""] || fallback;
  const avail = availability[params.id || ""] || defaultAvail;

  const typeMeta = TYPE_META[p.providerType as ProviderType];
  const TypeIcon = typeMeta?.icon;

  const isPlanManager = p.providerType === "Plan Manager";
  const isOrg = p.providerType === "Organisation";

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link href="/providers" className="p-1.5 rounded-md hover:bg-muted text-muted-foreground inline-flex" data-testid="btn-back">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-foreground">{p.name}</h1>
            {typeMeta && TypeIcon && (
              <span className={cn("inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full", typeMeta.bg, typeMeta.color)}>
                <TypeIcon className="w-3 h-3" />{p.providerType}
              </span>
            )}
            {p.profession && (
              <span className="text-sm text-muted-foreground">· {p.profession}</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {p.suburb}
            {p.ndis_reg && <> · NDIS Reg: {p.ndis_reg}</>}
            {p.staff_count && <> · {p.staff_count} staff</>}
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <span className={`text-xs px-2.5 py-1 rounded font-medium ${tierColors[p.tier]}`}>{p.tier} Tier</span>
          {!isPlanManager && (
            <Button size="sm" variant="outline" data-testid="btn-book-provider">
              {isOrg ? "Request Services" : "Book Provider"}
            </Button>
          )}
          {isPlanManager && (
            <Button size="sm" variant="outline" data-testid="btn-book-provider">Assign as Plan Manager</Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Performance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><Star className="w-4 h-4" />Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="text-4xl font-bold text-foreground">{p.rating}</div>
              <div>
                <div className="flex">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`w-4 h-4 ${i <= Math.round(p.rating) ? "text-amber-400 fill-amber-400" : "text-muted"}`} />
                  ))}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{p.total_bookings.toLocaleString()} {isPlanManager ? "clients managed" : isOrg ? "service deliveries" : "bookings"}</div>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: isPlanManager ? "Claims Accuracy" : "Completion Rate", value: p.completion_rate },
                { label: "Reliability Score",  value: p.reliability    },
                { label: isPlanManager ? "On-time Processing" : "On-time Arrival", value: p.on_time_rate },
                { label: isPlanManager ? "Client Retention"  : "Repeat Bookings", value: p.repeat_rate  },
              ].map(m => (
                <div key={m.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{m.label}</span>
                    <span className="font-semibold">{m.value}%</span>
                  </div>
                  <Progress value={m.value} className="h-1.5" />
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-border text-xs text-muted-foreground">
              {isPlanManager ? "Avg processing time" : "Avg response"}: <span className="font-medium text-foreground">{p.response_time}</span>
            </div>
          </CardContent>
        </Card>

        {/* Credentials */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><ShieldCheck className="w-4 h-4" />Credentials</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-[10px] uppercase font-semibold text-muted-foreground mb-2">
                {isOrg ? "Accreditation Status" : "Worker Screening"}
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${screeningColors[p.screening]}`}>{p.screening}</span>
                <span className="text-xs text-muted-foreground">Expires {p.screening_expiry}</span>
              </div>
            </div>
            {p.ahpra_reg && (
              <div>
                <div className="text-[10px] uppercase font-semibold text-muted-foreground mb-1">AHPRA Registration</div>
                <div className="text-xs font-mono text-foreground bg-muted/40 px-2.5 py-1.5 rounded">{p.ahpra_reg}</div>
              </div>
            )}
            <div>
              <div className="text-[10px] uppercase font-semibold text-muted-foreground mb-2">Approved Supports</div>
              <div className="space-y-1">
                {p.supports.map((s: string) => (
                  <div key={s} className="text-xs text-foreground bg-muted/40 px-2.5 py-1.5 rounded">{s}</div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold text-muted-foreground mb-2">Certifications</div>
              <div className="space-y-1.5">
                {p.certifications.map((c: string) => (
                  <div key={c} className="flex items-center gap-2 text-xs text-foreground">
                    <Award className="w-3 h-3 text-primary flex-shrink-0" />{c}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Availability (hidden for Plan Manager / Org — they show service regions instead) */}
        {!isPlanManager ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4" />{isOrg ? "Service Coverage" : "Weekly Availability"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isOrg ? (
                <div className="space-y-3">
                  {["Greater Western Sydney", "Inner West", "South West Sydney", "Northern Sydney", "Telehealth (Australia-wide)"].map(region => (
                    <div key={region} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-foreground">{region}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-border text-xs text-muted-foreground">
                    Operates 24/7 · On-call support available
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-[10px]">
                    <thead>
                      <tr>
                        <th className="w-12 text-muted-foreground font-normal pb-1" />
                        {hours.map(h => <th key={h} className="text-muted-foreground font-normal pb-1 text-center px-0.5">{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {days.map((day, di) => (
                        <tr key={day}>
                          <td className="text-muted-foreground font-medium py-0.5 pr-1">{day}</td>
                          {hours.map((_, hi) => (
                            <td key={hi} className="py-0.5 px-0.5">
                              <div className={`w-full h-5 rounded ${avail[di]?.[hi] ? "bg-primary/70" : "bg-muted/50"}`} />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex gap-3 mt-2">
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground"><div className="w-3 h-3 rounded bg-primary/70" />Available</div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground"><div className="w-3 h-3 rounded bg-muted/50" />Unavailable</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calendar className="w-4 h-4" />Plan Management Services
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                { label: "Current Participants Managed", val: "84" },
                { label: "Avg Plan Duration", val: "12 months" },
                { label: "Claims Processed (YTD)", val: "3,412" },
                { label: "Avg Budget Utilisation", val: "71%" },
                { label: "Turnaround — Invoices",  val: "2 business days" },
                { label: "Turnaround — Reports",   val: "5 business days" },
              ].map(row => (
                <div key={row.label} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-semibold text-foreground">{row.val}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Bookings / Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            {isPlanManager ? "Active Client Plans" : isOrg ? "Recent Service Deliveries" : "Recent Bookings"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {p.bookings.map((b: any) => (
              <div key={b.id} className="flex items-center gap-4 px-4 py-3" data-testid={`booking-row-${b.id}`}>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">{b.participant}</div>
                  <div className="text-xs text-muted-foreground">{b.service} · {b.date}</div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[b.status] || "bg-muted text-muted-foreground"}`}>{b.status}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
