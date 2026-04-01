# Responsive Design Guidelines

**Project**: Task Decomposition Tool
**Designer**: UI/UX Designer
**Date**: 2026-04-01
**Status**: 📱 Mobile-First Approach

---

## Overview

This guide provides responsive design specifications for the Task Decomposition Tool, ensuring a seamless experience across all device sizes.

**Target Devices**:
- Mobile: < 768px (phones)
- Tablet: 768px - 1024px (tablets, small laptops)
- Desktop: > 1024px (desktops, large laptops)

---

## Breakpoint System

### Standard Breakpoints

| Breakpoint | Min Width | Max Width | Target Devices | Container |
|------------|-----------|-----------|----------------|-----------|
| Mobile First | 0px | 767px | Phones (all) | 100% width |
| Tablet | 768px | 1023px | iPads, small laptops | 728px max |
| Desktop | 1024px | ∞ | Desktops, large laptops | 1200px max |
| Wide Desktop | 1440px | ∞ | Ultra-wide monitors | 1400px max |

### Tailwind Configuration

**Current**: Using default Tailwind breakpoints

**Custom Breakpoints** (if needed in `tailwind.config.ts`):
```ts
export default {
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
  },
}
```

---

## Mobile-First Approach

**Design for mobile first, then enhance for larger screens.**

### Why Mobile-First?

1. **Performance**: Mobile users get minimal CSS
2. **Progressive Enhancement**: Add features for larger screens
3. **User Behavior**: 40% of users access on mobile (estimate)
4. **Forces Prioritization**: Limited space = focused content

### Mobile-First CSS Pattern

```tsx
// Mobile first (default)
<div className="flex flex-col gap-4">
  {/* Single column on mobile */}
</div>

// Tablet enhancement
<div className="flex flex-col md:flex-row gap-4">
  {/* Two columns on tablet+ */}
</div>

// Desktop enhancement
<div className="flex flex-col md:flex-row lg:grid lg:grid-cols-3 gap-4">
  {/* Three columns on desktop */}
</div>
```

---

## Page-Level Responsive Patterns

### Container Pattern

**Use for all page content**:

```tsx
<div className="container mx-auto px-4">
  {/* Content */}
</div>

// With max-width for larger screens
<div className="container mx-auto px-4 max-w-7xl">
  {/* Content won't stretch beyond 1280px */}
</div>
```

**Padding**:
- Mobile: `px-4` (16px)
- Tablet: `px-6` (24px)
- Desktop: `px-8` (32px)

**Enhanced**:
```tsx
<div className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
  {/* Responsive horizontal padding */}
</div>
```

---

## Component Responsive Patterns

### 1. Navigation

#### Mobile (< 768px)

**Pattern**: Bottom navigation bar or hamburger menu

```tsx
// Bottom nav (recommended for task-focused app)
<nav className="fixed bottom-0 left-0 right-0 bg-border md:hidden">
  <div className="flex justify-around py-2">
    <Link href="/projects" className="flex flex-col items-center p-2">
      <FolderKanban className="h-6 w-6" />
      <span className="text-xs">Projects</span>
    </Link>
    <Link href="/epics" className="flex flex-col items-center p-2">
      <Layers className="h-6 w-6" />
      <span className="text-xs">Epics</span>
    </Link>
    <Link href="/tasks" className="flex flex-col items-center p-2">
      <CheckSquare className="h-6 w-6" />
      <span className="text-xs">Tasks</span>
    </Link>
  </div>
</nav>

// Add padding to main content to avoid overlap
<main className="pb-20 md:pb-8">
  {/* Content */}
</main>
```

#### Tablet & Desktop (≥ 768px)

**Pattern**: Top navigation bar

```tsx
<nav className="hidden md:flex items-center gap-6 border-b">
  <Link href="/projects" className="font-medium">Projects</Link>
  <Link href="/epics" className="font-medium">Epics</Link>
  <Link href="/tasks" className="font-medium">Tasks</Link>
</nav>
```

---

### 2. Data Tables

#### Mobile (< 768px)

**Problem**: Tables don't fit on small screens.

