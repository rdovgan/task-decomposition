import Link from 'next/link';
import { FolderKanban, Layers, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted p-8">
      <main className="flex flex-col items-center gap-8 max-w-4xl w-full text-center">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">
            Task Decomposition Tool
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            An intelligent tool for breaking down complex tasks into manageable subtasks.
            Organize your projects, epics, and tasks with ease.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mt-8">
          <Link href="/projects" className="group">
            <div className="flex flex-col items-center gap-4 p-8 rounded-xl border bg-card hover:bg-accent transition-colors">
              <FolderKanban className="h-12 w-12 text-primary" />
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Projects</h2>
                <p className="text-sm text-muted-foreground">
                  Manage your projects and track progress across epics and tasks.
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
            </div>
          </Link>

          <Link href="/epics" className="group">
            <div className="flex flex-col items-center gap-4 p-8 rounded-xl border bg-card hover:bg-accent transition-colors">
              <Layers className="h-12 w-12 text-primary" />
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold">Epics</h2>
                <p className="text-sm text-muted-foreground">
                  View and manage all epics across your projects.
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        </div>

        <div className="flex gap-4 mt-8">
          <Link href="/projects">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/epics">
            <Button variant="outline" size="lg">View Epics</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
