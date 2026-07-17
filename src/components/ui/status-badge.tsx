import { cn } from "@/lib/utils";
import { ProjectStatus, EpicStatus, TaskStatus } from "@/types";

interface StatusBadgeProps {
  status: ProjectStatus | EpicStatus | TaskStatus;
  className?: string;
  showDot?: boolean;
}

const statusConfig: Record<string, { label: string; tone: string; dotColor: string }> = {
  // Project statuses
  ACTIVE: {
    label: "Active",
    tone: "bg-success/10 text-success dark:bg-success/15",
    dotColor: "bg-success",
  },
  ARCHIVED: {
    label: "Archived",
    tone: "bg-muted text-muted-foreground",
    dotColor: "bg-muted-foreground",
  },
  ON_HOLD: {
    label: "On Hold",
    tone: "bg-warning/15 text-warning dark:bg-warning/20",
    dotColor: "bg-warning",
  },

  // Epic statuses
  BACKLOG: {
    label: "Backlog",
    tone: "bg-muted text-muted-foreground",
    dotColor: "bg-muted-foreground",
  },
  IN_PROGRESS: {
    label: "In Progress",
    tone: "bg-info/10 text-info dark:bg-info/15",
    dotColor: "bg-info",
  },
  IN_REVIEW: {
    label: "In Review",
    tone: "bg-purple/10 text-purple dark:bg-purple/15",
    dotColor: "bg-purple",
  },
  DONE: {
    label: "Done",
    tone: "bg-success/10 text-success dark:bg-success/15",
    dotColor: "bg-success",
  },
  CANCELLED: {
    label: "Cancelled",
    tone: "bg-danger/10 text-danger dark:bg-danger/15",
    dotColor: "bg-danger",
  },

  // Task statuses
  TODO: {
    label: "To Do",
    tone: "bg-muted text-muted-foreground",
    dotColor: "bg-muted-foreground",
  },
  BLOCKED: {
    label: "Blocked",
    tone: "bg-danger/10 text-danger dark:bg-danger/15",
    dotColor: "bg-danger",
  },
};

export function StatusBadge({ status, className, showDot = false }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    tone: "bg-muted text-muted-foreground",
    dotColor: "bg-muted-foreground",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.tone,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dotColor)} />
      {config.label}
    </span>
  );
}
