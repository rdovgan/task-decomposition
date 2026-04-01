'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Plus } from 'lucide-react';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { Button } from '@/components/ui/button';
import { Epic, Task, EpicStatus, Priority } from '@/types';
import { epicsApi, tasksApi, ApiErrorClass } from '@/lib/api-client';

export default function EpicDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [epic, setEpic] = useState<Epic | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadEpic() {
      setLoading(true);
      setError(null);
      try {
        const [epicData, tasksData] = await Promise.all([
          epicsApi.get(params.id),
          tasksApi.list({ epicId: params.id, limit: 100 }),
        ]);
        setEpic(epicData);
        setTasks(tasksData.data);
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

    loadEpic();
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this epic? This will also delete all associated tasks.')) {
      return;
    }

    try {
      await epicsApi.delete(params.id);
      router.push('/epics');
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        setError(err.message);
      }
    }
  };

  const taskColumns = [
    {
      key: 'title',
      title: 'Title',
      sortable: true,
      render: (_: unknown, row: Record<string, unknown>) => {
        const task = row as unknown as Task;
        return (
          <div>
            <div className="font-medium">{task.title}</div>
            {task.description && (
              <div className="text-sm text-muted-foreground">{task.description}</div>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value: unknown) => <StatusBadge status={value as EpicStatus} />,
    },
    {
      key: 'priority',
      title: 'Priority',
      sortable: true,
      render: (value: unknown) => <PriorityBadge priority={value as Priority} />,
    },
    {
      key: 'assignee',
      title: 'Assignee',
      render: (_: unknown, row: Record<string, unknown>) => {
        const task = row as unknown as Task;
        return task.assignee?.name || <span className="text-muted-foreground">Unassigned</span>;
      },
    },
    {
      key: 'storyPoints',
      title: 'Points',
      render: (value: unknown) => (value as number)?.toString() || '-',
    },
  ];

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
      <div className="mb-8">
        <Link
          href="/epics"
          className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Epics
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {epic.project && (
              <Link
                href={`/projects/${epic.project.id}`}
                className="mb-2 inline-flex text-sm text-primary hover:underline"
              >
                {epic.project.name}
              </Link>
            )}
            <h1 className="text-3xl font-bold tracking-tight">{epic.title}</h1>
            {epic.description && (
              <p className="mt-2 text-muted-foreground">{epic.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/epics/${epic.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div>
            <span className="text-sm text-muted-foreground">Status: </span>
            <StatusBadge status={epic.status} />
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Priority: </span>
            <PriorityBadge priority={epic.priority} />
          </div>
          {epic.dueDate && (
            <div className="text-sm text-muted-foreground">
              Due: {new Date(epic.dueDate).toLocaleDateString()}
            </div>
          )}
          <div className="text-sm text-muted-foreground">
            Created {new Date(epic.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Tasks</h2>
        <Button onClick={() => router.push(`/epics/${epic.id}/tasks/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      <DataTable
        columns={taskColumns}
        data={tasks as unknown as Record<string, unknown>[]}
        loading={tasksLoading}
        emptyMessage="No tasks found. Create your first task to get started."
      />
    </div>
  );
}
