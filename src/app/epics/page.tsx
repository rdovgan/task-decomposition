'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Filter } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { DataTable } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { Button } from '@/components/ui/button';
import { Epic, EpicStatus, Priority } from '@/types';

export default function EpicsPage() {
  const router = useRouter();
  const { epics, epicsLoading, epicsError, fetchEpics } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');

  useEffect(() => {
    fetchEpics();
  }, [fetchEpics]);

  const handleFilterChange = () => {
    const filters: { status?: EpicStatus; priority?: Priority } = {};
    if (statusFilter) filters.status = statusFilter as EpicStatus;
    if (priorityFilter) filters.priority = priorityFilter as Priority;
    fetchEpics(Object.keys(filters).length > 0 ? filters : undefined);
  };

  useEffect(() => {
    handleFilterChange();
  }, [statusFilter, priorityFilter]);

  const columns = [
    {
      key: 'title',
      title: 'Title',
      sortable: true,
      render: (_: unknown, row: Record<string, unknown>) => {
        const epic = row as unknown as Epic;
        return (
          <div>
            <Link
              href={`/epics/${epic.id}`}
              className="font-medium text-primary hover:underline"
            >
              {epic.title}
            </Link>
            {epic.project && (
              <div className="text-xs text-muted-foreground">
                Project: <Link href={`/projects/${epic.project.id}`} className="hover:underline">
                  {epic.project.name}
                </Link>
              </div>
            )}
          </div>
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
          <h1 className="text-3xl font-bold tracking-tight">Epics</h1>
          <p className="text-muted-foreground">Manage your epics and their tasks</p>
        </div>
        <Button onClick={() => router.push('/epics/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New Epic
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All</option>
              <option value="BACKLOG">Backlog</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="DONE">Done</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </div>

      {epicsError && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          {epicsError}
        </div>
      )}

      <DataTable
        columns={columns}
        data={epics as unknown as Record<string, unknown>[]}
        loading={epicsLoading}
        emptyMessage="No epics found. Create your first epic to get started."
      />
    </div>
  );
}
