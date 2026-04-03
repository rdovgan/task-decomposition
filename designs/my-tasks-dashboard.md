# My Tasks Dashboard Design

## Overview

The My Tasks Dashboard provides a personalized view of all tasks assigned to the current user, with options for Kanban or list layout, status grouping, and filtering.

## Layout Decision

### Primary Layout: Kanban Board (Recommended)

**Rationale**:
- Visual workflow representation
- Easy drag-and-drop status changes
- Clear progress visualization
- Industry standard for task management

### Alternative Layout: List View

**Rationale**:
- Denser information display
- Better for users with many tasks (50+)
- Familiar spreadsheet-like interface
- Works better on mobile

**Decision**: Default to **Kanban Board**, with list view as a toggleable option.

## Kanban-Style Layout

### Overall Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  My Tasks (24)                    [View: Board ▾] [Filter] [⋯]             │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Search tasks...]                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐   │
│  │  TODO     │ │PROGRESS   │ │ IN REVIEW │ │   DONE    │ │ BLOCKED   │   │
│  │    (5)    │ │   (8)     │ │   (6)     │ │   (3)     │ │   (2)     │   │
│  ├───────────┤ ├───────────┤ ├───────────┤ ├───────────┤ ├───────────┤   │
│  │  [Card]   │ │  [Card]   │ │  [Card]   │ │  [Card]   │ │  [Card]   │   │
│  │  [Card]   │ │  [Card]   │ │  [Card]   │ │  [Card]   │ │  [Card]   │   │
│  │  [Card]   │ │  [Card]   │ │  [Card]   │ │           │ │           │   │
│  │  [Card]   │ │  [Card]   │ │  [Card]   │ │           │ │           │   │
│  │  [Card]   │ │  [Card]   │ │           │ │           │ │           │   │
│  │           │ │  [Card]   │ │           │ │           │ │           │   │
│  │           │ │  [Card]   │ │           │ │           │ │           │   │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Header Section

**Height**: Auto, min 100px

**Components**:

1. **Section Title**: "My Tasks", text-3xl, font-bold
   - Count badge: "(24)" in muted-foreground, text-2xl

2. **View Toggle**: Button group, outline variant, default size
   - Options: Board (default), List
   - Icon: LayoutBoard for Board, List for List
   - Persist preference in localStorage

3. **Filter Button**: Outline variant, default size
   - Icon: Filter icon
   - Label: "Filter"
   - Badge count: "(3)" when filters active
   - Opens filter panel

4. **More Menu**: Icon button, ghost variant, icon size
   - Icon: MoreVertical (3 dots)
   - Dropdown menu:
     - Refresh
     - Export to CSV
     - Archive completed tasks
     - Settings

5. **Search Bar**: Full-width text input
   - Placeholder: "Search my tasks..."
   - Debounce: 300ms
   - Searches: Title, description, epic name
   - Clear button: Show "×" when has text

### Status Group Organization

**Column Order** (Left to Right):

1. **TODO** (To Do) - Gray
2. **IN_PROGRESS** (In Progress) - Blue
3. **IN_REVIEW** (In Review) - Purple
4. **DONE** (Done) - Green
5. **BLOCKED** (Blocked) - Red

**Column Dimensions**:
- Width: 320px (26% width)
- Gap: 16px between columns
- Min-width: 280px (on smaller screens)
- Horizontal scroll: Overflow-x-auto for all columns

**Column Header**:
```
┌─────────────────────────┐
│  [Status Badge] (5)     │  ← Status badge + count
│  [+ Add Task]           │  ← Optional quick-add button
└─────────────────────────┘
```

**Column Header Components**:
- **Status Badge**: Full size, centered
- **Task Count**: Number in parentheses, font-semibold
- **Add Task Button**: Ghost variant, icon-xs size
  - Icon: Plus icon
  - Label: "Add Task"
  - Opens task modal with status pre-selected

### Task Card Information Hierarchy

**Card Structure** (Kanban):

```
┌─────────────────────────────────────────────────────────┐
│  [Priority]                         [Avatar]            │
│  Task Title                                            │
│  DOV-42 • Epic: Project Alpha                           │
│  ─────────────────────────────────────────────────────  │
│  📊 3 SP | ⏱️ 4h | 📅 Due: Apr 5                      │
└─────────────────────────────────────────────────────────┘
```

**Card Components**:

1. **Top Row**: Flex, space-between, items-start
   - **Left**: Priority badge (compact size)
   - **Right**: Assignee avatar (24px, rounded-full)
     - Shows current user's avatar (self-assigned)
     - Shows other user's avatar (reassigned)
     - Hover: Show full name tooltip

