# Design System - Task Decomposition Tool

## Overview

This design system provides the visual foundation for the Task Decomposition Tool. It ensures consistency across all interfaces and establishes clear patterns for future development.

**Status**: ✅ Active
**Last Updated**: 2026-04-01
**Maintained By**: UI/UX Designer

---

## Color Palette

### Primary Colors

Used for primary actions, links, and key interactive elements.

| Color | Usage | Tailwind Class | Example |
|-------|-------|----------------|---------|
| Primary | CTAs, links, active states | `text-primary`, `bg-primary` | Main buttons, navigation links |
| Primary Foreground | Text on primary backgrounds | `text-primary-foreground` | Button text |

**Implementation**:
```jsx
<Button variant="default">Primary Action</Button>
<Link href="/projects" className="text-primary hover:underline">Projects</Link>
```

### Status Colors

Color-coded badges for task, epic, and project statuses.

| Status | Color | Light Mode | Dark Mode | Usage |
|--------|-------|------------|-----------|-------|
| **Project - Active** | Green | `bg-green-100 text-green-800` | `dark:bg-green-900/30 dark:text-green-400` | Active projects |
| **Project - Archived** | Gray | `bg-gray-100 text-gray-800` | `dark:bg-gray-800 dark:text-gray-400` | Archived projects |
| **Project - On Hold** | Yellow | `bg-yellow-100 text-yellow-800` | `dark:bg-yellow-900/30 dark:text-yellow-400` | Paused projects |
| **Epic/Task - Backlog/To Do** | Gray | `bg-gray-100 text-gray-800` | `dark:bg-gray-800 dark:text-gray-400` | Not started |
| **Epic/Task - In Progress** | Blue | `bg-blue-100 text-blue-800` | `dark:bg-blue-900/30 dark:text-blue-400` | Active work |
| **Epic/Task - In Review** | Purple | `bg-purple-100 text-purple-800` | `dark:bg-purple-900/30 dark:text-purple-400` | Under review |
| **Epic/Task - Done** | Green | `bg-green-100 text-green-800` | `dark:bg-green-900/30 dark:text-green-400` | Completed |
| **Epic/Task - Blocked** | Red | `bg-red-100 text-red-800` | `dark:bg-red-900/30 dark:text-red-400` | Blocked |
| **Epic/Task - Cancelled** | Red | `bg-red-100 text-red-800` | `dark:bg-red-900/30 dark:text-red-400` | Cancelled |

**Implementation**:
```jsx
<StatusBadge status="IN_PROGRESS" />
```

### Priority Colors

Color-coded badges for task/epic priorities.

| Priority | Color | Light Mode | Dark Mode | Icon |
|----------|-------|------------|-----------|------|
| **Critical** | Red | `bg-red-100 text-red-800` | `dark:bg-red-900/30 dark:text-red-400` | ⚡ |
| **High** | Orange | `bg-orange-100 text-orange-800` | `dark:bg-orange-900/30 dark:text-orange-400` | ↑ |
| **Medium** | Yellow | `bg-yellow-100 text-yellow-800` | `dark:bg-yellow-900/30 dark:text-yellow-400` | → |
| **Low** | Blue | `bg-blue-100 text-blue-800` | `dark:bg-blue-900/30 dark:text-blue-400` | ↓ |

**Implementation**:
```jsx
<PriorityBadge priority="HIGH" />
```

### Semantic Colors

Used for feedback messages and alerts.

| Purpose | Color | Tailwind Class |
|---------|-------|----------------|
| Success | Green | `text-green-600`, `bg-green-50`, `border-green-200` |
| Warning | Yellow | `text-yellow-600`, `bg-yellow-50`, `border-yellow-200` |
| Error | Red | `text-destructive`, `bg-destructive/10`, `border-destructive/50` |
| Info | Blue | `text-blue-600`, `bg-blue-50`, `border-blue-200` |

