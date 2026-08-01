import { z } from "zod";

// User schemas
export const createUserSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  role: z.enum(["ADMIN", "PROJECT_MANAGER", "DEVELOPER", "DESIGNER", "QA"]).optional(),
});

export const updateUserSchema = createUserSchema.partial();

// Project schemas
export const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(200, "Project name too long"),
  description: z.string().max(1000, "Description too long").optional(),
  ownerId: z.string().min(1, "Owner ID is required"),
});

export const updateProjectSchema = createProjectSchema.partial();

// Date transform: accepts "YYYY-MM-DD" or ISO datetime, normalizes to ISO string for Prisma
const dateToISO = z.preprocess(
  (val) => {
    if (val === undefined || val === null || val === "") return undefined;
    if (typeof val === "string") {
      const parsed = Date.parse(val);
      if (!isNaN(parsed)) return new Date(parsed).toISOString();
    }
    return val;
  },
  z.string().datetime("Invalid date format")
);

// Epic schemas
export const createEpicSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  title: z.string().min(1, "Epic title is required").max(200, "Epic title too long"),
  description: z.string().max(2000, "Description too long").optional(),
  status: z.enum(["BACKLOG", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"]).optional(),
  priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).optional(),
  startDate: dateToISO.optional(),
  dueDate: dateToISO.optional(),
});

export const updateEpicSchema = createEpicSchema.partial();

// Task schemas
export const createTaskSchema = z.object({
  epicId: z.string().min(1, "Epic ID is required"),
  title: z.string().min(1, "Task title is required").max(200, "Task title too long"),
  description: z.string().max(2000, "Description too long").optional(),
  assigneeId: z.string().min(1, "Invalid assignee ID").optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "BLOCKED", "CANCELLED"]).optional(),
  priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).optional(),
  storyPoints: z.number().int().min(0).max(100).optional(),
  estimatedHours: z.number().min(0).optional(),
  actualHours: z.number().min(0).optional(),
  startDate: dateToISO.optional(),
  dueDate: dateToISO.optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

// Dependency schemas
export const createDependencySchema = z.object({
  dependsOnTaskId: z.string().min(1, "Dependency task ID is required"),
  type: z.enum(["BLOCKS", "RELATED_TO", "DUPLICATES"]).optional(),
});

// TaskLink schemas
export const createTaskLinkSchema = z.object({
  url: z.string().url("Invalid URL"),
  linkType: z.enum(["CONFLUENCE", "NOTION", "GITHUB", "JIRA", "FIGMA", "EXTERNAL"]),
  title: z.string().max(200, "Title too long").optional(),
});

export const updateTaskLinkSchema = createTaskLinkSchema.partial();

// Comment schemas
export const createCommentSchema = z.object({
  content: z.string().min(1, "Comment content is required").max(2000, "Comment too long"),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1, "Comment content is required").max(2000, "Comment too long"),
});

// Auth schemas
export const signupSchema = z.object({
  email: z.string().email("Invalid email format"),
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

// Jira integration schemas
export const jiraConnectionSchema = z.object({
  siteUrl: z.string().url("Invalid Jira site URL"),
  email: z.string().email("Invalid email format"),
  apiToken: z.string().min(1, "API token is required"),
});

export const createJiraIssuesSchema = z.object({
  projectKey: z.string().min(1, "Project key is required"),
  issueTypeName: z.string().min(1, "Issue type is required"),
  epicTitle: z.string().min(1, "Epic title is required").max(200, "Epic title too long"),
  epicDescription: z.string().max(2000, "Epic description too long").optional(),
  tasks: z
    .array(
      z.object({
        taskId: z.string().optional(),
        title: z.string().min(1, "Task title is required"),
        description: z.string().optional(),
        storyPoints: z.number().optional(),
        priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).optional(),
      })
    )
    .min(1, "At least one task is required"),
});

// Query parameter schemas
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform(val => {
      const page = val ? parseInt(val) : 1;
      if (page < 1) throw new Error("Page number must be positive");
      return page;
    }),
  limit: z
    .string()
    .optional()
    .transform(val => {
      const limit = val ? parseInt(val) : 10;
      if (limit < 1) throw new Error("Limit must be positive");
      if (limit > 100) throw new Error("Limit cannot exceed 100");
      return limit;
    }),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export const projectFilterSchema = paginationSchema.extend({
  status: z.enum(["ACTIVE", "ARCHIVED", "ON_HOLD"]).optional(),
  ownerId: z.string().optional(),
});

export const epicFilterSchema = paginationSchema.extend({
  projectId: z.string().optional(),
  status: z.enum(["BACKLOG", "IN_PROGRESS", "IN_REVIEW", "DONE", "CANCELLED"]).optional(),
  priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).optional(),
});

export const taskFilterSchema = paginationSchema.extend({
  epicId: z.string().optional(),
  assigneeId: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "BLOCKED", "CANCELLED"]).optional(),
  priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).optional(),
  search: z.string().optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "title", "priority", "status", "dueDate"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type CreateEpicInput = z.infer<typeof createEpicSchema>;
export type UpdateEpicInput = z.infer<typeof updateEpicSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CreateDependencyInput = z.infer<typeof createDependencySchema>;
export type CreateTaskLinkInput = z.infer<typeof createTaskLinkSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type JiraConnectionInput = z.infer<typeof jiraConnectionSchema>;
export type CreateJiraIssuesInput = z.infer<typeof createJiraIssuesSchema>;
