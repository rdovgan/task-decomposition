import { DecomposeTask, Task, Dependency } from "@/types";

/**
 * Generate a Markdown document from decomposed tasks
 */
export function generateTasksMarkdown(params: {
  projectName?: string;
  tasks: DecomposeTask[];
  totalHours?: number;
  decompositionTime?: number;
  modelUsed?: string;
}): string {
  const { projectName, tasks, totalHours, decompositionTime, modelUsed } = params;

  const lines: string[] = [];

  // Title
  lines.push(`# ${projectName || "Task Decomposition Report"}`);
  lines.push("");

  // Summary
  const total = totalHours || tasks.reduce((s, t) => s + t.estimatedHours, 0);
  lines.push("## Summary");
  lines.push("");
  lines.push(`- **Total Tasks:** ${tasks.length}`);
  lines.push(`- **Estimated Hours:** ${total}h`);
  lines.push(`- **Sprint Estimate:** ${Math.ceil(total / 80)} sprint${Math.ceil(total / 80) !== 1 ? "s" : ""} (80h/sprint)`);
  if (decompositionTime) {
    lines.push(`- **Decomposition Time:** ${decompositionTime.toFixed(1)}s`);
  }
  if (modelUsed) {
    lines.push(`- **AI Model:** ${modelUsed}`);
  }
  lines.push("");

  // Priority breakdown
  const byPriority = {
    CRITICAL: tasks.filter((t) => t.priority === "CRITICAL"),
    HIGH: tasks.filter((t) => t.priority === "HIGH"),
    MEDIUM: tasks.filter((t) => t.priority === "MEDIUM"),
    LOW: tasks.filter((t) => t.priority === "LOW"),
  };

  lines.push("## Priority Breakdown");
  lines.push("");
  lines.push("| Priority | Count | Hours |");
  lines.push("|----------|-------|-------|");
  for (const [p, ts] of Object.entries(byPriority)) {
    if (ts.length > 0) {
      lines.push(`| ${p} | ${ts.length} | ${ts.reduce((s, t) => s + t.estimatedHours, 0)}h |`);
    }
  }
  lines.push("");

  // Specialty breakdown
  const specialties = [...new Set(tasks.map((t) => t.specialty))];
  if (specialties.length > 1) {
    lines.push("## Specialty Breakdown");
    lines.push("");
    lines.push("| Specialty | Tasks | Hours |");
    lines.push("|-----------|-------|-------|");
    for (const spec of specialties) {
      const specTasks = tasks.filter((t) => t.specialty === spec);
      lines.push(
        `| ${spec} | ${specTasks.length} | ${specTasks.reduce((s, t) => s + t.estimatedHours, 0)}h |`
      );
    }
    lines.push("");
  }

  // Task list
  lines.push("## Tasks");
  lines.push("");

  for (const task of tasks) {
    lines.push(`### ${task.suggestedOrder}. ${task.title}`);
    lines.push("");
    lines.push(task.description);
    lines.push("");
    lines.push(`- **Priority:** ${task.priority}`);
    lines.push(`- **Estimated Hours:** ${task.estimatedHours}h`);
    lines.push(`- **Specialty:** ${task.specialty}`);
    if (task.dependencies.length > 0) {
      lines.push(`- **Dependencies:** Task ${task.dependencies.join(", ")}`);
    }
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  // Dependencies matrix
  const tasksWithDeps = tasks.filter((t) => t.dependencies.length > 0);
  if (tasksWithDeps.length > 0) {
    lines.push("## Dependency Map");
    lines.push("");
    lines.push("| Task | Depends On |");
    lines.push("|------|------------|");
    for (const task of tasksWithDeps) {
      const depTitles = task.dependencies
        .map((d) => {
          const dep = tasks.find((t) => t.suggestedOrder === d);
          return dep ? `${dep.suggestedOrder}. ${dep.title}` : `Task ${d}`;
        })
        .join(", ");
      lines.push(`| ${task.suggestedOrder}. ${task.title} | ${depTitles} |`);
    }
    lines.push("");
  }

  lines.push("---");
  lines.push(`*Generated on ${new Date().toLocaleString()}*`);

  return lines.join("\n");
}

/**
 * Generate markdown for AI suggestions (simpler format from epic decompose)
 */
export function generateSuggestionsMarkdown(params: {
  epicTitle: string;
  suggestions: Array<{
    title: string;
    description: string;
    storyPoints: number;
    priority: string;
  }>;
  decompositionTime?: number;
  modelUsed?: string;
}): string {
  const { epicTitle, suggestions, decompositionTime, modelUsed } = params;

  const lines: string[] = [];

  lines.push(`# Task Suggestions: ${epicTitle}`);
  lines.push("");

  lines.push("## Summary");
  lines.push("");
  lines.push(`- **Total Tasks:** ${suggestions.length}`);
  lines.push(`- **Total Story Points:** ${suggestions.reduce((s, t) => s + t.storyPoints, 0)}`);
  if (decompositionTime) {
    lines.push(`- **Decomposition Time:** ${decompositionTime.toFixed(1)}s`);
  }
  if (modelUsed) {
    lines.push(`- **AI Model:** ${modelUsed}`);
  }
  lines.push("");

  lines.push("## Tasks");
  lines.push("");

  suggestions.forEach((task, index) => {
    lines.push(`### ${index + 1}. ${task.title}`);
    lines.push("");
    lines.push(task.description);
    lines.push("");
    lines.push(`- **Priority:** ${task.priority}`);
    lines.push(`- **Story Points:** ${task.storyPoints}`);
    lines.push("");
    lines.push("---");
    lines.push("");
  });

  lines.push("---");
  lines.push(`*Generated on ${new Date().toLocaleString()}*`);

  return lines.join("\n");
}

/**
 * Generate a Markdown document from existing tasks in an epic
 */
export function generateEpicTasksMarkdown(params: {
  epicTitle: string;
  epicDescription?: string | null;
  projectName?: string;
  tasks: Task[];
  dependencies?: Dependency[];
}): string {
  const { epicTitle, epicDescription, projectName, tasks, dependencies } = params;

  const lines: string[] = [];

  lines.push(`# ${epicTitle} — Tasks`);
  lines.push("");

  if (projectName) {
    lines.push(`**Project:** ${projectName}`);
    lines.push("");
  }

  if (epicDescription) {
    lines.push(epicDescription);
    lines.push("");
  }

  const totalHours = tasks.reduce((s, t) => s + (t.estimatedHours || 0), 0);
  const totalPoints = tasks.reduce((s, t) => s + (t.storyPoints || 0), 0);
  const doneTasks = tasks.filter((t) => t.status === "DONE").length;

  lines.push("## Summary");
  lines.push("");
  lines.push(`- **Total Tasks:** ${tasks.length}`);
  lines.push(`- **Done:** ${doneTasks} / ${tasks.length} (${tasks.length > 0 ? Math.round((doneTasks / tasks.length) * 100) : 0}%)`);
  if (totalHours > 0) lines.push(`- **Estimated Hours:** ${totalHours}h`);
  if (totalPoints > 0) lines.push(`- **Story Points:** ${totalPoints}`);
  lines.push("");

  // Status breakdown
  const statuses = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "BLOCKED", "CANCELLED"] as const;
  lines.push("## By Status");
  lines.push("");
  lines.push("| Status | Tasks | Hours | Points |");
  lines.push("|--------|-------|-------|--------|");
  for (const status of statuses) {
    const ts = tasks.filter((t) => t.status === status);
    if (ts.length > 0) {
      lines.push(
        `| ${status.replace(/_/g, " ")} | ${ts.length} | ${ts.reduce((s, t) => s + (t.estimatedHours || 0), 0)}h | ${ts.reduce((s, t) => s + (t.storyPoints || 0), 0)} |`
      );
    }
  }
  lines.push("");

  // Priority breakdown
  const priorities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;
  lines.push("## By Priority");
  lines.push("");
  lines.push("| Priority | Tasks | Hours |");
  lines.push("|----------|-------|-------|");
  for (const p of priorities) {
    const ts = tasks.filter((t) => t.priority === p);
    if (ts.length > 0) {
      lines.push(`| ${p} | ${ts.length} | ${ts.reduce((s, t) => s + (t.estimatedHours || 0), 0)}h |`);
    }
  }
  lines.push("");

  // Task list
  lines.push("## Tasks");
  lines.push("");

  tasks.forEach((task, index) => {
    lines.push(`### ${index + 1}. ${task.title}`);
    lines.push("");
    if (task.description) {
      lines.push(task.description);
      lines.push("");
    }
    lines.push(`- **Status:** ${task.status.replace(/_/g, " ")}`);
    lines.push(`- **Priority:** ${task.priority}`);
    if (task.estimatedHours) lines.push(`- **Estimated Hours:** ${task.estimatedHours}h`);
    if (task.actualHours) lines.push(`- **Actual Hours:** ${task.actualHours}h`);
    if (task.storyPoints) lines.push(`- **Story Points:** ${task.storyPoints}`);
    if (task.assignee?.name) lines.push(`- **Assignee:** ${task.assignee.name}`);
    if (task.dueDate) lines.push(`- **Due Date:** ${new Date(task.dueDate).toLocaleDateString()}`);

    if (dependencies && dependencies.length > 0) {
      const taskDeps = dependencies.filter((d) => d.taskId === task.id);
      if (taskDeps.length > 0) {
        const depTitles = taskDeps
          .map((d) => {
            const depTask = tasks.find((t) => t.id === d.dependsOnTaskId);
            return depTask ? depTask.title : d.dependsOnTaskId;
          })
          .join(", ");
        lines.push(`- **Depends on:** ${depTitles}`);
      }
    }

    lines.push("");
    lines.push("---");
    lines.push("");
  });

  lines.push(`*Generated on ${new Date().toLocaleString()}*`);

  return lines.join("\n");
}

/**
 * Trigger a browser download of a text file
 */
export function downloadMarkdown(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
