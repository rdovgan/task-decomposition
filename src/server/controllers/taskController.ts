import { Request, Response } from "express";
import OpenAI from "openai";
import prisma from "../lib/prisma";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import type { CreateTaskInput, UpdateTaskInput } from "../lib/validations";
import { taskDecompositionService } from "../services/taskDecomposition";
import { decrypt } from "../lib/encryption";
import { str } from "../lib/express";

export const getTasks = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(str(req.query.page) || "1") || 1;
  const limit = parseInt(str(req.query.limit) || "10") || 10;
  const skip = (page - 1) * limit;
  const epicId = str(req.query.epicId);
  const assigneeId = str(req.query.assigneeId);
  const status = str(req.query.status);
  const priority = str(req.query.priority);
  const search = str(req.query.search);
  const sortBy = str(req.query.sortBy) || "createdAt";
  const order = str(req.query.order) === "asc" ? "asc" : "desc";

  const where: any = {};
  if (epicId) where.epicId = epicId;
  if (assigneeId) where.assigneeId = assigneeId;
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  // Build orderBy object
  const orderBy: any = {};
  orderBy[sortBy] = order;

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip,
      take: limit,
      include: {
        epic: {
          select: { id: true, title: true },
        },
        assignee: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { dependencies: true, dependents: true, comments: true, links: true },
        },
      },
      orderBy,
    }),
    prisma.task.count({ where }),
  ]);

  res.json({
    data: tasks,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const getTaskById = asyncHandler(async (req: Request, res: Response) => {
  const id = str(req.params.id)!;

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      epic: {
        select: { id: true, title: true, project: { select: { id: true, name: true } } },
      },
      assignee: {
        select: { id: true, name: true, email: true },
      },
      dependencies: {
        include: {
          dependsOn: {
            select: { id: true, title: true, status: true },
          },
        },
      },
      dependents: {
        include: {
          task: {
            select: { id: true, title: true, status: true },
          },
        },
      },
      links: true,
      comments: {
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  res.json({ data: task });
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const input: CreateTaskInput = req.body;

  const task = await prisma.task.create({
    data: input,
    include: {
      epic: {
        select: { id: true, title: true },
      },
      assignee: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  res.status(201).json({ data: task });
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const id = str(req.params.id)!;
  const input: UpdateTaskInput = req.body;

  // If status is being changed to DONE, set completedAt
  const data: any = { ...input };
  if (input.status === "DONE") {
    data.completedAt = new Date();
  } else if (input.status) {
    data.completedAt = null;
  }

  const task = await prisma.task.update({
    where: { id },
    data,
    include: {
      epic: {
        select: { id: true, title: true },
      },
      assignee: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  res.json({ data: task });
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const id = str(req.params.id)!;

  await prisma.task.delete({
    where: { id },
  });

  res.status(204).send();
});

export const getTaskDependencies = asyncHandler(async (req: Request, res: Response) => {
  const id = str(req.params.id)!;

  const dependencies = await prisma.dependency.findMany({
    where: { taskId: id },
    include: {
      dependsOn: {
        select: {
          id: true,
          title: true,
          status: true,
          assignee: { select: { id: true, name: true } },
        },
      },
    },
  });

  res.json({ data: dependencies });
});

/**
 * Check for circular dependencies using Depth-First Search (DFS)
 *
 * @param taskId - The task that will depend on dependsOnTaskId
 * @param dependsOnTaskId - The task that will be depended upon
 * @returns true if adding this dependency would create a cycle
 */
const wouldCreateCircularDependency = async (
  taskId: string,
  dependsOnTaskId: string
): Promise<boolean> => {
  const visited = new Set<string>();
  const stack: string[] = [dependsOnTaskId];

  while (stack.length > 0) {
    const current = stack.pop()!;

    if (current === taskId) {
      // Found a path from dependsOnTaskId back to taskId, which would create a cycle
      return true;
    }

    if (visited.has(current)) {
      continue;
    }

    visited.add(current);

    // Get all tasks that depend on the current task
    const dependents = await prisma.dependency.findMany({
      where: { dependsOnTaskId: current },
      select: { taskId: true },
    });

    // Add dependents to the stack
    for (const dep of dependents) {
      if (!visited.has(dep.taskId)) {
        stack.push(dep.taskId);
      }
    }
  }

  return false;
};

export const createDependency = asyncHandler(async (req: Request, res: Response) => {
  const taskId = str(req.params.id)! || req.body.taskId;
  const { dependsOnTaskId, type } = req.body;

  // Check for self-dependency
  if (taskId === dependsOnTaskId) {
    throw new ApiError(400, "Task cannot depend on itself");
  }

  // Check for circular dependencies using DFS
  const hasCircularDependency = await wouldCreateCircularDependency(taskId, dependsOnTaskId);
  if (hasCircularDependency) {
    throw new ApiError(400, "Cannot create dependency: this would create a circular dependency");
  }

  // Check if dependency already exists
  const existing = await prisma.dependency.findUnique({
    where: {
      taskId_dependsOnTaskId: {
        taskId,
        dependsOnTaskId,
      },
    },
  });

  if (existing) {
    throw new ApiError(400, "Dependency already exists");
  }

  const dependency = await prisma.dependency.create({
    data: {
      taskId,
      dependsOnTaskId,
      type: type || "BLOCKS",
    },
    include: {
      task: { select: { id: true, title: true } },
      dependsOn: { select: { id: true, title: true } },
    },
  });

  res.status(201).json({ data: dependency });
});

export const deleteDependency = asyncHandler(async (req: Request, res: Response) => {
  const id = str(req.params.id)!;

  await prisma.dependency.delete({
    where: { id },
  });

  res.status(204).send();
});

// Comments
export const getComments = asyncHandler(async (req: Request, res: Response) => {
  const id = str(req.params.id)!;

  const comments = await prisma.comment.findMany({
    where: { taskId: id },
    include: {
      author: {
        select: { id: true, name: true, email: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  res.json({ data: comments });
});

export const createComment = asyncHandler(async (req: Request, res: Response) => {
  const id = str(req.params.id)!;
  const { content, authorId } = req.body;

  // Get a fallback author - first admin user or any user
  let finalAuthorId = authorId;
  if (!finalAuthorId) {
    const fallbackUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      orderBy: { createdAt: "asc" },
    });
    finalAuthorId = fallbackUser?.id;
  }

  if (!finalAuthorId) {
    throw new ApiError(400, "No author available. Please create a user first.");
  }

  const comment = await prisma.comment.create({
    data: {
      taskId: id,
      authorId: finalAuthorId,
      content,
    },
    include: {
      author: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  res.status(201).json({ data: comment });
});

export const updateComment = asyncHandler(async (req: Request, res: Response) => {
  const id = str(req.params.id)!;
  const { content } = req.body;

  // Verify the comment exists
  const existing = await prisma.comment.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new ApiError(404, "Comment not found");
  }

  const comment = await prisma.comment.update({
    where: { id },
    data: { content },
    include: {
      author: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  res.json({ data: comment });
});

export const deleteComment = asyncHandler(async (req: Request, res: Response) => {
  const id = str(req.params.id)!;

  await prisma.comment.delete({
    where: { id },
  });

  res.status(204).send();
});

// Task Links
export const getLinks = asyncHandler(async (req: Request, res: Response) => {
  const id = str(req.params.id)!;

  const links = await prisma.taskLink.findMany({
    where: { taskId: id },
    orderBy: { createdAt: "desc" },
  });

  res.json({ data: links });
});

export const createLink = asyncHandler(async (req: Request, res: Response) => {
  const id = str(req.params.id)!;
  const { url, linkType, title } = req.body;

  const link = await prisma.taskLink.create({
    data: {
      taskId: id,
      url,
      linkType,
      title,
    },
  });

  res.status(201).json({ data: link });
});

export const updateLink = asyncHandler(async (req: Request, res: Response) => {
  const id = str(req.params.id)!;
  const { url, linkType, title } = req.body;

  // Verify the link exists
  const existing = await prisma.taskLink.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new ApiError(404, "Link not found");
  }

  const link = await prisma.taskLink.update({
    where: { id },
    data: { url, linkType, title },
  });

  res.json({ data: link });
});

export const deleteLink = asyncHandler(async (req: Request, res: Response) => {
  const id = str(req.params.id)!;

  await prisma.taskLink.delete({
    where: { id },
  });

  res.status(204).send();
});

/**
 * AI-Powered Task Decomposition
 *
 * Uses Claude API to break down a high-level task into actionable subtasks
 */
export const decomposeTask = asyncHandler(async (req: Request, res: Response) => {
  const id = str(req.params.id)!;
  const { teamConfigId, customTeam } = req.body;

  // Fetch the parent task with context
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      epic: {
        include: {
          project: {
            select: { id: true, name: true, description: true },
          },
        },
      },
    },
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  // Check if task already has subtasks (dependencies in this context)
  const existingSubtasks = await prisma.task.count({
    where: {
      epicId: task.epicId,
      // For now, we'll use the epic to find related tasks
      // In a future enhancement, we might add a parentTaskId field
    },
  });

  // Resolve team composition (used to decide whether QA subtasks are appropriate)
  let teamMembers: import("../services/taskDecomposition").TeamMember[] = [];
  if (teamConfigId) {
    const config = await prisma.teamConfig.findUnique({ where: { id: teamConfigId } });
    if (config) {
      teamMembers = (config.config as any).members || [];
    }
  } else if (customTeam) {
    try {
      teamMembers = typeof customTeam === "string" ? JSON.parse(customTeam) : customTeam;
    } catch {
      throw new ApiError(400, "Invalid custom team configuration");
    }
  }

  // Prepare decomposition request
  const taskAny = task as any;
  const decompositionRequest = {
    task: {
      title: task.title,
      description: task.description,
    },
    epic: {
      title: taskAny.epic.title,
      description: taskAny.epic.description,
    },
    project: {
      name: taskAny.epic.project.name,
      description: taskAny.epic.project.description,
    },
    team: teamMembers,
  };

  // Call AI service
  const decomposition = await taskDecompositionService.decompose(decompositionRequest);

  // Create subtasks in database
  const createdSubtasks = await Promise.all(
    decomposition.subtasks.map(async subtask => {
      return prisma.task.create({
        data: {
          epicId: task.epicId,
          title: subtask.title,
          description: subtask.description,
          storyPoints: subtask.storyPoints,
          priority: subtask.priority as any,
          status: "TODO",
          assigneeId: task.assigneeId, // Inherit assignee from parent
        },
        include: {
          epic: {
            select: { id: true, title: true },
          },
          assignee: {
            select: { id: true, name: true, email: true },
          },
        },
      });
    })
  );

  // Create dependencies between subtasks based on AI suggestions
  for (let i = 0; i < decomposition.subtasks.length; i++) {
    const subtask = decomposition.subtasks[i];
    const createdTask = createdSubtasks[i];

    if (subtask.dependencies && subtask.dependencies.length > 0) {
      for (const depOrder of subtask.dependencies) {
        // Find the task with this suggestedOrder
        const dependsOnTask = createdSubtasks.find(st => {
          const stIndex = decomposition.subtasks.findIndex(s => s.suggestedOrder === depOrder);
          return stIndex >= 0 && createdSubtasks[stIndex].id !== createdTask.id;
        });

        if (dependsOnTask) {
          await prisma.dependency.create({
            data: {
              taskId: createdTask.id,
              dependsOnTaskId: dependsOnTask.id,
              type: "BLOCKS",
            },
          });
        }
      }
    }
  }

  res.json({
    data: createdSubtasks,
    meta: {
      decompositionTime: decomposition.decompositionTime,
      modelUsed: decomposition.modelUsed,
      parentTaskId: task.id,
    },
  });
});

/**
 * Health check for the AI decomposition service
 */
export const decomposeHealthCheck = asyncHandler(async (req: Request, res: Response) => {
  const health = await taskDecompositionService.healthCheck();
  res.json({ data: health });
});

/**
 * AI-Assisted Task Update — proposes a revised title/description/priority/storyPoints
 * for an existing task. Review-only: does NOT write to the database. The caller
 * applies the suggestion via the normal PATCH /api/tasks/:id endpoint.
 */
export const aiUpdateTask = asyncHandler(async (req: Request, res: Response) => {
  const id = str(req.params.id)!;
  const { userId, instruction } = req.body;

  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      epic: {
        include: {
          project: { select: { id: true, name: true, description: true } },
        },
      },
    },
  });

  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  // Get API key: from user settings or environment (same resolution as epic decompose)
  let apiKey = process.env.ZAI_API_KEY;

  if (userId) {
    const userSettings = await prisma.userSettings.findUnique({ where: { userId } });
    if (userSettings?.anthropicApiKey) {
      try {
        apiKey = decrypt(userSettings.anthropicApiKey);
      } catch (error) {
        console.error("Failed to decrypt API key:", error);
        throw new ApiError(500, "Failed to decrypt API key. Please re-save your settings.");
      }
    }
  }

  if (!apiKey) {
    throw new ApiError(
      400,
      "No Z.AI API key found. Please add your API key in settings or set ZAI_API_KEY environment variable."
    );
  }

  const baseURL = process.env.ZAI_BASE_URL || "https://api.z.ai/api/coding/paas/v4";
  const client = new OpenAI({ apiKey, baseURL, timeout: 300000 });
  const model = process.env.ZAI_MODEL || "glm-5-turbo";

  const taskAny = task as any;
  const prompt = buildTaskUpdatePrompt(taskAny, taskAny.epic, taskAny.epic.project, instruction);

  try {
    const startTime = Date.now();
    const response = await client.chat.completions.create({
      model,
      max_tokens: 2048,
      messages: [
        {
          role: "system",
          content:
            "You are a senior project manager and technical lead. Revise a single existing task's fields. Always respond with valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
    });

    const decompositionTime = (Date.now() - startTime) / 1000;
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in AI response");
    }

    const suggestion = parseTaskUpdateSuggestion(content);

    res.json({
      data: suggestion,
      meta: {
        decompositionTime,
        modelUsed: model,
        taskId: task.id,
      },
    });
  } catch (error: any) {
    console.error("AI task update error:", error);
    if (error.status === 401) {
      throw new ApiError(401, "Invalid Z.AI API key. Please check your settings.");
    }
    if (error.status === 429) {
      throw new ApiError(429, "Z.AI API rate limit exceeded. Please try again later.");
    }
    throw new ApiError(500, `Failed to update task: ${error.message || "Unknown error"}`);
  }
});

function buildTaskUpdatePrompt(task: any, epic: any, project: any, instruction?: string): string {
  let context = "";
  if (project) {
    context += `**Project:** ${project.name}\n`;
    if (project.description) context += `${project.description}\n`;
    context += "\n";
  }
  if (epic) {
    context += `**Epic:** ${epic.title}\n`;
    if (epic.description) context += `${epic.description}\n`;
    context += "\n";
  }

  return `You are revising a single existing task. Propose an improved version of its fields.

${context}**Current Task:**
Title: ${task.title}
Description: ${task.description || "(none)"}
Priority: ${task.priority}
Story Points: ${task.storyPoints ?? "(unset)"}

${instruction ? `**Instruction from the user:**\n${instruction}\n` : "**Instruction:** No specific instruction was given — improve clarity, completeness, and accuracy of the task based on the project/epic context.\n"}

**Output Format:**
Return ONLY a valid JSON object (no markdown, no explanation) with the revised fields:

{
  "title": "Revised, clear, specific title",
  "description": "Revised description, including acceptance criteria where useful",
  "priority": "HIGH",
  "storyPoints": 5
}

Story points must be one of: 1, 2, 3, 5, 8, 13. Priority must be one of: CRITICAL, HIGH, MEDIUM, LOW.

Now generate the JSON response:`;
}

function parseTaskUpdateSuggestion(content: string): {
  title: string;
  description: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  storyPoints: number;
} {
  try {
    let jsonStr = content.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) jsonStr = jsonMatch[1];
    if (!jsonStr.startsWith("{")) {
      const rawMatch = jsonStr.match(/(\{[\s\S]*\})/);
      if (rawMatch) jsonStr = rawMatch[1];
    }

    const parsed = JSON.parse(jsonStr);
    const validPriorities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
    const validPoints = [1, 2, 3, 5, 8, 13];

    return {
      title: parsed.title || "Untitled Task",
      description: parsed.description || "",
      priority: validPriorities.includes(parsed.priority?.toUpperCase())
        ? parsed.priority.toUpperCase()
        : "MEDIUM",
      storyPoints: validPoints.includes(Number(parsed.storyPoints))
        ? Number(parsed.storyPoints)
        : 3,
    };
  } catch (error) {
    throw new Error(
      `Failed to parse AI response: ${error instanceof Error ? error.message : "Invalid JSON"}`
    );
  }
}
