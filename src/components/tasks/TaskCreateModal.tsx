'use client';

import { Task, Epic, User } from '@/types';
import { TaskFormModal } from './TaskFormModal';

interface TaskCreateModalProps {
  open: boolean;
  onClose: () => void;
  epicId?: string;
  epic?: Epic;
  users?: User[];
}

export function TaskCreateModal({ open, onClose, epicId, epic, users = [] }: TaskCreateModalProps) {
  return (
    <TaskFormModal
      open={open}
      onClose={onClose}
      epicId={epicId}
      epic={epic}
      users={users}
      mode="create"
    />
  );
}
