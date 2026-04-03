# Epic Task List Design

## Overview

The Epic Task List displays all tasks within an Epic, providing sorting, filtering, bulk actions, and quick access to task details.

## Layout Decision

### Layout Type: Cards (Recommended)

**Rationale**: Cards provide better visual hierarchy, accommodate more metadata, and work better on mobile than tables.

**Comparison**:

| Aspect | Cards | Table |
|--------|-------|-------|
| Mobile UX | ✅ Stack vertically | ❌ Requires horizontal scroll |
| Information Density | ⚠️ Less dense | ✅ More dense |
| Visual Hierarchy | ✅ Clear sections | ⚠️ Flat structure |
| Metadata Display | ✅ Flexible layout | ❌ Limited columns |
| Scanability | ✅ Grouped by sections | ⚠️ Requires row tracking |
| Bulk Selection | ✅ Checkbox per card | ✅ Checkbox per row |

**Decision**: Use **cards** as the primary layout, with optional table view as a user preference toggle.

## List Layout Structure

### Header Section

**Height**: Auto, min 80px

**Components**:

```
┌─────────────────────────────────────────────────────────────┐
│  Epic Tasks (12)                  [View: Cards ▾] [Add Task]│
├─────────────────────────────────────────────────────────────┤
│  [Search] [Status ▾] [Assignee ▾] [Priority ▾] [Clear]    │
└─────────────────────────────────────────────────────────────┘
```

**Elements**:

1. **Section Title**: "Epic Tasks", text-2xl, font-semibold
   - Count badge: `(12)` in muted-foreground, text-lg

2. **View Toggle**: Button group, outline variant, sm size
   - Options: Cards (default), Table
   - Icon: LayoutGrid for Cards, Table for Table
   - Persist preference in localStorage

3. **Add Task Button**: Default variant, sm size
   - Icon: Plus icon
   - Label: "Add Task"
   - Opens task modal in create mode (epic pre-selected)

4. **Filter Bar**: Full-width flex container
   - **Search**: Text input, left-aligned, flex-grow
     - Placeholder: "Search tasks..."
     - Debounce: 300ms
     - Clear button: Show "×" when has text
   - **Status Filter**: Select dropdown
     - Default: "All Statuses"
     - Multi-select: Allow selecting multiple statuses
     - Show badge count: `(3)` when filtered
   - **Assignee Filter**: Select dropdown with search
     - Default: "All Assignees"
     - Multi-select: Allow selecting multiple users
     - Show badge count: `(2)` when filtered
   - **Priority Filter**: Select dropdown
     - Default: "All Priorities"
     - Multi-select: Allow selecting multiple priorities
     - Show badge count: `(4)` when filtered
   - **Clear Filters Button**: Ghost variant, sm size
     - Icon: X icon
     - Label: "Clear"
     - Disabled: When no active filters
     - Clears all filters and resets list

### Task Cards Layout

**Grid**: Responsive grid, gap: 16px
- Desktop (≥1024px): 3 columns
- Tablet (768px - 1023px): 2 columns
- Mobile (≤767px): 1 column

**Card Height**: Auto, min 180px

**Card Structure**:

```
┌─────────────────────────────────────────────────────────┐
│  [ ] [Priority] [Status]           [Actions ⋮]         │
│  Task Title                                            │
│  DOV-42 • Assigned to: [Avatar] Name                   │
│  ─────────────────────────────────────────────────────  │
│  Story Points: 3 | Est: 4h | Due: Apr 5                │
│  Dependencies: 2 blocking, 1 blocked                   │
└─────────────────────────────────────────────────────────┘
```

**Card Components**:

1. **Bulk Checkbox**: Top-left, square checkbox
   - Select card for bulk actions
   - Visual feedback: Selected cards have border-ring

2. **Priority Badge**: Top-left, next to checkbox, compact size
   - Uses existing PriorityBadge component
   - Size: Compact

3. **Status Badge**: Top-left, next to priority, compact size
   - Uses existing StatusBadge component
   - Size: Compact
   - Interactive: Click to change status (future)

4. **Actions Menu**: Top-right, icon button, ghost variant, icon-sm size
   - Icon: MoreVertical (3 dots)
   - Dropdown menu:
     - View Details
     - Edit
     - Duplicate
     - Delete
     - Add Dependency
     - Mark as Done (if not done)
   - Keyboard: Arrow keys, Enter to select, Escape to close

