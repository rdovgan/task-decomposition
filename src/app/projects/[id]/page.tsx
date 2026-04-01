'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Plus } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { Button } from '@/components/ui/button';
import { Project, Epic, EpicStatus, Priority } from '@/types';
import { projectsApi, epicsApi, ApiErrorClass } from '@/lib/api-client';

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { fetchEpics, createEpic, updateEpic, deleteEpic } = useApp();
  const [project, setProject] = useState<Project | null>(null);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [loading, setLoading] = useState(true);
  const [epicsLoading, setEpicsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProject() {
      setLoading(true);
      setError(null);
      try {
        const [projectData, epicsData] = await Promise.all([
          projectsApi.get(params.id),
          epicsApi.list({ projectId: params.id, limit: 100 }),
        ]);
        setProject(projectData);
        setEpics(epicsData.data);
      } catch (err) {
        if (err instanceof ApiErrorClass) {
          setError(err.message);
        } else {
          setError('Failed to load project');
        }
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this project? This will also delete all associated epics and tasks.')) {
      return;
    }

    try {
      await projectsApi.delete(params.id);
      router.push('/projects');
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        setError(err.message);
      }
    }
  };

  const epicColumns = [
    {
      key: 'title',
      title: 'Title',
      sortable: true,
      render: (_: unknown, row: Record<string, unknown>) => {
        const epic = row as unknown as Epic;
        return (
          <Link
            href={`/epics/${epic.id}`}
            className="font-medium text-primary hover:underline"
          >
            {epic.title}
          </Link>
        );
      },
    },
    {
      key: 'description',
      title: 'Description',
      render: (value: unknown) => (value as string | null) || <span className="text-muted-foreground">No description</span>,
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
      key: '_count.tasks',
      title: 'Tasks',
      render: (value: unknown) => (value as number)?.toString() || '0',
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

  if (error || !project) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          {error || 'Project not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Link
          href="/projects"
          className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            {project.description && (
              <p className="mt-2 text-muted-foreground">{project.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push(`/projects/${project.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <div>
            <span className="text-sm text-muted-foreground">Status: </span>
            <StatusBadge status={project.status} />
          </div>
          <div className="text-sm text-muted-foreground">
            Created {new Date(project.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Epics</h2>
        <Button onClick={() => router.push(`/projects/${project.id}/epics/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          New Epic
        </Button>
      </div>

      <DataTable
        columns={epicColumns}
        data={epics as unknown as Record<string, unknown>[]}
        loading={epicsLoading}
        emptyMessage="No epics found. Create your first epic to get started."
      />
    </div>
  );
}
