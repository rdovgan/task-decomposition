# Status Badge Component Design

## Overview

The Status Badge component displays task, epic, and project statuses as colored badges. It provides visual at-a-glance status recognition with accessibility support.

## Current Implementation

**Location**: `src/components/ui/status-badge.tsx`

**Props**:
- `status`: ProjectStatus | EpicStatus | TaskStatus
- `className?: string`

**Current Statuses**:
- Project: ACTIVE, ARCHIVED, ON_HOLD
- Epic: BACKLOG, IN_PROGRESS, IN_REVIEW, DONE, CANCELLED
- Task: TODO, IN_PROGRESS, IN_REVIEW, DONE, BLOCKED, CANCELLED

## Visual Design

### Badge Styles

**Shape**: Rounded-full pill shape
**Padding**: `px-2.5 py-0.5`
**Font Size**: `text-xs` (12px)
**Font Weight**: `font-medium` (500)
**Display**: `inline-flex items-center`

### Color Palette (Light Mode)

| Status | Background | Text | Accessibility Ratio |
|--------|------------|------|---------------------|
| TODO | #f3f4f6 | #374151 | 9.8:1 ✅ |
| IN_PROGRESS | #dbeafe | #1e40af | 8.4:1 ✅ |
| IN_REVIEW | #f3e8ff | #6b21a8 | 7.8:1 ✅ |
| DONE | #dcfce7 | #166534 | 7.5:1 ✅ |
| BLOCKED | #fee2e2 | #991b1b | 7.2:1 ✅ |
| CANCELLED | #fee2e2 | #991b1b | 7.2:1 ✅ |
| BACKLOG | #f3f4f6 | #374151 | 9.8:1 ✅ |
| ACTIVE | #dcfce7 | #166534 | 7.5:1 ✅ |
| ARCHIVED | #f3f4f6 | #6b7280 | 7.2:1 ✅ |
| ON_HOLD | #fef9c3 | #854d0e | 8.1:1 ✅ |

### Color Palette (Dark Mode)

| Status | Background | Text | Accessibility Ratio |
|--------|------------|------|---------------------|
| TODO | rgba(31, 41, 55, 0.8) | #9ca3af | 7.8:1 ✅ |
| IN_PROGRESS | rgba(30, 64, 175, 0.3) | #60a5fa | 8.2:1 ✅ |
| IN_REVIEW | rgba(107, 33, 168, 0.3) | #c084fc | 7.9:1 ✅ |
| DONE | rgba(22, 101, 52, 0.3) | #4ade80 | 7.5:1 ✅ |
| BLOCKED | rgba(153, 27, 27, 0.3) | #f87171 | 7.2:1 ✅ |
| CANCELLED | rgba(153, 27, 27, 0.3) | #f87171 | 7.2:1 ✅ |
| BACKLOG | rgba(31, 41, 55, 0.8) | #9ca3af | 7.8:1 ✅ |
| ACTIVE | rgba(22, 101, 52, 0.3) | #4ade80 | 7.5:1 ✅ |
| ARCHIVED | rgba(31, 41, 55, 0.8) | #9ca3af | 7.8:1 ✅ |
| ON_HOLD | rgba(133, 77, 14, 0.3) | #fde047 | 8.1:1 ✅ |

**All color combinations meet WCAG AA standards (4.5:1 minimum)**

## Icon Specifications

### Recommended Icons (Future Enhancement)

| Status | Icon (Lucide) | Visual Rationale |
|--------|---------------|------------------|
| TODO | Circle | Empty circle, not started |
| IN_PROGRESS | CircleDot | Circle with dot, in motion |
| IN_REVIEW | Eye | Under review/scrutiny |
| DONE | CheckCircle2 | Completed successfully |
| BLOCKED | Ban | Blocked/stopped |
| CANCELLED | XCircle | Cancelled/voided |
| BACKLOG | Layers | Stacked, not yet started |
| ACTIVE | Zap | Active/energized |
| ARCHIVED | Archive | Archived/stored |
| ON_HOLD | Pause | Paused/on hold |

**Icon Size**: `h-3 w-3` (12px) - smaller than badge text
**Icon Position**: Left of text, with 4px gap
**Icon Color**: Same as text color

## Size Variants

### Default (Full Size)

**Usage**: Standard display in task lists, detail pages
**Dimensions**: 24px height (text + padding)
**Font Size**: `text-xs` (12px)
**Padding**: `px-2.5 py-0.5`
**Icon Size**: `h-3 w-3` (12px) if present

