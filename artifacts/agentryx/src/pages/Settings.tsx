import { useState } from "react";
import { Settings as SettingsIcon, Zap, Bell, Palette, Key, Users, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "@/contexts/ThemeContext";

const automationLevels = [
  { value: "manual", label: "Manual", desc: "Top 3–5 matches surfaced in Ops Console. Staff picks. System handles all downstream automation." },
  { value: "assisted", label: "Assisted", desc: "Top 1 match surfaced with one-click approve. Staff approves, system contacts and books." },
  { value: "auto_review", label: "Auto with Review", desc: "If confidence ≥ threshold: auto-book. Below threshold: route to console for human review." },
  { value: "full_auto", label: "Full Auto", desc: "Always auto-book. Console handles exceptions and overrides only. High-volume operators." },
];

const teamMembers = [
  { name: "Jamie Torres", email: "j.torres@harbourcare.com.au", role: "Operations Manager", initials: "JT", active: true },
  { name: "Helen Marsh", email: "h.marsh@harbourcare.com.au", role: "Support Coordinator", initials: "HM", active: true },
  { name: "Ryan Lee", email: "r.lee@harbourcare.com.au", role: "Support Coordinator", initials: "RL", active: true },
  { name: "Karen Booth", email: "k.booth@harbourcare.com.au", role: "Support Coordinator", initials: "KB", active: true },
  { name: "Lisa Nguyen", email: "l.nguyen@harbourcare.com.au", role: "Plan Manager", initials: "LN", active: true },
  { name: "Sarah Mitchell", email: "s.mitchell@harbourcare.com.au", role: "Claims Officer", initials: "SM", active: false },
];

const apiKeys = [
  { name: "Platform API Key", value: "axk_prod_8f2k••••••••••••••••••••••••••••••••••3x9z", active: true },
  { name: "Webhook Secret", value: "whsec_7d1m••••••••••••••••••••••••••••••••2q8p", active: true },
];

const roleColors: Record<string, string> = {
  "Operations Manager": "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400",
  "Support Coordinator": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  "Plan Manager": "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
  "Claims Officer": "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
};

export default function Settings() {
  const [automationLevel, setAutomationLevel] = useState("assisted");
  const [confidenceThreshold, setConfidenceThreshold] = useState([0.75]);
  const [notifications, setNotifications] = useState({
    sms: true, email: true, push: true, voice: false,
    newRequest: true, matchReady: true, bookingConfirmed: true,
    claimSettled: true, complianceAlert: true,
  });
  const [savedMsg, setSavedMsg] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleSave = () => {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" /> Settings
          </h1>
          <p className="text-sm text-muted-foreground">Harbour Care Services · Tenant configuration</p>
        </div>
        <Button size="sm" onClick={handleSave} data-testid="btn-save-settings">
          <Save className="w-4 h-4 mr-1.5" />
          {savedMsg ? "Saved!" : "Save Changes"}
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Automation */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Automation Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2 block">Automation Level</Label>
              <Select value={automationLevel} onValueChange={setAutomationLevel}>
                <SelectTrigger data-testid="automation-level-select"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {automationLevels.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2 p-2.5 bg-muted/40 rounded">
                {automationLevels.find(l => l.value === automationLevel)?.desc}
              </p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Confidence Threshold</Label>
                <span className="text-sm font-bold text-primary">{confidenceThreshold[0].toFixed(2)}</span>
              </div>
              <Slider
                data-testid="confidence-threshold-slider"
                value={confidenceThreshold}
                onValueChange={setConfidenceThreshold}
                min={0} max={1} step={0.01}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>0.0 — permissive</span><span>Default: 0.75</span><span>1.0 — strict</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Matches below this threshold are routed to human review regardless of automation level.</p>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" /> Notification Channels
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Channels</div>
              <div className="space-y-3">
                {[
                  { key: "sms", label: "SMS (Twilio)", desc: "Booking confirmations, reminders, urgent alerts" },
                  { key: "email", label: "Email (SendGrid)", desc: "Detailed reports, service agreements, claim updates" },
                  { key: "push", label: "Push Notifications (FCM)", desc: "Real-time alerts on mobile apps" },
                  { key: "voice", label: "Voice Outbound (Twilio)", desc: "Automated voice calls for high-urgency alerts" },
                ].map(n => (
                  <div key={n.key} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-foreground">{n.label}</div>
                      <div className="text-xs text-muted-foreground">{n.desc}</div>
                    </div>
                    <Switch
                      data-testid={`notif-channel-${n.key}`}
                      checked={notifications[n.key as keyof typeof notifications] as boolean}
                      onCheckedChange={(v) => setNotifications(prev => ({ ...prev, [n.key]: v }))}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Events</div>
              <div className="space-y-2.5">
                {[
                  { key: "newRequest", label: "New Request Created" },
                  { key: "matchReady", label: "Match Results Ready" },
                  { key: "bookingConfirmed", label: "Booking Confirmed" },
                  { key: "claimSettled", label: "Claim Settled" },
                  { key: "complianceAlert", label: "Compliance Alert" },
                ].map(e => (
                  <div key={e.key} className="flex items-center justify-between">
                    <span className="text-sm text-foreground">{e.label}</span>
                    <Switch
                      data-testid={`notif-event-${e.key}`}
                      checked={notifications[e.key as keyof typeof notifications] as boolean}
                      onCheckedChange={(v) => setNotifications(prev => ({ ...prev, [e.key]: v }))}
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Palette className="w-4 h-4 text-primary" /> Branding & Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2 block">Tenant Name</Label>
              <Input data-testid="input-tenant-name" defaultValue="Harbour Care Services" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2 block">Subdomain</Label>
              <div className="flex items-center gap-0">
                <Input data-testid="input-subdomain" defaultValue="harbourcare" className="rounded-r-none" />
                <span className="border border-l-0 border-border bg-muted px-3 py-2 text-xs text-muted-foreground rounded-r-md">.agentryx.com.au</span>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2 block">Interface Theme</Label>
              <div className="flex gap-2">
                {[
                  { value: "light", label: "Light" },
                  { value: "dark", label: "Dark" },
                  { value: "ocean", label: "Ocean" },
                ].map(t => (
                  <button
                    key={t.value}
                    data-testid={`theme-btn-${t.value}`}
                    onClick={() => setTheme(t.value as "light" | "dark" | "ocean")}
                    className={`flex-1 py-2 text-xs font-medium rounded-md border transition-colors ${theme === t.value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-2 block">Logo Upload</Label>
              <div className="border border-dashed border-border rounded-lg p-4 text-center text-xs text-muted-foreground hover:bg-muted/40 cursor-pointer transition-colors" data-testid="logo-upload-area">
                Drop logo here or click to upload (PNG, SVG — max 2 MB)
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" /> API Credentials
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {apiKeys.map((k) => (
              <div key={k.name} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground font-medium">{k.name}</Label>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 px-1.5 py-0.5 rounded font-medium">Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <Input data-testid={`api-key-${k.name.replace(/\s+/g, "-").toLowerCase()}`} value={k.value} readOnly className="font-mono text-xs" />
                  <Button size="sm" variant="outline" className="flex-shrink-0" data-testid={`btn-copy-${k.name.replace(/\s+/g, "-").toLowerCase()}`}>Copy</Button>
                </div>
              </div>
            ))}
            <Button size="sm" variant="outline" className="w-full" data-testid="btn-generate-api-key">
              Generate New API Key
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Team members */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> Team Members
            </CardTitle>
            <Button size="sm" variant="outline" data-testid="btn-invite-member">Invite Member</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {teamMembers.map((m) => (
              <div key={m.email} className="flex items-center gap-4 px-4 py-3" data-testid={`team-member-${m.email}`}>
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">{m.initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{m.name}</span>
                    {!m.active && <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded">Inactive</span>}
                  </div>
                  <div className="text-xs text-muted-foreground">{m.email}</div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${roleColors[m.role]}`}>{m.role}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
