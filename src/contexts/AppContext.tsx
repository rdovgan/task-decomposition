'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  Project,
  Epic,
  Task,
  Comment,
  TaskLink,
  Dependency,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateEpicRequest,
  UpdateEpicRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  ProjectStatus,
  EpicStatus,
  TaskStatus,
  Priority
} from '@/types';
import { projectsApi, epicsApi, tasksApi, commentsApi, taskLinksApi, dependenciesApi, ApiErrorClass } from '@/lib/api-client';

interface AppContextType {
  // Projects
  projects: Project[];
  projectsLoading: boolean;
  projectsError: string | null;
  fetchProjects: (filters?: { status?: ProjectStatus; ownerId?: string }) => Promise<void>;
  createProject: (data: CreateProjectRequest) => Promise<Project>;
  updateProject: (id: string, data: UpdateProjectRequest) => Promise<Project>;
  deleteProject: (id: string) => Promise<void>;

  // Epics
  epics: Epic[];
  epicsLoading: boolean;
  epicsError: string | null;
  fetchEpics: (filters?: { status?: EpicStatus; priority?: Priority; projectId?: string }) => Promise<void>;
  createEpic: (data: CreateEpicRequest) => Promise<Epic>;
  updateEpic: (id: string, data: UpdateEpicRequest) => Promise<Epic>;
  deleteEpic: (id: string) => Promise<void>;

  // Tasks
  tasks: Task[];
  tasksLoading: boolean;
  tasksError: string | null;
  fetchTasks: (filters?: { status?: TaskStatus; epicId?: string; assigneeId?: string }) => Promise<void>;
  createTask: (data: CreateTaskRequest) => Promise<Task>;
  updateTask: (id: string, data: UpdateTaskRequest) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;

  // Comments
  fetchComments: (taskId: string) => Promise<Comment[]>;
  createComment: (taskId: string, data: { content: string }) => Promise<Comment>;
  updateComment: (taskId: string, commentId: string, data: { content: string }) => Promise<Comment>;
  deleteComment: (taskId: string, commentId: string) => Promise<void>;

  // Task Links
  fetchTaskLinks: (taskId: string) => Promise<TaskLink[]>;
  createTaskLink: (taskId: string, data: { url: string; linkType: string; title?: string }) => Promise<TaskLink>;
  deleteTaskLink: (taskId: string, linkId: string) => Promise<void>;

  // Dependencies
  fetchDependencies: (taskId: string) => Promise<Dependency[]>;
  createDependency: (taskId: string, data: { dependsOnTaskId: string; type: string }) => Promise<Dependency>;
  deleteDependency: (taskId: string, dependencyId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  const [epics, setEpics] = useState<Epic[]>([]);
  const [epicsLoading, setEpicsLoading] = useState(false);
  const [epicsError, setEpicsError] = useState<string | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState<string | null>(null);

  // Projects
  const fetchProjects = useCallback(async (filters?: { status?: ProjectStatus; ownerId?: string }) => {
    setProjectsLoading(true);
    setProjectsError(null);
    try {
      const response = await projectsApi.list({ limit: 100, ...filters });
      setProjects(response.data);
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        setProjectsError(error.message);
      } else {
        setProjectsError('Failed to fetch projects');
      }
    } finally {
      setProjectsLoading(false);
    }
  }, []);

  const createProject = useCallback(async (data: CreateProjectRequest) => {
    const project = await projectsApi.create(data);
    setProjects((prev) => [...prev, project]);
    return project;
  }, []);

  const updateProject = useCallback(async (id: string, data: UpdateProjectRequest) => {
    const project = await projectsApi.update(id, data);
    setProjects((prev) => prev.map((p) => (p.id === id ? project : p)));
    return project;
  }, []);

