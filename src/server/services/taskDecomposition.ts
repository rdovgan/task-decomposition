import OpenAI from "openai";

/**
 * Team member used to decide estimation/QA guidance
 */
export interface TeamMember {
  role: "junior" | "middle" | "senior" | "lead" | "architect";
  specialty: string;
  count?: number;
}

/**
 * Subtask suggestion from AI decomposition
 */
export interface SubtaskSuggestion {
  title: string;
  description: string;
  storyPoints: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  suggestedOrder: number;
  dependencies?: number[]; // Array of suggestedOrder indices this task depends on
}

/**
 * Decomposition response from AI service
 */
export interface DecompositionResponse {
  subtasks: SubtaskSuggestion[];
  decompositionTime: number;
  modelUsed: string;
}

/**
 * Decomposition request input
 */
export interface DecompositionRequest {
  task: {
    title: string;
    description: string | null;
  };
  epic?: {
    title: string;
    description: string | null;
  };
  project?: {
    name: string;
    description: string | null;
  };
  team?: TeamMember[];
}

/**
 * AI-powered Task Decomposition Service
 *
 * Uses Z.AI Coding Plan API (OpenAI-compatible) to intelligently break down
 * high-level tasks into manageable subtasks with time estimates and dependencies.
 *
 * Configuration via environment variables:
 * - ZAI_API_KEY: Your Z.AI API key
 * - ZAI_BASE_URL: Base URL (default: https://api.z.ai/api/coding/paas/v4)
 * - ZAI_MODEL: Model name (default: glm-5-turbo)
 */
class TaskDecompositionService {
  private client: OpenAI;
  private model: string;

  constructor() {
    const apiKey = process.env.ZAI_API_KEY;

    if (!apiKey) {
      throw new Error("ZAI_API_KEY environment variable is not set");
    }

    const baseURL = process.env.ZAI_BASE_URL || "https://api.z.ai/api/coding/paas/v4";
    const timeout = process.env.API_TIMEOUT_MS ? parseInt(process.env.API_TIMEOUT_MS, 10) : 300000;

    this.client = new OpenAI({
      apiKey,
      baseURL,
      timeout,
    });

    this.model = process.env.ZAI_MODEL || "glm-5-turbo";
  }

  /**
   * Decompose a task into subtasks using Z.AI API
   */
  async decompose(request: DecompositionRequest): Promise<DecompositionResponse> {
    const startTime = Date.now();

    try {
      const prompt = this.buildDecompositionPrompt(request);

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: "system",
            content:
              "You are a senior project manager and technical lead. Your task is to break down tasks into actionable subtasks. Always respond with valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      });

      const decompositionTime = (Date.now() - startTime) / 1000;

      // Parse AI response
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No content in AI response");
      }

      const subtasks = this.parseSubtasks(content);

      return {
        subtasks,
        decompositionTime,
        modelUsed: this.model,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("rate")) {
          throw new Error("Z.AI API rate limit exceeded. Please try again later.");
        }
        if (error.message.includes("auth") || error.message.includes("401")) {
          throw new Error("Z.AI API authentication failed. Check your API key.");
        }
      }
      throw new Error(
        `Failed to decompose task: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Build the prompt for task decomposition
   */
  private buildDecompositionPrompt(request: DecompositionRequest): string {
    const { task, epic, project, team = [] } = request;

    let context = "";
    if (project) {
      context += `Project: ${project.name}`;
      if (project.description) {
        context += `\n${project.description}`;
      }
      context += "\n\n";
    }

    if (epic) {
      context += `Epic: ${epic.title}`;
      if (epic.description) {
        context += `\n${epic.description}`;
      }
      context += "\n\n";
    }

    const hasQA = team.some(m => m.specialty?.toLowerCase() === "qa");
    const testingRule = hasQA
      ? `- Testing/QA tasks ARE allowed: the team includes a QA specialist, so you may include dedicated testing subtasks where they represent meaningful, distinct work.`
      : `- Testing tasks (unit tests, integration tests, E2E tests, QA, test plans): do NOT create separate testing subtasks — instead, fold the time/effort needed to test each piece of work into that subtask's own story point estimate, since there is no QA specialist on this team.`;

    return `Break down the following task into 3-8 actionable subtasks.

${context}**Task to Decompose:**
Title: ${task.title}
${task.description ? `Description: ${task.description}` : ""}

**Requirements:**
1. Break down the task into logical, sequential subtasks
2. Each subtask should be specific and actionable
3. Estimate story points (1, 2, 3, 5, 8, 13 — Fibonacci) for each subtask, based on complexity
4. Assign priority (HIGH, MEDIUM, LOW) based on importance
5. Specify the suggested order (1 = first, 2 = second, etc.)
6. Identify dependencies by referencing the suggestedOrder of prerequisite tasks

**CRITICAL RULE — ONLY DEVELOPMENT TASKS:**
You must ONLY generate tasks that are directly related to implementing the features and functionality described.

DO NOT include any of the following types of tasks:
${testingRule}
- Code review tasks (PR reviews, code review meetings)
- Monitoring tasks (logging, metrics, dashboards, alerts)
- Documentation tasks (technical docs, API docs, README updates)
- CI/CD tasks (pipeline setup, deployment automation)
- DevOps/infrastructure tasks (server setup, cloud configuration)
- Project management tasks (sprint planning, retrospectives)

ONLY include tasks that involve writing code to implement actual features.

**Output Format:**
Return ONLY a valid JSON object (no markdown, no explanation, no code fences). Use this exact structure:

{
  "subtasks": [
    {
      "title": "Clear, specific task title",
      "description": "Detailed description of what needs to be done",
      "storyPoints": 3,
      "priority": "HIGH",
      "suggestedOrder": 1,
      "dependencies": []
    },
    {
      "title": "Second task title",
      "description": "Description of the second task",
      "storyPoints": 2,
      "priority": "MEDIUM",
      "suggestedOrder": 2,
      "dependencies": [1]
    }
  ]
}

**Guidelines:**
- Total story points should be realistic for the task complexity
- Earlier tasks should typically be completed first
- Dependencies: use an array of suggestedOrder numbers (e.g., [1] means this task depends on task with suggestedOrder=1)
- High priority for critical path items or blockers
- Each subtask should be small enough to complete in one sitting (1-2 points ideally, up to 5 for more complex work)

Now generate the JSON response:`;
  }

