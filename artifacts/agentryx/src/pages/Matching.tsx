import { useState, useEffect } from "react";
import { Play, ChevronRight, Info, TrendingUp, ArrowUp, ArrowDown, Minus, SkipForward, Gauge } from "lucide-react";
import { CareAffinityIcon } from "@/components/CareAffinityIcon";
import { AIBadge, AISparkle } from "@/components/AIBadge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const pipelineStages = [
  { id: 1, name: "Intake Normalisation", shortDesc: "Parse & canonicalise", desc: "Convert request to canonical match query (location, service category, schedule, urgency, accessibility, language, gender preference).", icon: "01",
    active: { border: "border-blue-400", bg: "bg-blue-50 dark:bg-blue-900/20", badge: "bg-blue-500 text-white", text: "text-blue-700 dark:text-blue-300", dot: "bg-blue-500" },
  },
  { id: 2, name: "Hard Filters", shortDesc: "Eliminate non-matches", desc: "Eliminate providers that don't meet mandatory criteria: NDIS registration tier, worker screening status, availability, radius, language, gender preference.", icon: "02", filtered: 71,
    active: { border: "border-violet-400", bg: "bg-violet-50 dark:bg-violet-900/20", badge: "bg-violet-500 text-white", text: "text-violet-700 dark:text-violet-300", dot: "bg-violet-500" },
  },
  { id: 3, name: "Feature Extraction", shortDesc: "Score 8 raw features", desc: "For each candidate: distance, skill match score, availability fit, price vs. reasonable rate, rating, reliability, response speed, repeat-with-participant signal, cultural fit.", icon: "03",
    active: { border: "border-teal-400", bg: "bg-teal-50 dark:bg-teal-900/20", badge: "bg-teal-500 text-white", text: "text-teal-700 dark:text-teal-300", dot: "bg-teal-500" },
  },
  { id: 4, name: "Scoring", shortDesc: "Apply weight vector", desc: "Apply tenant weight vector to normalised features. Output: Score = Σ(Wᵢ × Fᵢ). Weights are tenant-configurable below.", icon: "04",
    active: { border: "border-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", badge: "bg-amber-500 text-white", text: "text-amber-700 dark:text-amber-300", dot: "bg-amber-500" },
  },
  { id: 5, name: "Confidence Score", shortDesc: "Calibrate certainty", desc: "Weighted blend of: data completeness (25%), score gap to runner-up (30%), historical accuracy (30%), provider freshness (15%).", icon: "05",
    active: { border: "border-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20", badge: "bg-orange-500 text-white", text: "text-orange-700 dark:text-orange-300", dot: "bg-orange-500" },
  },
  { id: 6, name: "Explainability", shortDesc: "Generate rationale", desc: "Generate human-readable rationale per candidate using templated explainer with feature values. Required for every match — no unexplained result.", icon: "06",
    active: { border: "border-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", badge: "bg-emerald-500 text-white", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
  },
];

const STAGE_AI_TOOLTIPS: (string | null)[] = [
  null,
  null,
  "AI scores 8 raw features per candidate: proximity, skill match, availability fit, pricing alignment, participant rating, reliability index, response speed, and prior engagement signal — creating a multi-dimensional fingerprint for each provider.",
  "Weighted vector scoring (Σ Wᵢ × Fᵢ) applies trained importance weights to each feature. Weights are refined continuously on 12,000+ completed NDIS bookings — amplifying what actually predicts great care outcomes.",
  "Bayesian calibration converts raw scores into true probability estimates. '91% confidence' is genuinely 91% certainty of a good match — not just a relative ranking — so every auto-approval clears a real statistical bar.",
  "SHAP value analysis generates a plain-English rationale for every AI decision. Any match can be fully explained to participants, providers, families, or NDIS Quality & Safeguards Commission auditors.",
];

