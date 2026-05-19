"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Plus,
  Trash2,
  Star,
  Loader2,
  ArrowLeft,
  Save,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { teamConfigApi, ApiErrorClass } from "@/lib/api-client";
import { TeamConfig, TeamMember } from "@/types";

const SPECIALTIES = [
  "frontend", "backend", "java", "python", "ui/ux", "qa",
  "devops", "mobile", "data", "architect", "fullstack", "dba",
];

const ROLES: TeamMember["role"][] = ["junior", "middle", "senior", "lead", "architect"];

export default function TeamPage() {
  const [configs, setConfigs] = useState<TeamConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New config form
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formMembers, setFormMembers] = useState<TeamMember[]>([
    { role: "middle", specialty: "backend", count: 1 },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const data = await teamConfigApi.list();
      setConfigs(data);
    } catch (err) {
      if (err instanceof ApiErrorClass) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formName || formMembers.length === 0) return;
    setSaving(true);
    setError(null);
    try {
      const config = await teamConfigApi.create({
        name: formName,
        description: formDesc || undefined,
        members: formMembers,
        isDefault: false,
      });
      setConfigs([...configs, config]);
      setShowForm(false);
      setFormName("");
      setFormDesc("");
      setFormMembers([{ role: "middle", specialty: "backend", count: 1 }]);
    } catch (err) {
      if (err instanceof ApiErrorClass) setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this team preset?")) return;
    try {
      await teamConfigApi.delete(id);
      setConfigs(configs.filter((c) => c.id !== id));
    } catch (err) {
      if (err instanceof ApiErrorClass) setError(err.message);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      // Unset all defaults, then set the chosen one
      for (const c of configs) {
        if (c.isDefault) await teamConfigApi.update(c.id, { isDefault: false });
      }
      await teamConfigApi.update(id, { isDefault: true });
      setConfigs(
        configs.map((c) => ({ ...c, isDefault: c.id === id }))
      );
    } catch (err) {
      if (err instanceof ApiErrorClass) setError(err.message);
    }
  };

  const updateMember = (i: number, field: keyof TeamMember, value: string | number) => {
    const updated = [...formMembers];
    updated[i] = { ...updated[i], [field]: value };
    setFormMembers(updated);
  };

  const removeMember = (i: number) => {
    setFormMembers(formMembers.filter((_, idx) => idx !== i));
  };

  const addMember = () => {
    setFormMembers([...formMembers, { role: "middle", specialty: "backend", count: 1 }]);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link href="/" className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back
      </Link>

      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Presets</h1>
          <p className="mt-2 text-muted-foreground">
            Configure team compositions for accurate task estimation
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          <Plus className="mr-2 h-4 w-4" /> New Preset
        </Button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="mb-8 rounded-xl border bg-card p-6">
          <h2 className="text-lg font-semibold mb-4">New Team Preset</h2>

          <div className="space-y-3">
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Team name (e.g. 'Mobile Squad')"
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm"
            />
            <input
              type="text"
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Description (optional)"
              className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm"
            />

            <div className="space-y-2">
              <label className="text-sm font-medium">Members</label>
              {formMembers.map((m, i) => (
                <div key={i} className="flex items-center gap-2">
                  <select
                    value={m.role}
                    onChange={(e) => updateMember(i, "role", e.target.value)}
                    className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                    ))}
                  </select>
                  <select
                    value={m.specialty}
                    onChange={(e) => updateMember(i, "specialty", e.target.value)}
                    className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                  >
                    {SPECIALTIES.map((s) => (
                      <option key={s} value={s}>{s.toUpperCase()}</option>
                    ))}
                  </select>
                  <input
                    type="number" min={1} max={20}
                    value={m.count || 1}
                    onChange={(e) => updateMember(i, "count", parseInt(e.target.value) || 1)}
                    className="w-16 rounded-md border border-input bg-background px-2 py-1.5 text-sm text-center"
                  />
                  <button onClick={() => removeMember(i)} className="p-1.5 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button onClick={addMember} className="text-sm text-primary hover:underline flex items-center gap-1">
                <Plus className="h-3.5 w-3.5" /> Add member
              </button>
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={saving || !formName}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Preset"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Existing configs */}
      {configs.length === 0 && !showForm ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <Users className="mx-auto h-10 w-10 text-muted-foreground/40 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No team presets yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a team preset to improve AI estimation accuracy
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {configs.map((config) => {
            const members = (config.config as { members: TeamMember[] }).members || [];
            return (
              <div key={config.id} className="rounded-xl border bg-card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{config.name}</h3>
                      {config.isDefault && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          <Star className="h-3 w-3" /> Default
                        </span>
                      )}
                    </div>
                    {config.description && (
                      <p className="mt-1 text-sm text-muted-foreground">{config.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {!config.isDefault && (
                      <button
                        onClick={() => handleSetDefault(config.id)}
                        className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                        title="Set as default"
                      >
                        <Star className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(config.id)}
                      className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {members.map((m, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium"
                    >
                      {m.count && m.count > 1 ? `${m.count}× ` : ""}
                      {m.role} {m.specialty}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
