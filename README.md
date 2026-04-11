# Task Decomposition Tool

An intelligent tool for breaking down complex tasks into manageable subtasks, built with modern web technologies.

## Tech Stack

### Frontend
- **Next.js 16+** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **React 19** - Latest React features
- **CSS Modules** - Component-scoped styling (Tailwind CSS can be added by dev team)
- **shadcn/ui** - High-quality React components

### Backend
- **Node.js/Express** - Backend API server
- **PostgreSQL** - Primary database with Prisma ORM
- **Zod** - Runtime type validation
- **TypeScript** - End-to-end type safety

### Infrastructure
- **Docker** - Containerized development and deployment
- **GitHub Actions** - CI/CD pipelines (planned)

## Project Structure

```
task-decomposition-tool/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   │   └── ui/           # shadcn/ui components
│   ├── lib/              # Utility functions and shared code
│   ├── server/           # Backend code (planned)
│   │   ├── api/          # API routes
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Express middleware
│   │   └── models/       # Database models
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Helper functions
├── public/               # Static assets
└── tests/                # Test files (to be added)
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

### Docker Setup (Coming Soon)

```bash
# Build the Docker image
docker build -t task-decomposition-tool .

# Run the container
docker run -p 3000:3000 task-decomposition-tool
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

MIT License - See LICENSE file for details
