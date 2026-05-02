import { useParams, Link } from "wouter";
import { ArrowLeft, MapPin, Clock, Calendar, Cpu, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const mockRequest = {
  id: "REQ-2847",
  participant: "Margaret Chen",
  participant_id: "P001",
  ndis_number: "430218967",
  service: "Personal Care",
  urgency: "Priority",
  location: "Newtown NSW 2042",
  schedule: "Daily 8:00–10:00 AM",
  notes: "Participant requires manual handling support. Prefers female worker. Wheelchair accessible home.",
  status: "Matching",
  created: "2 May 2026 09:14 AM",
  raised_by: "Helen Marsh",
  plan_balance_ok: true,
  eligibility_ok: true,
  matches: [
    { rank: 1, provider: "Maria Santos", score: 92, confidence: 0.91, distance: "3.2 km", rating: 4.9, bookings: 47, available: true, response_time: "18 min", rationale: "3.2 km from participant, available within 2 hours, 4.9★ from 47 bookings, 12 successful sessions with similar participants, has Mental Health First Aid certification, female (matches participant preference)." },
    { rank: 2, provider: "Fatima Al-Hassan", score: 85, confidence: 0.82, distance: "5.1 km", rating: 4.9, bookings: 121, available: true, response_time: "10 min", rationale: "5.1 km from participant, highly reliable (98%), 4.9★ from 121 bookings, cultural and language match, complex care experience." },
    { rank: 3, provider: "Sophie Laurent", score: 76, confidence: 0.68, distance: "4.7 km", rating: 4.7, bookings: 38, available: true, response_time: "28 min", rationale: "4.7 km from participant, available in schedule window, 4.7★ rating, certified in manual handling, female worker." },
  ],
  timeline: [
    { event: "Request created", time: "9:14 AM", actor: "Helen Marsh", type: "info" },
    { event: "Plan balance validated", time: "9:14 AM", actor: "System", type: "success" },
    { event: "Eligibility confirmed", time: "9:14 AM", actor: "System", type: "success" },
    { event: "Matching engine started", time: "9:15 AM", actor: "AI Engine", type: "info" },
    { event: "3 candidates identified", time: "9:15 AM", actor: "AI Engine", type: "success" },
  ],
};

const urgencyColors: Record<string, string> = {
  Emergency: "bg-red-100 text-red-700",
  Priority: "bg-amber-100 text-amber-700",
  Routine: "bg-slate-100 text-slate-600",
};

const statusColors: Record<string, string> = {
  Matching: "bg-blue-100 text-blue-800",
  "Pending Match": "bg-amber-100 text-amber-800",
  Matched: "bg-violet-100 text-violet-800",
  Booked: "bg-indigo-100 text-indigo-800",
};

export default function RequestDetail() {
  const params = useParams<{ id: string }>();
  const r = mockRequest;
  const id = params.id || r.id;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/requests" className="p-1.5 rounded-md hover:bg-muted text-muted-foreground inline-flex" data-testid="btn-back"><ArrowLeft className="w-4 h-4" /></Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">{id}</h1>
          <p className="text-sm text-muted-foreground">{r.participant} · {r.service}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${urgencyColors[r.urgency]}`}>{r.urgency}</span>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[r.status]}`}>{r.status}</span>
          <Button size="sm" variant="outline" data-testid="btn-approve-match">Approve Match</Button>
        </div>
      </div>

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
            <div className="flex gap-3 pt-1">
              <div className={`flex items-center gap-1.5 text-xs ${r.plan_balance_ok ? "text-emerald-600" : "text-red-600"}`}>
                <CheckCircle className="w-3.5 h-3.5" /> Plan balance OK
              </div>
              <div className={`flex items-center gap-1.5 text-xs ${r.eligibility_ok ? "text-emerald-600" : "text-red-600"}`}>
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
              <div key={m.rank} className={`p-4 rounded-lg border ${m.rank === 1 ? "border-primary/40 bg-primary/5" : "border-border bg-card"}`} data-testid={`match-rank-${m.rank}`}>
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${m.rank === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    #{m.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-foreground">{m.provider}</span>
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
                    <Progress value={m.score} className="h-1.5 mb-2" />
                    <div className="text-xs text-muted-foreground mb-2 bg-muted/30 p-2 rounded italic">
                      "{m.rationale}"
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{m.distance}</span>
                      <span>★ {m.rating}</span>
                      <span>{m.bookings} bookings</span>
                      <span>{m.response_time} avg response</span>
                    </div>
                  </div>
                  {m.rank === 1 && (
                    <Button size="sm" className="flex-shrink-0" data-testid="btn-book-top-match">Book</Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Event Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative pl-4 space-y-4">
            <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />
            {r.timeline.map((t, i) => (
              <div key={i} className="relative pl-4" data-testid={`timeline-event-${i}`}>
                <div className={`absolute -left-2 w-3 h-3 rounded-full border-2 border-background ${t.type === "success" ? "bg-emerald-500" : t.type === "error" ? "bg-red-500" : "bg-blue-500"}`} />
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">{t.event}</span>
                  <span className="text-xs text-muted-foreground">· {t.actor}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{t.time}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
