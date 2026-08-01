"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Task, Epic, User, CreateTaskRequest, TaskStatus, Priority } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/contexts/AppContext";

interface TaskFormProps {
  task?: Task;
  epicId?: string;
  epic?: Epic;
  users?: User[];
  epics?: Epic[];
}

export function TaskForm({ task, epicId, epic, users = [], epics = [] }: TaskFormProps) {
  const router = useRouter();
  const { createTask, updateTask, fetchEpics } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: task?.title || "",
    description: task?.description || "",
    epicId: task?.epicId || epicId || "",
    assigneeId: task?.assigneeId || "",
    priority: task?.priority || "MEDIUM",
    storyPoints: task?.storyPoints || null,
    estimatedHours: task?.estimatedHours || null,
    actualHours: task?.actualHours || null,
    status: task?.status || "TODO",
    startDate: task?.startDate ? task.startDate.split("T")[0] : "",
    dueDate: task?.dueDate ? task.dueDate.split("T")[0] : "",
  });

  useEffect(() => {
    if (!epics.length) {
      fetchEpics();
    }
  }, [fetchEpics, epics.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const data: CreateTaskRequest = {
        epicId: formData.epicId,
        title: formData.title,
        description: formData.description || undefined,
        assigneeId: formData.assigneeId || undefined,
        priority: formData.priority as Priority,
        storyPoints: formData.storyPoints || undefined,
        estimatedHours: formData.estimatedHours || undefined,
        startDate: formData.startDate || undefined,
        dueDate: formData.dueDate || undefined,
      };

      if (task) {
        await updateTask(task.id, {
          ...data,
          status: formData.status as TaskStatus,
          actualHours: formData.actualHours || undefined,
        });
      } else {
        await createTask(data);
      }

      if (epic) {
        router.push(`/epics/${epic.id}`);
      } else if (formData.epicId) {
        router.push(`/epics/${formData.epicId}`);
      } else {
        router.push("/tasks");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save task");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium">
          Title <span className="text-destructive">*</span>
        </label>
        <Input
          type="text"
          id="title"
          required
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
          className="mt-1 w-full"
          placeholder="Enter task title"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>
        <Textarea
          id="description"
          rows={4}
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          className="mt-1 w-full"
          placeholder="Enter task description"
        />
      </div>

      <div>
        <label htmlFor="epicId" className="block text-sm font-medium">
          Epic <span className="text-destructive">*</span>
        </label>
        <Select
          id="epicId"
          required
          value={formData.epicId}
          onChange={e => setFormData({ ...formData, epicId: e.target.value })}
          className="mt-1 w-full"
          disabled={!!epicId}
        >
          <option value="">Select an epic</option>
          {epics.map(ep => (
            <option key={ep.id} value={ep.id}>
              {ep.title}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label htmlFor="assigneeId" className="block text-sm font-medium">
          Assignee
        </label>
        <Select
          id="assigneeId"
          value={formData.assigneeId}
          onChange={e => setFormData({ ...formData, assigneeId: e.target.value })}
          className="mt-1 w-full"
        >
          <option value="">Unassigned</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </Select>
      </div>

      {task && (
        <div>
          <label htmlFor="status" className="block text-sm font-medium">
            Status
          </label>
          <Select
            id="status"
            value={formData.status}
            onChange={e => setFormData({ ...formData, status: e.target.value as TaskStatus })}
            className="mt-1 w-full"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="DONE">Done</option>
            <option value="BLOCKED">Blocked</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
        </div>
      )}

      <div>
        <label htmlFor="priority" className="block text-sm font-medium">
          Priority
        </label>
        <Select
          id="priority"
          value={formData.priority}
          onChange={e => setFormData({ ...formData, priority: e.target.value as Priority })}
          className="mt-1 w-full"
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="storyPoints" className="block text-sm font-medium">
            Story Points
          </label>
          <Input
            type="number"
            id="storyPoints"
            min="0"
            value={formData.storyPoints || ""}
            onChange={e =>
              setFormData({
                ...formData,
                storyPoints: e.target.value ? parseInt(e.target.value) : null,
              })
            }
            className="mt-1 w-full"
            placeholder="0"
          />
        </div>

        <div>
          <label htmlFor="estimatedHours" className="block text-sm font-medium">
            Estimated Hours <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <Input
            type="number"
            id="estimatedHours"
            min="0"
            step="0.5"
            value={formData.estimatedHours || ""}
            onChange={e =>
              setFormData({
                ...formData,
                estimatedHours: e.target.value ? parseFloat(e.target.value) : null,
              })
            }
            className="mt-1 w-full"
            placeholder="0"
          />
        </div>
      </div>

      {task && (
        <div>
          <label htmlFor="actualHours" className="block text-sm font-medium">
            Actual Hours
          </label>
          <Input
            type="number"
            id="actualHours"
            min="0"
            step="0.5"
            value={formData.actualHours || ""}
            onChange={e =>
              setFormData({
                ...formData,
                actualHours: e.target.value ? parseFloat(e.target.value) : null,
              })
            }
            className="mt-1 w-full"
            placeholder="0"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium">
            Start Date
          </label>
          <Input
            type="date"
            id="startDate"
            value={formData.startDate}
            onChange={e => setFormData({ ...formData, startDate: e.target.value })}
            className="mt-1 w-full"
          />
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium">
            Due Date
          </label>
          <Input
            type="date"
            id="dueDate"
            value={formData.dueDate}
            onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
            className="mt-1 w-full"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? "Saving..." : task ? "Update Task" : "Create Task"}
        </Button>
      </div>
    </form>
  );
}
