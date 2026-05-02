import { useState } from "react";
import { BarChart3, Download, TrendingUp } from "lucide-react";
import { AIBadge, AISparkle } from "@/components/AIBadge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const bookingVolume = [
  { month: "Jun 25", bookings: 128 }, { month: "Jul", bookings: 135 },
  { month: "Aug", bookings: 142 }, { month: "Sep", bookings: 151 },
  { month: "Oct", bookings: 158 }, { month: "Nov", bookings: 163 },
  { month: "Dec", bookings: 148 }, { month: "Jan 26", bookings: 162 },
  { month: "Feb", bookings: 155 }, { month: "Mar", bookings: 178 },
  { month: "Apr", bookings: 191 }, { month: "May", bookings: 203 },
];

const revenueByCategory = [
  { name: "Core Supports", value: 218400, color: "#6366f1" },
  { name: "Capacity Building", value: 87200, color: "#22c55e" },
  { name: "Capital", value: 31600, color: "#f59e0b" },
];

const providerPerformance = [
  { name: "M. Santos", rating: 4.9, bookings: 347 },
  { name: "F. Al-Hassan", rating: 4.9, bookings: 521 },
  { name: "P. Sharma", rating: 4.8, bookings: 412 },
  { name: "T. Nkosi", rating: 4.8, bookings: 267 },
  { name: "W. Zhang", rating: 4.8, bookings: 289 },
  { name: "J. O'Brien", rating: 4.7, bookings: 218 },
];

const budgetUtilisation = [
  { participant: "T. Eriksen", core: 87, capacity: 72, capital: 45 },
  { participant: "C. Rivera", core: 65, capacity: 58, capital: 32 },
  { participant: "R. Kirby", core: 71, capacity: 62, capital: 28 },
  { participant: "M. Chen", core: 68, capacity: 53, capital: 34 },
  { participant: "D. Okonkwo", core: 42, capacity: 47, capital: 30 },
];

const matchingAccuracy = [
  { month: "Dec", confidence: 0.71 }, { month: "Jan", confidence: 0.73 },
  { month: "Feb", confidence: 0.75 }, { month: "Mar", confidence: 0.76 },
  { month: "Apr", confidence: 0.78 }, { month: "May", confidence: 0.81 },
];

const claimsSettlement = [
  { name: "Settled", value: 68, color: "#6366f1" },
  { name: "Accepted", value: 12, color: "#22c55e" },
  { name: "Submitted", value: 11, color: "#3b82f6" },
  { name: "Drafted", value: 6, color: "#94a3b8" },
  { name: "Rejected", value: 3, color: "#ef4444" },
];

const automationEffectiveness = [
  { month: "Dec", auto: 58, human: 42 }, { month: "Jan", auto: 62, human: 38 },
  { month: "Feb", auto: 65, human: 35 }, { month: "Mar", auto: 67, human: 33 },
  { month: "Apr", auto: 69, human: 31 }, { month: "May", auto: 71, human: 29 },
];

const CHART_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6"];

export default function Reports() {
  const [period, setPeriod] = useState("12m");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground">Harbour Care Services · Simulated data</p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32" data-testid="period-select"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" variant="outline" data-testid="btn-export">
            <Download className="w-4 h-4 mr-1.5" /> Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Booking Volume Trend */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" /> Booking Volume (12 months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={bookingVolume}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="bookings" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} name="Bookings" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue by Category */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Revenue by Support Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={revenueByCategory} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" nameKey="name">
                  {revenueByCategory.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={{ fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Provider Performance */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Top Provider Performance</CardTitle>
            <CardDescription className="text-xs">By total bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={providerPerformance} layout="vertical" margin={{ left: 60, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={60} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Plan budget utilisation */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Plan Budget Utilisation</CardTitle>
            <CardDescription className="text-xs">Top 5 participants by budget</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={budgetUtilisation} layout="vertical" margin={{ left: 70, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" tickFormatter={v => `${v}%`} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis type="category" dataKey="participant" tick={{ fontSize: 10 }} width={70} stroke="hsl(var(--muted-foreground))" />
                <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ fontSize: 12 }} />
                <Legend iconSize={8} formatter={v => <span style={{ fontSize: 11 }}>{v}</span>} />
                <Bar dataKey="core" fill="#6366f1" name="Core Supports" stackId="a" />
                <Bar dataKey="capacity" fill="#22c55e" name="Capacity Building" stackId="a" />
                <Bar dataKey="capital" fill="#f59e0b" name="Capital" stackId="a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Matching accuracy */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <AISparkle className="w-4 h-4" tooltip="Bayesian confidence scores improve month-on-month as the engine learns from completed booking outcomes — a self-reinforcing accuracy loop." title="CareAffinity Confidence Trend" side="top" />
              CareAffinity Confidence Trend
            </CardTitle>
            <CardDescription className="text-xs">Average confidence score per month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={matchingAccuracy}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis domain={[0.6, 0.9]} tickFormatter={v => v.toFixed(2)} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip formatter={(v: number) => v.toFixed(2)} contentStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="confidence" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} name="Avg Confidence" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Claims settlement */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Claims Settlement Rate</CardTitle>
            <CardDescription className="text-xs">By status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={claimsSettlement} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value">
                  {claimsSettlement.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ fontSize: 11 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Automation effectiveness */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <AISparkle className="w-4 h-4" tooltip="AI auto-approves matches when confidence exceeds the agency threshold — replacing manual ops decisions that averaged 45 minutes. Rate has grown from 58% to 71% in 6 months." title="Automation Effectiveness" side="top" />
            Automation Effectiveness
            <AIBadge label="71% today" size="sm" />
          </CardTitle>
          <CardDescription className="text-xs">Auto-approved vs human-reviewed matches (%)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={automationEffectiveness}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tickFormatter={v => `${v}%`} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ fontSize: 12 }} />
              <Legend iconSize={8} formatter={v => <span style={{ fontSize: 11 }}>{v}</span>} />
              <Bar dataKey="auto" fill="#6366f1" name="Auto-approved" stackId="a" />
              <Bar dataKey="human" fill="#e2e8f0" name="Human-reviewed" stackId="a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
