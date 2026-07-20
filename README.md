# Task Decomposition Tool

An AI-powered tool that turns a PDF or pasted requirements doc into an estimated, dependency-aware task breakdown — then tracks that work through projects, epics, and a Kanban board.

## Features

- **One-click decompose** - Upload a PDF (or paste text) and get an AI-generated task list with estimates, priorities, and specialties in one step
- **Team-aware estimates** - Configure team presets (roles, specialties, headcount) to improve AI estimates, and save them for reuse
- **Projects → Epics → Tasks** hierarchy with status/priority tracking, story points, and due dates
- **Kanban board** with drag-and-drop status changes (`My Tasks`)
- **Dependency graph** visualization for task blocking relationships (React Flow)
- **Comments** and **task links** (Confluence, Notion, GitHub, Jira, Figma, external URLs)
- **Markdown export** of a decomposition result
- **Per-user Anthropic API key** management (encrypted at rest) in Settings

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **React 19**
- **Tailwind CSS v4** - Utility-first styling with a custom OKLCH-based design system (`src/app/globals.css`)
- **base-ui/react** + **class-variance-authority** - Headless component primitives styled shadcn-style (see `components.json`)
- **@dnd-kit** - Kanban drag-and-drop
- **reactflow** - Dependency graph visualization

### Backend
- **Node.js/Express** - Backend API server
- **PostgreSQL** - Primary database with Prisma ORM
- **Zod** - Runtime type validation
- **Anthropic SDK (Claude)** - AI-powered task decomposition
- **TypeScript** - End-to-end type safety

### Infrastructure
- **Docker** - Containerized development and deployment
- **GitHub Actions** - CI/CD pipelines (`.github/workflows`)

## Project Structure

```
task-decomposition-tool/
├── src/
│   ├── app/              # Next.js App Router pages (decompose, projects, epics, tasks, my-tasks, team, settings)
│   ├── components/       # React components
│   │   ├── ui/           # Base components (button, dialog, toast, data-table, badges, ...)
│   │   ├── tasks/        # Kanban board, task forms, comments, dependency manager
│   │   ├── dependency-graph/  # React Flow dependency visualization
│   │   ├── layout/        # Sidebar / app shell
│   │   └── ai/            # AI decomposition dialog
│   ├── contexts/          # App-wide React context
│   ├── lib/               # API client, utils, markdown export, validations
│   ├── server/             # Express backend
│   │   ├── api/            # Route definitions (projects, epics, tasks, decompose, users, userSettings, v1 public API)
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic (AI decomposition, PDF parsing, etc.)
│   │   ├── middleware/     # Express middleware
│   │   └── lib/            # Server-side utilities (Prisma client, etc.)
│   └── types/              # TypeScript type definitions
├── prisma/                 # Prisma schema and seed scripts
├── e2e/                     # Playwright end-to-end tests
├── public/                  # Static assets
└── docs/                    # Requirements, architecture, and design docs
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Docker (for containerized development)
- PostgreSQL (local or via Docker)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd task-decomposition-tool
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

**Option A: Quick setup (Development)**
```bash
npm run env:dev
```

**Option B: Manual setup**
```bash
cp .env.example .env
# Edit .env and add your Anthropic API key for AI features
```

**Required Environment Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `ANTHROPIC_API_KEY` - Your Anthropic API key for AI task decomposition
- `ANTHROPIC_MODEL` - (Optional) Claude model to use (default: claude-sonnet-4-6)

4. Set up the database:
```bash
npm run db:generate
npm run db:push
npm run db:seed  # Optional: populate with sample data
```

5. Run the development server:
```bash
npm run dev:all
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Management

The project supports multiple environments with isolated databases:

```bash
# Switch environments
npm run env:dev       # Development (default)
npm run env:staging   # Staging environment
npm run env:prod      # Production environment
npm run env:test      # Test environment

# Check current environment
npm run env:current
```

**Environment-specific databases:**
- Development: `task_decomposition_dev` (port 5432)
- Staging: `task_decomposition_staging` (port 5433)
- Production: `task_decomposition_prod` (port 5434)
- Test: `task_decomposition_test` (port 5432)

📖 **See [Environment Management Guide](docs/environment-management.md) for detailed instructions.**

### Docker Setup

```bash
# Start app, server, and Postgres
npm run docker:up

# View logs / stop / check status
npm run docker:logs
npm run docker:down
npm run docker:ps

# Run Prisma migrate/seed inside the container
npm run docker:db:push
npm run docker:db:seed

# Staging / production compose files
npm run docker:staging:up
npm run docker:prod:up
```

## Development

### Available Scripts

