'use client';

import { useState } from 'react';
import { Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { AITaskSuggestion, AIDecompositionResponse } from '@/types';
import { tasksApi, ApiErrorClass } from '@/lib/api-client';
import { useRouter } from 'next/navigation';

interface AIDecompositionDialogProps {
  open: boolean;
  onClose: () => void;
  epicId: string;
  epicTitle: string;
  suggestions: AITaskSuggestion[] | null;
  loading: boolean;
  error: string | null;
  meta: AIDecompositionResponse['meta'] | null;
  onGenerate: (customPrompt?: string) => void;
}

export function AIDecompositionDialog({
  open,
  onClose,
  epicId,
  epicTitle,
  suggestions,
  loading,
  error,
  meta,
  onGenerate,
}: AIDecompositionDialogProps) {
  const router = useRouter();
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [editedSuggestions, setEditedSuggestions] = useState<AITaskSuggestion[]>([]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Update edited suggestions when new suggestions come in
  if (suggestions && editedSuggestions.length === 0 && !loading) {
    setEditedSuggestions(suggestions);
  }

  const handleGenerate = () => {
    setEditedSuggestions([]);
    setCreateError(null);
    onGenerate(customPrompt || undefined);
  };

  const handleCreateTasks = async () => {
    setCreating(true);
    setCreateError(null);

    try {
      // Create all tasks
      const createPromises = editedSuggestions.map((suggestion) =>
        tasksApi.create({
          epicId,
          title: suggestion.title,
          description: suggestion.description,
          priority: suggestion.priority as any,
          storyPoints: suggestion.storyPoints,
        })
      );

      await Promise.all(createPromises);

      // Close dialog and refresh the page
      onClose();
      router.refresh();
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        setCreateError(err.message);
      } else {
        setCreateError('Failed to create tasks');
      }
    } finally {
      setCreating(false);
    }
  };

  const handleEditSuggestion = (index: number, field: keyof AITaskSuggestion, value: string | number) => {
    const updated = [...editedSuggestions];
    updated[index] = { ...updated[index], [field]: value };
    setEditedSuggestions(updated);
  };

  const handleRemoveSuggestion = (index: number) => {
    const updated = editedSuggestions.filter((_, i) => i !== index);
    setEditedSuggestions(updated);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span>AI Task Decomposition</span>
        </div>
      }
      size="xl"
      footer={
        !loading && !error && editedSuggestions.length > 0 ? (
          <div className="flex w-full items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {editedSuggestions.length} task{editedSuggestions.length !== 1 ? 's' : ''} suggested
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleCreateTasks} disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  `Create ${editedSuggestions.length} Task${editedSuggestions.length !== 1 ? 's' : ''}`
                )}
              </Button>
            </div>
          </div>
        ) : null
      }
    >
      <div className="space-y-4">
        {/* Epic Info */}
        <div className="rounded-lg bg-muted p-4">
          <div className="text-sm font-medium">Decomposing Epic</div>
          <div className="mt-1 text-lg font-semibold">{epicTitle}</div>
        </div>

        {/* Custom Prompt Input */}
        {!loading && !suggestions && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Custom Prompt (Optional)</label>
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0"
                onClick={() => setShowCustomPrompt(!showCustomPrompt)}
              >
                {showCustomPrompt ? 'Hide' : 'Show'}
              </Button>
            </div>
            {showCustomPrompt && (
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Provide additional context or requirements for the task decomposition..."
                className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">
              Generating task suggestions with Claude AI...
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              This may take 10-30 seconds
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-destructive" />
              <div className="flex-1">
                <div className="font-medium text-destructive">Decomposition Failed</div>
                <div className="mt-1 text-sm text-destructive/90">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Create Error */}
        {createError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-destructive" />
              <div className="flex-1">
                <div className="font-medium text-destructive">Failed to Create Tasks</div>
                <div className="mt-1 text-sm text-destructive/90">{createError}</div>
              </div>
            </div>
          </div>
        )}

        {/* Suggestions List */}
        {!loading && !error && editedSuggestions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Suggested Tasks</h3>
              {meta && (
                <div className="text-sm text-muted-foreground">
                  Generated in {meta.decompositionTime.toFixed(1)}s using {meta.modelUsed}
                </div>
              )}
            </div>

            {editedSuggestions.map((suggestion, index) => (
              <div
                key={index}
                className="rounded-lg border bg-card p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Title */}
                    <input
                      type="text"
                      value={suggestion.title}
                      onChange={(e) => handleEditSuggestion(index, 'title', e.target.value)}
                      className="w-full rounded border border-input bg-background px-3 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />

                    {/* Description */}
                    <textarea
                      value={suggestion.description}
                      onChange={(e) => handleEditSuggestion(index, 'description', e.target.value)}
                      rows={3}
                      className="w-full rounded border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-muted-foreground">Points:</label>
                        <select
                          value={suggestion.storyPoints}
                          onChange={(e) => handleEditSuggestion(index, 'storyPoints', parseInt(e.target.value))}
                          className="rounded border border-input bg-background px-2 py-1 text-xs"
                        >
                          <option value={1}>1</option>
                          <option value={2}>2</option>
                          <option value={3}>3</option>
                          <option value={5}>5</option>
                          <option value={8}>8</option>
                          <option value={13}>13</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-xs text-muted-foreground">Priority:</label>
                        <select
                          value={suggestion.priority}
                          onChange={(e) => handleEditSuggestion(index, 'priority', e.target.value)}
                          className="rounded border border-input bg-background px-2 py-1 text-xs"
                        >
                          <option value="CRITICAL">Critical</option>
                          <option value="HIGH">High</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="LOW">Low</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveSuggestion(index)}
                    className="flex-shrink-0"
                  >
                    <AlertCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Generate Button (Initial State) */}
        {!loading && !error && !suggestions && (
          <div className="flex justify-center pt-4">
            <Button size="lg" onClick={handleGenerate} className="gap-2">
              <Sparkles className="h-5 w-5" />
              Generate Task Suggestions
            </Button>
          </div>
        )}

        {/* Retry Button */}
        {!loading && error && (
          <div className="flex justify-center pt-4">
            <Button size="lg" onClick={handleGenerate} variant="outline">
              Try Again
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  );
}