**Implementation**:
```jsx
<div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
  Error message here
</div>
```

### Neutral Grays

Used for text, borders, and backgrounds.

| Usage | Tailwind Class | Example |
|-------|----------------|---------|
| Primary text | `text-foreground` | Headings, body text |
| Secondary text | `text-muted-foreground` | Metadata, descriptions |
| Borders | `border-border`, `border-input` | Input fields, cards |
| Backgrounds | `bg-background` | Main background |
| Card backgrounds | `bg-card` | Cards, elevated surfaces |
| Hover states | `hover:bg-muted`, `hover:bg-accent` | Interactive elements |

---

## Typography

### Font Families

| Purpose | Font | Variable | Usage |
|---------|------|----------|-------|
| Sans-serif (headings, body) | Geist Sans | `--font-geist-sans` | All text by default |
| Monospace (code, IDs) | Geist Mono | `--font-geist-mono` | Code, technical data |

**Setup** (in `layout.tsx`):
```tsx
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
```

### Type Scale

| Element | Size | Weight | Line Height | Tailwind Class |
|---------|------|--------|-------------|----------------|
| H1 (page title) | 30px | 700 (bold) | Tight | `text-3xl font-bold tracking-tight` |
| H2 (section title) | 24px | 600 (semibold) | Tight | `text-2xl font-semibold` |
| H3 (card title) | 20px | 600 (semibold) | Normal | `text-xl font-semibold` |
| Body (base) | 14px | 400 (regular) | 1.5 | `text-sm` or default |
| Small (metadata) | 12px | 400 (regular) | Normal | `text-xs` |
| Caption (tiny) | 11px | 400 (regular) | Normal | Custom |

**Implementation Examples**:
```jsx
<h1 className="text-3xl font-bold tracking-tight">Projects</h1>
<p className="text-muted-foreground">Manage your projects</p>
<span className="text-xs text-muted-foreground">Created Jan 1, 2026</span>
```

### Font Weights

| Weight | Tailwind Class | Usage |
|--------|----------------|-------|
| 400 | `font-normal` | Body text, descriptions |
| 500 | `font-medium` | Emphasized text, links |
| 600 | `font-semibold` | Section headings, card titles |
| 700 | `font-bold` | Page titles, primary headings |

---

## Spacing

### Spacing Scale

Based on 4px base unit.

| Token | Value | Usage |
|-------|-------|-------|
| `1` | 4px | Tight spacing between related elements |
| `2` | 8px | Small gaps, icon spacing |
| `3` | 12px | Compact padding |
| `4` | 16px | Standard padding, card gaps |
| `6` | 24px | Section spacing |
| `8` | 32px | Large gaps |
| `12` | 48px | Major sections |
| `16` | 64px | Page-level spacing |

### Component Padding Rules

| Component | Padding | Tailwind Class |
|-----------|---------|----------------|
| Button (default) | 10px horizontal, 32px height | `px-2.5 h-8` |
| Button (small) | 10px horizontal, 28px height | `px-2.5 h-7` |
| Button (large) | 10px horizontal, 36px height | `px-2.5 h-9` |
| Badge | 10px horizontal, 2px vertical | `px-2.5 py-0.5` |
| Card | 32px all around | `p-8` |
| Input | 12px horizontal, 6px vertical | `px-3 py-1.5` |
| Table cell | 16px all around | `p-4` |

### Layout Margins

| Context | Margin | Tailwind Class |
|---------|--------|----------------|
| Page container | 32px top/bottom, 16px sides | `py-8 px-4` |
| Section header | 32px bottom | `mb-8` |
| Between sections | 24px | `gap-6`, `mb-6` |
| Header to content | 32px | `mb-8` |

---

## Components

### Buttons

Uses `@base-ui/react` Button primitive with variants via `class-variance-authority`.

**Variants**:

