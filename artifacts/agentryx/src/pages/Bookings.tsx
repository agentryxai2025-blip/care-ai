import { useState } from "react";
import { Calendar, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const bookings = [
  { id: "BKG-1021", participant: "Margaret Chen", provider: "Maria Santos", service: "Personal Care", date: "2 May 2026", time: "8:00–10:00 AM", price: 88.40, status: "In Progress", agreement: "SA-2021-089" },
  { id: "BKG-1022", participant: "David Okonkwo", provider: "James O'Brien", service: "Community Access", date: "2 May 2026", time: "10:00 AM–2:00 PM", price: 192.40, status: "In Progress", agreement: "SA-2022-012" },
  { id: "BKG-1023", participant: "Robert Kirby", provider: "Priya Sharma", service: "Therapy Support", date: "2 May 2026", time: "1:00–2:30 PM", price: 193.99, status: "Confirmed", agreement: "SA-2023-047" },
  { id: "BKG-1024", participant: "Yuki Tanaka", provider: "Carlos Mendez", service: "Domestic Assistance", date: "2 May 2026", time: "2:00–4:00 PM", price: 84.00, status: "Confirmed", agreement: "SA-2024-003" },
  { id: "BKG-1020", participant: "Tom Eriksen", provider: "Maria Santos", service: "Personal Care", date: "1 May 2026", time: "9:00–11:00 AM", price: 88.40, status: "Completed", agreement: "SA-2020-091" },
  { id: "BKG-1019", participant: "Linda Zhao", provider: "Wei Zhang", service: "Community Access", date: "1 May 2026", time: "10:00 AM–12:00 PM", price: 96.20, status: "Completed", agreement: "SA-2019-056" },
  { id: "BKG-1018", participant: "Sarah Williams", provider: "Priya Sharma", service: "Therapy Support", date: "1 May 2026", time: "2:00–3:30 PM", price: 193.99, status: "Cancelled", agreement: "SA-2018-002" },
  { id: "BKG-1017", participant: "James Patel", provider: "Carlos Mendez", service: "Domestic Assistance", date: "30 Apr 2026", time: "9:00–11:00 AM", price: 84.00, status: "Completed", agreement: "SA-2017-033" },
  { id: "BKG-1016", participant: "Aisha Nguyen", provider: "Fatima Al-Hassan", service: "Personal Care", date: "30 Apr 2026", time: "7:30–9:00 AM", price: 66.30, status: "Completed", agreement: "SA-2016-078" },
  { id: "BKG-1015", participant: "Carlos Rivera", provider: "Thomas Nkosi", service: "Behaviour Support", date: "30 Apr 2026", time: "3:00–5:00 PM", price: 214.41, status: "Completed", agreement: "SA-2015-019" },
  { id: "BKG-1014", participant: "Grace O'Sullivan", provider: "Emma Thornton", service: "Domestic Assistance", date: "29 Apr 2026", time: "10:00 AM–12:00 PM", price: 84.00, status: "Cancelled", agreement: "SA-2014-067" },
  { id: "BKG-1013", participant: "Ahmed Hassan", provider: "Fatima Al-Hassan", service: "Personal Care", date: "29 Apr 2026", time: "7:30–9:00 AM", price: 66.30, status: "Pending", agreement: null },
  { id: "BKG-1012", participant: "Margaret Chen", provider: "Maria Santos", service: "Personal Care", date: "29 Apr 2026", time: "8:00–10:00 AM", price: 88.40, status: "Completed", agreement: "SA-2012-089" },
  { id: "BKG-1011", participant: "Tom Eriksen", provider: "Maria Santos", service: "Personal Care", date: "28 Apr 2026", time: "9:00–11:00 AM", price: 88.40, status: "Completed", agreement: "SA-2011-091" },
  { id: "BKG-1010", participant: "David Okonkwo", provider: "Amara Diallo", service: "Social Support", date: "28 Apr 2026", time: "2:00–4:00 PM", price: 82.20, status: "Completed", agreement: "SA-2010-022" },
  { id: "BKG-1009", participant: "Robert Kirby", provider: "Thomas Nkosi", service: "Behaviour Support", date: "27 Apr 2026", time: "2:00–4:00 PM", price: 214.41, status: "Completed", agreement: "SA-2009-047" },
  { id: "BKG-1008", participant: "Yuki Tanaka", provider: "Sophie Laurent", service: "Personal Care", date: "27 Apr 2026", time: "8:00–9:00 AM", price: 44.20, status: "Completed", agreement: "SA-2008-003" },
  { id: "BKG-1007", participant: "Carlos Rivera", provider: "Isabella Cruz", service: "Community Access", date: "26 Apr 2026", time: "10:00 AM–12:00 PM", price: 96.20, status: "Completed", agreement: "SA-2007-019" },
];

const statusColors: Record<string, string> = {
  Pending: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  Confirmed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  "In Progress": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  Completed: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
  Cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function Bookings() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = bookings.filter((b) => {
    const matchSearch = b.participant.toLowerCase().includes(search.toLowerCase()) ||
      b.provider.toLowerCase().includes(search.toLowerCase()) ||
      b.id.includes(search);
    const matchStatus = statusFilter === "all" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const total = filtered.reduce((s, b) => s + b.price, 0);

  const statusCounts = ["In Progress", "Confirmed", "Pending", "Completed", "Cancelled"].map(s => ({
    status: s,
    count: bookings.filter(b => b.status === s).length,
  }));

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Bookings</h1>
          <p className="text-sm text-muted-foreground">{bookings.length} total · {bookings.filter(b => b.status === "In Progress").length} in progress today</p>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {statusCounts.map(({ status, count }) => (
          <Card key={status} className={`cursor-pointer ${statusFilter === status ? "ring-2 ring-primary" : ""}`} onClick={() => setStatusFilter(statusFilter === status ? "all" : status)}>
            <CardContent className="p-3">
              <div className="text-lg font-bold text-foreground">{count}</div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${statusColors[status]}`}>{status}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input data-testid="input-search-bookings" placeholder="Search bookings..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40" data-testid="filter-status"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Confirmed">Confirmed</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto text-sm text-muted-foreground">
          Total: <span className="font-semibold text-foreground">${total.toLocaleString("en-AU", { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Booking ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Participant</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Provider</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Service</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Date & Time</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Price</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Agreement</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-muted/30 transition-colors" data-testid={`booking-row-${b.id}`}>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{b.id}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{b.participant}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{b.provider}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{b.service}</td>
                  <td className="px-4 py-3">
                    <div className="text-xs font-medium text-foreground">{b.date}</div>
                    <div className="text-xs text-muted-foreground">{b.time}</div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-foreground">${b.price.toFixed(2)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{b.agreement || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[b.status]}`}>{b.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
