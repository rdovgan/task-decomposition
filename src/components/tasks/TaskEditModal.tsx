'use client';

import { Task, User } from '@/types';
import { TaskFormModal } from './TaskFormModal';

interface TaskEditModalProps {
  open: boolean;
  onClose: () => void;
  task: Task;
  users?: User[];
}

export function TaskEditModal({ open, onClose, task, users = [] }: TaskEditModalProps) {
  return (
    <TaskFormModal
      open={open}
      onClose={onClose}
      task={task}
      users={users}
      mode="edit"
    />
  );
}
