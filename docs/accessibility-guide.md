# Accessibility Improvements Guide

**Project**: Task Decomposition Tool
**Author**: UI/UX Designer
**Date**: 2026-04-01
**Target Standard**: WCAG 2.1 AA
**Status**: 📋 Implementation Guide

---

## Overview

This guide provides specific, actionable improvements to make the Task Decomposition Tool accessible to all users, including those who use assistive technologies.

**Current Compliance Level**: 🔴 Partial (est. 60%)
**Target Compliance Level**: 🟢 WCAG 2.1 AA

---

## Executive Summary

The application has a solid foundation with semantic HTML and keyboard-navigable buttons. However, critical gaps exist in:

1. **ARIA labeling** - Missing labels on icon-only buttons
2. **Live regions** - No announcements for dynamic updates
3. **Form accessibility** - Lack of proper form components
4. **Focus management** - Inconsistent focus indicators
5. **Screen reader testing** - Untested workflows

**Estimated Effort**: 2-3 days for critical fixes

---

## Critical Fixes (Do Now)

### 1. Add ARIA Labels to Icon-Only Buttons

**Problem**: Icon-only buttons have no text content, making them inaccessible to screen reader users.

**Current Code**:
```jsx
<Button variant="outline" size="icon">
  <Edit className="h-4 w-4" />
</Button>
```

**Fixed Code**:
```jsx
<Button
  variant="outline"
  size="icon"
  aria-label="Edit project"
>
  <Edit className="h-4 w-4" />
</Button>
```

**Files to Update**:
- `src/app/projects/[id]/page.tsx`
- `src/app/epics/[id]/page.tsx`
- All future pages with icon buttons

**Pattern**:
```jsx
// Icons without visible text MUST have aria-label
<Button
  aria-label="{verb} {noun}"
  // Examples:
  // "Edit project"
  // "Delete task"
  // "Close dialog"
>
  <Icon />
</Button>
```

**Verification**:
```bash
# Test with screen reader
# 1. Navigate to button
# 2. Screen reader should announce: "{aria-label}, button"
```

---

### 2. Add Live Regions for Dynamic Updates

**Problem**: When data loads, errors appear, or status changes, screen readers aren't notified.

**Live Region Types**:
- `aria-live="polite"` - Announces when user pauses (status updates, success messages)
- `aria-live="assertive"` - Interrupts immediately (errors, critical alerts)

#### 2.1 Loading States

**Current Code**:
```jsx
{loading && (
  <div className="flex items-center justify-center p-8">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
  </div>
)}
```

**Fixed Code**:
```jsx
{loading && (
  <div
    className="flex items-center justify-center p-8"
    role="status"
    aria-live="polite"
  >
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    <span className="sr-only">Loading...</span>
  </div>
)}
```

**Add `sr-only` utility to `src/lib/utils.ts`**:
```tsx
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add this export
export const srOnly = "sr-only"

// Or use Tailwind's @tailwindcss/forms plugin
```

**Or in `globals.css`**:
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

#### 2.2 Error Messages

**Current Code**:
```jsx
{error && (
  <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
    {error}
  </div>
)}
```

**Fixed Code**:
```jsx
{error && (
  <div
    role="alert"
    aria-live="assertive"
    className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive"
  >
    <div className="flex items-center gap-2">
      <AlertCircle className="h-5 w-5" />
      <span className="font-medium">Error</span>
    </div>
    <p className="mt-1">{error}</p>
  </div>
)}
```

#### 2.3 Success Messages

**For future toast notifications**:
```jsx
<div
  role="status"
  aria-live="polite"
  className="rounded-lg border border-green-200 bg-green-50 p-4"
>
  Task created successfully
</div>
```

---

### 3. Create Accessible Form Components

**Problem**: Native HTML elements need proper labeling and error association.

#### 3.1 Input Component

**Create**: `src/components/ui/input.tsx`

```tsx
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  description?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, description, id, ...props }, ref) => {
    const inputId = id || React.useId()
    const errorId = error ? `${inputId}-error` : undefined
    const descriptionId = description ? `${inputId}-description` : undefined

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={inputId}>
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}

        <input
          id={inputId}
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          ref={ref}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={cn(
            errorId,
            descriptionId
          )}
          {...props}
        />

        {description && (
          <p id={descriptionId} className="text-sm text-muted-foreground">
            {description}
          </p>
        )}

        {error && (
          <p id={errorId} className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
```

**Usage**:
```jsx
<Input
  label="Task Title"
  error={errors.title}
  description="Enter a clear, concise title"
  required
/>
```

#### 3.2 Label Component

**Create**: `src/components/ui/label.tsx`

```tsx
"use client"

import * as React from "react"
import * as LabelPrimitive from "@base-ui/react/label"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
```

#### 3.3 Textarea Component

**Similar to Input, with multiline support**:
```tsx
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  description?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, description, id, ...props }, ref) => {
    // Similar structure to Input, but with <textarea>
    // ...
  }
)
```

---

### 4. Fix Focus Management

**Problem**: Focus indicators are inconsistent, and there's no focus trap in modals.

#### 4.1 Global Focus Styles

