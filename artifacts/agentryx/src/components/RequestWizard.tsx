import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronRight, ChevronLeft, Check, Cpu, Search, ShieldCheck,
  Calendar, DollarSign, Star, User, MapPin, Clock, Zap, Sparkles,
  CheckCircle2, AlertCircle, Loader2, Phone, Award, Activity
} from "lucide-react";
import { CareAffinityIcon } from "@/components/CareAffinityIcon";
import { AIBadge } from "@/components/AIBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const PARTICIPANTS = [
  { id: "P001", name: "Margaret Chen", ndis: "430812547", suburb: "Bondi", plan_budget: 85000 },
  { id: "P002", name: "David Okonkwo", ndis: "430218763", suburb: "Parramatta", plan_budget: 62000 },
  { id: "P003", name: "Sarah Williams", ndis: "430987234", suburb: "Chatswood", plan_budget: 120000 },
  { id: "P004", name: "James Patel", ndis: "430456789", suburb: "Blacktown", plan_budget: 45000 },
  { id: "P005", name: "Aisha Nguyen", ndis: "430123456", suburb: "Liverpool", plan_budget: 73000 },
  { id: "P006", name: "Tom Eriksen", ndis: "430654321", suburb: "Manly", plan_budget: 95000 },
];

const SERVICE_TYPES = [
  "Personal Care", "Community Access", "Domestic Assistance",
  "Therapy Support", "Behaviour Support", "Transport",
  "Social & Recreational", "Supported Independent Living",
];

const MATCHING_STAGES = [
  { id: 1, label: "Eligibility Check", icon: ShieldCheck, detail: "Verifying NDIS plan & budget", duration: 900 },
  { id: 2, label: "Skills Matching", icon: Award, detail: "Scanning provider qualifications", duration: 1100 },
  { id: 3, label: "Availability Sync", icon: Calendar, detail: "Checking real-time calendars", duration: 800 },
  { id: 4, label: "Preference Scoring", icon: Star, detail: "Applying participant preferences", duration: 950 },
  { id: 5, label: "Budget Verification", icon: DollarSign, detail: "Confirming plan funds", duration: 700 },
  { id: 6, label: "Final Ranking", icon: Cpu, detail: "Running confidence algorithm", duration: 1200 },
];

const MOCK_PROVIDERS: Record<string, any[]> = {
  "Personal Care": [
    { id: "PRV-001", name: "Maria Santos", agency: "CareConnect NSW", confidence: 96, rating: 4.9, bookings: 142, skills: ["Personal Care", "Medication Assist", "Manual Handling"], languages: ["English", "Tagalog"], suburb: "Bondi", availability: "Mon–Sat", rate: 65, reasons: ["95th percentile skill match", "No scheduling conflicts", "Language preference met", "Same suburb as participant"] },
    { id: "PRV-002", name: "James O'Brien", agency: "SupportFirst", confidence: 88, rating: 4.7, bookings: 98, skills: ["Personal Care", "Behaviour Support"], languages: ["English"], suburb: "Randwick", availability: "Tue–Sun", rate: 62, reasons: ["Strong skills alignment", "Consistent availability", "High participant satisfaction", "3km from participant"] },
    { id: "PRV-003", name: "Priya Sharma", agency: "Harmony Care", confidence: 81, rating: 4.6, bookings: 76, skills: ["Personal Care", "Community Access"], languages: ["English", "Hindi"], suburb: "Coogee", availability: "Mon–Fri", rate: 60, reasons: ["Good skill match", "Bilingual advantage", "Available for requested schedule"] },
  ],
  "Community Access": [
    { id: "PRV-004", name: "Carlos Mendez", agency: "OutReach NSW", confidence: 94, rating: 4.8, bookings: 115, skills: ["Community Access", "Transport", "Social Skills"], languages: ["English", "Spanish"], suburb: "Parramatta", availability: "Mon–Sun", rate: 58, reasons: ["Specialist community access", "Own vehicle", "Language match", "Perfect availability"] },
    { id: "PRV-005", name: "Helen Kowalski", agency: "CareConnect NSW", confidence: 87, rating: 4.7, bookings: 89, skills: ["Community Access", "Therapy Support"], languages: ["English", "Polish"], suburb: "Westmead", availability: "Mon–Sat", rate: 55, reasons: ["Strong community access record", "Multi-skilled", "Available on requested days"] },
    { id: "PRV-006", name: "Michael Tran", agency: "SupportFirst", confidence: 79, rating: 4.5, bookings: 61, skills: ["Community Access", "Domestic Assistance"], languages: ["English", "Vietnamese"], suburb: "Blacktown", availability: "Tue–Sat", rate: 53, reasons: ["Good fit for schedule", "Bilingual support", "Cost-effective option"] },
  ],
};

