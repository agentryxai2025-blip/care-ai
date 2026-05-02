import { useState } from "react";
import { Link } from "wouter";
import { Search, Briefcase, Star, ChevronRight, LayoutGrid, List } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

const providers = [
  { id: "PR001", name: "Maria Santos", tier: "Advanced", skills: ["Personal Care", "Manual Handling", "Mental Health First Aid"], rating: 4.9, reliability: 97, screening: "Current", availability: "Available", suburb: "Newtown", total_bookings: 347, response_time: "18 min" },
  { id: "PR002", name: "James O'Brien", tier: "General", skills: ["Community Access", "Transport", "Social Support"], rating: 4.7, reliability: 93, screening: "Current", availability: "Busy", suburb: "Surry Hills", total_bookings: 218, response_time: "32 min" },
  { id: "PR003", name: "Priya Sharma", tier: "Advanced", skills: ["Therapy Support", "Occupational Therapy", "Behaviour Support"], rating: 4.8, reliability: 96, screening: "Current", availability: "Available", suburb: "Parramatta", total_bookings: 412, response_time: "12 min" },
  { id: "PR004", name: "Carlos Mendez", tier: "General", skills: ["Domestic Assistance", "Meal Preparation", "Gardening"], rating: 4.6, reliability: 89, screening: "Current", availability: "Available", suburb: "Liverpool", total_bookings: 156, response_time: "45 min" },
  { id: "PR005", name: "Emma Thornton", tier: "Basic", skills: ["Personal Care", "Domestic Assistance"], rating: 4.3, reliability: 85, screening: "Expiring", availability: "Available", suburb: "Bondi", total_bookings: 84, response_time: "55 min" },
  { id: "PR006", name: "Wei Zhang", tier: "Advanced", skills: ["Personal Care", "Community Access", "CALD Support", "Mandarin"], rating: 4.8, reliability: 95, screening: "Current", availability: "Available", suburb: "Chatswood", total_bookings: 289, response_time: "22 min" },
  { id: "PR007", name: "Amara Diallo", tier: "General", skills: ["Community Access", "Social Support", "Cultural Support"], rating: 4.5, reliability: 91, screening: "Current", availability: "On Leave", suburb: "Fairfield", total_bookings: 173, response_time: "38 min" },
  { id: "PR008", name: "Nathan Clarke", tier: "General", skills: ["Domestic Assistance", "Transport", "Home Maintenance"], rating: 4.4, reliability: 88, screening: "Current", availability: "Available", suburb: "Manly", total_bookings: 201, response_time: "41 min" },
  { id: "PR009", name: "Fatima Al-Hassan", tier: "Advanced", skills: ["Personal Care", "Nursing", "Complex Care", "Arabic"], rating: 4.9, reliability: 98, screening: "Current", availability: "Available", suburb: "Auburn", total_bookings: 521, response_time: "10 min" },
  { id: "PR010", name: "Daniel Kim", tier: "Basic", skills: ["Community Access", "Social Support"], rating: 4.2, reliability: 82, screening: "Expired", availability: "Busy", suburb: "Strathfield", total_bookings: 67, response_time: "60 min" },
  { id: "PR011", name: "Sophie Laurent", tier: "General", skills: ["Personal Care", "Therapy Support", "French"], rating: 4.7, reliability: 94, screening: "Current", availability: "Available", suburb: "Glebe", total_bookings: 138, response_time: "28 min" },
  { id: "PR012", name: "Thomas Nkosi", tier: "Advanced", skills: ["Behaviour Support", "Mental Health", "Complex Needs"], rating: 4.8, reliability: 96, screening: "Current", availability: "Available", suburb: "Blacktown", total_bookings: 267, response_time: "15 min" },
  { id: "PR013", name: "Isabella Cruz", tier: "General", skills: ["Domestic Assistance", "Personal Care", "Spanish"], rating: 4.5, reliability: 90, screening: "Current", availability: "Available", suburb: "Cabramatta", total_bookings: 195, response_time: "35 min" },
  { id: "PR014", name: "Marcus Webb", tier: "Basic", skills: ["Transport", "Community Access"], rating: 4.3, reliability: 83, screening: "Expiring", availability: "Available", suburb: "Penrith", total_bookings: 72, response_time: "50 min" },
  { id: "PR015", name: "Grace Okafor", tier: "Enrolled", skills: ["Social Support", "Companionship"], rating: 4.1, reliability: 79, screening: "Current", availability: "Available", suburb: "Campbelltown", total_bookings: 43, response_time: "70 min" },
];

