import Anthropic from "@anthropic-ai/sdk";
import type { Task, Epic, Project } from "@/types";

/**
 * Subtask suggestion from AI decomposition
 */
export interface SubtaskSuggestion {
  title: string;
  description: string;
  estimatedHours: number;
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
}

/**
 * AI-powered Task Decomposition Service
 *
 * Uses Claude API to intelligently break down high-level tasks
 * into manageable subtasks with time estimates and dependencies.
 */
class TaskDecompositionService {
  private client: Anthropic;
  private model: string;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY environment variable is not set");
    }

    this.client = new Anthropic({
      apiKey,
      timeout: 30000, // 30 second timeout
    });

    this.model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";
  }

  /**
   * Decompose a task into subtasks using Claude API
   */
  async decompose(request: DecompositionRequest): Promise<DecompositionResponse> {
    const startTime = Date.now();

    try {
      const prompt = this.buildDecompositionPrompt(request);

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      });

      const decompositionTime = (Date.now() - startTime) / 1000;

      // Parse Claude's response
      const content = this.extractTextContent(response.content);
      const subtasks = this.parseSubtasks(content);

      return {
        subtasks,
        decompositionTime,
        modelUsed: this.model,
      };
    } catch (error) {
      if (error instanceof Error) {
        // Handle specific Anthropic API errors
        if (error.message.includes("rate")) {
          throw new Error("Anthropic API rate limit exceeded. Please try again later.");
        }
        if (error.message.includes("auth")) {
          throw new Error("Anthropic API authentication failed. Check your API key.");
        }
      }
      throw new Error(
        `Failed to decompose task: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Build the prompt for Claude API
   */
  private buildDecompositionPrompt(request: DecompositionRequest): string {
    const { task, epic, project } = request;

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

    return `You are a senior project manager and technical lead. Your task is to break down the following task into 3-8 actionable subtasks.

${context}**Task to Decompose:**
Title: ${task.title}
${task.description ? `Description: ${task.description}` : ""}

**Requirements:**
1. Break down the task into logical, sequential subtasks
2. Each subtask should be specific and actionable
3. Estimate hours for each subtask (be realistic)
4. Assign priority (HIGH, MEDIUM, LOW) based on importance
5. Specify the suggested order (1 = first, 2 = second, etc.)
6. Identify dependencies by referencing the suggestedOrder of prerequisite tasks

**Output Format:**
Return ONLY a valid JSON object (no markdown, no explanation). Use this exact structure:

\`\`\`json
{
  "subtasks": [
    {
      "title": "Clear, specific task title",
      "description": "Detailed description of what needs to be done",
      "estimatedHours": 4,
      "priority": "HIGH",
      "suggestedOrder": 1,
      "dependencies": []
    },
    {
      "title": "Second task title",
      "description": "Description of the second task",
      "estimatedHours": 3,
      "priority": "MEDIUM",
      "suggestedOrder": 2,
      "dependencies": [1]
    }
  ]
}
\`\`\`

**Guidelines:**
- Total estimated hours should be realistic for the task complexity
- Earlier tasks should typically be completed first
- Dependencies: use an array of suggestedOrder numbers (e.g., [1] means this task depends on task with suggestedOrder=1)
- High priority for critical path items or blockers
- Each subtask should be completable in 1-8 hours

Now generate the JSON response:`;
  }

  /**
   * Extract text content from Claude response
   */
  private extractTextContent(content: Anthropic.Message["content"]): string {
    const textBlock = content.find(block => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("No text content in Claude response");
    }
    return textBlock.text;
  }

  /**
   * Parse subtasks from Claude's response
   */
  private parseSubtasks(content: string): SubtaskSuggestion[] {
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        content = jsonMatch[1];
      }

      const parsed = JSON.parse(content.trim());

      if (!parsed.subtasks || !Array.isArray(parsed.subtasks)) {
        throw new Error("Invalid response format: missing subtasks array");
      }

      // Validate subtask structure
      const subtasks: SubtaskSuggestion[] = parsed.subtasks.map((st: any, index: number) => ({
        title: st.title || `Subtask ${index + 1}`,
        description: st.description || "",
        estimatedHours: Number(st.estimatedHours) || 2,
        priority: this.validatePriority(st.priority),
        suggestedOrder: Number(st.suggestedOrder) || index + 1,
        dependencies: Array.isArray(st.dependencies) ? st.dependencies : [],
      }));

      // Sort by suggestedOrder
      return subtasks.sort((a, b) => a.suggestedOrder - b.suggestedOrder);
    } catch (error) {
      throw new Error(
        `Failed to parse Claude response: ${error instanceof Error ? error.message : "Invalid JSON"}`
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
   * Health check for the service
   */
  async healthCheck(): Promise<{ status: string; model: string }> {
    try {
      // Simple test call
      await this.client.messages.create({
        model: this.model,
        max_tokens: 10,
        messages: [{ role: "user", content: "test" }],
      });

      return {
        status: "healthy",
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