| Variant | Usage | Example |
|---------|-------|---------|
| `default` | Primary actions | `<Button>Save</Button>` |
| `outline` | Secondary actions | `<Button variant="outline">Cancel</Button>` |
| `secondary` | Alternative actions | `<Button variant="secondary">Draft</Button>` |
| `ghost` | Low-emphasis actions | `<Button variant="ghost">Edit</Button>` |
| `destructive` | Dangerous actions | `<Button variant="destructive">Delete</Button>` |
| `link` | Text-only actions | `<Button variant="link">Learn more</Button>` |

**Sizes**:

| Size | Height | Usage |
|------|--------|-------|
| `xs` | 24px | Compact buttons |
| `sm` | 28px | Small buttons |
| `default` | 32px | Standard buttons |
| `lg` | 36px | Prominent buttons |
| `icon` | 32px | Icon-only buttons |
| `icon-sm` | 28px | Small icon buttons |
| `icon-lg` | 36px | Large icon buttons |

**Implementation**:
```jsx
<Button variant="default" size="default">
  <Plus className="mr-2 h-4 w-4" />
  New Project
</Button>
```

### Badges

#### Status Badge

```jsx
<StatusBadge status="IN_PROGRESS" />
```

**Variants**: See Status Colors table above.

#### Priority Badge

```jsx
<PriorityBadge priority="HIGH" />
```

**Variants**: See Priority Colors table above.

### Form Elements

#### Input Fields

```jsx
<input
  className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
/>
```

**States**:
- Default: `border-input`
- Focus: `focus:ring-2 focus:ring-ring`
- Error: `aria-invalid:border-destructive`
- Disabled: `disabled:opacity-50`

#### Select Dropdowns

```jsx
<select
  className="rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
>
  <option value="">All</option>
  <option value="ACTIVE">Active</option>
</select>
```

### Data Table

```jsx
<DataTable
  columns={columns}
  data={data}
  loading={loading}
  emptyMessage="No data available"
/>
```

**Features**:
- Sortable columns (with sort icons)
- Hover states on rows
- Loading spinner
- Empty state with message
- Responsive overflow

### Cards

```jsx
<div className="rounded-xl border bg-card p-8 hover:bg-accent transition-colors">
  <h2 className="text-2xl font-semibold">Card Title</h2>
  <p className="text-muted-foreground">Card description</p>
</div>
```

**Variants**:
- Standard card: `border bg-card`
- Hoverable: `hover:bg-accent transition-colors`
- Elevated: Add shadow if needed (currently not used)

### Alerts and Messages

```jsx
{/* Error */}
<div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
  Error message here
</div>

{/* Success (custom) */}
<div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-600">
  Success message here
</div>
```

---

## Icons

### Icon Library

Uses **Lucide React** - `lucide-react` package v1.7.0

**Installation**:
```bash
npm install lucide-react
```

**Import**:
```jsx
import { Plus, Edit, Trash2, Filter, ArrowLeft } from 'lucide-react';
```

### Common Icons

| Icon | Component | Usage |
|------|-----------|-------|
| ➕ | `Plus` | Add new items |
| ✏️ | `Edit` | Edit actions |
| 🗑️ | `Trash2` | Delete actions |
| ← | `ArrowLeft` | Back navigation |
| → | `ArrowRight` | Forward indication |
| 🔽 | `ChevronDown` | Expand/collapse, sort desc |
| 🔼 | `ChevronUp` | Sort asc |
| 🔍 | `Filter` | Filter controls |
| 📁 | `FolderKanban` | Projects |
| 📚 | `Layers` | Epics |
| ✅ | `Check` | Done/completed |
| ⚠️ | `AlertTriangle` | Warnings |
| ❌ | `X` | Close/cancel |
| 🔒 | `Lock` | Blocked/locked |

### Icon Sizing

