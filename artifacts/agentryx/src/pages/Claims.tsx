import { useState } from "react";
import { Search, CreditCard, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const claims = [
  { id: "CLM-8840", booking: "BKG-1020", participant: "Tom Eriksen", provider: "Maria Santos", amount: 88.40, category: "Core Supports", line_item: "01_011_0107_1_1", status: "Submitted", submitted: "2 May 2026", price_cap: "Pass", plan_balance: "Pass" },
  { id: "CLM-8839", booking: "BKG-1019", participant: "Linda Zhao", provider: "Wei Zhang", amount: 96.20, category: "Core Supports", line_item: "04_104_0125_6_1", status: "Accepted", submitted: "2 May 2026", price_cap: "Pass", plan_balance: "Pass" },
  { id: "CLM-8838", booking: "BKG-1017", participant: "James Patel", provider: "Carlos Mendez", amount: 84.00, category: "Core Supports", line_item: "01_020_0107_1_1", status: "Settled", submitted: "1 May 2026", price_cap: "Pass", plan_balance: "Pass" },
  { id: "CLM-8837", booking: "BKG-1016", participant: "Aisha Nguyen", provider: "Fatima Al-Hassan", amount: 66.30, category: "Core Supports", line_item: "01_011_0107_1_1", status: "Settled", submitted: "1 May 2026", price_cap: "Pass", plan_balance: "Pass" },
  { id: "CLM-8836", booking: "BKG-1015", participant: "Carlos Rivera", provider: "Thomas Nkosi", amount: 214.41, category: "Capacity Building", line_item: "07_004_0106_6_3", status: "Accepted", submitted: "30 Apr 2026", price_cap: "Pass", plan_balance: "Pass" },
  { id: "CLM-8835", booking: "BKG-1012", participant: "Margaret Chen", provider: "Maria Santos", amount: 88.40, category: "Core Supports", line_item: "01_011_0107_1_1", status: "Submitted", submitted: "30 Apr 2026", price_cap: "Pass", plan_balance: "Pass" },
  { id: "CLM-8834", booking: "BKG-1011", participant: "Tom Eriksen", provider: "Maria Santos", amount: 88.40, category: "Core Supports", line_item: "01_011_0107_1_1", status: "Settled", submitted: "29 Apr 2026", price_cap: "Pass", plan_balance: "Pass" },
  { id: "CLM-8833", booking: "BKG-1010", participant: "David Okonkwo", provider: "Amara Diallo", amount: 82.20, category: "Core Supports", line_item: "04_104_0125_6_1", status: "Rejected", submitted: "28 Apr 2026", price_cap: "Pass", plan_balance: "Fail" },
  { id: "CLM-8832", booking: "BKG-1009", participant: "Robert Kirby", provider: "Thomas Nkosi", amount: 214.41, category: "Capacity Building", line_item: "07_004_0106_6_3", status: "Settled", submitted: "28 Apr 2026", price_cap: "Pass", plan_balance: "Pass" },
  { id: "CLM-8831", booking: "BKG-1008", participant: "Yuki Tanaka", provider: "Sophie Laurent", amount: 44.20, category: "Core Supports", line_item: "01_011_0107_1_1", status: "Drafted", submitted: null, price_cap: "Pass", plan_balance: "Pass" },
  { id: "CLM-8830", booking: "BKG-1007", participant: "Carlos Rivera", provider: "Isabella Cruz", amount: 96.20, category: "Core Supports", line_item: "04_104_0125_6_1", status: "Settled", submitted: "26 Apr 2026", price_cap: "Pass", plan_balance: "Pass" },
  { id: "CLM-8829", booking: "BKG-1006", participant: "Grace O'Sullivan", provider: "Emma Thornton", amount: 84.00, category: "Core Supports", line_item: "01_020_0107_1_1", status: "Submitted", submitted: "25 Apr 2026", price_cap: "Fail", plan_balance: "Pass" },
  { id: "CLM-8828", booking: "BKG-1005", participant: "Ahmed Hassan", provider: "Fatima Al-Hassan", amount: 66.30, category: "Core Supports", line_item: "01_011_0107_1_1", status: "Drafted", submitted: null, price_cap: "Pass", plan_balance: "Pass" },
  { id: "CLM-8827", booking: "BKG-1004", participant: "Margaret Chen", provider: "Priya Sharma", amount: 193.99, category: "Capacity Building", line_item: "07_004_0106_6_3", status: "Settled", submitted: "24 Apr 2026", price_cap: "Pass", plan_balance: "Pass" },
  { id: "CLM-8826", booking: "BKG-1003", participant: "David Okonkwo", provider: "James O'Brien", amount: 192.40, category: "Core Supports", line_item: "04_104_0125_6_1", status: "Accepted", submitted: "23 Apr 2026", price_cap: "Pass", plan_balance: "Pass" },
];

const statusColors: Record<string, string> = {
  Drafted: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  Submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  Accepted: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  Rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  Settled: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400",
};

const checkIcon = (val: string) => val === "Pass"
  ? <span className="text-emerald-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Pass</span>
  : <span className="text-red-600 flex items-center gap-1"><XCircle className="w-3 h-3" />Fail</span>;

export default function Claims() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = claims.filter((c) => {
    const matchSearch = c.participant.toLowerCase().includes(search.toLowerCase()) ||
      c.id.includes(search) || c.booking.includes(search);
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalValue = filtered.reduce((s, c) => s + c.amount, 0);
  const selectedClaim = selected ? claims.find(c => c.id === selected) : null;

  const summaryStats = [
    { label: "Total Value", value: `$${claims.reduce((s,c)=>s+c.amount,0).toFixed(2)}`, color: "text-foreground" },
    { label: "Settled", value: claims.filter(c=>c.status==="Settled").length, color: "text-violet-600" },
    { label: "Pending", value: claims.filter(c=>["Drafted","Submitted","Accepted"].includes(c.status)).length, color: "text-blue-600" },
    { label: "Rejected", value: claims.filter(c=>c.status==="Rejected").length, color: "text-red-600" },
  ];

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Claims</h1>
          <p className="text-sm text-muted-foreground">{claims.length} claims · ${claims.reduce((s,c)=>s+c.amount,0).toLocaleString("en-AU",{minimumFractionDigits:2})} total value</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {summaryStats.map(s => (
          <Card key={s.label}>
            <CardContent className="p-3">
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input data-testid="input-search-claims" placeholder="Search claims..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36" data-testid="filter-status"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Drafted">Drafted</SelectItem>
            <SelectItem value="Submitted">Submitted</SelectItem>
            <SelectItem value="Accepted">Accepted</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
            <SelectItem value="Settled">Settled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Claim ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Booking</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Participant</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Provider</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Category</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Price Cap</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Budget</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className={`hover:bg-muted/30 transition-colors cursor-pointer ${selected === c.id ? "bg-primary/5" : ""}`}
                  onClick={() => setSelected(selected === c.id ? null : c.id)}
                  data-testid={`claim-row-${c.id}`}
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.id}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.booking}</td>
                  <td className="px-4 py-3 font-medium text-foreground text-xs">{c.participant}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{c.provider}</td>
                  <td className="px-4 py-3 font-semibold text-foreground">${c.amount.toFixed(2)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{c.category}</td>
                  <td className="px-4 py-3 text-xs">{checkIcon(c.price_cap)}</td>
                  <td className="px-4 py-3 text-xs">{checkIcon(c.plan_balance)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[c.status]}`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{c.submitted || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {selectedClaim && (
          <div className="px-4 py-3 bg-muted/30 border-t border-border">
            <div className="text-xs font-semibold text-muted-foreground mb-2">Claim Detail — {selectedClaim.id}</div>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div><span className="text-muted-foreground">Line Item Code:</span> <span className="font-mono font-medium text-foreground">{selectedClaim.line_item}</span></div>
              <div><span className="text-muted-foreground">Support Category:</span> <span className="font-medium text-foreground">{selectedClaim.category}</span></div>
              <div><span className="text-muted-foreground">Amount:</span> <span className="font-bold text-foreground">${selectedClaim.amount.toFixed(2)}</span></div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
