"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  FolderKanban,
  Layers,
  CheckSquare,
  ArrowRight,
  Sparkles,
  BarChart3,
  Zap,
  Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { projectsApi, epicsApi, tasksApi, ApiErrorClass } from "@/lib/api-client";

export default function Home() {
  const [stats, setStats] = useState({ projects: 0, epics: 0, tasks: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const [projects, epics, tasks] = await Promise.all([
        projectsApi.list(),
        epicsApi.list(),
        tasksApi.list({ limit: 1 }),
      ]);
      setStats({
        projects: (projects as any).length || 0,
        epics: (epics as any).length || 0,
        tasks: (tasks as any).total || (tasks as any).data?.length || 0,
      });
    } catch {
      // Silently ignore stats errors on home page
    }
  }

  const features = [
    {
      icon: FolderKanban,
      title: "Projects",
      description: "Manage projects and track progress across epics and tasks.",
      href: "/projects",
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-950/40",
    },
    {
      icon: Layers,
      title: "Epics",
      description: "View and manage all epics across your projects.",
      href: "/epics",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/40",
    },
    {
      icon: CheckSquare,
      title: "My Tasks",
      description: "View and manage tasks assigned to you.",
      href: "/my-tasks",
      color: "text-green-600 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-950/40",
    },
    {
      icon: Bot,
      title: "AI Decomposition",
      description: "Let AI break down epics into well-structured tasks automatically.",
      href: "/epics",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/40",
    },
    {
      icon: BarChart3,
      title: "Kanban Board",
      description: "Drag and drop tasks across status columns with ease.",
      href: "/my-tasks",
      color: "text-pink-600 dark:text-pink-400",
      bg: "bg-pink-50 dark:bg-pink-950/40",
    },
    {
      icon: Zap,
      title: "Dependency Tracking",
      description: "Visualize task dependencies and resolve blockers quickly.",
      href: "/epics",
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-950/40",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-primary/5 via-background to-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.08),transparent_50%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-20 lg:py-28">
          <div
            className={`transition-all duration-700 ${
              mounted ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                AI-Powered Task Management
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Decompose Complex
              <br />
              <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Tasks with AI
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed">
              An intelligent tool for breaking down complex projects into manageable epics and
              tasks. Organize work, track dependencies, and leverage AI to automate task
              decomposition.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link href="/projects">
                <Button size="lg" className="h-11 px-6 text-base">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/my-tasks">
                <Button variant="outline" size="lg" className="h-11 px-6 text-base">
                  View My Tasks
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            {(stats.projects > 0 || stats.epics > 0 || stats.tasks > 0) && (
              <div className="mt-12 flex gap-8">
                <div>
                  <div className="text-2xl font-bold">{stats.projects}</div>
                  <div className="text-sm text-muted-foreground">Projects</div>
                </div>
                <div className="h-12 w-px bg-border" />
                <div>
                  <div className="text-2xl font-bold">{stats.epics}</div>
                  <div className="text-sm text-muted-foreground">Epics</div>
                </div>
                <div className="h-12 w-px bg-border" />
                <div>
                  <div className="text-2xl font-bold">{stats.tasks}</div>
                  <div className="text-sm text-muted-foreground">Tasks</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, i) => (
            <Link
              key={feature.title}
              href={feature.href}
              className={`group relative rounded-xl border bg-card p-6 transition-all duration-200 hover:border-primary/30 hover:shadow-md ${
                mounted
                  ? "translate-y-0 opacity-100"
                  : "translate-y-4 opacity-0"
              }`}
              style={{ transitionDelay: mounted ? `${i * 75}ms` : "0ms" }}
            >
              <div
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${feature.bg}`}
              >
                <feature.icon className={`h-5 w-5 ${feature.color}`} />
              </div>
              <h3 className="font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
              <div className="mt-4 flex items-center text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                Open
                <ArrowRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-center text-sm text-muted-foreground">
            Task Decomposition Tool &mdash; Intelligent Project Management
          </p>
        </div>
      </footer>
    </div>
  );
}
