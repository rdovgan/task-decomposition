"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Search } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { Button } from "@/components/ui/button";
import { Task, TaskStatus, Priority, Epic } from "@/types";
import { tasksApi, epicsApi, ApiErrorClass } from "@/lib/api-client";

export default function EpicTasksPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [epic, setEpic] = useState<Epic | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  useEffect(() => {
    loadData();
  }, [params.id]);

  async function loadData() {
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
        setError("Failed to load epic tasks");
      }
    } finally {
      setLoading(false);
    }
  }

  const filteredTasks = tasks.filter(task => {
    const matchesSearch =
      searchQuery === "" ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const taskColumns = [
    {
      key: "title",
      title: "Title",
      sortable: true,
      render: (_: unknown, row: Record<string, unknown>) => {
        const task = row as unknown as Task;
        return (
          <Link href={`/tasks/${task.id}`} className="font-medium text-primary hover:underline">
            {task.title}
          </Link>
        );
      },
    },
    {
      key: "assignee",
      title: "Assignee",
      render: (_: unknown, row: Record<string, unknown>) => {
        const task = row as unknown as Task;
        return task.assignee ? (
          <span>{task.assignee.name}</span>
        ) : (
          <span className="text-muted-foreground italic">Unassigned</span>
        );
      },
    },
    {
      key: "status",
      title: "Status",
      sortable: true,
      render: (value: unknown) => <StatusBadge status={value as TaskStatus} />,
    },
    {
      key: "priority",
      title: "Priority",
      sortable: true,
      render: (value: unknown) => <PriorityBadge priority={value as Priority} />,
    },
    {
      key: "storyPoints",
      title: "Points",
      render: (value: unknown) => (value as number | null)?.toString() || "-",
    },
    {
      key: "actions",
      title: "Actions",
      render: (_: unknown, row: Record<string, unknown>) => {
        const task = row as unknown as Task;
        return (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push(`/tasks/${task.id}/edit`)}>
              Edit
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Link
          href={`/epics/${params.id}`}
          className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Epic
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
            {epic && (
              <p className="mt-2 text-muted-foreground">
                Tasks for epic: <span className="font-medium">{epic.title}</span>
              </p>
            )}
          </div>
          <Button onClick={() => router.push(`/epics/${params.id}/tasks/new`)}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All Statuses</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="DONE">Done</option>
            <option value="BLOCKED">Blocked</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={priorityFilter}
            onChange={e => setPriorityFilter(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      )}

      <DataTable
        columns={taskColumns}
        data={filteredTasks as unknown as Record<string, unknown>[]}
        loading={loading}
        emptyMessage="No tasks found in this epic. Create your first task to get started."
      />
    </div>
  );
}
