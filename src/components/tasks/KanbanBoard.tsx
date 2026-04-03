'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
} from '@dnd-kit/core';
import { Task, TaskStatus } from '@/types';
import { KanbanColumn } from './KanbanColumn';
import { KanbanTaskCard } from './KanbanTaskCard';

const COLUMN_ORDER: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED'];

interface KanbanBoardProps {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: TaskStatus) => Promise<void>;
}

interface GroupedTasks {
  [key: string]: Task[];
}

export function KanbanBoard({ tasks, onStatusChange }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Group tasks by status
  const tasksByStatus: GroupedTasks = React.useMemo(() => {
    const grouped: GroupedTasks = {};
    COLUMN_ORDER.forEach(status => {
      grouped[status] = tasks.filter(task => task.status === status);
    });
    return grouped;
  }, [tasks]);

  // Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    // Optional: Show visual feedback for drop zone
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Find the task being dragged
    const draggedTask = tasks.find(t => t.id === taskId);
    if (!draggedTask) return;

    // If dropped on a column (column IDs are status values)
    if (COLUMN_ORDER.includes(overId as TaskStatus)) {
      const newStatus = overId as TaskStatus;
      if (newStatus !== draggedTask.status) {
        await onStatusChange(taskId, newStatus);
      }
      return;
    }

    // If dropped on another task, use that task's status
    const targetTask = tasks.find(t => t.id === overId);
    if (targetTask && targetTask.status !== draggedTask.status) {
      await onStatusChange(taskId, targetTask.status);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMN_ORDER.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status] || []}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <KanbanTaskCard task={activeTask} isDragging />
        )}
      </DragOverlay>
    </DndContext>
  );
}
