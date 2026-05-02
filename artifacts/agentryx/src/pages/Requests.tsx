import { useState } from "react";
import { Link } from "wouter";
import { Search, FileText, List, LayoutGrid, ChevronRight, Plus, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import RequestWizard from "@/components/RequestWizard";

const baseRequests = [
  { id: "REQ-2847", participant: "Margaret Chen", service: "Personal Care", urgency: "Priority", location: "Newtown NSW 2042", schedule: "Daily 8-10am", status: "Matching", created: "2 May 2026", provider: null, isNew: false },
  { id: "REQ-2846", participant: "David Okonkwo", service: "Community Access", urgency: "Routine", location: "Surry Hills NSW 2010", schedule: "Wed 10am-2pm", status: "Booked", created: "1 May 2026", provider: "James O'Brien", isNew: false },
  { id: "REQ-2845", participant: "Sarah Williams", service: "Therapy Support", urgency: "Emergency", location: "Bondi NSW 2026", schedule: "ASAP", status: "Pending Match", created: "1 May 2026", provider: null, isNew: false },
  { id: "REQ-2844", participant: "James Patel", service: "Domestic Assistance", urgency: "Routine", location: "Parramatta NSW 2150", schedule: "Fortnightly Sat 9am", status: "Completed", created: "30 Apr 2026", provider: "Carlos Mendez", isNew: false },
  { id: "REQ-2843", participant: "Aisha Nguyen", service: "Personal Care", urgency: "Priority", location: "Cabramatta NSW 2166", schedule: "Daily 7-8:30am", status: "Matched", created: "30 Apr 2026", provider: "Fatima Al-Hassan", isNew: false },
  { id: "REQ-2842", participant: "Tom Eriksen", service: "Personal Care", urgency: "Routine", location: "Manly NSW 2095", schedule: "Mon/Wed/Fri 9-11am", status: "Booked", created: "29 Apr 2026", provider: "Maria Santos", isNew: false },
  { id: "REQ-2841", participant: "Linda Zhao", service: "Community Access", urgency: "Routine", location: "Chatswood NSW 2067", schedule: "Thu 1-4pm", status: "Completed", created: "29 Apr 2026", provider: "Wei Zhang", isNew: false },
  { id: "REQ-2840", participant: "Robert Kirby", service: "Behaviour Support", urgency: "Priority", location: "Liverpool NSW 2170", schedule: "Weekly Tue 2-4pm", status: "Booked", created: "28 Apr 2026", provider: "Thomas Nkosi", isNew: false },
  { id: "REQ-2839", participant: "Yuki Tanaka", service: "Personal Care", urgency: "Routine", location: "Strathfield NSW 2135", schedule: "Daily 8-9am", status: "Completed", created: "28 Apr 2026", provider: "Sophie Laurent", isNew: false },
  { id: "REQ-2838", participant: "Carlos Rivera", service: "Community Access", urgency: "Routine", location: "Fairfield NSW 2165", schedule: "Fortnightly Fri 10am-12pm", status: "Booked", created: "27 Apr 2026", provider: "Isabella Cruz", isNew: false },
  { id: "REQ-2837", participant: "Grace O'Sullivan", service: "Domestic Assistance", urgency: "Routine", location: "Cronulla NSW 2230", schedule: "Weekly Mon 10am-12pm", status: "Cancelled", created: "27 Apr 2026", provider: null, isNew: false },
  { id: "REQ-2836", participant: "Ahmed Hassan", service: "Personal Care", urgency: "Priority", location: "Auburn NSW 2144", schedule: "Daily 7:30-9am", status: "Intake", created: "26 Apr 2026", provider: null, isNew: false },
  { id: "REQ-2835", participant: "Margaret Chen", service: "Therapy Support", urgency: "Routine", location: "Newtown NSW 2042", schedule: "Fortnightly Thu 11am-1pm", status: "Completed", created: "25 Apr 2026", provider: "Priya Sharma", isNew: false },
  { id: "REQ-2834", participant: "David Okonkwo", service: "Social Support", urgency: "Routine", location: "Surry Hills NSW 2010", schedule: "Weekly Fri 2-4pm", status: "Booked", created: "24 Apr 2026", provider: "Amara Diallo", isNew: false },
  { id: "REQ-2833", participant: "James Patel", service: "Community Access", urgency: "Routine", location: "Parramatta NSW 2150", schedule: "Monthly 1st Sat 9am-1pm", status: "Completed", created: "23 Apr 2026", provider: "James O'Brien", isNew: false },
  { id: "REQ-2832", participant: "Aisha Nguyen", service: "Therapy Support", urgency: "Priority", location: "Cabramatta NSW 2166", schedule: "Weekly Wed 10am-12pm", status: "Completed", created: "22 Apr 2026", provider: "Priya Sharma", isNew: false },
  { id: "REQ-2831", participant: "Tom Eriksen", service: "Personal Care", urgency: "Routine", location: "Manly NSW 2095", schedule: "Daily 9-11am", status: "Completed", created: "21 Apr 2026", provider: "Maria Santos", isNew: false },
  { id: "REQ-2830", participant: "Robert Kirby", service: "Domestic Assistance", urgency: "Routine", location: "Liverpool NSW 2170", schedule: "Weekly Sat 9-11am", status: "Validated", created: "20 Apr 2026", provider: null, isNew: false },
  { id: "REQ-2829", participant: "Linda Zhao", service: "Personal Care", urgency: "Emergency", location: "Chatswood NSW 2067", schedule: "ASAP", status: "Completed", created: "19 Apr 2026", provider: "Wei Zhang", isNew: false },
  { id: "REQ-2828", participant: "Carlos Rivera", service: "Behaviour Support", urgency: "Priority", location: "Fairfield NSW 2165", schedule: "Weekly Tue/Thu 3-5pm", status: "Booked", created: "18 Apr 2026", provider: "Thomas Nkosi", isNew: false },
];

const statusOrder = ["Intake", "Validated", "Pending Match", "Matching", "Matched", "Booked", "Completed", "Cancelled"];

const statusColors: Record<string, string> = {
  Intake: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  Validated: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  "Pending Match": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  Matching: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  Matched: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400",
  Booked: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  Completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  Cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const urgencyColors: Record<string, string> = {
  Emergency: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Priority: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Routine: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

const pipelineStatuses = ["Intake", "Validated", "Pending Match", "Matching", "Matched", "Booked"];

export default function Requests() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [view, setView] = useState<"list" | "kanban">("list");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [requests, setRequests] = useState(baseRequests);

  const handleWizardComplete = (requestId: string, data: any) => {
    const newRequest = {
      id: requestId,
      participant: data.participantObj?.name || "Unknown",
      service: data.service,
      urgency: data.priority,
      location: `${data.location}, NSW`,
      schedule: `${data.frequency} · ${data.duration}`,
      status: "Booked",
      created: "2 May 2026",
      provider: data.selectedProvider?.name || null,
      isNew: true,
    };
    setRequests(prev => [newRequest, ...prev]);
    setWizardOpen(false);
  };

  const filtered = requests.filter((r) => {
    const matchSearch = r.participant.toLowerCase().includes(search.toLowerCase()) ||
      r.id.includes(search) || r.service.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchUrgency = urgencyFilter === "all" || r.urgency === urgencyFilter;
    return matchSearch && matchStatus && matchUrgency;
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Service Requests</h1>
          <p className="text-sm text-muted-foreground">{requests.length} total · {requests.filter(r => ["Intake","Validated","Pending Match","Matching"].includes(r.status)).length} active</p>
        </div>
        <Button size="sm" data-testid="btn-new-request" onClick={() => setWizardOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> New Request
        </Button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input data-testid="input-search-requests" placeholder="Search requests..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40" data-testid="filter-status"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statusOrder.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
          <SelectTrigger className="w-36" data-testid="filter-urgency"><SelectValue placeholder="Urgency" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Urgencies</SelectItem>
            <SelectItem value="Emergency">Emergency</SelectItem>
            <SelectItem value="Priority">Priority</SelectItem>
            <SelectItem value="Routine">Routine</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex border border-border rounded-md overflow-hidden">
          <button onClick={() => setView("list")} className={`p-2 ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`} data-testid="view-list"><List className="w-4 h-4" /></button>
          <button onClick={() => setView("kanban")} className={`p-2 ${view === "kanban" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`} data-testid="view-kanban"><LayoutGrid className="w-4 h-4" /></button>
        </div>
      </div>

      {view === "list" ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">ID</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Participant</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Service</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Urgency</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Location</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Provider</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Created</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      className={`hover:bg-muted/30 transition-colors ${r.isNew ? "animate-pulse-once bg-primary/5" : ""}`}
                      data-testid={`request-row-${r.id}`}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          {r.id}
                          {r.isNew && (
                            <span className="text-[9px] px-1 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded font-semibold flex items-center gap-0.5">
                              <Sparkles className="w-2 h-2" />NEW
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">{r.participant}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{r.service}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${urgencyColors[r.urgency]}`}>{r.urgency}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{r.location}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{r.provider || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[r.status]}`}>{r.status}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{r.created}</td>
                      <td className="px-4 py-3">
                        <Link href={`/requests/${r.id}`} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors inline-flex"><ChevronRight className="w-4 h-4" /></Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-3 min-w-max">
            {pipelineStatuses.map((status) => {
              const items = filtered.filter(r => r.status === status);
              return (
                <div key={status} className="w-64 flex-shrink-0">
                  <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${statusColors[status]}`}>{status}</span>
                      <span className="text-xs text-muted-foreground">{items.length}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {items.map((r) => (
                      <Link key={r.id} href={`/requests/${r.id}`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer" data-testid={`kanban-card-${r.id}`}>
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] font-mono text-muted-foreground">{r.id}</span>
                              <span className={`text-[10px] px-1 py-0.5 rounded font-medium ${urgencyColors[r.urgency]}`}>{r.urgency}</span>
                            </div>
                            <div className="text-sm font-medium text-foreground">{r.participant}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">{r.service}</div>
                            <div className="text-xs text-muted-foreground mt-1">{r.schedule}</div>
                            {r.isNew && <span className="inline-flex items-center gap-0.5 text-[9px] px-1 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded font-semibold mt-1"><Sparkles className="w-2 h-2" />NEW</span>}
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                    {items.length === 0 && (
                      <div className="text-center py-6 text-xs text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border">
                        No requests
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <RequestWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onComplete={handleWizardComplete}
      />
    </div>
  );
}
