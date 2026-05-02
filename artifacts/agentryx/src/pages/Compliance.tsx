import { useState } from "react";
import { ShieldCheck, AlertTriangle, AlertCircle, Clock, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const screeningChecks = [
  { provider: "Maria Santos", check_type: "NDIS Worker Screening", issued: "14 Jun 2023", expiry: "14 Jun 2027", status: "Current", days_remaining: 408 },
  { provider: "James O'Brien", check_type: "NDIS Worker Screening", issued: "3 Feb 2024", expiry: "3 Feb 2026", status: "Expiring", days_remaining: 276 },
  { provider: "Priya Sharma", check_type: "NDIS Worker Screening", issued: "22 Sep 2022", expiry: "22 Sep 2026", status: "Current", days_remaining: 508 },
  { provider: "Carlos Mendez", check_type: "NDIS Worker Screening", issued: "11 Nov 2023", expiry: "11 Nov 2025", status: "Expiring", days_remaining: 193 },
  { provider: "Emma Thornton", check_type: "NDIS Worker Screening", issued: "7 Jan 2021", expiry: "7 Jan 2025", status: "Expired", days_remaining: -118 },
  { provider: "Wei Zhang", check_type: "NDIS Worker Screening", issued: "30 Mar 2023", expiry: "30 Mar 2027", status: "Current", days_remaining: 332 },
  { provider: "Amara Diallo", check_type: "NDIS Worker Screening", issued: "19 Jul 2022", expiry: "19 Jul 2026", status: "Current", days_remaining: 443 },
  { provider: "Nathan Clarke", check_type: "NDIS Worker Screening", issued: "5 Oct 2023", expiry: "5 Oct 2027", status: "Current", days_remaining: 521 },
  { provider: "Fatima Al-Hassan", check_type: "NDIS Worker Screening", issued: "28 Apr 2022", expiry: "28 Apr 2026", status: "Current", days_remaining: 361 },
  { provider: "Daniel Kim", check_type: "NDIS Worker Screening", issued: "12 Dec 2020", expiry: "12 Dec 2024", status: "Expired", days_remaining: -142 },
  { provider: "Sophie Laurent", check_type: "NDIS Worker Screening", issued: "1 Aug 2023", expiry: "1 Aug 2025", status: "Expiring", days_remaining: 91 },
  { provider: "Thomas Nkosi", check_type: "NDIS Worker Screening", issued: "17 Feb 2022", expiry: "17 Feb 2026", status: "Current", days_remaining: 291 },
  { provider: "Isabella Cruz", check_type: "NDIS Worker Screening", issued: "9 Jun 2023", expiry: "9 Jun 2027", status: "Current", days_remaining: 403 },
  { provider: "Marcus Webb", check_type: "NDIS Worker Screening", issued: "21 Mar 2022", expiry: "21 Mar 2025", status: "Expiring", days_remaining: 47 },
];

const incidents = [
  { id: "INC-0042", booking: "BKG-1018", participant: "Sarah Williams", provider: "Priya Sharma", type: "Near Miss", severity: "Low", reported: "1 May 2026", status: "Under Review", commission_ref: null },
  { id: "INC-0041", booking: "BKG-0987", participant: "Robert Kirby", provider: "Thomas Nkosi", type: "Behaviour Incident", severity: "Medium", reported: "28 Apr 2026", status: "Open", commission_ref: null },
  { id: "INC-0040", booking: "BKG-0952", participant: "Tom Eriksen", provider: "Nathan Clarke", type: "Fall", severity: "High", reported: "22 Apr 2026", status: "Resolved", commission_ref: "NQS-2026-0440" },
  { id: "INC-0039", booking: "BKG-0921", participant: "Carlos Rivera", provider: "Thomas Nkosi", type: "Medication Error", severity: "Critical", reported: "15 Apr 2026", status: "Reported to Commission", commission_ref: "NQS-2026-0398" },
  { id: "INC-0038", booking: "BKG-0904", participant: "Linda Zhao", provider: "Wei Zhang", type: "Property Damage", severity: "Low", reported: "10 Apr 2026", status: "Resolved", commission_ref: null },
];

const statusColors: Record<string, string> = {
  Current: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  Expiring: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  Expired: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const severityColors: Record<string, string> = {
  Low: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  Medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  High: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  Critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const incidentStatusColors: Record<string, string> = {
  Open: "bg-amber-100 text-amber-800",
  "Under Review": "bg-blue-100 text-blue-800",
  Resolved: "bg-emerald-100 text-emerald-800",
  "Reported to Commission": "bg-red-100 text-red-800",
};

export default function Compliance() {
  const current = screeningChecks.filter(c => c.status === "Current").length;
  const expiring = screeningChecks.filter(c => c.status === "Expiring").length;
  const expired = screeningChecks.filter(c => c.status === "Expired").length;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Compliance</h1>
        <p className="text-sm text-muted-foreground">Worker screening, certifications, and incident monitoring</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="text-xs text-muted-foreground">Current</span>
            </div>
            <div className="text-2xl font-bold text-emerald-600">{current}</div>
            <div className="text-xs text-muted-foreground">providers compliant</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-muted-foreground">Expiring Soon</span>
            </div>
            <div className="text-2xl font-bold text-amber-500">{expiring}</div>
            <div className="text-xs text-muted-foreground">within 6 months</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-4 h-4 text-red-600" />
              <span className="text-xs text-muted-foreground">Expired</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{expired}</div>
            <div className="text-xs text-muted-foreground">action required</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-muted-foreground">Open Incidents</span>
            </div>
            <div className="text-2xl font-bold text-orange-500">{incidents.filter(i => i.status !== "Resolved").length}</div>
            <div className="text-xs text-muted-foreground">{incidents.filter(i => i.severity === "Critical" || i.severity === "High").length} high/critical</div>
          </CardContent>
        </Card>
      </div>

      {/* Screening table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Worker Screening Checks
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Provider</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Check Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Issued</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Expiry</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Days Remaining</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {screeningChecks.sort((a, b) => a.days_remaining - b.days_remaining).map((c, i) => (
                  <tr key={i} className={`hover:bg-muted/30 transition-colors ${c.status === "Expired" ? "bg-red-50/50 dark:bg-red-900/10" : ""}`} data-testid={`screening-row-${i}`}>
                    <td className="px-4 py-3 font-medium text-foreground">{c.provider}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{c.check_type}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{c.issued}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{c.expiry}</td>
                    <td className="px-4 py-3">
                      {c.days_remaining < 0 ? (
                        <span className="text-xs text-red-600 font-semibold">{Math.abs(c.days_remaining)} days overdue</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Progress
                            value={Math.min(100, (c.days_remaining / 1460) * 100)}
                            className="h-1.5 w-20"
                          />
                          <span className={`text-xs font-medium ${c.days_remaining < 90 ? "text-red-600" : c.days_remaining < 180 ? "text-amber-600" : "text-muted-foreground"}`}>
                            {c.days_remaining}d
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[c.status]}`}>{c.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Incidents */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-500" /> Incident Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Incident ID</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Participant</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Provider</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Severity</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Reported</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Commission Ref</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-muted/30 transition-colors" data-testid={`incident-row-${inc.id}`}>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{inc.id}</td>
                    <td className="px-4 py-3 font-medium text-foreground text-xs">{inc.participant}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{inc.provider}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{inc.type}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${severityColors[inc.severity]}`}>{inc.severity}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{inc.reported}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{inc.commission_ref || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${incidentStatusColors[inc.status]}`}>{inc.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
