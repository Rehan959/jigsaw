# JigSaw Web — Design System

Dark-mode-first flat design with glassmorphism accents. Purple primary (`#5519f7`), sky secondary (`#60a5fa`), violet accent (`#9455f4`) on near-black backgrounds (`#101010`). Clean lines, typography-focused hierarchy, minimal shadows.

---

## Design Tokens

### Brand Colors

| Token | Hex | Tailwind | Usage |
|---|---|---|---|
| Primary | `#5519f7` | `brand-purple` / `primary` | Primary actions, glows, CTAs |
| Primary Light | `#8a5cf4` | `brand-purple-light` / `primary-light` | Highlights, active states, links |
| Primary Dark | `#7a45c3` | `brand-purple-dark` | Hover states for primary |
| Primary Hover | `#4a15d4` | `primary-hover` | Button hover state |
| Secondary | `#60a5fa` | `secondary` | Secondary accent, complementary |
| Accent | `#9455f4` | `accent` | Tertiary accent, gradients |

### Surface Colors

| Token | Hex | Tailwind | Usage |
|---|---|---|---|
| Primary | `#101010` | `surface-primary` | Page background |
| Secondary | `#141414` | `surface-secondary` | Subtle surface variation |
| Tertiary | `#1a1a1a` | `surface-tertiary` | Input backgrounds |
| Elevated | `#1e1e1e` | `surface-elevated` | Elevated surfaces, cards |
| Hover | `#15161a` | `surface-hover` | Hover state backgrounds |
| Card | `#111111` | `surface-card` | Card surfaces |

### Text Colors

| Token | Hex | Tailwind | Usage |
|---|---|---|---|
| Primary | `#ffffff` | `text-primary` | Headings, primary text |
| Secondary | `#e1e1e1` | `text-secondary` | Body text, descriptions |
| Tertiary | `#d1d1d1` | `text-tertiary` | Secondary body text |
| Muted | `#a1a1a1` | `text-muted` | Labels, hints, metadata |

### Border Colors

| Token | Hex | Tailwind | Usage |
|---|---|---|---|
| Default | `#252525` | `border` | Default borders |
| Light | `#141414` | `border-light` | Subtle separators |
| Dark | `#292929` | `border-dark` | Emphasized borders |
| Focus | `#9455f4` | `border-focus` | Focus ring color |

### Status Colors

| Token | BG | Text | Border | Tailwind (bg/text/border) |
|---|---|---|---|---|
| Success | `#002d21` | `#00bd7c` | `#00bd7c` | `success-bg` / `success-text` / `success-border` |
| Error | `#2d0000` | `#ff4444` | `#ff4444` | `error-bg` / `error-text` / `error-border` |
| Warning | `#2d2400` | `#ffcc00` | `#ffcc00` | `warning-bg` / `warning-text` / `warning-border` |
| Info | `#00182d` | `#4499ff` | `#4499ff` | `info-bg` / `info-text` / `info-border` |

### Link Colors

| Token | Hex | Tailwind | Usage |
|---|---|---|---|
| Default | `#60a5fa` | `link` | Inline links |
| Hover | `#93c5fd` | `link-hover` | Link hover state |

---

## Typography

- **Body font:** Geist Sans (`--font-geist-sans`, via `geist/font/sans`) — system-ui fallback
- **Monospace font:** DM Mono (`--font-dm-mono`, local font) — code blocks, technical content
- **Heading font:** Helvetica Neue / Helvetica / Arial — used via `font-heading`

### Font Scale

| Element | Class | Size | Weight |
|---|---|---|---|
| Hero title | `text-5xl md:text-7xl lg:text-8xl` | 3rem → 6rem | `font-bold` |
| Section title | `text-3xl md:text-5xl` | 1.875rem → 3rem | `font-bold` |
| Card title | `text-xl` | 1.25rem | `font-semibold` |
| Body text | `text-lg` | 1.125rem | `font-normal` |
| Small text | `text-sm` | 0.875rem | `font-normal` |
| Caption | `text-xs` | 0.75rem | `font-medium` |

---

## Component Classes (globals.css)

### Glass Card

```html
<div class="glass-card rounded-2xl p-6">Content</div>
```

- Background: `rgba(17, 17, 17, 0.6)` with `backdrop-filter: blur(16px)`
- Border: `1px solid #252525`
- Hover: background brightens to `rgba(30, 30, 30, 0.8)`, border to `#333333`
- Static variant: `.glass-card-static` (no hover transition)

### Gradient Text

```html
<h1 class="gradient-text">Heading</h1>
```

- Linear gradient: `#9455f4` → `#341e7b` (135deg)
- Accent variant: `.gradient-text-accent` (`#9455f4` → `#60a5fa`)

### Glow

```html
<div class="glow">Full glow</div>
<div class="glow-sm">Subtle glow</div>
```

- Glow: `0 0 40px rgba(145, 89, 226, 0.5)`
- Glow-sm: `0 0 20px rgba(145, 89, 226, 0.3)`

### Buttons

```html
<button class="btn-primary">Primary Action</button>
<button class="btn-secondary">Secondary Action</button>
<button class="btn-ghost">Ghost Button</button>
<button class="btn-danger">Delete</button>
<button class="btn-success">Crawl Now</button>
```