const getProviders = (serviceType: string) => {
  return MOCK_PROVIDERS[serviceType] || MOCK_PROVIDERS["Personal Care"];
};

const STEPS = ["Details", "Requirements", "CareAffinity", "Select Match", "Confirmation"];

interface FormData {
  participant: string;
  participantObj: any;
  service: string;
  priority: string;
  dateNeeded: string;
  frequency: string;
  duration: string;
  genderPref: string;
  language: string;
  location: string;
  notes: string;
  requirements: string[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  onComplete: (requestId: string, data: any) => void;
}

export default function RequestWizard({ open, onClose, onComplete }: Props) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({
    participant: "", participantObj: null,
    service: "", priority: "Routine",
    dateNeeded: "", frequency: "Weekly",
    duration: "2 hours", genderPref: "No preference",
    language: "English", location: "",
    notes: "", requirements: [],
  });

  const [matchingStage, setMatchingStage] = useState(0);
  const [matchingDone, setMatchingDone] = useState(false);
  const [providersAnalyzed, setProvidersAnalyzed] = useState(0);
  const [confidence, setConfidence] = useState(0);
  const [providers, setProviders] = useState<any[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [bookingId, setBookingId] = useState("");
  const matchingRef = useRef<any>(null);
  const counterRef = useRef<any>(null);
  const requestIdRef = useRef(`REQ-${2848 + Math.floor(Math.random() * 10)}`);
  const requestId = requestIdRef.current;

  const update = (key: keyof FormData, val: any) => setForm(f => ({ ...f, [key]: val }));

  const toggleReq = (r: string) => {
    setForm(f => ({
      ...f,
      requirements: f.requirements.includes(r) ? f.requirements.filter(x => x !== r) : [...f.requirements, r]
    }));
  };

  // Run matching simulation
  const runMatching = () => {
    setMatchingStage(0);
    setMatchingDone(false);
    setProvidersAnalyzed(0);
    setConfidence(0);

    let totalDelay = 0;
    MATCHING_STAGES.forEach((stage, i) => {
      totalDelay += stage.duration;
      matchingRef.current = setTimeout(() => {
        setMatchingStage(i + 1);
      }, totalDelay);
    });

    // Provider counter animation
    const totalTime = totalDelay;
    const totalProviders = 89;
    const interval = 80;
    let analyzed = 0;
    counterRef.current = setInterval(() => {
      analyzed = Math.min(analyzed + Math.ceil(Math.random() * 4), totalProviders);
      setProvidersAnalyzed(analyzed);
      const prog = analyzed / totalProviders;
      setConfidence(Math.round(prog * 96));
      if (analyzed >= totalProviders) clearInterval(counterRef.current);
    }, interval);

    // Complete
    setTimeout(() => {
      setMatchingDone(true);
      setProviders(getProviders(form.service));
      setConfidence(96);
    }, totalTime + 600);
  };

  const handleNext = () => {
    if (step === 2) {
      setStep(3);
      setTimeout(() => runMatching(), 400);
    } else if (step === 3 && matchingDone) {
      setStep(4);
    } else if (step === 4 && selectedProvider) {
      const bkgId = `BKG-${1025 + Math.floor(Math.random() * 50)}`;
      setBookingId(bkgId);
      setStep(5);
      setTimeout(() => {
        onComplete(requestId, { ...form, selectedProvider, bookingId: bkgId });
      }, 500);
    } else if (step < 2) {
      setStep(s => s + 1);
    }
  };

  const handleClose = () => {
    setStep(1);
    setMatchingStage(0);
    setMatchingDone(false);
    setSelectedProvider(null);
    setProviders([]);
    clearTimeout(matchingRef.current);
    clearInterval(counterRef.current);
    onClose();
  };

  const canNext = () => {
    if (step === 1) return form.participant && form.service && form.priority;
    if (step === 2) return true;
    if (step === 3) return matchingDone;
    if (step === 4) return !!selectedProvider;
    return false;
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        className="relative bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-foreground">New Support Request</h2>
            <p className="text-xs text-muted-foreground">{requestId} · {STEPS[step - 1]}</p>
          </div>
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step indicators */}
        <div className="flex items-center px-6 py-3 gap-1 flex-shrink-0 border-b border-border bg-muted/30">
          {STEPS.map((label, i) => {
            const n = i + 1;
            const done = step > n;
            const active = step === n;
            return (
              <div key={label} className="flex items-center gap-1">
                <div className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium transition-colors",
                  done ? "bg-primary/10 text-primary" :
                  active ? "bg-primary text-primary-foreground" :
                  "text-muted-foreground"
                )}>
                  {done ? <Check className="w-3 h-3" /> : <span>{n}</span>}
                  <span className="hidden sm:inline">{label}</span>
                </div>
                {i < STEPS.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground/40 flex-shrink-0" />}
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* Step 1: Request Details */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Participant *</label>
                  <select
                    className="mt-1.5 w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    value={form.participant}
                    onChange={e => {
                      const p = PARTICIPANTS.find(x => x.id === e.target.value);
                      update("participant", e.target.value);
                      update("participantObj", p || null);
                      update("location", p?.suburb || "");
                    }}
                    data-testid="select-participant"
                  >
                    <option value="">Select participant...</option>
                    {PARTICIPANTS.map(p => (
                      <option key={p.id} value={p.id}>{p.name} — {p.suburb}</option>
                    ))}
                  </select>
                </div>

                {form.participantObj && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">{form.participantObj.name}</div>
                      <div className="text-xs text-muted-foreground">NDIS {form.participantObj.ndis} · Budget: ${form.participantObj.plan_budget.toLocaleString()}</div>
                    </div>
                    <Badge variant="secondary" className="ml-auto text-xs">Active Plan</Badge>
                  </motion.div>
                )}

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Service Type *</label>
                  <div className="mt-1.5 grid grid-cols-2 gap-2">
                    {SERVICE_TYPES.map(s => (
                      <button
                        key={s}
                        data-testid={`service-${s.replace(/\s+/g, "-").toLowerCase()}`}
                        onClick={() => update("service", s)}
                        className={cn(
                          "px-3 py-2 text-sm rounded-lg border text-left transition-all",
                          form.service === s
                            ? "border-primary bg-primary/10 text-primary font-medium"
                            : "border-border text-foreground hover:border-primary/50 hover:bg-muted/50"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Priority *</label>
                    <select
                      className="mt-1.5 w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      value={form.priority}
                      onChange={e => update("priority", e.target.value)}
                      data-testid="select-priority"
                    >
                      <option>Routine</option>
                      <option>Priority</option>
                      <option>Emergency</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date Needed</label>
                    <input
                      type="date"
                      className="mt-1.5 w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      value={form.dateNeeded}
                      onChange={e => update("dateNeeded", e.target.value)}
                      data-testid="input-date"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Requirements */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Session Frequency</label>
                    <select className="mt-1.5 w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" value={form.frequency} onChange={e => update("frequency", e.target.value)} data-testid="select-frequency">
                      <option>One-off</option>
                      <option>Weekly</option>
                      <option>Fortnightly</option>
                      <option>Daily</option>
                      <option>As needed</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Session Duration</label>
                    <select className="mt-1.5 w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" value={form.duration} onChange={e => update("duration", e.target.value)} data-testid="select-duration">
                      <option>1 hour</option>
                      <option>2 hours</option>
                      <option>3 hours</option>
                      <option>4 hours</option>
                      <option>Half day</option>
                      <option>Full day</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Gender Preference</label>
                    <select className="mt-1.5 w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" value={form.genderPref} onChange={e => update("genderPref", e.target.value)} data-testid="select-gender">
                      <option>No preference</option>
                      <option>Female</option>
                      <option>Male</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Language</label>
                    <select className="mt-1.5 w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" value={form.language} onChange={e => update("language", e.target.value)} data-testid="select-language">
                      <option>English</option>
                      <option>Mandarin</option>
                      <option>Cantonese</option>
                      <option>Arabic</option>
                      <option>Vietnamese</option>
                      <option>Hindi</option>
                      <option>Tagalog</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Location / Suburb</label>
                  <div className="mt-1.5 relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary" value={form.location} onChange={e => update("location", e.target.value)} placeholder="e.g. Bondi, NSW" data-testid="input-location" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">Special Requirements</label>
                  <div className="grid grid-cols-2 gap-2">
                    {["Manual handling trained", "Medication administration", "First aid certified", "Driver's licence required", "Behaviour support experience", "Experience with autism", "Bilingual preferred", "Pet-friendly"].map(req => (
                      <button
                        key={req}
                        onClick={() => toggleReq(req)}
                        className={cn(
                          "px-3 py-2 text-xs rounded-lg border text-left transition-all",
                          form.requirements.includes(req)
                            ? "border-primary bg-primary/10 text-primary font-medium"
                            : "border-border text-muted-foreground hover:border-primary/40 hover:bg-muted/50"
                        )}
                      >
                        {form.requirements.includes(req) && <Check className="w-3 h-3 inline mr-1" />}
                        {req}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Additional Notes</label>
                  <textarea
                    className="mt-1.5 w-full px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    rows={3}
                    value={form.notes}
                    onChange={e => update("notes", e.target.value)}
                    placeholder="Any additional information for matching..."
                    data-testid="input-notes"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 3: AI Matching */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6">
                <div className="text-center mb-6">
                  <div className="relative w-14 h-14 mx-auto mb-3">
                    <motion.div
                      animate={matchingDone ? {} : { rotate: 360 }}
                      transition={{ duration: 2, repeat: matchingDone ? 0 : Infinity, ease: "linear" }}
                      className="w-14 h-14 rounded-full bg-violet-50 dark:bg-violet-900/20 border-2 border-violet-200 dark:border-violet-700 flex items-center justify-center"
                    >
                      {matchingDone
                        ? <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                        : <CareAffinityIcon className="w-8 h-8" />
                      }
                    </motion.div>
                    {!matchingDone && (
                      <motion.div
                        animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-100 dark:bg-violet-900/40 border border-violet-300 dark:border-violet-600 flex items-center justify-center"
                      >
                        <Sparkles className="w-2.5 h-2.5 text-violet-600 dark:text-violet-400" />
                      </motion.div>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-foreground">
                      {matchingDone ? "Match Found!" : "CareAffinity Engine Running"}
                    </h3>
                    {!matchingDone && (
                      <AIBadge
                        pulse
                        tooltip="Scanning 89 active providers in real-time — applying the 8-feature affinity model to rank by proximity, skill match, availability, pricing, ratings, and care history to surface the ideal match in seconds."
                      />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {matchingDone
                      ? `Found ${providers.length} qualified providers — top match: ${confidence}% confidence`
                      : `Analysing ${providersAnalyzed} of 89 providers...`
                    }
                  </p>
                </div>

                {/* Live stats */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    { label: "Providers Scanned", value: providersAnalyzed, max: 89, color: "text-primary" },
                    { label: "Criteria Checked", value: Math.min(matchingStage * 8 + Math.floor(Math.random() * 3), 48), max: 48, color: "text-amber-600" },
                    { label: "Top Confidence", value: `${confidence}%`, raw: true, color: "text-emerald-600" },
                  ].map(stat => (
                    <div key={stat.label} className="bg-muted/40 rounded-lg p-3 text-center">
                      <div className={`text-xl font-bold ${stat.color}`}>
                        {stat.raw ? stat.value : `${stat.value}${!stat.raw && stat.max ? `/${stat.max}` : ""}`}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Pipeline stages */}
                <div className="space-y-2.5">
                  {MATCHING_STAGES.map((stage, i) => {
                    const done = matchingStage > i;
                    const active = matchingStage === i && !matchingDone;
                    const Icon = stage.icon;
                    return (
                      <motion.div
                        key={stage.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border transition-all",
                          done ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800" :
                          active ? "bg-primary/5 border-primary/30" :
                          "bg-muted/20 border-border"
                        )}
                      >
                        <div className={cn(
                          "w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0",
                          done ? "bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-400" :
                          active ? "bg-primary/10 text-primary" :
                          "bg-muted text-muted-foreground"
                        )}>
                          {done ? <Check className="w-3.5 h-3.5" /> :
                           active ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                           <Icon className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={cn("text-xs font-semibold", done ? "text-emerald-700 dark:text-emerald-400" : active ? "text-primary" : "text-muted-foreground")}>
                            Stage {stage.id}: {stage.label}
                          </div>
                          <div className="text-[10px] text-muted-foreground">{stage.detail}</div>
                        </div>
                        {done && <span className="text-[10px] text-emerald-600 font-medium flex-shrink-0">✓ Done</span>}
                        {active && <span className="text-[10px] text-primary font-medium flex-shrink-0">Running...</span>}
                        {!done && !active && <span className="text-[10px] text-muted-foreground/50 flex-shrink-0">Waiting</span>}
                      </motion.div>
                    );
                  })}
                </div>

                {matchingDone && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-3">
                    <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                      AI matched {providers.length} qualified providers — click Next to review
                    </span>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Step 4: Select Provider */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 space-y-3">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">AI Ranked Matches for {form.service}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">Select one</Badge>
                </div>

                {providers.map((p, i) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <button
                      data-testid={`select-provider-${p.id}`}
                      onClick={() => setSelectedProvider(p)}
                      className={cn(
                        "w-full text-left p-4 rounded-xl border-2 transition-all",
                        selectedProvider?.id === p.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40 hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 relative">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                            {p.name.split(" ").map((n: string) => n[0]).join("")}
                          </div>
                          {i === 0 && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                              <Star className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-foreground">{p.name}</span>
                            <span className="text-xs text-muted-foreground">{p.agency}</span>
                            {i === 0 && <Badge className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">Top Match</Badge>}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.suburb}</span>
                            <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500" />{p.rating}</span>
                            <span className="flex items-center gap-1"><Activity className="w-3 h-3" />{p.bookings} bookings</span>
                            <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />${p.rate}/hr</span>
                          </div>

                          {/* Confidence bar */}
                          <div className="mt-2.5">
                            <div className="flex justify-between text-[10px] mb-1">
                              <span className="text-muted-foreground">AI Confidence Score</span>
                              <span className={cn("font-bold", p.confidence >= 90 ? "text-emerald-600" : p.confidence >= 80 ? "text-amber-600" : "text-orange-600")}>{p.confidence}%</span>
                            </div>
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${p.confidence}%` }}
                                transition={{ duration: 0.8, delay: i * 0.1 + 0.2 }}
                                className={cn("h-full rounded-full", p.confidence >= 90 ? "bg-emerald-500" : p.confidence >= 80 ? "bg-amber-500" : "bg-orange-500")}
                              />
                            </div>
                          </div>

                          {/* Match reasons */}
                          <div className="mt-2.5 flex flex-wrap gap-1.5">
                            {p.reasons.map((r: string) => (
                              <span key={r} className="text-[10px] px-2 py-0.5 bg-primary/8 text-primary rounded-full border border-primary/20">
                                ✓ {r}
                              </span>
                            ))}
                          </div>
                        </div>
                        {selectedProvider?.id === p.id && (
                          <div className="flex-shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          </div>
                        )}
                      </div>
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Step 5: Confirmation */}
            {step === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4"
                >
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </motion.div>

                <h3 className="text-lg font-bold text-foreground">Booking Confirmed!</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-6">The request has been matched, approved, and a booking created.</p>

                <div className="w-full space-y-2 text-left mb-6">
                  {[
                    { label: "Request ID", value: requestId, icon: FileIcon },
                    { label: "Booking ID", value: bookingId, icon: Calendar },
                    { label: "Participant", value: form.participantObj?.name, icon: User },
                    { label: "Service", value: form.service, icon: Award },
                    { label: "Assigned Provider", value: selectedProvider?.name, icon: Phone },
                    { label: "Agency", value: selectedProvider?.agency, icon: Activity },
                    { label: "Confidence", value: `${selectedProvider?.confidence}%`, icon: Zap },
                    { label: "Schedule", value: `${form.frequency} · ${form.duration}`, icon: Clock },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex items-center gap-3 px-4 py-2.5 bg-muted/40 rounded-lg">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="text-xs text-muted-foreground">{label}</span>
                      <span className="text-xs font-medium text-foreground ml-auto">{value}</span>
                    </div>
                  ))}
                </div>

                {/* Workflow Timeline */}
                <div className="w-full border border-border rounded-xl p-4">
                  <div className="text-xs font-semibold text-foreground mb-3 text-left flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-primary" />
                    Workflow Timeline
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "Request Submitted", detail: "Via Operations Console", time: "Just now", status: "done" },
                      { label: "CareAffinity Engine Complete", detail: `${selectedProvider?.confidence}% confidence · ${providers.length} providers ranked`, time: "Just now", status: "done" },
                      { label: "Match Auto-Approved", detail: `Threshold 78% · Score ${selectedProvider?.confidence}%`, time: "Just now", status: "done" },
                      { label: "Provider Notified", detail: selectedProvider?.name, time: "Pending", status: "pending" },
                      { label: "Booking Confirmed", detail: bookingId, time: "Pending", status: "pending" },
                      { label: "Service Delivery", detail: form.frequency, time: "Upcoming", status: "upcoming" },
                    ].map((ev, i) => (
                      <motion.div
                        key={ev.label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                            ev.status === "done" ? "bg-emerald-100 dark:bg-emerald-900/40" :
                            ev.status === "pending" ? "bg-amber-100 dark:bg-amber-900/30" :
                            "bg-muted"
                          )}>
                            {ev.status === "done"
                              ? <Check className="w-3 h-3 text-emerald-600" />
                              : ev.status === "pending"
                              ? <Clock className="w-2.5 h-2.5 text-amber-600" />
                              : <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                            }
                          </div>
                          {i < 5 && <div className="w-px h-4 bg-border mt-0.5" />}
                        </div>
                        <div className="pb-2">
                          <div className={cn("text-xs font-medium", ev.status === "done" ? "text-foreground" : "text-muted-foreground")}>{ev.label}</div>
                          <div className="text-[10px] text-muted-foreground">{ev.detail}</div>
                        </div>
                        <div className="ml-auto text-[10px] text-muted-foreground flex-shrink-0">{ev.time}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <Button className="mt-4 w-full" onClick={handleClose} data-testid="btn-done">
                  View Request in Dashboard
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {step < 5 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border flex-shrink-0 bg-muted/20">
            <Button variant="outline" size="sm" onClick={() => step === 1 ? handleClose() : setStep(s => s - 1)} data-testid="btn-back-step">
              <ChevronLeft className="w-4 h-4 mr-1" />
              {step === 1 ? "Cancel" : "Back"}
            </Button>

            <div className="flex items-center gap-2">
              {step === 3 && !matchingDone && (
                <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Processing...
                </span>
              )}
              <Button
                size="sm"
                onClick={handleNext}
                disabled={!canNext()}
                data-testid="btn-next-step"
                className={cn(!canNext() && "opacity-50 cursor-not-allowed")}
              >
                {step === 4 ? "Approve & Book" : step === 3 ? "View Results" : "Continue"}
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
