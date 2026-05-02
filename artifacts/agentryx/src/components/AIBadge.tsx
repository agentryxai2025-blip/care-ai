import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface AIBadgeProps {
  label?: string;
  size?: "sm" | "md";
  className?: string;
  pulse?: boolean;
  tooltip?: string;
}

export function AIBadge({ label = "AI Powered", size = "sm", className, pulse = false, tooltip }: AIBadgeProps) {
  const badge = (
    <span className={cn(
      "inline-flex items-center gap-1 font-semibold rounded-full border cursor-help",
      "bg-violet-50 text-violet-700 border-violet-200",
      "dark:bg-violet-900/25 dark:text-violet-400 dark:border-violet-700/60",
      size === "sm" && "text-[10px] px-2 py-0.5",
      size === "md" && "text-xs px-2.5 py-1",
      className
    )}>
      <Sparkles className={cn(
        "flex-shrink-0",
        pulse && "animate-pulse",
        size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3"
      )} />
      {label}
    </span>
  );

  if (!tooltip) return badge;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent side="bottom">
        <p className="font-semibold text-violet-600 dark:text-violet-400 mb-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> AI-Powered Intelligence
        </p>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

interface AISparkleProps {
  className?: string;
  tooltip?: string;
  side?: "top" | "bottom" | "left" | "right";
  title?: string;
}

export function AISparkle({ className, tooltip, side = "top", title }: AISparkleProps) {
  const icon = (
    <button
      type="button"
      className="focus:outline-none cursor-help leading-none"
      aria-label="AI-powered feature"
    >
      <Sparkles className={cn("text-violet-500", className)} />
    </button>
  );

  if (!tooltip) return <Sparkles className={cn("text-violet-500", className)} />;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{icon}</TooltipTrigger>
      <TooltipContent side={side}>
        <p className="font-semibold text-violet-600 dark:text-violet-400 mb-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> {title ?? "AI at Work"}
        </p>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function AIIcon({ className }: { className?: string }) {
  return <Sparkles className={cn("text-violet-500", className)} />;
}
