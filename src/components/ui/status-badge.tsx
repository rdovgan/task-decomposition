import { cn } from "@/lib/utils";
import { ProjectStatus, EpicStatus, TaskStatus } from "@/types";

interface StatusBadgeProps {
  status: ProjectStatus | EpicStatus | TaskStatus;
  className?: string;
  showDot?: boolean;
}

const statusConfig: Record<string, { label: string; className: string; dotColor: string }> = {
  // Project statuses
  ACTIVE: {
    label: "Active",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    dotColor: "bg-green-500",
  },
  ARCHIVED: {
    label: "Archived",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
    dotColor: "bg-gray-500",
  },
  ON_HOLD: {
    label: "On Hold",
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    dotColor: "bg-yellow-500",
  },

  // Epic statuses
  BACKLOG: {
    label: "Backlog",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
    dotColor: "bg-gray-400",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    dotColor: "bg-blue-500",
  },
  IN_REVIEW: {
    label: "In Review",
    className: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    dotColor: "bg-purple-500",
  },
  DONE: {
    label: "Done",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    dotColor: "bg-green-500",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    dotColor: "bg-red-500",
  },

  // Task statuses
  TODO: {
    label: "To Do",
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
    dotColor: "bg-gray-400",
  },
  BLOCKED: {
    label: "Blocked",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    dotColor: "bg-red-500",
  },
};

export function StatusBadge({ status, className, showDot = false }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: "bg-gray-100 text-gray-800", dotColor: "bg-gray-400" };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", config.dotColor)} />
      {config.label}
    </span>
  );
}
