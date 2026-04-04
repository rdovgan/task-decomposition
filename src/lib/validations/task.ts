import { z } from "zod";

export const taskFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().max(5000, "Description must be less than 5000 characters").optional(),
  epicId: z.string().min(1, "Epic is required"),
  assigneeId: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  storyPoints: z.number().int().min(0).max(13).optional().nullable(),
  estimatedHours: z.number().min(0).max(1000).optional().nullable(),
  actualHours: z.number().min(0).max(1000).optional().nullable(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE", "BLOCKED", "CANCELLED"]).optional(),
});

export type TaskFormData = z.infer<typeof taskFormSchema>;

export const createTaskSchema = taskFormSchema.pick({
  title: true,
  description: true,
  epicId: true,
  assigneeId: true,
  priority: true,
  storyPoints: true,
  estimatedHours: true,
  startDate: true,
  dueDate: true,
});

export const updateTaskSchema = taskFormSchema.partial().extend({
  title: taskFormSchema.shape.title.optional(),
  epicId: taskFormSchema.shape.epicId.optional(),
});

export type CreateTaskFormData = z.infer<typeof createTaskSchema>;
export type UpdateTaskFormData = z.infer<typeof updateTaskSchema>;