**Add to `globals.css`**:
```css
/* Visible focus indicator */
*:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}

/* Remove outline for mouse users */
*:focus:not(:focus-visible) {
  outline: none;
}

/* High contrast focus indicator */
@media (prefers-contrast: high) {
  *:focus-visible {
    outline: 3px solid currentColor;
    outline-offset: 3px;
  }
}
```

#### 4.2 Focus Trap for Modals (Future)

**When implementing dialogs**:
```tsx
// Use @base-ui/react's focus trap features
import { FocusTrap } from "@base-ui/react/focus-trap"

<FocusTrap>
  <Dialog>
    {/* Dialog content */}
  </Dialog>
</FocusTrap>
```

---

### 5. Improve Table Accessibility

**Problem**: DataTable needs semantic HTML and ARIA attributes.

**Update**: `src/components/ui/data-table.tsx`

```tsx
<thead className="[&_tr]:border-b">
  <tr className="border-b transition-colors hover:bg-muted/50">
    {columns.map((column) => (
      <th
        key={column.key}
        scope="col"
        aria-sort={getSortAria(column)} // Add this
        className={cn(
          'h-12 px-4 text-left align-middle font-medium text-muted-foreground',
          column.sortable && 'cursor-pointer hover:text-foreground',
          column.className
        )}
        onClick={() => handleSort(column)}
      >
        {/* ... */}
      </th>
    ))}
  </tr>
</thead>

// Add helper function
const getSortAria = (column: Column<T>): 'ascending' | 'descending' | undefined => {
  if (sortKey !== column.key) return undefined
  return sortDirection === 'asc' ? 'ascending' : 'descending'
}
```

---

### 6. Add Skip Navigation Link

**Problem**: Keyboard users must tab through all navigation to reach main content.

**Add to `layout.tsx`**:
```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Skip link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
        >
          Skip to main content
        </a>

        <AppProvider>
          <main id="main-content" tabIndex={-1}>
            {children}
          </main>
        </AppProvider>
      </body>
    </html>
  )
}
```

---

## High Priority Improvements

### 7. Add Keyboard Shortcuts

**For power users and keyboard accessibility**:

**Create**: `src/lib/keyboard-shortcuts.ts`

```typescript
export const keyboardShortcuts = {
  // Navigation
  'gotoProjects': 'g then p',
  'gotoEpics': 'g then e',
  'gotoTasks': 'g then t',

  // Actions
  'newItem': 'c',
  'search': '/',
  'openCommandPalette': 'cmd+k / ctrl+k',

  // Task actions
  'completeTask': 'x',
  'deleteTask': 'd',
} as const

// Implement with a global keyboard listener
```

**Display in help dialog**:
```tsx
<Dialog>
  <DialogContent>
    <DialogTitle>Keyboard Shortcuts</DialogTitle>
    <div className="space-y-2">
      <div className="flex justify-between">
        <span>New task</span>
        <kbd className="px-2 py-1 bg-muted rounded">C</kbd>
      </div>
      <div className="flex justify-between">
        <span>Search</span>
        <kbd className="px-2 py-1 bg-muted rounded">/</kbd>
      </div>
    </div>
  </DialogContent>
</Dialog>
```

---

### 8. Add Breadcrumb Navigation

**Improves orientation for screen reader users**:

```tsx
import { ChevronRight } from 'lucide-react'

<nav aria-label="Breadcrumb" className="mb-4">
  <ol className="flex items-center gap-2 text-sm">
    <li>
      <Link href="/projects" className="text-muted-foreground hover:text-foreground">
        Projects
      </Link>
    </li>
    <ChevronRight className="h-4 w-4 text-muted-foreground" />
    <li>
      <Link href="/projects/123" className="text-muted-foreground hover:text-foreground">
        Auth System
      </Link>
    </li>
    <ChevronRight className="h-4 w-4 text-muted-foreground" />
    <li aria-current="page" className="font-medium">
      Tasks
    </li>
  </ol>
</nav>
```

---

### 9. Implement Toast Notifications

**Replace in-page alerts with non-intrusive toasts**:

