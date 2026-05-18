"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, CheckSquare, Filter } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { Button } from "@/components/ui/button";
import { Task, TaskStatus, Priority } from "@/types";
import { tasksApi, ApiErrorClass } from "@/lib/api-client";
import { PageHeaderSkeleton } from "@/components/ui/skeleton";

export default function TasksPage() {
  const router = useRouter();
  const { deleteTask } = useApp();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    setLoading(true);
    setError(null);
    try {
      const response = await tasksApi.list({ limit: 100 });
      setTasks(response.data);
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        setError(err.message);
      } else {
        setError("Failed to load tasks");
      }
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        setError(err.message);
      }
    }
  };

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
          <div>
            <Link href={`/tasks/${task.id}`} className="font-medium text-primary hover:underline">
              {task.title}
            </Link>
            {task.description && (
              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                {task.description}
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: "epic",
      title: "Epic",
      render: (_: unknown, row: Record<string, unknown>) => {
        const task = row as unknown as Task;
        return task.epic ? (
          <Link
            href={`/epics/${task.epic.id}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {task.epic.title}
          </Link>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        );
      },
    },
    {
      key: "assignee",
      title: "Assignee",
      render: (_: unknown, row: Record<string, unknown>) => {
        const task = row as unknown as Task;
        return task.assignee ? (
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-medium">
              {task.assignee.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm">{task.assignee.name}</span>
          </div>
        ) : (
          <span className="text-sm italic text-muted-foreground">Unassigned</span>
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
      render: (value: unknown) => (
        <span className="tabular-nums text-sm">
          {(value as number | null)?.toString() || "—"}
        </span>
      ),
    },
    {
      key: "actions",
      title: "",
      render: (_: unknown, row: Record<string, unknown>) => {
        const task = row as unknown as Task;
        return (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => router.push(`/tasks/${task.id}/edit`)}
              aria-label="Edit task"
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-destructive hover:text-destructive"
              onClick={() => handleDelete(task.id)}
              aria-label="Delete task"
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="mt-2 text-muted-foreground">View and manage all tasks</p>
        </div>
        <Button onClick={() => router.push("/tasks/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-xl border bg-card p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
              className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="all">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && <PageHeaderSkeleton />}

      {/* Table */}
      {!loading && (
        <div className="rounded-xl border bg-card overflow-hidden">
          <DataTable
            columns={taskColumns}
            data={filteredTasks as unknown as Record<string, unknown>[]}
            loading={loading}
            emptyMessage="No tasks found. Create your first task to get started."
          />
        </div>
      )}
    </div>
  );
}
