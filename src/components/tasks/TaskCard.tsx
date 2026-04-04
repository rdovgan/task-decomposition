"use client";

import Link from "next/link";
import { Task } from "@/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { PriorityBadge } from "@/components/ui/priority-badge";

interface TaskCardProps {
  task: Task;
  showEpic?: boolean;
}

export function TaskCard({ task, showEpic = false }: TaskCardProps) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm transition-colors hover:bg-muted/50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Link href={`/tasks/${task.id}`} className="font-semibold text-primary hover:underline">
            {task.title}
          </Link>
          {task.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{task.description}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
            {task.storyPoints && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {task.storyPoints} pts
              </span>
            )}
            {showEpic && task.epic && (
              <Link
                href={`/epics/${task.epic.id}`}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                {task.epic.title}
              </Link>
            )}
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <div>
          {task.assignee && <span>Assigned to {task.assignee.name}</span>}
          {!task.assignee && <span className="italic">Unassigned</span>}
        </div>
        {task.dueDate && <div>Due {new Date(task.dueDate).toLocaleDateString()}</div>}
      </div>
    </div>
  );
}
