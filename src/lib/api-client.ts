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
  ApiError as ApiErrorType
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiError extends Error {
  constructor(public message: string, public status: number, public errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');

  if (!response.ok) {
    let errorData: ApiErrorType = { message: 'An error occurred' };

    if (contentType?.includes('application/json')) {
      errorData = await response.json();
    }

    throw new ApiError(
      errorData.message || `HTTP ${response.status}`,
      response.status,
      errorData.errors
    );
  }

  if (contentType?.includes('application/json')) {
    return response.json();
  }

  return undefined as T;
}

const api = {
  async get<T>(url: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse<T>(response);
  },

  async post<T>(url: string, data: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
  },

  async patch<T>(url: string, data: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
  },

  async delete<T>(url: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse<T>(response);
  },

  async put<T>(url: string, data: unknown): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse<T>(response);
  },
};

// Projects API
export const projectsApi = {
  list: (params?: { page?: number; limit?: number; status?: string; ownerId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);
    if (params?.ownerId) searchParams.set('ownerId', params.ownerId);

    const query = searchParams.toString();
    return api.get<PaginatedResponse<Project>>(`/api/projects${query ? `?${query}` : ''}`);
  },

  get: (id: string) => api.get<Project>(`/api/projects/${id}`),

  create: (data: CreateProjectRequest) => api.post<Project>('/api/projects', data),

  update: (id: string, data: UpdateProjectRequest) => api.patch<Project>(`/api/projects/${id}`, data),

  delete: (id: string) => api.delete<void>(`/api/projects/${id}`),
};

// Epics API
export const epicsApi = {
  list: (params?: { page?: number; limit?: number; status?: string; priority?: string; projectId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);
    if (params?.priority) searchParams.set('priority', params.priority);
    if (params?.projectId) searchParams.set('projectId', params.projectId);

    const query = searchParams.toString();
    return api.get<PaginatedResponse<Epic>>(`/api/epics${query ? `?${query}` : ''}`);
  },

  get: (id: string) => api.get<Epic>(`/api/epics/${id}`),

  create: (data: CreateEpicRequest) => api.post<Epic>('/api/epics', data),

  update: (id: string, data: UpdateEpicRequest) => api.patch<Epic>(`/api/epics/${id}`, data),

  delete: (id: string) => api.delete<void>(`/api/epics/${id}`),
};

// Tasks API
export const tasksApi = {
  list: (params?: { page?: number; limit?: number; status?: string; epicId?: string; assigneeId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);
    if (params?.epicId) searchParams.set('epicId', params.epicId);
    if (params?.assigneeId) searchParams.set('assigneeId', params.assigneeId);

    const query = searchParams.toString();
    return api.get<PaginatedResponse<Task>>(`/api/tasks${query ? `?${query}` : ''}`);
  },

  get: (id: string) => api.get<Task>(`/api/tasks/${id}`),

  create: (data: CreateTaskRequest) => api.post<Task>('/api/tasks', data),

  update: (id: string, data: UpdateTaskRequest) => api.patch<Task>(`/api/tasks/${id}`, data),

  delete: (id: string) => api.delete<void>(`/api/tasks/${id}`),
};

// Dependencies API
export const dependenciesApi = {
  list: (taskId: string) => api.get<Dependency[]>(`/api/tasks/${taskId}/dependencies`),

  create: (taskId: string, data: { dependsOnTaskId: string; type: string }) =>
    api.post<Dependency>(`/api/tasks/${taskId}/dependencies`, data),

  delete: (taskId: string, dependencyId: string) =>
    api.delete<void>(`/api/tasks/${taskId}/dependencies/${dependencyId}`),
};

// Task Links API
export const taskLinksApi = {
  list: (taskId: string) => api.get<TaskLink[]>(`/api/tasks/${taskId}/links`),

  create: (taskId: string, data: { url: string; linkType: string; title?: string }) =>
    api.post<TaskLink>(`/api/tasks/${taskId}/links`, data),

  delete: (taskId: string, linkId: string) =>
    api.delete<void>(`/api/tasks/${taskId}/links/${linkId}`),
};

// Comments API
export const commentsApi = {
  list: (taskId: string) => api.get<Comment[]>(`/api/tasks/${taskId}/comments`),

  create: (taskId: string, data: { content: string }) =>
    api.post<Comment>(`/api/tasks/${taskId}/comments`, data),

  update: (taskId: string, commentId: string, data: { content: string }) =>
    api.patch<Comment>(`/api/tasks/${taskId}/comments/${commentId}`, data),

  delete: (taskId: string, commentId: string) =>
    api.delete<void>(`/api/tasks/${taskId}/comments/${commentId}`),
};

// AI Decomposition API
export const aiDecompositionApi = {
  decomposeEpic: (epicId: string, data: { userId?: string; customPrompt?: string }) =>
    api.post<{
      data: Array<{
        title: string;
        description: string;
        storyPoints: number;
        priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
      }>;
      meta: {
        decompositionTime: number;
        modelUsed: string;
        epicId: string;
        epicTitle: string;
      };
    }>(`/api/epics/${epicId}/ai-decompose`, data),
};

// Users API
export const usersApi = {
  list: () => api.get<{ data: User[] }>(`/api/users`),

  get: (id: string) => api.get<{ data: User }>(`/api/users/${id}`),
};

// User Settings API
export const userSettingsApi = {
  get: (userId: string) =>
    api.get<{
      data: {
        id: string | null;
        userId: string;
        hasApiKey: boolean;
        createdAt?: string;
        updatedAt?: string;
      };
    }>(`/api/user-settings/${userId}`),

  update: (userId: string, data: { anthropicApiKey: string }) =>
    api.put<{
      data: {
        id: string;
        userId: string;
        hasApiKey: true;
        updatedAt: string;
      };
    }>(`/api/user-settings/${userId}`, data),

  deleteApiKey: (userId: string) =>
    api.delete<void>(`/api/user-settings/${userId}/api-key`),

  validateApiKey: (apiKey: string) =>
    api.post<{
      data: {
        valid: boolean;
        message: string;
      };
    }>(`/api/user-settings/validate-api-key`, { apiKey }),
};

export { ApiError as ApiErrorClass };
