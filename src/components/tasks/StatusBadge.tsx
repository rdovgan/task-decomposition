import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { TaskStatus } from "@/types";
import { tasksApi } from "@/lib/api-client";
import {
  Circle,
  CircleDot,
  Eye,
  CheckCircle2,
  XCircle,
  Ban,
  ChevronDown,
  Loader2,
  AlertCircle,
} from "lucide-react";

// Status transition rules based on backend validation
const STATUS_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  TODO: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["IN_REVIEW", "BLOCKED", "CANCELLED"],
  IN_REVIEW: ["DONE", "IN_PROGRESS"],
  BLOCKED: ["IN_PROGRESS", "CANCELLED"],
  DONE: [], // No changes allowed
  CANCELLED: [], // No changes allowed
};

// Status configuration with icons and colors
const STATUS_CONFIG: Record<
  TaskStatus,
  {
    label: string;
    icon: typeof CheckCircle2;
    className: string;
    description: string;
  }
> = {
  TODO: {
    label: "To Do",
    icon: Circle,
    className:
      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-300 dark:border-gray-600",
    description: "Task is not yet started",
  },
  IN_PROGRESS: {
    label: "In Progress",
    icon: CircleDot,
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300 dark:border-blue-600",
    description: "Task is currently being worked on",
  },
  IN_REVIEW: {
    label: "In Review",
    icon: Eye,
    className:
      "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-300 dark:border-purple-600",
    description: "Task is under review",
  },
  DONE: {
    label: "Done",
    icon: CheckCircle2,
    className:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-300 dark:border-green-600",
    description: "Task is completed",
  },
  BLOCKED: {
    label: "Blocked",
    icon: Ban,
    className:
      "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-300 dark:border-red-600",
    description: "Task is blocked and cannot proceed",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    className:
      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 line-through border-gray-300 dark:border-gray-600",
    description: "Task has been cancelled",
  },
};

interface TaskStatusBadgeProps {
  taskId: string;
  status: TaskStatus;
  onStatusChange?: (newStatus: TaskStatus) => void;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  interactive?: boolean;
  disabled?: boolean;
  className?: string;
}

export function TaskStatusBadge({
  taskId,
  status,
  onStatusChange,
  size = "md",
  showIcon = true,
  interactive = true,
  disabled = false,
  className,
}: TaskStatusBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  const canChange = interactive && !disabled;
  const validTransitions = STATUS_TRANSITIONS[status];
  const hasValidTransitions = validTransitions.length > 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setError(null);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      setError(null);
    } else if (event.key === "Enter" || event.key === " ") {
      if (canChange && hasValidTransitions) {
        event.preventDefault();
        setIsOpen(!isOpen);
      }
    }
  };

  // Handle status update
  const handleStatusChange = async (newStatus: TaskStatus) => {
    setIsLoading(true);
    setError(null);

    try {
      await tasksApi.update(taskId, { status: newStatus });
      onStatusChange?.(newStatus);
      setIsOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update status";
      setError(message);
      console.error("Status update error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm",
  };

  const iconSize = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Status Badge */}
      <button
        type="button"
        onClick={() => {
          if (canChange && hasValidTransitions) {
            setIsOpen(!isOpen);
            setError(null);
          }
        }}
        onKeyDown={handleKeyDown}
        disabled={!canChange || !hasValidTransitions}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-70",
          sizeClasses[size],
          config.className,
          canChange && hasValidTransitions && "cursor-pointer hover:opacity-80",
          className
        )}
        aria-label={`Task status: ${config.label}. ${hasValidTransitions ? "Press Enter or Space to change." : "Cannot change status."}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-describedby={error ? "status-error" : undefined}
      >
        {showIcon && <Icon className={iconSize[size]} aria-hidden="true" />}
        <span>{config.label}</span>
        {canChange && hasValidTransitions && (
          <ChevronDown
            className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")}
            aria-hidden="true"
          />
        )}
      </button>

      {/* Error Message */}
      {error && (
        <p id="status-error" className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
          <AlertCircle className="inline h-3 w-3 mr-1" aria-hidden="true" />
          {error}
        </p>
      )}

      {/* Status Dropdown */}
      {isOpen && canChange && (
        <div
          className="absolute z-50 mt-1 min-w-[200px] rounded-md border bg-white dark:bg-gray-800 shadow-lg"
          role="listbox"
          aria-label="Select status"
          aria-activedescendant={status}
        >
          <div className="py-1">
            {validTransitions.map(newStatus => {
              const newConfig = STATUS_CONFIG[newStatus];
              const NewIcon = newConfig.icon;

              return (
                <button
                  key={newStatus}
                  type="button"
                  onClick={() => handleStatusChange(newStatus)}
                  disabled={isLoading}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors",
                    "focus:outline-none focus:bg-blue-50 dark:focus:bg-blue-900/20",
                    "hover:bg-gray-50 dark:hover:bg-gray-700/50",
                    "disabled:cursor-not-allowed disabled:opacity-50"
                  )}
                  role="option"
                  aria-selected={newStatus === status}
                >
                  <NewIcon className="h-4 w-4" aria-hidden="true" />
                  <span className="flex-1 text-left">{newConfig.label}</span>
                  {isLoading && status === newStatus && (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  )}
                </button>
              );
            })}

            {validTransitions.length === 0 && (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                No valid status transitions
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
