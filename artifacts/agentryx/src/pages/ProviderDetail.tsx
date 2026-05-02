import { useParams, Link } from "wouter";
import { ArrowLeft, Star, ShieldCheck, Calendar, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

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
    id: "PR001", name: "Maria Santos", tier: "Advanced",
    skills: ["Personal Care", "Manual Handling", "Mental Health First Aid", "Dementia Care"],
    rating: 4.9, reliability: 97, screening: "Current",
    screening_expiry: "14 Jun 2027", availability: "Available",
    suburb: "Newtown", total_bookings: 347, response_time: "18 min",
    ndis_reg: "4050123456", reg_tier: "Advanced",
    supports: ["Daily Living Activities", "High Intensity Daily Activities"],
    certifications: ["Certificate III Individual Support", "Mental Health First Aid", "Manual Handling", "First Aid (HLTAID011)"],
    completion_rate: 99, on_time_rate: 97, repeat_rate: 78,
    bookings: [
      { id: "BKG-1021", participant: "Margaret Chen", service: "Personal Care", date: "2 May 2026", status: "In Progress" },
      { id: "BKG-0998", participant: "Linda Zhao", service: "Personal Care", date: "29 Apr 2026", status: "Completed" },
      { id: "BKG-0971", participant: "Tom Eriksen", service: "Personal Care", date: "22 Apr 2026", status: "Completed" },
    ]
  },
};

const fallback = {
  id: "PR002", name: "James O'Brien", tier: "General",
  skills: ["Community Access", "Transport", "Social Support"],
  rating: 4.7, reliability: 93, screening: "Current",
  screening_expiry: "3 Feb 2026", availability: "Busy",
  suburb: "Surry Hills", total_bookings: 218, response_time: "32 min",
  ndis_reg: "4050234567", reg_tier: "General",
  supports: ["Assistance with Social, Economic and Community Participation"],
  certifications: ["Certificate III Individual Support", "Working with Children Check", "First Aid"],
  completion_rate: 96, on_time_rate: 92, repeat_rate: 61,
  bookings: [
    { id: "BKG-1022", participant: "David Okonkwo", service: "Community Access", date: "2 May 2026", status: "In Progress" },
    { id: "BKG-0990", participant: "James Patel", service: "Community Access", date: "28 Apr 2026", status: "Completed" },
  ]
};

const tierColors: Record<string, string> = {
  Advanced: "bg-violet-100 text-violet-800",
  General: "bg-blue-100 text-blue-800",
  Basic: "bg-slate-100 text-slate-700",
  Enrolled: "bg-teal-100 text-teal-700",
};

const screeningColors: Record<string, string> = {
  Current: "bg-emerald-100 text-emerald-800",
  Expiring: "bg-amber-100 text-amber-800",
  Expired: "bg-red-100 text-red-800",
};

const statusColors: Record<string, string> = {
  "In Progress": "bg-blue-100 text-blue-800",
  Completed: "bg-emerald-100 text-emerald-800",
};

export default function ProviderDetail() {
  const params = useParams<{ id: string }>();
  const p = providerData[params.id || ""] || fallback;
  const avail = availability[params.id || ""] || defaultAvail;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/providers" className="p-1.5 rounded-md hover:bg-muted text-muted-foreground inline-flex" data-testid="btn-back"><ArrowLeft className="w-4 h-4" /></Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">{p.name}</h1>
          <p className="text-sm text-muted-foreground">{p.suburb} · NDIS Reg: {p.ndis_reg}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <span className={`text-xs px-2.5 py-1 rounded font-medium ${tierColors[p.tier]}`}>{p.tier}</span>
          <Button size="sm" variant="outline" data-testid="btn-book-provider">Book Provider</Button>
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
                <div className="text-xs text-muted-foreground mt-0.5">{p.total_bookings} bookings</div>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: "Completion Rate", value: p.completion_rate },
                { label: "Reliability Score", value: p.reliability },
                { label: "On-time Arrival", value: p.on_time_rate },
                { label: "Repeat Bookings", value: p.repeat_rate },
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
              Avg response: <span className="font-medium text-foreground">{p.response_time}</span>
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
              <div className="text-[10px] uppercase font-semibold text-muted-foreground mb-2">Worker Screening</div>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${screeningColors[p.screening]}`}>{p.screening}</span>
                <span className="text-xs text-muted-foreground">Expires {p.screening_expiry}</span>
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold text-muted-foreground mb-2">Supports Approved</div>
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

        {/* Availability */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2"><Calendar className="w-4 h-4" />Weekly Availability</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {p.bookings.map((b: any) => (
              <div key={b.id} className="flex items-center gap-4 px-4 py-3" data-testid={`booking-row-${b.id}`}>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">{b.participant}</div>
                  <div className="text-xs text-muted-foreground">{b.service} · {b.date}</div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[b.status]}`}>{b.status}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
