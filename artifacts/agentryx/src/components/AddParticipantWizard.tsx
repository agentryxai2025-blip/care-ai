import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronRight, ChevronLeft, Check, User, FileText, Heart, Sparkles,
  Phone, Mail, MapPin, Calendar, DollarSign, Languages, Shield, AlertTriangle,
  Users, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  onComplete: (participant: any) => void;
}

const STEPS = [
  { label: "Personal Details", icon: User },
  { label: "NDIS Plan", icon: FileText },
  { label: "Support Needs", icon: Heart },
  { label: "Confirm", icon: Sparkles },
];

const SERVICES = [
  "Personal Care", "Community Access", "Domestic Assistance",
  "Therapy Support", "Behaviour Support", "Transport",
  "Social Support", "Meal Preparation", "Complex Care",
];

const ACCESS_NEEDS = [
  "Wheelchair access", "Hoist required", "Hearing support",
  "Low sensory", "Cultural considerations", "Allergy aware",
  "Communication support", "Behavioural support", "Epilepsy aware",
  "Diabetes management", "None",
];

// Realistic caseload data — capacity is typically 25–45 active participants per SC
const COORDINATORS = [
  { name: "Helen Marsh",  active: 38, max: 45 },
  { name: "Ryan Lee",     active: 44, max: 45 },
  { name: "Karen Booth",  active: 22, max: 45 },
  { name: "Lisa Nguyen",  active: 45, max: 45 },
];

function coordSlots(c: typeof COORDINATORS[0]) {
  return c.max - c.active;
}

function coordStatus(c: typeof COORDINATORS[0]): "full" | "limited" | "available" {
  const slots = coordSlots(c);
  if (slots === 0) return "full";
  if (slots <= 3) return "limited";
  return "available";
}

