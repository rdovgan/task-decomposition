# Task Detail Page Design

## Overview

The Task Detail Page displays comprehensive information about a single task, including its metadata, relationships, and collaborative features.

## Layout Structure

### Information Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│  Header Section                                              │
│  ├─ Task ID, Status Badge, Priority Badge                   │
│  ├─ Title (H1)                                               │
│  ├─ Breadcrumb: Project > Epic > Task                       │
│  └─ Action Buttons: Edit | Delete | Duplicate               │
├─────────────────────────────────────────────────────────────┤
│  Main Content Grid (2 columns)                              │
│  ├─ Left Column (65%)                                       │
│  │   ├─ Description Section                                 │
│  │   ├─ Metadata Grid (dates, estimates, assignee)         │
│  │   ├─ Dependencies Section                                │
│  │   └─ Comments Section                                    │
│  └─ Right Column (35%)                                      │
│      ├─ Status Management Card                              │
│      ├─ Time Tracking Card                                  │
│      └─ Quick Actions Card                                  │
└─────────────────────────────────────────────────────────────┘
```

### Section Breakdown

#### Header Section

**Height:** 120px (desktop) / 180px (mobile)

**Components:**
- **Status Badge**: Top-left, size `default` (uses existing StatusBadge component)
- **Priority Badge**: Next to status, size `default` (uses existing PriorityBadge component)
- **Task Identifier**: Small, muted text: `DOV-42`
- **Title**: H1, 28px, font-semibold, margin-top: 8px
- **Breadcrumb**: Text-sm, muted-foreground, margin-top: 8px
  ```
  Project Name / Epic Title / Task
  ```
- **Action Buttons**: Right-aligned, button group
  - Edit: `default` variant, `sm` size, with icon
  - Delete: `destructive` variant, `sm` size, with icon
  - Duplicate: `outline` variant, `sm` size, with icon

#### Left Column - Description Section

**Height:** Auto, min-height: 200px

**Content:**
- **Section Title**: "Description", text-lg, font-semibold, margin-bottom: 12px
- **Description Body**: Prose markdown-rendered content, text-sm, leading-relaxed
- **Empty State**: If no description
  - Icon: FileText icon in muted-foreground
  - Text: "No description provided"
  - Action: "Add Description" button (ghost variant)

#### Left Column - Metadata Grid

**Layout:** 2-column grid, gap: 16px

**Fields:**
| Field | Label | Display Format | Empty State |
|-------|-------|----------------|-------------|
| Assignee | "Assigned to" | Avatar + Name + Email | "Unassigned" (muted) |
| Status | "Status" | Status Badge component | - |
| Priority | "Priority" | Priority Badge component | - |
| Story Points | "Story Points" | Number (1-13) | "—" |
| Est. Hours | "Estimated" | "X hours" | "—" |
| Actual Hours | "Actual" | "X hours" | "—" |
| Start Date | "Start Date" | "MMM DD, YYYY" | "—" |
| Due Date | "Due Date" | "MMM DD, YYYY" | "—" |
| Created | "Created" | "MMM DD, YYYY by {name}" | - |
| Updated | "Updated" | "MMM DD, YYYY at HH:MM" | - |

**Field Item Layout:**
```
┌─────────────────┐
│  Label          │  text-xs, muted-foreground, uppercase, font-medium
│  Value          │  text-sm, font-medium
└─────────────────┘
```

#### Left Column - Dependencies Section

**Height:** Auto

**Content:**
- **Section Title**: "Dependencies", text-lg, font-semibold, margin-bottom: 12px
- **Add Dependency Button**: Top-right, `sm` size, `outline` variant, with plus icon
- **Dependencies List**: Stacked cards
  - **Blocking Tasks** (tasks that block this task)
    - Label: "Blocked by", text-xs, font-medium, text-destructive
    - List items: Task title + status badge + link icon
  - **Blocked Tasks** (tasks that this task blocks)
    - Label: "Blocking", text-xs, font-medium, text-muted-foreground
    - List items: Task title + status badge + link icon

**Dependency Card:**
```
┌─────────────────────────────────────────┐
│  [Status] Task Title              [→]  │
│  Epic: Parent Epic Name                  │
└─────────────────────────────────────────┘
```

#### Left Column - Comments Section

**Height:** Auto, min-height: 300px

**Content:**
- **Section Title**: "Comments", text-lg, font-semibold, margin-bottom: 12px
- **Comment Thread**: Reverse chronological (newest first)
- **Comment Form**: Bottom, sticky (uses existing CommentForm component)
- **Empty State**: If no comments
  - Icon: MessageSquare icon in muted-foreground
  - Text: "No comments yet. Start the discussion!"
  - Subtext: "Use @mentions to notify team members"

**Comment Item:**
```
┌─────────────────────────────────────────┐
│  [Avatar] Name          Time    [Edit]  │
│  Comment content (markdown rendered)    │
│  [Edited indicator if applicable]       │
└─────────────────────────────────────────┘
```

#### Right Column - Status Management Card

**Height:** Auto

**Style:** Card component with padding: 16px

**Content:**
- **Card Title**: "Change Status", text-sm, font-semibold, margin-bottom: 12px
- **Status Dropdown**: Full-width select, styled button
  - Shows current status badge
  - Click to expand dropdown with all valid status transitions
  - Keyboard navigation: Arrow keys, Enter to select
- **Current Workflow**:
  ```
  TODO → IN_PROGRESS → IN_REVIEW → DONE
              ↓
          BLOCKED → IN_PROGRESS
  ```
- **Last Update**: Text-xs, muted-foreground, margin-top: 8px
  - Format: "Changed by {name} at {timestamp}"

#### Right Column - Time Tracking Card

**Height:** Auto

**Style:** Card component with padding: 16px

**Content:**
- **Card Title**: "Time Tracking", text-sm, font-semibold, margin-bottom: 12px
- **Hours Summary**:
  - **Estimated**: Text-2xl, font-bold, primary color
  - **Actual**: Text-2xl, font-bold, muted-foreground
  - **Remaining**: Text-sm, calculated (est. - actual), color-coded
    - Positive: green (under estimate)
    - Zero: gray (on track)
    - Negative: red (over estimate)
- **Log Time Button**: Full-width, `default` variant, with clock icon
- **Time Log History**: List of recent entries (max 5)
  - Format: "{name} logged Xh on {date}"
  - Truncate with "View all" link if more

#### Right Column - Quick Actions Card

**Height:** Auto

**Style:** Card component with padding: 16px

**Content:**
- **Card Title**: "Quick Actions", text-sm, font-semibold, margin-bottom: 12px
- **Action List**: Vertical stack of buttons, `ghost` variant, `sm` size
  - Copy task ID
  - Copy task link
  - Mark as done (if not DONE)
  - Request review (if IN_PROGRESS)
  - Log time
  - Add comment
  - Add dependency
  - View dependency graph (if dependencies exist)

## State Variations

### Loading State

**Skeleton Loader:**
- Header: 3 skeleton bars (status/title, breadcrumb, actions)
- Left column: 3 skeleton cards (description, metadata, dependencies)
- Right column: 2 skeleton cards (status, time tracking)
- Animation: Pulse effect, 1.5s duration

### Error State

**Error Display:**
- Full-page error component with:
  - Icon: AlertCircle in destructive color
  - Title: "Failed to load task"
  - Message: Error details from API
  - Actions: Retry button, Go back button

### Empty State

**No Task Found (404):**
- Icon: Search in muted-foreground
  - Title: "Task not found"
  - Message: "The task you're looking for doesn't exist or you don't have permission to view it."
  - Actions: Browse tasks, Go to dashboard

## Responsive Breakpoints

### Desktop (≥1024px)

**Layout:** 2-column grid, 65/35 split
**Header:** Full-width, actions aligned right
**Metadata:** 2-column grid
**Comments:** Full width in left column

### Tablet (768px - 1023px)

**Layout:** 2-column grid, 60/40 split
**Header:** Stack status/badges on small screens
**Metadata:** 2-column grid (maintained)
**Comments:** Full width in left column

### Mobile (≤767px)

**Layout:** Single column, stacked
**Header:**
- Status/badges stack vertically
- Title remains H1 but reduces to 24px
- Actions: Icon-only buttons (3 dots menu)
**Metadata:** Single column, all fields stacked
**Dependencies:** Accordion style (tap to expand)
**Comments:** Full width, form inline (not sticky)

## Interaction Patterns

### Status Change

1. User clicks status dropdown
2. Dropdown expands with valid transitions
3. User selects new status
4. Confirmation dialog for critical transitions (TODO → DONE, IN_PROGRESS → CANCELLED)
5. Status updates immediately with optimistic UI
6. System comment added: "{name} changed status from X to Y"
7. Notification sent to assignee if changed by someone else

### Edit Task

1. User clicks "Edit" button
2. Task modal opens in edit mode (pre-populated)
3. User makes changes
4. User clicks "Update" or presses Ctrl+Enter
5. Modal closes with success animation
6. Page refreshes with updated data
7. Success toast notification

### Delete Task

1. User clicks "Delete" button
2. Confirmation modal appears
3. Modal shows task title and warning
4. If task has dependencies, show error: "Cannot delete task with X dependent tasks"
5. User confirms
6. Task deleted
7. Redirect to Epic detail page
8. Success toast: "Task deleted successfully"

### Duplicate Task

1. User clicks "Duplicate" button
2. Loading spinner shows briefly
3. New task created with "Copy of " prefix
4. Redirect to new task detail page
5. Info toast: "Task duplicated. Update details as needed."

## Accessibility Guidelines

### Keyboard Navigation

- **Tab Order**: Status badge → Title → Edit button → Delete button → Duplicate button → Description → Metadata fields → Dependencies → Comments → Status card → Time card → Actions card
- **Focus Indicators**: 2px ring on focus, ring-offset-2
- **Skip Links**: "Skip to main content" link on page load

### Screen Reader Support

- **ARIA Labels**: All buttons have descriptive labels
- **Live Regions**: Comments section uses aria-live for real-time updates
- **Status Announcements**: Status changes announced via aria-live
- **Semantic HTML**: Proper heading hierarchy (H1 → H2 → H3)

### Color Contrast

- All text meets WCAG AA (4.5:1 for normal text, 3:1 for large text)
- Status badges: Ensure background/text contrast meets AA
- Focus indicators: Visible on all backgrounds

### Touch Targets

- Minimum touch target size: 44x44px (mobile)
- Spacing between interactive elements: 8px minimum

## Design Tokens

### Colors

```css
/* Status Colors (from existing StatusBadge) */
--color-todo-bg: #f3f4f6;
--color-todo-text: #6b7280;
--color-in-progress-bg: #dbeafe;
--color-in-progress-text: #1e40af;
--color-in-review-bg: #f3e8ff;
--color-in-review-text: #6b21a8;
--color-done-bg: #dcfce7;
--color-done-text: #166534;
--color-blocked-bg: #fee2e2;
--color-blocked-text: #991b1b;
--color-cancelled-bg: #fee2e2;
--color-cancelled-text: #991b1b;

