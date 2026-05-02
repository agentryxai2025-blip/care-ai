import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIBadgeProps {
  label?: string;
  size?: "sm" | "md";
  className?: string;
  pulse?: boolean;
}

export function AIBadge({ label = "AI Powered", size = "sm", className, pulse = false }: AIBadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 font-semibold rounded-full border",
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
}

export function AIIcon({ className }: { className?: string }) {
  return <Sparkles className={cn("text-violet-500", className)} />;
}
