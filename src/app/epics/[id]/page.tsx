"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2, Plus, Sparkles, Calendar, Download } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { Button } from "@/components/ui/button";
import { AIDecompositionDialog } from "@/components/ai/AIDecompositionDialog";
import { TaskCreateModal } from "@/components/tasks/TaskCreateModal";
import { DependencyGraph } from "@/components/dependency-graph";
import {
  Epic,
  Task,
  EpicStatus,
  TaskStatus,
  Priority,
  AITaskSuggestion,
  User,
  Dependency,
} from "@/types";
import {
  epicsApi,
  tasksApi,
  aiDecompositionApi,
  usersApi,
  dependenciesApi,
  ApiErrorClass,
} from "@/lib/api-client";
import { generateEpicTasksMarkdown, downloadMarkdown } from "@/lib/export-md";

export default function EpicDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [epic, setEpic] = useState<Epic | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDependencyGraph, setShowDependencyGraph] = useState(false);

  // Create Task Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Selection state for bulk actions
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<TaskStatus | "">("");
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Sorting state
  const [sortKey, setSortKey] = useState<string>("title");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // AI Decomposition state
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<AITaskSuggestion[] | null>(null);
  const [aiMeta, setAiMeta] = useState<{
    decompositionTime: number;
    modelUsed: string;
    epicId: string;
    epicTitle: string;
  } | null>(null);

  useEffect(() => {
    async function loadEpic() {
      setLoading(true);
      setError(null);
      try {
        const [epicData, tasksData, usersData] = await Promise.all([
          epicsApi.get(id),
          tasksApi.list({ epicId: id, limit: 100 }),
          usersApi.list(),
        ]);
        setEpic(epicData);
        setTasks(tasksData.data);
        setUsers(usersData);

        // Fetch dependencies for all tasks
        const allDependencies: Dependency[] = [];
        await Promise.all(
          tasksData.data.map(async task => {
            try {
              const taskDependencies = await dependenciesApi.list(task.id);
              allDependencies.push(...taskDependencies);
            } catch (err) {
              console.error(`Failed to load dependencies for task ${task.id}:`, err);
            }
          })
        );
        setDependencies(allDependencies);
      } catch (err) {
        if (err instanceof ApiErrorClass) {
          setError(err.message);
        } else {
          setError("Failed to load epic");
        }
      } finally {
        setLoading(false);
      }
    }

    loadEpic();
  }, [id]);

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this epic? This will also delete all associated tasks."
      )
    ) {
      return;
    }

    try {
      await epicsApi.delete(id);
      router.push("/epics");
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        setError(err.message);
      }
    }
  };

  const handleAIDecompose = async (customPrompt?: string) => {
    setAiLoading(true);
    setAiError(null);

    try {
      const response = await aiDecompositionApi.decomposeEpic(id, {
        userId: "demo-user-id", // In production, get from auth
        customPrompt,
      });

      setAiSuggestions(response.data);
      setAiMeta(response.meta);
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        setAiError(err.message);
      } else {
        setAiError("Failed to generate task suggestions");
      }
    } finally {
      setAiLoading(false);
    }
  };

  const handleTaskCreated = async () => {
    // Refresh the task list after creation
    try {
      const tasksData = await tasksApi.list({ epicId: id, limit: 100 });
      setTasks(tasksData.data);
    } catch (err) {
      console.error("Failed to refresh tasks:", err);
    }
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  // Sort tasks for display
  const sortedTasks = [...tasks].sort((a, b) => {
    let aValue: any = a[sortKey as keyof Task];
    let bValue: any = b[sortKey as keyof Task];

    // Handle nested properties
    if (sortKey === "assignee") {
      aValue = a.assignee?.name || "";
      bValue = b.assignee?.name || "";
    }

    // Handle null/undefined values
    if (aValue == null) aValue = "";
    if (bValue == null) bValue = "";

    // Compare values
    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await tasksApi.update(taskId, { status: newStatus });
      // Update local state
      setTasks(tasks.map(task => (task.id === taskId ? { ...task, status: newStatus } : task)));
    } catch (err) {
      console.error("Failed to update task status:", err);
      setError("Failed to update task status");
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedTaskIds.size === 0) return;

    setBulkActionLoading(true);
    setError(null);

    try {
      // Update all selected tasks
      await Promise.all(
        Array.from(selectedTaskIds).map(taskId => tasksApi.update(taskId, { status: bulkStatus }))
      );

      // Refresh task list
      const tasksData = await tasksApi.list({ epicId: id, limit: 100 });
      setTasks(tasksData.data);

      // Clear selection
      setSelectedTaskIds(new Set());
      setBulkStatus("");
    } catch (err) {
      console.error("Failed to update tasks:", err);
      setError("Failed to update tasks");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTaskIds.size === 0) return;

    if (!confirm(`Are you sure you want to delete ${selectedTaskIds.size} task(s)?`)) {
      return;
    }

    setBulkActionLoading(true);
    setError(null);

    try {
      // Delete all selected tasks
      await Promise.all(Array.from(selectedTaskIds).map(taskId => tasksApi.delete(taskId)));

      // Refresh task list
      const tasksData = await tasksApi.list({ epicId: id, limit: 100 });
      setTasks(tasksData.data);

      // Clear selection
      setSelectedTaskIds(new Set());
    } catch (err) {
      console.error("Failed to delete tasks:", err);
      setError("Failed to delete tasks");
    } finally {
      setBulkActionLoading(false);
    }
  };

  const taskColumns = [
    {
      key: "title",
      title: "Title",
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
      key: "status",
      title: "Status",
      sortable: true,
      render: (value: unknown, row: Record<string, unknown>) => {
        const task = row as unknown as Task;
        return (
          <select
            value={task.status}
            onChange={e => handleStatusChange(task.id, e.target.value as TaskStatus)}
            onClick={e => e.stopPropagation()}
            className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="DONE">Done</option>
            <option value="BLOCKED">Blocked</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        );
      },
    },
    {
      key: "priority",
      title: "Priority",
      sortable: true,
      render: (value: unknown) => <PriorityBadge priority={value as Priority} />,
    },
    {
      key: "assignee",
      title: "Assignee",
      render: (_: unknown, row: Record<string, unknown>) => {
        const task = row as unknown as Task;
        return task.assignee?.name || <span className="text-muted-foreground">Unassigned</span>;
      },
    },
    {
      key: "storyPoints",
      title: "Points",
      render: (value: unknown) => (value as number)?.toString() || "-",
    },
  ];

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error || !epic) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          {error || "Epic not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        {epic.project ? (
          <>
            <Link href="/epics" className="hover:text-foreground transition-colors">
              Epics
            </Link>
            <span>/</span>
            <Link
              href={`/projects/${epic.project.id}`}
              className="hover:text-foreground transition-colors"
            >
              {epic.project.name}
            </Link>
            <span>/</span>
            <span className="text-foreground truncate max-w-[200px]">{epic.title}</span>
          </>
        ) : (
          <>
            <Link href="/epics" className="hover:text-foreground transition-colors">
              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
              Back to Epics
            </Link>
          </>
        )}
      </div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold tracking-tight">{epic.title}</h1>
            {epic.description && (
              <p className="mt-2 text-muted-foreground">{epic.description}</p>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              disabled={tasks.length === 0}
              onClick={() => {
                const tasksToExport =
                  selectedTaskIds.size > 0 ? tasks.filter(t => selectedTaskIds.has(t.id)) : tasks;
                const md = generateEpicTasksMarkdown({
                  epicTitle: epic.title,
                  epicDescription: epic.description,
                  projectName: epic.project?.name,
                  tasks: tasksToExport,
                  dependencies,
                });
                downloadMarkdown(md, `${epic.title.replace(/\s+/g, "-").toLowerCase()}-tasks.md`);
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              Export .md{selectedTaskIds.size > 0 ? ` (${selectedTaskIds.size})` : ""}
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push(`/epics/${epic.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Meta bar */}
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Status</span>
            <StatusBadge status={epic.status} />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Priority</span>
            <PriorityBadge priority={epic.priority} />
          </div>
          {epic.dueDate && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Due {new Date(epic.dueDate).toLocaleDateString()}
            </div>
          )}
          <div className="text-sm text-muted-foreground">
            Created {new Date(epic.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Dependency Graph Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Dependency Graph</h2>
          <Button variant="outline" size="sm" onClick={() => setShowDependencyGraph(!showDependencyGraph)}>
            {showDependencyGraph ? "Hide" : "Show"} Graph
          </Button>
        </div>

        {showDependencyGraph && (
          <div
            className="rounded-xl border overflow-hidden"
            style={{ height: "500px" }}
          >
            <DependencyGraph tasks={tasks} dependencies={dependencies} />
          </div>
        )}
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Tasks</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setAiDialogOpen(true)} className="gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              AI Assist
            </Button>
            <Button size="sm" onClick={() => setCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedTaskIds.size > 0 && (
          <div className="mb-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <span className="text-sm font-medium">
                {selectedTaskIds.size} task{selectedTaskIds.size !== 1 ? "s" : ""} selected
              </span>
              <div className="flex items-center gap-3">
                <select
                  value={bulkStatus}
                  onChange={e => setBulkStatus(e.target.value as TaskStatus | "")}
                  className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  disabled={bulkActionLoading}
                >
                  <option value="">Change status...</option>
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="IN_REVIEW">In Review</option>
                  <option value="DONE">Done</option>
                  <option value="BLOCKED">Blocked</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
                <Button
                  size="sm"
                  onClick={handleBulkStatusUpdate}
                  disabled={!bulkStatus || bulkActionLoading}
                >
                  {bulkActionLoading ? "Updating..." : "Update"}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleBulkDelete}
                  disabled={bulkActionLoading}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedTaskIds(new Set())}
                  disabled={bulkActionLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <DataTable
          columns={taskColumns}
          data={sortedTasks as unknown as Record<string, unknown>[]}
          loading={tasksLoading}
          emptyMessage="No tasks found. Create your first task to get started."
          onRowClick={row => {
            const task = row as unknown as Task;
            router.push(`/tasks/${task.id}`);
          }}
          onSort={handleSort}
          sortKey={sortKey}
          sortDirection={sortDirection}
          selectable
          selectedRows={selectedTaskIds}
          onSelectionChange={selectedIds => setSelectedTaskIds(new Set(selectedIds) as Set<string>)}
          getRowId={row => (row as unknown as Task).id}
        />
      </div>

      {/* AI Decomposition Dialog */}
      <AIDecompositionDialog
        open={aiDialogOpen}
        onClose={() => {
          setAiDialogOpen(false);
          setAiSuggestions(null);
          setAiError(null);
        }}
        epicId={epic.id}
        epicTitle={epic.title}
        suggestions={aiSuggestions}
        loading={aiLoading}
        error={aiError}
        meta={aiMeta}
        onGenerate={handleAIDecompose}
      />

      {/* Create Task Modal */}
      <TaskCreateModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        epicId={epic.id}
        epic={epic}
        users={users}
      />
    </div>
  );
}
