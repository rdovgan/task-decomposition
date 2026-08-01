"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, XCircle, AlertCircle, ExternalLink } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { jiraApi, ApiErrorClass } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import {
  JiraConnectionStatus,
  JiraProject,
  JiraIssueType,
  JiraCreateIssueItem,
  JiraCreateIssuesResponse,
} from "@/types";

interface SendToJiraDialogProps {
  open: boolean;
  onClose: () => void;
  tasks: JiraCreateIssueItem[];
  suggestedEpicTitle?: string;
  suggestedEpicDescription?: string;
  onSent?: (results: JiraCreateIssuesResponse) => void;
}

export function SendToJiraDialog({
  open,
  onClose,
  tasks,
  suggestedEpicTitle,
  suggestedEpicDescription,
  onSent,
}: SendToJiraDialogProps) {
  const { user } = useAuth();
  const [checkingConnection, setCheckingConnection] = useState(true);
  const [connection, setConnection] = useState<JiraConnectionStatus | null>(null);
  const [projects, setProjects] = useState<JiraProject[]>([]);
  const [issueTypes, setIssueTypes] = useState<JiraIssueType[]>([]);
  const [selectedProjectKey, setSelectedProjectKey] = useState("");
  const [selectedIssueType, setSelectedIssueType] = useState("");
  const [epicTitle, setEpicTitle] = useState("");
  const [epicDescription, setEpicDescription] = useState("");
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingIssueTypes, setLoadingIssueTypes] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<JiraCreateIssuesResponse | null>(null);

  useEffect(() => {
    if (!open) return;

    // Reset state for a fresh run each time the dialog opens
    setResult(null);
    setError(null);
    setSelectedProjectKey("");
    setSelectedIssueType("");
    setProjects([]);
    setIssueTypes([]);
    setEpicTitle(suggestedEpicTitle || "");
    setEpicDescription(suggestedEpicDescription || "");

    if (!user) {
      setConnection({ connected: false, siteUrl: null, email: null });
      setCheckingConnection(false);
      return;
    }

    setCheckingConnection(true);

    jiraApi
      .get()
      .then(status => {
        setConnection(status);
        if (status.connected) {
          setLoadingProjects(true);
          return jiraApi
            .listProjects()
            .then(setProjects)
            .catch(() => setError("Failed to load Jira projects"))
            .finally(() => setLoadingProjects(false));
        }
      })
      .catch(() => setConnection({ connected: false, siteUrl: null, email: null }))
      .finally(() => setCheckingConnection(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user]);

  useEffect(() => {
    if (!selectedProjectKey) {
      setIssueTypes([]);
      return;
    }

    setLoadingIssueTypes(true);
    setSelectedIssueType("");
    jiraApi
      .listIssueTypes(selectedProjectKey)
      .then(types => {
        setIssueTypes(types);
        const defaultType = types.find(t => t.name === "Task") || types[0];
        if (defaultType) setSelectedIssueType(defaultType.name);
      })
      .catch(() => setError("Failed to load issue types for this project"))
      .finally(() => setLoadingIssueTypes(false));
  }, [selectedProjectKey]);

  const handleSend = async () => {
    if (!selectedProjectKey || !selectedIssueType || !epicTitle.trim()) return;

    setSending(true);
    setError(null);

    try {
      const created = await jiraApi.createIssues({
        projectKey: selectedProjectKey,
        issueTypeName: selectedIssueType,
        epicTitle: epicTitle.trim(),
        epicDescription: epicDescription.trim() || undefined,
        tasks,
      });
      setResult(created);
      onSent?.(created);
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        setError(err.message);
      } else {
        setError("Failed to send tasks to Jira");
      }
    } finally {
      setSending(false);
    }
  };

  const successCount = result?.tasks.filter(r => r.success).length ?? 0;

  return (
    <Dialog open={open} onClose={onClose} title="Send to Jira" size="lg">
      <div className="space-y-4">
        {checkingConnection && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {!checkingConnection && !user && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">
              Log in to connect Jira and send tasks — your Jira connection is personal to your
              account.
            </p>
            <a href="/login?redirect=/settings">
              <Button variant="outline">Log In</Button>
            </a>
          </div>
        )}

        {!checkingConnection && user && !connection?.connected && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">
              Jira isn&apos;t connected yet. Add your Jira site URL, email, and API token in
              Settings first.
            </p>
            <a href="/settings">
              <Button variant="outline">Go to Settings</Button>
            </a>
          </div>
        )}

        {!checkingConnection && connection?.connected && !result && (
          <>
            <p className="text-sm text-muted-foreground">
              Sending {tasks.length} task{tasks.length !== 1 ? "s" : ""} to{" "}
              <span className="font-medium">{connection.siteUrl}</span>, grouped under a new Epic.
            </p>

            <div className="space-y-2">
              <label className="text-sm font-medium">Jira Project</label>
              <Select
                value={selectedProjectKey}
                onChange={e => setSelectedProjectKey(e.target.value)}
                disabled={loadingProjects}
                className="w-full"
              >
                <option value="">
                  {loadingProjects ? "Loading projects..." : "Select a project"}
                </option>
                {projects.map(project => (
                  <option key={project.id} value={project.key}>
                    {project.name} ({project.key})
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Epic Title</label>
              <Input
                type="text"
                value={epicTitle}
                onChange={e => setEpicTitle(e.target.value)}
                placeholder="e.g. Requirements Decomposition"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Epic Description (optional)</label>
              <Textarea
                value={epicDescription}
                onChange={e => setEpicDescription(e.target.value)}
                rows={3}
                placeholder="Context from the decomposition input..."
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Issue Type (for tasks)</label>
              <Select
                value={selectedIssueType}
                onChange={e => setSelectedIssueType(e.target.value)}
                disabled={!selectedProjectKey || loadingIssueTypes}
                className="w-full"
              >
                <option value="">
                  {loadingIssueTypes ? "Loading issue types..." : "Select an issue type"}
                </option>
                {issueTypes
                  .filter(type => type.name !== "Epic")
                  .map(type => (
                    <option key={type.id} value={type.name}>
                      {type.name}
                    </option>
                  ))}
              </Select>
            </div>

            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                <div className="flex items-start gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={!selectedProjectKey || !selectedIssueType || !epicTitle.trim() || sending}
              >
                {sending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  `Send ${tasks.length} Task${tasks.length !== 1 ? "s" : ""}`
                )}
              </Button>
            </div>
          </>
        )}

        {result && (
          <>
            {!result.epic.success && (
              <div className="rounded-lg border border-warning/40 bg-warning/10 p-3">
                <div className="flex items-start gap-2 text-sm text-warning">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Couldn&apos;t create the Epic ({result.epic.error}) — tasks below were created
                    without grouping.
                  </span>
                </div>
              </div>
            )}
            {result.epic.success && (
              <div className="rounded-lg border bg-card p-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-success mt-0.5" />
                  <div>
                    <div className="font-medium">Epic created</div>
                    <a
                      href={result.epic.issueUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-primary underline hover:no-underline"
                    >
                      {result.epic.issueKey}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              {successCount} of {result.tasks.length} task{result.tasks.length !== 1 ? "s" : ""}{" "}
              sent successfully
            </p>
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {result.tasks.map((r, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 rounded-lg border bg-card p-3 text-sm"
                >
                  {r.success ? (
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-success mt-0.5" />
                  ) : (
                    <XCircle className="h-4 w-4 flex-shrink-0 text-destructive mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{r.title}</div>
                    {r.success ? (
                      <a
                        href={r.issueUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-primary underline hover:no-underline"
                      >
                        {r.issueKey}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <div className="mt-1 text-destructive">{r.error}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={onClose}>Done</Button>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}