5. **Task Title**: Text-base, font-semibold, line-clamp-2
   - Max 2 lines, truncate with ellipsis
   - Hover: Underline, cursor pointer
   - Click: Navigate to task detail page

6. **Task ID**: Text-sm, muted-foreground
   - Format: `{identifier}-{number}` (e.g., DOV-42)
   - Click: Copy task ID to clipboard

7. **Assignee**: Flex row, items-center, gap-1
   - Avatar: 20px, rounded-full
   - Name: Text-sm, truncate with max-width: 100px
   - Empty: "Unassigned" in muted-foreground

8. **Divider**: Horizontal rule, border-muted

9. **Metadata Row**: Flex row, gap-2, text-xs
   - **Story Points**: "SP: 3"
   - **Estimated Hours**: "Est: 4h"
   - **Due Date**: "Due: Apr 5" in orange if overdue
   - Empty fields show as "—" (em dash)

10. **Dependencies Row** (if any): Flex row, gap-1, text-xs
    - **Blocking**: "🔒 2 blocking" in destructive color
    - **Blocked**: "🔗 1 blocked" in muted-foreground
    - Click: Scroll to or highlight related tasks

### Table View Layout (Optional)

**Structure**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [ ] | Title | Status | Priority | Assignee | Story Points | Est. Hours | Due │
├─────────────────────────────────────────────────────────────────────────────┤
│  [ ] | Task Title | [Status] | [Priority] | [Avatar] Name | 3 | 4h | Apr 5 │
│  [ ] | Task Title | [Status] | [Priority] | [Avatar] Name | 5 | 8h | Apr 7 │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Columns**:

| Column | Width | Description |
|--------|-------|-------------|
| Checkbox | 40px | Fixed width, bulk select |
| Title | 30% | Task title, truncate with ellipsis |
| Status | 120px | Status badge, compact |
| Priority | 100px | Priority badge, compact |
| Assignee | 150px | Avatar + name, truncate |
| Story Points | 80px | Number, right-aligned |
| Est. Hours | 80px | Number with "h", right-aligned |
| Due Date | 100px | Date, orange if overdue |
| Actions | 60px | Action menu icon |

**Table Behavior**:
- Sticky header: Stays visible on scroll
- Sortable: Click column headers to sort
- Resizable: Drag column borders (future)
- Horizontal scroll on mobile: Scroll with overflow

## Sort and Filter UI Patterns

### Sort UI

**Location**: Filter bar, right side, icon button with dropdown

**Sort Options**:

| Option | Direction | Default |
|--------|-----------|---------|
| Title | Ascending / Descending | Ascending |
| Status | Ascending / Descending | Ascending |
| Priority | Ascending / Descending | Descending (critical first) |
| Due Date | Ascending / Descending | Ascending (soonest first) |
| Story Points | Ascending / Descending | Descending |
| Created | Ascending / Descending | Descending (newest first) |

**Sort Dropdown**:
- Current sort: Bold with checkmark icon
- Direction toggle: Click again to reverse
- Label: "Sort by {field} ({direction})"
- Reset: "Default Sort" option

**Active Sort Indicator**:
- Icon: ArrowUp/ArrowDown in filter bar
- Click: Open sort dropdown to change

### Filter UI

**Location**: Filter bar, between search and clear button

**Filter Types**:

1. **Text Search**: Real-time filtering as user types
   - Searches: Title, description, assignee name, task ID
   - Debounce: 300ms
   - Highlight: Bold search terms in results (future)

2. **Status Filter**: Multi-select dropdown
   - Options: All 6 task statuses
   - Display: Status badge + label
   - Selection: Checkboxes for multi-select
   - Badge count: "(3)" next to filter button

3. **Assignee Filter**: Multi-select dropdown with search
   - Options: All users + "Unassigned"
   - Display: Avatar + name + email
   - Search: Filter by name/email
   - Badge count: "(2)" next to filter button

4. **Priority Filter**: Multi-select dropdown
   - Options: All 4 priorities
   - Display: Priority badge + label
   - Selection: Checkboxes for multi-select
   - Badge count: "(4)" next to filter button

**Filter State Display**:
- Active filters: Show as chips below filter bar
- Chip content: Filter type + value + "×" to remove
- Example: `[Status: IN_PROGRESS ×] [Priority: High ×]`

**Clear Filters**:
- Button: Ghost variant, "Clear" label
- Behavior: Removes all active filters, resets list
- Disabled: When no active filters

## Bulk Actions UI

### Bulk Selection

