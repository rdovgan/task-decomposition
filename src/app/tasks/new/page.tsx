'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { TaskForm } from '@/components/tasks/TaskForm';
import { useApp } from '@/contexts/AppContext';
import { Epic, User } from '@/types';
import { useEffect, useState } from 'react';

export default function NewTaskPage() {
  const { epics } = useApp();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    // In a real app, you'd fetch users from an API
    // For now, we'll use an empty array
    setUsers([]);
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <Link
        href="/tasks"
        className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Tasks
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create New Task</h1>
        <p className="mt-2 text-muted-foreground">
          Create a new task and assign it to an epic
        </p>
      </div>

      <div className="max-w-2xl">
        <TaskForm epics={epics} users={users} />
      </div>
    </div>
  );
}
