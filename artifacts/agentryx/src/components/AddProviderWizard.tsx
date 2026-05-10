import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronRight, ChevronLeft, Check, User, Briefcase, Calendar, Sparkles,
  Phone, Mail, MapPin, Shield, Clock,
  Stethoscope, Brain, Building2, Calculator, Users, Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { ProviderType } from "@/pages/Providers";

interface Props {
  open: boolean;
  onClose: () => void;
  onComplete: (provider: any) => void;
}

const STEPS = [
  { label: "Provider Type", icon: Briefcase },
  { label: "Details",       icon: User },
  { label: "Credentials",   icon: Shield },
  { label: "Services",      icon: Sparkles },
];

// Provider type definitions with icons and contextual metadata
const PROVIDER_TYPES: {
  type: ProviderType;
  icon: React.ElementType;
  desc: string;
  bg: string;
  color: string;
  ring: string;
}[] = [
  { type: "Support Worker",      icon: User,        desc: "Individual direct care & community support",  bg: "bg-blue-50 dark:bg-blue-900/20",    color: "text-blue-700 dark:text-blue-400",   ring: "ring-blue-500 border-blue-500" },
  { type: "Allied Health",       icon: Stethoscope, desc: "OT, physio, speech, psychology, nursing",      bg: "bg-teal-50 dark:bg-teal-900/20",    color: "text-teal-700 dark:text-teal-400",   ring: "ring-teal-500 border-teal-500" },
  { type: "Behaviour Support",   icon: Brain,       desc: "NDIS positive behaviour support practitioner", bg: "bg-orange-50 dark:bg-orange-900/20", color: "text-orange-700 dark:text-orange-400", ring: "ring-orange-500 border-orange-500" },
  { type: "Organisation",        icon: Building2,   desc: "Registered disability service agency",         bg: "bg-emerald-50 dark:bg-emerald-900/20", color: "text-emerald-700 dark:text-emerald-400", ring: "ring-emerald-500 border-emerald-500" },
  { type: "Plan Manager",        icon: Calculator,  desc: "NDIS financial plan management",               bg: "bg-indigo-50 dark:bg-indigo-900/20", color: "text-indigo-700 dark:text-indigo-400", ring: "ring-indigo-500 border-indigo-500" },
  { type: "Support Coordinator", icon: Users,       desc: "External / third-party support coordination",  bg: "bg-violet-50 dark:bg-violet-900/20", color: "text-violet-700 dark:text-violet-400", ring: "ring-violet-500 border-violet-500" },
  { type: "SDA/SIL Provider",   icon: Home,        desc: "Specialist accommodation & supported living",   bg: "bg-amber-50 dark:bg-amber-900/20",  color: "text-amber-700 dark:text-amber-400",  ring: "ring-amber-500 border-amber-500" },
];

// Skills available per provider type
const SKILLS_BY_TYPE: Record<ProviderType, string[]> = {
  "Support Worker":      ["Personal Care", "Community Access", "Domestic Assistance", "Transport", "Social Support", "Meal Preparation", "Manual Handling", "CALD Support", "First Aid"],
  "Allied Health":       ["Occupational Therapy", "Physiotherapy", "Speech Therapy", "Psychology", "Nursing", "Dietetics", "Podiatry", "Exercise Physiology", "Music Therapy"],
  "Behaviour Support":   ["Behaviour Assessment", "PBS Plan Development", "Restrictive Practices", "Functional Behaviour Assessment", "Crisis Intervention", "Staff Training"],
  "Organisation":        ["Personal Care", "Community Access", "Domestic Assistance", "Complex Care", "Therapy Support", "Behaviour Support", "Transport", "SIL Support"],
  "Plan Manager":        ["NDIS Plan Management", "Financial Reporting", "Claims Processing", "Budget Monitoring", "Provider Payments", "Plan Utilisation Advice"],
  "Support Coordinator": ["Support Coordination", "Specialist Support Coordination", "Plan Implementation", "Crisis Support", "Service Negotiation", "Goal Setting"],
  "SDA/SIL Provider":    ["Specialist Disability Accommodation", "Supported Independent Living", "24/7 On-site Support", "Robust Housing", "Accessible Housing", "Improved Liveability"],
};