const STATUS_STYLES = {
  full:      { pill: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",      bar: "bg-red-400" },
  limited:   { pill: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400", bar: "bg-amber-400" },
  available: { pill: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400", bar: "bg-emerald-500" },
};

type FormData = {
  firstName: string;
  lastName: string;
  age: string;
  suburb: string;
  phone: string;
  email: string;
  language: string;
  genderPref: string;
  ndisNumber: string;
  planType: string;
  coordinator: string;         // assigned coordinator (may be empty = assign later)
  coordinatorPref: string;     // preferred coordinator note (if first choice is full)
  budgetTotal: string;
  planStart: string;
  planEnd: string;
  disabilityType: string;
  services: string[];
  accessNeeds: string[];
  notes: string;
};

const emptyForm: FormData = {
  firstName: "", lastName: "", age: "", suburb: "", phone: "", email: "",
  language: "English", genderPref: "No preference",
  ndisNumber: "", planType: "", coordinator: "", coordinatorPref: "",
  budgetTotal: "", planStart: "", planEnd: "", disabilityType: "",
  services: [], accessNeeds: [], notes: "",
};

export default function AddParticipantWizard({ open, onClose, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [confirmed, setConfirmed] = useState(false);
  const pidRef = useRef(`P${String(Math.floor(Math.random() * 900) + 100).padStart(3, "0")}`);
  const ndisRef = useRef(`${Math.floor(Math.random() * 900000000) + 100000000}`);

  const update = (k: keyof FormData, v: any) => setForm(f => ({ ...f, [k]: v }));

  const toggleArr = (k: "services" | "accessNeeds", val: string) =>
    setForm(f => ({
      ...f,
      [k]: f[k].includes(val) ? f[k].filter(x => x !== val) : [...f[k], val],
    }));

  const handleClose = () => {
    setStep(0);
    setForm(emptyForm);
    setConfirmed(false);
    onClose();
  };

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => {
      onComplete({
        id: pidRef.current,
        name: `${form.firstName} ${form.lastName}`,
        ndis_number: form.ndisNumber || ndisRef.current,
        plan_type: form.planType || "Plan-managed",
        support_coordinator: form.coordinator || "Unassigned",
        plan_budget_total: parseInt(form.budgetTotal) || 50000,
        plan_budget_spent: 0,
        status: "Active",
        preferences: {
          language: form.language,
          gender_pref: form.genderPref,
          accessibility_needs: form.accessNeeds.join(", ") || "None",
        },
        suburb: form.suburb,
        age: parseInt(form.age) || 30,
        isNew: true,
      });
      handleClose();
    }, 1800);
  };

  const canNext = () => {
    if (step === 0) return form.firstName.trim() && form.lastName.trim() && form.suburb.trim();
    if (step === 1) return !!form.planType; // coordinator is optional — can assign later
    return true;
  };

  const selectedCoord = COORDINATORS.find(c => c.name === form.coordinator);
  const selectedStatus = selectedCoord ? coordStatus(selectedCoord) : null;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ type: "spring", damping: 28, stiffness: 380 }}
        className="relative bg-background border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 p-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold">Add Participant</h2>
              <p className="text-sm text-teal-100">Register a new NDIS participant</p>
            </div>
            <button onClick={handleClose} className="rounded-full p-1.5 hover:bg-white/20 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Step indicators */}
          <div className="flex gap-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="flex-1">
                  <div className={`flex items-center gap-1.5 text-[10px] font-medium mb-1 ${i <= step ? "text-white" : "text-teal-300"}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      i < step ? "bg-white/30" : i === step ? "bg-white/20 ring-2 ring-white" : "bg-white/10"
                    }`}>
                      {i < step ? <Check className="w-3 h-3" /> : <Icon className="w-2.5 h-2.5" />}
                    </div>
                    <span className="hidden sm:block">{s.label}</span>
                  </div>
                  <div className={`h-0.5 rounded-full transition-all ${i <= step ? "bg-white" : "bg-white/20"}`} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="p-5 max-h-[60vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <p className="text-sm text-muted-foreground font-medium">Personal Details</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">First Name *</Label>
                    <div className="relative">
                      <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input className="pl-8 h-9 text-sm" placeholder="Jane" value={form.firstName} onChange={e => update("firstName", e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Last Name *</Label>
                    <Input className="h-9 text-sm" placeholder="Smith" value={form.lastName} onChange={e => update("lastName", e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Age</Label>
                    <Input className="h-9 text-sm" type="number" placeholder="35" min="1" max="120" value={form.age} onChange={e => update("age", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Suburb *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input className="pl-8 h-9 text-sm" placeholder="Newtown" value={form.suburb} onChange={e => update("suburb", e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input className="pl-8 h-9 text-sm" placeholder="04xx xxx xxx" value={form.phone} onChange={e => update("phone", e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input className="pl-8 h-9 text-sm" placeholder="jane@example.com" value={form.email} onChange={e => update("email", e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1"><Languages className="w-3 h-3" /> Preferred Language</Label>
                    <Input className="h-9 text-sm" placeholder="English" value={form.language} onChange={e => update("language", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Gender Preference</Label>
                    <Select value={form.genderPref} onValueChange={v => update("genderPref", v)}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="No preference">No preference</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Male">Male</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <p className="text-sm text-muted-foreground font-medium">NDIS Plan Information</p>
                <div className="space-y-1.5">
                  <Label className="text-xs">NDIS Number</Label>
                  <div className="relative">
                    <Shield className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input className="pl-8 h-9 text-sm font-mono" placeholder="Auto-generated if blank" value={form.ndisNumber} onChange={e => update("ndisNumber", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Plan Type *</Label>
                  <Select value={form.planType} onValueChange={v => update("planType", v)}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NDIA-managed">NDIA-managed</SelectItem>
                      <SelectItem value="Plan-managed">Plan-managed</SelectItem>
                      <SelectItem value="Self-managed">Self-managed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Coordinator assignment — optional, with capacity display */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs flex items-center gap-1">
                      <Users className="w-3 h-3" /> Support Coordinator
                      <span className="text-muted-foreground font-normal ml-1">— optional, can assign later</span>
                    </Label>
                  </div>

                  {/* Coordinator cards */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Assign later option */}
                    <button
                      onClick={() => update("coordinator", "")}
                      className={cn(
                        "text-left p-2.5 rounded-lg border text-xs transition-all",
                        !form.coordinator
                          ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 ring-1 ring-teal-500"
                          : "border-border hover:border-muted-foreground/40"
                      )}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="font-medium text-foreground">Assign later</span>
                      </div>
                      <p className="text-muted-foreground text-[10px] leading-tight">Participant registered as Unassigned — coordinator allocated by manager</p>
                    </button>

                    {COORDINATORS.map(c => {
                      const status = coordStatus(c);
                      const slots = coordSlots(c);
                      const styles = STATUS_STYLES[status];
                      const isSelected = form.coordinator === c.name;
                      return (
                        <button
                          key={c.name}
                          onClick={() => update("coordinator", c.name)}
                          className={cn(
                            "text-left p-2.5 rounded-lg border text-xs transition-all",
                            isSelected
                              ? "border-teal-500 bg-teal-50 dark:bg-teal-900/20 ring-1 ring-teal-500"
                              : status === "full"
                              ? "border-border opacity-60 hover:opacity-80"
                              : "border-border hover:border-muted-foreground/40"
                          )}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-medium text-foreground truncate">{c.name}</span>
                            <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ml-1", styles.pill)}>
                              {status === "full" ? "Full" : `${slots} free`}
                            </span>
                          </div>
                          {/* Caseload bar */}
                          <div className="h-1 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn("h-full rounded-full transition-all", styles.bar)}
                              style={{ width: `${(c.active / c.max) * 100}%` }}
                            />
                          </div>
                          <p className="text-muted-foreground text-[10px] mt-1">{c.active}/{c.max} participants</p>
                        </button>
                      );
                    })}
                  </div>

                  {/* Warning when full coordinator is selected */}
                  {selectedStatus === "full" && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800 dark:text-amber-300">{form.coordinator} is at full capacity</p>
                        <p className="text-amber-700 dark:text-amber-400 mt-0.5">This assignment will flag for manager review. Record the participant's preference below and a manager will arrange a suitable coordinator.</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Warning when limited slots */}
                  {selectedStatus === "limited" && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-800/50 text-xs"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-amber-700 dark:text-amber-400">{form.coordinator} has only {coordSlots(selectedCoord!)} slot{coordSlots(selectedCoord!) !== 1 ? "s" : ""} remaining — consider Karen Booth who has more availability.</p>
                    </motion.div>
                  )}

                  {/* Preference note — shown when full coordinator selected, or explicitly requested */}
                  {(selectedStatus === "full") && (
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Participant's preference note (optional)</Label>
                      <Input
                        className="h-9 text-sm"
                        placeholder="e.g. Referred by Helen, has existing rapport"
                        value={form.coordinatorPref}
                        onChange={e => update("coordinatorPref", e.target.value)}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs flex items-center gap-1"><DollarSign className="w-3 h-3" /> Annual Budget (AUD)</Label>
                  <Input className="h-9 text-sm" type="number" placeholder="e.g. 75000" value={form.budgetTotal} onChange={e => update("budgetTotal", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1"><Calendar className="w-3 h-3" /> Plan Start</Label>
                    <Input className="h-9 text-sm" type="date" value={form.planStart} onChange={e => update("planStart", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1"><Calendar className="w-3 h-3" /> Plan End</Label>
                    <Input className="h-9 text-sm" type="date" value={form.planEnd} onChange={e => update("planEnd", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Primary Disability / Diagnosis</Label>
                  <Input className="h-9 text-sm" placeholder="e.g. Autism Spectrum Disorder" value={form.disabilityType} onChange={e => update("disabilityType", e.target.value)} />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <p className="text-sm text-muted-foreground font-medium">Support Needs</p>
                <div>
                  <Label className="text-xs mb-2 block">Services Required</Label>
                  <div className="flex flex-wrap gap-2">
                    {SERVICES.map(s => (
                      <button
                        key={s}
                        onClick={() => toggleArr("services", s)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all font-medium ${
                          form.services.includes(s)
                            ? "bg-teal-600 text-white border-teal-600"
                            : "border-border text-muted-foreground hover:border-teal-400 hover:text-foreground"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs mb-2 block">Accessibility / Special Needs</Label>
                  <div className="flex flex-wrap gap-2">
                    {ACCESS_NEEDS.map(n => (
                      <button
                        key={n}
                        onClick={() => toggleArr("accessNeeds", n)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all font-medium ${
                          form.accessNeeds.includes(n)
                            ? "bg-emerald-600 text-white border-emerald-600"
                            : "border-border text-muted-foreground hover:border-emerald-400 hover:text-foreground"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Additional Notes</Label>
                  <textarea
                    className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    rows={3}
                    placeholder="Any other important information about this participant..."
                    value={form.notes}
                    onChange={e => update("notes", e.target.value)}
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                {confirmed ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center py-8 gap-4"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ repeat: 2, duration: 0.4 }}
                      className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center"
                    >
                      <Check className="w-8 h-8 text-emerald-600" />
                    </motion.div>
                    <div className="text-center">
                      <p className="font-bold text-foreground">Participant Registered!</p>
                      <p className="text-sm text-muted-foreground mt-1">{form.firstName} {form.lastName} — {pidRef.current}</p>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground font-medium">Review & Confirm</p>
                    <div className="bg-muted/40 rounded-xl p-4 space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-700 font-bold text-base">
                          {form.firstName.charAt(0)}{form.lastName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{form.firstName} {form.lastName}</p>
                          <p className="text-xs text-muted-foreground">{form.suburb}{form.age ? ` · Age ${form.age}` : ""} · {pidRef.current}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs pt-1 border-t border-border">
                        <Row label="Plan Type" val={form.planType || "Plan-managed"} />
                        <Row
                          label="Coordinator"
                          val={form.coordinator || "Unassigned"}
                          warn={selectedStatus === "full"}
                          warnText="At capacity — flagged for manager review"
                        />
                        <Row label="NDIS No." val={form.ndisNumber || ndisRef.current} />
                        <Row label="Annual Budget" val={form.budgetTotal ? `$${parseInt(form.budgetTotal).toLocaleString()}` : "TBD"} />
                        <Row label="Language" val={form.language} />
                        <Row label="Gender Pref." val={form.genderPref} />
                        {form.coordinatorPref && (
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Coord. Preference Note: </span>
                            <span className="font-medium text-foreground">{form.coordinatorPref}</span>
                          </div>
                        )}
                        {form.services.length > 0 && (
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Services: </span>
                            <span className="font-medium text-foreground">{form.services.join(", ")}</span>
                          </div>
                        )}
                        {form.accessNeeds.length > 0 && (
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Access Needs: </span>
                            <span className="font-medium text-foreground">{form.accessNeeds.join(", ")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {!form.coordinator && (
                      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-xs">
                        <Clock className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-blue-700 dark:text-blue-300">No coordinator assigned — this participant will appear in the manager's unassigned queue for allocation.</p>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {!confirmed && (
          <div className="p-4 border-t border-border flex items-center justify-between bg-muted/20">
            <Button variant="ghost" size="sm" onClick={step === 0 ? handleClose : () => setStep(s => s - 1)} className="gap-1">
              {step === 0 ? <X className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
              {step === 0 ? "Cancel" : "Back"}
            </Button>
            <div className="flex items-center gap-1">
              {STEPS.map((_, i) => <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === step ? "bg-teal-600 w-4" : i < step ? "bg-teal-400" : "bg-border"}`} />)}
            </div>
            {step < 3 ? (
              <Button size="sm" onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="gap-1 bg-teal-600 hover:bg-teal-700">
                Next <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button size="sm" onClick={handleConfirm} className="gap-1 bg-emerald-600 hover:bg-emerald-700">
                <Check className="w-3.5 h-3.5" /> Register Participant
              </Button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function Row({ label, val, warn, warnText }: { label: string; val: string; warn?: boolean; warnText?: string }) {
  return (
    <div>
      <span className="text-muted-foreground">{label}: </span>
      <span className={cn("font-medium", warn ? "text-amber-600 dark:text-amber-400" : "text-foreground")}>{val}</span>
      {warn && warnText && <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">{warnText}</p>}
    </div>
  );
}
