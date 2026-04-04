# Assignee Dropdown Design

## Overview

The Assignee Dropdown is a user selection component used throughout the application for assigning tasks, filtering by assignee, and managing user selections. It features search, keyboard navigation, and avatar display.

## Component Variants

### 1. Form Select (Native - Current)

**Use Case**: Task create/edit modal
**Implementation**: Native HTML `<select>` element
**Pros**: Simple, accessible, mobile-friendly
**Cons**: Limited styling, no search, no avatars

**Current Implementation**:
```tsx
<select id="assigneeId" value={formData.assigneeId} onChange={...}>
  <option value="">Unassigned</option>
  {users.map((user) => (
    <option key={user.id} value={user.id}>
      {user.name} ({user.email})
    </option>
  ))}
</select>
```

### 2. Custom Dropdown (Recommended - Future)

**Use Case**: Task detail page, filters, bulk actions
**Implementation**: Custom component with popover
**Pros**: Search, avatars, custom styling, better UX
**Cons**: More complex, requires careful accessibility

**Recommended Library**:
- `@base-ui/react/Select` (already in project)
- Alternative: `cmdk` (command menu-style)
- Alternative: `ariakit` (accessible components)

## User List Item Layout

### Item Structure

**Height**: 48px (fixed for consistency)
**Padding**: 12px horizontal, 8px vertical
**Gap**: 12px between avatar and text

**Layout** (Left to Right):
```
┌─────────────────────────────────────────────────────────┐
│  [Avatar]  Name                    [Badge] [✓]         │
│            Email                                    │
└─────────────────────────────────────────────────────────┘
```

### Item Components

1. **Avatar**: 32px, rounded-full
   - **Image**: User's uploaded avatar or initials
   - **Initials**: First letter of first + last name (e.g., "JD" for "John Doe")
   - **Fallback**: Icon (User icon) if no name
   - **Background Color**: Hashed from user ID (consistent per user)
   - **Text Color**: White or black (contrast-based)

2. **Name**: Text-sm, font-semibold, text-foreground
   - **Max Width**: 200px
   - **Overflow**: Truncate with ellipsis
   - **Full Display**: "John Doe"

3. **Email**: Text-xs, text-muted-foreground
   - **Max Width**: 200px
   - **Overflow**: Truncate with ellipsis
   - **Full Display**: "john.doe@example.com"
   - **Visible**: Only in expanded items or wide dropdowns

4. **Role Badge** (Optional): Badge component, compact size
   - **Display**: User role (e.g., "DEV", "PM", "QA")
   - **Color**: Muted background, role-specific text
   - **Purpose**: Quick role identification

5. **Selected Indicator**: Check icon, right-aligned
   - **Icon**: Check icon from lucide-react
   - **Color**: Primary color
   - **Size**: 16px
   - **Visible**: Only for selected item

6. **Active Indicator** (Keyboard focus):
   - **Background**: Accent color (subtle)
   - **Outline**: 2px ring color
   - **Visible**: Only when focused via keyboard

### Item States

| State | Background | Border | Ring | Check |
|-------|------------|--------|------|-------|
| Default | Transparent | None | None | Hidden |
| Hover | Accent (subtle) | None | None | Hidden |
| Focused | Accent (subtle) | None | 2px ring | Hidden |
| Selected | Accent (subtle) | None | None | Visible |
| Selected + Focused | Accent (subtle) | None | 2px ring | Visible |
| Disabled | Muted | None | None | Hidden |

### Unassigned Option

**Purpose**: Allow tasks to be unassigned
**Position**: First item in list
**Icon**: UserMinus icon or "—" (em dash)
**Text**: "Unassigned"
**Style**: Italic text, muted-foreground
**Selection**: Clears assignee field

## Avatar Specifications

### Avatar Component

**Size**: 32px (standard), 24px (compact), 40px (large)
**Shape**: Rounded-full (circular)
**Overflow**: Hidden
**Background**: Hashed color based on user ID

### Initials Avatar

**When to Use**: No uploaded avatar image
**Content**: First initial of first name + first initial of last name
**Examples**:
- "John Doe" → "JD"
- "Alice Smith" → "AS"
- "Bob" → "B" (single name)

**Typography**:
- **Font**: System font, semibold
- **Size**: 14px (for 32px avatar)
- **Color**: White or black (auto-contrast with background)

**Background Colors** (Hashed from user ID):
```css
--avatar-color-1: #ef4444; /* Red */
--avatar-color-2: #f97316; /* Orange */
--avatar-color-3: #f59e0b; /* Amber */
--avatar-color-4: #84cc16; /* Lime */
--avatar-color-5: #10b981; /* Emerald */
--avatar-color-6: #06b6d4; /* Cyan */
--avatar-color-7: #3b82f6; /* Blue */
--avatar-color-8: #8b5cf6; /* Violet */
--avatar-color-9: #d946ef; /* Fuchsia */
--avatar-color-10: #f43f5e; /* Rose */
```

### Image Avatar

**When to Use**: User has uploaded avatar
**Source**: User.avatarUrl from API
**Fallback**: Initials if image fails to load
**Object Fit**: cover (fills circle)
**Loading**: Blur-up or skeleton while loading

