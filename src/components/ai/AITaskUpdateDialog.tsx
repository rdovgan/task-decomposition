"use client";

import { useState } from "react";
import { Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Task } from "@/types";
import { aiDecompositionApi, tasksApi, ApiErrorClass } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";

interface AITaskUpdateDialogProps {
  open: boolean;
  onClose: () => void;
  task: Task;
  onApplied: () => void;
}

interface Suggestion {
  title: string;
  description: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  storyPoints: number;
}

export function AITaskUpdateDialog({ open, onClose, task, onApplied }: AITaskUpdateDialogProps) {
  const { user } = useAuth();
  const [instruction, setInstruction] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [applying, setApplying] = useState(false);

  const reset = () => {
    setInstruction("");
    setLoading(false);
    setError(null);
    setSuggestion(null);
    setApplying(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSuggest = async () => {
    setLoading(true);
    setError(null);
    setSuggestion(null);
    try {
      const response = await aiDecompositionApi.updateTask(task.id, {
        userId: user?.id,
        instruction: instruction || undefined,
      });
      setSuggestion(response.data);
    } catch (err) {
      setError(err instanceof ApiErrorClass ? err.message : "Failed to get AI suggestion");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!suggestion) return;
    setApplying(true);
    setError(null);
    try {
      await tasksApi.update(task.id, {
        title: suggestion.title,
        description: suggestion.description,
        priority: suggestion.priority,
        storyPoints: suggestion.storyPoints,
      });
      onApplied();
      handleClose();
    } catch (err) {
      setError(err instanceof ApiErrorClass ? err.message : "Failed to apply update");
    } finally {
      setApplying(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span>Improve Task with AI</span>
        </div>
      }
      size="lg"
      footer={
        suggestion ? (
          <div className="flex w-full justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Discard
            </Button>
            <Button onClick={handleApply} disabled={applying}>
              {applying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : (
                "Apply Update"
              )}
            </Button>
          </div>
        ) : null
      }
    >
      <div className="space-y-4">
        <div className="rounded-lg bg-muted p-4">
          <div className="text-sm font-medium">Current Task</div>
          <div className="mt-1 text-lg font-semibold">{task.title}</div>
        </div>

        {!suggestion && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Instruction (Optional)</label>
            <Textarea
              value={instruction}
              onChange={e => setInstruction(e.target.value)}
              placeholder="e.g. 'Tighten the scope to just the API changes' or leave blank to let the AI improve clarity and estimate"
              className="min-h-[100px] w-full"
            />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-destructive" />
              <div className="flex-1 text-sm text-destructive/90">{error}</div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">Asking AI for a revised task...</p>
          </div>
        )}

        {!loading && suggestion && (
          <div className="space-y-3 rounded-lg border bg-card p-4">
            <div className="text-sm font-medium">Suggested Update</div>

            <Input
              type="text"
              value={suggestion.title}
              onChange={e => setSuggestion({ ...suggestion, title: e.target.value })}
              className="w-full font-medium"
            />

            <Textarea
              value={suggestion.description}
              onChange={e => setSuggestion({ ...suggestion, description: e.target.value })}
              rows={4}
              className="w-full"
            />

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Points:</label>
                <Select
                  value={suggestion.storyPoints}
                  onChange={e =>
                    setSuggestion({ ...suggestion, storyPoints: parseInt(e.target.value) })
                  }
                  size="sm"
                  className="w-auto"
                >
                  {[1, 2, 3, 5, 8, 13].map(p => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground">Priority:</label>
                <Select
                  value={suggestion.priority}
                  onChange={e =>
                    setSuggestion({ ...suggestion, priority: e.target.value as Suggestion["priority"] })
                  }
                  size="sm"
                  className="w-auto"
                >
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </Select>
              </div>
            </div>
          </div>
        )}

        {!loading && !suggestion && (
          <div className="flex justify-center pt-2">
            <Button size="lg" onClick={handleSuggest} className="gap-2">
              <Sparkles className="h-5 w-5" />
              Suggest Update
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  );
}
