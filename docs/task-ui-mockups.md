# Task Management UI Mockups

**Project**: Task Decomposition Tool
**Designer**: UI/UX Designer
**Date**: 2026-04-01
**Status**: 🎨 Ready for Implementation

---

## Overview

This document provides detailed UI mockups and specifications for the task management feature. These mockups follow the established design system and can be implemented directly by frontend developers.

**Pages Included**:
1. Task List Page
2. Task Detail Page
3. Task Create/Edit Form

---

## 1. Task List Page

### Purpose
Display all tasks with filtering, sorting, and quick actions.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [Back to Epic] ←                                            │
│                                                              │
│  Tasks                                                      [New Task] [+]
│  Manage tasks for Epic: "Build Authentication System"       │
│                                                              │
│  [⚙️ Filters:]                                              │
│    Status: [All ▼]  Priority: [All ▼]  Assignee: [All ▼]   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Task          │ Status  │ Priority │ Assignee │ Due  │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ Design schema│ In Prog │ High     │ @alice   │ Apr5 │  │
│  │ Implement API│ To Do   │ Critical │ @bob     │ Apr6 │  │
│  │ Write tests  │ Done    │ Medium   │ @charlie│ Apr7 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Showing 1-3 of 12 tasks      [← Previous] [1] [2] [Next →] │
└─────────────────────────────────────────────────────────────┘
```

### Specification

#### Header Section

```jsx
<div className="container mx-auto py-8 px-4">
  {/* Breadcrumb */}
  <Link href="/epics/123" className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
    <ArrowLeft className="mr-2 h-4 w-4" />
    Back to Epic
  </Link>

  {/* Page Title */}
  <div className="mb-8 flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
      <p className="text-muted-foreground">
        Manage tasks for Epic: <Link href="/epics/123" className="font-medium text-primary hover:underline">Build Authentication System</Link>
      </p>
    </div>
    <Button onClick={() => router.push('/epics/123/tasks/new')}>
      <Plus className="mr-2 h-4 w-4" />
      New Task
    </Button>
  </div>
</div>
```

**Spacing**:
- Breadcrumb to title: `mb-4` (16px)
- Title to filters: `mb-8` (32px)

**Typography**:
- Page title: `text-3xl font-bold tracking-tight`
- Description: `text-muted-foreground`

#### Filter Section

```jsx
<div className="mb-6 flex flex-wrap items-center gap-4">
  <div className="flex items-center gap-2">
    <Filter className="h-4 w-4 text-muted-foreground" />
    <span className="text-sm font-medium">Filters:</span>
  </div>

  <div className="flex flex-wrap gap-4">
    {/* Status Filter */}
    <div className="flex items-center gap-2">
      <Label htmlFor="status-filter" className="text-sm text-muted-foreground">
        Status:
      </Label>
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger id="status-filter" className="w-[180px]">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All</SelectItem>
          <SelectItem value="TODO">To Do</SelectItem>
          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
          <SelectItem value="IN_REVIEW">In Review</SelectItem>
          <SelectItem value="DONE">Done</SelectItem>
          <SelectItem value="BLOCKED">Blocked</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* Priority Filter */}
    <div className="flex items-center gap-2">
      <Label htmlFor="priority-filter" className="text-sm text-muted-foreground">
        Priority:
      </Label>
      <Select value={priorityFilter} onValueChange={setPriorityFilter}>
        <SelectTrigger id="priority-filter" className="w-[180px]">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All</SelectItem>
          <SelectItem value="CRITICAL">Critical</SelectItem>
          <SelectItem value="HIGH">High</SelectItem>
          <SelectItem value="MEDIUM">Medium</SelectItem>
          <SelectItem value="LOW">Low</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* Assignee Filter */}
    <div className="flex items-center gap-2">
      <Label htmlFor="assignee-filter" className="text-sm text-muted-foreground">
        Assignee:
      </Label>
      <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
        <SelectTrigger id="assignee-filter" className="w-[180px]">
          <SelectValue placeholder="All" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All</SelectItem>
          <SelectItem value="unassigned">Unassigned</SelectItem>
          <SelectItem value="alice">Alice Johnson</SelectItem>
          <SelectItem value="bob">Bob Smith</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* Clear Filters */}
    {(statusFilter || priorityFilter || assigneeFilter) && (
      <Button variant="ghost" size="sm" onClick={clearFilters}>
        Clear filters
      </Button>
    )}
  </div>
