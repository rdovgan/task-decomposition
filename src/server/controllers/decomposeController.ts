import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import prisma from "../lib/prisma";
import { asyncHandler, ApiError } from "../middleware/errorHandler";
import { decrypt } from "../lib/encryption";
import { str } from "../lib/express";

// PDF text extraction using pdfjs-dist
async function extractTextFromPDF(filePath: string): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.mjs");
  const dataBuffer = fs.readFileSync(filePath);
  const data = new Uint8Array(dataBuffer);
  const doc = await pdfjsLib.getDocument({ data }).promise;
  const textParts: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(" ");
    textParts.push(pageText);
  }
  return textParts.join("\n\n");
}

// Team member type
interface TeamMember {
  role: "junior" | "middle" | "senior" | "lead" | "architect";
  specialty: string;
  count?: number;
}

// Task suggestion from AI
interface TaskSuggestion {
  title: string;
  description: string;
  estimatedHours: number;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  specialty: string;
  suggestedOrder: number;
  dependencies: number[];
}

/**
 * Quick decompose: upload PDF + get tasks in one shot
 * POST /api/decompose/quick
 */
export const quickDecompose = asyncHandler(async (req: Request, res: Response) => {
  const file = (req as any).file;
  const { teamConfigId, customTeam, projectName } = req.body;

  if (!file) {
    throw new ApiError(400, "PDF file is required");
  }

  console.log(`[decompose] Starting quick decompose for file: ${file.originalname} (${file.size} bytes)`);

  // Extract text from PDF
  let pdfText: string;
  try {
    const pdfStart = Date.now();
    pdfText = await extractTextFromPDF(file.path);
    console.log(`[decompose] PDF extraction took ${Date.now() - pdfStart}ms, extracted ${pdfText.length} chars`);
  } catch (error: any) {
    console.error(`[decompose] PDF extraction failed:`, error.message);
    throw new ApiError(400, `Failed to parse PDF file: ${error.message}`);
  } finally {
    // Clean up uploaded file
    try { fs.unlinkSync(file.path); } catch {}
  }

  if (!pdfText || pdfText.trim().length < 20) {
    throw new ApiError(400, "PDF appears to be empty or contains too little text to analyze.");
  }

  // Truncate very large PDFs to avoid token limits
  if (pdfText.length > 30000) {
    pdfText = pdfText.substring(0, 30000) + "\n\n[... document truncated ...]";
  }

  // Resolve team config
  let teamMembers: TeamMember[] = [];
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

  // Get API key
  let apiKey = process.env.ZAI_API_KEY;
  if (!apiKey) {
    throw new ApiError(400, "No AI API key configured. Please set ZAI_API_KEY environment variable.");
  }

  const baseURL = process.env.ZAI_BASE_URL || "https://api.z.ai/api/coding/paas/v4";
  const model = process.env.ZAI_MODEL || "glm-5-turbo";

  const client = new OpenAI({
    apiKey,
    baseURL,
    timeout: 300000,
  });

  // Build prompt
  const prompt = buildQuickDecompositionPrompt(pdfText, teamMembers, projectName);

  const startTime = Date.now();
  console.log(`[quickDecompose] Starting AI call with model=${model}, prompt=${prompt.length} chars`);

  try {
    const response = await client.chat.completions.create({
      model,
      max_tokens: 8192,
      messages: [
        {
          role: "system",
          content:
            "You are a senior project manager and technical architect. You analyze requirements documents and break them into well-estimated, actionable tasks. Always respond with valid JSON only, no markdown.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
    });

    const decompositionTime = (Date.now() - startTime) / 1000;
    console.log(`[quickDecompose] AI call completed in ${decompositionTime}s`);
    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error("Empty AI response");
    }

    const tasks = parseTaskSuggestions(content);

    // Suggestions are review-only here; nothing is persisted until the user
    // reviews and saves the selected tasks via POST /api/decompose/save
    res.json({
      data: {
        tasks,
        project: null,
        epic: null,
        teamUsed: teamMembers,
        pdfTextLength: pdfText.length,
      },
      meta: {
        decompositionTime,
        modelUsed: model,
        totalEstimatedHours: tasks.reduce((sum, t) => sum + t.estimatedHours, 0),
      },
    });
  } catch (error: any) {
    console.error("Quick decompose error:", error);
    if (error instanceof ApiError) throw error;
    if (error.status === 401) throw new ApiError(401, "Invalid AI API key");
    if (error.status === 429) throw new ApiError(429, "AI API rate limit exceeded");
    throw new ApiError(500, `Decomposition failed: ${error.message}`);
  }
});

/**
 * Public API: upload a PDF, get decomposed tasks back as JSON.
 * Stateless — nothing is persisted, no team/project concepts involved.
 * Requires the X-API-Key header (see apiKeyAuth middleware).
 * POST /api/v1/decompose
 */
export const decomposePdfPublic = asyncHandler(async (req: Request, res: Response) => {
  const file = (req as any).file;

  if (!file) {
    throw new ApiError(400, "A PDF file is required (multipart field name: 'file')");
  }

  console.log(`[v1/decompose] Starting decompose for file: ${file.originalname} (${file.size} bytes)`);

  let pdfText: string;
  try {
    pdfText = await extractTextFromPDF(file.path);
  } catch (error: any) {
    console.error(`[v1/decompose] PDF extraction failed:`, error.message);
    throw new ApiError(400, `Failed to parse PDF file: ${error.message}`);
  } finally {
    try { fs.unlinkSync(file.path); } catch {}
  }

  if (!pdfText || pdfText.trim().length < 20) {
    throw new ApiError(400, "PDF appears to be empty or contains too little text to analyze.");
  }

  if (pdfText.length > 30000) {
    pdfText = pdfText.substring(0, 30000) + "\n\n[... document truncated ...]";
  }

  const apiKey = process.env.ZAI_API_KEY;
  if (!apiKey) {
    throw new ApiError(500, "AI API key not configured on the server.");
  }

  const baseURL = process.env.ZAI_BASE_URL || "https://api.z.ai/api/coding/paas/v4";
  const model = process.env.ZAI_MODEL || "glm-5-turbo";
  const client = new OpenAI({ apiKey, baseURL, timeout: 300000 });

  const prompt = buildQuickDecompositionPrompt(pdfText, [], undefined);
  const startTime = Date.now();

  try {
    const response = await client.chat.completions.create({
      model,
      max_tokens: 8192,
      messages: [
        {
          role: "system",
          content:
            "You are a senior project manager and technical architect. You analyze requirements documents and break them into well-estimated, actionable tasks. Always respond with valid JSON only, no markdown.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
    });

    const decompositionTime = (Date.now() - startTime) / 1000;
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty AI response");
    }

    const tasks = parseTaskSuggestions(content);

    res.json({
      tasks: tasks.map(t => ({
        title: t.title,
        description: t.description,
        estimatedHours: t.estimatedHours,
        priority: t.priority,
        specialty: t.specialty,
        order: t.suggestedOrder,
        dependencies: t.dependencies,
      })),
      meta: {
        decompositionTime,
        modelUsed: model,
        totalEstimatedHours: tasks.reduce((sum, t) => sum + t.estimatedHours, 0),
      },
    });
  } catch (error: any) {
    console.error("[v1/decompose] error:", error);
    if (error instanceof ApiError) throw error;
    if (error.status === 401) throw new ApiError(401, "Invalid AI API key");
    if (error.status === 429) throw new ApiError(429, "AI API rate limit exceeded");
    throw new ApiError(500, `Decomposition failed: ${error.message}`);
  }
});

/**
 * Decompose from plain text (no PDF)
 * POST /api/decompose/text
 */
export const textDecompose = asyncHandler(async (req: Request, res: Response) => {
  const { text, teamConfigId, customTeam, projectName } = req.body;

  if (!text || text.trim().length < 20) {
    throw new ApiError(400, "Requirements text is required (at least 20 characters)");
  }

  // Reuse the same logic but with text input instead of PDF
  let teamMembers: TeamMember[] = [];
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

  let apiKey = process.env.ZAI_API_KEY;
  if (!apiKey) {
    throw new ApiError(400, "No AI API key configured.");
  }

  const baseURL = process.env.ZAI_BASE_URL || "https://api.z.ai/api/coding/paas/v4";
  const model = process.env.ZAI_MODEL || "glm-5-turbo";

  const client = new OpenAI({ apiKey, baseURL, timeout: 300000 });

  let pdfText = text.substring(0, 30000);
  const prompt = buildQuickDecompositionPrompt(pdfText, teamMembers, projectName);

  const startTime = Date.now();

  try {
    const response = await client.chat.completions.create({
      model,
      max_tokens: 8192,
      messages: [
        {
          role: "system",
          content:
            "You are a senior project manager and technical architect. You analyze requirements documents and break them into well-estimated, actionable tasks. Always respond with valid JSON only, no markdown.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
    });

    const decompositionTime = (Date.now() - startTime) / 1000;
    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error("Empty AI response");

    const tasks = parseTaskSuggestions(content);

    // Suggestions are review-only here; nothing is persisted until the user
    // reviews and saves the selected tasks via POST /api/decompose/save
    res.json({
      data: {
        tasks,
        project: null,
        epic: null,
        teamUsed: teamMembers,
      },
      meta: {
        decompositionTime,
        modelUsed: model,
        totalEstimatedHours: tasks.reduce((sum, t) => sum + t.estimatedHours, 0),
      },
    });
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, `Decomposition failed: ${error.message}`);
  }
});

/**
 * Persist a reviewed set of decomposed tasks as a new project + epic.
 * Called after the user has reviewed AI suggestions and selected which
 * ones to keep (quick/text decompose no longer auto-persist).
 * POST /api/decompose/save
 */
export const saveDecomposition = asyncHandler(async (req: Request, res: Response) => {
  const { projectName, tasks } = req.body as { projectName?: string; tasks?: TaskSuggestion[] };

  if (!projectName || !projectName.trim()) {
    throw new ApiError(400, "projectName is required");
  }
  if (!Array.isArray(tasks) || tasks.length === 0) {
    throw new ApiError(400, "At least one task is required");
  }

  let adminUser = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: { email: "admin@local.dev", name: "Admin", role: "ADMIN" },
    });
  }

  const project = await prisma.project.create({
    data: {
      name: projectName,
      description: "Auto-created from AI decomposition",
      ownerId: adminUser.id,
      status: "ACTIVE",
    },
  });

  const epic = await prisma.epic.create({
    data: {
      projectId: project.id,
      title: projectName,
      description: "Requirements decomposed with AI",
      status: "BACKLOG",
      priority: "MEDIUM",
    },
  });

  // Map by suggestedOrder rather than array position, since the caller may
  // have sent only a subset of the originally suggested tasks
  const orderToCreated = new Map<number, { id: string }>();
  for (const task of tasks) {
    const created = await prisma.task.create({
      data: {
        epicId: epic.id,
        title: task.title,
        description: task.description,
        estimatedHours: task.estimatedHours,
        priority: task.priority,
        status: "TODO",
      },
    });
    orderToCreated.set(task.suggestedOrder, created);
  }

  for (const task of tasks) {
    const createdTask = orderToCreated.get(task.suggestedOrder);
    if (!createdTask || !task.dependencies) continue;
    for (const depOrder of task.dependencies) {
      const dependsOnTask = orderToCreated.get(depOrder);
      if (dependsOnTask && dependsOnTask.id !== createdTask.id) {
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

  res.status(201).json({
    data: {
      project: { id: project.id, name: project.name },
      epic: { id: epic.id, title: epic.title },
    },
  });
});

// ─── Team Config CRUD ─────────────────────────────────────────────

export const getTeamConfigs = asyncHandler(async (req: Request, res: Response) => {
  const configs = await prisma.teamConfig.findMany({
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });
  res.json({ data: configs });
});

export const getTeamConfig = asyncHandler(async (req: Request, res: Response) => {
  const id = str(req.params.id)!;
  const config = await prisma.teamConfig.findUnique({ where: { id } });
  if (!config) throw new ApiError(404, "Team config not found");
  res.json({ data: config });
});

export const createTeamConfig = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, members, isDefault } = req.body;

  if (!name || !members || !Array.isArray(members) || members.length === 0) {
    throw new ApiError(400, "Name and at least one team member are required");
  }

  // If setting as default, unset other defaults
  if (isDefault) {
    await prisma.teamConfig.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
  }

  const config = await prisma.teamConfig.create({
    data: {
      name,
      description,
      config: { members },
      isDefault: isDefault || false,
    },
  });

  res.status(201).json({ data: config });
});