  /**
   * Parse subtasks from AI response
   */
  private parseSubtasks(content: string): SubtaskSuggestion[] {
    try {
      // Try to extract JSON from markdown code blocks
      let jsonStr = content.trim();
      const jsonMatch = jsonStr.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }

      // Also try to find raw JSON object if no code fences
      if (!jsonStr.startsWith("{")) {
        const rawMatch = jsonStr.match(/(\{[\s\S]*\})/);
        if (rawMatch) {
          jsonStr = rawMatch[1];
        }
      }

      const parsed = JSON.parse(jsonStr);

      if (!parsed.subtasks || !Array.isArray(parsed.subtasks)) {
        throw new Error("Invalid response format: missing subtasks array");
      }

      // Validate subtask structure
      const subtasks: SubtaskSuggestion[] = parsed.subtasks.map((st: any, index: number) => ({
        title: st.title || `Subtask ${index + 1}`,
        description: st.description || "",
        storyPoints: this.validateStoryPoints(st.storyPoints),
        priority: this.validatePriority(st.priority),
        suggestedOrder: Number(st.suggestedOrder) || index + 1,
        dependencies: Array.isArray(st.dependencies) ? st.dependencies : [],
      }));

      // Sort by suggestedOrder
      return subtasks.sort((a, b) => a.suggestedOrder - b.suggestedOrder);
    } catch (error) {
      throw new Error(
        `Failed to parse AI response: ${error instanceof Error ? error.message : "Invalid JSON"}`
      );
    }
  }

  /**
   * Validate and normalize priority value
   */
  private validatePriority(priority: string): "HIGH" | "MEDIUM" | "LOW" {
    const normalized = priority?.toUpperCase();
    if (normalized === "HIGH" || normalized === "MEDIUM" || normalized === "LOW") {
      return normalized;
    }
    return "MEDIUM"; // Default
  }

  /**
   * Validate and normalize story points to the nearest valid Fibonacci value
   */
  private validateStoryPoints(points: any): number {
    const validPoints = [1, 2, 3, 5, 8, 13];
    const normalized = Number(points);
    return validPoints.includes(normalized) ? normalized : 2;
  }

  /**
   * Health check for the service
   */
  async healthCheck(): Promise<{ status: string; model: string }> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        max_tokens: 10,
        messages: [{ role: "user", content: "test" }],
      });

      return {
        status: response.choices[0] ? "healthy" : "unhealthy",
        model: this.model,
      };
    } catch (error) {
      return {
        status: "unhealthy",
        model: this.model,
      };
    }
  }
}

// Lazy initialization to avoid module load order issues with dotenv
let _instance: TaskDecompositionService | null = null;

function getInstance(): TaskDecompositionService {
  if (!_instance) {
    _instance = new TaskDecompositionService();
  }
  return _instance;
}

// Export proxy that lazily initializes on first access
export const taskDecompositionService = new Proxy({} as TaskDecompositionService, {
  get(target, prop) {
    const instance = getInstance();
    return instance[prop as keyof TaskDecompositionService];
  },
});
