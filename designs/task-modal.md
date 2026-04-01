# Task Create/Edit Modal Design

## Overview

The Task Modal is used for creating new tasks and editing existing tasks. It provides a focused form interface with validation, keyboard shortcuts, and responsive design.

## Modal Structure

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Header                                                      │
│  ├─ Title: "Create New Task" / "Edit Task"                  │
│  └─ Close Button (X)                                         │
├─────────────────────────────────────────────────────────────┤
│  Form Content (scrollable, max-height: 70vh)                 │
│  ├─ Error Alert (if applicable)                              │
│  ├─ Title Input (*)                                          │
│  ├─ Description Textarea                                     │
│  ├─ Epic Select (*)                                          │
│  ├─ Assignee Select                                          │
│  ├─ Status Select (edit mode only)                          │
│  ├─ Priority Select (*)                                      │
│  ├─ Story Points + Estimated Hours (2-col)                  │
│  ├─ Actual Hours (edit mode only)                           │
│  ├─ Start Date + Due Date (2-col)                           │
│  └─ Last Updated (edit mode only)                           │
├─────────────────────────────────────────────────────────────┤
│  Footer                                                      │
│  ├─ Left: Cancel Button                                      │
│  └─ Right: Create/Update Button                             │
└─────────────────────────────────────────────────────────────┘
```

### Modal Sizing

| Size | Width | Use Case |
|------|-------|----------|
| `lg` | max-w-2xl (672px) | Default for task modal |

**Rationale**: The `lg` size provides enough width for 2-column layouts while maintaining focus on the form.

## Form Layout

### Field Arrangement

#### Required Fields (marked with *)

1. **Title** (*): Text input, auto-focus on open
2. **Epic** (*): Select dropdown
3. **Priority** (*): Select dropdown

#### Optional Fields

4. **Description**: Textarea with markdown support
5. **Assignee**: Select dropdown with search
6. **Status**: Select dropdown (edit mode only)
7. **Story Points**: Number input (0-13)
8. **Estimated Hours**: Number input (decimal, 0.5 increments)
9. **Actual Hours**: Number input (edit mode only)
10. **Start Date**: Date picker
11. **Due Date**: Date picker

#### Layout Order

```
┌─────────────────────────────────────────┐
│  Title (*)                               │  Full-width, auto-focus
├─────────────────────────────────────────┤
│  Description                             │  Full-width, 4 rows
├─────────────────────────────────────────┤
│  Epic (*)        |  Assignee            │  2-column grid
├─────────────────────────────────────────┤
│  Status (edit)   |  Priority (*)        │  2-column grid
├─────────────────────────────────────────┤
│  Story Points    |  Est. Hours          │  2-column grid
├─────────────────────────────────────────┤
│  Actual Hours (edit only)               │  Full-width
├─────────────────────────────────────────┤
│  Start Date      |  Due Date            │  2-column grid
└─────────────────────────────────────────┘
```

### Field Specifications

#### Title Input

**Type**: Text input
**Width**: Full-width
**Height**: 40px (h-10)
**Placeholder**: "Enter task title"
**Validation**:
- Required: Yes
- Min length: 3 characters
- Max length: 200 characters
- Trim whitespace
**Error Message**: "Title must be at least 3 characters"

**HTML:**
```html
<input
  type="text"
  id="title"
  required
  minLength="3"
  maxLength="200"
  placeholder="Enter task title"
  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