/* Priority Colors (from existing PriorityBadge) */
--color-critical-bg: #fecaca;
--color-critical-text: #991b1b;
--color-high-bg: #fed7aa;
--color-high-text: #9a3412;
--color-medium-bg: #fef9c3;
--color-medium-text: #854d0e;
--color-low-bg: #dbeafe;
--color-low-text: #1e40af;

/* Spacing */
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 16px;
--spacing-lg: 24px;
--spacing-xl: 32px;

/* Typography */
--font-size-xs: 12px;
--font-size-sm: 14px;
--font-size-base: 16px;
--font-size-lg: 18px;
--font-size-xl: 20px;
--font-size-2xl: 24px;
--font-size-3xl: 28px;
```

### Typography

- **Font Family**: System font stack (Inter/San Francisco/Segoe UI)
- **Line Height**: 1.5 for body text, 1.2 for headings
- **Font Weights**: Normal (400), Medium (500), Semibold (600), Bold (700)

## Implementation Notes

### Component Usage

- **Status Badge**: Use existing `StatusBadge` component from `src/components/ui/status-badge.tsx`
- **Priority Badge**: Use existing `PriorityBadge` component from `src/components/ui/priority-badge.tsx`
- **Button**: Use existing `Button` component from `src/components/ui/button.tsx`
- **Dialog**: Use existing `Dialog` component for modals
- **Comments**: Use existing `CommentList` and `CommentForm` components
- **Dependencies**: Use existing `DependencyManager` component

### Data Fetching

- Fetch task data on mount
- Implement optimistic UI for status changes
- Handle loading/error states with proper feedback
- Implement refetch on window focus for real-time updates

### Performance

- Implement lazy loading for comments (pagination: 20 per page)
- Use React.memo for comment items
- Virtualize comment list if > 50 comments
- Debounce status change API calls (300ms)

## Related Components

- Task Modal: [designs/task-modal.md](designs/task-modal.md)
- Status Badge: [designs/status-badge.md](designs/status-badge.md)
- Epic Task List: [designs/epic-task-list.md](designs/epic-task-list.md)
- Assignee Dropdown: [designs/assignee-dropdown.md](designs/assignee-dropdown.md)
