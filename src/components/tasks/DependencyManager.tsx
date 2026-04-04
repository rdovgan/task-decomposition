"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Dependency, Task } from "@/types";
import { dependenciesApi, tasksApi, ApiErrorClass } from "@/lib/api-client";

interface DependencyManagerProps {
  taskId: string;
  dependencies: Dependency[];
  onDependenciesChange: () => void;
}

export function DependencyManager({
  taskId,
  dependencies,
  onDependenciesChange,
}: DependencyManagerProps) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAvailableTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await tasksApi.list({ limit: 100 });
      // Filter out the current task and already linked tasks
      const filtered = response.data.filter(
        t => t.id !== taskId && !dependencies.some(d => d.dependsOnTaskId === t.id)
      );
      setAvailableTasks(filtered);
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setShowAddDialog(true);
    loadAvailableTasks();
  };

  const handleAddDependency = async (dependsOnTaskId: string) => {
    setAdding(true);
    setError(null);
    try {
      await dependenciesApi.create(taskId, { dependsOnTaskId, type: "BLOCKS" });
      setShowAddDialog(false);
      onDependenciesChange();
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        setError(err.message);
      } else {
        setError("Failed to add dependency");
      }
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteDependency = async (dependencyId: string) => {
    if (!confirm("Are you sure you want to remove this dependency?")) {
      return;
    }

    try {
      await dependenciesApi.delete(taskId, dependencyId);
      onDependenciesChange();
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        setError(err.message);
      }
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Dependencies</h3>
        <Button variant="outline" size="sm" onClick={handleOpenDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Dependency
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      )}

      {dependencies.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
          <p>No dependencies yet. Click "Add Dependency" to create one.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {dependencies.map(dep => (
            <div
              key={dep.id}
              className="flex items-center justify-between rounded-lg border bg-card p-4"
            >
              <div className="flex items-center gap-4">
                <span className="rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
                  BLOCKS
                </span>
                <span className="text-sm">
                  This task blocks{" "}
                  <code className="rounded bg-muted px-2 py-1 text-xs">
                    Task {dep.dependsOnTaskId.slice(0, 8)}
                  </code>
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteDependency(dep.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        title="Add Dependency"
        size="md"
      >
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
                {error}
              </div>
            )}

            {availableTasks.length === 0 ? (
              <p className="text-center text-muted-foreground">No available tasks to link.</p>
            ) : (
              <div className="max-h-96 space-y-2 overflow-y-auto">
                <p className="text-sm text-muted-foreground">
                  Select a task that this task blocks:
                </p>
                {availableTasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-lg border bg-card p-4 hover:bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{task.title}</p>
                      {task.description && (
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAddDependency(task.id)}
                      disabled={adding}
                    >
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