// Credential fields per type
const CREDS_BY_TYPE: Record<ProviderType, { policeCheck: boolean; wwc: boolean; firstAid: boolean; ahpra: boolean; afs: boolean }> = {
  "Support Worker":      { policeCheck: true,  wwc: true,  firstAid: true,  ahpra: false, afs: false },
  "Allied Health":       { policeCheck: true,  wwc: false, firstAid: false, ahpra: true,  afs: false },
  "Behaviour Support":   { policeCheck: true,  wwc: false, firstAid: false, ahpra: true,  afs: false },
  "Organisation":        { policeCheck: false, wwc: false, firstAid: false, ahpra: false, afs: false },
  "Plan Manager":        { policeCheck: true,  wwc: false, firstAid: false, ahpra: false, afs: true  },
  "Support Coordinator": { policeCheck: true,  wwc: false, firstAid: false, ahpra: false, afs: false },
  "SDA/SIL Provider":    { policeCheck: false, wwc: false, firstAid: false, ahpra: false, afs: false },
};

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type FormData = {
  providerType: ProviderType | "";
  // individual fields
  firstName: string; lastName: string;
  // organisation fields
  orgName: string; contactPerson: string;
  // shared
  suburb: string; phone: string; email: string; abn: string;
  // credentials
  tier: string; ndisReg: string; policeCheck: string; wwcCheck: string;
  firstAid: string; ahpraReg: string; afsLicence: string;
  profession: string;   // Allied Health / BS specialisation
  staffCount: string;   // Organisation
  // services
  skills: string[]; days: string[]; maxHours: string; responseTime: string; notes: string;
};

const emptyForm: FormData = {
  providerType: "", firstName: "", lastName: "", orgName: "", contactPerson: "",
  suburb: "", phone: "", email: "", abn: "",
  tier: "", ndisReg: "", policeCheck: "", wwcCheck: "", firstAid: "", ahpraReg: "", afsLicence: "",
  profession: "", staffCount: "",
  skills: [], days: [], maxHours: "40", responseTime: "30", notes: "",
};

const isOrg = (t: ProviderType | "") =>
  t === "Organisation" || t === "Plan Manager" || t === "Support Coordinator" || t === "SDA/SIL Provider";

