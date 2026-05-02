import { useState } from "react";
import { Link } from "wouter";
import { Search, LayoutGrid, List, Users, ChevronRight, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AddParticipantWizard from "@/components/AddParticipantWizard";

const participants = [
  { id: "P001", name: "Margaret Chen", ndis_number: "430218967", plan_type: "Plan-managed", support_coordinator: "Helen Marsh", plan_budget_total: 68500, plan_budget_spent: 41200, status: "Active", preferences: { language: "English/Mandarin", gender_pref: "Female", accessibility_needs: "Wheelchair access" }, suburb: "Newtown", age: 52 },
  { id: "P002", name: "David Okonkwo", ndis_number: "512874321", plan_type: "NDIA-managed", support_coordinator: "Ryan Lee", plan_budget_total: 92000, plan_budget_spent: 38700, status: "Active", preferences: { language: "English", gender_pref: "No preference", accessibility_needs: "Hearing support" }, suburb: "Surry Hills", age: 34 },
  { id: "P003", name: "Sarah Williams", ndis_number: "678234109", plan_type: "Self-managed", support_coordinator: "Karen Booth", plan_budget_total: 45000, plan_budget_spent: 43100, status: "Review", preferences: { language: "English", gender_pref: "Female", accessibility_needs: "Low sensory" }, suburb: "Bondi", age: 28 },
  { id: "P004", name: "James Patel", ndis_number: "390567234", plan_type: "Plan-managed", support_coordinator: "Helen Marsh", plan_budget_total: 78000, plan_budget_spent: 22400, status: "Active", preferences: { language: "English/Hindi", gender_pref: "No preference", accessibility_needs: "None" }, suburb: "Parramatta", age: 41 },
  { id: "P005", name: "Aisha Nguyen", ndis_number: "456789012", plan_type: "NDIA-managed", support_coordinator: "Ryan Lee", plan_budget_total: 55000, plan_budget_spent: 31800, status: "Active", preferences: { language: "English/Vietnamese", gender_pref: "Female", accessibility_needs: "Allergy aware" }, suburb: "Cabramatta", age: 19 },
  { id: "P006", name: "Tom Eriksen", ndis_number: "789123456", plan_type: "Plan-managed", support_coordinator: "Lisa Nguyen", plan_budget_total: 110000, plan_budget_spent: 87300, status: "Active", preferences: { language: "English", gender_pref: "Male", accessibility_needs: "Hoist required" }, suburb: "Manly", age: 67 },
  { id: "P007", name: "Linda Zhao", ndis_number: "234567890", plan_type: "Self-managed", support_coordinator: "Karen Booth", plan_budget_total: 62000, plan_budget_spent: 18900, status: "Active", preferences: { language: "English/Cantonese", gender_pref: "Female", accessibility_needs: "Communication support" }, suburb: "Chatswood", age: 45 },
  { id: "P008", name: "Robert Kirby", ndis_number: "567890123", plan_type: "NDIA-managed", support_coordinator: "Helen Marsh", plan_budget_total: 83000, plan_budget_spent: 56200, status: "Active", preferences: { language: "English", gender_pref: "No preference", accessibility_needs: "Behavioural support" }, suburb: "Liverpool", age: 23 },
  { id: "P009", name: "Yuki Tanaka", ndis_number: "890123456", plan_type: "Plan-managed", support_coordinator: "Ryan Lee", plan_budget_total: 49000, plan_budget_spent: 29700, status: "Active", preferences: { language: "English/Japanese", gender_pref: "Female", accessibility_needs: "None" }, suburb: "Strathfield", age: 31 },
  { id: "P010", name: "Carlos Rivera", ndis_number: "123456789", plan_type: "NDIA-managed", support_coordinator: "Lisa Nguyen", plan_budget_total: 134000, plan_budget_spent: 71000, status: "Active", preferences: { language: "English/Spanish", gender_pref: "No preference", accessibility_needs: "Epilepsy aware" }, suburb: "Fairfield", age: 38 },
  { id: "P011", name: "Grace O'Sullivan", ndis_number: "345678901", plan_type: "Plan-managed", support_coordinator: "Karen Booth", plan_budget_total: 57000, plan_budget_spent: 44800, status: "Inactive", preferences: { language: "English", gender_pref: "Female", accessibility_needs: "Diabetes management" }, suburb: "Cronulla", age: 72 },
  { id: "P012", name: "Ahmed Hassan", ndis_number: "678901234", plan_type: "Self-managed", support_coordinator: "Helen Marsh", plan_budget_total: 88000, plan_budget_spent: 23500, status: "Active", preferences: { language: "English/Arabic", gender_pref: "Male", accessibility_needs: "Cultural considerations" }, suburb: "Auburn", age: 29 },
];

const statusColors: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  Inactive: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  Review: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
};

