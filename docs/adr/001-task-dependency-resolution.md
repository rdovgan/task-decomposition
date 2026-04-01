# ADR-001: Task Dependency Resolution Strategy

## Status
**Accepted** (2026-04-01)

## Context
The Task Decomposition Tool needs to support relationships between tasks, including:
- Tasks that block other tasks (must complete first)
- Tasks that are related (informational link)
- Tasks that duplicate work (to be merged)

We need to decide how to model, store, and validate these dependencies.

## Decision

### Data Model
We will use a **directed graph** model with the following structure:

```prisma
model Dependency {
  id              String @id @default(cuid())
  taskId          String
  dependsOnTaskId String
  type            DependencyType @default(BLOCKS)

  task       Task @relation("TaskDependencies", fields: [taskId], references: [id])
  dependsOn  Task @relation("DependentTasks", fields: [dependsOnTaskId], references: [id])

  @@unique([taskId, dependsOnTaskId])
  @@index([taskId])
  @@index([dependsOnTaskId])
}
```

### Dependency Types
1. **BLOCKS**: Task A must complete before Task B starts
2. **RELATED_TO**: Tasks are related but don't block (informational)
3. **DUPLICATES**: Tasks duplicate work (should be merged)

### Validation Rules
1. **No self-dependencies**: A task cannot depend on itself
2. **No circular dependencies**: Prevent infinite dependency chains
3. **Cascading deletes**: Deleting a task removes its dependencies
4. **Optional blocking**: Assignee cannot start blocked tasks until dependencies complete

### Resolution Algorithm
For checking if a task can be started:

```typescript
async function canStartTask(taskId: string): Promise<boolean> {
  // Get all BLOCKS dependencies
  const blocking = await prisma.dependency.findMany({
    where: {
      taskId,
      type: 'BLOCKS'
    },
    include: {
      dependsOn: true
    }
  });

  // Check if all blocking tasks are DONE
  return blocking.every(dep => dep.dependsOn.status === 'DONE');
}
```

For circular dependency detection:

```typescript
function hasCircularDependency(
  taskId: string,
  visited = new Set<string>(),
  recursionStack = new Set<string>()
): boolean {
  if (recursionStack.has(taskId)) return true; // Cycle detected
  if (visited.has(taskId)) return false; // Already checked

  visited.add(taskId);
  recursionStack.add(taskId);

  const dependencies = getDependencies(taskId);
  for (const dep of dependencies) {
    if (hasCircularDependency(dep.dependsOnTaskId, visited, recursionStack)) {
      return true;
    }
  }

  recursionStack.delete(taskId);
  return false;
}
```

## Consequences

### Positive
- Flexible dependency modeling supports complex project structures
- Database constraints prevent invalid relationships
- Type-safe with TypeScript and Prisma
- Efficient lookups with proper indexing

### Negative
- Additional complexity in task creation/validation
- Need to prevent circular dependencies at application level
- Extra queries to check task status transitions

### Alternatives Considered
1. **Simple parent-child hierarchy**: Rejected - too restrictive for cross-task dependencies
2. **Dependency graph library**: Rejected - over-engineering for current needs
3. **Embedded dependencies in task model**: Rejected - violates normalization, hard to query

## Implementation Notes
- Circular dependency check runs on dependency creation
- Frontend prevents starting tasks with unmet BLOCKS dependencies
- Dependency status shown in task detail view
- Bulk operations (mark epic done) validate dependencies first

## Future Enhancements
- Visual dependency graph visualization
- Critical path calculation
- Dependency-based sprint planning
- Automatic dependency suggestions from AI decomposition
