'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  Project,
  Epic,
  Task,
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateEpicRequest,
  UpdateEpicRequest,
  ProjectStatus,
  EpicStatus,
  Priority
} from '@/types';
import { projectsApi, epicsApi, tasksApi, ApiErrorClass } from '@/lib/api-client';

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  const [epics, setEpics] = useState<Epic[]>([]);
  const [epicsLoading, setEpicsLoading] = useState(false);
  const [epicsError, setEpicsError] = useState<string | null>(null);

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
