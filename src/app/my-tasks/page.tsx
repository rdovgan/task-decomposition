'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Filter, Search, X, Calendar, Clock } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { PriorityBadge } from '@/components/ui/priority-badge';
import { Button } from '@/components/ui/button';
import { Task, Epic, TaskStatus, Priority, User } from '@/types';
import { tasksApi, epicsApi, usersApi, ApiErrorClass } from '@/lib/api-client';

// Storage key for sort preferences
const SORT_STORAGE_KEY = 'my-tasks-sort';

type SortField = 'dueDate' | 'priority' | 'storyPoints' | 'createdAt';
type SortDirection = 'asc' | 'desc';

interface FilterState {
  epicId: string;
  priority: string;
  statuses: string[];
  searchQuery: string;
}

const ACTIVE_STATUSES: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'BLOCKED'];

export default function MyTasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [filters, setFilters] = useState<FilterState>({
    epicId: '',
    priority: '',
    statuses: [],
    searchQuery: '',
  });

  // Sort state
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    loadInitialData();
    loadSortPreferences();
  }, []);

  async function loadInitialData() {
    setLoading(true);
    setError(null);
    try {
      // In production, get current user from auth context
      // For now, using a demo user or first available user
      const usersData = await usersApi.list();
      const user = usersData.data[0] || null;
      setCurrentUser(user);

      if (user) {
        const [tasksData, epicsData] = await Promise.all([
          tasksApi.list({ assigneeId: user.id, limit: 100 }),
          epicsApi.list({ limit: 100 }),
        ]);
        setTasks(tasksData.data);
        setEpics(epicsData.data);
      }
    } catch (err) {
      if (err instanceof ApiErrorClass) {
        setError(err.message);
      } else {
        setError('Failed to load tasks');
      }
    } finally {
      setLoading(false);
    }
  }

  function loadSortPreferences() {
    try {
      const stored = localStorage.getItem(SORT_STORAGE_KEY);
      if (stored) {
        const { field, direction } = JSON.parse(stored);
        setSortField(field);
        setSortDirection(direction);
      }
    } catch (err) {
      console.error('Failed to load sort preferences:', err);
    }
  }

  function saveSortPreferences(field: SortField, direction: SortDirection) {
    try {
      localStorage.setItem(SORT_STORAGE_KEY, JSON.stringify({ field, direction }));
    } catch (err) {
      console.error('Failed to save sort preferences:', err);
    }
  }

  const handleSort = (field: SortField) => {
    let newDirection: SortDirection = 'asc';
    if (sortField === field) {
      newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    }
    setSortField(field);
    setSortDirection(newDirection);
    saveSortPreferences(field, newDirection);
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await tasksApi.update(taskId, { status: newStatus });
      setTasks(tasks.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      ));
    } catch (err) {
      console.error('Failed to update task status:', err);
      setError('Failed to update task status');
    }
  };

  const clearFilters = () => {
    setFilters({
      epicId: '',
      priority: '',
      statuses: [],
      searchQuery: '',
    });
  };

  const toggleStatusFilter = (status: string) => {
    setFilters(prev => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter(s => s !== status)
        : [...prev.statuses, status],
    }));
  };

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Filter by active statuses only (not DONE or CANCELLED)
    filtered = filtered.filter(task => ACTIVE_STATUSES.includes(task.status));

    // Filter by epic
    if (filters.epicId) {
      filtered = filtered.filter(task => task.epicId === filters.epicId);
    }

    // Filter by priority
    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    // Filter by status
    if (filters.statuses.length > 0) {
      filtered = filtered.filter(task => filters.statuses.includes(task.status));
    }

    // Search by title or description
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query))
      );
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle null values
      if (aValue == null) aValue = sortDirection === 'asc' ? '9999-12-31' : '';
      if (bValue == null) bValue = sortDirection === 'asc' ? '9999-12-31' : '';

      // Priority custom sort
      if (sortField === 'priority') {
        const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
        aValue = priorityOrder[aValue as Priority] || 0;
        bValue = priorityOrder[bValue as Priority] || 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [tasks, filters, sortField, sortDirection]);

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      TODO: [],
      IN_PROGRESS: [],
      IN_REVIEW: [],
      BLOCKED: [],
      DONE: [],
      CANCELLED: [],
    };

    filteredTasks.forEach(task => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });

    return grouped;
  }, [filteredTasks]);

  // Calculate time remaining
  const getTimeRemaining = (task: Task) => {
    if (!task.estimatedHours || !task.actualHours) return null;
    const remaining = task.estimatedHours - task.actualHours;
    if (remaining <= 0) return { text: 'Overdue', class: 'text-destructive' };
    return { text: `${remaining}h remaining`, class: 'text-muted-foreground' };
  };

  // Get active filter count
  const activeFilterCount = [
    filters.epicId,
    filters.priority,
    filters.statuses.length,
    filters.searchQuery,
  ].filter(Boolean).length;

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="rounded-lg border border-muted bg-muted/10 p-8 text-center">
          <p className="text-muted-foreground">No user found. Please log in to view your tasks.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
        <p className="mt-2 text-muted-foreground">
          Manage and track your assigned tasks
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-lg border bg-card p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold">Filters</h2>
            {activeFilterCount > 0 && (
              <span className="text-sm text-muted-foreground">
                ({activeFilterCount} active)
              </span>
            )}
          </div>
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Search tasks..."
              className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Epic Filter */}
          <select
            value={filters.epicId}
            onChange={(e) => setFilters(prev => ({ ...prev, epicId: e.target.value }))}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">All Epics</option>
            {epics.map((epic) => (
              <option key={epic.id} value={epic.id}>
                {epic.title}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {ACTIVE_STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => toggleStatusFilter(status)}
                className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                  filters.statuses.includes(status)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background hover:bg-muted'
                }`}
              >
                {status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sort Controls */}
      <div className="mb-6 flex items-center gap-4">
        <span className="text-sm text-muted-foreground">Sort by:</span>
        <div className="flex gap-2">
          {[
            { field: 'dueDate' as SortField, label: 'Due Date' },
            { field: 'priority' as SortField, label: 'Priority' },
            { field: 'storyPoints' as SortField, label: 'Story Points' },
            { field: 'createdAt' as SortField, label: 'Created' },
          ].map(({ field, label }) => (
            <Button
              key={field}
              variant={sortField === field ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSort(field)}
            >
              {label}
              {sortField === field && (
                <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Task Groups by Status */}
      <div className="space-y-6">
        {ACTIVE_STATUSES.map((status) => {
          const statusTasks = tasksByStatus[status];
          if (statusTasks.length === 0) return null;

          return (
            <div key={status} className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <StatusBadge status={status} />
                  <span>{statusTasks.length}</span>
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {statusTasks.map((task) => {
                  const timeRemaining = getTimeRemaining(task);

                  return (
                    <Link
                      key={task.id}
                      href={`/tasks/${task.id}`}
                      className="block rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="mb-3 flex items-start justify-between gap-2">
                        <h3 className="font-medium line-clamp-2">{task.title}</h3>
                        <PriorityBadge priority={task.priority} />
                      </div>

                      {task.epic && (
                        <Link
                          href={`/epics/${task.epic.id}`}
                          className="text-sm text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {task.epic.title}
                        </Link>
                      )}

                      <div className="mt-3 flex items-center gap-4 text-sm text-muted-foreground">
                        {task.storyPoints && (
                          <span>{task.storyPoints} pts</span>
                        )}

                        {task.dueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}

                        {timeRemaining && (
                          <span className={`flex items-center gap-1 ${timeRemaining.class}`}>
                            <Clock className="h-3 w-3" />
                            {timeRemaining.text}
                          </span>
                        )}
                      </div>

                      {/* Inline Status Change */}
                      <div className="mt-3">
                        <select
                          value={task.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleStatusChange(task.id, e.target.value as TaskStatus);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="IN_REVIEW">In Review</option>
                          <option value="DONE">Done</option>
                          <option value="BLOCKED">Blocked</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {filteredTasks.length === 0 && (
          <div className="rounded-lg border bg-card p-12 text-center">
            <p className="text-lg font-medium text-muted-foreground">No tasks found</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {activeFilterCount > 0
                ? 'Try adjusting your filters or search query'
                : "You don't have any active tasks assigned to you"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