const planColors: Record<string, string> = {
  "Plan-managed": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "NDIA-managed": "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  "Self-managed": "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
};

export default function Participants() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [view, setView] = useState<"list" | "card">("list");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [list, setList] = useState(participants);

  const filtered = list.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.ndis_number.includes(search) || p.suburb.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    const matchPlan = planFilter === "all" || p.plan_type === planFilter;
    return matchSearch && matchStatus && matchPlan;
  });

  const utilizationPct = (p: typeof participants[0]) => Math.round((p.plan_budget_spent / p.plan_budget_total) * 100);

  const handleParticipantAdded = (p: any) => {
    setList(prev => [p, ...prev]);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Participants</h1>
          <p className="text-sm text-muted-foreground">{participants.length} registered · {participants.filter(p => p.status === "Active").length} active</p>
        </div>
        <Button size="sm" data-testid="btn-add-participant" onClick={() => setWizardOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" /> Add Participant
        </Button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-testid="input-search-participants"
            placeholder="Search by name, NDIS number, suburb..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36" data-testid="filter-status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
            <SelectItem value="Review">Review</SelectItem>
          </SelectContent>
        </Select>
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger className="w-40" data-testid="filter-plan-type">
            <SelectValue placeholder="Plan Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="NDIA-managed">NDIA-managed</SelectItem>
            <SelectItem value="Plan-managed">Plan-managed</SelectItem>
            <SelectItem value="Self-managed">Self-managed</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex border border-border rounded-md overflow-hidden">
          <button
            data-testid="view-list"
            onClick={() => setView("list")}
            className={`p-2 ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            data-testid="view-card"
            onClick={() => setView("card")}
            className={`p-2 ${view === "card" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {view === "list" ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Participant</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">NDIS No.</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Plan Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Coordinator</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Budget Utilisation</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => {
                  const pct = utilizationPct(p);
                  return (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors" data-testid={`participant-row-${p.id}`}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.suburb} · Age {p.age}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.ndis_number}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${planColors[p.plan_type]}`}>{p.plan_type}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{p.support_coordinator}</td>
                      <td className="px-4 py-3 min-w-32">
                        <div className="flex items-center gap-2">
                          <Progress value={pct} className="h-1.5 flex-1" />
                          <span className={`text-xs font-medium ${pct > 85 ? "text-red-600" : pct > 60 ? "text-amber-600" : "text-muted-foreground"}`}>{pct}%</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">${p.plan_budget_spent.toLocaleString()} / ${p.plan_budget_total.toLocaleString()}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[p.status]}`}>{p.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/participants/${p.id}`} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors inline-flex">
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const pct = utilizationPct(p);
            return (
              <Link key={p.id} href={`/participants/${p.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer" data-testid={`participant-card-${p.id}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-semibold text-foreground">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.suburb} · Age {p.age}</div>
                        <div className="text-xs font-mono text-muted-foreground/70 mt-0.5">{p.ndis_number}</div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[p.status]}`}>{p.status}</span>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${planColors[p.plan_type]}`}>{p.plan_type}</span>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Budget</span>
                        <span className={pct > 85 ? "text-red-600 font-medium" : ""}>{pct}%</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                      <div className="text-[10px] text-muted-foreground mt-1">${p.plan_budget_spent.toLocaleString()} of ${p.plan_budget_total.toLocaleString()}</div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                      <span className="font-medium">Coordinator:</span> {p.support_coordinator}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No participants found</p>
        </div>
      )}

      <AddParticipantWizard
        open={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onComplete={handleParticipantAdded}
      />
    </div>
  );
}
