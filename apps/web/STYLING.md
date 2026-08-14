# JigSaw Web — Styling Guide

How to add new pages and components that match the JigSaw design system.

---

## Quick Start: New Page

```tsx
// src/app/my-page/page.tsx
"use client";

export default function MyPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-12 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary-light text-sm font-medium mb-3">
            {/* Icon + Label */}
          </div>
          <h1 className="text-3xl font-bold">
            <span className="gradient-text">Page Title</span>
          </h1>
          <p className="text-text-muted mt-2">
            Page description
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Your content here */}
        </div>
      </section>
    </div>
  );
}
```

---

## Color Rules

### Never Use Raw Hex Colors

```tsx
// Wrong
<div style={{ color: "#5519f7" }}>

// Right
<div className="text-primary">
```

### Available Color Classes

| Color | Text | Background | Border |
|---|---|---|---|
| Primary | `text-primary` | `bg-primary` | `border-primary` |
| Primary Light | `text-primary-light` | `bg-primary-light` | — |
| Secondary | `text-secondary` | `bg-secondary` | — |
| Accent | `text-accent` | `bg-accent` | — |
| Success | `text-success-text` | `bg-success-bg` | `border-success-border` |
| Warning | `text-warning-text` | `bg-warning-bg` | `border-warning-border` |
| Error | `text-error-text` | `bg-error-bg` | `border-error-border` |
| Text Primary | `text-text-primary` | — | — |
| Text Secondary | `text-text-secondary` | — | — |
| Text Muted | `text-text-muted` | — | — |

### Opacity Modifiers

Use Tailwind opacity syntax for semi-transparent backgrounds:

```tsx
<div className="bg-primary/10">   {/* 10% opacity */}
<div className="bg-primary/20">   {/* 20% opacity */}
<div className="bg-success-bg/10">   {/* Status badge background */}
```

---

## Card Patterns

### Standard Card

```tsx
<div className="glass-card rounded-2xl p-6">
  Content
</div>
```

### Interactive Card (with hover)

```tsx
<div className="glass-card rounded-2xl p-6 hover:border-border-focus transition-all duration-300 group">
  <div className="group-hover:scale-110 transition-transform">
    {/* Icon */}
  </div>
  Content
</div>
```

### Static Card (no hover, for modals)

```tsx
<div className="glass-card-static rounded-2xl p-6">
  Content
</div>
```

---

## Button Patterns

### Using CSS Classes

```tsx
<button className="btn-primary">Primary Action</button>
<button className="btn-secondary">Secondary</button>
<button className="btn-ghost">Ghost</button>
<button className="btn-danger">Delete</button>
<button className="btn-success">Crawl Now</button>
```

### Using Button Component

```tsx
import { Button } from "@/components/ui";

<Button variant="primary" size="lg">Primary</Button>
<Button variant="danger" loading={isDeleting}>Delete</Button>
```

### Disabled + Loading

```tsx
<button className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
  {loading ? (
    <span className="flex items-center gap-2">
      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">...</svg>
      Processing...
    </span>
  ) : (
    "Submit"
  )}
</button>
```

---

## Form Patterns

### Using Input Component

```tsx
import { Input } from "@/components/ui";

<Input label="URL" placeholder="https://example.com" required />
<Input label="Name" hint="Optional" />
<Input label="Email" error="Invalid email" />
```

### Custom Input (inline)

```tsx
<input
  type="text"
  placeholder="Search..."
  className="input-base"
/>
```

### Form Layout

```tsx
<form className="space-y-4">
  <Input label="URL" placeholder="https://example.com" required />
  <Input label="Name" hint="Optional display name" />
  <div className="flex gap-3 pt-4">
    <button type="button" className="btn-secondary flex-1">Cancel</button>
    <button type="submit" className="btn-primary flex-1">Submit</button>
  </div>
</form>
```

---

## Modal Pattern

```tsx
import { Modal, Input, Button } from "@/components/ui";

<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Add Item"
  description="Fill in the details"
  size="md"
>
  <form className="space-y-4">
    <Input label="Name" required />
    <div className="flex gap-3 pt-4">
      <Button variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>
        Cancel
      </Button>
      <Button variant="primary" className="flex-1" loading={submitting}>
        Add
      </Button>
    </div>
  </form>
</Modal>
```

---

## Badge Pattern

```tsx
import { Badge } from "@/components/ui";

<Badge variant="success">Completed</Badge>
<Badge variant="warning">Queued</Badge>
<Badge variant="error">Failed</Badge>
<Badge variant="primary">Running</Badge>
```

### Inline Badge (without component)

```tsx
<span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
  status === "completed"
    ? "bg-success-bg text-success-text border-success-border"
    : status === "failed"
    ? "bg-error-bg text-error-text border-error-border"
    : "bg-warning-bg text-warning-text border-warning-border"
}`}>
  {status}
</span>
```

---

## Loading States

### Page Loading (Dual-Ring Spinner)

```tsx
<div className="flex flex-col items-center justify-center py-16">
  <div className="relative">
    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-b-secondary rounded-full animate-spin"
         style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
  </div>
  <p className="text-text-muted mt-4">Loading...</p>