## Search UI Pattern

### Search Input

**Location**: Top of dropdown, sticky
**Height**: 40px
**Padding**: 12px horizontal
**Icon**: Search icon, left-aligned, 16px
**Placeholder**: "Search users..."
**Debounce**: 150ms (filter list as user types)

**Search Scope**:
- **Name**: Contains match (e.g., "John" matches "Johnson")
- **Email**: Contains match (e.g., "john@example.com")
- **Case**: Case-insensitive

**Search Logic**:
1. **Empty**: Show all users
2. **Typing**: Filter list in real-time
3. **No Results**: Show "No users found" message
4. **Min Characters**: No minimum (filter immediately)

**Keyboard Shortcuts**:
- **Focus**: Automatically focus search when dropdown opens
- **Clear**: Escape key clears search
- **Navigate**: Arrow down to first result after search

### Search Results Display

**Max Height**: 300px (scrollable)
**Overflow**: Auto (vertical scroll)
**Empty State**:
- **Icon**: Search icon, 48px, muted-foreground
- **Text**: "No users found"
- **Hint**: "Try a different search term"

**Highlighting** (Optional):
- **Match Highlight**: Bold search term in results
- **Example**: Search "john" → "**John** Doe"

## Selection States

### Unselected State

**Display**: Placeholder text
**Label**: "Assignee" or "Select assignee"
**Icon**: User icon in gray
**Background**: Transparent
**Border**: Input border

### Selected State

**Display**: Avatar + Name + Email
**Layout**: Horizontal flex row, items-center
**Gap**: 8px
**Clear Button**: "×" icon on right to clear selection

**Selected Item Display**:
```
┌─────────────────────────────────────────────────────────┐
│  [Avatar] John Doe                              [×]     │
│           john.doe@example.com                          │
└─────────────────────────────────────────────────────────┘
```

**Compact Display** (for tight spaces):
```
┌──────────────────────────────────────┐
│  [Avatar] John Doe            [×]    │
└──────────────────────────────────────┘
```

### Multi-Select State (Future)

**Use Case**: Filtering by multiple assignees
**Display**: Avatar stack + "X selected"
**Layout**: Horizontal flex row, avatars overlap
**Max Display**: 3 avatars, then "+N more"

**Multi-Select Display**:
```
┌──────────────────────────────────────┐
│  [Avatar][Avatar][Avatar] +2    [×]  │
└──────────────────────────────────────┘
```

**Removal**: Click avatar or "×" to open panel with selections

## Keyboard Navigation Design

### Focus Management

1. **Open Dropdown**:
   - Trigger: Click, Space, Enter, or Arrow Down
   - Focus: Move to search input (if available) or first item

2. **Navigate Items**:
   - **Arrow Down**: Move to next item
   - **Arrow Up**: Move to previous item
   - **Home**: Move to first item
   - **End**: Move to last item
   - **Page Down**: Move 5 items down
   - **Page Up**: Move 5 items up

3. **Select Item**:
   - **Enter / Space**: Select focused item, close dropdown
   - **Escape**: Close dropdown without selection

4. **Search Filter**:
   - **Type**: Filter list (if search input is focused)
   - **Arrow Down**: Move from search to first result

### Focus Indicators

**Visual Ring**: 2px ring, ring-offset-2
**Color**: Primary ring color
**Scope**: Only show on keyboard focus (not mouse)

**Focus Trap**: Keep focus within dropdown when open
**Focus Restoration**: Return focus to trigger after close

## Dropdown Menu Behavior

### Positioning

**Placement**: Bottom-left of trigger (default)
**Fallback**: Bottom-right if not enough space on left
**Flip**: Top-left if not enough space below
**Offset**: 4px gap from trigger

**Dimensions**:
- **Width**: Min 280px, max 400px
- **Height**: Auto, max 400px with scroll
- **Z-Index**: 50 (above most content)

### Animation

**Open**: Scale + fade in (150ms ease-out)
**Close**: Scale + fade out (150ms ease-in)

**Animation Keyframes**:
```css
@keyframes dropdown-open {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes dropdown-close {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.95) translateY(-4px);
  }
}
```

### Click Outside

**Behavior**: Close dropdown when clicking outside
**Detection**: Listen for mousedown on document
**Exception**: Don't close if clicking trigger (toggle instead)

### Scroll Handling

**Dropdown Scroll**: Vertical scroll for user list
**Page Scroll**: Lock page scroll when dropdown is open
- **Desktop**: `overflow: hidden` on body
- **Mobile**: `overflow: hidden` on body

## Accessibility Guidelines

### ARIA Attributes

**Trigger Button**:
- `aria-haspopup="listbox"`
- `aria-expanded="{isOpen}"`
- `aria-labelledby="{triggerId}"`

**Dropdown Menu**:
- `role="listbox"`
- `aria-labelledby="{triggerId}"`
- `aria-activedescendant="{focusedItemId}"`

**Menu Items**:
- `role="option"`
- `aria-selected="{isSelected}"`
- `id="{itemId}"`

