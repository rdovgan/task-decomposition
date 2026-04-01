'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TaskForm } from '@/components/tasks/TaskForm';
import { Epic, User } from '@/types';
import { epicsApi, ApiErrorClass } from '@/lib/api-client';

export default function NewEpicTaskPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [epic, setEpic] = useState<Epic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    loadEpic();
    // In a real app, you'd fetch users from an API
    setUsers([]);
  }, [params.id]);

  async function loadEpic() {
    setLoading(true);
    setError(null);
    try {
      const epicData = await epicsApi.get(params.id);
      setEpic(epicData);
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        setError(err.message);
      } else {
        setError('Failed to load epic');
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

  if (error || !epic) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          {error || 'Epic not found'}
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
        <h1 className="text-3xl font-bold tracking-tight">Create New Task</h1>
        <p className="mt-2 text-muted-foreground">
          Creating a task for epic: <span className="font-medium">{epic.title}</span>
        </p>
      </div>

      <div className="max-w-2xl">
        <TaskForm epicId={epic.id} epic={epic} epics={[epic]} users={users} />
      </div>
    </div>
  );
}
