'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import { Task } from '@/types';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { Calendar, Clock } from 'lucide-react';

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

  // Generate task ID from database ID (simplified)
  const taskId = `DOV-${task.id.slice(-6).toUpperCase()}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-card rounded-lg p-3 border transition-all cursor-grab
        ${dragging
          ? 'shadow-xl rotate-2 scale-105 opacity-50 cursor-grabbing'
          : 'hover:shadow-lg hover:-translate-y-0.5'
        }
      `}
    >
      {/* Top Row: Priority + Avatar */}
      <div className="flex items-start justify-between mb-2">
        <PriorityBadge priority={task.priority} />

        {/* Assignee Avatar */}
        {task.assignee && (
          <div
            className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium"
            title={task.assignee.name}
          >
            {task.assignee.name?.charAt(0).toUpperCase() || '?'}
          </div>
        )}
      </div>

      {/* Task Title */}
      <Link
        href={`/tasks/${task.id}`}
        onClick={(e) => e.stopPropagation()}
        className={`
          block text-sm font-semibold mb-2 line-clamp-2
          hover:text-primary hover:underline
        `}
      >
        {task.title}
      </Link>

      {/* Metadata Row */}
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
        <span className="font-mono">{taskId}</span>

        {task.epic && (
          <>
            <span>•</span>
            <span className="truncate max-w-[120px]" title={task.epic.title}>
              {task.epic.title}
            </span>
          </>
        )}
      </div>

      {/* Divider */}
      <hr className="border-muted my-2" />

      {/* Bottom Row: Metadata */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {/* Story Points */}
        {task.storyPoints && (
          <span className="flex items-center gap-1">
            <span>📊</span>
            <span>{task.storyPoints} SP</span>
          </span>
        )}

        {/* Estimated Hours */}
        {task.estimatedHours && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{task.estimatedHours}h</span>
          </span>
        )}

        {/* Due Date */}
        {task.dueDate && (
          <span
            className={`flex items-center gap-1 ${
              isOverdue ? 'text-destructive' : ''
            }`}
          >
            <Calendar className="h-3 w-3" />
            <span>{new Date(task.dueDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}</span>
          </span>
        )}
      </div>
    </div>
  );
}
