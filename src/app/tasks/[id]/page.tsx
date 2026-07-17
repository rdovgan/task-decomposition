"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Edit,
  Trash2,
  Calendar,
  User,
  Clock,
  AlertCircle,
  Copy,
  ExternalLink,
  CheckCircle2,
  Circle,
  Loader2,
  Ban,
  Eye,
  ArrowLeft,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { Button } from "@/components/ui/button";
import { CommentList } from "@/components/tasks/CommentList";
import { CommentForm } from "@/components/tasks/CommentForm";
import { TaskLinkList } from "@/components/tasks/TaskLinkList";
import { DependencyManager } from "@/components/tasks/DependencyManager";
import { Task, Comment, TaskLink, Dependency, TaskStatus } from "@/types";
import {
  tasksApi,
  commentsApi,
  taskLinksApi,
  dependenciesApi,
  ApiErrorClass,
} from "@/lib/api-client";
import { PageHeaderSkeleton } from "@/components/ui/skeleton";

const statusIcons: Record<TaskStatus, React.ElementType> = {
  TODO: Circle,
  IN_PROGRESS: Loader2,
  IN_REVIEW: Eye,
  DONE: CheckCircle2,
  BLOCKED: Ban,
  CANCELLED: AlertCircle,
};

export default function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [links, setLinks] = useState<TaskLink[]>([]);
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTask();
    loadComments();
    loadLinks();
    loadDependencies();
  }, [id]);

  async function loadTask() {
    setLoading(true);
    setError(null);
    try {
      const taskData = await tasksApi.get(id);
      setTask(taskData);
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        setError(err.message);
      } else {
        setError("Failed to load task");
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadComments() {
    setCommentsLoading(true);
    try {
      const commentsData = await commentsApi.list(id);
      setComments(commentsData);
    } catch (err) {
      console.error("Failed to load comments:", err);
    } finally {
      setCommentsLoading(false);
    }
  }

  async function loadLinks() {
    try {
      const linksData = await taskLinksApi.list(id);
      setLinks(linksData);
    } catch (err) {
      console.error("Failed to load links:", err);
    }
  }

  async function loadDependencies() {
    try {
      const dependenciesData = await dependenciesApi.list(id);
      setDependencies(dependenciesData);
    } catch (err) {
      console.error("Failed to load dependencies:", err);
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await tasksApi.delete(id);
      if (task?.epicId) {
        router.push(`/epics/${task.epicId}`);
      } else {
        router.push("/tasks");
      }
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        setError(err.message);
      }
    }
  };

  const handleDuplicate = async () => {
    if (!task) return;

    const duplicateTitle = prompt("Enter title for the duplicate task:", `${task.title} (copy)`);
    if (!duplicateTitle) return;

    try {
      const duplicateTask = await tasksApi.create({
        epicId: task.epicId,
        title: duplicateTitle,
        description: task.description || undefined,
        assigneeId: task.assigneeId || undefined,
        priority: task.priority,
        storyPoints: task.storyPoints || undefined,
        estimatedHours: task.estimatedHours || undefined,
        startDate: task.startDate || undefined,
        dueDate: task.dueDate || undefined,
      });

      router.push(`/tasks/${duplicateTask.id}`);
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        setError(err.message);
      }
    }
  };

  const handleAddComment = async (content: string) => {
    await commentsApi.create(id, { content });
    await loadComments();
  };

  const handleDeleteComment = async (commentId: string) => {
    await commentsApi.delete(id, commentId);
    await loadComments();
  };

  const handleDeleteLink = async (linkId: string) => {
    await taskLinksApi.delete(id, linkId);
    await loadLinks();
  };

  const handleAddLink = async (data: { url: string; linkType: string; title?: string }) => {
    await taskLinksApi.create(id, data);
    await loadLinks();
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <PageHeaderSkeleton />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          {error || "Task not found"}
        </div>
      </div>
    );
  }

  const StatusIcon = statusIcons[task.status] || Circle;

  // Metadata items for sidebar
  const metaItems = [
    {
      label: "Assignee",
      icon: User,
      content: task.assignee ? (
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
            {task.assignee.name.charAt(0).toUpperCase()}
          </div>
          <span className="font-medium text-sm">{task.assignee.name}</span>
        </div>
      ) : (
        <span className="text-sm italic text-muted-foreground">Unassigned</span>
      ),
    },
    {
      label: "Status",
      icon: StatusIcon,
      content: <StatusBadge status={task.status} />,
    },
    {
      label: "Priority",
      icon: AlertCircle,
      content: <PriorityBadge priority={task.priority} />,
    },
    ...(task.epic
      ? [
          {
            label: "Epic",
            icon: ExternalLink,
            content: (
              <Link
                href={`/epics/${task.epic.id}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                {task.epic.title}
              </Link>
            ),
          },
        ]
      : []),
    ...(task.storyPoints
      ? [
          {
            label: "Story Points",
            icon: CheckCircle2,
            content: (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {task.storyPoints} pts
              </span>
            ),
          },
        ]
      : []),
    ...(task.estimatedHours
      ? [
          {
            label: "Estimated",
            icon: Clock,
            content: <span className="text-sm font-medium">{task.estimatedHours}h</span>,
          },
        ]
      : []),
    ...(task.actualHours
      ? [
          {
            label: "Actual",
            icon: Clock,
            content: <span className="text-sm font-medium">{task.actualHours}h</span>,
          },
        ]
      : []),
    ...(task.startDate
      ? [
          {
            label: "Start Date",
            icon: Calendar,
            content: (
              <span className="text-sm">{new Date(task.startDate).toLocaleDateString()}</span>
            ),
          },
        ]
      : []),
    ...(task.dueDate
      ? [
          {
            label: "Due Date",
            icon: Calendar,
            content: (
              <span
                className={`text-sm ${
                  new Date(task.dueDate) < new Date() ? "text-destructive font-medium" : ""
                }`}
              >
                {new Date(task.dueDate).toLocaleDateString()}
              </span>
            ),
          },
        ]
      : []),
    ...(task.completedAt
      ? [
          {
            label: "Completed",
            icon: CheckCircle2,
            content: (
              <span className="text-sm">{new Date(task.completedAt).toLocaleDateString()}</span>
            ),
          },
        ]
      : []),
    {
      label: "Created",
      icon: Calendar,
      content: (
        <span className="text-sm text-muted-foreground">
          {new Date(task.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      label: "Updated",
      icon: Calendar,
      content: (
        <span className="text-sm text-muted-foreground">
          {new Date(task.updatedAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href={task.epicId ? `/epics/${task.epicId}` : "/tasks"}
          className="hover:text-foreground transition-colors"
        >
          {task.epicId ? (task.epic?.title || "Epic") : "Tasks"}
        </Link>
        <span>/</span>
        <span className="text-foreground truncate max-w-[200px]">{task.title}</span>
      </div>

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <StatusIcon
              className={`h-5 w-5 shrink-0 ${
                task.status === "IN_PROGRESS" ? "animate-spin text-info" : "text-muted-foreground"
              }`}
            />
            <h1 className="text-2xl font-bold tracking-tight truncate">{task.title}</h1>
          </div>
          {task.description && (
            <div className="mt-3 rounded-lg bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {task.description}
              </p>
            </div>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleDuplicate}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/tasks/${task.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Dependencies */}
          <div className="rounded-xl border bg-card">
            <div className="p-6">
              <DependencyManager
                taskId={task.id}
                dependencies={dependencies}
                onDependenciesChange={loadDependencies}
              />
            </div>
          </div>

          {/* External Links */}
          <div className="rounded-xl border bg-card">
            <div className="p-6">
              <h2 className="mb-4 text-lg font-semibold">External Links</h2>
              <TaskLinkList links={links} onDelete={handleDeleteLink} onCreate={handleAddLink} />
            </div>
          </div>

          {/* Comments */}
          <div className="rounded-xl border bg-card">
            <div className="p-6">
              <h2 className="mb-4 text-lg font-semibold">
                Comments
                {comments.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({comments.length})
                  </span>
                )}
              </h2>
              <CommentForm onSubmit={handleAddComment} />
              <div className="mt-6">
                {commentsLoading ? (
                  <div className="text-center text-sm text-muted-foreground">
                    Loading comments...
                  </div>
                ) : (
                  <CommentList comments={comments} onDelete={handleDeleteComment} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Task Details */}
        <div className="space-y-6">
          <div className="rounded-xl border bg-card p-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Details
            </h3>
            <div className="space-y-4">
              {metaItems.map(item => (
                <div key={item.label}>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                    <item.icon className="h-3 w-3" />
                    {item.label}
                  </div>
                  {item.content}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