**Solution**: Transform to card layout

```tsx
// Mobile: card view
<div className="md:hidden space-y-4">
  {tasks.map(task => (
    <div key={task.id} className="rounded-lg border bg-card p-4">
      <h3 className="font-semibold">{task.title}</h3>
      <div className="mt-2 flex flex-wrap gap-2">
        <StatusBadge status={task.status} />
        <PriorityBadge priority={task.priority} />
      </div>
      <div className="mt-3 text-sm text-muted-foreground">
        <div>Assignee: {task.assignee?.name || 'Unassigned'}</div>
        <div>Due: {task.dueDate || '—'}</div>
      </div>
      <div className="mt-3">
        <Link href={`/tasks/${task.id}`} className="text-sm text-primary">
          View Details →
        </Link>
      </div>
    </div>
  ))}
</div>

// Tablet+: table view
<div className="hidden md:block">
  <DataTable columns={columns} data={tasks} />
</div>
```

**Alternative**: Horizontal scroll

```tsx
<div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
  <table className="min-w-full">
    {/* Table content */}
  </table>
</div>
```

**Recommendation**: Use card view for better UX

---

### 3. Filters

#### Mobile (< 768px)

**Pattern**: Collapsible accordion or sheet

```tsx
import { useState } from 'react'
import { ChevronDown, Filter } from 'lucide-react'

export function MobileFilters({ filters, onFilterChange }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full p-3 border rounded-lg"
        aria-expanded={isOpen}
      >
        <Filter className="h-4 w-4" />
        <span className="font-medium">Filters</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="mt-2 p-4 border rounded-lg bg-card space-y-4">
          {/* Filter controls */}
          <div>
            <label className="text-sm font-medium">Status</label>
            <Select value={filters.status} onValueChange={(v) => onFilterChange('status', v)}>
              <SelectTrigger className="w-full mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="TODO">To Do</SelectItem>
                {/* ... */}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}
```

#### Tablet & Desktop (≥ 768px)

**Pattern**: Visible filters inline

```tsx
<div className="hidden md:flex flex-wrap items-center gap-4">
  {/* Filters visible */}
</div>
```

---

### 4. Forms

#### Mobile (< 768px)

**Single column, full-width inputs**:

```tsx
<form className="space-y-4">
  <Input label="Title" fullWidth />
  <Textarea label="Description" rows={4} fullWidth />
  <div className="grid grid-cols-1 gap-4">
    <Select label="Status" />
    <Select label="Priority" />
  </div>
</form>
```

#### Tablet & Desktop (≥ 768px)

**Two-column layout**:

```tsx
<form className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="md:col-span-2">
    <Input label="Title" fullWidth />
  </div>
  <div className="md:col-span-2">
    <Textarea label="Description" rows={4} fullWidth />
  </div>
  <Select label="Status" />
  <Select label="Priority" />
  <Input label="Assignee" />
  <Input label="Due Date" type="date" />
</form>
```

---

### 5. Task Detail Page

#### Mobile (< 768px)

**Single column, stacked sections**:

```tsx
<div className="space-y-4">
  {/* Title section */}
  <div>
    <h1 className="text-2xl font-bold">{task.title}</h1>
    <div className="mt-2 flex flex-wrap gap-2">
      <StatusBadge status={task.status} />
      <PriorityBadge priority={task.priority} />
    </div>
  </div>

  {/* Metadata - stacked */}
  <div className="space-y-3 rounded-lg border bg-card p-4">
    <div>
      <span className="text-xs text-muted-foreground">Assignee</span>
      <div className="text-sm font-medium">{task.assignee?.name || 'Unassigned'}</div>
    </div>
    <div>
      <span className="text-xs text-muted-foreground">Due Date</span>
      <div className="text-sm font-medium">{task.dueDate || '—'}</div>
    </div>
  </div>

  {/* Other sections */}
</div>
```

#### Tablet & Desktop (≥ 768px)

**Metadata grid**:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 rounded-lg border bg-card p-6">
  <div>
    <span className="text-sm text-muted-foreground">Assignee</span>
    <div className="text-sm font-medium">{task.assignee?.name || 'Unassigned'}</div>
  </div>
  {/* ... */}