const matchResults = [
  { rank: 1, provider: "Maria Santos", score: 92, confidence: 0.91, distance: "3.2 km", rating: 4.9, bookings: 47, response_time: "18 min", rationale: "3.2 km from participant, available within 2 hours, 4.9★ from 47 bookings, 12 successful sessions with similar participants, has Mental Health First Aid certification, female (matches participant preference).", features: { distance: 95, skill_match: 100, availability: 90, price: 85, rating: 98, reliability: 97, response_speed: 88, repeat_signal: 92 } },
  { rank: 2, provider: "Fatima Al-Hassan", score: 85, confidence: 0.82, distance: "5.1 km", rating: 4.9, bookings: 121, response_time: "10 min", rationale: "5.1 km from participant, highly reliable (98%), 4.9★ from 121 bookings, cultural and language match, complex care experience.", features: { distance: 78, skill_match: 95, availability: 88, price: 85, rating: 98, reliability: 98, response_speed: 95, repeat_signal: 60 } },
  { rank: 3, provider: "Sophie Laurent", score: 76, confidence: 0.68, distance: "4.7 km", rating: 4.7, bookings: 38, response_time: "28 min", rationale: "4.7 km from participant, available in schedule window, 4.7★ rating, certified in manual handling, female worker.", features: { distance: 82, skill_match: 80, availability: 75, price: 90, rating: 94, reliability: 94, response_speed: 72, repeat_signal: 20 } },
  { rank: 4, provider: "Emma Thornton", score: 61, confidence: 0.54, distance: "2.8 km", rating: 4.3, bookings: 12, response_time: "55 min", rationale: "2.8 km from participant (closest), but limited experience, slower response, screening expiring soon.", features: { distance: 98, skill_match: 70, availability: 65, price: 88, rating: 86, reliability: 85, response_speed: 50, repeat_signal: 0 } },
  { rank: 5, provider: "Isabella Cruz", score: 58, confidence: 0.49, distance: "9.3 km", rating: 4.5, bookings: 47, response_time: "35 min", rationale: "9.3 km from participant, limited availability in window, no prior experience with this participant type.", features: { distance: 55, skill_match: 72, availability: 60, price: 86, rating: 90, reliability: 90, response_speed: 68, repeat_signal: 0 } },
];

// Score at each pipeline stage per provider (index matches matchResults order)
// Emma (idx 3) leads at stage 1 due to proximity — then Maria overtakes from stage 2 onward
const STAGE_SCORES: number[][] = [
  [0,  0,  0,  0,  0],   // 0: Intake — normalising, no scores yet
  [18, 15, 14, 22,  8],  // 1: Hard Filters — Emma leads! (2.8 km closest)
  [45, 39, 34, 30, 25],  // 2: Feature Extraction — Maria overtakes on skills + availability
  [72, 64, 55, 44, 38],  // 3: Scoring — weights applied, gap widens
  [83, 76, 68, 53, 48],  // 4: Confidence Score — near final
  [92, 85, 76, 61, 58],  // 5: Explainability — final scores locked
];

const STAGE_INSIGHT: (string | null)[] = [
  null,
  "Proximity-driven — Emma Thornton leads at 2.8 km closest to participant",
  "🔄 Maria Santos overtakes — superior skill match & availability fit",
  "Gap widens — weight vector amplifies Maria's multi-factor advantage",
  "Confidence scores calculated — gap to runner-up boosts Maria's confidence",
  "Rankings locked — explainability rationales generated for all 5 matches",
];

const weights = [
  { key: "distance", label: "Proximity", value: 20 },
  { key: "skill_match", label: "Skill Match", value: 25 },
  { key: "availability", label: "Availability Fit", value: 15 },
  { key: "price", label: "Price vs Rate", value: 10 },
  { key: "rating", label: "Participant Rating", value: 15 },
  { key: "reliability", label: "Reliability", value: 10 },
  { key: "response_speed", label: "Response Speed", value: 3 },
  { key: "repeat_signal", label: "Repeat Signal", value: 2 },
];

const automationLevels = [
  { value: "manual", label: "Manual", desc: "Top 3-5 surfaced in Ops Console. Staff picks." },
  { value: "assisted", label: "Assisted", desc: "Top 1 surfaced with one-click approve. Staff approves." },
  { value: "auto_review", label: "Auto with Review", desc: "If confidence ≥ threshold: auto-book. Else: route to console." },
  { value: "full_auto", label: "Full Auto", desc: "Always auto-book. Console handles exceptions only." },
];

type SimSpeed = "slow" | "normal" | "fast" | "step";

