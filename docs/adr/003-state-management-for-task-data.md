# ADR-003: State Management for Task Data

## Status
**Accepted** (2026-04-01)

## Context
The Task Decomposition Tool is a data-intensive application with multiple related entities:
- Projects → Epics → Tasks (hierarchical)
- Comments, Links, Dependencies (task-related)
- Real-time updates across pages

We need to decide how to manage state for these entities across the application.

## Decision

### Approach: React Context + API Client
We will use **React Context** for global state with a **centralized API client**:

```typescript
// AppContext provides:
// 1. State (projects, epics, tasks)
// 2. Loading states
// 3. Error states
// 4. CRUD operations

const AppContext = createContext<AppContextType>();

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
```

### State Structure
```typescript
interface AppContextType {
  // Projects
  projects: Project[];
  projectsLoading: boolean;
  projectsError: string | null;
  fetchProjects: (filters?) => Promise<void>;
  createProject: (data) => Promise<Project>;
  updateProject: (id, data) => Promise<Project>;
  deleteProject: (id) => Promise<void>;

  // Epics (similar pattern)
  // Tasks (similar pattern)
  // Comments (no caching, direct API calls)
  // Dependencies (no caching, direct API calls)
}
```

### Data Fetching Strategy
1. **List pages**: Fetch on mount, cache in Context
2. **Detail pages**: Fetch specific entity, merge with Context
3. **CRUD operations**: Optimistic updates, revalidate on error
4. **Real-time**: Polling or SSE (future enhancement)

### Caching Rules
- **Cache**: Projects, Epics, Tasks (frequently accessed)
- **Don't cache**: Comments, Links (per-task, volatile)
- **TTL**: Session-based (clear on refresh)
- **Invalidation**: Explicit updates on mutations

### API Client Pattern
```typescript
class ApiClient {
  async get<T>(url): Promise<T> { /* ... */ }
  async post<T>(url, data): Promise<T> { /* ... */ }
  async patch<T>(url, data): Promise<T> { /* ... */ }
  async delete<T>(url): Promise<T> { /* ... */ }
}

// Type-safe API methods
export const projectsApi = {
  list: (params) => api.get<PaginatedResponse<Project>>(...),
  get: (id) => api.get<Project>(...),
  create: (data) => api.post<Project>(...),
  // ...
};
```

### Error Handling
```typescript
try {
  await createProject(data);
} catch (error) {
  if (error instanceof ApiErrorClass) {
    setProjectsError(error.message);
  }
  // Show error to user
}
```

## Consequences

### Positive
- Simple: No additional libraries or complexity
- Type-safe: Full TypeScript support
- Performant: Re-renders only when specific data changes
- Scalable: Easy to add new entities
- Testable: Context can be mocked

### Negative
- Manual cache management: Developer must update state
- No automatic refetching: Stale data possible
- Verbose: More boilerplate than higher-level libraries
- No deduplication: Duplicate requests possible

### Alternatives Considered
1. **Redux Toolkit**: Rejected - overkill for current scope, adds boilerplate
2. **TanStack Query**: Rejected - great library but adds dependency, context sufficient
3. **Zustand**: Rejected - loses TypeScript strictness, context is more explicit
4. **Server Components**: Rejected - Next.js feature but adds complexity for dynamic data

## Implementation Patterns

### Reading Data
```typescript
function ProjectsPage() {
  const { projects, projectsLoading, fetchProjects } = useApp();

  useEffect(() => {
    fetchProjects();
  }, []);

  if (projectsLoading) return <Spinner />;
  return <ProjectList projects={projects} />;
}
```

### Creating Data
```typescript
function CreateProjectForm() {
  const { createProject } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await createProject(data);
      router.push('/projects');
    } catch (error) {
      // Show error
    } finally {
      setIsSubmitting(false);
    }
  };
}
```

### Updating Data (Optimistic)
```typescript
const updateProject = useCallback(async (id: string, data: UpdateProjectRequest) => {
  // Optimistic update
  setProjects(prev => prev.map(p =>
    p.id === id ? { ...p, ...data } : p
  ));

  try {
    const project = await projectsApi.update(id, data);
    // Confirm update
    setProjects(prev => prev.map(p =>
      p.id === id ? project : p
    ));
  } catch (error) {
    // Rollback on error
    await fetchProjects(); // Refetch
    throw error;
  }
}, []);
```

## Future Enhancements

### Phase 2: Add TanStack Query
When complexity increases:
- Automatic caching and refetching
- Request deduplication
- Background refetching
- Optimistic updates built-in

### Phase 3: Real-time Updates
- WebSocket connection for live updates
- BroadcastChannel for cross-tab sync
- Incremental loading for large lists

### Phase 4: Offline Support
- Service worker for caching
- IndexedDB for local storage
- Queue mutations for sync

## Migration Path
If we adopt TanStack Query later:
1. Keep API client (it's already well-designed)
2. Replace Context with QueryClientProvider
3. Convert `useApp()` to `useQuery()` / `useMutation()`
4. Components remain mostly unchanged

## Performance Monitoring
- Track Context re-render frequency
- Monitor API call counts
- Measure state update performance
- Profile component render cycles

Current implementation is sufficient for:
- < 1000 projects/epics/tasks total
- < 100 concurrent users
- Typical CRUD operations

Consider TanStack Query when:
- Data volume grows significantly
- Real-time updates needed
- Complex caching requirements emerge