| Size | Tailwind Class | Usage |
|------|----------------|-------|
| 12px | `h-3 w-3` | Extra small icons |
| 14px | `h-3.5 w-3.5` | Small icons (sm buttons) |
| 16px | `h-4 w-4` | Standard icons (default buttons) |
| 20px | `h-5 w-5` | Medium icons |
| 24px | `h-6 w-6` | Large icons |
| 48px | `h-12 w-12` | Hero/home page icons |

**Implementation**:
```jsx
<Plus className="mr-2 h-4 w-4" />
<FolderKanban className="h-12 w-12 text-primary" />
```

---

## Layout Patterns

### Page Structure

```jsx
<div className="container mx-auto py-8 px-4">
  {/* Header */}
  <div className="mb-8 flex items-center justify-between">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Page Title</h1>
      <p className="text-muted-foreground">Page description</p>
    </div>
    <Button>Action</Button>
  </div>

  {/* Content */}
  <div className="mb-6">
    {/* Main content */}
  </div>
</div>
```

### Detail Page Structure

```jsx
<div className="container mx-auto py-8 px-4">
  {/* Breadcrumb / Back */}
  <Link href="/projects" className="mb-4 inline-flex items-center text-sm">
    <ArrowLeft className="mr-2 h-4 w-4" />
    Back to Projects
  </Link>

  {/* Title + Actions */}
  <div className="mb-8 flex items-start justify-between">
    <div>
      <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
      <p className="mt-2 text-muted-foreground">{project.description}</p>
    </div>
    <div className="flex gap-2">
      <Button variant="outline">Edit</Button>
      <Button variant="destructive">Delete</Button>
    </div>
  </div>

  {/* Metadata */}
  <div className="mb-6 flex items-center gap-4">
    <div>
      <span className="text-sm text-muted-foreground">Status: </span>
      <StatusBadge status={project.status} />
    </div>
  </div>

  {/* Content */}
</div>
```

### Filter Section

```jsx
<div className="mb-6 flex items-center gap-4">
  <div className="flex items-center gap-2">
    <Filter className="h-4 w-4 text-muted-foreground" />
    <span className="text-sm font-medium">Filters:</span>
  </div>
  <div className="flex flex-wrap gap-2">
    {/* Filter buttons or selects */}
  </div>
</div>
```

---

## Accessibility

### Color Contrast

All color combinations meet **WCAG AA** standards (4.5:1 for normal text, 3:1 for large text).

**Verified combinations**:
- ✅ Status badges (light background + dark text)
- ✅ Priority badges (light background + dark text)
- ✅ Primary buttons (handled by base-ui)
- ✅ Error messages (red on light red background)

### Keyboard Navigation

- ✅ All buttons are keyboard accessible via `@base-ui/react`
- ✅ Links are standard anchors
- ✅ Form inputs have visible focus states: `focus:ring-2 focus:ring-ring`
- ✅ Table headers are sortable via keyboard

### Focus Indicators

```jsx
className="... focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
```

### ARIA Labels

**Add to**:
- Icon-only buttons: `aria-label="Edit project"`
- Status badges: `aria-label="Status: In Progress"`
- Custom interactive elements

**Example**:
```jsx
<button aria-label="Edit project">
  <Edit className="h-4 w-4" />
</button>
```

### Screen Readers

- ✅ Semantic HTML (headings, lists, etc.)
- ✅ Loading states announced
- ✅ Error messages in error containers
- ⚠️ Need to add: `aria-live` for dynamic updates
- ⚠️ Need to test: Full screen reader flow

---

## Responsive Design

### Breakpoints

| Breakpoint | Min Width | Target Devices |
|------------|-----------|----------------|
| Mobile | < 768px | Phones |
| Tablet | 768px - 1024px | Tablets, small laptops |
| Desktop | > 1024px | Desktops, large laptops |

### Responsive Patterns

#### Container

```jsx
<div className="container mx-auto py-8 px-4">
  {/* Content */}
</div>
```

#### Grid Layouts