/>
```

#### Description Textarea

**Type**: Multiline text input
**Width**: Full-width
**Height**: 96px (4 rows)
**Placeholder**: "Enter task description (supports Markdown)"
**Validation**:
- Required: No
- Max length: 5000 characters
**Features**:
- Markdown preview toggle (optional, future enhancement)
- Character count: "250/5000"
**Error Message**: "Description too long (max 5000 characters)"

#### Epic Select

**Type**: Native select (custom dropdown in future)
**Width**: Full-width (or 50% in 2-col layout)
**Height**: 40px (h-10)
**Options**:
- Default: "Select an epic"
- List: All active epics, sorted by title
**Validation**:
- Required: Yes
- Disabled: When epic is pre-selected (e.g., creating from epic page)
**Error Message**: "Please select an epic"

#### Assignee Select

**Type**: Native select (custom dropdown with search in future)
**Width**: Full-width (or 50% in 2-col layout)
**Height**: 40px (h-10)
**Options**:
- Default: "Unassigned"
- List: All active users, sorted by name
**Format**: "Name (email@example.com)"
**Validation**:
- Required: No
**Note**: Future enhancement: Custom dropdown with avatar preview and search

#### Status Select (Edit Mode Only)

**Type**: Native select
**Width**: Full-width (or 50% in 2-col layout)
**Height**: 40px (h-10)
**Options**:
- TODO (To Do)
- IN_PROGRESS (In Progress)
- IN_REVIEW (In Review)
- DONE (Done)
- BLOCKED (Blocked)
- CANCELLED (Cancelled)
**Validation**:
- Required: No (defaults to TODO for new tasks)
**Display**: Show status badge next to option text

#### Priority Select

**Type**: Native select
**Width**: Full-width (or 50% in 2-col layout)
**Height**: 40px (h-10)
**Options**:
- LOW (Low)
- MEDIUM (Medium) - default
- HIGH (High)
- CRITICAL (Critical)
**Validation**:
- Required: Yes
- Default: MEDIUM
**Display**: Show priority badge/icon next to option text

#### Story Points Input

**Type**: Number input
**Width**: Full-width (in 2-col grid)
**Height**: 40px (h-10)
**Placeholder**: "1-13"
**Validation**:
- Required: No
- Min: 0
- Max: 13
- Integer only
**Error Message**: "Story points must be between 0 and 13"

#### Estimated Hours Input

**Type**: Number input
**Width**: Full-width (in 2-col grid)
**Height**: 40px (h-10)
**Placeholder**: "0"
**Validation**:
- Required: No
- Min: 0
- Step: 0.5 (decimal)
**Error Message**: "Estimated hours must be a positive number"

#### Actual Hours Input (Edit Mode Only)

**Type**: Number input
**Width**: Full-width
**Height**: 40px (h-10)
**Placeholder**: "0"
**Validation**:
- Required: No
- Min: 0
- Step: 0.5 (decimal)
**Error Message**: "Actual hours must be a positive number"

#### Start Date Input

**Type**: Date input
**Width**: Full-width (in 2-col grid)
**Height**: 40px (h-10)
**Validation**:
- Required: No
- Format: YYYY-MM-DD
**Note**: Can be after due date (allowed for tracking purposes)

#### Due Date Input

**Type**: Date input
**Width**: Full-width (in 2-col grid)
**Height**: 40px (h-10)
**Validation**:
- Required: No
- Format: YYYY-MM-DD
**Warning**: If before start date, show warning text (not error)

## Validation Error Display

### Error Message Pattern

**Location**: Immediately below the field
**Style**:
- Text color: `text-destructive`
- Font size: `text-xs`
- Margin top: `mt-1`
- Icon: Optional (exclamation circle)

**HTML:**
```html
<input aria-invalid={!!errors.title} aria-describedby={errors.title ? 'title-error' : undefined} />
{errors.title && <p id="title-error" className="mt-1 text-xs text-destructive">{errors.title}</p>}
```

### Global Errors

**Location**: Top of form, below header
**Style**: Alert component with destructive border
**Content**:
- Icon: AlertCircle
- Title: "Error"
- Message: Error details from API

**HTML:**
```html
<div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
  <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
  <div>
    <p className="font-medium">Error</p>
    <p className="text-sm">{error}</p>
  </div>