  const deleteProject = useCallback(async (id: string) => {
    await projectsApi.delete(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // Epics
  const fetchEpics = useCallback(async (filters?: { status?: EpicStatus; priority?: Priority; projectId?: string }) => {
    setEpicsLoading(true);
    setEpicsError(null);
    try {
      const response = await epicsApi.list({ limit: 100, ...filters });
      setEpics(response.data);
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        setEpicsError(error.message);
      } else {
        setEpicsError('Failed to fetch epics');
      }
    } finally {
      setEpicsLoading(false);
    }
  }, []);

  const createEpic = useCallback(async (data: CreateEpicRequest) => {
    const epic = await epicsApi.create(data);
    setEpics((prev) => [...prev, epic]);
    return epic;
  }, []);

  const updateEpic = useCallback(async (id: string, data: UpdateEpicRequest) => {
    const epic = await epicsApi.update(id, data);
    setEpics((prev) => prev.map((e) => (e.id === id ? epic : e)));
    return epic;
  }, []);

  const deleteEpic = useCallback(async (id: string) => {
    await epicsApi.delete(id);
    setEpics((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // Tasks
  const fetchTasks = useCallback(async (filters?: { status?: TaskStatus; epicId?: string; assigneeId?: string }) => {
    setTasksLoading(true);
    setTasksError(null);
    try {
      const response = await tasksApi.list({ limit: 100, ...filters });
      setTasks(response.data);
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        setTasksError(error.message);
      } else {
        setTasksError('Failed to fetch tasks');
      }
    } finally {
      setTasksLoading(false);
    }
  }, []);

  const createTask = useCallback(async (data: CreateTaskRequest) => {
    const task = await tasksApi.create(data);
    setTasks((prev) => [...prev, task]);
    return task;
  }, []);

  const updateTask = useCallback(async (id: string, data: UpdateTaskRequest) => {
    const task = await tasksApi.update(id, data);
    setTasks((prev) => prev.map((t) => (t.id === id ? task : t)));
    return task;
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    await tasksApi.delete(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Comments
  const fetchComments = useCallback(async (taskId: string) => {
    return await commentsApi.list(taskId);
  }, []);

  const createComment = useCallback(async (taskId: string, data: { content: string }) => {
    return await commentsApi.create(taskId, data);
  }, []);

  const updateComment = useCallback(async (taskId: string, commentId: string, data: { content: string }) => {
    return await commentsApi.update(taskId, commentId, data);
  }, []);

  const deleteComment = useCallback(async (taskId: string, commentId: string) => {
    await commentsApi.delete(taskId, commentId);
  }, []);

  // Task Links
  const fetchTaskLinks = useCallback(async (taskId: string) => {
    return await taskLinksApi.list(taskId);
  }, []);

  const createTaskLink = useCallback(async (taskId: string, data: { url: string; linkType: string; title?: string }) => {
    return await taskLinksApi.create(taskId, data);
  }, []);

  const deleteTaskLink = useCallback(async (taskId: string, linkId: string) => {
    await taskLinksApi.delete(taskId, linkId);
  }, []);

  // Dependencies
  const fetchDependencies = useCallback(async (taskId: string) => {
    return await dependenciesApi.list(taskId);
  }, []);

  const createDependency = useCallback(async (taskId: string, data: { dependsOnTaskId: string; type: string }) => {
    return await dependenciesApi.create(taskId, data);
  }, []);

  const deleteDependency = useCallback(async (taskId: string, dependencyId: string) => {
    await dependenciesApi.delete(taskId, dependencyId);
  }, []);

  return (
    <AppContext.Provider
      value={{
        projects,
        projectsLoading,
        projectsError,
        fetchProjects,
        createProject,
        updateProject,
        deleteProject,
        epics,
        epicsLoading,
        epicsError,
        fetchEpics,
        createEpic,
        updateEpic,
        deleteEpic,
        tasks,
        tasksLoading,
        tasksError,
        fetchTasks,
        createTask,
        updateTask,
        deleteTask,
        fetchComments,
        createComment,
        updateComment,
        deleteComment,
        fetchTaskLinks,
        createTaskLink,
        deleteTaskLink,
        fetchDependencies,
        createDependency,
        deleteDependency,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