- `npm run dev` - Start Next.js frontend development server
- `npm run dev:server` - Start Express backend development server
- `npm run dev:all` - Start both frontend and backend concurrently
- `npm run build` - Build Next.js for production
- `npm run build:server` - Build backend TypeScript
- `npm run start` - Start Next.js production server
- `npm run start:server` - Start Express production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run frontend/component unit tests (Jest)
- `npm run test:server` - Run backend unit tests (Jest)
- `npm run test:e2e` - Run end-to-end tests (Playwright)
- `npm run test:all` - Run unit + e2e tests

### Database Scripts

- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create and apply database migration
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:seed` - Seed database with sample data

### Code Quality

The project uses:
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking
- **Zod** - Runtime validation for API

## Backend API

### Running the Backend

1. Start PostgreSQL database:
```bash
# Using Docker
docker-compose up -d

# Or use local PostgreSQL
```

2. Set up database:
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

3. Start the backend server:
```bash
npm run dev:server
```

The API will be available at `http://localhost:3001`

### API Endpoints

#### Projects
- `GET /api/projects` - List all projects (with pagination)
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

#### Epics
- `GET /api/epics` - List all epics (with pagination)
- `GET /api/epics/:id` - Get epic by ID
- `POST /api/epics` - Create new epic
- `PATCH /api/epics/:id` - Update epic
- `DELETE /api/epics/:id` - Delete epic

#### Tasks
- `GET /api/tasks` - List all tasks (with pagination, search, sort)
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/:id/dependencies` - Get task dependencies
- `POST /api/tasks/:id/dependencies` - Create task dependency

#### AI-Powered Task Decomposition ✨
- `POST /api/tasks/:id/decompose` - Break down a task into subtasks using Claude AI
- `GET /api/tasks/decompose/health` - Check AI service health status
- `POST /api/decompose/quick` - One-click decompose: upload a PDF and get a full task breakdown
- `POST /api/decompose/text` - Same as above, from pasted requirements text
- `POST /api/decompose/save` - Save a decomposition result as a Project + Epic + Tasks
- `GET/POST/PATCH/DELETE /api/decompose/team-configs` - Manage reusable team presets used to improve estimates
- `POST /api/v1/decompose` - Public API (requires `X-API-Key` header) for PDF decomposition

**Example Request:**
```bash
POST /api/tasks/{taskId}/decompose
```

**Example Response:**
```json
{
  "data": [
    {
      "id": "task-id-1",
      "title": "Design database schema",
      "description": "Create normalized schema with proper indexes",
      "estimatedHours": 4,
      "priority": "HIGH",
      "status": "TODO",
      "epic": { "id": "epic-id", "title": "Build Authentication System" }
    }
  ],
  "meta": {
    "decompositionTime": 2.3,
    "modelUsed": "claude-sonnet-4-6",
    "parentTaskId": "parent-task-id"
  }
}
```

#### Users & Settings
- `GET /api/users` - List team members
- `GET /api/user-settings/:userId` - Get a user's settings (whether an API key is stored)
- `PUT /api/user-settings/:userId` - Save a user's Anthropic API key (encrypted at rest)
- `DELETE /api/user-settings/:userId/api-key` - Remove a stored API key
- `POST /api/user-settings/validate-api-key` - Validate an API key against Anthropic

### Database Schema

**Users**: Team members with authentication
- id, email, name, role (ADMIN, PROJECT_MANAGER, DEVELOPER, DESIGNER, QA)

**Projects**: Top-level containers
- id, name, description, ownerId, status

**Epics**: Large features/user stories
- id, projectId, title, description, status, priority

**Tasks**: Individual work items
- id, epicId, title, description, assigneeId, status, priority, storyPoints, estimatedHours, actualHours

**Dependencies**: Task relationships
- id, taskId, dependsOnTaskId, type (BLOCKS, RELATED_TO, DUPLICATES)

**TaskLinks**: External documentation
- id, taskId, url, linkType (CONFLUENCE, NOTION, GITHUB, JIRA, FIGMA, EXTERNAL)

**Comments**: Task discussions
- id, taskId, authorId, content

## Documentation

Detailed requirements documentation for Iteration 1 features:

- **[User Personas](docs/personas.md)** - Core user types (Project Manager, Developer, Tech Lead, QA) with goals, pain points, and workflows
- **[Functional Requirements](docs/functional-requirements.md)** - Detailed feature specifications (FR-1 through FR-18) covering task management, dependencies, comments, and AI decomposition
- **[User Stories](docs/user-stories.md)** - 16 detailed user stories with acceptance criteria for implementation
- **[Edge Cases](docs/edge-cases.md)** - Error handling and edge case scenarios (circular dependencies, concurrent edits, AI failures, etc.)
- **[Non-Functional Requirements](docs/non-functional-requirements.md)** - Performance, scalability, usability, reliability, security, and maintainability requirements

These documents guide the implementation of Iteration 1 and ensure alignment with business needs.

## Contributing

This project is being developed as part of the Paperclip team's task decomposition initiative. The Full-Stack Developer role will lead the implementation of the core features.

## License

MIT License
