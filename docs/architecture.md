# Task Decomposition Tool - Architecture Overview

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Project UI   │  │   Epic UI    │  │      Task UI         │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              AppContext (State Management)                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Client (fetch wrapper)                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         projectsApi, epicsApi, tasksApi, etc.             │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Backend (Express)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Projects   │  │    Epics     │  │       Tasks          │  │
│  │  Controller  │  │  Controller  │  │     Controller       │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Middleware: Validation, Error, Logging            │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Data Layer                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Prisma     │  │ PostgreSQL   │  │  Anthropic Claude    │  │
│  │    ORM       │  │   Database   │  │      API             │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack Rationale

### Frontend: Next.js 16 + React 19
- **Why Next.js**: Server-side rendering, API routes, excellent DX
- **Why React 19**: Latest features, improved performance
- **Why TypeScript**: Type safety reduces bugs, better IDE support

### Backend: Express + Node.js
- **Why Express**: Minimal, flexible, extensive middleware ecosystem
- **Why TypeScript**: End-to-end type safety with frontend

### Database: PostgreSQL + Prisma
- **Why PostgreSQL**: ACID compliance, complex queries, relational integrity
- **Why Prisma**: Type-safe queries, migrations, excellent TypeScript support

### AI Integration: Anthropic Claude API
- **Why Claude**: Superior task decomposition, structured output, reliability

## Key Design Patterns

### 1. Separation of Concerns
- **Frontend**: UI + state management only
- **Backend API**: HTTP layer + validation
- **Controllers**: Business logic
- **Prisma**: Data access

### 2. Type Safety
- Shared types in `/src/types/index.ts`
- Zod validation for runtime type checking
- Prisma generates types from schema

### 3. Error Handling
- Centralized error handler middleware
- Consistent error response format
- Operational vs programming errors

### 4. State Management
- React Context for global state
- Component state for local UI
- API client handles data fetching

## Data Flow

### Read Flow (Project List)
1. User visits `/projects`
2. Component calls `fetchProjects()` from AppContext
3. AppContext calls `projectsApi.list()`
4. API client sends GET to `/api/projects`
5. Project controller queries Prisma
6. Prisma queries PostgreSQL
7. Response flows back: Prisma → Controller → API → Client → State → UI

### Write Flow (Create Epic)
1. User submits epic form
2. Component calls `createEpic()` from AppContext
3. AppContext calls `epicsApi.create(data)`
4. API client sends POST to `/api/epics`
5. Validation middleware validates request body
6. Epic controller creates epic via Prisma
7. Response includes created epic
8. AppContext updates epics state
9. UI re-renders with new epic

### AI Decomposition Flow
1. User clicks "Decompose Task"
2. Frontend sends task context to `/api/tasks/:id/decompose`
3. Task controller calls `taskDecompositionService.decompose()`
4. Service builds prompt with project/epic/task context
5. Service calls Anthropic Claude API
6. Claude returns structured JSON
7. Service parses and validates response
8. Controller returns subtask suggestions
9. Frontend displays suggestions for user approval

## API Design Principles

### RESTful Conventions
- GET: Fetch resources
- POST: Create resources
- PATCH: Partial updates
- DELETE: Remove resources

### Response Format
Success: `{ data: T, meta?: {...} }`
Error: `{ error: { message: string, errors?: {...} } }`

### Pagination
Query params: `page`, `limit`
Response: `{ data: T[], pagination: { page, limit, total, totalPages } }`

### Filtering
Query params: `status`, `projectId`, `assigneeId`, etc.
Multiple filters combined with AND

## Security Considerations

### Current Implementation
- CORS configuration
- Input validation with Zod
- SQL injection prevention (Prisma)
- Error message sanitization in production

### Future Enhancements
- Authentication (JWT/session)
- Authorization (role-based access control)
- Rate limiting
- Request signing
- Audit logging

## Performance Optimizations

### Database
- Indexed foreign keys (projectId, epicId, assigneeId)
- Compound indexes for common queries
- Connection pooling via Prisma

### Frontend
- React.memo for expensive components
- Code splitting via Next.js
- Optimistic UI updates
- Pagination to limit data transfer

### API
- Efficient queries with Prisma includes
- Pagination to limit result sets
- Async operations for parallel data fetching

## Scalability Considerations

### Current Limitations
- Single database instance
- No caching layer
- No job queue for background tasks
- No horizontal scaling support

### Future Improvements
- Read replicas for reporting queries
- Redis cache for frequently accessed data
- Bull/BullMQ for background jobs
- Container orchestration (Kubernetes)
- CDN for static assets

## Monitoring & Observability

### Current Implementation
- HTTP request logging middleware
- Error logging with stack traces
- Health check endpoint

### Recommended Additions
- Structured logging (winston/pino)
- Metrics collection (Prometheus)
- Distributed tracing (OpenTelemetry)
- APM integration (DataDog/NewRelic)

## Deployment Architecture

### Development
- Next.js dev server (port 3000)
- Express backend (port 3001)
- PostgreSQL via Docker

### Production (Recommended)
```
┌─────────────────────────────────────┐
│         Load Balancer (Nginx)       │
└─────────────────────────────────────┘
              │
    ┌─────────┴─────────┐
    │                   │
┌───▼────────┐   ┌─────▼──────────┐
│   Next.js  │   │   Express API  │
│  (Static)  │   │   (Node.js)    │
└────────────┘   └────────────────┘
    │                   │
    └─────────┬─────────┘
              │
      ┌───────▼────────┐
      │   PostgreSQL   │
      │   (Primary)    │
      └────────────────┘
```

## Environment Variables

### Required
- `DATABASE_URL`: PostgreSQL connection string
- `ANTHROPIC_API_KEY`: Claude API key

### Optional
- `PORT`: Backend server port (default: 3001)
- `ALLOWED_ORIGINS`: CORS allowed origins (default: http://localhost:3000)
- `ANTHROPIC_MODEL`: Claude model to use (default: claude-sonnet-4-6)
- `NODE_ENV`: Environment (development/production)

## Testing Strategy

### Unit Tests
- Controllers: Request/response handling
- Services: Business logic
- Utilities: Pure functions
- Components: Render logic

### Integration Tests
- API endpoints: Full request cycle
- Database operations: Prisma queries
- AI service: Mocked Claude responses

### E2E Tests
- Critical user flows: Create project → Add epic → Add tasks → Decompose

### Current Status
- Test framework configured (Jest, Playwright)
- No tests written yet
- Priority: Add tests before production deployment

## Technical Debt Log

### Known Issues
1. **No authentication/authorization**: Anyone can access/modify data
2. **No test coverage**: No tests exist yet
3. **Duplicate validation schemas**: Schema defined in both Zod and Prisma
4. **No rate limiting**: API vulnerable to abuse
5. **No caching**: Repeated database queries
6. **No file uploads**: Task attachments not implemented
7. **No websockets**: Real-time updates missing

### Refactoring Opportunities
1. **Extract business logic**: Controllers mix business logic with data access
2. **Shared validation**: Zod schemas could generate from Prisma
3. **API client reuse**: Some components bypass AppContext
4. **Error boundaries**: No React error boundaries for graceful failures
