"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, FolderKanban, Search } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Project, ProjectStatus } from "@/types";
import { CardSkeleton } from "@/components/ui/skeleton";

export default function ProjectsPage() {
  const router = useRouter();
  const { projects, projectsLoading, projectsError, fetchProjects } = useApp();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleFilterChange = (status: string) => {
    setStatusFilter(status);
    fetchProjects(status === "" ? undefined : { status: status as ProjectStatus });
  };

  const filteredProjects = (projects as Project[]).filter(p => {
    if (statusFilter && p.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const statusTabs = [
    { value: "", label: "All" },
    { value: "ACTIVE", label: "Active" },
    { value: "ON_HOLD", label: "On Hold" },
    { value: "ARCHIVED", label: "Archived" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="mt-2 text-muted-foreground">
            Manage your projects and their epics
          </p>
        </div>
        <Button onClick={() => router.push("/projects/new")}>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Search + Filter Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="flex gap-1 rounded-lg border bg-muted/50 p-1">
          {statusTabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => handleFilterChange(tab.value)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                statusFilter === tab.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {projectsError && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          {projectsError}
        </div>
      )}

      {/* Loading */}
      {projectsLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!projectsLoading && filteredProjects.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <FolderKanban className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No projects found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {searchQuery || statusFilter
              ? "Try adjusting your search or filters"
              : "Create your first project to get started"}
          </p>
          {!searchQuery && !statusFilter && (
            <Button className="mt-4" onClick={() => router.push("/projects/new")}>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          )}
        </div>
      )}

      {/* Project Cards Grid */}
      {!projectsLoading && filteredProjects.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map(project => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group rounded-xl border bg-card p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {project.name}
                  </h3>
                  {project.description ? (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  ) : (
                    <p className="mt-1 text-sm italic text-muted-foreground/60">No description</p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <StatusBadge status={project.status} />
                <span className="text-xs text-muted-foreground">
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
