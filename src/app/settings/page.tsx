"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Key, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff, Trash2, Link2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { userSettingsApi, jiraApi, ApiErrorClass } from "@/lib/api-client";
import { JiraConnectionStatus } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [hasStoredKey, setHasStoredKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Jira connection state
  const [jiraSiteUrl, setJiraSiteUrl] = useState("");
  const [jiraEmail, setJiraEmail] = useState("");
  const [jiraApiToken, setJiraApiToken] = useState("");
  const [showJiraToken, setShowJiraToken] = useState(false);
  const [jiraStatus, setJiraStatus] = useState<JiraConnectionStatus | null>(null);
  const [jiraSaving, setJiraSaving] = useState(false);
  const [jiraError, setJiraError] = useState<string | null>(null);
  const [jiraSuccess, setJiraSuccess] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await userSettingsApi.get();
      setHasStoredKey(response.hasApiKey);
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }

    try {
      const status = await jiraApi.get();
      setJiraStatus(status);
    } catch {
      // Jira connection is optional; ignore load failures here
    }
  };

  const handleSaveJira = async () => {
    if (!jiraSiteUrl.trim() || !jiraEmail.trim() || !jiraApiToken.trim()) {
      setJiraError("Please fill in the site URL, email, and API token");
      return;
    }

    setJiraSaving(true);
    setJiraError(null);
    setJiraSuccess(false);

    try {
      const status = await jiraApi.update({
        siteUrl: jiraSiteUrl.trim(),
        email: jiraEmail.trim(),
        apiToken: jiraApiToken.trim(),
      });
      setJiraStatus(status);
      setJiraApiToken("");
      setJiraSuccess(true);
      setTimeout(() => setJiraSuccess(false), 3000);
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        setJiraError(err.message);
      } else {
        setJiraError("Failed to connect to Jira");
      }
    } finally {
      setJiraSaving(false);
    }
  };

  const handleDeleteJira = async () => {
    if (!confirm("Are you sure you want to disconnect Jira?")) {
      return;
    }

    setJiraSaving(true);
    setJiraError(null);

    try {
      await jiraApi.deleteConnection();
      setJiraStatus({ connected: false, siteUrl: null, email: null });
      setJiraSiteUrl("");
      setJiraEmail("");
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        setJiraError(err.message);
      } else {
        setJiraError("Failed to disconnect Jira");
      }
    } finally {
      setJiraSaving(false);
    }
  };

  const handleValidateApiKey = async () => {
    if (!apiKey.trim()) {
      setError("Please enter an API key");
      return;
    }

    setValidating(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await userSettingsApi.validateApiKey(apiKey.trim());
      if (response.valid) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(response.message || "Invalid API key");
      }
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        setError(err.message);
      } else {
        setError("Failed to validate API key");
      }
    } finally {
      setValidating(false);
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey.trim()) {
      setError("Please enter an API key");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await userSettingsApi.update({ anthropicApiKey: apiKey.trim() });
      setHasStoredKey(true);
      setSuccess(true);
      setApiKey("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        setError(err.message);
      } else {
        setError("Failed to save API key");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteApiKey = async () => {
    if (!confirm("Are you sure you want to remove your stored API key?")) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await userSettingsApi.deleteApiKey();
      setHasStoredKey(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        setError(err.message);
      } else {
        setError("Failed to delete API key");
      }
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="mt-2 text-muted-foreground">Manage your application settings and API keys</p>
        </div>
        <div className="flex flex-col items-center gap-4 rounded-lg border bg-card p-10 text-center shadow-sm">
          <div className="rounded-lg bg-primary/10 p-3">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Log in to manage your settings</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your Anthropic API key and Jira connection are personal to your account.
            </p>
          </div>
          <Link href="/login?redirect=/settings">
            <Button>Log In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-2 text-muted-foreground">Manage your application settings and API keys</p>
      </div>

      <div className="space-y-6">
        {/* API Key Section */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Key className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Anthropic API Key</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Your API key is encrypted and stored securely. It is used for AI-powered task
                  decomposition features.
                </p>
              </div>
            </div>
            {hasStoredKey && (
              <Button variant="ghost" size="icon" onClick={handleDeleteApiKey} disabled={saving}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="mt-4 space-y-3">
            {/* Current API Key Status */}
            {hasStoredKey && (
              <div className="rounded-lg bg-muted p-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="font-medium">API key is configured</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Your API key is stored securely and will be used for AI decomposition.
                </p>
              </div>
            )}

            {/* API Key Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">API Key</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="sk-ant-api03-..."
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button
                  variant="outline"
                  onClick={handleValidateApiKey}
                  disabled={validating || !apiKey.trim()}
                >
                  {validating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    "Validate"
                  )}
                </Button>
                <Button onClick={handleSaveApiKey} disabled={saving || !apiKey.trim()}>
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
              </div>
            </div>

            {/* Success Message */}
            {success && (
              <div className="rounded-lg border border-success/40 bg-success/10 p-3">
                <div className="flex items-center gap-2 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">Settings saved successfully</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                <div className="flex items-start gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Help Text */}
            <div className="rounded-lg border border-info/40 bg-info/10 p-3">
              <p className="text-sm text-info">
                <span className="font-semibold">Get your API key:</span>{" "}
                <a
                  href="https://console.anthropic.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:no-underline"
                >
                  Anthropic Console
                </a>
                . Your API key starts with{" "}
                <code className="rounded bg-background px-1 py-0.5 text-xs">sk-ant-api03-</code>
              </p>
            </div>
          </div>
        </div>

        {/* Jira Integration Section */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-primary/10 p-2">
                <Link2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Jira Integration</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Connect your Jira account to send decomposed tasks to Jira as issues.
                </p>
              </div>
            </div>
            {jiraStatus?.connected && (
              <Button variant="ghost" size="icon" onClick={handleDeleteJira} disabled={jiraSaving}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="mt-4 space-y-3">
            {/* Current Connection Status */}
            {jiraStatus?.connected && (
              <div className="rounded-lg bg-muted p-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="font-medium">
                    Connected as {jiraStatus.email} to {jiraStatus.siteUrl}
                  </span>
                </div>
              </div>
            )}

            {/* Site URL */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Jira Site URL</label>
              <Input
                type="text"
                value={jiraSiteUrl}
                onChange={e => setJiraSiteUrl(e.target.value)}
                placeholder={jiraStatus?.siteUrl || "https://your-domain.atlassian.net"}
                className="w-full"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={jiraEmail}
                onChange={e => setJiraEmail(e.target.value)}
                placeholder={jiraStatus?.email || "you@example.com"}
                className="w-full"
              />
            </div>

            {/* API Token */}
            <div className="space-y-2">
              <label className="text-sm font-medium">API Token</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showJiraToken ? "text" : "password"}
                    value={jiraApiToken}
                    onChange={e => setJiraApiToken(e.target.value)}
                    placeholder={jiraStatus?.connected ? "••••••••••••" : "Your Jira API token"}
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowJiraToken(!showJiraToken)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showJiraToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button onClick={handleSaveJira} disabled={jiraSaving}>
                  {jiraSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connecting...
                    </>
                  ) : jiraStatus?.connected ? (
                    "Update"
                  ) : (
                    "Connect"
                  )}
                </Button>
              </div>
            </div>

            {/* Success Message */}
            {jiraSuccess && (
              <div className="rounded-lg border border-success/40 bg-success/10 p-3">
                <div className="flex items-center gap-2 text-sm text-success">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="font-medium">Jira connected successfully</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {jiraError && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                <div className="flex items-start gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>{jiraError}</span>
                </div>
              </div>
            )}

            {/* Help Text */}
            <div className="rounded-lg border border-info/40 bg-info/10 p-3">
              <p className="text-sm text-info">
                <span className="font-semibold">Get your API token:</span>{" "}
                <a
                  href="https://id.atlassian.com/manage-profile/security/api-tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:no-underline"
                >
                  Atlassian Account Settings
                </a>
                . Your token and email are stored encrypted.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
