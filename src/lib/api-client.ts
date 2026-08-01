import {
  Project,
  Epic,
  Task,
  Dependency,
  TaskLink,
  Comment,
  User,
  PaginatedResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateEpicRequest,
  UpdateEpicRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  ApiError as ApiErrorType,
  TeamConfig,
  TeamMember,
  DecomposeTask,
  JiraConnectionStatus,
  JiraProject,
  JiraIssueType,
  JiraCreateIssueItem,
  JiraCreateIssuesResponse,
  AuthUser,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");

  if (!response.ok) {
    let errorData: ApiErrorType = { message: "An error occurred" };

    if (contentType?.includes("application/json")) {
      errorData = await response.json();
    }

    throw new ApiError(
      errorData.message || `HTTP ${response.status}`,
      response.status,
      errorData.errors
    );
  }

  if (contentType?.includes("application/json")) {
    return response.json();
  }

  return undefined as T;
}

const api = {
  async get<T>(url: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return handleResponse<T>(response);
  },

  async post<T>(url: string, data: unknown, timeoutMs?: number): Promise<T> {
    const controller = new AbortController();
    const timer = timeoutMs ? setTimeout(() => controller.abort(), timeoutMs) : undefined;
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        signal: controller.signal,
        credentials: "include",
      });
      return handleResponse<T>(response);
    } finally {
      if (timer) clearTimeout(timer);
    }
  },

  async patch<T>(url: string, data: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });
    return handleResponse<T>(response);
  },

  async delete<T>(url: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    return handleResponse<T>(response);
  },

  async put<T>(url: string, data: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });
    return handleResponse<T>(response);
  },
};

// Projects API
export const projectsApi = {
  list: async (params?: { page?: number; limit?: number; status?: string; ownerId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.status) searchParams.set("status", params.status);
    if (params?.ownerId) searchParams.set("ownerId", params.ownerId);

    const query = searchParams.toString();
    const res = await api.get<PaginatedResponse<Project>>(`/api/projects${query ? `?${query}` : ""}`);
    return res;
  },

  get: async (id: string) => {
    const res = await api.get<{ data: Project }>(`/api/projects/${id}`);
    return res.data;
  },

  create: async (data: CreateProjectRequest) => {
    const res = await api.post<{ data: Project }>("/api/projects", data);
    return res.data;
  },

  update: async (id: string, data: UpdateProjectRequest) => {
    const res = await api.patch<{ data: Project }>(`/api/projects/${id}`, data);
    return res.data;
  },

  delete: (id: string) => api.delete<void>(`/api/projects/${id}`),
};

// Epics API
export const epicsApi = {
  list: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    projectId?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.status) searchParams.set("status", params.status);
    if (params?.priority) searchParams.set("priority", params.priority);
    if (params?.projectId) searchParams.set("projectId", params.projectId);

    const query = searchParams.toString();
    const res = await api.get<PaginatedResponse<Epic>>(`/api/epics${query ? `?${query}` : ""}`);
    return res;
  },

  get: async (id: string) => {
    const res = await api.get<{ data: Epic }>(`/api/epics/${id}`);
    return res.data;
  },

  create: async (data: CreateEpicRequest) => {
    const res = await api.post<{ data: Epic }>("/api/epics", data);
    return res.data;
  },

  update: async (id: string, data: UpdateEpicRequest) => {
    const res = await api.patch<{ data: Epic }>(`/api/epics/${id}`, data);
    return res.data;
  },

  delete: (id: string) => api.delete<void>(`/api/epics/${id}`),
};

// Tasks API
export const tasksApi = {
  list: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    epicId?: string;
    assigneeId?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set("page", params.page.toString());
    if (params?.limit) searchParams.set("limit", params.limit.toString());
    if (params?.status) searchParams.set("status", params.status);
    if (params?.epicId) searchParams.set("epicId", params.epicId);
    if (params?.assigneeId) searchParams.set("assigneeId", params.assigneeId);

    const query = searchParams.toString();
    const res = await api.get<PaginatedResponse<Task>>(`/api/tasks${query ? `?${query}` : ""}`);
    return res;
  },

  get: async (id: string) => {
    const res = await api.get<{ data: Task }>(`/api/tasks/${id}`);
    return res.data;
  },

  create: async (data: CreateTaskRequest) => {
    const res = await api.post<{ data: Task }>("/api/tasks", data);
    return res.data;
  },

  update: async (id: string, data: UpdateTaskRequest) => {
    const res = await api.patch<{ data: Task }>(`/api/tasks/${id}`, data);
    return res.data;
  },

  delete: (id: string) => api.delete<void>(`/api/tasks/${id}`),
};