</div>
```

---

### 6. Cards & Grids

#### Mobile (< 768px)

**Single column**:

```tsx
<div className="grid grid-cols-1 gap-4">
  {/* Cards */}
</div>
```

#### Tablet (768px - 1023px)

**Two columns**:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Cards */}
</div>
```

#### Desktop (≥ 1024px)

**Three or four columns**:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* Cards */}
</div>
```

**Example: Home page cards**:

```tsx
// Current (good)
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl mt-8">
  <Link href="/projects" className="group">
    <div className="flex flex-col items-center gap-4 p-8 rounded-xl border">
      {/* ... */}
    </div>
  </Link>
  <Link href="/epics" className="group">
    <div className="flex flex-col items-center gap-4 p-8 rounded-xl border">
      {/* ... */}
    </div>
  </Link>
</div>
```

---

### 7. Modals/Dialogs

#### Mobile (< 768px)

**Full-screen bottom sheet**:

```tsx
<div className="fixed inset-0 z-50 md:items-center md:justify-center">
  {/* Backdrop */}
  <div className="absolute inset-0 bg-black/50" />

  {/* Sheet - full width on mobile, centered modal on desktop */}
  <div className="absolute bottom-0 left-0 right-0 md:relative md:max-w-lg md:w-full">
    <div className="max-h-[90vh] overflow-y-auto rounded-t-xl bg-background md:rounded-lg p-6">
      {/* Modal content */}
    </div>
  </div>
</div>
```

#### Desktop (≥ 768px)

**Centered modal with max-width**:

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
  <div className="max-w-lg w-full max-h-[90vh] overflow-y-auto rounded-lg bg-background p-6">
    {/* Modal content */}
  </div>
</div>
```

---

### 8. Buttons & Actions

#### Mobile (< 768px)

**Stack buttons vertically**:

```tsx
<div className="flex flex-col gap-3">
  <Button size="lg" className="w-full">Primary Action</Button>
  <Button variant="outline" size="lg" className="w-full">Secondary</Button>
</div>
```

#### Tablet & Desktop (≥ 768px)

**Horizontal layout**:

```tsx
<div className="flex gap-3">
  <Button>Primary Action</Button>
  <Button variant="outline">Secondary</Button>
</div>
```

**Touch target size**: Minimum 44×44px on mobile

---

### 9. Typography

#### Mobile (< 768px)

**Smaller base size**:

```tsx
<h1 className="text-2xl font-bold">Page Title</h1> {/* was text-3xl */}
<p className="text-sm">Description</p>
```

**Reduce heading levels**:
- H1: 24px (`text-2xl`)
- H2: 20px (`text-xl`)
- H3: 18px (`text-lg`)

#### Desktop (≥ 1024px)

**Full size headings**:

```tsx
<h1 className="text-3xl font-bold">Page Title</h1>
<h2 className="text-2xl font-semibold">Section</h2>
<h3 className="text-xl font-semibold">Subsection</h3>
```

---

### 10. Spacing

#### Mobile (< 768px)

**Compact spacing**:

```tsx
<div className="space-y-3 p-4">
  {/* Less space between elements */}
</div>
```

**Reduce padding**:
- Cards: `p-4` (16px)
- Sections: `py-6 px-4` (24px/16px)

#### Desktop (≥ 1024px)

**More breathing room**:

```tsx
<div className="space-y-6 p-8">
  {/* More space between elements */}
</div>
```

**Increase padding**:
- Cards: `p-6` to `p-8` (24px-32px)
- Sections: `py-12 px-8` (48px/32px)

---

## Responsive Images

### Avatar Images

**Responsive sizing**:

```tsx
<Avatar className="h-8 w-8 md:h-10 md:w-10 lg:h-12 lg:w-12">
  <AvatarImage src={avatar} />
  <AvatarFallback>AB</AvatarFallback>
</Avatar>
```

### Hero/Home Page Icons

