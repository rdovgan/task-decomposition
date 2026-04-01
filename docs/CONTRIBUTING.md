# Contributing to Task Decomposition Tool

Thank you for your interest in contributing! This document provides guidelines for contributing to the Task Decomposition Tool.

## Code Style Guide

### TypeScript
- Use strict TypeScript configuration (no implicit any, strict null checks)
- Prefer `interface` for object shapes, `type` for unions/primitives
- Use utility types (`Partial<T>`, `Omit<T>`, etc.) when appropriate
- Define return types for public functions

```typescript
// Good
interface User {
  id: string;
  name: string;
}

async function getUser(id: string): Promise<User> {
  // ...
}

// Avoid
async function getUser(id: string) {  // Missing return type
  // ...
}
```

### React Components
- Use functional components with hooks
- Prefer 'use client' directive when using hooks
- Define component props as interfaces

```tsx
'use client';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onClick} className={`btn btn-${variant}`}>
      {children}
    </button>
  );
}
```

### File Naming
- Components: PascalCase (e.g., `DataTable.tsx`)
- Utilities: camelCase (e.g., `api-client.ts`)
- Hooks: camelCase with 'use' prefix (e.g., `useApp.ts`)
- Tests: same name as file with `.test` or `.spec` suffix

## Pull Request Process

### Before Creating a PR
1. Ensure your code follows the style guide
2. Write tests for new functionality
3. Update documentation if needed
4. Run linting and formatting

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests added/updated
- [ ] All tests passing

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added to complex code
- [ ] Documentation updated
- [ ] No new warnings generated
```

## Git Workflow

### Branch Naming
- `feature/` - New features (e.g., `feature/task-decomposition`)
- `fix/` - Bug fixes (e.g., `fix/validation-error`)
- `docs/` - Documentation changes (e.g., `docs/api-endpoints`)
- `refactor/` - Code refactoring (e.g., `refactor/api-client`)

### Commit Messages
Follow conventional commits format:

```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
```
feat(api): add task dependency endpoint
fix(validation): handle empty epic titles correctly
docs(readme): update installation instructions
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Docker (optional)

### Local Development

1. **Clone and install:**
```bash
git clone <repository-url>
cd task-decomposition-tool
npm install
```

2. **Set up environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Set up database:**
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

4. **Start development servers:**
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
npm run dev:server

# Or both together:
npm run dev:all
```

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- DataTable.test.tsx
```

### Linting and Formatting
```bash
# Check linting
npm run lint

# Fix linting issues
npm run lint -- --fix

# Format code
npm run format

# Check formatting
npm run format:check
```

## Development Guidelines

### API Design
- Use RESTful conventions
- Return consistent response formats: `{ data: T, meta?: object }`
- Use appropriate HTTP status codes
- Include error messages for validation failures

### Database Changes
1. Update `prisma/schema.prisma`
2. Run `npm run db:generate`
3. Run `npm run db:push` (development) or create migration
4. Update TypeScript types if needed

### Adding Dependencies
- Prefer existing dependencies when possible
- Check bundle size impact
- Document why new dependency is needed in PR

## Code Review Guidelines

### For Reviewers
- Check code follows style guide
- Verify tests are included and passing
- Check for security vulnerabilities
- Verify performance implications
- Test the changes locally if possible

### For Authors
- Address all review comments
- Update tests as needed
- Keep PR size manageable (< 500 lines)
- Respond to comments promptly

## Questions?
Reach out to the team or create a discussion issue for questions that don't fit into a PR or bug report.
