import { useParams, Link } from "wouter";
import { ArrowLeft, User, FileText, Calendar, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const participants: Record<string, any> = {
  P001: {
    id: "P001", name: "Margaret Chen", ndis_number: "430218967", plan_type: "Plan-managed",
    support_coordinator: "Helen Marsh", status: "Active", dob: "12 Apr 1974", suburb: "Newtown",
    phone: "0412 345 678", email: "m.chen@email.com.au",
    preferences: { language: "English/Mandarin", gender_pref: "Female", accessibility_needs: "Wheelchair access" },
    plan: {
      start: "1 Jul 2025", end: "30 Jun 2026", total: 68500,
      management: "Plan-managed",
      categories: [
        { name: "Core Supports", code: "01", allocated: 42000, spent: 28700 },
        { name: "Capacity Building", code: "07", allocated: 18500, spent: 9800 },
        { name: "Capital Supports", code: "15", allocated: 8000, spent: 2700 },
      ]
    },
    bookings: [
      { id: "BKG-1021", service: "Personal Care", provider: "Maria Santos", date: "2 May 2026", status: "In Progress" },
      { id: "BKG-0998", service: "Community Access", provider: "James O'Brien", date: "29 Apr 2026", status: "Completed" },
      { id: "BKG-0971", service: "Personal Care", provider: "Maria Santos", date: "22 Apr 2026", status: "Completed" },
    ],
    requests: [
      { id: "REQ-2847", service: "Personal Care", urgency: "Priority", status: "Matching", date: "2 May 2026" },
      { id: "REQ-2790", service: "Community Access", urgency: "Routine", status: "Completed", date: "25 Apr 2026" },
    ]
  },
};

const fallback = {
  id: "P002", name: "David Okonkwo", ndis_number: "512874321", plan_type: "NDIA-managed",
  support_coordinator: "Ryan Lee", status: "Active", dob: "7 Feb 1992", suburb: "Surry Hills",
  phone: "0423 456 789", email: "d.okonkwo@email.com.au",
  preferences: { language: "English", gender_pref: "No preference", accessibility_needs: "Hearing support" },
  plan: {
    start: "1 Jan 2026", end: "31 Dec 2026", total: 92000, management: "NDIA-managed",
    categories: [
      { name: "Core Supports", code: "01", allocated: 58000, spent: 24500 },
      { name: "Capacity Building", code: "07", allocated: 24000, spent: 11200 },
      { name: "Capital Supports", code: "15", allocated: 10000, spent: 3000 },
    ]
  },
  bookings: [
    { id: "BKG-1022", service: "Community Access", provider: "James O'Brien", date: "2 May 2026", status: "In Progress" },
    { id: "BKG-0990", service: "Personal Care", provider: "Priya Sharma", date: "28 Apr 2026", status: "Completed" },
  ],
  requests: [
    { id: "REQ-2846", service: "Community Access", urgency: "Routine", status: "Booked", date: "1 May 2026" },
  ]
};

const statusColors: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-800",
  Inactive: "bg-slate-100 text-slate-600",
  Review: "bg-amber-100 text-amber-800",
  "In Progress": "bg-blue-100 text-blue-800",
  Completed: "bg-emerald-100 text-emerald-800",
  Matching: "bg-blue-100 text-blue-800",
  Booked: "bg-indigo-100 text-indigo-800",
};