export const updateTeamConfig = asyncHandler(async (req: Request, res: Response) => {
  const id = str(req.params.id)!;
  const { name, description, members, isDefault } = req.body;

  if (isDefault) {
    await prisma.teamConfig.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
  }

  const config = await prisma.teamConfig.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(members && { config: { members } }),
      ...(isDefault !== undefined && { isDefault }),
    },
  });

  res.json({ data: config });
});

export const deleteTeamConfig = asyncHandler(async (req: Request, res: Response) => {
  const id = str(req.params.id)!;
  await prisma.teamConfig.delete({ where: { id } });
  res.status(204).send();
});

// ─── Helper functions ──────────────────────────────────────────────

function buildQuickDecompositionPrompt(
  requirementsText: string,
  teamMembers: TeamMember[],
  projectName?: string
): string {
  let teamSection = "";
  if (teamMembers.length > 0) {
    const teamDescription = teamMembers
      .map((m) => `- ${m.role} ${m.specialty}${m.count && m.count > 1 ? ` (×${m.count})` : ""}`)
      .join("\n");

    const specialties = [...new Set(teamMembers.map((m) => m.specialty.toLowerCase()))];
    const avgSeniority = teamMembers.length > 0
      ? teamMembers.reduce((sum, m) => {
          const weights = { junior: 1, middle: 2, senior: 3, lead: 4, architect: 5 };
          return sum + (weights[m.role] || 2);
        }, 0) / teamMembers.length
      : 2;

    teamSection = `
**Team Composition:**
${teamDescription}

**Team Seniority Level:** ${avgSeniority <= 1.5 ? "Junior-heavy" : avgSeniority <= 2.5 ? "Mixed" : avgSeniority <= 3.5 ? "Senior-heavy" : "Expert"} team
**Available Specialties:** ${specialties.join(", ")}

**Estimation Guidelines:**
- Junior developers complete tasks ~2x slower than senior
- Adjust hours based on team seniority level
- Assign tasks to appropriate specialties
- For junior-heavy teams: add buffer time and more granular subtasks
- For senior-heavy teams: tasks can be more complex with fewer subtasks
`;
  }

  return `Analyze the following requirements document and break it down into a comprehensive, well-estimated task list.

${projectName ? `**Project Name:** ${projectName}\n` : ""}
${teamSection}
**Requirements Document:**
---
${requirementsText}
---

**Instructions:**
1. Analyze the requirements document and identify the distinct implementation areas (e.g. "Build checkout API", "Build product catalog UI") — do NOT enumerate every minor step
2. Break down into the minimum number of tasks that cover those areas — typically 4-10. Only go higher if the document describes a genuinely large number of independent features. Do not pad the list to hit a target count.
3. Each task should represent a coherent area of work a developer could pick up, not a granular sub-step. Merge closely related work into a single task instead of splitting it further.
4. For each task, provide:
   - Clear, specific title
   - Detailed description with acceptance criteria
   - Realistic time estimate in hours (adjusted for team seniority)
   - Priority based on business value and dependencies
   - Which specialty should handle it
   - Dependencies on other tasks (by suggestedOrder number)
5. Order tasks logically: setup → core features → edge cases → integration

**CRITICAL RULE — ONLY DEVELOPMENT TASKS:**
You must ONLY generate tasks that are directly related to implementing the features and functionality described in the requirements document.

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

ONLY include tasks that involve writing code to implement the actual features described in the requirements: designing components, building APIs, implementing business logic, creating UI, database schema changes, data migrations, etc.

Return ONLY valid JSON (no markdown fences, no explanation):

{
  "tasks": [
    {
      "title": "Task title",
      "description": "What needs to be done, including acceptance criteria",
      "estimatedHours": 8,
      "priority": "HIGH",
      "specialty": "backend",
      "suggestedOrder": 1,
      "dependencies": []
    }
  ]
}

Now generate the JSON response:`;
}

