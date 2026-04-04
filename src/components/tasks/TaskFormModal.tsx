"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Task, Epic, User, CreateTaskRequest, TaskStatus, Priority } from "@/types";
import { TaskFormData } from "@/lib/validations/task";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { taskFormSchema } from "@/lib/validations/task";
import { useApp } from "@/contexts/AppContext";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface TaskFormModalProps {
  open: boolean;
  onClose: () => void;
  task?: Task;
  epicId?: string;
  epic?: Epic;
  users?: User[];
  mode: "create" | "edit";
}

export function TaskFormModal({
  open,
  onClose,
  task,
  epicId,
  epic,
  users = [],
  mode,
}: TaskFormModalProps) {
  const router = useRouter();
  const { createTask, updateTask, fetchEpics, epics } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState({
    title: task?.title || "",
    description: task?.description || "",
    epicId: task?.epicId || epicId || "",
    assigneeId: task?.assigneeId || "",
    priority: task?.priority || "MEDIUM",
    storyPoints: task?.storyPoints?.toString() || "",
    estimatedHours: task?.estimatedHours?.toString() || "",
    actualHours: task?.actualHours?.toString() || "",
    status: task?.status || "TODO",
    startDate: task?.startDate ? task.startDate.split("T")[0] : "",
    dueDate: task?.dueDate ? task.dueDate.split("T")[0] : "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormData, string>>>({});

  useEffect(() => {
    if (open && !task) {
      // Reset form when opening for create mode
      setFormData({
        title: "",
        description: "",
        epicId: epicId || "",
        assigneeId: "",
        priority: "MEDIUM",
        storyPoints: "",
        estimatedHours: "",
        actualHours: "",
        status: "TODO",
        startDate: "",
        dueDate: "",
      });
      setErrors({});
      setError(null);
      setSuccess(false);

      // Auto-focus title input
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 100);
    }
  }, [open, task, epicId]);

  useEffect(() => {
    if (!epics.length && open) {
      fetchEpics();
    }
  }, [fetchEpics, epics.length, open]);

  const validateForm = () => {
    try {
      taskFormSchema.parse({
        title: formData.title,
        description: formData.description,
        epicId: formData.epicId,
        assigneeId: formData.assigneeId || undefined,
        priority: formData.priority as Priority,
        storyPoints: formData.storyPoints ? parseInt(formData.storyPoints) : null,
        estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
        actualHours: formData.actualHours ? parseFloat(formData.actualHours) : null,
        startDate: formData.startDate,
        dueDate: formData.dueDate,
        status: formData.status as TaskStatus,
      });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof Error && "issues" in err) {
        const zodError = err as { issues: Array<{ path: string[]; message: string }> };
        const newErrors: Partial<Record<keyof TaskFormData, string>> = {};
        zodError.issues.forEach(issue => {
          const field = issue.path[0] as keyof TaskFormData;
          newErrors[field] = issue.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
    e?.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const data: CreateTaskRequest = {
        epicId: formData.epicId,
        title: formData.title,
        description: formData.description || undefined,
        assigneeId: formData.assigneeId || undefined,
        priority: formData.priority as Priority,
        storyPoints: formData.storyPoints ? parseInt(formData.storyPoints) : undefined,
        estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined,
        startDate: formData.startDate || undefined,
        dueDate: formData.dueDate || undefined,
      };

      if (mode === "edit" && task) {
        await updateTask(task.id, {
          ...data,
          status: formData.status as TaskStatus,
          actualHours: formData.actualHours ? parseFloat(formData.actualHours) : undefined,
        });
      } else {
        await createTask(data);
      }

      setSuccess(true);

      // Close modal after short delay
      setTimeout(() => {
        onClose();
        // Navigate to epic page if available
        if (epic) {
          router.push(`/epics/${epic.id}`);
        } else if (formData.epicId) {
          router.push(`/epics/${formData.epicId}`);
        } else {
          router.refresh();
        }
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${mode} task`);
      console.error(`${mode} task error:`, err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  const modalTitle = mode === "create" ? "Create New Task" : "Edit Task";
  const submitButtonText = submitting
    ? "Saving..."
    : mode === "create"
      ? "Create Task"
      : "Update Task";

  return (
    <Dialog open={open} onClose={onClose} title={modalTitle} size="lg">
      {success ? (
        <div className="flex flex-col items-center justify-center py-12">
          <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Success!</h3>
          <p className="text-muted-foreground">
            Task {mode === "create" ? "created" : "updated"} successfully
          </p>
        </div>
      ) : (
        <form ref={formRef} onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              ref={titleInputRef}
              type="text"
              id="title"
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Enter task title"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "title-error" : undefined}
            />
            {errors.title && (
              <p id="title-error" className="mt-1 text-xs text-destructive">
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Enter task description (supports Markdown)"
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? "description-error" : undefined}
            />
            {errors.description && (
              <p id="description-error" className="mt-1 text-xs text-destructive">
                {errors.description}
              </p>
            )}
          </div>

          {/* Epic */}
          <div>
            <label htmlFor="epicId" className="block text-sm font-medium mb-1">
              Epic <span className="text-destructive">*</span>
            </label>
            <select
              id="epicId"
              required
              value={formData.epicId}
              onChange={e => setFormData({ ...formData, epicId: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              disabled={!!epicId || !!epic}
              aria-invalid={!!errors.epicId}
              aria-describedby={errors.epicId ? "epicId-error" : undefined}
            >
              <option value="">Select an epic</option>
              {epics.map(ep => (
                <option key={ep.id} value={ep.id}>
                  {ep.title}
                </option>
              ))}
            </select>
            {errors.epicId && (
              <p id="epicId-error" className="mt-1 text-xs text-destructive">
                {errors.epicId}
              </p>
            )}
          </div>

          {/* Assignee */}
          <div>
            <label htmlFor="assigneeId" className="block text-sm font-medium mb-1">
              Assignee
            </label>
            <select
              id="assigneeId"
              value={formData.assigneeId}
              onChange={e => setFormData({ ...formData, assigneeId: e.target.value })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Unassigned</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          {/* Status (only for edit mode) */}
          {mode === "edit" && (
            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-1">
                Status
              </label>
              <select
                id="status"
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="DONE">Done</option>
                <option value="BLOCKED">Blocked</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          )}

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium mb-1">
              Priority <span className="text-destructive">*</span>
            </label>
            <select
              id="priority"
              value={formData.priority}
              onChange={e => setFormData({ ...formData, priority: e.target.value as Priority })}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-invalid={!!errors.priority}
              aria-describedby={errors.priority ? "priority-error" : undefined}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
            {errors.priority && (
              <p id="priority-error" className="mt-1 text-xs text-destructive">
                {errors.priority}
              </p>
            )}
          </div>

          {/* Story Points and Estimated Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="storyPoints" className="block text-sm font-medium mb-1">
                Story Points
              </label>
              <input
                type="number"
                id="storyPoints"
                min="0"
                max="13"
                value={formData.storyPoints}
                onChange={e => setFormData({ ...formData, storyPoints: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="1-13"
                aria-invalid={!!errors.storyPoints}
                aria-describedby={errors.storyPoints ? "storyPoints-error" : undefined}
              />
              {errors.storyPoints && (
                <p id="storyPoints-error" className="mt-1 text-xs text-destructive">
                  {errors.storyPoints}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="estimatedHours" className="block text-sm font-medium mb-1">
                Estimated Hours
              </label>
              <input
                type="number"
                id="estimatedHours"
                min="0"
                step="0.5"
                value={formData.estimatedHours}
                onChange={e => setFormData({ ...formData, estimatedHours: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="0"
                aria-invalid={!!errors.estimatedHours}
                aria-describedby={errors.estimatedHours ? "estimatedHours-error" : undefined}
              />
              {errors.estimatedHours && (
                <p id="estimatedHours-error" className="mt-1 text-xs text-destructive">
                  {errors.estimatedHours}
                </p>
              )}
            </div>
          </div>

          {/* Actual Hours (only for edit mode) */}
          {mode === "edit" && (
            <div>
              <label htmlFor="actualHours" className="block text-sm font-medium mb-1">
                Actual Hours
              </label>
              <input
                type="number"
                id="actualHours"
                min="0"
                step="0.5"
                value={formData.actualHours}
                onChange={e => setFormData({ ...formData, actualHours: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="0"
                aria-invalid={!!errors.actualHours}
                aria-describedby={errors.actualHours ? "actualHours-error" : undefined}
              />
              {errors.actualHours && (
                <p id="actualHours-error" className="mt-1 text-xs text-destructive">
                  {errors.actualHours}
                </p>
              )}
            </div>
          )}

          {/* Start Date and Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium mb-1">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium mb-1">
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                value={formData.dueDate}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          {/* Last Updated (only for edit mode) */}
          {mode === "edit" && task && (
            <div className="text-sm text-muted-foreground">
              Last updated: {new Date(task.updatedAt).toLocaleString()}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting || success}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={submitting || success}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitButtonText}
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
