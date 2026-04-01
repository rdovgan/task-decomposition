import { Request, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import prisma from '../lib/prisma';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import type { CreateEpicInput, UpdateEpicInput } from '../lib/validations';
import { decrypt } from '../lib/encryption';

export const getEpics = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  const projectId = req.query.projectId as string;
  const status = req.query.status as string;
  const priority = req.query.priority as string;

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
      orderBy: { createdAt: 'desc' },
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
  const { id } = req.params;

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
        orderBy: { priority: 'desc' },
      },
    },
  });

  if (!epic) {
    throw new ApiError(404, 'Epic not found');
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
  const { id } = req.params;
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
  const { id } = req.params;

  await prisma.epic.delete({
    where: { id },
  });

  res.status(204).send();
});

/**
 * AI Task Decomposition - Decompose an epic into suggested tasks
 */
export const aiDecomposeEpic = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { userId, customPrompt } = req.body;

  // Get the epic with project and context
  const epic = await prisma.epic.findUnique({
    where: { id },
    include: {
      project: true,
    },
  });

  if (!epic) {
    throw new ApiError(404, 'Epic not found');
  }

  // Get user's API key if userId provided
  let apiKey = process.env.ANTHROPIC_API_KEY;

  if (userId) {
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId },
    });

    if (userSettings?.anthropicApiKey) {
      try {
        apiKey = decrypt(userSettings.anthropicApiKey);
      } catch (error) {
        console.error('Failed to decrypt API key:', error);
        throw new ApiError(500, 'Failed to decrypt API key. Please re-save your settings.');
      }
    }
  }

  if (!apiKey) {
    throw new ApiError(
      400,
      'No Anthropic API key found. Please add your API key in settings or set ANTHROPIC_API_KEY environment variable.'
    );
  }

  // Initialize Anthropic client
  const client = new Anthropic({
    apiKey,
    timeout: 60000, // 60 second timeout for AI requests
  });

  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6';

  // Build the decomposition prompt
  const prompt = buildDecompositionPrompt(
    epic,
    epic.project,
    customPrompt
  );

  try {
    const startTime = Date.now();

    // Call Claude API
    const response = await client.messages.create({
      model,
      max_tokens: 8192,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const decompositionTime = (Date.now() - startTime) / 1000;

    // Extract and parse response
    const content = extractTextContent(response.content);
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
    console.error('AI decomposition error:', error);

    // Handle specific Anthropic errors
    if (error.status === 401) {
      throw new ApiError(401, 'Invalid Anthropic API key. Please check your settings.');
    }
    if (error.status === 429) {
      throw new ApiError(429, 'Anthropic API rate limit exceeded. Please try again later.');
    }
    if (error.status === 400) {
      throw new ApiError(400, `Bad request to Anthropic API: ${error.message}`);
    }

    throw new ApiError(
      500,
      `Failed to decompose epic: ${error.message || 'Unknown error'}`
    );
  }
});

/**
 * Build the prompt for Claude API
 */
function buildDecompositionPrompt(
  epic: any,
  project: any,
  customPrompt?: string
): string {
  let context = '';

  if (project) {
    context += `**Project Context:**\n`;
    context += `Project: ${project.name}\n`;
    if (project.description) {
      context += `Description: ${project.description}\n`;
    }
    context += '\n';
  }

  const basePrompt = customPrompt || `${epic.title}\n\n${epic.description || 'No description provided.'}`;

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
- Tasks should follow a logical sequence (setup, core features, edge cases, testing, documentation)
- Earlier tasks are typically prerequisites for later tasks
- Use Fibonacci story points: 1 (very small), 2 (small), 3 (medium), 5 (medium-large), 8 (large), 13 (very large)
- CRITICAL/HIGH priority for blockers, critical path, or security items
- Each task should be completable in 1-3 days
- Include technical tasks (setup, configuration, deployment)
- Include testing tasks (unit tests, integration tests, E2E tests)
- Include documentation tasks where relevant

Now generate the JSON response:`;
}

/**
 * Extract text content from Claude response
 */
function extractTextContent(content: Anthropic.Message['content']): string {
  const textBlock = content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text content in Claude response');
  }
  return textBlock.text;
}

/**
 * Parse task suggestions from Claude's response
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
      throw new Error('Invalid response format: missing tasks array');
    }

    // Validate and normalize task structure
    return parsed.tasks.map((task: any, index: number) => ({
      title: task.title || `Task ${index + 1}`,
      description: task.description || '',
      storyPoints: validateStoryPoints(task.storyPoints),
      priority: validatePriority(task.priority),
    }));
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    throw new Error(
      `Failed to parse AI response: ${error instanceof Error ? error.message : 'Invalid JSON'}`
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
function validatePriority(priority: string): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
  const normalized = priority?.toUpperCase();
  if (['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].includes(normalized)) {
    return normalized as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  }
  return 'MEDIUM'; // Default
}
