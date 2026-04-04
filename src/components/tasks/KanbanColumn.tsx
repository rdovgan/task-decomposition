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

export function KanbanColumn({ status, tasks }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: status,
  });

  const taskIds = tasks.map(task => task.id);

  return (
    <div className="flex-shrink-0 w-80">
      <div className="bg-muted/30 rounded-lg p-4">
        {/* Column Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <StatusBadge status={status} />
            <span className="font-semibold">({tasks.length})</span>
          </div>
          <button
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => {
              // TODO: Open task modal with status pre-selected
              console.log("Add task to", status);
            }}
          >
            <Plus className="h-3 w-3" />
            Add Task
          </button>
        </div>

        {/* Task List */}
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div ref={setNodeRef} className="space-y-2 min-h-[200px]">
            {tasks.length === 0 ? (
              <div className="h-40 flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed border-muted-foreground/20 rounded-lg">
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
