"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  Calendar,
  FolderKanban,
  ExternalLink,
} from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { DataTable } from "@/components/ui/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { PriorityBadge } from "@/components/ui/priority-badge";
import { Button } from "@/components/ui/button";
import { Project, Epic, EpicStatus, Priority } from "@/types";
import { projectsApi, epicsApi, ApiErrorClass } from "@/lib/api-client";
import { PageHeaderSkeleton } from "@/components/ui/skeleton";

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProject();
  }, [params.id]);

  async function loadProject() {
    setLoading(true);
    setError(null);
    try {
      const [projectData, epicsData] = await Promise.all([
        projectsApi.get(params.id),
        epicsApi.list({ projectId: params.id, limit: 100 }),
      ]);
      setProject(projectData);
      setEpics(epicsData.data);
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        setError(err.message);
      } else {
        setError("Failed to load project");
      }
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this project? This will also delete all associated epics and tasks."
      )
    ) {
      return;
    }

    try {
      await projectsApi.delete(params.id);
      router.push("/projects");
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        setError(err.message);
      }
    }
  };

  const epicColumns = [
    {
      key: "title",
      title: "Title",
      sortable: true,
      render: (_: unknown, row: Record<string, unknown>) => {
        const epic = row as unknown as Epic;
        return (
          <Link href={`/epics/${epic.id}`} className="font-medium text-primary hover:underline">
            {epic.title}
          </Link>
        );
      },
    },
    {
      key: "status",
      title: "Status",
      sortable: true,
      render: (value: unknown) => <StatusBadge status={value as EpicStatus} />,
    },
    {
      key: "priority",
      title: "Priority",
      sortable: true,
      render: (value: unknown) => <PriorityBadge priority={value as Priority} />,
    },
    {
      key: "_count.tasks",
      title: "Tasks",
      render: (value: unknown) => (
        <span className="tabular-nums">{(value as number)?.toString() || "0"}</span>
      ),
    },
    {
      key: "createdAt",
      title: "Created",
      sortable: true,
      render: (value: unknown) => (
        <span className="text-muted-foreground">
          {new Date(value as string).toLocaleDateString()}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <PageHeaderSkeleton />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          {error || "Project not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/projects" className="hover:text-foreground transition-colors">
          Projects
        </Link>
        <span>/</span>
        <span className="text-foreground">{project.name}</span>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FolderKanban className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
                {project.description && (
                  <p className="mt-1 text-muted-foreground">{project.description}</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => router.push(`/projects/${project.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Meta bar */}
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border bg-muted/30 px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Status</span>
            <StatusBadge status={project.status} />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            Created {new Date(project.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Epics Section */}
      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-semibold">Epics</h2>
          <Button size="sm" onClick={() => router.push(`/epics/new?projectId=${project.id}`)}>
            <Plus className="mr-2 h-4 w-4" />
            New Epic
          </Button>
        </div>

        <DataTable
          columns={epicColumns}
          data={epics as unknown as Record<string, unknown>[]}
          loading={false}
          emptyMessage="No epics yet. Create your first epic to start breaking down work."
        />
      </div>
    </div>
  );
}