</div>
```

## Button Placement and Hierarchy

### Footer Buttons

**Layout**: Flex container, right-aligned
**Spacing**: 12px gap between buttons

#### Cancel Button

**Variant**: `outline`
**Size**: `default` (h-8)
**Label**: "Cancel"
**Behavior**: Closes modal without saving
**Disabled**: When submitting or success

#### Submit Button

**Variant**: `default`
**Size**: `default` (h-8)
**Label**:
- Create mode: "Create Task"
- Edit mode: "Update Task"
- Submitting: "Saving..." with spinner icon
**Behavior**: Validates and submits form
**Disabled**: When submitting or success
**Icon**: Loader2 with animate-spin when submitting

**HTML:**
```html
<div className="flex justify-end gap-3 pt-4 border-t">
  <Button type="button" variant="outline" onClick={onClose} disabled={submitting || success}>
    Cancel
  </Button>
  <Button type="button" onClick={handleSubmit} disabled={submitting || success}>
    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
    {submitButtonText}
  </Button>
</div>
```

### Button Hierarchy

1. **Primary**: Submit button (default variant)
2. **Secondary**: Cancel button (outline variant)

## Modal Sizing and Positioning

### Sizing

**Size**: `lg` (max-w-2xl / 672px)
**Max Height**: 70vh for content area (overflow-y-auto)
**Padding**:
- Header: 24px (p-6)
- Content: 24px (p-6)
- Footer: 24px (p-6)

### Positioning

**Overlay**:
- Fixed position: `fixed inset-0`
- Background: `bg-black/50` (semi-transparent black)
- Flex center: `flex items-center justify-center`
- Padding: `p-4` (mobile edge spacing)
- Z-index: `z-50`

**Modal Container**:
- Relative positioning
- Background: `bg-background`
- Rounded: `rounded-lg`
- Shadow: `shadow-lg`
- Click propagation: Stop propagation to prevent closing when clicking modal content

## Keyboard Shortcuts

### Defined Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| `Escape` | Close modal | Always active |
| `Ctrl/Cmd + Enter` | Submit form | When form is valid |
| `Tab` / `Shift + Tab` | Navigate fields | Standard form navigation |
| `Arrow Down/Up` | Navigate select options | When select is focused |

### Keyboard Navigation

1. **On Open**: Auto-focus title input
2. **Tab Order**: Title → Description → Epic → Assignee → Status → Priority → Story Points → Est. Hours → Actual Hours → Start Date → Due Date → Cancel → Submit
3. **Escape**: Closes modal immediately
4. **Enter**: Submits form (only when Ctrl/Cmd is pressed)

## Success State

### Display

**Content**: Success message replaces form content
**Layout**: Centered flex column
**Components**:
- Icon: CheckCircle2, 64px (h-16 w-16), green color
- Heading: "Success!", text-xl, font-semibold, margin-bottom: 8px
- Message: "Task created/updated successfully", text-muted-foreground

**Auto-Close**: Modal closes after 1.5 seconds and redirects

**HTML:**
```html
<div className="flex flex-col items-center justify-center py-12">
  <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
  <h3 className="text-xl font-semibold mb-2">Success!</h3>
  <p className="text-muted-foreground">
    Task {mode === 'create' ? 'created' : 'updated'} successfully
  </p>