</div>
```

**Components Needed**:
- `Select` (new)
- `SelectTrigger` (new)
- `SelectContent` (new)
- `SelectItem` (new)
- `Label` (new)

**Spacing**:
- Section margin: `mb-6` (24px)
- Gap between filters: `gap-4` (16px)
- Filter internal gap: `gap-2` (8px)

#### Data Table

```jsx
<DataTable
  columns={taskColumns}
  data={tasks}
  loading={loading}
  emptyMessage="No tasks found. Create your first task to get started."
  onSort={handleSort}
  sortKey={sortKey}
  sortDirection={sortDirection}
/>
```

**Column Definition**:

```jsx
const taskColumns = [
  {
    key: 'title',
    title: 'Task',
    sortable: true,
    render: (_: unknown, row: Record<string, unknown>) => {
      const task = row as Task;
      return (
        <div>
          <Link
            href={`/tasks/${task.id}`}
            className="font-medium text-primary hover:underline"
          >
            {task.title}
          </Link>
          {task.blocked && (
            <div className="flex items-center gap-1 text-xs text-destructive mt-1">
              <AlertTriangle className="h-3 w-3" />
              <span>Blocked: {task.blockReason}</span>
            </div>
          )}
        </div>
      );
    },
  },
  {
    key: 'status',
    title: 'Status',
    sortable: true,
    render: (value: unknown) => <StatusBadge status={value as TaskStatus} />,
  },
  {
    key: 'priority',
    title: 'Priority',
    sortable: true,
    render: (value: unknown) => <PriorityBadge priority={value as Priority} />,
  },
  {
    key: 'assignee',
    title: 'Assignee',
    sortable: true,
    render: (value: unknown) => {
      const assignee = value as Assignee | null;
      return assignee ? (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={assignee.avatar} alt={assignee.name} />
            <AvatarFallback className="text-xs">
              {assignee.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm">{assignee.name}</span>
        </div>
      ) : (
        <span className="text-sm text-muted-foreground">Unassigned</span>
      );
    },
  },
  {
    key: 'dueDate',
    title: 'Due',
    sortable: true,
    render: (value: unknown) => {
      const date = value as string | null;
      if (!date) return <span className="text-sm text-muted-foreground">—</span>;

      const isOverdue = new Date(date) < new Date();
      return (
        <span className={`text-sm ${isOverdue ? 'text-destructive font-medium' : ''}`}>
          {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
      );
    },
  },
  {
    key: 'actions',
    title: '',
    render: (_: unknown, row: Record<string, unknown>) => {
      const task = row as Task;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Task actions">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/tasks/${task.id}`)}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/tasks/${task.id}/edit`)}>
              <Edit className="mr-4 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}>
              <PlayCircle className="mr-2 h-4 w-4" />
              Start
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleDelete(task.id)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
```

**Components Needed**:
- `Avatar` (new)
- `AvatarImage` (new)
- `AvatarFallback` (new)
- `DropdownMenu` (new)
- `DropdownMenuTrigger` (new)
- `DropdownMenuContent` (new)
- `DropdownMenuItem` (new)
- `DropdownMenuSeparator` (new)

**Features**:
- Sortable columns
- Blocked tasks show warning icon and reason
- Overdue dates highlighted in red
- Assignee avatars
- Quick actions dropdown

#### Pagination

```jsx
<div className="mt-6 flex items-center justify-between">
  <p className="text-sm text-muted-foreground">
    Showing {startIndex + 1}-{Math.min(endIndex, total)} of {total} tasks
  </p>
  <div className="flex gap-2">
    <Button
      variant="outline"
      size="sm"
      onClick={() => setPage(p => Math.max(1, p - 1))}
      disabled={page === 1}
    >
      <ChevronLeft className="mr-1 h-4 w-4" />
      Previous
    </Button>
    <div className="flex items-center gap-1">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
        <Button
          key={pageNum}
          variant={page === pageNum ? 'default' : 'outline'}
          size="sm"
          onClick={() => setPage(pageNum)}
          className="min-w-[32px]"
        >
          {pageNum}
        </Button>
      ))}
    </div>
    <Button
      variant="outline"
      size="sm"
      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
      disabled={page === totalPages}
    >
      Next
      <ChevronRight className="ml-1 h-4 w-4" />
    </Button>
  </div>
</div>
```

**Spacing**:
- Top margin: `mt-6` (24px)
- Gap between buttons: `gap-2` (8px)

---

## 2. Task Detail Page

### Purpose
Display comprehensive task information with dependencies, comments, and activity timeline.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [← Back to Tasks]                                           │
│                                                              │
│  Design authentication schema                                │
│  [In Progress ●] [High ↑]                      [Edit] [⋯]   │
│                                                              │
│  Assignee: [@alice]  Due: Apr 5, 2026  Epic: Auth System    │
│  Created: Mar 28, 2026  Updated: Apr 1, 2026                │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Description                                          │  │
│  │                                                      │  │
│  │ Design the database schema for user authentication, │  │
│  │ including users table, sessions, and OAuth flow.    │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Dependencies                                         │  │
│  │                                                      │  │
│  │ Blocks (2):                                          │  │
│  │   → Implement API (Blocked by this)                  │  │
│  │   → Write unit tests (Blocked by this)               │  │
│  │                                                      │  │
│  │ Blocked by (1):                                      │  │
│  │   ← Define user stories                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Subtasks (2/4)                                       │  │
│  │                                                      │  │
│  │ [✓] Research best practices                         │  │
│  │ [✓] Create entity relationship diagram              │  │
│  │ [⏳] Design users table                             │  │
│  │ [ ] Design sessions table                           │  │
│  │                                    [+ Add Subtask]   │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  [✨ Break down with AI]                                     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Activity                                              │  │
│  │                                                      │  │
│  │ @alice  Started this task                 2 hours ago │  │
│  │ @bob    Requested review                  5 hours ago │  │
│  │ @system Task created                       1 day ago  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Comments                                              │  │
│  │                                                      │  │
│  │ @alice  What do you think about using UUIDs?    2h  │  │
│  │ @bob    I think that's a good idea.             1h  │  │
│  │                                                      │  │
│  │ [Add a comment...]                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Specification

#### Header Section

```jsx
<div className="container mx-auto py-8 px-4">
  {/* Breadcrumb */}
  <Link
    href="/epics/123/tasks"
    className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
  >
    <ArrowLeft className="mr-2 h-4 w-4" />
    Back to Tasks
  </Link>

  {/* Title + Status + Actions */}
  <div className="mb-6 flex items-start justify-between">
    <div className="flex-1">
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{task.title}</h1>
        <StatusBadge status={task.status} />
        <PriorityBadge priority={task.priority} />
      </div>
      {task.blocked && task.blockReason && (
        <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <span>Blocked: {task.blockReason}</span>
        </div>
      )}
    </div>
    <div className="flex gap-2">
      <Button variant="outline" onClick={() => router.push(`/tasks/${task.id}/edit`)}>
        <Edit className="mr-2 h-4 w-4" />
        Edit
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleStatusChange('IN_PROGRESS')}>
            <PlayCircle className="mr-2 h-4 w-4" />
            Start Task
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusChange('IN_REVIEW')}>
            <GitMerge className="mr-2 h-4 w-4" />
            Request Review
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStatusChange('DONE')}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Mark Done
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </div>

  {/* Metadata */}
  <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 rounded-lg border bg-card p-4">
    <div>
      <span className="text-sm text-muted-foreground">Assignee:</span>
      <div className="mt-1 flex items-center gap-2">
        {task.assignee ? (
          <>
            <Avatar className="h-6 w-6">
              <AvatarImage src={task.assignee.avatar} alt={task.assignee.name} />
              <AvatarFallback className="text-xs">
                {task.assignee.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{task.assignee.name}</span>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">Unassigned</span>
        )}
      </div>
    </div>
    <div>
      <span className="text-sm text-muted-foreground">Due Date:</span>
      <div className="mt-1">
        {task.dueDate ? (
          <span className={`text-sm font-medium ${
            new Date(task.dueDate) < new Date() && task.status !== 'DONE'
              ? 'text-destructive'
              : ''
          }`}>
            {new Date(task.dueDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        )}
      </div>
    </div>
    <div>
      <span className="text-sm text-muted-foreground">Epic:</span>
      <div className="mt-1">
        <Link
          href={`/epics/${task.epic.id}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          {task.epic.title}
        </Link>
      </div>
    </div>
    <div>
      <span className="text-sm text-muted-foreground">Time Tracking:</span>
      <div className="mt-1 text-sm">
        <span className="font-medium">{task.estimatedHours || 0}h</span>
        <span className="text-muted-foreground"> estimated</span>
        {task.actualHours !== undefined && (
          <>
            <span className="text-muted-foreground"> · </span>
            <span className="font-medium">{task.actualHours}h</span>
            <span className="text-muted-foreground"> actual</span>
          </>
        )}
      </div>
    </div>
    <div className="md:col-span-2 lg:col-span-4">
      <div className="flex gap-6 text-sm text-muted-foreground">
        <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
        <span>Updated {new Date(task.updatedAt).toLocaleDateString()}</span>
      </div>
    </div>
  </div>
</div>
```

**Components Needed**:
- `Copy` icon from lucide-react
- `PlayCircle`, `GitMerge`, `CheckCircle2` from lucide-react

**Spacing**:
- Title to status: `gap-3` (12px)
- Title section to metadata: `mb-6` (24px)
- Metadata to content: `mb-8` (32px)
- Metadata grid: `gap-4` (16px)

#### Description Card

```jsx
<div className="mb-6 rounded-lg border bg-card p-6">
  <h2 className="mb-4 text-lg font-semibold">Description</h2>
  <div className="prose prose-sm max-w-none text-sm">
    {task.description ? (
      <p>{task.description}</p>
    ) : (
      <p className="text-muted-foreground italic">No description provided.</p>
    )}
  </div>
</div>
```

**Spacing**:
- Card padding: `p-6` (24px)
- Title to content: `mb-4` (16px)
- Margin bottom: `mb-6` (24px)

#### Dependencies Section

```jsx
{(task.blocks.length > 0 || task.blockedBy.length > 0) && (
  <div className="mb-6 rounded-lg border bg-card p-6">
    <h2 className="mb-4 text-lg font-semibold">Dependencies</h2>

    {task.blocks.length > 0 && (
      <div className="mb-4">
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">
          Blocks ({task.blocks.length})
        </h3>
        <div className="space-y-2">
          {task.blocks.map(dep => (
            <Link
              key={dep.id}
              href={`/tasks/${dep.id}`}
              className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 p-3 hover:bg-orange-100 dark:border-orange-900/30 dark:bg-orange-950/20 dark:hover:bg-orange-950/30"
            >
              <ArrowRight className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <div className="flex-1">
                <div className="font-medium text-sm">{dep.title}</div>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={dep.status} />
                  {dep.blocked && (
                    <span className="text-xs text-destructive">Blocked</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    )}

    {task.blockedBy.length > 0 && (
      <div>
        <h3 className="mb-2 text-sm font-medium text-muted-foreground">
          Blocked by ({task.blockedBy.length})
        </h3>
        <div className="space-y-2">
          {task.blockedBy.map(dep => (
            <Link
              key={dep.id}
              href={`/tasks/${dep.id}`}
              className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 hover:bg-blue-100 dark:border-blue-900/30 dark:bg-blue-950/20 dark:hover:bg-blue-950/30"
            >
              <ArrowLeft className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <div className="flex-1">
                <div className="font-medium text-sm">{dep.title}</div>
                <div className="flex items-center gap-2 mt-1">
                  <StatusBadge status={dep.status} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    )}
  </div>
)}
```

**Visual Indicators**:
- Blocks task: Orange/right arrow (→)
- Blocked by: Blue/left arrow (←)
- Hover state for interactivity

#### Subtasks Section

```jsx
{task.subtasks && task.subtasks.length > 0 && (
  <div className="mb-6 rounded-lg border bg-card p-6">
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold">
        Subtasks ({task.subtasks.filter(s => s.status === 'DONE').length}/{task.subtasks.length})
      </h2>
      <Button variant="outline" size="sm">
        <Plus className="mr-2 h-4 w-4" />
        Add Subtask
      </Button>
    </div>

    <div className="space-y-2">
      {task.subtasks.map(subtask => (
        <div
          key={subtask.id}
          className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors"
        >
          <button
            onClick={() => toggleSubtask(subtask.id)}
            className="flex-shrink-0"
            aria-label={subtask.status === 'DONE' ? 'Mark incomplete' : 'Mark complete'}
          >
            {subtask.status === 'DONE' ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground" />
            )}
          </button>
          <span className={`flex-1 text-sm ${
            subtask.status === 'DONE' ? 'line-through text-muted-foreground' : ''
          }`}>
            {subtask.title}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/subtasks/${subtask.id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => deleteSubtask(subtask.id)}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>

    {/* Progress bar */}
    <div className="mt-4">
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all"
          style={{
            width: `${(task.subtasks.filter(s => s.status === 'DONE').length / task.subtasks.length) * 100}%`
          }}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {Math.round((task.subtasks.filter(s => s.status === 'DONE').length / task.subtasks.length) * 100)}% complete
      </p>
    </div>
  </div>
)}
```

**Components**:
- `CheckCircle2`, `Circle` icons from lucide-react
- Interactive checkboxes
- Progress bar visualization

#### AI Breakdown Button

```jsx
<div className="mb-6">
  <Button
    variant="default"
    className="w-full"
    onClick={handleAIBreakdown}
    disabled={isBreakingDown}
  >
    <Sparkles className="mr-2 h-4 w-4" />
    Break down with AI
  </Button>
  {isBreakingDown && (
    <div className="mt-4 rounded-lg border border-primary/50 bg-primary/5 p-4">
      <div className="flex items-center gap-3">
        <div className="h-5 w-5 animate-pulse rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-sm font-medium">AI is analyzing your task...</span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        This may take a few moments.
      </p>
    </div>
  )}
</div>
```

**Animation**:
- Pulse animation for "thinking" state
- Loading spinner with border animation

#### Activity Timeline

```jsx
<div className="mb-6 rounded-lg border bg-card p-6">
  <h2 className="mb-4 text-lg font-semibold">Activity</h2>

  <div className="space-y-4">
    {activity.map((item, index) => (
      <div key={item.id} className="flex gap-3">
        <div className="flex flex-col items-center">
          <Avatar className="h-8 w-8">
            <AvatarImage src={item.actor.avatar} alt={item.actor.name} />
            <AvatarFallback className="text-xs">
              {item.actor.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {index < activity.length - 1 && (
            <div className="w-0.5 flex-1 bg-border mt-2" />
          )}
        </div>
        <div className="flex-1 pb-4">
          <p className="text-sm">
            <span className="font-medium">{item.actor.name}</span>{' '}
            <span className="text-muted-foreground">{item.action}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatRelativeTime(item.timestamp)}
          </p>
        </div>
      </div>
    ))}
  </div>
</div>
```

**Components**:
- Vertical timeline with connector lines
- Relative time formatting ("2 hours ago")

#### Comments Section

```jsx
<div className="rounded-lg border bg-card p-6">
  <h2 className="mb-4 text-lg font-semibold">Comments ({comments.length})</h2>

  {/* Comment list */}
  <div className="mb-4 space-y-4">
    {comments.map(comment => (
      <div key={comment.id} className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
          <AvatarFallback className="text-xs">
            {comment.author.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 rounded-lg bg-muted/50 p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm">{comment.author.name}</span>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(comment.createdAt)}
            </span>
          </div>
          <p className="text-sm">{comment.content}</p>
        </div>
      </div>
    ))}
  </div>

  {/* Add comment */}
  <div className="flex gap-3">
    <Avatar className="h-8 w-8">
      <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
      <AvatarFallback className="text-xs">
        {currentUser.name.charAt(0)}
      </AvatarFallback>
    </Avatar>
    <div className="flex-1">
      <Textarea
        placeholder="Add a comment..."
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        rows={3}
        className="mb-2"
      />
      <div className="flex justify-end">
        <Button
          onClick={handleAddComment}
          disabled={!newComment.trim() || isSubmitting}
        >
          Post Comment
        </Button>
      </div>
    </div>
  </div>
</div>
```

**Components**:
- `Textarea` (new)
- Auto-expanding textarea preferred
- Markdown support (optional)

---

## 3. Task Create/Edit Form

### Purpose
Create new tasks or edit existing tasks with validation and clear affordances.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [← Back to Tasks]                                           │
│                                                              │
│  Create New Task                                            │
│  Fill in the details below to create a new task.            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Title *                                              │  │
│  │ [Enter task title_________________________]           │  │
│  │                                                      │  │
│  │ Description                                          │  │
│  │ [Enter task description_________________]            │  │
│  │ [                                              ]      │  │
│  │                                                      │  │
│  │ Status           Priority                            │  │
│  │ [To Do        ▼] [Medium        ▼]                  │  │
│  │                                                      │  │
│  │ Assignee         Due Date                            │  │
│  │ [@alice      ▼] [Apr 5, 2026   📅]                  │  │
│  │                                                      │  │
│  │ Epic                                                    │  │
│  │ [Build Auth System                     ▼]            │  │
│  │                                                      │  │
│  │ Estimated Hours                                       │  │
│  │ [4                              ] h                  │  │
│  │                                                      │  │
│  │ Dependencies                                          │  │
│  │ [+ Add Dependency]                                    │  │
│  │                                                      │  │
│  │ Subtasks                                               │  │
│  │ [+ Add Subtask]                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  [Cancel]                              [Create Task]        │
└─────────────────────────────────────────────────────────────┘
```

### Specification

#### Header Section

```jsx
<div className="container mx-auto py-8 px-4 max-w-3xl">
  <Link
    href="/epics/123/tasks"
    className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
  >
    <ArrowLeft className="mr-2 h-4 w-4" />
    Back to Tasks
  </Link>

  <div className="mb-8">
    <h1 className="text-3xl font-bold tracking-tight">
      {isEdit ? 'Edit Task' : 'Create New Task'}
    </h1>
    <p className="text-muted-foreground">
      {isEdit
        ? 'Update the task details below.'
        : 'Fill in the details below to create a new task.'}
    </p>
  </div>
</div>
```

#### Form

```jsx
<form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
  {/* Title */}
  <div className="space-y-2">
    <Label htmlFor="title">
      Title <span className="text-destructive">*</span>
    </Label>
    <Input
      id="title"
      value={formData.title}
      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      placeholder="Enter task title"
      required
      className={errors.title ? 'border-destructive' : ''}
    />
    {errors.title && (
      <p className="text-sm text-destructive">{errors.title}</p>
    )}
  </div>

  {/* Description */}
  <div className="space-y-2">
    <Label htmlFor="description">Description</Label>
    <Textarea
      id="description"
      value={formData.description}
      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      placeholder="Enter task description"
      rows={4}
    />
    <p className="text-xs text-muted-foreground">
      You can use Markdown to format your description.
    </p>
  </div>

  {/* Two column layout */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Status */}
    <div className="space-y-2">
      <Label htmlFor="status">Status</Label>
      <Select
        value={formData.status}
        onValueChange={(value) => setFormData({ ...formData, status: value as TaskStatus })}
      >
        <SelectTrigger id="status">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="TODO">To Do</SelectItem>
          <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
          <SelectItem value="IN_REVIEW">In Review</SelectItem>
          <SelectItem value="DONE">Done</SelectItem>
          <SelectItem value="BLOCKED">Blocked</SelectItem>
        </SelectContent>
      </Select>
    </div>

    {/* Priority */}
    <div className="space-y-2">
      <Label htmlFor="priority">Priority</Label>
      <Select
        value={formData.priority}
        onValueChange={(value) => setFormData({ ...formData, priority: value as Priority })}
      >
        <SelectTrigger id="priority">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="CRITICAL">Critical</SelectItem>
          <SelectItem value="HIGH">High</SelectItem>
          <SelectItem value="MEDIUM">Medium</SelectItem>
          <SelectItem value="LOW">Low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>

  {/* Two column layout */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Assignee */}
    <div className="space-y-2">
      <Label htmlFor="assignee">Assignee</Label>
      <Select
        value={formData.assigneeId || ''}
        onValueChange={(value) => setFormData({ ...formData, assigneeId: value || null })}
      >
        <SelectTrigger id="assignee">
          <SelectValue placeholder="Unassigned" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Unassigned</SelectItem>
          {assignees.map(assignee => (
            <SelectItem key={assignee.id} value={assignee.id}>
              <div className="flex items-center gap-2">
                <Avatar className="h-4 w-4">
                  <AvatarFallback className="text-[10px]">
                    {assignee.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                {assignee.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* Due Date */}
    <div className="space-y-2">
      <Label htmlFor="dueDate">Due Date</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !formData.dueDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formData.dueDate ? (
              new Date(formData.dueDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={formData.dueDate ? new Date(formData.dueDate) : undefined}
            onSelect={(date) =>
              setFormData({ ...formData, dueDate: date?.toISOString() })
            }
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  </div>

  {/* Epic */}
  <div className="space-y-2">
    <Label htmlFor="epic">Epic</Label>
    <Select
      value={formData.epicId}
      onValueChange={(value) => setFormData({ ...formData, epicId: value })}
    >
      <SelectTrigger id="epic">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {epics.map(epic => (
          <SelectItem key={epic.id} value={epic.id}>
            {epic.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>

  {/* Estimated Hours */}
  <div className="space-y-2">
    <Label htmlFor="estimatedHours">Estimated Hours</Label>
    <div className="flex items-center gap-2">
      <Input
        id="estimatedHours"
        type="number"
        min="0"
        step="0.5"
        value={formData.estimatedHours || ''}
        onChange={(e) =>
          setFormData({
            ...formData,
            estimatedHours: e.target.value ? parseFloat(e.target.value) : null
          })
        }
        placeholder="4"
        className="max-w-[200px]"
      />
      <span className="text-sm text-muted-foreground">hours</span>
    </div>
  </div>

  {/* Blocked Reason (conditional) */}
  {formData.status === 'BLOCKED' && (
    <div className="space-y-2">
      <Label htmlFor="blockReason">
        Block Reason <span className="text-destructive">*</span>
      </Label>
      <Textarea
        id="blockReason"
        value={formData.blockReason || ''}
        onChange={(e) => setFormData({ ...formData, blockReason: e.target.value })}
        placeholder="Explain why this task is blocked..."
        rows={2}
        required={formData.status === 'BLOCKED'}
      />
    </div>
  )}

  {/* Dependencies (simplified for MVP) */}
  <div className="space-y-2">
    <Label>Dependencies</Label>
    <p className="text-sm text-muted-foreground">
      You can add dependencies after creating the task.
    </p>
  </div>

  {/* Subtasks (simplified for MVP) */}
  <div className="space-y-2">
    <Label>Subtasks</Label>
    <p className="text-sm text-muted-foreground">
      You can add subtasks after creating the task.
    </p>
  </div>

  {/* Actions */}
  <div className="flex items-center justify-end gap-3 pt-4 border-t">
    <Button
      type="button"
      variant="outline"
      onClick={() => router.back()}
      disabled={isSubmitting}
    >
      Cancel
    </Button>
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting ? (
        <>
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
          {isEdit ? 'Saving...' : 'Creating...'}
        </>
      ) : (
        isEdit ? 'Save Changes' : 'Create Task'
      )}
    </Button>
  </div>
</form>
```

**Components Needed**:
- `Input` (new)
- `Textarea` (new)
- `Label` (new)
- `Select` components (from task list)
- `Popover` (new)
- `Calendar` (new) - from date library
- `CalendarIcon` from lucide-react

**Form Validation**:
- Title: required, max 200 chars
- Block Reason: required when status is BLOCKED
- Estimated Hours: must be positive number if provided

**States**:
- Loading state during submission
- Error messages display
- Success: redirect to task detail

---

## Responsive Design

### Mobile (< 768px)

**Task List Page**:
- Table transforms to card layout
- Filters collapse into accordions
- Pagination simplifies

**Task Detail Page**:
- Metadata grid becomes single column
- Comments section full width
- Activity timeline simplified

**Task Form**:
- All fields stack vertically
- Two-column layouts become single column

### Tablet (768px - 1024px)

**Task List Page**:
- Table stays, but may need horizontal scroll
- Filters wrap

**Task Detail Page**:
- Metadata 2 columns instead of 4

**Task Form**:
- Two-column layouts stay

---

## Accessibility Checklist

### Task List Page
- [ ] Filter selects have proper labels
- [ ] Table headers have scope attributes
- [ ] Sortable columns have aria-sort attributes
- [ ] Action dropdowns have aria-label
- [ ] Pagination buttons have descriptive labels
- [ ] Status badges have aria-label

### Task Detail Page
- [ ] All interactive elements are keyboard accessible
- [ ] Comments section uses aria-live for new comments
- [ ] Subtask checkboxes have proper labels
- [ ] Progress bar has aria-valuenow
- [ ] AI breakdown button has loading state announced

### Task Form
- [ ] All fields have associated labels
- [ ] Required fields marked with aria-required
- [ ] Error fields have aria-describedby
- [ ] Validation errors announced to screen readers
- [ ] Form submission state announced

---

## Components Needed Summary

### New Components to Build

1. **Form Components** (High Priority)
   - `Input`
   - `Textarea`
   - `Label`
   - `Select` (and SelectTrigger, SelectContent, SelectItem)

2. **Navigation Components** (High Priority)
   - `DropdownMenu` (and DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator)

3. **Feedback Components** (High Priority)
   - `AlertDialog` (for confirmations)
   - `Toast` (for notifications)

4. **Data Display Components** (Medium Priority)
   - `Avatar` (and AvatarImage, AvatarFallback)
   - `Popover`
   - `Calendar`

5. **Other Components** (Low Priority)
   - `Tabs` (optional, for alternative layouts)
   - `Command` (optional, for advanced search/filter)

---

## Implementation Order

1. **Phase 1**: Form components (Input, Textarea, Label, Select)
2. **Phase 2**: DropdownMenu and Avatar components
3. **Phase 3**: Task List page (uses existing DataTable)
4. **Phase 4**: Task Detail page (most complex)
5. **Phase 5**: Task Create/Edit form
6. **Phase 6**: AlertDialog and Toast components
7. **Phase 7**: Popover and Calendar for date picker
8. **Phase 8**: Accessibility audit and fixes
9. **Phase 9**: Responsive design improvements

---

**Mockup Designer**: UI/UX Designer
**Date**: 2026-04-01
**Version**: 1.0
**Status**: Ready for Frontend Implementation