**Search Input**:
- `role="searchbox"`
- `aria-label="Search users"`
- `aria-controls="{dropdownId}"`

### Screen Reader Support

**Announcements**:
- **Open**: "Assignee menu opened. X users available."
- **Close**: "Assignee menu closed."
- **Selection**: "Selected John Doe."
- **Navigate**: "John Doe, 1 of 10"

**Live Regions**:
- Use `aria-live="polite"` for selection changes
- Announce filter results: "X users found"

### Color Contrast

**Requirements**: WCAG AA (4.5:1 for text)
**Check**:
- Name text: ✅ (text-foreground on background)
- Email text: ✅ (muted-foreground meets contrast)
- Avatar initials: ✅ (white/black on hashed color)

### Touch Targets

**Minimum Size**: 44x44px (WCAG AAA)
**Item Height**: 48px (meets AAA)
**Button Height**: 40px (meets AA, acceptable)

## Responsive Behavior

### Desktop (≥768px)

**Width**: 320px
**Position**: Below trigger, left-aligned
**Avatar**: 32px
**Item Height**: 48px
**Animation**: Scale + fade

### Mobile (≤767px)

**Width**: 90% of viewport
**Position**: Bottom sheet (slide up from bottom)
**Avatar**: 32px
**Item Height**: 48px
**Animation**: Slide up from bottom

**Bottom Sheet**:
- **Height**: 80% of viewport
- **Border Radius**: 16px top corners
- **Handle**: Drag handle at top for close
- **Backdrop**: Semi-transparent overlay

## Design Tokens

### Spacing

```css
--dropdown-padding: 8px;
--item-padding-x: 12px;
--item-padding-y: 8px;
--item-gap: 12px;
--avatar-size: 32px;
```

### Typography

```css
--item-name-size: 14px; /* text-sm */
--item-name-weight: 600; /* font-semibold */
--item-email-size: 12px; /* text-xs */
--search-size: 14px; /* text-sm */
```

### Colors

```css
--item-bg-hover: hsl(var(--accent));
--item-bg-selected: hsl(var(--accent));
--item-border-focus: hsl(var(--ring));
--item-text-name: hsl(var(--foreground));
--item-text-email: hsl(var(--muted-foreground));
```

## Implementation Roadmap

### Phase 1: Native Select (Current) ✅

- Use native HTML `<select>` element
- Simple implementation
- Works in task modal
- Accessible by default

### Phase 2: Custom Dropdown (Recommended)

- Build custom dropdown component
- Add search functionality
- Display avatars in list
- Implement keyboard navigation
- ARIA attributes for accessibility

### Phase 3: Advanced Features (Future)

1. **Multi-Select**: Allow selecting multiple users
2. **User Groups**: Group users by team/role
3. **Recent Users**: Show recently assigned users first
4. **User Status**: Show online/offline status
5. **User Capacity**: Show current task count per user
6. **Quick Actions**: Hover actions (email, view profile)

## Component API

### Props Interface

```typescript
interface AssigneeDropdownProps {
  users: User[];
  selectedId?: string | null;
  onSelectionChange: (userId: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  allowUnassigned?: boolean;
  multiSelect?: boolean; // Future
  searchable?: boolean;
  variant?: 'default' | 'compact' | 'large';
  className?: string;
}
```

### Usage Examples

**Basic**:
```tsx
<AssigneeDropdown
  users={users}
  selectedId={assigneeId}
  onSelectionChange={setAssigneeId}
/>
```

**With Placeholder**:
```tsx
<AssigneeDropdown
  users={users}
  selectedId={assigneeId}
  onSelectionChange={setAssigneeId}
  placeholder="Select assignee"
/>
```

**Compact** (for filters):
```tsx
<AssigneeDropdown
  users={users}
  selectedId={assigneeId}
  onSelectionChange={setAssigneeId}
  variant="compact"
/>
```

## Related Components

- Task Modal: [designs/task-modal.md](designs/task-modal.md)
- Task Detail Page: [designs/task-detail-page.md](designs/task-detail-page.md)
- Epic Task List: [designs/epic-task-list.md](designs/epic-task-list.md)
- My Tasks Dashboard: [designs/my-tasks-dashboard.md](designs/my-tasks-dashboard.md)

## Testing Checklist

### Visual Testing

- [ ] Dropdown opens below trigger
- [ ] Dropdown positions correctly on edges
- [ ] Avatar images load correctly
- [ ] Initials display when no image
- [ ] Colors meet contrast standards
- [ ] Hover states work correctly

### Interaction Testing

- [ ] Click opens/closes dropdown
- [ ] Click outside closes dropdown
- [ ] Click item selects and closes
- [ ] Click × clears selection
- [ ] Search filters list correctly
- [ ] Keyboard navigation works

### Accessibility Testing

- [ ] Screen reader announces all elements
- [ ] Keyboard can navigate all items
- [ ] Focus indicators are visible
- [ ] ARIA attributes are correct
- [ ] Touch targets are minimum size

### Responsive Testing

- [ ] Desktop view works correctly
- [ ] Mobile bottom sheet works
- [ ] Touch interactions work on mobile
- [ ] Dropdown handles resize events