// Dependencies API
export const dependenciesApi = {
  list: async (taskId: string) => {
    const res = await api.get<{ data: Dependency[] }>(`/api/tasks/${taskId}/dependencies`);
    return res.data;
  },

  create: async (taskId: string, data: { dependsOnTaskId: string; type: string }) => {
    const res = await api.post<{ data: Dependency }>(`/api/tasks/${taskId}/dependencies`, data);
    return res.data;
  },

  delete: (taskId: string, dependencyId: string) =>
    api.delete<void>(`/api/tasks/${taskId}/dependencies/${dependencyId}`),
};

// Task Links API
export const taskLinksApi = {
  list: async (taskId: string) => {
    const res = await api.get<{ data: TaskLink[] }>(`/api/tasks/${taskId}/links`);
    return res.data;
  },

  create: async (taskId: string, data: { url: string; linkType: string; title?: string }) => {
    const res = await api.post<{ data: TaskLink }>(`/api/tasks/${taskId}/links`, data);
    return res.data;
  },

  delete: (taskId: string, linkId: string) =>
    api.delete<void>(`/api/tasks/${taskId}/links/${linkId}`),
};

// Comments API
export const commentsApi = {
  list: async (taskId: string) => {
    const res = await api.get<{ data: Comment[] }>(`/api/tasks/${taskId}/comments`);
    return res.data;
  },

  create: async (taskId: string, data: { content: string }) => {
    const res = await api.post<{ data: Comment }>(`/api/tasks/${taskId}/comments`, data);
    return res.data;
  },

  update: async (taskId: string, commentId: string, data: { content: string }) => {
    const res = await api.patch<{ data: Comment }>(`/api/tasks/${taskId}/comments/${commentId}`, data);
    return res.data;
  },

  delete: (taskId: string, commentId: string) =>
    api.delete<void>(`/api/tasks/${taskId}/comments/${commentId}`),
};

// AI Decomposition API
export const aiDecompositionApi = {
  decomposeEpic: async (
    epicId: string,
    data: { userId?: string; customPrompt?: string; teamConfigId?: string }
  ) => {
    const res = await api.post<{
      data: Array<{
        title: string;
        description: string;
        storyPoints: number;
        priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
      }>;
      meta: {
        decompositionTime: number;
        modelUsed: string;
        epicId: string;
        epicTitle: string;
      };
    }>(`/api/epics/${epicId}/ai-decompose`, data, 300000);
    return res;
  },

  updateTask: async (
    taskId: string,
    data: { userId?: string; instruction?: string }
  ) => {
    const res = await api.post<{
      data: {
        title: string;
        description: string;
        priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
        storyPoints: number;
      };
      meta: {
        decompositionTime: number;
        modelUsed: string;
        taskId: string;
      };
    }>(`/api/tasks/${taskId}/ai-update`, data, 300000);
    return res;
  },
};

// Users API
export const usersApi = {
  list: async () => {
    const res = await api.get<{ data: User[] }>(`/api/users`);
    return res.data;
  },

  get: async (id: string) => {
    const res = await api.get<{ data: User }>(`/api/users/${id}`);
    return res.data;
  },
};

// User Settings API
export const userSettingsApi = {
  get: async () => {
    const res = await api.get<{
      data: {
        id: string | null;
        userId: string;
        hasApiKey: boolean;
        createdAt?: string;
        updatedAt?: string;
      };
    }>(`/api/user-settings`);
    return res.data;
  },

  update: async (data: { anthropicApiKey: string }) => {
    const res = await api.put<{
      data: {
        id: string;
        userId: string;
        hasApiKey: true;
        updatedAt: string;
      };
    }>(`/api/user-settings`, data);
    return res.data;
  },

  deleteApiKey: () => api.delete<void>(`/api/user-settings/api-key`),

  validateApiKey: async (apiKey: string) => {
    const res = await api.post<{
      data: {
        valid: boolean;
        message: string;
      };
    }>(`/api/user-settings/validate-api-key`, { apiKey });
    return res.data;
  },
};