**Selection Methods**:
1. Individual: Click checkbox on each card
2. Select All: Checkbox in header row
3. Select Visible: Select all currently visible cards

**Visual Feedback**:
- Selected cards: Ring border (ring-2 ring-ring)
- Checkbox: Filled checkmark when selected
- Bulk Action Bar: Appears when ≥1 card selected

### Bulk Action Bar

**Location**: Fixed position, bottom of screen, z-index: 40

**Content**:

```
┌─────────────────────────────────────────────────────────────┐
│  5 tasks selected                                           │
│  [Change Status] [Assign] [Delete] [Cancel]                 │
└─────────────────────────────────────────────────────────────┘
```

**Components**:

1. **Selection Count**: "X tasks selected", text-sm, font-medium

2. **Change Status Button**: Outline variant, sm size
   - Icon: GitBranch icon
   - Label: "Change Status"
   - Action: Open modal with status dropdown, apply to all selected

3. **Assign Button**: Outline variant, sm size
   - Icon: UserPlus icon
   - Label: "Assign"
   - Action: Open modal with assignee dropdown, apply to all selected

4. **Delete Button**: Destructive variant, sm size
   - Icon: Trash2 icon
   - Label: "Delete"
   - Action: Confirm, then delete all selected
   - Confirmation: "Delete X tasks? This cannot be undone."

5. **Cancel Button**: Ghost variant, sm size
   - Label: "Cancel"
   - Action: Deselect all, hide bulk action bar

**Behavior**:
- Appears: Smooth slide-up animation from bottom
- Disappears: Fade-out when deselected
- Responsive: On mobile, buttons stack vertically

## Empty State Designs

### No Tasks in Epic

**Icon**: CheckCircle icon, 64px, muted-foreground
**Title**: "No tasks yet"
**Message**: "This Epic doesn't have any tasks. Create your first task to get started."
**Action**: "Create Task" button (default variant)

### No Search Results

**Icon**: Search icon, 64px, muted-foreground
**Title**: "No tasks found"
**Message**: "We couldn't find any tasks matching '{searchTerm}'. Try a different search term."
**Action**: "Clear Search" button (outline variant)

### No Filter Results

**Icon**: Filter icon, 64px, muted-foreground
**Title**: "No tasks match your filters"
**Message**: "Try adjusting your filters to see more tasks."
**Action**: "Clear Filters" button (outline variant)

### All Tasks Completed

**Icon**: Party icon, 64px, green color
**Title**: "All tasks completed! 🎉"
**Message**: "Congratulations! All tasks in this Epic are done."
**Action**: "View Epic Details" button (outline variant)

## Loading States

### Initial Load

**Skeleton Cards**: 6 skeleton cards in grid
- Animation: Pulse effect, 1.5s duration
- Structure: Same as real cards but with gray bars

### Loading More Tasks

**Infinite Scroll**: Show spinner at bottom when scrolling
- Spinner: Loader2 icon, 24px, animate-spin
- Label: "Loading more tasks..." in muted-foreground
- Position: Centered, below last card

### Refreshing

**Pull-to-Refresh** (Mobile):
- Indicator: Spinner at top when pulling down
- Threshold: 80px pull distance
- Release: Refresh and show spinner

## Pagination Strategy

### Default: Infinite Scroll (Recommended)

**Trigger**: Scroll to bottom of list (500px before end)
**Fetch**: 20 tasks per batch
**Indicator**: Show spinner when loading more
**End of List**: "You've reached the end" message when no more tasks

### Alternative: Pagination (Optional)

**Location**: Bottom of list, centered
**Style**: Button group, outline variant

**Components**:
- **Previous Button**: Disabled on first page
- **Page Indicator**: "Page 1 of 5"
- **Next Button**: Disabled on last page
- **Page Size Select**: "Show 20/50/100 per page"

**Rationale for Infinite Scroll**: Better for scanning, no manual pagination needed, works well on mobile.

## Responsive Behavior

### Desktop (≥1024px)

**Grid**: 3 columns
**Filter Bar**: All filters visible
**Bulk Actions**: Horizontal button layout
**Table**: Full-width, horizontal scroll if needed

### Tablet (768px - 1023px)

**Grid**: 2 columns
**Filter Bar**: Search full-width, filters in 2x2 grid
**Bulk Actions**: Horizontal button layout (may wrap)
**Table**: Hide less important columns (story points, est. hours)

### Mobile (≤767px)

