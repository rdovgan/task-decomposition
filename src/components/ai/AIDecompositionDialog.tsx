"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles, CheckCircle2, AlertCircle, Download } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { AITaskSuggestion, AIDecompositionResponse, TeamConfig } from "@/types";
import { tasksApi, teamConfigApi, ApiErrorClass } from "@/lib/api-client";
import { generateSuggestionsMarkdown, downloadMarkdown } from "@/lib/export-md";
import { useRouter } from "next/navigation";

interface AIDecompositionDialogProps {
  open: boolean;
  onClose: () => void;
  epicId: string;
  epicTitle: string;
  suggestions: AITaskSuggestion[] | null;
  loading: boolean;
  error: string | null;
  meta: AIDecompositionResponse["meta"] | null;
  onGenerate: (customPrompt?: string, teamConfigId?: string) => void;
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
  const [customPrompt, setCustomPrompt] = useState("");
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [editedSuggestions, setEditedSuggestions] = useState<AITaskSuggestion[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [teamConfigs, setTeamConfigs] = useState<TeamConfig[]>([]);
  const [selectedTeamConfigId, setSelectedTeamConfigId] = useState<string>("");

  // Load team presets so the user can tell the AI what team is doing the work
  // (affects whether QA/testing tasks are generated separately)
  useEffect(() => {
    if (!open) return;
    teamConfigApi
      .list()
      .then(configs => {
        setTeamConfigs(configs);
        const defaultConfig = configs.find(c => c.isDefault);
        if (defaultConfig) setSelectedTeamConfigId(defaultConfig.id);
      })
      .catch(() => {
        // Team presets are optional context for the AI call — silently ignore load failures
      });
  }, [open]);

  // Sync local editable copy whenever a new suggestions array arrives from the API
  useEffect(() => {
    if (suggestions) {
      setEditedSuggestions(suggestions);
      setSelectedIndices(new Set());
    }
  }, [suggestions]);

  // Tasks to act on (create/export): the checked subset, or all of them if none are checked
  const tasksToUse = selectedIndices.size > 0
    ? editedSuggestions.filter((_, i) => selectedIndices.has(i))
    : editedSuggestions;

  const handleGenerate = () => {
    setEditedSuggestions([]);
    setSelectedIndices(new Set());
    setCreateError(null);
    onGenerate(customPrompt || undefined, selectedTeamConfigId || undefined);
  };

  const toggleSelected = (index: number) => {
    setSelectedIndices(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleCreateTasks = async () => {
    setCreating(true);
    setCreateError(null);

    try {
      // Create the reviewed (checked, or all if none checked) tasks
      const createPromises = tasksToUse.map(suggestion =>
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
        setCreateError("Failed to create tasks");
      }
    } finally {
      setCreating(false);
    }
  };

  const handleEditSuggestion = (
    index: number,
    field: keyof AITaskSuggestion,
    value: string | number
  ) => {
    const updated = [...editedSuggestions];
    updated[index] = { ...updated[index], [field]: value };
    setEditedSuggestions(updated);
  };

  const handleRemoveSuggestion = (index: number) => {
    const updated = editedSuggestions.filter((_, i) => i !== index);
    setEditedSuggestions(updated);
    setSelectedIndices(prev => {
      const next = new Set<number>();
      for (const i of prev) {
        if (i === index) continue;
        next.add(i > index ? i - 1 : i);
      }
      return next;
    });
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
              {selectedIndices.size > 0
                ? `${selectedIndices.size} of ${editedSuggestions.length} task${editedSuggestions.length !== 1 ? "s" : ""} selected`
                : `${editedSuggestions.length} task${editedSuggestions.length !== 1 ? "s" : ""} suggested (none checked — all will be used)`}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const md = generateSuggestionsMarkdown({
                    epicTitle,
                    suggestions: tasksToUse,
                    decompositionTime: meta?.decompositionTime,
                    modelUsed: meta?.modelUsed,
                  });
                  downloadMarkdown(md, `${epicTitle.replace(/\s+/g, "-").toLowerCase()}-tasks.md`);
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Export .md
              </Button>
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
                  `Create ${tasksToUse.length} Task${tasksToUse.length !== 1 ? "s" : ""}`
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

        {/* Team Preset */}
        {!loading && !suggestions && teamConfigs.length > 0 && (
          <div className="space-y-1">
            <label htmlFor="team-config-select" className="text-sm font-medium">
              Team (Optional)
            </label>
            <Select
              id="team-config-select"
              value={selectedTeamConfigId}
              onChange={e => setSelectedTeamConfigId(e.target.value)}
              className="w-full"
            >
              <option value="">No team specified</option>
              {teamConfigs.map(config => (
                <option key={config.id} value={config.id}>
                  {config.name}
                </option>
              ))}
            </Select>
            <p className="text-xs text-muted-foreground">
              If the team has a QA member, testing tasks may be suggested separately; otherwise
              testing time is folded into each dev task.
            </p>
          </div>
        )}

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
                {showCustomPrompt ? "Hide" : "Show"}
              </Button>
            </div>
            {showCustomPrompt && (
              <Textarea
                value={customPrompt}
                onChange={e => setCustomPrompt(e.target.value)}
                placeholder="Provide additional context or requirements for the task decomposition..."
                className="min-h-[100px] w-full"
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
            <p className="mt-2 text-sm text-muted-foreground">This may take up to 2-3 minutes</p>
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
            <p className="text-xs text-muted-foreground">
              Check the tasks you want to create. If none are checked, all of them will be created.
            </p>

            {editedSuggestions.map((suggestion, index) => {
              const isSelected = selectedIndices.has(index);
              return (
              <div
                key={index}
                className={`rounded-lg border bg-card p-4 shadow-sm transition-colors ${isSelected ? "border-primary/60 ring-1 ring-primary/20" : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelected(index)}
                    className="mt-2 h-4 w-4 shrink-0 rounded border-input"
                    aria-label={`Select task: ${suggestion.title}`}
                  />
                  <div className="flex-1 space-y-3">
                    {/* Title */}
                    <Input
                      type="text"
                      value={suggestion.title}
                      onChange={e => handleEditSuggestion(index, "title", e.target.value)}
                      className="w-full font-medium"
                    />

                    {/* Description */}
                    <Textarea
                      value={suggestion.description}
                      onChange={e => handleEditSuggestion(index, "description", e.target.value)}
                      rows={3}
                      className="w-full"
                    />

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-muted-foreground">Points:</label>
                        <Select
                          value={suggestion.storyPoints}
                          onChange={e =>
                            handleEditSuggestion(index, "storyPoints", parseInt(e.target.value))
                          }
                          size="sm"
                          className="w-auto"
                        >
                          <option value={1}>1</option>
                          <option value={2}>2</option>
                          <option value={3}>3</option>
                          <option value={5}>5</option>
                          <option value={8}>8</option>
                          <option value={13}>13</option>
                        </Select>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-xs text-muted-foreground">Priority:</label>
                        <Select
                          value={suggestion.priority}
                          onChange={e => handleEditSuggestion(index, "priority", e.target.value)}
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
              );
            })}
          </div>
        )}

        {/* Empty State: AI ran but suggested nothing to do */}
        {!loading && !error && suggestions && editedSuggestions.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">
              The AI didn&apos;t suggest any tasks for this epic. Try adding more detail to the
              epic description, or use a custom prompt.
            </p>
            <Button onClick={handleGenerate} variant="outline">
              Try Again
            </Button>
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