```jsx
{/* 1 column mobile, 2 columns tablet+ */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Cards */}
</div>
```

#### Flex Wrapping

```jsx
<div className="flex flex-wrap gap-4">
  {/* Filters that wrap on mobile */}
</div>
```

### Mobile Considerations

**Current state**: ⚠️ Needs audit

**Recommendations**:
- Stack tables into cards on mobile
- Use hamburger menu for navigation (if added)
- Make filter sections collapsible
- Optimize touch targets (min 44px)
- Test task detail page on mobile

---

## Animation & Micro-interactions

### Transitions

```jsx
className="transition-colors duration-200"
```

**Applied to**:
- Hoverable cards
- Buttons
- Links

### Loading States

```jsx
<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
```

### Hover Effects

**Cards**:
```jsx
className="hover:bg-accent transition-colors"
```

**Arrows**:
```jsx
className="group-hover:text-foreground group-hover:translate-x-1 transition-all"
```

**Buttons**:
- Built into base-ui Button component

### Recommended Animations

**To implement**:
1. **Fade in** for page loads
2. **Slide in** for modals
3. **Scale** for button presses
4. **AI thinking** animation for decomposition feature
5. **Toast** notifications for success/error

---

## Dark Mode

**Current Status**: ⚠️ Partially implemented

**What works**:
- Badge colors have dark mode variants
- Some components use dark mode semantic colors

**What needs work**:
- Full dark mode toggle
- Test all components in dark mode
- Document dark mode patterns

---

## File Structure

```
src/
├── components/
│   └── ui/
│       ├── button.tsx          # Button variants
│       ├── status-badge.tsx    # Status badges
│       ├── priority-badge.tsx  # Priority badges
│       └── data-table.tsx      # Reusable table
├── app/
│   ├── layout.tsx              # Root layout (fonts)
│   ├── page.tsx                # Home page
│   ├── projects/
│   │   ├── page.tsx            # Projects list
│   │   └── [id]/
│   │       └── page.tsx        # Project detail
│   └── epics/
│       ├── page.tsx            # Epics list
│       └── [id]/
│           └── page.tsx        # Epic detail
└── lib/
    └── utils.ts                # cn() utility for class merging
```

---

## Usage Guidelines

### When to Use Components

| Scenario | Component |
|----------|-----------|
| Primary action (save, submit) | `Button variant="default"` |
| Secondary action (cancel, go back) | `Button variant="outline"` |
| Delete/destroy | `Button variant="destructive"` |
| Status display | `StatusBadge` |
| Priority display | `PriorityBadge` |
| Tabular data | `DataTable` |
| Navigation | `Link` (Next.js) |

### Do's and Don'ts

**Do**:
✅ Use semantic HTML
✅ Maintain spacing scale
✅ Follow color patterns
✅ Add focus states
✅ Test keyboard navigation
✅ Use `cn()` for class merging

**Don't**:
❌ Hardcode colors (use semantic names)
❌ Skip hover states
❌ Ignore mobile layouts
❌ Forget ARIA labels for icon-only buttons
❌ Use arbitrary spacing values

---

## Future Improvements

### Short-term
1. ✅ Document existing patterns
2. ✅ Audit for consistency
3. ⏳ Add missing ARIA labels
4. ⏳ Implement toast notifications
5. ⏳ Add modal component

### Mid-term
1. ⏳ Full dark mode support
2. ⏳ Mobile-responsive tables
3. ⏳ Animation library integration
4. ⏳ Component storybook/docs site

### Long-term
1. ⏳ Design token system (CSS variables)
2. ⏳ Custom icon set
3. ⏳ Accessibility testing suite
4. ⏳ Internationalization support

---

## Changelog

| Date | Change | Author |
|------|--------|--------|
| 2026-04-01 | Initial design system documentation | UI/UX Designer |

---

**Questions? Contact the UI/UX Designer or consult this document before making visual changes.**