</div>
```

### Button Loading

```tsx
<button className="btn-primary" disabled={loading}>
  {loading ? (
    <span className="flex items-center gap-2">
      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      Processing...
    </span>
  ) : (
    "Submit"
  )}
</button>
```

---

## Empty State Pattern

```tsx
<div className="text-center py-16 glass-card rounded-2xl">
  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
    {/* Icon SVG */}
  </div>
  <h3 className="text-xl font-semibold mb-2">No items yet</h3>
  <p className="text-text-muted mb-6 max-w-md mx-auto">
    Description of what to do next.
  </p>
  <button className="btn-primary">Call to Action</button>
</div>
```

---

## Animation Patterns

### Entry Animations

```tsx
<div className="animate-fade-in">Fades in</div>
<div className="animate-slide-up">Slides up</div>
<div className="animate-slide-down">Slides down</div>
<div className="animate-scale-in">Scales in</div>
```

### Staggered Entry

```tsx
<div className="animate-slide-up stagger-1">First item</div>
<div className="animate-slide-up stagger-2">Second item</div>
<div className="animate-slide-up stagger-3">Third item</div>
```

### Hover Effects

```tsx
<div className="group hover:border-border-focus transition-all duration-300">
  <div className="group-hover:scale-110 transition-transform">
    Icon
  </div>
</div>
```

---

## List Patterns

### Simple List

```tsx
<div className="space-y-4">
  {items.map((item) => (
    <div key={item.id} className="glass-card rounded-xl p-6 hover:border-border-focus transition-all duration-300">
      {/* Item content */}
    </div>
  ))}
</div>
```

### Filter Tabs

```tsx
<div className="flex items-center gap-2 overflow-x-auto pb-2">
  {filters.map((f) => (
    <button
      key={f.key}
      onClick={() => setFilter(f.key)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${
        filter === f.key
          ? "bg-primary/20 text-primary-light"
          : "text-text-muted hover:text-text-primary hover:bg-surface-tertiary/50"
      }`}
    >
      {f.label}
      <span className={`text-xs px-1.5 py-0.5 rounded ${
        filter === f.key ? "bg-primary/30 text-primary-light" : "bg-surface-elevated text-text-muted"
      }`}>
        {f.count}
      </span>
    </button>
  ))}
</div>
```

---

## Stats Pattern

```tsx
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  <div className="glass-card rounded-xl p-4">
    <div className="text-2xl font-bold">{stats.total}</div>
    <div className="text-sm text-text-muted">Total Items</div>
  </div>
  <div className="glass-card rounded-xl p-4">
    <div className="text-2xl font-bold text-success-text">{stats.completed}</div>
    <div className="text-sm text-text-muted">Completed</div>
  </div>
</div>
```

---

## Section Header Pattern

```tsx
<div className="text-center mb-16">
  <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary-light text-sm font-medium mb-4">
    Section Label
  </div>
  <h2 className="text-3xl md:text-5xl font-bold mb-4 text-balance">
    Section <span className="gradient-text">Title</span>
  </h2>
  <p className="text-text-muted text-lg max-w-2xl mx-auto">
    Section description
  </p>
</div>
```

---

## Background Effects

### Animated Blobs (Hero)

```tsx
<div className="absolute inset-0 overflow-hidden">
  <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
  <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/15 rounded-full blur-3xl animate-float" style={{ animationDelay: "-3s" }} />
  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl animate-pulse-slow" />
</div>
```

### Grid Pattern Overlay

```tsx
<div className="absolute inset-0 bg-[linear-gradient(rgba(85,25,247,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(85,25,247,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
```

### Gradient Section Background

```tsx
<section className="py-24 bg-surface-card/30">
```

---

## Responsive Design

### Mobile-First Approach

```tsx
{/* Stack on mobile, grid on desktop */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

{/* Hide on mobile */}
<div className="hidden md:block">

{/* Stack on mobile, row on desktop */}
<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
```

### Common Breakpoints

| Class | Width | Use |
|---|---|---|
| `sm:` | 640px | Minor adjustments |
| `md:` | 768px | 2-column layouts |
| `lg:` | 1024px | 3+ column layouts |
| `xl:` | 1280px | Max-width containers |

---

## Checklist: New Component

1. Use `forwardRef` for ref forwarding
2. Extend base HTML element props
3. Use CSS classes from `globals.css` (`glass-card`, `btn-*`, `badge-*`, `input-base`)
4. Use Tailwind color tokens (`brand-purple`, `surface-*`, `text-*`, `success-*`, `error-*`, `warning-*`)
5. Add transition classes for hover/focus states
6. Support dark mode (default — no light mode)
7. Export from `src/components/ui/index.ts`

## Checklist: New Page

1. Export default function component
2. Add `"use client"` if using state/hooks
3. Use `min-h-screen` wrapper
4. Header section with `py-12 border-b border-border`
5. Content section with `py-8`
6. Max-width container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
7. Use gradient text for headings: `gradient-text`
8. Use glass cards for content: `glass-card rounded-2xl p-6`
9. Add animations: `animate-slide-up stagger-N`
10. Support responsive layouts with `md:` and `lg:` prefixes
