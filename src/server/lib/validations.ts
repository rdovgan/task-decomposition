import { z } from 'zod';

// User schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  role: z.enum(['ADMIN', 'PROJECT_MANAGER', 'DEVELOPER', 'DESIGNER', 'QA']).optional(),
});

export const updateUserSchema = createUserSchema.partial();

// Project schemas
export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(200, 'Project name too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  ownerId: z.string().cuid('Invalid owner ID'),
});

export const updateProjectSchema = createProjectSchema.partial();

// Epic schemas
export const createEpicSchema = z.object({
  projectId: z.string().cuid('Invalid project ID'),
  title: z.string().min(1, 'Epic title is required').max(200, 'Epic title too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  status: z.enum(['BACKLOG', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED']).optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  startDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
});

export const updateEpicSchema = createEpicSchema.partial();

// Task schemas
export const createTaskSchema = z.object({
  epicId: z.string().cuid('Invalid epic ID'),
  title: z.string().min(1, 'Task title is required').max(200, 'Task title too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  assigneeId: z.string().cuid('Invalid assignee ID').optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED', 'CANCELLED']).optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  storyPoints: z.number().int().min(0).max(100).optional(),
  estimatedHours: z.number().min(0).optional(),
  actualHours: z.number().min(0).optional(),
  startDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
});

export const updateTaskSchema = createTaskSchema.partial();

// Dependency schemas
export const createDependencySchema = z.object({
  taskId: z.string().cuid('Invalid task ID'),
  dependsOnTaskId: z.string().cuid('Invalid dependency task ID'),
  type: z.enum(['BLOCKS', 'RELATED_TO', 'DUPLICATES']).optional(),
});

// TaskLink schemas
export const createTaskLinkSchema = z.object({
  taskId: z.string().cuid('Invalid task ID'),
  url: z.string().url('Invalid URL'),
  linkType: z.enum(['CONFLUENCE', 'NOTION', 'GITHUB', 'JIRA', 'FIGMA', 'EXTERNAL']),
  title: z.string().max(200, 'Title too long').optional(),
});

export const updateTaskLinkSchema = createTaskLinkSchema.partial();

// Comment schemas
export const createCommentSchema = z.object({
  taskId: z.string().cuid('Invalid task ID'),
  authorId: z.string().cuid('Invalid author ID'),
  content: z.string().min(1, 'Comment content is required').max(2000, 'Comment too long'),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(2000, 'Comment too long'),
});

// Query parameter schemas
export const paginationSchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val) : 10)),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional(),
});

export const projectFilterSchema = paginationSchema.extend({
  status: z.enum(['ACTIVE', 'ARCHIVED', 'ON_HOLD']).optional(),
  ownerId: z.string().cuid().optional(),
});

export const epicFilterSchema = paginationSchema.extend({
  projectId: z.string().cuid().optional(),
  status: z.enum(['BACKLOG', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'CANCELLED']).optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
});

export const taskFilterSchema = paginationSchema.extend({
  epicId: z.string().cuid().optional(),
  assigneeId: z.string().cuid().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED', 'CANCELLED']).optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'priority', 'status', 'dueDate']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
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
