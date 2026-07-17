"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Upload,
  Sparkles,
  FileText,
  Users,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertCircle,
  Settings,
  Layers,
  FolderKanban,
  Zap,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  decomposeApi,
  teamConfigApi,
  ApiErrorClass,
} from "@/lib/api-client";
import {
  TeamConfig,
  TeamMember,
  DecomposeTask,
  QuickDecomposeResponse,
} from "@/types";
import { generateTasksMarkdown, downloadMarkdown } from "@/lib/export-md";

const SPECIALTIES = [
  "frontend",
  "backend",
  "java",
  "python",
  "ui/ux",
  "qa",
  "devops",
  "mobile",
  "data",
  "architect",
  "fullstack",
  "dba",
];

const ROLES: TeamMember["role"][] = ["junior", "middle", "senior", "lead", "architect"];

export default function Home() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState("");
  const [textInput, setTextInput] = useState("");
  const [inputMode, setInputMode] = useState<"pdf" | "text">("pdf");

  // Team state
  const [teamConfigs, setTeamConfigs] = useState<TeamConfig[]>([]);
  const [selectedTeamConfigId, setSelectedTeamConfigId] = useState<string>("");
  const [customTeam, setCustomTeam] = useState<TeamMember[]>([]);
  const [showTeamBuilder, setShowTeamBuilder] = useState(false);
  const [showTeamConfigManager, setShowTeamConfigManager] = useState(false);

  // New team config form
  const [newConfigName, setNewConfigName] = useState("");
  const [newConfigDesc, setNewConfigDesc] = useState("");

  // Decomposition state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QuickDecomposeResponse | null>(null);

  // Review/selection state (for the results view)
  const [selectedOrders, setSelectedOrders] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Stats
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadTeamConfigs();
  }, []);

  const loadTeamConfigs = async () => {
    try {
      const configs = await teamConfigApi.list();
      setTeamConfigs(configs);
      const defaultConfig = configs.find((c: TeamConfig) => c.isDefault);
      if (defaultConfig) {
        setSelectedTeamConfigId(defaultConfig.id);
      }
    } catch {}
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      if (f.type !== "application/pdf" && !f.name.endsWith(".pdf")) {
        setError("Please upload a PDF file");
        return;
      }
      setFile(f);
      if (!projectName) {
        setProjectName(f.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " "));
      }
      setError(null);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer.files?.[0];
    if (f && (f.type === "application/pdf" || f.name.endsWith(".pdf"))) {
      setFile(f);
      if (!projectName) {
        setProjectName(f.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " "));
      }
      setError(null);
    }
  }, [projectName]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const addTeamMember = () => {
    setCustomTeam([...customTeam, { role: "middle", specialty: "backend", count: 1 }]);
  };

  const removeTeamMember = (index: number) => {
    setCustomTeam(customTeam.filter((_, i) => i !== index));
  };

  const updateTeamMember = (index: number, field: keyof TeamMember, value: string | number) => {
    const updated = [...customTeam];
    updated[index] = { ...updated[index], [field]: value };
    setCustomTeam(updated);
  };

  const handleDecompose = async () => {
    if (inputMode === "pdf" && !file) {
      setError("Please upload a PDF file");
      return;
    }
    if (inputMode === "text" && textInput.trim().length < 20) {
      setError("Please enter at least 20 characters of requirements text");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const teamData =
        selectedTeamConfigId === "custom"
          ? customTeam.length > 0
            ? JSON.stringify(customTeam)
            : undefined
          : selectedTeamConfigId || undefined;

      let response;

      if (inputMode === "pdf" && file) {
        response = await decomposeApi.quick(file, {
          projectName: projectName || undefined,
          teamConfigId: selectedTeamConfigId !== "custom" ? selectedTeamConfigId || undefined : undefined,
          customTeam: selectedTeamConfigId === "custom" ? teamData : undefined,
        });
      } else {
        response = await decomposeApi.text({
          text: textInput,
          projectName: projectName || undefined,
          teamConfigId: selectedTeamConfigId !== "custom" ? selectedTeamConfigId || undefined : undefined,
          customTeam: selectedTeamConfigId === "custom" ? teamData : undefined,
        });
      }

      setResult(response.data);
      setSelectedOrders(new Set());
      setSaveError(null);
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        setError(err.message);
      } else {
        setError("Decomposition failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskSelection = (order: number) => {
    setSelectedOrders(prev => {
      const next = new Set(prev);
      if (next.has(order)) {
        next.delete(order);
      } else {
        next.add(order);
      }
      return next;
    });
  };

  const getTasksToUse = () => {
    if (!result) return [];
    return selectedOrders.size > 0
      ? result.tasks.filter(t => selectedOrders.has(t.suggestedOrder))
      : result.tasks;
  };

  const handleSaveToBoard = async () => {
    if (!result) return;
    const name = projectName.trim();
    if (!name) {
      setSaveError("Please enter a project name before saving to the board.");
      return;
    }

    setSaving(true);
    setSaveError(null);

    try {
      const saved = await decomposeApi.save({ projectName: name, tasks: getTasksToUse() });
      router.push(`/epics/${saved.epic.id}`);
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        setSaveError(err.message);
      } else {
        setSaveError("Failed to save tasks to the board");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTeamConfig = async () => {
    if (!newConfigName || customTeam.length === 0) return;
    try {
      const config = await teamConfigApi.create({
        name: newConfigName,
        description: newConfigDesc || undefined,
        members: customTeam,
        isDefault: false,
      });
      setTeamConfigs([...teamConfigs, config]);
      setSelectedTeamConfigId(config.id);
      setShowTeamConfigManager(false);
      setNewConfigName("");
      setNewConfigDesc("");
    } catch (err) {
      if (err instanceof ApiErrorClass) setError(err.message);
    }
  };

  const reset = () => {
    setFile(null);
    setProjectName("");
    setTextInput("");
    setResult(null);
    setError(null);
    setSelectedOrders(new Set());
    setSaveError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ─── Results View ─────────────────────────────────────────────
  if (result) {
    const totalHours = result.tasks.reduce((s, t) => s + t.estimatedHours, 0);
    const specialties = [...new Set(result.tasks.map((t) => t.specialty))];

    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Success header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">Decomposition Complete</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              {projectName || "Requirements Decomposed"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {result.tasks.length} tasks generated
              {selectedOrders.size > 0 && ` · ${selectedOrders.size} selected`}
              {result.meta?.totalEstimatedHours && ` · ${result.meta.totalEstimatedHours}h estimated`}
              {result.meta?.decompositionTime && ` · ${result.meta.decompositionTime.toFixed(1)}s`}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const tasksToExport = getTasksToUse();
                  const md = generateTasksMarkdown({
                    projectName: projectName || undefined,
                    tasks: tasksToExport,
                    totalHours: tasksToExport.reduce((s, t) => s + t.estimatedHours, 0),
                    decompositionTime: result.meta?.decompositionTime,
                    modelUsed: result.meta?.modelUsed,
                  });
                  downloadMarkdown(md, `${(projectName || "tasks").replace(/\s+/g, "-").toLowerCase()}-decomposition.md`);
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Export .md
              </Button>
              <Button variant="outline" onClick={reset}>
                <Upload className="mr-2 h-4 w-4" />
                New Decomposition
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Project name"
                className="w-44 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <Button onClick={handleSaveToBoard} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Layers className="mr-2 h-4 w-4" />
                    Save {selectedOrders.size > 0 ? selectedOrders.size : result.tasks.length} to Board
                  </>
                )}
              </Button>
            </div>
            {saveError && <p className="text-xs text-destructive">{saveError}</p>}
          </div>
        </div>

        {/* Summary cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl border bg-card p-4">
            <div className="text-sm text-muted-foreground">Total Tasks</div>
            <div className="text-2xl font-bold">{result.tasks.length}</div>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="text-sm text-muted-foreground">Estimated Hours</div>
            <div className="text-2xl font-bold">{totalHours}</div>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="text-sm text-muted-foreground">Sprint Estimate</div>
            <div className="text-2xl font-bold">{Math.ceil(totalHours / 80)} sprint{Math.ceil(totalHours / 80) !== 1 ? "s" : ""}</div>
            <div className="text-xs text-muted-foreground">(80h/sprint)</div>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <div className="text-sm text-muted-foreground">Specialties</div>
            <div className="text-2xl font-bold">{specialties.length}</div>
            <div className="text-xs text-muted-foreground">{specialties.join(", ")}</div>
          </div>
        </div>

        {/* Task list */}
        <div className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">Generated Tasks</h2>
            <p className="text-sm text-muted-foreground">
              Check the tasks you want to keep. If none are checked, all tasks will be saved and exported.
            </p>
          </div>
          {result.tasks.map((task) => {
            const isSelected = selectedOrders.has(task.suggestedOrder);
            return (
            <div
              key={task.suggestedOrder}
              className={`rounded-xl border bg-card p-5 transition-colors ${isSelected ? "border-primary/60 ring-1 ring-primary/20" : ""}`}
            >
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleTaskSelection(task.suggestedOrder)}
                  className="mt-2 h-4 w-4 shrink-0 rounded border-input"
                  aria-label={`Select task: ${task.title}`}
                />
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {task.suggestedOrder}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{task.title}</h3>
                      {task.description && (
                        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      <Clock className="h-3 w-3" />
                      {task.estimatedHours}h
                    </span>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      task.priority === "CRITICAL" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" :
                      task.priority === "HIGH" ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300" :
                      task.priority === "MEDIUM" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" :
                      "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                    }`}>
                      {task.priority}
                    </span>
                    <span className="inline-flex rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      {task.specialty}
                    </span>
                    {task.dependencies.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        Depends on: {task.dependencies.join(", ")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── Input View (the "two-click" page) ────────────────────────
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Sparkles className="h-7 w-7" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Decompose Requirements
        </h1>
        <p className="mt-3 text-lg text-muted-foreground">
          Upload a PDF or paste requirements → get an estimated task breakdown
        </p>
      </div>

      {/* Main card */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        {/* Step 1: Input */}
        <div className="border-b p-6">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-primary">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">1</span>
            Upload Requirements
          </div>

          {/* Mode toggle */}
          <div className="mb-4 flex rounded-lg border bg-muted/50 p-1">
            <button
              onClick={() => setInputMode("pdf")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                inputMode === "pdf" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="h-4 w-4" />
              Upload PDF
            </button>
            <button
              onClick={() => setInputMode("text")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                inputMode === "text" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Zap className="h-4 w-4" />
              Paste Text
            </button>
          </div>

          {inputMode === "pdf" ? (
            <>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                  file ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileText className="h-8 w-8 text-green-600" />
                    <div className="text-left">
                      <div className="font-medium">{file.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(0)} KB · Click to replace
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                      className="ml-4 rounded-full p-1 hover:bg-muted"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-10 w-10 text-muted-foreground/50" />
                    <p className="mt-3 font-medium">Drop PDF here or click to browse</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Requirements document, PRD, spec, or any PDF
                    </p>
                  </>
                )}
              </div>
            </>
          ) : (
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste your requirements, user stories, or specification here..."
              className="min-h-[200px] w-full rounded-xl border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          )}

          {/* Project name */}
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1.5">
              Project Name <span className="text-muted-foreground font-normal">(optional — auto-saves results)</span>
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. E-Commerce Platform v2"
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </div>

        {/* Step 2: Team */}
        <div className="border-b p-6">
          <button
            onClick={() => setShowTeamBuilder(!showTeamBuilder)}
            className="mb-4 flex w-full items-center justify-between text-sm font-semibold text-primary"
          >
            <span className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">2</span>
              Team Configuration
              <span className="font-normal text-muted-foreground">(optional — improves estimates)</span>
            </span>
            {showTeamBuilder ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {showTeamBuilder && (
            <div className="space-y-4">
              {/* Saved configs */}
              {teamConfigs.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">Saved Team Presets</label>
                  <div className="flex flex-wrap gap-2">
                    {teamConfigs.map((config) => (
                      <button
                        key={config.id}
                        onClick={() => setSelectedTeamConfigId(config.id)}
                        className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                          selectedTeamConfigId === config.id
                            ? "border-primary bg-primary/10 text-primary font-medium"
                            : "hover:border-primary/50"
                        }`}
                      >
                        <Users className="mr-1.5 inline h-3.5 w-3.5" />
                        {config.name}
                      </button>
                    ))}
                    <button
                      onClick={() => { setSelectedTeamConfigId("custom"); setCustomTeam(customTeam.length === 0 ? [{ role: "middle", specialty: "backend", count: 1 }] : customTeam); }}
                      className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                        selectedTeamConfigId === "custom"
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "hover:border-primary/50"
                      }`}
                    >
                      <Plus className="mr-1.5 inline h-3.5 w-3.5" />
                      Custom
                    </button>
                  </div>
                </div>
              )}

              {teamConfigs.length === 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Team Members</label>
                    <button
                      onClick={() => setShowTeamConfigManager(!showTeamConfigManager)}
                      className="text-xs text-primary hover:underline"
                    >
                      {showTeamConfigManager ? "Hide save form" : "Save as preset"}
                    </button>
                  </div>

                  {customTeam.map((member, i) => (
                    <div key={i} className="mb-2 flex items-center gap-2">
                      <select
                        value={member.role}
                        onChange={(e) => updateTeamMember(i, "role", e.target.value)}
                        className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                        ))}
                      </select>
                      <select
                        value={member.specialty}
                        onChange={(e) => updateTeamMember(i, "specialty", e.target.value)}
                        className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                      >
                        {SPECIALTIES.map((s) => (
                          <option key={s} value={s}>{s.toUpperCase()}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={member.count || 1}
                        onChange={(e) => updateTeamMember(i, "count", parseInt(e.target.value) || 1)}
                        className="w-16 rounded-md border border-input bg-background px-2 py-1.5 text-sm text-center"
                        title="Count"
                      />
                      <button onClick={() => removeTeamMember(i)} className="p-1.5 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}

                  <button onClick={addTeamMember} className="mt-1 flex items-center gap-1 text-sm text-primary hover:underline">
                    <Plus className="h-3.5 w-3.5" /> Add member
                  </button>

                  {showTeamConfigManager && customTeam.length > 0 && (
                    <div className="mt-3 rounded-lg border bg-muted/30 p-3 space-y-2">
                      <input
                        type="text"
                        value={newConfigName}
                        onChange={(e) => setNewConfigName(e.target.value)}
                        placeholder="Preset name (e.g. 'Mobile Team')"
                        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                      />
                      <input
                        type="text"
                        value={newConfigDesc}
                        onChange={(e) => setNewConfigDesc(e.target.value)}
                        placeholder="Description (optional)"
                        className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                      />
                      <Button size="sm" onClick={handleSaveTeamConfig} disabled={!newConfigName}>
                        Save Preset
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Show custom team builder when a saved config is NOT selected */}
              {teamConfigs.length > 0 && selectedTeamConfigId === "custom" && (
                <div>
                  {customTeam.map((member, i) => (
                    <div key={i} className="mb-2 flex items-center gap-2">
                      <select
                        value={member.role}
                        onChange={(e) => updateTeamMember(i, "role", e.target.value)}
                        className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                        ))}
                      </select>
                      <select
                        value={member.specialty}
                        onChange={(e) => updateTeamMember(i, "specialty", e.target.value)}
                        className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                      >
                        {SPECIALTIES.map((s) => (
                          <option key={s} value={s}>{s.toUpperCase()}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={member.count || 1}
                        onChange={(e) => updateTeamMember(i, "count", parseInt(e.target.value) || 1)}
                        className="w-16 rounded-md border border-input bg-background px-2 py-1.5 text-sm text-center"
                      />
                      <button onClick={() => removeTeamMember(i)} className="p-1.5 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button onClick={addTeamMember} className="mt-1 flex items-center gap-1 text-sm text-primary hover:underline">
                    <Plus className="h-3.5 w-3.5" /> Add member
                  </button>

                  {customTeam.length > 0 && (
                    <div className="mt-3">
                      <button
                        onClick={() => setShowTeamConfigManager(!showTeamConfigManager)}
                        className="text-xs text-primary hover:underline"
                      >
                        {showTeamConfigManager ? "Hide save form" : "Save as preset"}
                      </button>
                      {showTeamConfigManager && (
                        <div className="mt-2 rounded-lg border bg-muted/30 p-3 space-y-2">
                          <input
                            type="text"
                            value={newConfigName}
                            onChange={(e) => setNewConfigName(e.target.value)}
                            placeholder="Preset name"
                            className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                          />
                          <Button size="sm" onClick={handleSaveTeamConfig} disabled={!newConfigName}>
                            Save Preset
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Step 3: Decompose button */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {file ? `📄 ${file.name}` : inputMode === "text" && textInput ? `📝 ${textInput.length} chars` : "Ready to decompose"}
            </div>
            <Button
              size="lg"
              onClick={handleDecompose}
              disabled={loading || (inputMode === "pdf" ? !file : textInput.trim().length < 20)}
              className="gap-2 px-8"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Decompose
                </>
              )}
            </Button>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <div className="flex items-start gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="mt-8 flex items-center justify-center gap-6 text-sm">
        <Link href="/projects" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
          <FolderKanban className="h-4 w-4" />
          Projects
        </Link>
        <Link href="/epics" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
          <Layers className="h-4 w-4" />
          Epics
        </Link>
        <Link href="/settings" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </div>
    </div>
  );
}