export default function AddProviderWizard({ open, onClose, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [confirmed, setConfirmed] = useState(false);
  const pidRef = useRef(`PR${String(Math.floor(Math.random() * 900) + 100).padStart(3, "0")}`);

  const update = (k: keyof FormData, v: any) => setForm(f => ({ ...f, [k]: v }));

  const toggleSkill = (val: string) =>
    setForm(f => ({ ...f, skills: f.skills.includes(val) ? f.skills.filter(x => x !== val) : [...f.skills, val] }));

  const toggleDay = (val: string) =>
    setForm(f => ({ ...f, days: f.days.includes(val) ? f.days.filter(x => x !== val) : [...f.days, val] }));

  const handleClose = () => { setStep(0); setForm(emptyForm); setConfirmed(false); onClose(); };

  const handleConfirm = () => {
    setConfirmed(true);
    const displayName = isOrg(form.providerType)
      ? form.orgName
      : `${form.firstName} ${form.lastName}`;
    setTimeout(() => {
      onComplete({
        id: pidRef.current,
        name: displayName,
        providerType: form.providerType || "Support Worker",
        tier: form.tier || "General",
        skills: form.skills.length > 0 ? form.skills : ["Support Services"],
        rating: 4.5, reliability: 90,
        screening: "Current",
        availability: "Available",
        suburb: form.suburb,
        total_bookings: 0,
        response_time: `${form.responseTime} min`,
        isNew: true,
      });
      handleClose();
    }, 1800);
  };

  const canNext = () => {
    if (step === 0) return !!form.providerType;
    if (step === 1) {
      if (isOrg(form.providerType)) return form.orgName.trim() && form.suburb.trim();
      return form.firstName.trim() && form.lastName.trim() && form.suburb.trim();
    }
    if (step === 2) return !!form.tier;
    if (step === 3) return form.skills.length > 0;
    return true;
  };

  const selectedTypeMeta = form.providerType ? PROVIDER_TYPES.find(t => t.type === form.providerType) : null;
  const creds = form.providerType ? CREDS_BY_TYPE[form.providerType as ProviderType] : null;
  const availableSkills = form.providerType ? SKILLS_BY_TYPE[form.providerType as ProviderType] : [];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ type: "spring", damping: 28, stiffness: 380 }}
        className="relative bg-background border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-blue-600 p-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold">Add Provider</h2>
              <p className="text-sm text-violet-100">
                {selectedTypeMeta ? selectedTypeMeta.desc : "Register a new NDIS provider"}
              </p>
            </div>
            <button onClick={handleClose} className="rounded-full p-1.5 hover:bg-white/20 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="flex-1">
                  <div className={`flex items-center gap-1.5 text-[10px] font-medium mb-1 ${i <= step ? "text-white" : "text-violet-300"}`}>
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
        <div className="p-5 max-h-[62vh] overflow-y-auto">
          <AnimatePresence mode="wait">

            {/* ── Step 0: Provider Type ── */}
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                <p className="text-sm text-muted-foreground font-medium">What type of provider are you registering?</p>
                <div className="grid grid-cols-1 gap-2">
                  {PROVIDER_TYPES.map(({ type, icon: Icon, desc, bg, color, ring }) => {
                    const selected = form.providerType === type;
                    return (
                      <button
                        key={type}
                        onClick={() => { update("providerType", type); update("skills", []); }}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                          selected ? `${bg} ${ring} ring-1` : "border-border hover:border-muted-foreground/40 hover:bg-muted/30"
                        )}
                      >
                        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", bg)}>
                          <Icon className={cn("w-4 h-4", color)} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={cn("text-sm font-semibold", selected ? color : "text-foreground")}>{type}</div>
                          <div className="text-[11px] text-muted-foreground leading-tight">{desc}</div>
                        </div>
                        {selected && <Check className={cn("w-4 h-4 flex-shrink-0", color)} />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── Step 1: Details (adapts to type) ── */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <p className="text-sm text-muted-foreground font-medium">
                  {isOrg(form.providerType) ? "Organisation Details" : "Personal Details"}
                </p>

                {isOrg(form.providerType) ? (
                  <>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Organisation Name *</Label>
                      <div className="relative">
                        <Building2 className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input className="pl-8 h-9 text-sm" placeholder="e.g. Horizon Disability Services" value={form.orgName} onChange={e => update("orgName", e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Contact Person</Label>
                        <Input className="h-9 text-sm" placeholder="Jane Smith" value={form.contactPerson} onChange={e => update("contactPerson", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">No. of Staff</Label>
                        <Input className="h-9 text-sm" type="number" placeholder="e.g. 25" value={form.staffCount} onChange={e => update("staffCount", e.target.value)} />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">First Name *</Label>
                        <div className="relative">
                          <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                          <Input className="pl-8 h-9 text-sm" placeholder="Alex" value={form.firstName} onChange={e => update("firstName", e.target.value)} />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Last Name *</Label>
                        <Input className="h-9 text-sm" placeholder="Johnson" value={form.lastName} onChange={e => update("lastName", e.target.value)} />
                      </div>
                    </div>
                    {(form.providerType === "Allied Health" || form.providerType === "Behaviour Support") && (
                      <div className="space-y-1.5">
                        <Label className="text-xs">
                          {form.providerType === "Allied Health" ? "Profession / Specialisation" : "PBS Specialisation"}
                        </Label>
                        <Input className="h-9 text-sm"
                          placeholder={form.providerType === "Allied Health" ? "e.g. Occupational Therapist" : "e.g. Autism, acquired brain injury"}
                          value={form.profession} onChange={e => update("profession", e.target.value)} />
                      </div>
                    )}
                  </>
                )}

                <div className="space-y-1.5">
                  <Label className="text-xs">Suburb *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input className="pl-8 h-9 text-sm" placeholder="e.g. Parramatta NSW 2150" value={form.suburb} onChange={e => update("suburb", e.target.value)} />
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
                      <Input className="pl-8 h-9 text-sm" placeholder="contact@example.com" value={form.email} onChange={e => update("email", e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">ABN</Label>
                  <Input className="h-9 text-sm font-mono" placeholder="12 345 678 901" value={form.abn} onChange={e => update("abn", e.target.value)} />
                </div>
              </motion.div>
            )}

            {/* ── Step 2: Credentials (type-aware) ── */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <p className="text-sm text-muted-foreground font-medium">Registration & Credentials</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Provider Tier *</Label>
                    <Select value={form.tier} onValueChange={v => update("tier", v)}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select tier" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                        <SelectItem value="General">General</SelectItem>
                        <SelectItem value="Basic">Basic</SelectItem>
                        <SelectItem value="Enrolled">Enrolled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">NDIS Registration No.</Label>
                    <div className="relative">
                      <Shield className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input className="pl-8 h-9 text-sm font-mono" placeholder="4-XXXXXXXX" value={form.ndisReg} onChange={e => update("ndisReg", e.target.value)} />
                    </div>
                  </div>
                </div>

                {/* Type-specific credential fields */}
                {creds && (creds.policeCheck || creds.wwc || creds.firstAid || creds.ahpra || creds.afs) && (
                  <div className="bg-muted/40 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-violet-600" />
                      {creds.ahpra ? "Professional Registration" : creds.afs ? "Financial Authorisations" : "Screening Checks"}
                    </p>
                    <div className="space-y-3">
                      {creds.policeCheck && (
                        <div className="space-y-1.5">
                          <Label className="text-xs">Police Check Date</Label>
                          <div className="relative">
                            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                            <Input className="pl-8 h-9 text-sm" type="date" value={form.policeCheck} onChange={e => update("policeCheck", e.target.value)} />
                          </div>
                        </div>
                      )}
                      {creds.ahpra && (
                        <div className="space-y-1.5">
                          <Label className="text-xs">AHPRA Registration No.</Label>
                          <Input className="h-9 text-sm font-mono" placeholder="e.g. OCC0001234567" value={form.ahpraReg} onChange={e => update("ahpraReg", e.target.value)} />
                        </div>
                      )}
                      {creds.afs && (
                        <div className="space-y-1.5">
                          <Label className="text-xs">AFS Licence / Registration</Label>
                          <Input className="h-9 text-sm font-mono" placeholder="e.g. 123456" value={form.afsLicence} onChange={e => update("afsLicence", e.target.value)} />
                        </div>
                      )}
                      {(creds.wwc || creds.firstAid) && (
                        <div className="grid grid-cols-2 gap-3">
                          {creds.wwc && (
                            <div className="space-y-1.5">
                              <Label className="text-xs">Working with Children</Label>
                              <Input className="h-9 text-sm font-mono" placeholder="WWC number" value={form.wwcCheck} onChange={e => update("wwcCheck", e.target.value)} />
                            </div>
                          )}
                          {creds.firstAid && (
                            <div className="space-y-1.5">
                              <Label className="text-xs">First Aid Expiry</Label>
                              <Input className="h-9 text-sm" type="date" value={form.firstAid} onChange={e => update("firstAid", e.target.value)} />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {form.providerType === "Organisation" && (
                  <p className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2">
                    Individual worker screening records are managed per staff member within the organisation's provider profile.
                  </p>
                )}
              </motion.div>
            )}

            {/* ── Step 3: Services & Availability ── */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <p className="text-sm text-muted-foreground font-medium">Services & Availability</p>
                <div>
                  <Label className="text-xs mb-2 block">Services / Capabilities *</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableSkills.map(s => (
                      <button key={s} onClick={() => toggleSkill(s)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all font-medium ${
                          form.skills.includes(s) ? "bg-violet-600 text-white border-violet-600" : "border-border text-muted-foreground hover:border-violet-400 hover:text-foreground"
                        }`}
                      >{s}</button>
                    ))}
                  </div>
                </div>

                {form.providerType !== "Plan Manager" && form.providerType !== "SDA/SIL Provider" && (
                  <div>
                    <Label className="text-xs mb-2 block">Available Days</Label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS.map(d => (
                        <button key={d} onClick={() => toggleDay(d)}
                          className={`text-xs px-2.5 py-1 rounded-full border transition-all font-medium ${
                            form.days.includes(d) ? "bg-blue-600 text-white border-blue-600" : "border-border text-muted-foreground hover:border-blue-400 hover:text-foreground"
                          }`}
                        >{d.slice(0, 3)}</button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {form.providerType !== "Plan Manager" && (
                    <div className="space-y-1.5">
                      <Label className="text-xs flex items-center gap-1"><Clock className="w-3 h-3" />
                        {form.providerType === "Organisation" ? "Max Concurrent Clients" : "Max Hours/Week"}
                      </Label>
                      <Input className="h-9 text-sm" type="number" min="1" value={form.maxHours} onChange={e => update("maxHours", e.target.value)} />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1"><Clock className="w-3 h-3" />
                      {form.providerType === "Plan Manager" ? "Avg Claims Processing (days)" : "Avg Response Time (min)"}
                    </Label>
                    <Input className="h-9 text-sm" type="number" min="1" value={form.responseTime} onChange={e => update("responseTime", e.target.value)} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Additional Notes</Label>
                  <textarea
                    className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    rows={3}
                    placeholder={
                      form.providerType === "Allied Health" ? "Languages, equipment, clinic hours, telehealth availability..." :
                      form.providerType === "Organisation" ? "Service regions, accreditation bodies, specialisations..." :
                      "Languages spoken, specialisations, equipment owned..."
                    }
                    value={form.notes}
                    onChange={e => update("notes", e.target.value)}
                  />
                </div>
              </motion.div>
            )}

            {/* ── Step 4: Confirm ── */}
            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                {confirmed ? (
                  <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center py-8 gap-4"
                  >
                    <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: 2, duration: 0.4 }}
                      className="w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center"
                    >
                      <Check className="w-8 h-8 text-violet-600" />
                    </motion.div>
                    <div className="text-center">
                      <p className="font-bold text-foreground">Provider Registered!</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {isOrg(form.providerType) ? form.orgName : `${form.firstName} ${form.lastName}`} — {pidRef.current}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground font-medium">Review & Confirm</p>
                    <div className="bg-muted/40 rounded-xl p-4 space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-700 font-bold text-base">
                          {isOrg(form.providerType)
                            ? (form.orgName.charAt(0) || "O")
                            : (form.firstName.charAt(0) + form.lastName.charAt(0))}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">
                            {isOrg(form.providerType) ? form.orgName : `${form.firstName} ${form.lastName}`}
                          </p>
                          <p className="text-xs text-muted-foreground">{form.suburb} · {pidRef.current}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs pt-1 border-t border-border">
                        <Row label="Type" val={form.providerType || "—"} />
                        <Row label="Tier" val={form.tier || "General"} />
                        {form.profession && <Row label="Specialisation" val={form.profession} />}
                        {form.contactPerson && <Row label="Contact" val={form.contactPerson} />}
                        {form.staffCount && <Row label="Staff" val={form.staffCount} />}
                        <Row label="Response" val={`${form.responseTime} ${form.providerType === "Plan Manager" ? "days avg" : "min avg"}`} />
                        {form.skills.length > 0 && (
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Services: </span>
                            <span className="font-medium text-foreground">{form.skills.slice(0, 4).join(", ")}{form.skills.length > 4 ? ` +${form.skills.length - 4}` : ""}</span>
                          </div>
                        )}
                        {form.days.length > 0 && (
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Available: </span>
                            <span className="font-medium text-foreground">{form.days.map(d => d.slice(0, 3)).join(", ")}</span>
                          </div>
                        )}
                      </div>
                    </div>
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
              {STEPS.map((_, i) => <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === step ? "bg-violet-600 w-4" : i < step ? "bg-violet-400" : "bg-border"}`} />)}
            </div>
            {step < STEPS.length - 1 ? (
              <Button size="sm" onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="gap-1 bg-violet-600 hover:bg-violet-700">
                Next <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            ) : (
              <Button size="sm" onClick={handleConfirm} className="gap-1 bg-violet-600 hover:bg-violet-700">
                <Check className="w-3.5 h-3.5" /> Register Provider
              </Button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

function Row({ label, val }: { label: string; val: string }) {
  return (
    <div>
      <span className="text-muted-foreground">{label}: </span>
      <span className="font-medium text-foreground">{val}</span>
    </div>
  );
}