```tsx
<FolderKanban className="h-10 w-10 md:h-12 md:w-12 lg:h-16 lg:w-16 text-primary" />
```

---

## Touch vs Click

### Touch Optimizations (Mobile)

1. **Larger touch targets**: Min 44×44px
2. **No hover states**: Use `active:` instead
3. **Native inputs**: Use `<input type="date">` instead of custom pickers
4. **Keyboard handling**: Ensure virtual keyboard doesn't hide inputs

### Click Optimizations (Desktop)

1. **Hover states**: Add visual feedback on hover
2. **Tooltips**: Show on hover, not tap
3. **Keyboard shortcuts**: Power user features

**Combined approach**:

```tsx
<Button
  className="hover:bg-muted active:bg-muted/70 transition-colors"
  // Hover works on desktop, active on mobile
>
  Click me
</Button>
```

---

## Testing Responsiveness

### DevTools

1. **Chrome DevTools**: F12 → Toggle device toolbar
2. **Firefox**: Responsive Design Mode
3. **Safari**: Develop → Enter Responsive Design Mode

### Test Devices

**Mobile**:
- iPhone SE (375px)
- iPhone 12 Pro (390px)
- iPhone 14 Pro Max (430px)
- Samsung Galaxy S21 (360px)

**Tablet**:
- iPad Mini (768px)
- iPad Pro (1024px)
- Surface Pro (912px)

**Desktop**:
- 1366×768 (common laptop)
- 1920×1080 (full HD)
- 2560×1440 (2K)

### Checklist

- [ ] No horizontal scroll on mobile
- [ ] Text is readable without zoom
- [ ] Touch targets are ≥44×44px
- [ ] Tables transform to cards
- [ ] Modals fit on screen
- [ ] Forms are usable
- [ ] Navigation is accessible
- [ ] Images scale properly

---

## Performance Considerations

### Mobile Performance

1. **Lazy load images**: Use `loading="lazy"`
2. **Code splitting**: Next.js does this automatically
3. **Optimize fonts**: Use `next/font/google`
4. **Minimize JavaScript**: Reduce main thread work

### Responsive Images

```tsx
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
  // Next.js serves appropriate size
/>
```

---

## Common Responsive Patterns

### 1. Hidden/Visible Elements

```tsx
// Mobile only
<div className="md:hidden">
  Mobile content
</div>

// Tablet & Desktop only
<div className="hidden md:block">
  Desktop content
</div>

// Tablet only
<div className="hidden md:block lg:hidden">
  Tablet content
</div>
```

### 2. Responsive Spacing

```tsx
// Increases with screen size
<div className="px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-12">
  {/* Content */}
</div>
```

### 3. Responsive Grid

```tsx
// Columns increase with screen size
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {/* Cards */}
</div>
```

---

## Accessibility + Responsive

### Don't Hide Content on Mobile

**Bad**:
```tsx
<div className="hidden md:block">
  <p>Important information</p>
</div>
```

**Good**: Use responsive typography or layout:
```tsx
<div className="text-sm md:text-base">
  <p>Important information</p>
</div>
```

### Maintain Reading Order

Ensure DOM order matches visual order on all screen sizes.

### Test with Screen Reader on Mobile

- iOS: VoiceOver (Settings → Accessibility → VoiceOver)
- Android: TalkBack (Settings → Accessibility → TalkBack)

---

## Implementation Order

1. ✅ **Audit existing pages** (DONE)
2. ⏳ **Add bottom navigation** for mobile
3. ⏳ **Transform tables to cards** on mobile
4. ⏳ **Make filters collapsible** on mobile
5. ⏳ **Optimize forms** for mobile
6. ⏳ **Test on real devices**
7. ⏳ **Performance audit**

---

## Resources

- **Responsive Design Patterns**: https://patterns.fluid.design/
- **Mobile UX Best Practices**: https://www.nngroup.com/articles/mobile-usability/
- **Touch Target Size**: https://www.smashingmagazine.com/2016/09/ux-design-logged-future/

---

**Document Author**: UI/UX Designer
**Last Updated**: 2026-04-01
**Version**: 1.0