const tierColors: Record<string, string> = {
  Advanced: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400",
  General: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  Basic: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  Enrolled: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
};

const screeningColors: Record<string, string> = {
  Current: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  Expiring: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  Expired: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const availColors: Record<string, string> = {
  Available: "text-emerald-600",
  Busy: "text-amber-600",
  "On Leave": "text-slate-500",
};

export default function Providers() {
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [availFilter, setAvailFilter] = useState("all");
  const [view, setView] = useState<"list" | "card">("list");

  const filtered = providers.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.suburb.toLowerCase().includes(search.toLowerCase()) ||
      p.skills.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchTier = tierFilter === "all" || p.tier === tierFilter;
    const matchAvail = availFilter === "all" || p.availability === availFilter;
    return matchSearch && matchTier && matchAvail;
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Providers</h1>
          <p className="text-sm text-muted-foreground">{providers.length} registered · {providers.filter(p => p.availability === "Available").length} available now</p>
        </div>
        <Button size="sm" data-testid="btn-add-provider">
          <Briefcase className="w-4 h-4 mr-1.5" /> Add Provider
        </Button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input data-testid="input-search-providers" placeholder="Search name, skills, suburb..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={tierFilter} onValueChange={setTierFilter}>
          <SelectTrigger className="w-36" data-testid="filter-tier"><SelectValue placeholder="Tier" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="Advanced">Advanced</SelectItem>
            <SelectItem value="General">General</SelectItem>
            <SelectItem value="Basic">Basic</SelectItem>
            <SelectItem value="Enrolled">Enrolled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={availFilter} onValueChange={setAvailFilter}>
          <SelectTrigger className="w-36" data-testid="filter-availability"><SelectValue placeholder="Availability" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="Busy">Busy</SelectItem>
            <SelectItem value="On Leave">On Leave</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex border border-border rounded-md overflow-hidden">
          <button onClick={() => setView("list")} className={`p-2 ${view === "list" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`} data-testid="view-list"><List className="w-4 h-4" /></button>
          <button onClick={() => setView("card")} className={`p-2 ${view === "card" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`} data-testid="view-card"><LayoutGrid className="w-4 h-4" /></button>
        </div>
      </div>

      {view === "list" ? (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Provider</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Tier</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Rating</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Reliability</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Screening</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Bookings</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors" data-testid={`provider-row-${p.id}`}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.suburb}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${tierColors[p.tier]}`}>{p.tier}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-semibold">{p.rating}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 min-w-24">
                      <div className="flex items-center gap-2">
                        <Progress value={p.reliability} className="h-1.5 w-16" />
                        <span className="text-xs">{p.reliability}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${screeningColors[p.screening]}`}>{p.screening}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${availColors[p.availability]}`}>{p.availability}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.total_bookings}</td>
                    <td className="px-4 py-3">
                      <Link href={`/providers/${p.id}`} className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors inline-flex"><ChevronRight className="w-4 h-4" /></Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <Link key={p.id} href={`/providers/${p.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer" data-testid={`provider-card-${p.id}`}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-semibold text-foreground">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.suburb}</div>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${tierColors[p.tier]}`}>{p.tier}</span>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="text-sm font-bold">{p.rating}</span>
                    </div>
                    <span className={`text-xs font-medium ${availColors[p.availability]}`}>{p.availability}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${screeningColors[p.screening]}`}>{p.screening}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {p.skills.slice(0, 3).map(s => (
                      <span key={s} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{s}</span>
                    ))}
                    {p.skills.length > 3 && <span className="text-[10px] text-muted-foreground">+{p.skills.length - 3}</span>}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{p.total_bookings} bookings</span>
                    <span>Avg {p.response_time} response</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
