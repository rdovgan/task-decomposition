'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Task, Epic, User } from '@/types';
import { tasksApi, epicsApi, ApiErrorClass } from '@/lib/api-client';

export default function EditTaskPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
    // In a real app, you'd fetch users from an API
    setUsers([]);
  }, [params.id]);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [taskData, epicsData] = await Promise.all([
        tasksApi.get(params.id),
        epicsApi.list({ limit: 100 }),
      ]);
      setTask(taskData);
      setEpics(epicsData.data);
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        setError(err.message);
      } else {
        setError('Failed to load task');
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          {error || 'Task not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <button
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Edit Task</h1>
        <p className="mt-2 text-muted-foreground">
          Update task information
        </p>
      </div>

      <div className="max-w-2xl">
        <TaskForm task={task} epics={epics} users={users} />
      </div>
    </div>
  );
}