| Class | Background | Text | Hover |
|---|---|---|---|
| `btn-primary` | Gradient `#5728f4` → `#5100ff` | white | Opacity 0.9, translateY(-1px) |
| `btn-secondary` | `#1a1a1a` | `#d1d1d1` | `#15161a`, border `#333333` |
| `btn-ghost` | transparent | `text-muted` | `text-primary`, `surface-tertiary` bg |
| `btn-danger` | `error-bg` | `error-text` | `error-bg/80` |
| `btn-success` | `success-bg` | `success-text` | `success-bg/80` |

All buttons: `rounded-2xl font-semibold transition-all duration-300`

### Input

```html
<input class="input-base" placeholder="Type here..." />
```

- Background: `surface-tertiary`
- Border: `border` → `brand-purple-light` on focus
- Focus ring: `ring-brand-purple-light/30`

### Badges

```html
<span class="badge-success">Completed</span>
<span class="badge-warning">Queued</span>
<span class="badge-error">Failed</span>
<span class="badge-primary">Running</span>
```

- Base: `px-2.5 py-0.5 rounded-full text-xs font-medium`
- Each badge: `{status}-bg` bg, `{status}-text` text, `{status}-border` border

---

## Animations

| Animation | Class | Duration | Usage |
|---|---|---|---|
| Float | `animate-float` | 6s infinite | Background blobs |
| Pulse slow | `animate-pulse-slow` | 4s infinite | Subtle pulsing |
| Fade in | `animate-fade-in` | 0.5s | Page transitions |
| Slide up | `animate-slide-up` | 0.5s | Content entry |
| Slide down | `animate-slide-down` | 0.3s | Dropdowns, menus |
| Scale in | `animate-scale-in` | 0.3s | Modals, popups |
| Shimmer | `animate-shimmer` | 2s infinite | Loading states |
| Spin | `animate-spin` | 1s | Loading spinners |

### Stagger Delays

```html
<div class="animate-slide-up stagger-1">First</div>
<div class="animate-slide-up stagger-2">Second</div>
<div class="animate-slide-up stagger-3">Third</div>
```

Stagger classes: `stagger-1` (0.1s) through `stagger-5` (0.5s)

---

## Layout Patterns

### Page Container

```html
<div class="min-h-screen">
  <section class="py-12 border-b border-border">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header content -->
    </div>
  </section>
</div>
```

### Section Spacing

- Page sections: `py-24`
- Content sections: `py-8` or `py-12`
- Between elements: `gap-4` to `gap-8`
- Card padding: `p-6` to `p-8`

### Grid Layouts

```html
<!-- Feature cards -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

<!-- Stats -->
<div class="grid grid-cols-2 md:grid-cols-4 gap-6">

<!-- Tech stack -->
<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
```

---

## Page Background Effects

### Animated Background (Hero)

```html
<div class="absolute inset-0 overflow-hidden">
  <div class="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
  <div class="absolute bottom-20 right-10 w-96 h-96 bg-secondary/15 rounded-full blur-3xl animate-float" style="animation-delay: -3s" />
  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl animate-pulse-slow" />
</div>
```

### Grid Pattern Overlay

```html
<div class="absolute inset-0 bg-[linear-gradient(rgba(85,25,247,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(85,25,247,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
```

### Section Gradient Background

```html
<section class="py-24 bg-surface-card/30">
```

---

## Custom Scrollbar

```css
/* Purple-tinted scrollbar */
scrollbar-color: rgba(85, 25, 247, 0.3) transparent;
/* Width: 6px, thumb border-radius: 3px */
```

---

## Selection Color

```css
::selection {
  background-color: rgba(85, 25, 247, 0.3);
  color: rgb(255, 255, 255);
}
```

---

## Icon System

- **No icon library** — all icons are inline SVGs
- Consistent sizing: `w-4 h-4` (small), `w-5 h-5` (medium), `w-6 h-6` (large)
- Stroke-based: `stroke="currentColor"` with `strokeWidth={1.5}` or `{2}`
- Icon containers: `w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center`

---

## Loading States

### Dual-Ring Spinner

```html
<div class="relative">
  <div class="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
  <div class="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-secondary rounded-full animate-spin" style="animation-direction: reverse; animation-duration: 1.5s" />
</div>
<p class="text-text-secondary mt-4">Loading...</p>
```

### Button Loading

```html
<button class="btn-primary" disabled>
  <svg class="animate-spin h-5 w-5" viewBox="0 0 24 24">...</svg>
  Processing...
</button>
```

---

## Empty States

```html
<div class="text-center py-16 glass-card rounded-2xl">
  <div class="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
    <!-- Icon -->
  </div>
  <h3 class="text-xl font-semibold mb-2">No items yet</h3>
  <p class="text-text-secondary mb-6 max-w-md mx-auto">
    Description of what to do next.
  </p>
  <button class="btn-primary">Call to Action</button>
</div>
```

---

## Responsive Breakpoints

| Breakpoint | Tailwind | Width | Layout |
|---|---|---|---|
| Mobile | default | < 640px | Single column, stacked |
| Small | `sm:` | 640px+ | Minor adjustments |
| Medium | `md:` | 768px+ | 2-column grids activate |
| Large | `lg:` | 1024px+ | 3+ column grids |
| XL | `xl:` | 1280px+ | Max-width containers |

---

## Anti-Patterns

| Pattern | Why to Avoid |
|---|---|
| Hardcoded hex colors | Breaks theming, inconsistent across components |
| Emoji as icons | Font-dependent, inconsistent across platforms |
| Arbitrary spacing | Violates 8dp rhythm, looks unpolished |
| Slow animations (>500ms) | Feels sluggish, blocks user interaction |
| No loading states | Users don't know if action is processing |
| Missing empty states | Confuses users when no data exists |