**Create**: `src/components/ui/toast.tsx`

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const toastVariants = cva(
  "pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive: "destructive group border-destructive bg-destructive text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface ToastProps extends VariantProps<typeof toastVariants> {
  title?: string
  description?: string
  onClose?: () => void
}

export function Toast({ variant, title, description, onClose }: ToastProps) {
  return (
    <div
      className={cn(toastVariants({ variant }))}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="grid gap-1">
        {title && <div className="text-sm font-semibold">{title}</div>}
        {description && <div className="text-sm opacity-90">{description}</div>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:opacity-100 group-hover:opacity-100"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
```

---

## Medium Priority Improvements

### 10. Add Color Blindness Support

**Don't rely on color alone**:

**Current** (bad):
```tsx
<StatusBadge status="IN_PROGRESS" /> // Only color
```

**Improved**:
```tsx
// Already good - includes text labels
<span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
  In Progress
</span>
```

**For charts/graphs (future)**:
- Use patterns + colors
- Add tooltips with values
- Provide text alternatives

---

### 11. Add Alternative Text for Images

**When user avatars are added**:

```tsx
<img
  src="/avatars/alice.jpg"
  alt="Alice Johnson's profile picture"
  // or
  alt="" // Decorative images
/>
```

---

### 12. Implement Autosuggest/Autocomplete

**For assignee dropdowns, use ARIA combobox pattern**:

```tsx
<Box
  role="combobox"
  aria-expanded={open}
  aria-haspopup="listbox"
  aria-owns="assignee-list"
  aria-labelledby="assignee-label"
>
  <Input
    id="assignee-input"
    aria-autocomplete="list"
    aria-controls="assignee-list"
    aria-activedescendant={activeOptionId}
  />
  <Listbox id="assignee-list" role="listbox">
    {/* Options */}
  </Listbox>
</Box>
```

---

## Testing Checklist

### Automated Testing

**Run with axe-core or similar**:
```bash
npm install --save-dev @axe-core/react
```

**Add to tests**:
```tsx
import { axe } from '@axe-core/react'

it('should not have accessibility violations', async () => {
  const { container } = render(<ProjectsPage />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})
```

### Manual Testing Checklist

#### Keyboard Navigation

- [ ] Can navigate to all interactive elements with Tab
- [ ] Visible focus indicator on all focusable elements
- [ ] Tab order is logical (left-to-right, top-to-bottom)
- [ ] Can activate buttons with Enter/Space
- [ ] Can navigate dropdowns with arrow keys
- [ ] Can dismiss modals with Escape

#### Screen Reader Testing

**Test with NVDA (Windows) or VoiceOver (Mac)**:

- [ ] Page title announced on load
- [ ] Landmarks used correctly (main, nav, etc.)
- [ ] Headings create proper outline (h1 → h2 → h3)
- [ ] Links describe their purpose (not "click here")
- [ ] Form inputs have associated labels
- [ ] Error messages are announced
- [ ] Dynamic content changes are announced (live regions)
- [ ] Tables have proper headers

#### Color Contrast

**Use Chrome DevTools Lighthouse**:

- [ ] All text has contrast ratio ≥ 4.5:1
- [ ] Large text (18pt+) has contrast ≥ 3:1
- [ ] UI components have contrast ≥ 3:1

**Test with**:
- Chrome Extension: "WCAG Color Contrast Checker"
- Online: https://webaim.org/resources/contrastchecker/

#### Zoom/Resize

- [ ] Page usable at 200% zoom
- [ ] Page usable at 400% zoom (no horizontal scroll)
- [ ] Content reflows properly on mobile

---

## Accessibility Statement

**Create**: `/accessibility` page

```tsx
// src/app/accessibility/page.tsx
export default function AccessibilityPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      <h1 className="text-3xl font-bold mb-4">Accessibility Statement</h1>

      <p className="mb-4">
        The Task Decomposition Tool is committed to ensuring digital accessibility for people with disabilities.
      </p>

      <h2 className="text-2xl font-semibold mb-2">Conformance Status</h2>
      <p className="mb-4">
        We are working to conform to WCAG 2.1 Level AA. Some content may not fully conform while we improve accessibility.
      </p>

      <h2 className="text-2xl font-semibold mb-2">Accessibility Features</h2>
      <ul className="list-disc pl-6 mb-4 space-y-1">
        <li>Semantic HTML structure</li>
        <li>Keyboard navigation support</li>
        <li>Screen reader compatible</li>
        <li>Color contrast meeting WCAG AA</li>
        <li>Focus indicators on interactive elements</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-2">Known Limitations</h2>
      <ul className="list-disc pl-6 mb-4 space-y-1">
        <li>Some tables may be difficult on mobile (we're working on responsive views)</li>
        <li>Modal focus management needs improvement</li>
        <li>Some dynamic content changes not announced to screen readers</li>
      </ul>

      <h2 className="text-2xl font-semibold mb-2">Feedback</h2>
      <p className="mb-4">
        We welcome feedback on accessibility. Please contact us at{' '}
        <a href="mailto:accessibility@example.com" className="text-primary hover:underline">
          accessibility@example.com
        </a>
      </p>
    </div>
  )
}
```

---

## Implementation Timeline

### Week 1 (Critical Fixes)
- [ ] Add aria-label to all icon buttons
- [ ] Add live regions for loading and errors
- [ ] Create accessible form components
- [ ] Fix table ARIA attributes

### Week 2 (High Priority)
- [ ] Add skip navigation link
- [ ] Implement focus styles
- [ ] Add toast notifications
- [ ] Implement breadcrumb navigation

### Week 3 (Testing & Polish)
- [ ] Screen reader testing
- [ ] Keyboard navigation testing
- [ ] Color contrast audit
- [ ] Create accessibility statement page

---

## Resources

- **WCAG 2.1 Quick Reference**: https://www.w3.org/WAI/WCAG21/quickref/
- **ARIA Authoring Practices**: https://www.w3.org/WAI/ARIA/apg/
- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **axe DevTools**: https://www.deque.com/axe/devtools/

---

**Document Author**: UI/UX Designer
**Last Updated**: 2026-04-01
**Next Review**: After critical fixes implemented
