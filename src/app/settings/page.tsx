"use client";

import { useState, useEffect } from "react";
import { Key, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { userSettingsApi, ApiErrorClass } from "@/lib/api-client";

// For demo purposes, use a hardcoded user ID
// In production, this would come from authentication
const DEMO_USER_ID = "demo-user-id";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [hasStoredKey, setHasStoredKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await userSettingsApi.get(DEMO_USER_ID);
      setHasStoredKey(response.data.hasApiKey);
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
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
      if (response.data.valid) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(response.data.message || "Invalid API key");
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
      await userSettingsApi.update(DEMO_USER_ID, { anthropicApiKey: apiKey.trim() });
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
      await userSettingsApi.deleteApiKey(DEMO_USER_ID);
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

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
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
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
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
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="sk-ant-api03-..."
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm pr-10 ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
              <div className="rounded-lg border border-green-500/50 bg-green-500/10 p-3">
                <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
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
            <div className="rounded-lg border border-blue-500/50 bg-blue-500/10 p-3">
              <p className="text-sm text-blue-700 dark:text-blue-400">
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

        {/* Additional Settings Sections */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Additional Settings</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            More settings will be added here in future updates.
          </p>
        </div>
      </div>
    </div>
  );
}
