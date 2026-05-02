import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronRight, ChevronLeft, Check, User, Briefcase, Calendar, Sparkles,
  Phone, Mail, MapPin, Shield, Star, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  open: boolean;
  onClose: () => void;
  onComplete: (provider: any) => void;
}

const STEPS = [
  { label: "Personal Details", icon: User },
  { label: "Credentials", icon: Shield },
  { label: "Services", icon: Briefcase },
  { label: "Confirm", icon: Sparkles },
];

const ALL_SKILLS = [
  "Personal Care", "Community Access", "Domestic Assistance",
  "Therapy Support", "Behaviour Support", "Transport",
  "Social Support", "Meal Preparation", "Complex Care",
  "Nursing", "Mental Health", "Manual Handling",
  "CALD Support", "First Aid",
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type FormData = {
  firstName: string;
  lastName: string;
  suburb: string;
  phone: string;
  email: string;
  abn: string;
  tier: string;
  ndisReg: string;
  policeCheck: string;
  wwcCheck: string;
  firstAid: string;
  skills: string[];
  days: string[];
  maxHours: string;
  responseTime: string;
  notes: string;
};

const emptyForm: FormData = {
  firstName: "", lastName: "", suburb: "", phone: "", email: "", abn: "",
  tier: "", ndisReg: "", policeCheck: "", wwcCheck: "", firstAid: "",
  skills: [], days: [], maxHours: "40", responseTime: "30",
  notes: "",
};

export default function AddProviderWizard({ open, onClose, onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [confirmed, setConfirmed] = useState(false);
  const pidRef = useRef(`PR${String(Math.floor(Math.random() * 900) + 100).padStart(3, "0")}`);

  const update = (k: keyof FormData, v: any) => setForm(f => ({ ...f, [k]: v }));

  const toggleArr = (k: "skills" | "days", val: string) =>
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
        tier: form.tier || "General",
        skills: form.skills.length > 0 ? form.skills : ["Personal Care"],
        rating: 4.5,
        reliability: 90,
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
    if (step === 0) return form.firstName.trim() && form.lastName.trim() && form.suburb.trim();
    if (step === 1) return form.tier && form.policeCheck;
    if (step === 2) return form.skills.length > 0;
    return true;
  };

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
        <div className="bg-gradient-to-r from-violet-600 to-blue-600 p-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold">Add Provider</h2>
              <p className="text-sm text-violet-100">Register a new support worker or care agency</p>
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
        <div className="p-5 max-h-[55vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <p className="text-sm text-muted-foreground font-medium">Personal Details</p>
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
                <div className="space-y-1.5">
                  <Label className="text-xs">Suburb *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input className="pl-8 h-9 text-sm" placeholder="e.g. Newtown NSW 2042" value={form.suburb} onChange={e => update("suburb", e.target.value)} />
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
                      <Input className="pl-8 h-9 text-sm" placeholder="alex@example.com" value={form.email} onChange={e => update("email", e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">ABN (optional)</Label>
                  <Input className="h-9 text-sm font-mono" placeholder="12 345 678 901" value={form.abn} onChange={e => update("abn", e.target.value)} />
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <p className="text-sm text-muted-foreground font-medium">Credentials & Screening</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1"><Star className="w-3 h-3" /> Provider Tier *</Label>
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

                <div className="bg-muted/40 rounded-xl p-4 space-y-3">
                  <p className="text-xs font-semibold text-foreground flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-violet-600" /> Screening Checks</p>
                  <div className="space-y-2.5">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Police Check Date *</Label>
                      <div className="relative">
                        <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <Input className="pl-8 h-9 text-sm" type="date" value={form.policeCheck} onChange={e => update("policeCheck", e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Working with Children</Label>
                        <Input className="h-9 text-sm font-mono" placeholder="WWC number" value={form.wwcCheck} onChange={e => update("wwcCheck", e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">First Aid Expiry</Label>
                        <Input className="h-9 text-sm" type="date" value={form.firstAid} onChange={e => update("firstAid", e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <p className="text-sm text-muted-foreground font-medium">Services & Availability</p>
                <div>
                  <Label className="text-xs mb-2 block">Skills / Services Offered *</Label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_SKILLS.map(s => (
                      <button
                        key={s}
                        onClick={() => toggleArr("skills", s)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all font-medium ${
                          form.skills.includes(s)
                            ? "bg-violet-600 text-white border-violet-600"
                            : "border-border text-muted-foreground hover:border-violet-400 hover:text-foreground"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-xs mb-2 block">Available Days</Label>
                  <div className="flex flex-wrap gap-2">
                    {DAYS.map(d => (
                      <button
                        key={d}
                        onClick={() => toggleArr("days", d)}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-all font-medium ${
                          form.days.includes(d)
                            ? "bg-blue-600 text-white border-blue-600"
                            : "border-border text-muted-foreground hover:border-blue-400 hover:text-foreground"
                        }`}
                      >
                        {d.slice(0, 3)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> Max Hours/Week</Label>
                    <Input className="h-9 text-sm" type="number" min="1" max="60" value={form.maxHours} onChange={e => update("maxHours", e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> Avg Response Time (min)</Label>
                    <Input className="h-9 text-sm" type="number" min="5" max="120" value={form.responseTime} onChange={e => update("responseTime", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Additional Notes</Label>
                  <textarea
                    className="w-full text-sm border border-border rounded-lg px-3 py-2 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    rows={3}
                    placeholder="Languages spoken, specialisations, equipment owned..."
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
                      className="w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center"
                    >
                      <Check className="w-8 h-8 text-violet-600" />
                    </motion.div>
                    <div className="text-center">
                      <p className="font-bold text-foreground">Provider Registered!</p>
                      <p className="text-sm text-muted-foreground mt-1">{form.firstName} {form.lastName} — {pidRef.current}</p>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground font-medium">Review & Confirm</p>
                    <div className="bg-muted/40 rounded-xl p-4 space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-700 font-bold text-base">
                          {form.firstName.charAt(0)}{form.lastName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{form.firstName} {form.lastName}</p>
                          <p className="text-xs text-muted-foreground">{form.suburb} · {pidRef.current}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs pt-1 border-t border-border">
                        <Row label="Tier" val={form.tier || "General"} />
                        <Row label="Response Time" val={`${form.responseTime} min avg`} />
                        <Row label="Max Hours/Wk" val={form.maxHours} />
                        <Row label="Police Check" val={form.policeCheck || "Provided"} />
                        {form.skills.length > 0 && (
                          <div className="col-span-2">
                            <span className="text-muted-foreground">Skills: </span>
                            <span className="font-medium text-foreground">{form.skills.slice(0, 5).join(", ")}{form.skills.length > 5 ? ` +${form.skills.length - 5}` : ""}</span>
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
            {step < 3 ? (
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
