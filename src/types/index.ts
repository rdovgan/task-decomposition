// Domain types matching the Prisma schema

export type UserRole = "ADMIN" | "PROJECT_MANAGER" | "DEVELOPER" | "DESIGNER" | "QA";

export type ProjectStatus = "ACTIVE" | "ARCHIVED" | "ON_HOLD";

export type EpicStatus = "BACKLOG" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "CANCELLED";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE" | "BLOCKED" | "CANCELLED";

export type Priority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type DependencyType = "BLOCKS" | "RELATED_TO" | "DUPLICATES";

export type LinkType = "CONFLUENCE" | "NOTION" | "GITHUB" | "JIRA" | "FIGMA" | "EXTERNAL";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  owner?: User;
  _count?: {
    epics: number;
  };
}

export interface Epic {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: EpicStatus;
  priority: Priority;
  startDate: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  project?: Project;
  _count?: {
    tasks: number;
  };
}

export interface Task {
  id: string;
  epicId: string;
  title: string;
  description: string | null;
  assigneeId: string | null;
  status: TaskStatus;
  priority: Priority;
  storyPoints: number | null;
  estimatedHours: number | null;
  actualHours: number | null;
  startDate: string | null;
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  epic?: Epic;
  assignee?: User;
}

export interface Dependency {
  id: string;
  taskId: string;
  dependsOnTaskId: string;
  type: DependencyType;
  createdAt: string;
}

export interface TaskLink {
  id: string;
  taskId: string;
  url: string;
  linkType: LinkType;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author?: User;
}

// API Request/Response types

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  ownerId: string;
  status?: ProjectStatus;
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  status?: ProjectStatus;
}

export interface CreateEpicRequest {
  projectId: string;
  title: string;
  description?: string;
  priority?: Priority;
  startDate?: string;
  dueDate?: string;
}

export interface UpdateEpicRequest {
  title?: string;
  description?: string;
  status?: EpicStatus;
  priority?: Priority;
  startDate?: string;
  dueDate?: string;
}

export interface CreateTaskRequest {
  epicId: string;
  title: string;
  description?: string;
  assigneeId?: string;
  priority?: Priority;
  storyPoints?: number;
  estimatedHours?: number;
  startDate?: string;
  dueDate?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  assigneeId?: string;
  status?: TaskStatus;
  priority?: Priority;
  storyPoints?: number;
  estimatedHours?: number;
  actualHours?: number;
  startDate?: string;
  dueDate?: string;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

// Task Decomposition Types

export interface SubtaskSuggestion {
  title: string;
  description: string;
  estimatedHours: number;
  priority: "HIGH" | "MEDIUM" | "LOW";
  suggestedOrder: number;
  dependencies?: number[];
}

export interface DecompositionResponse {
  subtasks: SubtaskSuggestion[];
  decompositionTime: number;
  modelUsed: string;
}

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

export interface DecompositionResult {
  data: Task[];
  meta: {
    decompositionTime: number;
    modelUsed: string;
    parentTaskId: string;
  };
}

// AI Task Suggestion from decomposition
export interface AITaskSuggestion {
  title: string;
  description: string;
  storyPoints: number;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
}

// AI Decomposition Response
export interface AIDecompositionResponse {
  data: AITaskSuggestion[];
  meta: {
    decompositionTime: number;
    modelUsed: string;
    epicId: string;
    epicTitle: string;
  };
}