</div>
```

## Responsive Behavior

### Desktop (≥768px)

**Layout**: As specified above
**2-Column Grid**: Works for paired fields
**Modal Width**: max-w-2xl (672px)

### Mobile (≤767px)

**Layout**: Single column, all fields stack
**Modal Width**: Full-width with 16px edge padding
**2-Column Grid**: Converted to single column
**Buttons**: Full-width, stacked (Cancel on top, Submit on bottom)
**Date Inputs**: Native date pickers (platform-specific)

## Accessibility Guidelines

### ARIA Labels

- **Modal**: `role="dialog"`, `aria-modal="true"`, `aria-labelledby="dialog-title"`
- **Form Fields**: `aria-invalid`, `aria-describedby` for error messages
- **Required Fields**: Visual indicator (*) + `required` attribute
- **Disabled Fields**: `disabled` attribute + visual styling

### Focus Management

- **On Open**: Focus title input (after 100ms delay for animation)
- **On Close**: Return focus to trigger element (button that opened modal)
- **Focus Trap**: Keep focus within modal when open
- **Focus Indicators**: 2px ring on all interactive elements

### Screen Reader Support

- **Announcements**: Live region for success/error states
- **Error Messages**: Associated with form fields via `aria-describedby`
- **Status Changes**: Announced after form submission
- **Field Labels**: All inputs have associated labels

### Keyboard Accessibility

- **No Mouse Required**: All actions available via keyboard
- **Visible Focus**: All interactive elements show focus state
- **Skip Links**: Not needed (modal is focused context)
- **Escape Key**: Always closes modal

## Validation Strategy

### Client-Side Validation

1. **Real-time Validation**: Validate on blur for each field
2. **Submit Validation**: Validate all fields on submit
3. **Error Display**: Show errors immediately below fields
4. **Error Clearing**: Clear errors when user starts typing

### Server-Side Validation

1. **API Response**: Return validation errors with field names
2. **Error Mapping**: Map API errors to form fields
3. **Global Errors**: Display at top of form if not field-specific
4. **Success Response**: Show success state before closing

### Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| Title | required, min 3, max 200 | "Title must be between 3 and 200 characters" |
| Description | max 5000 | "Description too long (max 5000 characters)" |
| Epic | required | "Please select an epic" |
| Priority | required | "Please select a priority" |
| Story Points | min 0, max 13 | "Story points must be between 0 and 13" |
| Est. Hours | min 0 | "Estimated hours must be positive" |
| Actual Hours | min 0 | "Actual hours must be positive" |

## Design Tokens

### Spacing

```css
--field-spacing: 16px; /* Space between field groups */
--input-height: 40px; /* Height of text inputs */
--input-padding: 12px; /* Padding inside inputs */
--label-spacing: 4px; /* Space between label and input */
```

### Typography

```css
--label-font-size: 14px; /* text-sm */
--label-font-weight: 500; /* font-medium */
--input-font-size: 14px; /* text-sm */
--error-font-size: 12px; /* text-xs */
```

### Colors

```css
--input-border: hsl(var(--input));
--input-border-focus: hsl(var(--ring));
--input-bg: hsl(var(--background));
--input-text: hsl(var(--foreground));
--error-text: hsl(var(--destructive));
--error-bg: hsl(var(--destructive) / 0.1);
--error-border: hsl(var(--destructive) / 0.5);
```

## Implementation Notes

### Component Usage

- **Dialog**: Use existing `Dialog` component from `src/components/ui/dialog.tsx`
- **Button**: Use existing `Button` component from `src/components/ui/button.tsx`
- **Icons**: Use lucide-react icons (Loader2, CheckCircle2, AlertCircle)

### Form State Management

- Use React state for form data
- Validate on submit (and optionally on blur)
- Show loading state during API calls
- Handle errors gracefully with user-friendly messages

### Future Enhancements

1. **Custom Assignee Dropdown**: With avatar preview and search
2. **Custom Status/Priority Dropdowns**: With badge/icon display
3. **Markdown Preview**: Toggle between edit and preview for description
4. **Field Validation on Blur**: Show errors as user tabs through form
5. **Auto-Save**: Save draft to localStorage (optional)
6. **Form Templates**: Pre-defined task templates

## Related Components

- Task Detail Page: [designs/task-detail-page.md](designs/task-detail-page.md)
- Status Badge: [designs/status-badge.md](designs/status-badge.md)
- Assignee Dropdown: [designs/assignee-dropdown.md](designs/assignee-dropdown.md)
- Epic Task List: [designs/epic-task-list.md](designs/epic-task-list.md)