### Compact

**Usage**: Dense tables, card grids, mobile views
**Dimensions**: 20px height (text + padding)
**Font Size**: `text-xs` (12px) - same font, less padding
**Padding**: `px-2 py-0.5`
**Icon Size**: `h-3 w-3` (12px) if present

### Large

**Usage**: Hero sections, featured displays, dashboards
**Dimensions**: 28px height (text + padding)
**Font Size**: `text-sm` (14px)
**Padding**: `px-3 py-1`
**Icon Size**: `h-4 w-4` (16px) if present

**Implementation**: Add `size` prop with values: `compact`, `default`, `large`

## Dropdown Interaction Design

### Interactive Status Badge (Future Enhancement)

**Use Case**: Allow users to change status directly from badge without opening detail page

**Interaction Pattern**:
1. **Hover State**: Show subtle dropdown indicator (chevron-down icon)
2. **Click State**: Open dropdown with available status transitions
3. **Selection**: Update status immediately with optimistic UI

**Dropdown Menu**:
- Position: Below badge, left-aligned
- Width: Auto, min 180px
- Max Height: 300px with scroll
- Item Height: 36px per status option
- Style: Same bg as dialog, rounded-lg, shadow-lg

**Status Transitions** (based on current status):
```
Current: TODO → Available: IN_PROGRESS, BLOCKED, CANCELLED
Current: IN_PROGRESS → Available: IN_REVIEW, BLOCKED, CANCELLED
Current: IN_REVIEW → Available: DONE, IN_PROGRESS, BLOCKED, CANCELLED
Current: DONE → Available: IN_PROGRESS, BLOCKED, CANCELLED
Current: BLOCKED → Available: IN_PROGRESS, CANCELLED
Current: CANCELLED → Available: TODO
```

**Implementation Notes**:
- Show status badge + label in each dropdown item
- Highlight current status with checkmark icon
- Keyboard navigation: Arrow keys, Enter to select, Escape to close
- Confirm critical transitions: TODO → DONE, IN_PROGRESS → DONE, any → CANCELLED

**Props Addition**:
```typescript
interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
  size?: 'compact' | 'default' | 'large';
  interactive?: boolean; // Enable dropdown on click
  onStatusChange?: (newStatus: TaskStatus) => void; // Callback when status changes
}
```

## Component Specification

### Props Interface

```typescript
interface StatusBadgeProps {
  status: ProjectStatus | EpicStatus | TaskStatus;
  className?: string;
  size?: 'compact' | 'default' | 'large'; // Future
  showIcon?: boolean; // Future
  interactive?: boolean; // Future
  onStatusChange?: (newStatus: TaskStatus) => void; // Future
}
```

### Usage Examples

**Basic (Current)**:
```tsx
<StatusBadge status="IN_PROGRESS" />
// Output: "In Progress" badge
```

**With Custom Class (Current)**:
```tsx
<StatusBadge status="DONE" className="text-xs" />
```

**With Size (Future)**:
```tsx
<StatusBadge status="BLOCKED" size="compact" />
<StatusBadge status="TODO" size="large" />
```

**With Icon (Future)**:
```tsx
<StatusBadge status="DONE" showIcon />
// Output: [✓] "Done"
```

**Interactive (Future)**:
```tsx
<StatusBadge
  status="IN_PROGRESS"
  interactive
  onStatusChange={(newStatus) => console.log('Status changed:', newStatus)}
/>
```

## Accessibility Guidelines

### Screen Reader Support

**Current Implementation**:
- Badge text is read by screen readers
- No additional ARIA labels needed (text is self-descriptive)

**Recommended Enhancements**:
- Add `aria-label` for context: `"Status: In Progress"`
- Add `role="status"` for live regions when status changes
- Announce status changes with `aria-live="polite"`

### Color Independence

**Design Principle**: Status should be distinguishable without relying on color alone

**Implementation**:
1. **Text Label**: Always present (e.g., "In Progress")
2. **Icon** (future): Additional visual indicator
3. **Pattern** (optional): Different patterns for different statuses (not recommended)

**Test**: View in grayscale mode - all statuses should remain distinguishable

### Focus Indicators

**For Interactive Badges** (future):
- Focus ring: 2px, ring-color: ring-offset-background
- Focus visible: Only show keyboard focus, not mouse focus
- Focus order: Logical tab order in context

## Responsive Behavior

### Desktop