export default function ParticipantDetail() {
  const params = useParams<{ id: string }>();
  const p = participants[params.id || ""] || fallback;

  const totalSpent = p.plan.categories.reduce((s: number, c: any) => s + c.spent, 0);
  const totalAllocated = p.plan.categories.reduce((s: number, c: any) => s + c.allocated, 0);
  const overallPct = Math.round((totalSpent / totalAllocated) * 100);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/participants" className="p-1.5 rounded-md hover:bg-muted text-muted-foreground inline-flex" data-testid="btn-back">
            <ArrowLeft className="w-4 h-4" />
          </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">{p.name}</h1>
          <p className="text-sm text-muted-foreground">NDIS: {p.ndis_number} · {p.suburb}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[p.status]}`}>{p.status}</span>
          <Button size="sm" variant="outline" data-testid="btn-new-request">New Request</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Profile */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><User className="w-4 h-4" />Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ["Date of Birth", p.dob],
              ["Suburb", p.suburb],
              ["Phone", p.phone],
              ["Email", p.email],
              ["NDIS Number", p.ndis_number],
              ["Plan Type", p.plan_type],
              ["Support Coordinator", p.support_coordinator],
            ].map(([label, value]) => (
              <div key={label}>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
                <div className="text-sm text-foreground mt-0.5">{value}</div>
              </div>
            ))}
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Preferences</div>
              <div className="space-y-1">
                <div className="text-xs"><span className="text-muted-foreground">Language:</span> {p.preferences.language}</div>
                <div className="text-xs"><span className="text-muted-foreground">Gender pref:</span> {p.preferences.gender_pref}</div>
                <div className="text-xs"><span className="text-muted-foreground">Accessibility:</span> {p.preferences.accessibility_needs}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><FileText className="w-4 h-4" />NDIS Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Plan Period</div>
                <div className="text-sm text-foreground mt-0.5">{p.plan.start} – {p.plan.end}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Total Budget</div>
                <div className="text-sm font-bold text-foreground mt-0.5">${p.plan.total.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Management</div>
                <div className="text-sm text-foreground mt-0.5">{p.plan.management}</div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Overall utilisation</span>
                <span className={`font-semibold ${overallPct > 85 ? "text-red-600" : overallPct > 60 ? "text-amber-600" : "text-foreground"}`}>{overallPct}%</span>
              </div>
              <Progress value={overallPct} className="h-2" />
              <div className="text-xs text-muted-foreground mt-1">${totalSpent.toLocaleString()} spent of ${totalAllocated.toLocaleString()} allocated</div>
            </div>

            <div className="space-y-3">
              {p.plan.categories.map((cat: any) => {
                const pct = Math.round((cat.spent / cat.allocated) * 100);
                return (
                  <div key={cat.code} className="p-3 bg-muted/40 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <span className="text-xs font-semibold text-foreground">{cat.name}</span>
                        <span className="text-[10px] text-muted-foreground ml-2">Support Category {cat.code}</span>
                      </div>
                      <span className={`text-xs font-semibold ${pct > 85 ? "text-red-600" : pct > 60 ? "text-amber-600" : "text-muted-foreground"}`}>{pct}%</span>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5">
                      <span>Spent: ${cat.spent.toLocaleString()}</span>
                      <span>Remaining: ${(cat.allocated - cat.spent).toLocaleString()}</span>
                      <span>Allocated: ${cat.allocated.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Bookings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><Calendar className="w-4 h-4" />Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {p.bookings.map((b: any) => (
                <div key={b.id} className="flex items-center gap-4 px-4 py-3" data-testid={`booking-row-${b.id}`}>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">{b.service}</div>
                    <div className="text-xs text-muted-foreground">{b.provider} · {b.date}</div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[b.status]}`}>{b.status}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Requests */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><Activity className="w-4 h-4" />Recent Requests</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {p.requests.map((r: any) => (
                <Link key={r.id} href={`/requests/${r.id}`}>
                  <a className="flex items-center gap-4 px-4 py-3 hover:bg-muted/40 cursor-pointer" data-testid={`request-row-${r.id}`}>
                    <div className="flex-1">
                      <div className="text-xs font-mono text-muted-foreground">{r.id}</div>
                      <div className="text-sm font-medium text-foreground">{r.service}</div>
                      <div className="text-xs text-muted-foreground">{r.date} · {r.urgency}</div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[r.status]}`}>{r.status}</span>
                  </a>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
