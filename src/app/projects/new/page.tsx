"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { UserSelectDropdown } from "@/components/users/UserSelectDropdown";
import { CreateProjectRequest, ProjectStatus } from "@/types";
import { projectsApi, ApiErrorClass } from "@/lib/api-client";

export default function NewProjectPage() {
  const router = useRouter();
  const { createProject, fetchProjects } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOwnerId, setSelectedOwnerId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateProjectRequest>({
    name: "",
    description: "",
    ownerId: "",
    status: "ACTIVE",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate owner is selected
    if (!selectedOwnerId) {
      setError("Please select a project owner");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const project = await createProject({ ...formData, ownerId: selectedOwnerId });
      await fetchProjects();
      router.push(`/projects/${project.id}`);
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        setError(err.message);
      } else {
        setError("Failed to create project");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link
        href="/projects"
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Projects
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
        <p className="text-muted-foreground">Fill in the details to create a new project</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Project Name <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="My Awesome Project"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="A brief description of the project..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Project Owner <span className="text-destructive">*</span>
          </label>
          <UserSelectDropdown
            selectedUserId={selectedOwnerId}
            onUserChange={setSelectedOwnerId}
            placeholder="Select owner"
            showAvatar={true}
          />
          {!selectedOwnerId && (
            <p className="mt-1 text-xs text-muted-foreground">
              Select the user who will own this project
            </p>
          )}
        </div>

        <div>
          <label htmlFor="status" className="block text-sm font-medium mb-2">
            Status
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={e => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
            className="w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create Project"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