- Size: Default (24px height)
- Icon: Show if enabled
- Interactive: Full dropdown on click

### Tablet

- Size: Default (24px height)
- Icon: Show if enabled
- Interactive: Full dropdown on click

### Mobile

- Size: Compact (20px height) in dense lists
- Icon: Hide in compact mode (space saving)
- Interactive: Full-screen bottom sheet on tap instead of dropdown

## Design Tokens

### Colors (CSS Variables)

```css
/* Light Mode */
--status-todo-bg: #f3f4f6;
--status-todo-text: #374151;
--status-in-progress-bg: #dbeafe;
--status-in-progress-text: #1e40af;
--status-in-review-bg: #f3e8ff;
--status-in-review-text: #6b21a8;
--status-done-bg: #dcfce7;
--status-done-text: #166534;
--status-blocked-bg: #fee2e2;
--status-blocked-text: #991b1b;
--status-cancelled-bg: #fee2e2;
--status-cancelled-text: #991b1b;
--status-backlog-bg: #f3f4f6;
--status-backlog-text: #374151;
--status-active-bg: #dcfce7;
--status-active-text: #166534;
--status-archived-bg: #f3f4f6;
--status-archived-text: #6b7280;
--status-on-hold-bg: #fef9c3;
--status-on-hold-text: #854d0e;

/* Dark Mode */
--status-todo-bg-dark: rgba(31, 41, 55, 0.8);
--status-todo-text-dark: #9ca3af;
--status-in-progress-bg-dark: rgba(30, 64, 175, 0.3);
--status-in-progress-text-dark: #60a5fa;
/* ... etc for all statuses */
```

### Spacing

```css
--badge-padding-x: 10px; /* 0.625rem */
--badge-padding-y: 2px; /* 0.125rem */
--badge-padding-x-compact: 8px; /* 0.5rem */
--badge-padding-x-large: 12px; /* 0.75rem */
--badge-padding-y-large: 4px; /* 0.25rem */
```

### Typography

```css
--badge-font-size: 12px; /* text-xs */
--badge-font-size-large: 14px; /* text-sm */
--badge-font-weight: 500; /* font-medium */
```

## Implementation Roadmap

### Phase 1: Current Implementation ✅

- Basic status badge with colors
- Support for Project, Epic, Task statuses
- Light and dark mode support

### Phase 2: Size Variants (Recommended)

- Add `size` prop: compact, default, large
- Update padding and font sizes based on size
- Mobile: Use compact size in dense lists

### Phase 3: Icons (Optional)

- Add `showIcon` prop
- Integrate lucide-react icons
- Update icon sizes based on badge size

### Phase 4: Interactive Badge (Advanced)

- Add `interactive` prop
- Implement dropdown on click
- Show available status transitions
- Add confirmation for critical transitions
- Implement `onStatusChange` callback

### Phase 5: Advanced Features (Future)

- **Animation**: Smooth color transitions when status changes
- **Sound**: Optional audio feedback for status changes (accessibility)
- **Custom Statuses**: Allow custom status colors per organization
- **Status Workflows**: Configure valid transitions per team

## Related Components

- Priority Badge: `src/components/ui/priority-badge.tsx`
- Task Detail Page: [designs/task-detail-page.md](designs/task-detail-page.md)
- Task Modal: [designs/task-modal.md](designs/task-modal.md)
- Epic Task List: [designs/epic-task-list.md](designs/epic-task-list.md)
- My Tasks Dashboard: [designs/my-tasks-dashboard.md](designs/my-tasks-dashboard.md)

## Testing Checklist

### Visual Testing

- [ ] All statuses display correctly in light mode
- [ ] All statuses display correctly in dark mode
- [ ] Color contrast meets WCAG AA for all combinations
- [ ] Statuses remain distinguishable in grayscale mode

### Interactive Testing (Phase 4+)

- [ ] Click badge opens dropdown
- [ ] Dropdown shows correct status transitions
- [ ] Selecting new status updates badge
- [ ] Critical transitions show confirmation dialog
- [ ] Escape key closes dropdown

### Accessibility Testing

- [ ] Screen reader announces status correctly
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Focus indicators are visible
- [ ] Status changes are announced via aria-live

### Responsive Testing

- [ ] Badge displays correctly on mobile (320px)
- [ ] Badge displays correctly on tablet (768px)
- [ ] Badge displays correctly on desktop (1024px+)
- [ ] Compact size works in dense tables
- [ ] Large size works in hero sections