const SPEEDS: Record<SimSpeed, { label: string; ms: number; desc: string }> = {
  slow:   { label: "0.5×", ms: 1800, desc: "Slow — 1 stage every 1.8 s" },
  normal: { label: "1×",   ms: 900,  desc: "Normal — 1 stage every 0.9 s" },
  fast:   { label: "2×",   ms: 400,  desc: "Fast — 1 stage every 0.4 s" },
  step:   { label: "Step", ms: 0,    desc: "Step — advance one stage at a time manually" },
};

export default function Matching() {
  const [activeStage, setActiveStage] = useState(0);
  const [running, setRunning] = useState(false);
  const [simStarted, setSimStarted] = useState(false);
  const [speed, setSpeed] = useState<SimSpeed>("normal");
  const [liveScores, setLiveScores] = useState(STAGE_SCORES[0]);
  const [automationLevel, setAutomationLevel] = useState("assisted");
  const [confidenceThreshold, setConfidenceThreshold] = useState([0.75]);
  const [providerPool] = useState(89);

  // Sync live scores whenever stage changes
  useEffect(() => {
    setLiveScores(STAGE_SCORES[Math.min(activeStage, 5)]);
  }, [activeStage]);

  // Auto-advance interval — disabled in step mode
  useEffect(() => {
    if (!running || speed === "step") return;
    const interval = setInterval(() => {
      setActiveStage(prev => {
        if (prev >= 5) { setRunning(false); return prev; }
        return prev + 1;
      });
    }, SPEEDS[speed].ms);
    return () => clearInterval(interval);
  }, [running, speed]);

  const runSimulation = () => {
    setActiveStage(0);
    setLiveScores(STAGE_SCORES[0]);
    setRunning(true);
    setSimStarted(true);
  };

  const resetSimulation = () => {
    setActiveStage(0);
    setLiveScores(STAGE_SCORES[0]);
    setRunning(false);
    setSimStarted(false);
  };

  // Step mode: advance one stage at a time
  const stepForward = () => {
    setActiveStage(prev => {
      if (prev >= 5) { setRunning(false); return prev; }
      const next = prev + 1;
      if (next >= 5) setRunning(false);
      return next;
    });
  };

  const isStepMode = speed === "step";
  const canStep = isStepMode && simStarted && activeStage < 5;

  const afterFilter = providerPool - pipelineStages[1].filtered!;

  // Build leaderboard sorted by current score
  const leaderboard = matchResults
    .map((m, i) => ({ ...m, currentScore: liveScores[i] }))
    .sort((a, b) => b.currentScore - a.currentScore)
    .map((m, i) => ({ ...m, currentRank: i + 1 }));

  const prevRankOf = (name: string) => {
    if (activeStage < 2) return null;
    const prevScores = STAGE_SCORES[Math.max(0, activeStage - 1)];
    const prevBoard = matchResults
      .map((m, i) => ({ name: m.provider, score: prevScores[i] }))
      .sort((a, b) => b.score - a.score);
    const prev = prevBoard.findIndex(p => p.name === name) + 1;
    return prev;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <CareAffinityIcon className="w-6 h-6" /> CareAffinity Engine
            <AIBadge size="md" tooltip="Multi-factor affinity scoring across 8 weighted dimensions — trained on 12,000+ successful NDIS bookings. Replaces manual ops matching that averaged 45 minutes per request with a 4-second AI decision." />
          </h1>
          <p className="text-sm text-muted-foreground">Participant–Provider Intelligence — Load-Bearing Component</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Speed segmented control */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden bg-muted/30">
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium px-2 border-r border-border">
              <Gauge className="w-3 h-3" /> Speed
            </span>
            {(["slow", "normal", "fast", "step"] as SimSpeed[]).map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                title={SPEEDS[s].desc}
                className={cn(
                  "text-xs px-2.5 py-1.5 font-semibold transition-colors border-r border-border last:border-r-0",
                  speed === s
                    ? s === "step"
                      ? "bg-violet-600 text-white"
                      : "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                )}
              >
                {SPEEDS[s].label}
              </button>
            ))}
          </div>

          <Button size="sm" variant="outline" onClick={resetSimulation} data-testid="btn-reset">Reset</Button>

          {/* Step mode: manual advance button */}
          {canStep && (
            <Button
              size="sm"
              variant="outline"
              onClick={stepForward}
              className="border-violet-300 text-violet-700 dark:border-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20"
              data-testid="btn-step-forward"
            >
              <SkipForward className="w-3.5 h-3.5 mr-1.5" /> Next Step
            </Button>
          )}

          <Button
            size="sm"
            onClick={runSimulation}
            disabled={running && !isStepMode}
            data-testid="btn-run-simulation"
          >
            <Play className="w-3.5 h-3.5 mr-1.5" />
            {running && !isStepMode ? "Running..." : "Run Simulation"}
          </Button>
        </div>
      </div>

      {/* Pipeline visualization */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">6-Stage Matching Pipeline</CardTitle>
              <CardDescription className="text-xs mt-0.5">REQ-2847 · Margaret Chen · Personal Care · Priority</CardDescription>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{Math.max(0, activeStage)} / 6 stages complete</span>
              {running && <span className="flex items-center gap-1 text-primary font-medium"><span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />Live</span>}
            </div>
          </div>
          {/* Progress track */}
          <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-teal-500 to-emerald-500"
              animate={{ width: `${(activeStage / 6) * 100}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Stage blocks — flex-1 so they fill full width equally */}
          <div className="flex gap-1.5 items-stretch">
            {pipelineStages.map((stage, i) => {
              const isActive = activeStage === i;
              const isDone = activeStage > i;
              const c = stage.active;
              return (
                <div key={stage.id} className="flex items-stretch gap-1.5 flex-1 min-w-0">
                  <motion.div
                    layout
                    onClick={() => setActiveStage(i)}
                    data-testid={`pipeline-stage-${i + 1}`}
                    animate={isActive ? { scale: 1.02 } : { scale: 1 }}
                    transition={{ type: "spring", damping: 20, stiffness: 300 }}
                    className={cn(
                      "flex-1 flex flex-col items-center px-2 py-4 rounded-xl border-2 cursor-pointer transition-colors duration-300 min-h-[140px]",
                      isActive && `${c.border} ${c.bg} shadow-md`,
                      isDone && "border-emerald-400 bg-emerald-50/60 dark:bg-emerald-900/10",
                      !isActive && !isDone && "border-border bg-card hover:border-muted-foreground/40 hover:bg-muted/30"
                    )}
                  >
                    {/* Stage number badge */}
                    <div className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold mb-3 transition-all duration-300 flex-shrink-0",
                      isDone ? "bg-emerald-500 text-white shadow-sm" :
                      isActive ? `${c.badge} shadow-md` :
                      "bg-muted text-muted-foreground"
                    )}>
                      {isDone ? "✓" : stage.icon}
                    </div>

                    {/* Name */}
                    <div className={cn(
                      "text-xs font-bold text-center leading-tight mb-1.5",
                      isActive ? c.text : isDone ? "text-emerald-700 dark:text-emerald-400" : "text-foreground"
                    )}>
                      {stage.name}
                    </div>

                    {/* Short descriptor */}
                    <div className="text-[10px] text-muted-foreground text-center leading-tight">
                      {stage.shortDesc}
                    </div>

                    {/* AI indicator on AI-driven stages (3–6) */}
                    {i >= 2 && (
                      <div className="mt-1.5 flex justify-center">
                        <AISparkle
                          tooltip={STAGE_AI_TOOLTIPS[i] ?? undefined}
                          title={stage.name}
                          side="top"
                          className="w-3.5 h-3.5 text-violet-400"
                        />
                      </div>
                    )}

                    {/* Status at bottom */}
                    <div className="mt-auto pt-2">
                      {isActive && (
                        <div className="flex items-center gap-1 justify-center">
                          <span className={`w-1.5 h-1.5 rounded-full ${c.dot} animate-pulse`} />
                          <span className={`text-[10px] font-semibold ${c.text}`}>Processing</span>
                        </div>
                      )}
                      {isDone && stage.filtered && (
                        <div className="text-[10px] text-red-600 dark:text-red-400 font-semibold text-center">
                          −{stage.filtered} filtered
                        </div>
                      )}
                      {isDone && !stage.filtered && (
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold text-center">Complete</div>
                      )}
                    </div>
                  </motion.div>

                  {/* Arrow connector between blocks */}
                  {i < pipelineStages.length - 1 && (
                    <div className="flex items-center flex-shrink-0 self-center">
                      <ChevronRight className={cn(
                        "w-4 h-4 transition-colors duration-300",
                        isDone ? "text-emerald-500" : isActive ? "text-primary" : "text-muted-foreground/30"
                      )} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Active stage detail panel */}
          {activeStage >= 0 && activeStage < 6 && (
            <motion.div
              key={activeStage}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-4 p-3 bg-muted/40 rounded-lg border border-border"
            >
              <div className="flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-foreground mb-0.5">{pipelineStages[activeStage].name}</div>
                  <div className="text-xs text-muted-foreground">{pipelineStages[activeStage].desc}</div>
                  {activeStage === 1 && (
                    <div className="mt-1.5 text-xs">
                      <span className="text-muted-foreground">Provider pool: </span>
                      <span className="font-semibold text-foreground">{providerPool}</span>
                      <span className="text-muted-foreground"> → after filters: </span>
                      <span className="font-semibold text-foreground">{afterFilter}</span>
                      <span className="text-red-600 ml-1">({pipelineStages[1].filtered} eliminated)</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Live Score Leaderboard — appears after stage 1 */}
      <AnimatePresence>
        {activeStage >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
          >
            <Card className="border-primary/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <CardTitle className="text-sm font-semibold">Live Score Progression</CardTitle>
                    <span className="text-[10px] bg-primary/10 text-primary font-semibold px-2 py-0.5 rounded-full">
                      Stage {activeStage} / 6
                    </span>
                  </div>
                  {running && (
                    <span className="flex items-center gap-1 text-xs text-primary">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                      Live
                    </span>
                  )}
                </div>
                {STAGE_INSIGHT[activeStage] && (
                  <p className={cn(
                    "text-xs mt-1 font-medium",
                    activeStage === 1 ? "text-amber-600 dark:text-amber-400" :
                    activeStage === 2 ? "text-teal-600 dark:text-teal-400" :
                    "text-muted-foreground"
                  )}>
                    {activeStage === 1 && "⚡ "}{STAGE_INSIGHT[activeStage]}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-0">
                  <AnimatePresence initial={false}>
                    {leaderboard.map((p, idx) => {
                      const prev = prevRankOf(p.provider);
                      const moved = prev !== null && prev !== p.currentRank;
                      const movedUp = prev !== null && p.currentRank < prev;
                      const movedDown = prev !== null && p.currentRank > prev;
                      const isLeader = idx === 0;

                      return (
                        <motion.div
                          key={p.provider}
                          layout
                          transition={{ type: "spring", damping: 30, stiffness: 300 }}
                          className={cn(
                            "flex items-center gap-3 py-2.5 px-2 rounded-lg transition-colors",
                            isLeader ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/30"
                          )}
                        >
                          {/* Rank badge */}
                          <motion.div
                            layout
                            className={cn(
                              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                              isLeader ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            )}
                          >
                            #{p.currentRank}
                          </motion.div>

                          {/* Rank change indicator */}
                          <div className="w-5 flex-shrink-0">
                            {moved && movedUp && (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center">
                                <ArrowUp className="w-3.5 h-3.5 text-emerald-500" />
                              </motion.div>
                            )}
                            {moved && movedDown && (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center">
                                <ArrowDown className="w-3.5 h-3.5 text-red-500" />
                              </motion.div>
                            )}
                            {(!moved || prev === null) && <Minus className="w-3 h-3 text-muted-foreground/30" />}
                          </div>

                          {/* Name */}
                          <span className={cn("text-sm w-36 flex-shrink-0", isLeader ? "font-semibold text-foreground" : "text-foreground")}>
                            {p.provider}
                            {p.distance && <span className="block text-[10px] text-muted-foreground font-normal">{p.distance} · ★{p.rating}</span>}
                          </span>

                          {/* Score bar */}
                          <div className="flex-1 flex items-center gap-2 min-w-0">
                            <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                              <motion.div
                                className={cn("h-full rounded-full", isLeader ? "bg-primary" : "bg-muted-foreground/40")}
                                initial={{ width: 0 }}
                                animate={{ width: `${p.currentScore}%` }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                              />
                            </div>
                            <motion.span
                              key={`${p.provider}-${p.currentScore}`}
                              initial={{ scale: 1.3, color: isLeader ? "hsl(var(--primary))" : "inherit" }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.3 }}
                              className={cn("text-sm font-bold w-8 text-right flex-shrink-0", isLeader ? "text-primary" : "text-foreground")}
                            >
                              {p.currentScore}
                            </motion.span>
                          </div>

                          {/* Confidence (only after stage 4) */}
                          {activeStage >= 4 && (
                            <span className={cn(
                              "text-[10px] font-semibold w-10 text-right flex-shrink-0",
                              p.confidence >= confidenceThreshold[0] ? "text-emerald-600" : "text-red-500"
                            )}>
                              {Math.round(p.confidence * 100)}%
                            </span>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
                {activeStage === 5 && (
                  <div className="mt-3 pt-3 border-t border-border flex items-center gap-2 text-xs text-emerald-600 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    Simulation complete — Maria Santos ranked #1 with score 92 · 91% confidence
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Config panel */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Engine Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Automation Level</div>
              <Select value={automationLevel} onValueChange={setAutomationLevel}>
                <SelectTrigger data-testid="automation-level-select"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {automationLevels.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1.5">{automationLevels.find(l => l.value === automationLevel)?.desc}</p>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                <span>Confidence Threshold</span>
                <span className="text-primary font-bold">{confidenceThreshold[0].toFixed(2)}</span>
              </div>
              <Slider
                data-testid="confidence-threshold-slider"
                value={confidenceThreshold}
                onValueChange={setConfidenceThreshold}
                min={0} max={1} step={0.01}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>0.0 (permissive)</span><span>1.0 (strict)</span>
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Weight Vector (tenant-tuned)</div>
              <div className="space-y-2.5">
                {weights.map(w => (
                  <div key={w.key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{w.label}</span>
                      <span className="font-semibold text-foreground">{w.value}%</span>
                    </div>
                    <Progress value={w.value * 4} className="h-1" />
                  </div>
                ))}
                <div className="text-[10px] text-muted-foreground pt-1 border-t border-border">Total: 100% (normalised)</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Match results */}
        <Card className="xl:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Match Results — Top 5</CardTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                Threshold: <span className={`font-semibold ${confidenceThreshold[0] <= 0.68 ? "text-amber-600" : "text-foreground"}`}>{confidenceThreshold[0].toFixed(2)}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {matchResults.map((m) => {
              const aboveThreshold = m.confidence >= confidenceThreshold[0];
              return (
                <div
                  key={m.rank}
                  className={cn(
                    "p-3 rounded-lg border transition-colors",
                    m.rank === 1 && aboveThreshold ? "border-primary/40 bg-primary/5" :
                    !aboveThreshold ? "border-border opacity-60" : "border-border bg-card"
                  )}
                  data-testid={`match-result-${m.rank}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                      m.rank === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>#{m.rank}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-foreground">{m.provider}</span>
                        <div className="flex items-center gap-3">
                          <div className="text-center">
                            <div className="text-[10px] text-muted-foreground">Score</div>
                            <div className="text-sm font-bold text-foreground">{m.score}</div>
                          </div>
                          <div className="text-center">
                            <div className="text-[10px] text-muted-foreground">Confidence</div>
                            <div className={cn("text-sm font-bold", aboveThreshold ? "text-emerald-600" : "text-red-500")}>
                              {Math.round(m.confidence * 100)}%
                            </div>
                          </div>
                          {!aboveThreshold && (
                            <span className="text-[10px] text-red-500 font-medium">Below threshold</span>
                          )}
                        </div>
                      </div>
                      <Progress value={m.score} className="h-1.5 mb-2" />
                      <div className="text-xs text-muted-foreground italic mb-2 bg-muted/30 p-2 rounded">
                        "{m.rationale}"
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span>{m.distance}</span>
                        <span>★ {m.rating}</span>
                        <span>{m.bookings} bookings</span>
                        <span>{m.response_time} response</span>
                      </div>
                    </div>
                    {m.rank === 1 && (
                      <Button size="sm" className="flex-shrink-0 self-center" data-testid="btn-approve-top-match">
                        {automationLevel === "full_auto" ? "Auto" : "Approve"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