function parseTaskSuggestions(content: string): TaskSuggestion[] {
  try {
    let jsonStr = content.trim();
    const codeMatch = jsonStr.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
    if (codeMatch) jsonStr = codeMatch[1];
    if (!jsonStr.startsWith("{")) {
      const rawMatch = jsonStr.match(/(\{[\s\S]*\})/);
      if (rawMatch) jsonStr = rawMatch[1];
    }

    const parsed = JSON.parse(jsonStr);
    if (!parsed.tasks || !Array.isArray(parsed.tasks)) {
      throw new Error("Missing tasks array");
    }

    const validPriorities = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

    return parsed.tasks.map((t: any, i: number) => ({
      title: t.title || `Task ${i + 1}`,
      description: t.description || "",
      estimatedHours: Number(t.estimatedHours) || 4,
      priority: validPriorities.includes(t.priority?.toUpperCase()) ? t.priority.toUpperCase() : "MEDIUM",
      specialty: t.specialty || "general",
      suggestedOrder: Number(t.suggestedOrder) || i + 1,
      dependencies: Array.isArray(t.dependencies) ? t.dependencies : [],
    }));
  } catch (error) {
    throw new Error(
      `Failed to parse AI response: ${error instanceof Error ? error.message : "Invalid JSON"}`
    );
  }
}
