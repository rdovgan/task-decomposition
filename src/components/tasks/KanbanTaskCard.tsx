"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Link from "next/link";
import { Task } from "@/types";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { Calendar, Clock, MessageSquare } from "lucide-react";

interface KanbanTaskCardProps {
  task: Task;
  isDragging?: boolean;
}

export function KanbanTaskCard({ task, isDragging = false }: KanbanTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id,
    disabled: isDragging,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dragging = isDragging || isSortableDragging;

  // Calculate if task is overdue
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
  const taskId = `DOV-${task.id.slice(-6).toUpperCase()}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        group rounded-lg bg-card p-3 border border-border/60 transition-all cursor-grab
        ${
          dragging
            ? "shadow-2xl rotate-2 scale-105 opacity-50 cursor-grabbing z-50"
            : "hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5"
        }
      `}
    >
      {/* Top Row: ID + Priority */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono text-muted-foreground/70">{taskId}</span>
        <PriorityBadge priority={task.priority} />
      </div>

      {/* Task Title */}
      <Link
        href={`/tasks/${task.id}`}
        onClick={e => e.stopPropagation()}
        className="block text-sm font-medium leading-snug mb-2 line-clamp-2 text-foreground hover:text-primary transition-colors"
      >
        {task.title}
      </Link>

      {/* Epic tag */}
      {task.epic && (
        <div className="mb-2">
          <span className="inline-block max-w-full truncate rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {task.epic.title}
          </span>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-border/40 my-2" />

      {/* Bottom Row: Metadata */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          {task.storyPoints && (
            <span className="flex items-center gap-0.5 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium">
              {task.storyPoints} SP
            </span>
          )}
          {task.estimatedHours && (
            <span className="flex items-center gap-0.5">
              <Clock className="h-3 w-3" />
              {task.estimatedHours}h
            </span>
          )}
          {task.dueDate && (
            <span className={`flex items-center gap-0.5 ${isOverdue ? "text-destructive font-medium" : ""}`}>
              <Calendar className="h-3 w-3" />
              {new Date(task.dueDate).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>

        {/* Assignee Avatar */}
        {task.assignee && (
          <div
            className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-semibold text-primary ring-2 ring-background"
            title={task.assignee.name}
          >
            {task.assignee.name?.charAt(0).toUpperCase() || "?"}
          </div>
        )}
      </div>
    </div>
  );
}