**Grid**: 1 column
**Filter Bar**: Search full-width, filters in collapsible accordion
- Default: Show search + "Filters" button
- Expanded: Show all filters in vertical stack
**Bulk Actions**: Vertical button layout, full-width buttons
**Table**: Switch to card view automatically (table not available on mobile)

## Interaction Patterns

### Click Task

1. User clicks task title or card (not checkbox)
2. Navigate to task detail page
3. Push to router history
4. On back: Return to epic task list with same filters/scroll position

### Select Task

1. User clicks checkbox
2. Card shows ring border
3. Checkbox fills with checkmark
4. Bulk action bar appears if first selection
5. Selection count updates

### Change Status (Inline, Future)

1. User clicks status badge on card
2. Dropdown appears with available transitions
3. User selects new status
4. Status updates immediately with optimistic UI
5. System comment added: "Status changed from X to Y"
6. Notification sent to assignee

### Sort

1. User clicks sort icon or column header
2. Sort dropdown appears
3. User selects sort field
4. List reorders with fade animation
5. Sort indicator shows current sort

### Filter

1. User types in search or selects filter option
2. List filters immediately (300ms debounce for search)
3. Filter chips appear below filter bar
4. Results count updates: "Showing 5 of 12 tasks"
5. Clear button becomes enabled

## Accessibility Guidelines

### Keyboard Navigation

- **Tab Order**: Filters → Search → Sort → First card checkbox → ... → Last card checkbox → Bulk actions
- **Focus Indicators**: 2px ring on all interactive elements
- **Enter/Space**: Activate buttons, toggle checkboxes
- **Arrow Keys**: Navigate dropdown options, cards in grid
- **Escape**: Close dropdowns, deselect all

### Screen Reader Support

- **Card Structure**: Use `<article>` tag for each card
- **Card Labels**: `aria-label="{title}, status {status}, priority {priority}, assigned to {name}"`
- **Bulk Select**: `aria-label="Select task: {title}"`
- **Live Regions**: Announce filter changes: "Showing 5 of 12 tasks"
- **Status Announcements**: Announce when tasks are selected: "5 tasks selected"

### Focus Management

- **Skip Links**: "Skip to filters" and "Skip to tasks" links
- **Focus Trap**: In modals (status change, bulk actions)
- **Focus Restoration**: Return to trigger element after closing modals

### Color Contrast

- All text meets WCAG AA (4.5:1)
- Status badges meet WCAG AA
- Priority badges meet WCAG AA
- Overdue dates: Use icon + text, not just color

## Design Tokens

### Spacing

```css
--card-gap: 16px;
--card-padding: 16px;
--filter-bar-gap: 8px;
--bulk-action-bar-height: 64px;
```

### Typography

```css
--card-title-size: 16px; /* text-base */
--card-meta-size: 12px; /* text-xs */
--filter-bar-size: 14px; /* text-sm */
```

### Colors

```css
--card-border: hsl(var(--border));
--card-border-hover: hsl(var(--ring));
--card-bg: hsl(var(--card));
--card-bg-hover: hsl(var(--accent));
--bulk-action-bar-bg: hsl(var(--background));
--bulk-action-bar-border: hsl(var(--border));
```

## Implementation Notes

### Component Usage

- **Status Badge**: Use existing `StatusBadge` component (compact size)
- **Priority Badge**: Use existing `PriorityBadge` component (compact size)
- **Button**: Use existing `Button` component
- **Dialog**: Use existing `Dialog` component for bulk action modals

### State Management

- **Filters**: Store in URL query params for shareability
- **Sort**: Store in URL query params
- **View Preference**: Store in localStorage (cards vs table)
- **Selection**: Local component state (cleared on unmount)

### Performance

- **Virtualization**: Not needed for < 1000 tasks
- **Infinite Scroll**: Load 20 tasks per batch
- **Debounce**: 300ms for search input
- **Memo**: Memoize task cards to prevent re-renders

### Future Enhancements

1. **Drag and Drop**: Reorder tasks by priority (future)
2. **Grouping**: Group by status, assignee, or priority (future)
3. **Kanban View**: Board-style layout (future)
4. **Custom Columns**: User-selectable table columns (future)
5. **Export**: Export tasks to CSV/Excel (future)

## Related Components

- Task Detail Page: [designs/task-detail-page.md](designs/task-detail-page.md)
- Task Modal: [designs/task-modal.md](designs/task-modal.md)
- Status Badge: [designs/status-badge.md](designs/status-badge.md)
- My Tasks Dashboard: [designs/my-tasks-dashboard.md](designs/my-tasks-dashboard.md)
