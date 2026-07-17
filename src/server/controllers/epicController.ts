import { Request, Response } from "express";
import OpenAI from "openai";
import prisma from "../lib/prisma";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import type { CreateEpicInput, UpdateEpicInput } from "../lib/validations";
import { decrypt } from "../lib/encryption";
import { str } from "../lib/express";

export const getEpics = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(str(req.query.page) || "1") || 1;
  const limit = parseInt(str(req.query.limit) || "10") || 10;
  const skip = (page - 1) * limit;
  const projectId = str(req.query.projectId);
  const status = str(req.query.status);
  const priority = str(req.query.priority);

  const where: any = {};
  if (projectId) where.projectId = projectId;
  if (status) where.status = status;
  if (priority) where.priority = priority;

  const [epics, total] = await Promise.all([
    prisma.epic.findMany({
      where,
      skip,
      take: limit,
      include: {
        project: {
          select: { id: true, name: true },
        },
        _count: {
          select: { tasks: true },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.epic.count({ where }),
  ]);

  res.json({
    data: epics,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const getEpicById = asyncHandler(async (req: Request, res: Response) => {
  const id = str(req.params.id)!;

  const epic = await prisma.epic.findUnique({
    where: { id },
    include: {
      project: {
        select: { id: true, name: true },
      },
      tasks: {
        include: {
          assignee: {
            select: { id: true, name: true, email: true },
          },
          _count: {
            select: { dependencies: true, dependents: true, comments: true },
          },
        },
        orderBy: { priority: "desc" },
      },
    },
  });

  if (!epic) {
    throw new ApiError(404, "Epic not found");
  }

  res.json({ data: epic });
});

export const createEpic = asyncHandler(async (req: Request, res: Response) => {
  const input: CreateEpicInput = req.body;

  const epic = await prisma.epic.create({
    data: input,
    include: {
      project: {
        select: { id: true, name: true },
      },
    },
  });

  res.status(201).json({ data: epic });
});

export const updateEpic = asyncHandler(async (req: Request, res: Response) => {
  const id = str(req.params.id)!;
  const input: UpdateEpicInput = req.body;

  const epic = await prisma.epic.update({
    where: { id },
    data: input,
    include: {
      project: {
        select: { id: true, name: true },
      },
    },
  });

  res.json({ data: epic });
});

export const deleteEpic = asyncHandler(async (req: Request, res: Response) => {
  const id = str(req.params.id)!;

  await prisma.epic.delete({
    where: { id },
  });

  res.status(204).send();
});

/**
 * AI Task Decomposition - Decompose an epic into suggested tasks
 */
export const aiDecomposeEpic = asyncHandler(async (req: Request, res: Response) => {
  const id = str(req.params.id)!;
  const { userId, customPrompt } = req.body;

  // Get the epic with project and context
  const epic = await prisma.epic.findUnique({
    where: { id },
    include: {
      project: true,
    },
  });

  if (!epic) {
    throw new ApiError(404, "Epic not found");
  }

  // Get API key: from user settings or environment
  let apiKey = process.env.ZAI_API_KEY;

  if (userId) {
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId },
    });

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

  // Initialize Z.AI (OpenAI-compatible) client
  const baseURL = process.env.ZAI_BASE_URL || "https://api.z.ai/api/coding/paas/v4";
  const client = new OpenAI({
    apiKey,
    baseURL,
    timeout: 300000, // 5 minute timeout for AI requests
  });

  const model = process.env.ZAI_MODEL || "glm-5-turbo";

  // Build the decomposition prompt
  const prompt = buildDecompositionPrompt(epic, (epic as any).project, customPrompt);

  try {
    const startTime = Date.now();

    // Call Z.AI API (OpenAI-compatible)
    const response = await client.chat.completions.create({
      model,
      max_tokens: 8192,
      messages: [
        {
          role: "system",
          content: "You are a senior project manager and technical lead. Break down epics into actionable tasks. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const decompositionTime = (Date.now() - startTime) / 1000;

    // Extract and parse response
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in AI response");
    }
    const tasks = parseTaskSuggestions(content);

    res.json({
      data: tasks,
      meta: {
        decompositionTime,
        modelUsed: model,
        epicId: epic.id,
        epicTitle: epic.title,
      },
    });
  } catch (error: any) {
    console.error("AI decomposition error:", error);

    // Handle specific API errors
    if (error.status === 401) {
      throw new ApiError(401, "Invalid Z.AI API key. Please check your settings.");
    }
    if (error.status === 429) {
      throw new ApiError(429, "Z.AI API rate limit exceeded. Please try again later.");
    }
    if (error.status === 400) {
      throw new ApiError(400, `Bad request to Z.AI API: ${error.message}`);
    }

    throw new ApiError(500, `Failed to decompose epic: ${error.message || "Unknown error"}`);
  }
});

/**
 * Build the prompt for Claude API
 */
function buildDecompositionPrompt(epic: any, project: any, customPrompt?: string): string {
  let context = "";

  if (project) {
    context += `**Project Context:**\n`;
    context += `Project: ${project.name}\n`;
    if (project.description) {
      context += `Description: ${project.description}\n`;
    }
    context += "\n";
  }

  const basePrompt =
    customPrompt || `${epic.title}\n\n${epic.description || "No description provided."}`;

  return `You are a senior project manager and technical lead. Your task is to break down the following epic into 5-15 actionable, well-defined tasks.

${context}**Epic to Decompose:**
${basePrompt}

**Requirements:**
1. Break down the epic into logical, sequential tasks
2. Each task should be specific, actionable, and testable
3. Estimate story points (1, 2, 3, 5, 8, 13) based on complexity
4. Assign priority (CRITICAL, HIGH, MEDIUM, LOW) based on importance and dependencies
5. Provide clear descriptions for each task
6. Include acceptance criteria where applicable

**CRITICAL RULE — ONLY DEVELOPMENT TASKS:**
You must ONLY generate tasks that are directly related to implementing the features and functionality described in the epic.

DO NOT include any of the following types of tasks:
- Testing tasks (unit tests, integration tests, E2E tests, QA, test plans, test strategy)
- Code review tasks (PR reviews, code review meetings, review checklists)
- Monitoring tasks (logging, metrics, dashboards, alerts, observability)
- Documentation tasks (technical docs, API docs, user guides, README updates)
- CI/CD tasks (pipeline setup, deployment automation, build configuration)
- DevOps/infrastructure tasks (server setup, cloud configuration, environment provisioning)
- Project management tasks (sprint planning, retrospectives, standups, stakeholder reviews)
- Security audit tasks (penetration testing, security reviews, compliance checks)
- Performance testing/benchmarking tasks
- Training/knowledge transfer tasks

ONLY include tasks that involve writing code to implement the actual features described in the epic: designing components, building APIs, implementing business logic, creating UI, database schema changes, data migrations, etc.

**Output Format:**
Return ONLY a valid JSON object (no markdown, no explanation). Use this exact structure:

\`\`\`json
{
  "tasks": [
    {
      "title": "Clear, specific task title",
      "description": "Detailed description of what needs to be done, including acceptance criteria",
      "storyPoints": 5,
      "priority": "HIGH"
    },
    {
      "title": "Second task title",
      "description": "Description with acceptance criteria",
      "storyPoints": 3,
      "priority": "MEDIUM"
    }
  ]
}
\`\`\`

**Guidelines:**
- Tasks should follow a logical sequence (setup, core features, edge cases, integration)
- Earlier tasks are typically prerequisites for later tasks
- Use Fibonacci story points: 1 (very small), 2 (small), 3 (medium), 5 (medium-large), 8 (large), 13 (very large)
- CRITICAL/HIGH priority for blockers, critical path, or security items
- Each task should be completable in 1-3 days

Now generate the JSON response:`;
}

/**
 * Parse task suggestions from AI response
 */
function parseTaskSuggestions(content: string): any[] {
  try {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (jsonMatch) {
      content = jsonMatch[1];
    }

    const parsed = JSON.parse(content.trim());

    if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
      throw new Error("Invalid response format: missing tasks array");
    }

    // Validate and normalize task structure
    return parsed.tasks.map((task: any, index: number) => ({
      title: task.title || `Task ${index + 1}`,
      description: task.description || "",
      storyPoints: validateStoryPoints(task.storyPoints),
      priority: validatePriority(task.priority),
    }));
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    throw new Error(
      `Failed to parse AI response: ${error instanceof Error ? error.message : "Invalid JSON"}`
    );
  }
}

/**
 * Validate and normalize story points
 */
function validateStoryPoints(points: any): number {
  const validPoints = [1, 2, 3, 5, 8, 13];
  const normalized = Number(points);

  if (validPoints.includes(normalized)) {
    return normalized;
  }

  // Default to 3 if invalid
  return 3;
}

/**
 * Validate and normalize priority
 */
function validatePriority(priority: string): "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" {
  const normalized = priority?.toUpperCase();
  if (["CRITICAL", "HIGH", "MEDIUM", "LOW"].includes(normalized)) {
    return normalized as "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  }
  return "MEDIUM"; // Default
}
