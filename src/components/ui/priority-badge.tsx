import { cn } from "@/lib/utils";
import { Priority } from "@/types";

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

const priorityConfig: Record<Priority, { label: string; tone: string; icon: string }> = {
  CRITICAL: {
    label: "Critical",
    tone: "bg-danger/10 text-danger dark:bg-danger/15",
    icon: "⚡",
  },
  HIGH: {
    label: "High",
    tone: "bg-warning/15 text-warning dark:bg-warning/20",
    icon: "↑",
  },
  MEDIUM: {
    label: "Medium",
    tone: "bg-info/10 text-info dark:bg-info/15",
    icon: "→",
  },
  LOW: {
    label: "Low",
    tone: "bg-muted text-muted-foreground",
    icon: "↓",
  },
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.tone,
        className
      )}
    >
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
}
