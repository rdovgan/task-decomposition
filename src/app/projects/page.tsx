'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Filter } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Project, ProjectStatus } from '@/types';

export default function ProjectsPage() {
  const router = useRouter();
  const { projects, projectsLoading, projectsError, fetchProjects } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    fetchProjects(status === '' ? undefined : { status: status as ProjectStatus });
  };

  const columns = [
    {
      key: 'name',
      title: 'Name',
      sortable: true,
      render: (_: unknown, row: Record<string, unknown>) => {
        const project = row as unknown as Project;
        return (
          <Link
            href={`/projects/${project.id}`}
            className="font-medium text-primary hover:underline"
          >
            {project.name}
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
      render: (value: unknown) => <StatusBadge status={value as ProjectStatus} />,
    },
    {
      key: '_count.epics',
      title: 'Epics',
      render: (value: unknown) => (value as number)?.toString() || '0',
    },
    {
      key: 'createdAt',
      title: 'Created',
      sortable: true,
      render: (value: unknown) => new Date(value as string).toLocaleDateString(),
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">Manage your projects and their epics</p>
        </div>
        <Button onClick={() => router.push('/projects/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filter by status:</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('')}
          >
            All
          </Button>
          <Button
            variant={statusFilter === 'ACTIVE' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('ACTIVE')}
          >
            Active
          </Button>
          <Button
            variant={statusFilter === 'ON_HOLD' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('ON_HOLD')}
          >
            On Hold
          </Button>
          <Button
            variant={statusFilter === 'ARCHIVED' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFilterChange('ARCHIVED')}
          >
            Archived
          </Button>
        </div>
      </div>

      {projectsError && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          {projectsError}
        </div>
      )}

      <DataTable
        columns={columns}
        data={projects as unknown as Record<string, unknown>[]}
        loading={projectsLoading}
        emptyMessage="No projects found. Create your first project to get started."
      />
    </div>
  );
}