// Jira API
export const jiraApi = {
  get: async () => {
    const res = await api.get<{ data: JiraConnectionStatus }>(`/api/jira`);
    return res.data;
  },

  update: async (data: { siteUrl: string; email: string; apiToken: string }) => {
    const res = await api.put<{ data: JiraConnectionStatus }>(`/api/jira`, data);
    return res.data;
  },

  deleteConnection: () => api.delete<void>(`/api/jira`),

  listProjects: async () => {
    const res = await api.get<{ data: JiraProject[] }>(`/api/jira/projects`);
    return res.data;
  },

  listIssueTypes: async (projectKey: string) => {
    const res = await api.get<{ data: JiraIssueType[] }>(`/api/jira/projects/${projectKey}/issue-types`);
    return res.data;
  },

  createIssues: async (data: {
    projectKey: string;
    issueTypeName: string;
    epicTitle: string;
    epicDescription?: string;
    tasks: JiraCreateIssueItem[];
  }) => {
    const res = await api.post<{ data: JiraCreateIssuesResponse }>(`/api/jira/issues`, data);
    return res.data;
  },
};

// Auth API
export const authApi = {
  signup: async (data: { email: string; name: string; password: string }) => {
    const res = await api.post<{ data: AuthUser }>(`/api/auth/signup`, data);
    return res.data;
  },

  login: async (data: { email: string; password: string }) => {
    const res = await api.post<{ data: AuthUser }>(`/api/auth/login`, data);
    return res.data;
  },

  logout: () => api.post<void>(`/api/auth/logout`, {}),

  me: async () => {
    const res = await api.get<{ data: AuthUser }>(`/api/auth/me`);
    return res.data;
  },
};

// Decompose API
export const decomposeApi = {
  quick: async (file: File, data: { projectName?: string; teamConfigId?: string; customTeam?: string }) => {
    const formData = new FormData();
    formData.append("pdf", file);
    if (data.projectName) formData.append("projectName", data.projectName);
    if (data.teamConfigId) formData.append("teamConfigId", data.teamConfigId);
    if (data.customTeam) formData.append("customTeam", data.customTeam);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 300000);
    try {
      const response = await fetch(`${API_BASE_URL}/api/decompose/quick`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });
      return handleResponse<any>(response);
    } finally {
      clearTimeout(timer);
    }
  },

  text: async (data: { text: string; projectName?: string; teamConfigId?: string; customTeam?: string }) => {
    return api.post<any>("/api/decompose/text", data, 300000);
  },

  save: async (data: { projectId?: string; projectName: string; tasks: DecomposeTask[] }) => {
    const res = await api.post<{
      data: {
        project: { id: string; name: string };
        epic: { id: string; title: string };
      };
    }>("/api/decompose/save", data);
    return res.data;
  },
};

// Team Config API
export const teamConfigApi = {
  list: async () => {
    const res = await api.get<{ data: TeamConfig[] }>("/api/decompose/team-configs");
    return res.data;
  },

  get: async (id: string) => {
    const res = await api.get<{ data: TeamConfig }>(`/api/decompose/team-configs/${id}`);
    return res.data;
  },

  create: async (data: { name: string; description?: string; members: TeamMember[]; isDefault?: boolean }) => {
    const res = await api.post<{ data: TeamConfig }>("/api/decompose/team-configs", data);
    return res.data;
  },

  update: async (id: string, data: { name?: string; description?: string; members?: TeamMember[]; isDefault?: boolean }) => {
    const res = await api.patch<{ data: TeamConfig }>(`/api/decompose/team-configs/${id}`, data);
    return res.data;
  },

  delete: (id: string) => api.delete<void>(`/api/decompose/team-configs/${id}`),
};

export { ApiError as ApiErrorClass };
