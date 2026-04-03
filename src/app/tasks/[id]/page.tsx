'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Calendar, User, Clock, AlertCircle, Copy } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { Button } from '@/components/ui/button';
import { CommentList } from '@/components/tasks/CommentList';
import { CommentForm } from '@/components/tasks/CommentForm';
import { TaskLinkList } from '@/components/tasks/TaskLinkList';
import { DependencyManager } from '@/components/tasks/DependencyManager';
import { Task, Comment, TaskLink, Dependency } from '@/types';
import { tasksApi, commentsApi, taskLinksApi, dependenciesApi, ApiErrorClass } from '@/lib/api-client';

export default function TaskDetailPage({ params }: { params: { id: string } }) {
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
  }, [params.id]);

  async function loadTask() {
    setLoading(true);
    setError(null);
    try {
      const taskData = await tasksApi.get(params.id);
      setTask(taskData);
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

  async function loadComments() {
    setCommentsLoading(true);
    try {
      const commentsData = await commentsApi.list(params.id);
      setComments(commentsData);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setCommentsLoading(false);
    }
  }

  async function loadLinks() {
    try {
      const linksData = await taskLinksApi.list(params.id);
      setLinks(linksData);
    } catch (err) {
      console.error('Failed to load links:', err);
    }
  }

  async function loadDependencies() {
    try {
      const dependenciesData = await dependenciesApi.list(params.id);
      setDependencies(dependenciesData);
    } catch (err) {
      console.error('Failed to load dependencies:', err);
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await tasksApi.delete(params.id);
      if (task?.epicId) {
        router.push(`/epics/${task.epicId}`);
      } else {
        router.push('/tasks');
      }
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        setError(err.message);
      }
    }
  };

  const handleDuplicate = async () => {
    if (!task) return;

    const duplicateTitle = prompt(
      'Enter title for the duplicate task:',
      `${task.title} (copy)`
    );

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

      // Navigate to the new task
      router.push(`/tasks/${duplicateTask.id}`);
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        setError(err.message);
      }
    }
  };

  const handleAddComment = async (content: string) => {
    await commentsApi.create(params.id, { content });
    await loadComments();
  };

  const handleDeleteComment = async (commentId: string) => {
    await commentsApi.delete(params.id, commentId);
    await loadComments();
  };

  const handleDeleteLink = async (linkId: string) => {
    await taskLinksApi.delete(params.id, linkId);
    await loadLinks();
  };

  const handleAddLink = async (data: { url: string; linkType: string; title?: string }) => {
    await taskLinksApi.create(params.id, data);
    await loadLinks();
  };

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

  const dependencyColumns = [
    {
      key: 'type',
      title: 'Type',
      render: (value: unknown) => {
        const type = value as string;
        const typeColors: Record<string, string> = {
          BLOCKS: 'bg-destructive/10 text-destructive',
          RELATED_TO: 'bg-primary/10 text-primary',
          DUPLICATES: 'bg-muted text-muted-foreground',
        };
        return (
          <span className={`rounded-full px-2 py-1 text-xs font-medium ${typeColors[type] || ''}`}>
            {type.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      key: 'dependsOnTaskId',
      title: 'Depends On',
      render: (value: unknown) => (
        <Link
          href={`/tasks/${value}`}
          className="text-primary hover:underline"
        >
          Task {String(value).slice(0, 8)}
        </Link>
      ),
    },
  ];

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <Link
          href={task.epicId ? `/epics/${task.epicId}` : '/tasks'}
          className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {task.epicId ? 'Back to Epic' : 'Back to Tasks'}
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">{task.title}</h1>
            {task.description && (
              <div className="mt-4 prose max-w-none">
                <p className="text-muted-foreground whitespace-pre-wrap">{task.description}</p>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDuplicate}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </Button>
            <Button variant="outline" onClick={() => router.push(`/tasks/${task.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Details Section */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">Task Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>Assignee</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  {task.assignee ? (
                    <>
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                        {task.assignee.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{task.assignee.name}</span>
                    </>
                  ) : (
                    <span className="italic text-muted-foreground">Unassigned</span>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span>Status</span>
                </div>
                <div className="mt-1">
                  <StatusBadge status={task.status} />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span>Priority</span>
                </div>
                <div className="mt-1">
                  <PriorityBadge priority={task.priority} />
                </div>
              </div>

              {task.epic && (
                <div>
                  <div className="text-sm text-muted-foreground">Epic</div>
                  <div className="mt-1">
                    <Link
                      href={`/epics/${task.epic.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {task.epic.title}
                    </Link>
                  </div>
                </div>
              )}

              {task.storyPoints && (
                <div>
                  <div className="text-sm text-muted-foreground">Story Points</div>
                  <div className="mt-1 font-medium">{task.storyPoints} pts</div>
                </div>
              )}

              {task.estimatedHours && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Time Estimate</span>
                  </div>
                  <div className="mt-1 font-medium">{task.estimatedHours}h</div>
                </div>
              )}

              {task.actualHours && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Actual Hours</span>
                  </div>
                  <div className="mt-1 font-medium">{task.actualHours}h</div>
                </div>
              )}

              {task.startDate && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Start Date</span>
                  </div>
                  <div className="mt-1 font-medium">{new Date(task.startDate).toLocaleDateString()}</div>
                </div>
              )}

              {task.dueDate && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Due Date</span>
                  </div>
                  <div className="mt-1 font-medium">{new Date(task.dueDate).toLocaleDateString()}</div>
                </div>
              )}

              {task.completedAt && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Completed</span>
                  </div>
                  <div className="mt-1 font-medium">{new Date(task.completedAt).toLocaleDateString()}</div>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Created</span>
                </div>
                <div className="mt-1 font-medium">{new Date(task.createdAt).toLocaleDateString()}</div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Updated</span>
                </div>
                <div className="mt-1 font-medium">{new Date(task.updatedAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          {/* Dependencies Section */}
          <div className="rounded-lg border bg-card p-6">
            <DependencyManager
              taskId={task.id}
              dependencies={dependencies}
              onDependenciesChange={loadDependencies}
            />
          </div>

          {/* Links Section */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">External Links</h2>
            <TaskLinkList
              links={links}
              onDelete={handleDeleteLink}
              onCreate={handleAddLink}
            />
          </div>

          {/* Comments Section */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold">Comments</h2>
            <CommentForm onSubmit={handleAddComment} />
            <div className="mt-6">
              {commentsLoading ? (
                <div className="text-center text-muted-foreground">Loading comments...</div>
              ) : (
                <CommentList
                  comments={comments}
                  onDelete={handleDeleteComment}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
