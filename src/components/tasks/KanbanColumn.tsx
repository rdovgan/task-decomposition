"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Task, TaskStatus } from "@/types";
import { StatusBadge } from "@/components/ui/status-badge";
import { KanbanTaskCard } from "./KanbanTaskCard";
import { Plus } from "lucide-react";

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: "To Do",
  IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review",
  DONE: "Done",
  BLOCKED: "Blocked",
  CANCELLED: "Cancelled",
};

const STATUS_DOT_COLORS: Record<TaskStatus, string> = {
  TODO: "bg-muted-foreground/60",
  IN_PROGRESS: "bg-info",
  IN_REVIEW: "bg-purple",
  DONE: "bg-success",
  BLOCKED: "bg-danger",
  CANCELLED: "bg-muted-foreground/60",
};

const COLUMN_BG: Record<TaskStatus, string> = {
  TODO: "bg-muted/50",
  IN_PROGRESS: "bg-info/[0.06]",
  IN_REVIEW: "bg-purple/[0.06]",
  DONE: "bg-success/[0.06]",
  BLOCKED: "bg-danger/[0.06]",
  CANCELLED: "bg-muted/50",
};

export function KanbanColumn({ status, tasks }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const taskIds = tasks.map(task => task.id);

  return (
    <div className="flex-shrink-0 w-[290px]">
      <div
        className={`rounded-xl p-3 transition-colors ${COLUMN_BG[status]} ${
          isOver ? "ring-2 ring-primary/40" : ""
        }`}
      >
        {/* Column Header */}
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${STATUS_DOT_COLORS[status]}`} />
            <span className="text-sm font-semibold text-foreground">{STATUS_LABELS[status]}</span>
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[11px] font-medium text-muted-foreground">
              {tasks.length}
            </span>
          </div>
          <button
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
            onClick={() => {
              // TODO: Open task modal with status pre-selected
              console.log("Add task to", status);
            }}
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>

        {/* Task List */}
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div ref={setNodeRef} className="space-y-2 min-h-[200px]">
            {tasks.length === 0 ? (
              <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/15 text-muted-foreground text-xs">
                Drop tasks here
              </div>
            ) : (
              tasks.map(task => <KanbanTaskCard key={task.id} task={task} />)
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
