import { useState } from "react";
import { Link } from "wouter";
import {
  Users, Briefcase, FileText, CreditCard, ShieldAlert, Zap,
  TrendingUp, Clock, ArrowRight, Activity, Plus, Sparkles
} from "lucide-react";
import RequestWizard from "@/components/RequestWizard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from "recharts";

const metrics = [
  { label: "Active Participants", value: "142", icon: Users, trend: "+3 this week", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
  { label: "Active Providers", value: "89", icon: Briefcase, trend: "+1 this week", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  { label: "Open Requests", value: "23", icon: FileText, trend: "8 urgent", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
  { label: "Pending Claims", value: "17", icon: CreditCard, trend: "$42,800 value", color: "text-violet-600", bg: "bg-violet-50 dark:bg-violet-900/20" },
  { label: "Compliance Alerts", value: "4", icon: ShieldAlert, trend: "2 critical", color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" },
  { label: "Automation Rate", value: "71%", icon: Zap, trend: "+5% vs last month", color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
];

const recentRequests = [
  { id: "REQ-2847", participant: "Margaret Chen", service: "Personal Care", urgency: "Priority", status: "Matching", time: "12 min ago" },
  { id: "REQ-2846", participant: "David Okonkwo", service: "Community Access", urgency: "Routine", status: "Booked", time: "38 min ago" },
  { id: "REQ-2845", participant: "Sarah Williams", service: "Therapy Support", urgency: "Emergency", status: "Pending Match", time: "1h ago" },
  { id: "REQ-2844", participant: "James Patel", service: "Domestic Assistance", urgency: "Routine", status: "Completed", time: "2h ago" },
  { id: "REQ-2843", participant: "Aisha Nguyen", service: "Personal Care", urgency: "Priority", status: "Matched", time: "3h ago" },
];

const activeBookings = [
  { id: "BKG-1021", participant: "Tom Eriksen", provider: "Maria Santos", service: "Personal Care", time: "9:00–11:00 AM", status: "In Progress" },
  { id: "BKG-1022", participant: "Linda Zhao", provider: "James O'Brien", service: "Community Access", time: "10:00–2:00 PM", status: "In Progress" },
  { id: "BKG-1023", participant: "Robert Kirby", provider: "Priya Sharma", service: "Therapy Support", time: "1:00–2:30 PM", status: "Confirmed" },
  { id: "BKG-1024", participant: "Yuki Tanaka", provider: "Carlos Mendez", service: "Domestic Assistance", time: "2:00–4:00 PM", status: "Confirmed" },
];

const budgetData = [
  { category: "Core Supports", allocated: 280000, spent: 187000 },
  { category: "Capacity Building", allocated: 95000, spent: 52000 },
  { category: "Capital", allocated: 45000, spent: 18000 },
];

const bookingTrend = [
  { month: "Dec", bookings: 148 }, { month: "Jan", bookings: 162 },
  { month: "Feb", bookings: 155 }, { month: "Mar", bookings: 178 },
  { month: "Apr", bookings: 191 }, { month: "May", bookings: 203 },
];

const auditLog = [
  { action: "Match auto-approved", entity: "REQ-2841", actor: "AI Engine", time: "5m ago", type: "success" },
  { action: "Claim submitted", entity: "CLM-8832", actor: "Sarah Mitchell", time: "12m ago", type: "info" },
  { action: "Provider credential expiring", entity: "Marcus Webb", actor: "System", time: "28m ago", type: "warning" },
  { action: "Booking confirmed", entity: "BKG-1021", actor: "Maria Santos", time: "45m ago", type: "success" },
  { action: "Incident reported", entity: "BKG-1018", actor: "Linda Hayes", time: "1h ago", type: "error" },
];

const statusColors: Record<string, string> = {
  "Pending Match": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  "Matching": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "Matched": "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400",
  "Booked": "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  "Completed": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  "In Progress": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "Confirmed": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const urgencyColors: Record<string, string> = {
  "Emergency": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  "Priority": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "Routine": "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

export default function Dashboard() {
  const [wizardOpen, setWizardOpen] = useState(false);

  return (
    <div className="p-6 space-y-6">
      {/* Request Wizard */}
      <RequestWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onComplete={() => setWizardOpen(false)}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Operations Console</h1>
          <p className="text-sm text-muted-foreground">Harbour Care Services · May 2, 2026</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" data-testid="btn-new-request" onClick={() => setWizardOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> New Request
          </Button>
          <Link href="/participants" data-testid="btn-add-participant">
            <Button size="sm" variant="outline">
              <Users className="w-4 h-4 mr-1.5" /> Add Participant
            </Button>
          </Link>
          <Link href="/providers" data-testid="btn-add-provider">
            <Button size="sm">
              <Briefcase className="w-4 h-4 mr-1.5" /> Add Provider
            </Button>
          </Link>
        </div>
      </div>

      {/* AI Engine status banner */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg">
        <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400 flex-shrink-0" />
        <span className="text-sm text-violet-900 dark:text-violet-300">
          <span className="font-semibold">CareAffinity Engine</span> — Assisted mode · Confidence threshold 0.78 · 71% auto-approved today
        </span>
        <Link href="/matching" className="ml-auto text-xs text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-1 flex-shrink-0">
          Configure <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.label} className="border border-border" data-testid={`metric-${m.label.toLowerCase().replace(/\s+/g, "-")}`}>
              <CardContent className="p-4">
                <div className={`w-8 h-8 rounded-lg ${m.bg} flex items-center justify-center mb-2`}>
                  <Icon className={`w-4 h-4 ${m.color}`} />
                </div>
                <div className="text-2xl font-bold text-foreground">{m.value}</div>
                <div className="text-xs font-medium text-muted-foreground mt-0.5">{m.label}</div>
                <div className="text-xs text-muted-foreground/70 mt-0.5">{m.trend}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Recent Requests */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Recent Requests</CardTitle>
              <Link href="/requests" className="text-xs text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentRequests.map((r) => (
                <Link key={r.id} href={`/requests/${r.id}`} className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer" data-testid={`request-row-${r.id}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">{r.id}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${urgencyColors[r.urgency]}`}>{r.urgency}</span>
                    </div>
                    <div className="text-sm font-medium text-foreground truncate">{r.participant}</div>
                    <div className="text-xs text-muted-foreground">{r.service}</div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[r.status]}`}>{r.status}</span>
                    <div className="text-xs text-muted-foreground mt-1">{r.time}</div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Audit log */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Activity className="w-4 h-4" /> Activity Feed
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {auditLog.map((entry, i) => (
                <div key={i} className="px-4 py-3" data-testid={`audit-entry-${i}`}>
                  <div className="flex items-start gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                      entry.type === "success" ? "bg-emerald-500" :
                      entry.type === "warning" ? "bg-amber-500" :
                      entry.type === "error" ? "bg-red-500" : "bg-blue-500"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-foreground">{entry.action}</div>
                      <div className="text-xs text-muted-foreground">{entry.entity} · {entry.actor}</div>
                    </div>
                    <div className="text-[10px] text-muted-foreground/60 flex-shrink-0">{entry.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Active Bookings Today */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Active Bookings Today</CardTitle>
              <Link href="/bookings" className="text-xs text-primary hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {activeBookings.map((b) => (
                <div key={b.id} className="flex items-center gap-4 px-4 py-3" data-testid={`booking-row-${b.id}`}>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">{b.participant}</div>
                    <div className="text-xs text-muted-foreground">{b.provider} · {b.service}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />{b.time}
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[b.status]}`}>{b.status}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Plan Budget Utilisation */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Plan Budget Utilisation</CardTitle>
            <CardDescription className="text-xs">Across all active participants</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={budgetData} layout="vertical" margin={{ top: 0, right: 10, bottom: 0, left: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 10 }} width={80} stroke="hsl(var(--muted-foreground))" />
                <Tooltip formatter={(value: number) => [`$${value.toLocaleString()}`, ""]} contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="allocated" fill="hsl(var(--muted))" name="Allocated" radius={[0, 4, 4, 0]} />
                <Bar dataKey="spent" fill="hsl(var(--primary))" name="Spent" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-sm bg-muted" />Allocated
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <div className="w-2.5 h-2.5 rounded-sm bg-primary" />Spent
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking trend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Booking Volume Trend (6 months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={bookingTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="bookings" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