2. **Task Title**: Text-sm, font-semibold, line-clamp-2
   - Max 2 lines, truncate with ellipsis
   - Hover: Underline, cursor pointer
   - Click: Navigate to task detail page

3. **Metadata Row**: Flex, gap-1, text-xs, muted-foreground
   - **Task ID**: "DOV-42"
   - **Epic Name**: "Epic: Project Alpha" (truncate to 20 chars)
   - Separator: "•" (bullet)

4. **Divider**: Horizontal rule, border-muted

5. **Bottom Row**: Flex, gap-2, text-xs
   - **Story Points**: "📊 3 SP"
   - **Estimated Hours**: "⏱️ 4h"
   - **Due Date**: "📅 Apr 5" in orange/red if overdue
   - Empty fields omitted

**Card Interaction**:
- **Hover**: Slight lift (translate-y -1px), shadow-lg
- **Drag**: Lift card higher (translate-y -4px), shadow-xl
- **Click**: Navigate to task detail page
- **Drag and Drop**: Move to different status column

### Drag and Drop

**Visual States**:

1. **Idle**: Card appears normal
2. **Dragging**: Card lifts, shadow increases, cursor: grab
3. **Drop Target**: Column shows 2px highlight at top/bottom
4. **Drop Zone**: Column shows 4px ring when card hovers over it

**Drop Behavior**:
- **Same Column**: Reorder cards (update order index)
- **Different Column**: Change status + update order index
- **Invalid Drop**: Show "not allowed" cursor, animate back to start

**Optimistic UI**:
- Card moves immediately on drop
- Status badge updates in-place
- API call fires in background
- On error: Revert to original position, show error toast

**Keyboard Support** (Accessibility):
- **Tab**: Focus cards in order
- **Enter/Space**: "Pick up" focused card
- **Arrow Keys**: Move to adjacent column
- **Enter**: Drop card in new column
- **Escape**: Cancel drag

## Filter Panel Design

### Panel Structure

**Location**: Side sheet (drawer) from right edge
**Width**: 320px (desktop), 100% (mobile)
**Height**: Full viewport, minus header
**Z-index**: 50

**Content**:

```
┌─────────────────────────────────────┐
│  Filters                    [×]     │
├─────────────────────────────────────┤
│  Status                             │
│  ☑ TODO                             │
│  ☐ IN_PROGRESS                      │
│  ☑ IN_REVIEW                        │
│  ☐ DONE                             │
│  ☐ BLOCKED                          │
├─────────────────────────────────────┤
│  Priority                           │
│  ☑ CRITICAL                         │
│  ☑ HIGH                             │
│  ☐ MEDIUM                           │
│  ☐ LOW                              │
├─────────────────────────────────────┤
│  Epic                               │
│  [Search epics...]                  │
│  ☑ Project Alpha                    │
│  ☐ Beta Feature                     │
│  ☐ Infrastructure                   │
├─────────────────────────────────────┤
│  Due Date                           │
│  ○ Overdue                          │
│  ○ Due today                        │
│  ○ Due this week                    │
│  ○ Due this month                   │
│  ○ No due date                      │
├─────────────────────────────────────┤
│  [Clear All]           [Apply (3)]  │
└─────────────────────────────────────┘
```

**Filter Sections**:

1. **Status**: Checkboxes, multi-select
   - Options: All 6 task statuses
   - Default: All checked (show all)
   - Display: Status badge + label

2. **Priority**: Checkboxes, multi-select
   - Options: All 4 priorities
   - Default: All checked (show all)
   - Display: Priority badge + label

3. **Epic**: Checkboxes with search
   - Options: All epics with assigned tasks
   - Default: All checked (show all)
   - Search: Filter epics by name
   - Display: Epic name + task count

4. **Due Date**: Radio buttons, single-select
   - Options: Overdue, Today, This week, This month, No due date
   - Default: None selected (show all)
   - Logic: Date range calculations

**Actions**:
- **Clear All**: Reset all filters to defaults
- **Apply**: Close panel, apply filters (updates badge count)
- **Auto-apply**: Filters apply immediately as user toggles (optional preference)

## List View Layout

### Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  My Tasks (24)                    [View: List ▾] [Filter (3)] [⋯]          │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Search tasks...]                                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────┬────────────────┬─────────┬──────────┬──────────┬─────────┬─────┐│
│  │ [ ] │ Task Title     │ Status  │ Priority │ Assignee │ Due     │     ││
│  ├─────┼────────────────┼─────────┼──────────┼──────────┼─────────┼─────┤│
│  │ [ ] │ Task Title     │ [Badge] │ [Badge]  │ [Avatar] │ Apr 5   │ [⋮] ││
│  │ [ ] │ Task Title     │ [Badge] │ [Badge]  │ [Avatar] │ Apr 7   │ [⋮] ││
│  └─────┴────────────────┴─────────┴──────────┴──────────┴─────────┴─────┘│
└─────────────────────────────────────────────────────────────────────────────┘
```

**Columns**:

| Column | Width | Description |
|--------|-------|-------------|
| Checkbox | 40px | Fixed width, bulk select |
| Title | 35% | Task title, truncate with ellipsis |
| Status | 120px | Status badge, compact |
| Priority | 100px | Priority badge, compact |
| Assignee | 150px | Avatar (self), name |
| Due Date | 100px | Date, orange if overdue |
| Actions | 60px | Action menu icon |

**Table Behavior**:
- Sortable: Click column headers to sort
- Sticky header: Stays visible on scroll
- Row hover: Highlight row on hover
- Row click: Navigate to task detail page

## Task Card Design (List View)

**Row Height**: 60px (fixed)
**Border**: Bottom border between rows
**Hover**: Background color change, cursor pointer

**Row Content** (from left to right):
1. **Checkbox**: Square checkbox for bulk selection
2. **Priority Badge**: Compact size
3. **Task Title**: Text-sm, font-medium, truncate
   - Task ID in muted: "DOV-42 - Task Title"
4. **Status Badge**: Compact size
5. **Assignee**: Avatar (24px) + name (text-sm)
6. **Due Date**: Text-sm, muted-foreground
   - Overdue: Text-destructive
7. **Actions**: Icon button (3 dots) with dropdown menu

## Mobile Adaptation Strategy

### Kanban Board (Mobile)

**Layout**: Horizontal scroll of columns
- Column width: 280px (fixed)
- Columns scroll horizontally (swipe left/right)
- Cards within column scroll vertically
- Indicator: Dots at bottom showing active column

**Interactions**:
- **Tap**: Open task detail page
- **Long Press**: Enter drag mode (lift card)
- **Drag**: Move to adjacent column (swipe left/right)
- **Drop**: Release to drop in new column

**Navigation**:
- Column headers: Sticky at top
- Swipe left/right: Navigate between columns
- Column indicator: Active column dot highlighted

### List View (Mobile)

**Layout**: Single column, stacked rows
- Row height: 80px (increased for touch)
- Columns hidden: Status, priority (shown in card detail)
- Visible: Title, assignee, due date

**Card Layout** (mobile list):
```
┌─────────────────────────────────────────────────────────┐
│  [Priority] Task Title                    [Avatar] [⋮]  │
│  DOV-42 • Status: In Progress                        │
│  Due: Apr 5 • 3 SP • 4h                              │
└─────────────────────────────────────────────────────────┘
```

### Filters (Mobile)

**Location**: Bottom sheet (slides up from bottom)
**Height**: 80% viewport, with drag handle to close
**Width**: Full-width
**Animation**: Smooth slide-up (300ms ease-out)

**Content**: Same as desktop filter panel, but:
- Full-width sections
- Larger touch targets (44px min)
- Sticky "Apply" button at bottom

## Empty States

### No Tasks Assigned

**Icon**: Inbox icon, 80px, muted-foreground
**Title**: "No tasks assigned"
**Message**: "You don't have any tasks assigned to you yet. Tasks will appear here once you're assigned."
**Action**: "Browse Epics" button (outline variant)

### All Tasks Completed

**Icon**: PartyPopper icon, 80px, green color
**Title**: "All caught up! 🎉"
**Message**: "You've completed all your assigned tasks. Great work!"
**Action**: "View Completed Tasks" button (outline variant)

### No Search Results

**Icon**: Search icon, 64px, muted-foreground
**Title**: "No tasks found"
**Message**: "We couldn't find any tasks matching '{searchTerm}'. Try a different search term."
**Action**: "Clear Search" button (outline variant)

### Empty Column (Kanban)

**Display**: Subtle placeholder in empty column
- Icon: Plus icon in light gray
- Text: "Drop tasks here" in muted-foreground
- Height: 200px min-height for empty column

## Loading States

### Initial Load

**Skeleton Cards**: 2 cards per column, 5 columns
- Animation: Pulse effect, 1.5s duration
- Structure: Same as real cards but with gray bars

### Loading More Tasks

**Infinite Scroll**: Show spinner at bottom when scrolling
- Spinner: Loader2 icon, 24px, animate-spin
- Label: "Loading more tasks..." in muted-foreground

### Refreshing

**Pull-to-Refresh** (Mobile):
- Indicator: Spinner at top when pulling down
- Threshold: 80px pull distance
- Release: Refresh and show success checkmark

## Responsive Behavior

### Desktop (≥1280px)

**Kanban**: 5 columns, 320px width each
**List**: Full-width table with all columns
**Filters**: Right side sheet (320px width)

### Tablet (768px - 1279px)

**Kanban**: 5 columns, 280px width each, horizontal scroll
**List**: Full-width table with some columns hidden
**Filters**: Right side sheet (320px width)

### Mobile (≤767px)

**Kanban**: 1 column visible at a time (280px width), horizontal swipe
**List**: Stacked card layout (not table)
**Filters**: Bottom sheet (80% viewport height)

## Performance Considerations

### Kanban Board

- **Virtualization**: Not needed for < 100 tasks per column
- **Lazy Loading**: Load tasks per column on demand
- **Debounce**: 300ms for search input
- **Optimistic UI**: Update card position immediately on drop

### List View

- **Pagination**: 50 tasks per page (or infinite scroll)
- **Virtual Scrolling**: Consider for > 500 tasks
- **Memo**: Memoize rows to prevent re-renders

## Accessibility Guidelines

### Keyboard Navigation

- **Tab Order**: Header → Search → First column → ... → Last column → Cards within column
- **Focus Indicators**: 2px ring on focused cards/columns
- **Arrow Keys**: Navigate between columns and cards
- **Enter/Space**: Activate focused card
- **Escape**: Close filter panel

### Screen Reader Support

- **Column Structure**: Use `<section>` with `aria-label="TODO tasks, 5 tasks"`
- **Card Labels**: `aria-label="{title}, status {status}, priority {priority}"`
- **Live Regions**: Announce drag and drop actions: "Moved to In Progress"
- **Status Announcements**: Announce filter changes: "Showing 5 of 24 tasks"

### Drag and Drop (Accessibility)

- **Keyboard Alternative**: Move via menu (right-click or action menu)
- **Announce**: "To move this task, use the action menu"
- **Menu Option**: "Move to..." with status options

## Design Tokens

### Spacing

```css
--column-gap: 16px;
--card-gap: 8px;
--card-padding: 12px;
--column-width: 320px;
--column-width-mobile: 280px;
```

### Typography

```css
--card-title-size: 14px; /* text-sm */
--card-meta-size: 12px; /* text-xs */
--column-header-size: 14px; /* text-sm */
```

### Colors

```css
--column-bg: hsl(var(--muted) / 0.3);
--column-bg-hover: hsl(var(--muted) / 0.5);
--card-border: hsl(var(--border));
--card-bg: hsl(var(--card));
--card-bg-hover: hsl(var(--accent));
```

## Implementation Notes

### Component Usage

- **Status Badge**: Use existing `StatusBadge` component (compact size)
- **Priority Badge**: Use existing `PriorityBadge` component (compact size)
- **Button**: Use existing `Button` component
- **Dialog**: Use existing `Dialog` component for task details

### State Management

- **View Preference**: Store in localStorage (kanban vs list)
- **Filters**: Store in URL query params for shareability
- **Column Order**: Store in localStorage (customizable, future)
- **Card Order**: Update order index on drop

### Drag and Drop Library

**Recommended**: `@dnd-kit/core` (modern, accessible, performant)
- Alternative: `react-beautiful-dnd` (deprecated but still works)
- Alternative: `react-dnd` (flexible but complex)

## Future Enhancements

1. **Swimlanes**: Group by epic within columns (future)
2. **Custom Columns**: User-defined columns (future)
3. **Work-in-Progress Limit**: Limit cards per column (future)
4. **Calendar View**: Show tasks on calendar (future)
5. **Timeline View**: Gantt-style timeline (future)
6. **Archive Column**: Show completed tasks in separate column (future)

## Related Components

- Task Detail Page: [designs/task-detail-page.md](designs/task-detail-page.md)
- Task Modal: [designs/task-modal.md](designs/task-modal.md)
- Status Badge: [designs/status-badge.md](designs/status-badge.md)
- Epic Task List: [designs/epic-task-list.md](designs/epic-task-list.md)
- Assignee Dropdown: [designs/assignee-dropdown.md](designs/assignee-dropdown.md)
